// app/api/learn/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Learn from "@/models/Learn";
import Student from "@/models/Student";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
  try {
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
    const userId = session.user.id;
    
    // Admin เห็นได้ทั้งหมด
    const isAdmin = userRole === 'ADMIN';
    
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const semester = searchParams.get('semester');
    const academicYear = searchParams.get('academicYear');
    const status = searchParams.get('status');
    const hasRecord = searchParams.get('hasRecord');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    
    // ถ้า type = 'student' ให้ค้นหานักเรียน
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
    
    // สร้าง base query สำหรับค้นหาแผน
    let query: any = {};
    
    // กรองตามพารามิเตอร์ที่ส่งมา
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
    
    // ✅ ถ้าไม่ใช่ Admin ให้กรองตามสิทธิ์การเข้าถึง
    if (!isAdmin) {
      try {
        // ดึงข้อมูลนักเรียนที่ครูคนนี้ดูแล
        let assignedLevels: string[] = [];
        let assignedStudentIds: string[] = [];
        
        if (userId) {
          const user = await User.findById(userId).populate({
            path: 'assigned_students.student_id',
            model: Student
          });
          
          if (user && user.assigned_students && user.assigned_students.length > 0) {
            assignedLevels = user.assigned_students
              .map((item: any) => item.student_id?.level)
              .filter(Boolean);
            
            assignedStudentIds = user.assigned_students
              .map((item: any) => item.student_id?.id)
              .filter(Boolean);
          }
        }
        
        console.log("📊 Assigned levels:", assignedLevels);
        console.log("👤 Current user:", currentUser);
        
        // สร้างเงื่อนไขการเข้าถึง
        // ครูจะเห็น:
        // 1. แผนทั้งหมดที่ตัวเองสร้าง (ทั้งร่างและเผยแพร่)
        // 2. แผนเผยแพร่ที่มีระดับชั้นตรงกับนักเรียนที่ดูแล
        
        const accessConditions: any[] = [
          { created_by: currentUser } // แผนที่ตัวเองสร้างทั้งหมด
        ];
        
        // ถ้ามีนักเรียนที่ดูแล ให้เพิ่มเงื่อนไขแผนเผยแพร่ตามระดับชั้น
        if (assignedLevels.length > 0) {
          accessConditions.push({
            status: 'published',
            level: { $in: assignedLevels }
          });
        } else {
          // ถ้าไม่มีนักเรียนที่ดูแลเลย ให้เห็นเฉพาะแผนที่ตัวเองสร้าง
          console.log("👤 ครูไม่มีนักเรียนในความดูแล");
        }
        
        // ถ้ามีการกรอง status อยู่แล้ว ให้รวมกับเงื่อนไขเดิม
        if (query.status) {
          // ถ้ามี query.status อยู่แล้ว (เช่น เลือกดูเฉพาะร่าง)
          // ต้องรวมกับ accessConditions
          const statusCondition = query.status;
          delete query.status;
          
          query.$and = [
            { $or: accessConditions },
            { status: statusCondition }
          ];
        } else {
          // ถ้าไม่มี ให้ใช้ accessConditions เป็น $or
          query.$or = accessConditions;
        }
        
        console.log("🔍 Access query:", JSON.stringify(query, null, 2));
        
      } catch (error) {
        console.error("Error fetching assigned students:", error);
        // ถ้า error ให้เห็นเฉพาะแผนที่ตัวเองสร้าง
        query.created_by = currentUser;
      }
    }
    
    console.log("🔍 Final Query:", JSON.stringify(query, null, 2));
    console.log("👤 Current user:", currentUser, "Role:", userRole, "Admin:", isAdmin);
    
    const learns = await Learn.find(query).sort({ createdAt: -1 });
    console.log(`📊 Found ${learns.length} plans`);
    
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
      date: learn.createdAt ? new Date(learn.createdAt).toISOString().split('T')[0] : "-",
      materials: learn.materials || [],
      created_by: learn.created_by || "-",
      target_class_group: learn.target_class_group || "",
      target_class_numbers: learn.target_class_numbers || []
    }));
    
    return NextResponse.json({ 
      success: true, 
      data: plans,
      count: plans.length,
      type: 'learns'
    });
    
  } catch (error: any) {
    console.error("❌ Error in GET /api/learn:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
    
    // เฉพาะ Teacher และ Admin เท่านั้นที่สร้างแผนได้
    if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        message: "ไม่มีสิทธิ์สร้างแผนกิจกรรม" 
      }, { status: 403 });
    }
    
    const formData = await request.formData();
    console.log("📦 POST API - Received form data");
    
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
      'status', 'created_by',
      'target_class_group'
    ];
    
    fields.forEach(field => {
      const value = formData.get(field);
      if (value && field !== 'materials') {
        data[field] = value;
        console.log(`  ${field}:`, value);
      }
    });
    
    // target_class_numbers (JSON string)
    const targetClassNumbers = formData.get('target_class_numbers');
    if (targetClassNumbers) {
      try {
        data.target_class_numbers = JSON.parse(targetClassNumbers as string);
        console.log(`  target_class_numbers:`, data.target_class_numbers);
      } catch (e) {
        data.target_class_numbers = [];
      }
    }
    
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
    if (objectives.length > 0) data.objectives = objectives;
    
    // Checkboxes
    data.evalObservation = formData.get('evalObservation') === 'on';
    data.evalWorksheet = formData.get('evalWorksheet') === 'on';
    data.evalParticipation = formData.get('evalParticipation') === 'on';
    console.log(`  evalObservation:`, data.evalObservation);
    console.log(`  evalWorksheet:`, data.evalWorksheet);
    console.log(`  evalParticipation:`, data.evalParticipation);
    
    // จัดการไฟล์
    const materials: { name: string, url: string }[] = [];
    
    for (let i = 0; formData.has(`materials[${i}]`); i++) {
      const file = formData.get(`materials[${i}]`) as File;
      
      if (file && file.size > 0) {
        console.log(`📄 Processing file ${i}:`, file.name, file.size);
        
        if (!(file instanceof File)) continue;
        
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
          
          materials.push({
            name: file.name,
            url: upload.secure_url
          });
          console.log(`✅ Added material:`, file.name);
        } catch (error) {
          console.error(`❌ Upload error for ${file.name}:`, error);
        }
      }
    }
    
    if (materials.length > 0) {
      data.materials = materials;
      console.log(`📦 Total materials: ${materials.length} files`);
    }
    
    // ใช้ชื่อผู้ใช้จาก session
    data.created_by = currentUser;
    
    const now = new Date().toLocaleDateString('th-TH');
    data.created_at = now;
    data.updated_at = now;
    data.has_record = false;
    
    console.log("👤 Creating plan for user:", currentUser, "Role:", userRole);
    console.log("📝 Final data:", JSON.stringify(data, null, 2));
    
    const learn = await Learn.create(data);
    
    return NextResponse.json({ 
      success: true, 
      message: "บันทึกแผนกิจกรรมเรียบร้อยแล้ว",
      data: { id: learn._id.toString(), ...learn.toObject() }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("❌ Error in POST /api/learn:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}