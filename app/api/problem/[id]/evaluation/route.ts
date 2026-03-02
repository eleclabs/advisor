// D:\advisor-main\app\api\problem\[id]\evaluation\route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import mongoose from "mongoose";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    await connectDB();
    
    console.log("📥 Evaluation for ID:", id);
    console.log("📥 Body:", body);

    let problem = null;
    
    // ลองค้นหาด้วย _id (MongoDB ObjectId)
    if (mongoose.Types.ObjectId.isValid(id)) {
      problem = await Problem.findById(id);
      console.log("🔍 Found by _id:", problem ? "Yes" : "No");
    }
    
    // ถ้าไม่เจอ ลองค้นหาด้วย student_id
    if (!problem) {
      problem = await Problem.findOne({ student_id: id });
      console.log("🔍 Found by student_id:", problem ? "Yes" : "No");
    }
    
    if (!problem) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลนักเรียน" },
        { status: 404 }
      );
    }

    // เพิ่มการประเมินลงใน evaluations array
    const newEvaluation = {
      evaluation_number: body.evaluation_number,
      improvement_level: body.improvement_level,
      improvement_detail: body.improvement_detail || "",
      result: body.result,
      notes: body.notes || "",
      evaluation_date: new Date(body.evaluation_date)
    };

    problem.evaluations.push(newEvaluation);
    
    // อัปเดตความคืบหน้าตามผลการประเมิน
    if (body.result === 'ยุติการช่วยเหลือ') {
      problem.progress = 100;
      problem.isp_status = 'สำเร็จ';
    } else if (body.result === 'ดำเนินการต่อ') {
      problem.progress = Math.min(problem.progress + 25, 90);
      problem.isp_status = 'กำลังดำเนินการ';
    } else if (body.result === 'ส่งต่อผู้เชี่ยวชาญ') {
      problem.progress = Math.min(problem.progress + 10, 50);
      problem.isp_status = 'ปรับแผน';
    }
    
    problem.last_updated = new Date();
    await problem.save();

    return NextResponse.json({
      success: true,
      message: "บันทึกผลการประเมินเรียบร้อย",
      data: problem
    });

  } catch (error: any) {
    console.error("❌ EVALUATION ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}