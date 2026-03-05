import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Problem from "@/models/Problem";
import { Referral } from "@/models/Send";

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    
    if (!studentId) {
      return NextResponse.json({
        success: false,
        message: "ต้องระบุ student_id"
      }, { status: 400 });
    }
    
    console.log(`🧹 เริ่มลบข้อมูลที่เกี่ยวข้องกับนักเรียน ID: ${studentId}`);
    
    // 1. ลบข้อมูลปัญหา (Problem)
    const deletedProblems = await Problem.deleteMany({ student_id: studentId });
    console.log(`📋 ลบข้อมูลปัญหา: ${deletedProblems.deletedCount} รายการ`);
    
    // 2. ลบข้อมูลการส่งต่อ (Referral)
    const deletedReferrals = await Referral.deleteMany({ student_id: studentId });
    console.log(`📤 ลบข้อมูลการส่งต่อ: ${deletedReferrals.deletedCount} รายการ`);
    
    // 3. ตรวจสอบว่ามีข้อมูลอื่นอีกไหม
    // สามารถเพิ่มการลบข้อมูลอื่นๆ ที่เกี่ยวข้องกับนักเรียนได้ที่นี่
    // เช่น ข้อมูลการเรียน, ข้อมูลกิจกรรม, ข้อมูลการปรึกษา ฯลฯ
    
    return NextResponse.json({
      success: true,
      message: "ลบข้อมูลที่เกี่ยวข้องทั้งหมดเรียบร้อยแล้ว",
      data: {
        deletedProblems: deletedProblems.deletedCount,
        deletedReferrals: deletedReferrals.deletedCount
      }
    });
    
  } catch (error: any) {
    console.error("❌ Error cleaning up related data:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการลบข้อมูลที่เกี่ยวข้อง"
    }, { status: 500 });
  }
}
