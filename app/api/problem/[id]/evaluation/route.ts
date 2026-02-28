import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    await connectDB();
    
    // ค้นหาข้อมูลนักเรียน (id คือ MongoDB _id)
    const problem = await Problem.findById(id);
    
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
      improvement_detail: body.improvement_detail,
      result: body.result,
      notes: body.notes,
      evaluation_date: new Date(body.evaluation_date)
    };

    // อัปเดตข้อมูลนักเรียน
    await Problem.findOneAndUpdate(
      { student_id: id },
      { 
        $push: { 
          evaluations: newEvaluation 
        },
        // อัปเดตความคืบหน้าตามผลการประเมิน
        progress: body.result === 'ยุติการช่วยเหลือ' ? 100 : 
               body.result === 'ดำเนินการต่อ' ? 75 : 50,
        isp_status: body.result === 'ยุติการช่วยเหลือ' ? 'สำเร็จ' : 
                    body.result === 'ดำเนินการต่อ' ? 'กำลังดำเนินการ' : 'ปรับแผน',
        last_updated: new Date()
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "บันทึกผลการประเมินเรียบร้อย"
    });

  } catch (error: any) {
    console.error("❌ EVALUATION ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
