import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";

export async function GET() {
  try {
    await connectDB();
    
    const problems = await Problem.find().sort({ createdAt: -1 });
    
    // แปลงข้อมูลให้ตรงกับ interface
    const formattedProblems = problems.map(p => ({
      _id: p._id,
      student_id: p.student_id,
      student_name: p.student_name,
      problem: p.problem,
      goal: p.goal,
      progress: p.progress,
      isp_status: p.isp_status,
      evaluations: p.evaluations || [],
      activities: p.activities || []
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