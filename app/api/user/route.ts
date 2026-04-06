import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";

/* ===================== POST (Create User) ===================== */
export async function POST(req: NextRequest) {
  console.log("🚀 POST /api/user เริ่มทำงาน");

  try {
    await connectDB();

    const body = await req.json();
    console.log("📝 ข้อมูลที่ได้รับ:", body);

    const {
      email,
      password,
      provider = "credentials",
      prefix,
      first_name,
      last_name,
      nickname,
      teacher_id,
      phone,
      line_id,
      role = "TEACHER",
      is_active = true,
      homeroom_level,
      homeroom_class,
      department,
    } = body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!email || !first_name || !last_name) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามีผู้ใช้นี้อยู่แล้วหรือไม่
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "อีเมลนี้มีผู้ใช้งานแล้ว" },
        { status: 400 }
      );
    }

    // ตรวจสอบ teacher_id ซ้ำ (ถ้าระบุ)
    if (teacher_id) {
      const existingTeacherId = await User.findOne({ teacher_id });
      if (existingTeacherId) {
        return NextResponse.json(
          { success: false, message: "รหัสประจำตัวครูนี้มีผู้ใช้งานแล้ว" },
          { status: 400 }
        );
      }
    }

    // เข้ารหัสรหัสผ่าน (ถ้าใช้ credentials)
    let hashedPassword = "";
    if (provider === "credentials") {
      if (!password) {
        return NextResponse.json(
          { success: false, message: "กรุณาระบุรหัสผ่าน" },
          { status: 400 }
        );
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // สร้างผู้ใช้ใหม่
    const newUser = new User({
      email,
      password: provider === "credentials" ? hashedPassword : undefined,
      provider,
      prefix,
      first_name,
      last_name,
      nickname,
      teacher_id,
      phone,
      line_id,
      role,
      is_active,
      homeroom_level,
      homeroom_class,
      department,
    });

    await newUser.save();

    console.log("✅ สร้างผู้ใช้ใหม่สำเร็จ:", email);

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "สร้างผู้ใช้สำเร็จ"
    });

  } catch (error: any) {
    console.error("❌ Error creating user:", error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "ข้อมูลซ้ำในระบบ" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}

/* ===================== GET (Read Users) ===================== */
export async function GET(req: NextRequest) {
  console.log("🚀 GET /api/user เริ่มทำงาน");

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const is_active = searchParams.get('is_active');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // สร้าง filter conditions
    const filter: any = {};
    if (role) filter.role = role;
    if (is_active) filter.is_active = is_active === 'true';

    // ดึงข้อมูลผู้ใช้
    const users = await User.find(filter)
      .select('-password') // ไม่ดึงรหัสผ่าน
      .sort({ createdAt: -1 })
      .limit(limit * page)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
