// D:\advisor-main\app\api\learn\[id]\edit\route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Learn from "@/models/Learn";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    const formData = await request.formData();
    
    // เฉพาะฟิลด์ที่แก้ไขก่อนจัดกิจกรรม
    const updateData: any = {};
    
    const fields = [
      'level', 'semester', 'academicYear', 'week', 'time', 'topic',
      'checkAttendance', 'checkUniform', 'announceNews',
      'warmup', 'mainActivity', 'summary',
      'trackProblems', 'individualCounsel',
      'materials', 'materialsNote', 'suggestions', 'individualFollowup',
      'status', 'created_by'
    ];
    
    fields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) {
        updateData[field] = value.toString();
      }
    });
    
    // วัตถุประสงค์
    const objectives = [];
    let i = 0;
    while (formData.has(`objectives[${i}]`)) {
      const value = formData.get(`objectives[${i}]`);
      if (value) objectives.push(value.toString());
      i++;
    }
    if (objectives.length > 0) {
      updateData.objectives = objectives;
    }
    
    // Checkboxes
    updateData.evalObservation = formData.get('evalObservation') === 'on';
    updateData.evalWorksheet = formData.get('evalWorksheet') === 'on';
    updateData.evalParticipation = formData.get('evalParticipation') === 'on';
    
    // ไฟล์
    const file = formData.get('materials') as File;
    if (file && file.size > 0) {
      updateData.materials = file.name;
    }
    
    updateData.updated_at = new Date().toLocaleDateString('th-TH');
    
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
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}