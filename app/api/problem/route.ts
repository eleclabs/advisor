// D:\advisor-main\app\api\problem\route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import Activity from "@/models/Activity";

export async function GET() {
  try {
    await connectDB();
    
    const problems = await Problem.find().sort({ createdAt: -1 });
    
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