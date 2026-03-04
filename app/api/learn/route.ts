import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Learn from "@/models/Learn";
import Student from "@/models/Student";
import cloudinary from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const semester = searchParams.get('semester');
    const academicYear = searchParams.get('academicYear');
    const status = searchParams.get('status');
    const hasRecord = searchParams.get('hasRecord');
    const search = searchParams.get('search');
    const type = searchParams.get('type'); // ✅ เพิ่ม type เพื่อแยกประเภทการค้นหา
    
    // ✅ ถ้า type = 'student' ให้ค้นหานักเรียน
    if (type === 'student') {
      console.log("🔍 Searching for student with query:", search);
      
      const students = await Student.find({
        $or: [
          { id: search },
          { id: { $regex: search, $options: "i" } },
          { first_name: { $regex: search, $options: "i" } },
          { last_name: { $regex: search, $options: "i" } },
          { nickname: { $regex: search, $options: "i" } }
        ]
      }).limit(10);
      
      console.log("✅ Found students:", students.length);
      
      return NextResponse.json({ 
        success: true, 
        data: students,
        type: 'students'
      });
    }
    
    // ✅ ค้นหาแผนกิจกรรมปกติ (ส่วนเดิม)
    let query: any = {};
    
    if (level) query.level = level;
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;
    
    if (status) {
      query.status = status;
    }
    
    if (hasRecord !== null) {
      query.has_record = hasRecord === 'true';
    }
    
    if (search) {
      query.$or = [
        { topic: { $regex: search, $options: 'i' } },
        { level: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log(" Query:", query);
    
    const learns = await Learn.find(query).sort({ createdAt: -1 });
    
    const plans = learns.map(learn => ({
      id: learn._id.toString(),
      title: learn.topic || 'ไม่มีหัวข้อ',
      level: learn.level || '-',
      week: learn.week ? `สัปดาห์ที่ ${learn.week}` : '-',
      semester: learn.semester ? `ภาคเรียนที่ ${learn.semester}` : '-',
      academicYear: learn.academicYear || '-',
      createdAt: learn.created_at || new Date(learn.createdAt).toLocaleDateString('th-TH'),
      status: learn.status === 'published' ? 'เผยแพร่' : 
              learn.status === 'draft' ? 'ร่าง' : learn.status || 'ร่าง',
      has_record: learn.has_record || false,
      date: learn.createdAt ? new Date(learn.createdAt).toISOString().split('T')[0] : "",
      materials: learn.materials || []
    }));
    
    return NextResponse.json({ 
      success: true, 
      data: plans,
      type: 'learns'
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

// POST function คงเดิม
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    
    // แปลง FormData เป็น Object
    const data: any = {};
    
    // ฟิลด์ทั่วไป
    const fields = [
      'level', 'semester', 'academicYear', 'week', 'time', 'topic',
      'checkAttendance', 'checkUniform', 'announceNews',
      'warmup', 'mainActivity', 'summary',
      'trackProblems', 'individualCounsel',
      'teacherNote', 'problems', 'specialTrack', 'sessionNote',
      'materialsNote', 'suggestions', 'individualFollowup',
      'status', 'created_by'
    ];
    
    fields.forEach(field => {
      const value = formData.get(field);
      if (value && field !== 'materials') data[field] = value;
    });
    
    // วัตถุประสงค์ (array)
    const objectives = [];
    let i = 0;
    while (formData.has(`objectives[${i}]`)) {
      const value = formData.get(`objectives[${i}]`);
      if (value) objectives.push(value);
      i++;
    }
    if (objectives.length > 0) data.objectives = objectives;
    
    // Checkboxes
    data.evalObservation = formData.get('evalObservation') === 'on';
    data.evalWorksheet = formData.get('evalWorksheet') === 'on';
    data.evalParticipation = formData.get('evalParticipation') === 'on';
    
    // ไฟล์
    const materials: { name: string, url: string }[] = [];
    
    // รองรับหลายไฟล์
    console.log(" POST API - Checking for files...");
    
    for (let i = 0; formData.has(`materials[${i}]`); i++) {
      const file = formData.get(`materials[${i}]`) as File;
      
      if (file && file.size > 0) {
        console.log(` Processing file ${i}:`, file.name, file.size);
        
        // validate file
        if (!(file instanceof File)) continue;
        
        // convert file -> buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        
        // upload to cloudinary
        const upload = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { 
              folder: "learning_materials",
              resource_type: "raw" // สำคัญสำหรับไฟล์เอกสาร PDF, DOC, ฯลฯ
            }, 
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          ).end(buffer);
        });
        
        materials.push({
          name: file.name,
          url: upload.secure_url
        });
        console.log(` Added material:`, file.name);
      }
    }
    
    if (materials.length > 0) {
      data.materials = materials;
      console.log(` Final materials array (${materials.length} files):`, materials);
    }
    
    // Timestamps
    const now = new Date().toLocaleDateString('th-TH');
    data.created_at = now;
    data.updated_at = now;
    data.has_record = false;
    
    const learn = await Learn.create(data);
    
    return NextResponse.json({ 
      success: true, 
      message: "บันทึกแผนกิจกรรมเรียบร้อยแล้ว",
      data: { id: learn._id.toString(), ...learn.toObject() }
    }, { status: 201 });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}