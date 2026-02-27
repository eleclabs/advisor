// D:\advisor-main\app\api\problem\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import Student from "@/models/Student";
import Activity from "@/models/Activity";
import mongoose from "mongoose";

// GET: ดึงข้อมูลนักเรียน
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    console.log("🔍 Searching with ID:", id);
    
    let problem = null;
    
    // ตรวจสอบว่า id เป็น MongoDB ObjectId หรือไม่
    if (mongoose.Types.ObjectId.isValid(id)) {
      // ค้นหาด้วย _id
      problem = await Problem.findById(id);
      console.log("📋 Found by _id:", problem ? "Yes" : "No");
    }
    
    // ถ้าไม่เจอด้วย _id ให้ค้นหาด้วย student_id
    if (!problem) {
      problem = await Problem.findOne({ student_id: id });
      console.log("📋 Found by student_id:", problem ? "Yes" : "No");
    }
    
    if (problem) {
      // ดึงกิจกรรมที่เกี่ยวข้องกับนักเรียนคนนี้
      const activities = await Activity.find({
        "participants.student_id": problem.student_id
      });
      
      return NextResponse.json({ 
        success: true, 
        data: {
          ...problem.toObject(),
          activities: activities
        }
      });
    }
    
    // ถ้าไม่เจอใน Problem ให้ค้นหานักเรียนจาก Student
    const student = await Student.findOne({ 
      $or: [
        { id: id },
        { _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null }
      ]
    });
    
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
    console.error("❌ Error:", error);
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
    
    // ค้นหานักเรียนด้วย student_id
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
    
    let problem = null;
    
    // ค้นหาด้วย _id หรือ student_id
    if (mongoose.Types.ObjectId.isValid(id)) {
      problem = await Problem.findById(id);
    }
    
    if (!problem) {
      problem = await Problem.findOne({ student_id: id });
    }
    
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
      { _id: problem._id },
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
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Problem.findByIdAndDelete(id);
    } else {
      await Problem.findOneAndDelete({ student_id: id });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}