// D:\advisor-main\app\api\problem\add\route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import Student from "@/models/Student";
import Activity from "@/models/Activity";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET method สำหรับค้นหานักเรียนที่ครูคนนี้ดูแล
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const userRole = session.user?.role;
    const userId = session.user?.id;

    console.log("🔍 [add/route] Searching students with query:", query);
    console.log("👤 User:", { userId, role: userRole });

    let students = [];

    // ✅ ADMIN: ค้นหาจากนักเรียนทั้งหมด
    if (userRole === "ADMIN") {
      const studentQuery: any = {};
      
      if (query) {
        studentQuery.$or = [
          { id: { $regex: query, $options: "i" } },
          { first_name: { $regex: query, $options: "i" } },
          { last_name: { $regex: query, $options: "i" } },
          { nickname: { $regex: query, $options: "i" } }
        ];
      }
      
      students = await Student.find(studentQuery).limit(20);
    }
    
    // ✅ TEACHER: ค้นหาเฉพาะ assigned students
    else if (userRole === "TEACHER" && userId) {
      // ดึง user เพื่อดู assigned students
      const user = await User.findById(userId).populate({
        path: 'assigned_students.student_id',
        model: Student
      });
      
      if (user && user.assigned_students) {
        // กรองเฉพาะที่มี student_id
        const assignedStudents = user.assigned_students
          .filter((item: any) => item.student_id)
          .map((item: any) => item.student_id);
        
        // ถ้ามี query ให้กรองเฉพาะที่ตรง
        if (query) {
          const queryLower = query.toLowerCase();
          students = assignedStudents.filter((s: any) => 
            s.id?.toLowerCase().includes(queryLower) ||
            s.first_name?.toLowerCase().includes(queryLower) ||
            s.last_name?.toLowerCase().includes(queryLower) ||
            s.nickname?.toLowerCase().includes(queryLower)
          );
        } else {
          students = assignedStudents;
        }
        
        // จำกัดจำนวน
        students = students.slice(0, 20);
      }
    }
    
    // ✅ EXECUTIVE, COMMITTEE: เห็นทั้งหมด (หรือตามที่ต้องการ)
    else {
      const studentQuery: any = {};
      
      if (query) {
        studentQuery.$or = [
          { id: { $regex: query, $options: "i" } },
          { first_name: { $regex: query, $options: "i" } },
          { last_name: { $regex: query, $options: "i" } },
          { nickname: { $regex: query, $options: "i" } }
        ];
      }
      
      students = await Student.find(studentQuery).limit(20);
    }

    // กรองนักเรียนที่ยังไม่มีแผน
    const studentsWithPlan = await Problem.find().distinct('student_id');
    const availableStudents = students.filter((s: any) => !studentsWithPlan.includes((s as any).id));

    console.log(`✅ Found ${availableStudents.length} available students`);

    return NextResponse.json({ 
      success: true, 
      data: availableStudents 
    });
    
  } catch (error: any) {
    console.error("❌ [add/route] Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// POST method สำหรับเพิ่มแผน
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      student_id, 
      problem, 
      goal, 
      counseling, 
      behavioral_contract, 
      home_visit, 
      referral, 
      duration, 
      responsible,
      activity_ids // รับ activity_ids ที่เลือก
    } = body;
    
    console.log("📥 [add/route] Received data:", { 
      student_id, 
      problem, 
      goal, 
      activityCount: activity_ids?.length 
    });
    
    if (!student_id) {
      return NextResponse.json({ 
        success: false, 
        error: "กรุณาระบุรหัสนักเรียน" 
      }, { status: 400 });
    }
    
    // ตรวจสอบว่านักเรียนมีอยู่จริง
    const student = await Student.findOne({ id: student_id });
    if (!student) {
      return NextResponse.json({ 
        success: false, 
        error: "ไม่พบรหัสนักเรียนนี้ในระบบ" 
      }, { status: 404 });
    }
    
    // ตรวจสอบว่ามีแผนอยู่แล้ว
    const existing = await Problem.findOne({ student_id });
    if (existing) {
      return NextResponse.json({ 
        success: false, 
        error: "นักเรียนนี้มีแผนการช่วยเหลือแล้ว" 
      }, { status: 400 });
    }
    
    const problemData = {
      student_id,
      student_name: `${student.prefix || ''} ${student.first_name || ''} ${student.last_name || ''}`.trim(),
      problem,
      goal,
      counseling: counseling || false,
      behavioral_contract: behavioral_contract || false,
      home_visit: home_visit || false,
      referral: referral || false,
      duration,
      responsible,
      isp_status: "กำลังดำเนินการ",
      progress: 0,
      evaluations: []
    };
    
    const newProblem = await Problem.create(problemData);
    
    // ถ้ามีการเลือกกิจกรรม ให้เพิ่มนักเรียนเข้าไปใน participants ของกิจกรรม
    if (activity_ids && activity_ids.length > 0) {
      for (const activityId of activity_ids) {
        await Activity.findByIdAndUpdate(
          activityId,
          {
            $push: {
              participants: {
                student_id: student_id,
                student_name: `${student.prefix || ''} ${student.first_name || ''} ${student.last_name || ''}`.trim(),
                joined: true,
                joined_at: new Date()
              }
            },
            $inc: { 
              total_participants: 1,
              joined_count: 1 
            }
          }
        );
      }
    }
    
    console.log("✅ [add/route] Created problem with ID:", newProblem._id);
    
    return NextResponse.json({ 
      success: true, 
      data: newProblem,
      message: "เพิ่มแผนการช่วยเหลือเรียบร้อย" 
    });
    
  } catch (error: any) {
    console.error("❌ [add/route] Error in POST:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}