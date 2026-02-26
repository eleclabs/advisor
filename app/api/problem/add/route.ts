import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import Student from "@/models/Student";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { student_id, problem, goal, counseling, behavioral_contract, home_visit, referral, duration, responsible } = body;
    
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
      activities: [],
      evaluations: []
    };
    
    const newProblem = await Problem.create(problemData);
    
    return NextResponse.json({ 
      success: true, 
      data: newProblem,
      message: "เพิ่มแผนการช่วยเหลือเรียบร้อย" 
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}