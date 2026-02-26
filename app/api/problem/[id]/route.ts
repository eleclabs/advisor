import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import Student from "@/models/Student";

// GET: ดึงข้อมูลนักเรียน
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const problem = await Problem.findOne({ student_id: id });
    
    if (problem) {
      return NextResponse.json({ success: true, data: problem });
    }
    
    const student = await Student.findOne({ id });
    if (student) {
      return NextResponse.json({ 
        success: true, 
        data: {
          student_id: student.id,
          student_name: `${student.prefix || ''} ${student.first_name || ''} ${student.last_name || ''}`.trim(),
          student_data: student,
          isNew: true
        }
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "ไม่พบรหัสนักเรียนนี้ในระบบ" 
    }, { status: 404 });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// POST: สร้างแผนใหม่
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    
    const student = await Student.findOne({ id });
    if (!student) {
      return NextResponse.json({ 
        success: false, 
        error: "ไม่พบรหัสนักเรียนนี้ในระบบ" 
      }, { status: 404 });
    }
    
    // ตรวจสอบว่ามีแผนอยู่แล้ว
    const existing = await Problem.findOne({ student_id: id });
    if (existing) {
      return NextResponse.json({ 
        success: false, 
        error: "นักเรียนนี้มีแผนการช่วยเหลือแล้ว" 
      }, { status: 400 });
    }
    
    const problemData = {
      student_id: id,
      student_name: `${student.prefix || ''} ${student.first_name || ''} ${student.last_name || ''}`.trim(),
      problem: body.problem,
      goal: body.goal,
      counseling: body.counseling || false,
      behavioral_contract: body.behavioral_contract || false,
      home_visit: body.home_visit || false,
      referral: body.referral || false,
      duration: body.duration,
      responsible: body.responsible,
      isp_status: "กำลังดำเนินการ",
      progress: 0,
      activities: [],
      evaluations: []
    };
    
    const problem = await Problem.create(problemData);
    return NextResponse.json({ success: true, data: problem });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// PUT: อัปเดตแผนหรือเพิ่มผลประเมิน
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    
    const problem = await Problem.findOne({ student_id: id });
    if (!problem) {
      return NextResponse.json({ 
        success: false, 
        error: "ไม่พบข้อมูลนักเรียน" 
      }, { status: 404 });
    }
    
    // ถ้ามี evaluation หมายถึงเป็นการเพิ่มผลประเมิน
    if (body.addEvaluation) {
      const maxNumber = problem.evaluations?.length > 0 
        ? Math.max(...problem.evaluations.map((e: any) => e.evaluation_number || 0)) 
        : 0;
      
      const newEvaluation = {
        evaluation_number: maxNumber + 1,
        improvement_level: body.improvement_level,
        improvement_detail: body.improvement_detail || "",
        result: body.result,
        notes: body.notes || "",
        evaluation_date: new Date()
      };
      
      problem.evaluations.push(newEvaluation);
      await problem.save();
      
      return NextResponse.json({ success: true, data: problem });
    }
    
    // อัปเดตแผนปกติ
    const updateData = {
      problem: body.problem,
      goal: body.goal,
      counseling: body.counseling,
      behavioral_contract: body.behavioral_contract,
      home_visit: body.home_visit,
      referral: body.referral,
      duration: body.duration,
      responsible: body.responsible,
      progress: body.progress,
      isp_status: body.isp_status
    };
    
    const updated = await Problem.findOneAndUpdate(
      { student_id: id },
      updateData,
      { new: true }
    );
    
    return NextResponse.json({ success: true, data: updated });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE: ลบแผน
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    await Problem.findOneAndDelete({ student_id: id });
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}