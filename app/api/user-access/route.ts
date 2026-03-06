import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    const { user_id, level, class_group, class_number } = body;
    
    if (!user_id) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ user_id" },
        { status: 400 }
      );
    }

    // อัปเดตข้อมูลการรับผิดชอบนักเรียนใน User Model
    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      {
        $set: {
          homeroom_level: level,
          homeroom_class: class_group,
          homeroom_class_range: Array.isArray(class_number) ? class_number : [class_number],
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "ไม่พบผู้ใช้ที่ระบุ" },
        { status: 404 }
      );
    }

    const accessData = {
      user_id,
      level,
      class_group,
      class_number: Array.isArray(class_number) ? class_number.join(', ') : class_number,
      created_at: updatedUser.updatedAt,
      updated_at: updatedUser.updatedAt,
    };

    console.log("✅ Updated user access data in User Model:", accessData);

    return NextResponse.json({ 
      success: true, 
      data: accessData,
      message: "บันทึกข้อมูลการเข้าถึงสำเร็จ" 
    });

  } catch (error: any) {
    console.error("❌ Error in POST /api/user-access:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ user_id" },
        { status: 400 }
      );
    }

    // ดึงข้อมูลจาก User Model แทน Mock Data
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "ไม่พบผู้ใช้ที่ระบุ" },
        { status: 404 }
      );
    }

    const accessData = {
      user_id: user._id,
      level: user.homeroom_level || null,
      class_group: user.homeroom_class || null,
      class_number: user.homeroom_class_range ? user.homeroom_class_range.join(', ') : null,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };

    return NextResponse.json({ 
      success: true, 
      data: accessData || null 
    });

  } catch (error: any) {
    console.error("❌ Error in GET /api/user-access:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
