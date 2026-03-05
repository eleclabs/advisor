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
    
    // Map form fields to database fields
    const fieldMapping = {
      'teacherNote': 'activity_notes',
      'problems': 'activity_problems', 
      'sessionNote': 'activity_solutions',
      'special_track': 'special_track',
      'individualFollowup': 'individualFollowup',
      'activity_date': 'activity_date',
      'students_attended': 'students_attended',
      'total_students': 'total_students',
      'evaluator': 'evaluator'
    };
    
    // Also save the original field names for backward compatibility
    const originalFieldMapping = {
      'teacherNote': 'teacherNote',
      'problems': 'problems',
      'sessionNote': 'sessionNote',
      'individualFollowup': 'individualFollowup'
    };
    
    // Process each field - save both mapped and original fields
    Object.entries(fieldMapping).forEach(([formField, dbField]) => {
      const value = formData.get(formField);
      if (value !== null) {
        updateData[dbField] = value.toString();
        // Also save with original field name for backward compatibility
        if (originalFieldMapping[formField as keyof typeof originalFieldMapping]) {
          updateData[formField] = value.toString();
        }
        console.log(`   Mapping ${formField} -> ${dbField}: ${value}`);
        if (formField === 'special_track') {
          console.log(`🔍 special_track debug: value="${value}", type=${typeof value}`);
        }
      }
    });
    
    // เพิ่มฟิลด์พิเศษ
    updateData.has_record = true;
    updateData.recorded_at = new Date().toLocaleDateString('th-TH');
    updateData.updated_at = new Date().toLocaleDateString('th-TH');
    
    console.log("📤 Update data:", updateData);
    console.log("🔍 updateData.special_track exists:", 'special_track' in updateData);
    console.log("🔍 updateData.special_track value:", updateData.special_track);
    console.log("🔍 updateData keys:", Object.keys(updateData));
    
    // อัปเดตฐานข้อมูล
    console.log("📡 Updating database...");
    
    // Ensure special_track is properly handled
    if (updateData.special_track) {
      console.log("🔧 Adding special_track to update:", updateData.special_track);
    }
    
    const learn = await Learn.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true, strict: false }
    );
    
    if (!learn) {
      console.log("❌ Learn not found for ID:", id);
      return NextResponse.json({ 
        success: false, 
        message: "ไม่พบข้อมูลแผนกิจกรรม" 
      }, { status: 404 });
    }
    
    console.log("✅ Update successful");
    console.log("🔍 Updated learn.special_track:", learn.special_track);
    console.log("🔍 Full updated document:", learn);
    
    return NextResponse.json({ 
      success: true, 
      message: "บันทึกผลกิจกรรมเรียบร้อยแล้ว",
      data: learn 
    });
    
  } catch (error: any) {
    console.error("❌ Error in POST /api/learn/[id]/record:", error);
    return NextResponse.json({ 
      success: false, 
      message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
      error: error.message
    }, { status: 500 });
  }
}