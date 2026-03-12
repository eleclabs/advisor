// D:\advisor-main\app\api\learn\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Learn from "@/models/Learn";
import cloudinary from "@/lib/cloudinary";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🔍 GET /api/learn/[id] - ID:", id);
    
    await connectDB();
    
    // ตรวจสอบ session และสิทธิ์
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        message: "กรุณาเข้าสู่ระบบ" 
      }, { status: 401 });
    }
    
    const currentUser = session.user.name;
    const userRole = session.user.role;
    const isAdmin = userRole === 'ADMIN';
    
    const learn = await Learn.findById(id).lean().exec();
    
    if (!learn) {
      return NextResponse.json({ 
        success: false, 
        message: "ไม่พบข้อมูลแผนกิจกรรม" 
      }, { status: 404 });
    }
    
    // ตรวจสอบสิทธิ์การเข้าถึง (เฉพาะเจ้าของหรือ Admin)
    if (!isAdmin && learn.created_by !== currentUser) {
      return NextResponse.json({ 
        success: false, 
        message: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" 
      }, { status: 403 });
    }
    
    console.log("GET learn.special_track:", learn.special_track);
    
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
    
    // ตรวจสอบ session และสิทธิ์
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        message: "กรุณาเข้าสู่ระบบ" 
      }, { status: 401 });
    }
    
    const currentUser = session.user.name;
    const userRole = session.user.role;
    const isAdmin = userRole === 'ADMIN';
    
    // ตรวจสอบว่าแผนนี้มีอยู่จริง
    const existingLearn = await Learn.findById(id);
    if (!existingLearn) {
      return NextResponse.json({ 
        success: false, 
        message: "ไม่พบข้อมูลแผนกิจกรรม" 
      }, { status: 404 });
    }
    
    // ตรวจสอบสิทธิ์การแก้ไข (เฉพาะเจ้าของหรือ Admin)
    if (!isAdmin && existingLearn.created_by !== currentUser) {
      return NextResponse.json({ 
        success: false, 
        message: "ไม่มีสิทธิ์แก้ไขข้อมูลนี้" 
      }, { status: 403 });
    }
    
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
      'teacherNote', 'problems', 'special_track', 'sessionNote',
      'materialsNote', 'suggestions', 'individualFollowup',
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
    
    // จัดการไฟล์ใหม่ (ถ้ามี)
    const newMaterials: { name: string, url: string }[] = [];
    
    for (let i = 0; formData.has(`materials[${i}]`); i++) {
      const file = formData.get(`materials[${i}]`) as File;
      
      if (file && file.size > 0) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const upload = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { 
                folder: "learning_materials",
                resource_type: "raw"
              }, 
              (err, result) => {
                if (err) reject(err);
                else resolve(result);
              }
            ).end(buffer);
          });
          
          newMaterials.push({
            name: file.name,
            url: upload.secure_url
          });
        } catch (error) {
          console.error(`❌ Upload error for ${file.name}:`, error);
        }
      }
    }
    
    // รับไฟล์เดิมที่คงไว้ (มาในรูปแบบ JSON string หรือชื่อ/URL แยกกัน)
    const existingMaterials: { name: string, url: string }[] = [];
    for (let i = 0; formData.has(`existingMaterials[${i}]`); i++) {
      const materialData = formData.get(`existingMaterials[${i}]`) as string;
      if (materialData) {
        try {
          // ตรวจสอบว่าเป็น JSON หรือไม่ (กรณีส่งมาเป็น object string)
          const parsed = JSON.parse(materialData);
          existingMaterials.push(parsed);
        } catch (e) {
          // ถ้าไม่ใช่ JSON (กรณีส่งมาเป็น URL เฉพาะสำหรับข้อมูลเก่า) 
          // ให้พยายามหาชื่อไฟล์จาก URL
          existingMaterials.push({
            name: materialData.split('/').pop() || 'ไฟล์เดิม',
            url: materialData
          });
        }
      }
    }
    
    // รวมไฟล์เดิมและไฟล์ใหม่
    const allMaterials = [...existingMaterials, ...newMaterials];
    
    if (allMaterials.length > 0) {
      updateData.materials = allMaterials;
      console.log(`🔗 Final materials array (${allMaterials.length} files):`, allMaterials);
    } else if (formData.get('materials_clear') === 'true') {
      // กรณีต้องการลบไฟล์ทั้งหมด
      updateData.materials = [];
      console.log(`🔗 Cleared all materials`);
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
    
    // ตรวจสอบ session และสิทธิ์
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        message: "กรุณาเข้าสู่ระบบ" 
      }, { status: 401 });
    }
    
    const currentUser = session.user.name;
    const userRole = session.user.role;
    const isAdmin = userRole === 'ADMIN';
    
    // ตรวจสอบว่าแผนนี้มีอยู่จริง
    const existingLearn = await Learn.findById(id);
    if (!existingLearn) {
      return NextResponse.json({ 
        success: false, 
        message: "ไม่พบข้อมูลแผนกิจกรรม" 
      }, { status: 404 });
    }
    
    // ตรวจสอบสิทธิ์การลบ (เฉพาะเจ้าของหรือ Admin)
    if (!isAdmin && existingLearn.created_by !== currentUser) {
      return NextResponse.json({ 
        success: false, 
        message: "ไม่มีสิทธิ์ลบข้อมูลนี้" 
      }, { status: 403 });
    }
    
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