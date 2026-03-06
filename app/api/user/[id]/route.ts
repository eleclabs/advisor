import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";

/* ===================== PUT (Update User) ===================== */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  console.log(`🚀 PUT /api/user/${id} เริ่มทำงาน`);

  try {
    await connectDB();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสผู้ใช้" },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log("📝 ข้อมูลที่จะอัปเดต:", body);

    const {
      email,
      password,
      provider,
      prefix,
      first_name,
      last_name,
      nickname,
      teacher_id,
      phone,
      line_id,
      image,
      role,
      is_active,
      homeroom_level,
      homeroom_class,
      department,
    } = body;

    // ตรวจสอบว่ามีผู้ใช้นี้อยู่จริงหรือไม่
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้ใช้" },
        { status: 404 }
      );
    }

    // ตรวจสอบอีเมลซ้ำ (ถ้าเปลี่ยน)
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return NextResponse.json(
          { success: false, message: "อีเมลนี้มีผู้ใช้งานแล้ว" },
          { status: 400 }
        );
      }
    }

    // ตรวจสอบ teacher_id ซ้ำ (ถ้าเปลี่ยน)
    if (teacher_id && teacher_id !== existingUser.teacher_id) {
      const teacherIdExists = await User.findOne({ teacher_id, _id: { $ne: id } });
      if (teacherIdExists) {
        return NextResponse.json(
          { success: false, message: "รหัสประจำตัวครูนี้มีผู้ใช้งานแล้ว" },
          { status: 400 }
        );
      }
    }

    // สร้าง object สำหรับอัปเดต
    const updateData: any = {
      updated_at: new Date(),
    };

    // เพิ่มฟิลด์ที่อัปเดต
    if (email !== undefined) updateData.email = email;
    if (provider !== undefined) updateData.provider = provider;
    if (prefix !== undefined) updateData.prefix = prefix;
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (teacher_id !== undefined) updateData.teacher_id = teacher_id;
    if (phone !== undefined) updateData.phone = phone;
    if (line_id !== undefined) updateData.line_id = line_id;
    if (image !== undefined) updateData.image = image;
    if (role !== undefined) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (password !== undefined) updateData.password = password;
    if (homeroom_level !== undefined) updateData.homeroom_level = homeroom_level;
    if (homeroom_class !== undefined) updateData.homeroom_class = homeroom_class;
    if (department !== undefined) updateData.department = department;

    // จัดการรหัสผ่าน (ถ้ามีการเปลี่ยน)
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after' }
    ).select('+password'); // ส่งรหัสผ่านกลับไปให้ frontend

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "ไม่สามารถอัปเดตข้อมูลได้" },
        { status: 500 }
      );
    }

    console.log(`✅ อัปเดตผู้ใช้ ID: ${id} สำเร็จ`);

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "อัปเดตข้อมูลสำเร็จ"
    });

  } catch (error: any) {
    console.error("❌ Error updating user:", error);
    
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

/* ===================== GET (Single User) ===================== */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  console.log(`🚀 GET /api/user/${id} เริ่มทำงาน`);

  try {
    await connectDB();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสผู้ใช้" },
        { status: 400 }
      );
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้ใช้" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error: any) {
    console.error("❌ Error fetching user:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}

/* ===================== DELETE ===================== */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  console.log(`🚀 DELETE /api/user/${id} เริ่มทำงาน`);

  try {
    await connectDB();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสผู้ใช้" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามีผู้ใช้นี้อยู่จริงหรือไม่
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้ใช้" },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าเป็น admin ตัวเองหรือไม่ (ไม่ให้ลบตัวเอง)
    // อาจจะต้องส่ง userId ของผู้ทำการมาด้วย หรือตรวจสอบจาก session

    // ลบผู้ใช้
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: "ไม่สามารถลบข้อมูลได้" },
        { status: 500 }
      );
    }

    console.log(`✅ ลบผู้ใช้ ID: ${id} ชื่อ: ${user.first_name} ${user.last_name} สำเร็จ`);

    return NextResponse.json({
      success: true,
      message: "ลบข้อมูลสำเร็จ",
      data: deletedUser
    });

  } catch (error: any) {
    console.error("❌ Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
