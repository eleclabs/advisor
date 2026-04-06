// app/api/problem/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import Activity from "@/models/Activity";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    
    // ตรวจสอบ session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        error: "กรุณาเข้าสู่ระบบ" 
      }, { status: 401 });
    }
    
    const userRole = session.user.role;
    const userId = session.user.id;
    
    let problems = [];
    
    // ADMIN เห็นทั้งหมด
    if (userRole === 'ADMIN') {
      if (studentId) {
        problems = await Problem.find({ student_id: studentId }).sort({ createdAt: -1 });
      } else {
        problems = await Problem.find().sort({ createdAt: -1 });
      }
    } 
    // TEACHER เห็นเฉพาะ assigned students
    else if (userRole === 'TEACHER') {
      // ดึง user เพื่อดู assigned students
      const user = await User.findById(userId).populate({
        path: 'assigned_students.student_id',
        model: 'Student'
      });
      
      if (user && user.assigned_students && user.assigned_students.length > 0) {
        // ดึงรหัสนักเรียนที่ครูดูแล
        const studentIds = user.assigned_students
          .filter((item: any) => item.student_id)
          .map((item: any) => item.student_id.id); // ใช้ student_id.id แทน student_id
        
        // ค้นหาเฉพาะนักเรียนที่อยู่ใน assigned students
        problems = await Problem.find({ 
          student_id: { $in: studentIds } 
        }).sort({ createdAt: -1 });
      } else {
        problems = []; // ถ้าไม่มี assigned students ให้คืนค่าว่าง
      }
    } 
    // ✅ EXECUTIVE, COMMITTEE เห็นทั้งหมด (หรือตามที่ต้องการ)
    else {
      problems = await Problem.find().sort({ createdAt: -1 });
    }
    
    // ดึงกิจกรรมทั้งหมดเพื่อนำไปประกอบ
    const allActivities = await Activity.find();
    
    // แปลงข้อมูลให้ตรงกับ interface
    const formattedProblems = await Promise.all(problems.map(async (p) => {
      // หากิจกรรมที่นักเรียนคนนี้เข้าร่วม
      const studentActivities = allActivities.filter(a => 
        a.participants?.some((part: any) => part.student_id === p.student_id)
      );
      
      return {
        _id: p._id,
        student_id: p.student_id,
        student_name: p.student_name,
        problem: p.problem,
        goal: p.goal,
        progress: p.progress,
        isp_status: p.isp_status,
        evaluations: p.evaluations || [],
        activities: studentActivities // ใช้กิจกรรมจาก Activity model
      };
    }));
    
    return NextResponse.json({ 
      success: true, 
      data: formattedProblems 
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}