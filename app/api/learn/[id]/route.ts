// D:\advisor-main\app\api\learn\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Learn from "@/models/Learn";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🔍 GET /api/learn/[id] - ID:", id);
    
    await connectDB();
    
    const learn = await Learn.findById(id);
    
    if (!learn) {
      return NextResponse.json({ 
        success: false, 
        message: "ไม่พบข้อมูลแผนกิจกรรม" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: learn 
    });
    
  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🔍 PUT /api/learn/[id] - ID:", id);
    
    await connectDB();
    
    const formData = await request.formData();
    console.log("📦 FormData received");
    
    // แปลง FormData เป็น Object
    const updateData: any = {};
    
    // ฟิลด์ทั่วไป
    const fields = [
      'level', 'semester', 'academicYear', 'week', 'time', 'topic',
      'checkAttendance', 'checkUniform', 'announceNews',
      'warmup', 'mainActivity', 'summary',
      'trackProblems', 'individualCounsel',
      'teacherNote', 'problems', 'specialTrack', 'sessionNote',
      'materials', 'materialsNote', 'suggestions', 'individualFollowup',
      'status', 'created_by'
    ];
    
    fields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) {
        updateData[field] = value;
        console.log(`  ${field}:`, value);
      }
    });
    
    // วัตถุประสงค์ (array)
    const objectives = [];
    let i = 0;
    while (formData.has(`objectives[${i}]`)) {
      const value = formData.get(`objectives[${i}]`);
      if (value) {
        objectives.push(value);
        console.log(`  objectives[${i}]:`, value);
      }
      i++;
    }
    if (objectives.length > 0) {
      updateData.objectives = objectives;
    }
    
    // Checkboxes (boolean)
    updateData.evalObservation = formData.get('evalObservation') === 'on';
    updateData.evalWorksheet = formData.get('evalWorksheet') === 'on';
    updateData.evalParticipation = formData.get('evalParticipation') === 'on';
    
    // จัดการไฟล์ (ถ้ามี)
    const file = formData.get('materials') as File;
    if (file && file.size > 0) {
      // ในที่นี้เก็บแค่ชื่อไฟล์ก่อน
      updateData.materials = file.name;
    }
    
    // อัปเดตเวลา
    updateData.updated_at = new Date().toLocaleDateString('th-TH');
    
    console.log("📤 Updating with data:", updateData);
    
    const learn = await Learn.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!learn) {
      return NextResponse.json({ 
        success: false, 
        message: "ไม่พบข้อมูลแผนกิจกรรม" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "อัปเดตข้อมูลเรียบร้อยแล้ว",
      data: learn 
    });
    
  } catch (error: any) {
    console.error("❌ Error in PUT:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🔍 DELETE /api/learn/[id] - ID:", id);
    
    await connectDB();
    
    const learn = await Learn.findByIdAndDelete(id);
    
    if (!learn) {
      return NextResponse.json({ 
        success: false, 
        message: "ไม่พบข้อมูลแผนกิจกรรม" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "ลบข้อมูลเรียบร้อยแล้ว" 
    });
    
  } catch (error: any) {
    console.error("❌ Error in DELETE:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}