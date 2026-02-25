import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";

export async function POST(req: NextRequest) {
  console.log("🚀 POST /api/student เริ่มทำงาน");
  
  try {
    await connectDB();
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
    const class_number = formData.get("class_number") as string;  // ✅ ต้องมี
    const advisor_name = formData.get("advisor_name") as string;
    const phone_number = formData.get("phone_number") as string;
    const religion = formData.get("religion") as string;
    const address = formData.get("address") as string;
    const weight = formData.get("weight") as string;
    const height = formData.get("height") as string;
    const blood_type = formData.get("blood_type") as string;
    const bmi = formData.get("bmi") as string;

    console.log("🔍 class_number =", class_number); // ✅ ดูว่าได้ค่ามั้ย

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
      class_number: class_number || "",  // ✅ ต้องมี
      advisor_name: advisor_name || "",
      phone_number: phone_number || "",
      religion: religion || "",
      address: address || "",
      weight: weight || "",
      height: height || "",
      blood_type: blood_type || "",
      bmi: bmi || "",
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

export async function GET() {
  try {
    await connectDB();
    const students = await Student.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error" }, { status: 500 });
  }
}