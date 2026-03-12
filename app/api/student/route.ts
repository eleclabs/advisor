// D:\advisor-main\app\api\student\route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Student from "@/models/Student";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  console.log("🚀 POST /api/student เริ่มทำงาน");
  
  try {
    await connectDB();
    
    // ตรวจสอบ session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        message: "กรุณาเข้าสู่ระบบ" 
      }, { status: 401 });
    }
    
    const formData = await req.formData();
    
    // ✅ Debug: ดูทุกค่าที่ได้รับ
    console.log("📥 Received form data:");
    for (const [key, value] of formData.entries()) {
      console.log(`   - ${key}: ${value}`);
    }

    // ดึงข้อมูลทั้งหมด
    const id = formData.get("id") as string;
    const prefix = formData.get("prefix") as string;
    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const nickname = formData.get("nickname") as string;
    const gender = formData.get("gender") as string;
    const birth_date = formData.get("birth_date") as string;
    const level = formData.get("level") as string;
    const class_group = formData.get("class_group") as string;
    const class_number = formData.get("class_number") as string;
    const advisor_name = formData.get("advisor_name") as string;
    const phone_number = formData.get("phone_number") as string;
    const religion = formData.get("religion") as string;
    const address = formData.get("address") as string;
    const weight = formData.get("weight") as string;
    const height = formData.get("height") as string;
    const blood_type = formData.get("blood_type") as string;
    const bmi = formData.get("bmi") as string;

    console.log("🔍 class_number =", class_number);

    // ตรวจสอบข้อมูลจำเป็น
    if (!id || !first_name || !last_name || !level) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกข้อมูลที่จำเป็น" },
        { status: 400 }
      );
    }

    // ตรวจสอบรหัสซ้ำ
    const existingStudent = await Student.findOne({ id });
    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: "รหัสนักศึกษานี้มีอยู่แล้ว" },
        { status: 400 }
      );
    }

    // จัดการรูปโปรไฟล์
    let imageUrl = "";
    const profileImage = formData.get("profileImage") as File;
    if (profileImage && profileImage.size > 0) {
      try {
        const buffer = Buffer.from(await profileImage.arrayBuffer());
        const upload = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { 
              folder: "student_profiles",
              resource_type: "image"
            }, 
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          ).end(buffer);
        });
        imageUrl = upload.secure_url;
        console.log(`✅ อัปโหลดรูปโปรไฟล์: ${profileImage.name} -> ${imageUrl}`);
      } catch (error) {
        console.error(`❌ อัปโหลดรูปโปรไฟล์ ${profileImage.name} ล้มเหลว:`, error);
      }
    }

    // สร้างข้อมูล
    const studentData = {
      id,
      prefix,
      first_name,
      last_name,
      nickname: nickname || "",
      gender: gender || "",
      birth_date: birth_date || "",
      level,
      class_group: class_group || "",
      class_number: class_number || "",
      advisor_name: advisor_name || "",
      phone_number: phone_number || "",
      religion: religion || "",
      address: address || "",
      weight: weight || "",
      height: height || "",
      blood_type: blood_type || "",
      bmi: bmi || "",
      image: imageUrl,
      email: `${id}@student.com`,
      status: "นักเรียนปกติ",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("📦 Saving student data:", studentData);

    const student = await Student.create(studentData);
    console.log("✅ Saved student with _id:", student._id);

    return NextResponse.json({ 
      success: true, 
      data: student,
      message: "บันทึกข้อมูลสำเร็จ" 
    });

  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ✅ GET students (แก้ไขให้รองรับ assigned_only)
export async function GET(request: NextRequest) {
  try {
    console.log("🚀 GET /api/student เริ่มทำงาน");
    await connectDB();
    
    // ตรวจสอบ session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        message: "กรุณาเข้าสู่ระบบ" 
      }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const assignedOnly = searchParams.get('assigned_only') === 'true';
    const level = searchParams.get('level');
    const classGroup = searchParams.get('class_group');
    const classNumber = searchParams.get('class_number');
    
    const userRole = session.user.role;
    const userId = session.user.id;
    const isAdmin = userRole === 'ADMIN';
    
    let students = [];
    let query: any = {};
    
    // กรองตาม level, class_group, class_number ถ้ามี
    if (level) query.level = level;
    if (classGroup) query.class_group = classGroup;
    if (classNumber) query.class_number = classNumber;
    
    if (assignedOnly && !isAdmin && userId) {
      // ✅ ดึงเฉพาะนักเรียนที่ครูคนนี้ดูแล
      console.log("📊 Fetching assigned students only for user:", userId);
      
      const user = await User.findById(userId).populate({
        path: 'assigned_students.student_id',
        model: Student
      });
      
      if (user && user.assigned_students && user.assigned_students.length > 0) {
        // ดึงข้อมูลนักเรียนจาก assigned_students
        students = user.assigned_students
          .filter((item: any) => item.student_id)
          .map((item: any) => item.student_id);
        
        // กรองเพิ่มเติมตาม query ถ้ามี
        if (Object.keys(query).length > 0) {
          students = students.filter((s: any) => {
            let match = true;
            if (query.level && s.level !== query.level) match = false;
            if (query.class_group && s.class_group !== query.class_group) match = false;
            if (query.class_number && s.class_number !== query.class_number) match = false;
            return match;
          });
        }
        
        console.log(`✅ Found ${students.length} assigned students`);
      } else {
        console.log("👤 No assigned students found");
        students = [];
      }
    } else {
      // ✅ Admin หรือ ไม่ได้ระบุ assignedOnly: ดึงนักเรียนทั้งหมดตาม query
      console.log("📊 Fetching all students with query:", query);
      students = await Student.find(query).sort({ level: 1, class_group: 1, class_number: 1 });
      console.log(`✅ Found ${students.length} students`);
    }
    
    return NextResponse.json({ 
      success: true, 
      data: students,
      count: students.length 
    });
    
  } catch (error: any) {
    console.error("❌ Error in GET /api/student:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Error fetching students" 
    }, { status: 500 });
  }
}