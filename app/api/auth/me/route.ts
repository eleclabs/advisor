import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // ในระบบจริงควรตรวจสอบ token จาก session หรือ JWT
    // แต่สำหรับการทดสอบ จะคืนข้อมูลผู้ใช้แรกที่เจอ (admin)
    const user = await User.findOne({ email: "admin@test.com" }).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้ใช้" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        gender: user.gender,
        birthDate: user.birthDate,
        teacher_id: user.teacher_id,
        phone: user.phone,
        line_id: user.line_id,
        is_active: user.is_active
      }
    });

  } catch (error: any) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
