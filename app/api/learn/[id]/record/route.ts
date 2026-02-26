// D:\advisor-main\app\api\learn\[id]\record\route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Learn from "@/models/Learn";

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("🔥 POST /api/learn/[id]/record - Start");
  
  try {
    // ต้อง await params ก่อน
    const { id } = await params;
    console.log("✅ ID from params:", id);
    
    // เชื่อมต่อฐานข้อมูล
    console.log("📡 Connecting to DB...");
    await connectDB();
    console.log("✅ DB Connected");
    
    // รับ formData
    console.log("📦 Getting formData...");
    const formData = await request.formData();
    
    // Log ค่าที่ได้รับทั้งหมด
    console.log("📦 FormData entries:");
    for (const pair of formData.entries()) {
      console.log(`   ${pair[0]}: ${pair[1]}`);
    }
    
    // เตรียมข้อมูลสำหรับอัปเดต
    const updateData: any = {};
    
    const fields = [
      'teacherNote', 'problems', 'specialTrack', 'sessionNote',
      'individualFollowup', 'activity_date', 'students_attended',
      'total_students', 'evaluator'
    ];
    
    fields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) {
        updateData[field] = value.toString();
      }
    });
    
    // เพิ่มฟิลด์พิเศษ
    updateData.has_record = true;
    updateData.recorded_at = new Date().toLocaleDateString('th-TH');
    updateData.updated_at = new Date().toLocaleDateString('th-TH');
    
    console.log("📤 Update data:", updateData);
    
    // อัปเดตฐานข้อมูล
    console.log("📡 Updating database...");
    const learn = await Learn.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!learn) {
      console.log("❌ Learn not found for ID:", id);
      return NextResponse.json({ 
        success: false, 
        message: "ไม่พบข้อมูลแผนกิจกรรม" 
      }, { status: 404 });
    }
    
    console.log("✅ Update successful");
    
    return NextResponse.json({ 
      success: true, 
      message: "บันทึกผลกิจกรรมเรียบร้อยแล้ว",
      data: learn 
    });
    
  } catch (error: any) {
    console.error("❌ Error in POST /api/learn/[id]/record:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล"
    }, { status: 500 });
  }
}