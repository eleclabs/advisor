// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { 
      email, 
      password, 
      confirmPassword,
      prefix,
      first_name,
      last_name,
      nickname,
      teacher_id,
      phone,
      role,
    } = body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน"
      }, { status: 400 });
    }

    // ตรวจสอบรหัสผ่านตรงกัน
    if (password !== confirmPassword) {
      return NextResponse.json({
        success: false,
        message: "รหัสผ่านไม่ตรงกัน"
      }, { status: 400 });
    }

    // ตรวจสอบความยาวรหัสผ่าน
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
      }, { status: 400 });
    }

    // ตรวจสอบอีเมลซ้ำ
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "อีเมลนี้มีผู้ใช้งานแล้ว"
      }, { status: 400 });
    }

    // ตรวจสอบ teacher_id ซ้ำ (ถ้ามี)
    if (teacher_id) {
      const existingTeacherId = await User.findOne({ teacher_id });
      if (existingTeacherId) {
        return NextResponse.json({
          success: false,
          message: "รหัสประจำตัวครูนี้มีผู้ใช้งานแล้ว"
        }, { status: 400 });
      }
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้างผู้ใช้ใหม่
    const newUser = new User({
      email,
      password: hashedPassword,
      provider: "credentials",
      prefix,
      first_name,
      last_name,
      nickname: nickname || "",
      teacher_id: teacher_id || "",
      phone: phone || "",
      role: role || "TEACHER", // ถ้าไม่เลือก จะเป็น TEACHER
      is_active: true,
    });

    await newUser.save();

    // ไม่ส่งรหัสผ่านกลับ
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: "สมัครสมาชิกสำเร็จ"
    });

  } catch (error: any) {
    console.error("Register error:", error);
    
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        message: "ข้อมูลซ้ำในระบบ"
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก"
    }, { status: 500 });
  }
}