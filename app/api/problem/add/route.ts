// D:\advisor-main\app\api\problem\add\route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import Student from "@/models/Student";
import Activity from "@/models/Activity";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Types } from "mongoose";

// GET method สำหรับค้นหาผู้เรียนที่ครูคนนี้ดูแล
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

    let students: any[] = [];

    // ✅ ADMIN: ค้นหาจากผู้เรียนทั้งหมด
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
      const user = await User.findById(userId).populate({
        path: 'assigned_students.student_id',
        model: Student
      });
      
      if (user && user.assigned_students) {
        const assignedStudents = user.assigned_students
          .filter((item: any) => item.student_id)
          .map((item: any) => item.student_id);
        
        if (query) {
          const queryLower = query.toLowerCase();
          students = assignedStudents.filter((student: any) => 
            student.id?.toLowerCase().includes(queryLower) ||
            student.first_name?.toLowerCase().includes(queryLower) ||
            student.last_name?.toLowerCase().includes(queryLower) ||
            student.nickname?.toLowerCase().includes(queryLower)
          );
        } else {
          students = assignedStudents;
        }
        
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

    // กรองผู้เรียนที่ยังไม่มีแผน
    const studentsWithPlan = await Problem.find().distinct('student_id');
    const availableStudents = students.filter((student: any) => !studentsWithPlan.includes(student.id));

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
      methods,
      activity_ids 
    } = body;
    
    console.log("📥 [add/route] Received data:", { 
      student_id, 
      problem, 
      goal, 
      methods,
      activityCount: activity_ids?.length 
    });
    
    if (!student_id) {
      return NextResponse.json({ 
        success: false, 
        error: "กรุณาระบุรหัส" 
      }, { status: 400 });
    }
    
    const student = await Student.findOne({ id: student_id });
    if (!student) {
      return NextResponse.json({ 
        success: false, 
        error: "ไม่พบรหัสนี้ในระบบ" 
      }, { status: 404 });
    }
    
    const existing = await Problem.findOne({ student_id });
    if (existing) {
      return NextResponse.json({ 
        success: false, 
        error: "ผู้เรียนนี้มีแผนการช่วยเหลือแล้ว" 
      }, { status: 400 });
    }
    
    const studentName = `${student.prefix || ''} ${student.first_name || ''} ${student.last_name || ''}`.trim();
    
    // ✅ สร้าง methods object จาก methods array ที่ส่งมา
    const defaultMethodsList = [
      "การให้คำปรึกษาเบื้องต้น",
      "กิจกรรมปรับเปลี่ยนพฤติกรรม",
      "การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง",
      "การส่งต่อ"
    ];
    
    const methodsData = {
      counseling: methods?.includes("การให้คำปรึกษาเบื้องต้น") || counseling || false,
      behavioral_contract: methods?.includes("กิจกรรมปรับเปลี่ยนพฤติกรรม") || behavioral_contract || false,
      home_visit: methods?.includes("การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง") || home_visit || false,
      referral: methods?.includes("การส่งต่อ") || referral || false,
      custom_methods: methods?.filter((method: string) => !defaultMethodsList.includes(method)) || []
    };
    
    const problemData = {
      student_id,
      student_name: studentName,
      problem,
      goal,
      counseling: methodsData.counseling,
      behavioral_contract: methodsData.behavioral_contract,
      home_visit: methodsData.home_visit,
      referral: methodsData.referral,
      custom_methods: methodsData.custom_methods,
      duration,
      responsible,
      isp_status: "กำลังดำเนินการ",
      progress: 0,
      evaluations: [],
      activities: [],
      activities_status: new Map(),
      activity_join_dates: new Map(),
      activity_completed_dates: new Map()
    };
    
    const newProblem = await Problem.create(problemData);
    
    // ✅ ถ้ามีการเลือกกิจกรรม ให้เพิ่มผู้เรียนเข้าไปใน participants ของกิจกรรม AND เชื่อมโยงกับ Problem
    if (activity_ids && activity_ids.length > 0) {
      for (const activityId of activity_ids) {
        await Activity.findByIdAndUpdate(
          activityId,
          {
            $push: {
              participants: {
                student_id: student_id,
                student_name: studentName,
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
        
        await Problem.findByIdAndUpdate(
          newProblem._id,
          {
            $push: {
              activities: {
                activity_id: activityId,
                status: "เข้าร่วมแล้ว",
                joined_at: new Date(),
                completed_at: null,
                notes: ""
              }
            },
            $set: {
              [`activities_status.${activityId}`]: "เข้าร่วมแล้ว",
              [`activity_join_dates.${activityId}`]: new Date()
            }
          }
        );
        
        console.log(`✅ Linked activity ${activityId} to problem ${newProblem._id}`);
      }
    }
    
    console.log("✅ [add/route] Created problem with ID:", newProblem._id);
    console.log("✅ Custom methods saved:", methodsData.custom_methods);
    
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