import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";

/* ===================== PUT ===================== */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  console.log(`🚀 PUT /api/student/${id} เริ่มทำงาน`);

  try {
    await connectDB();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสนักศึกษา" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const updateData: any = {};

    for (const [key, value] of formData.entries()) {
      if (value !== null && value !== undefined) {
        updateData[key] = value;
      }
    }

    if (!updateData.id || !updateData.first_name || !updateData.last_name || !updateData.level) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" },
        { status: 400 }
      );
    }

    updateData.updated_at = new Date().toISOString();

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedStudent) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลนักเรียน" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedStudent,
      message: "อัปเดตข้อมูลสำเร็จ"
    });

  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "รหัสนักศึกษาซ้ำ" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/* ===================== GET ===================== */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  console.log(`🚀 GET /api/student/${id} เริ่มทำงาน`);

  try {
    await connectDB();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสนักศึกษา" },
        { status: 400 }
      );
    }

    const student = await Student.findById(id);

    if (!student) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลนักเรียน" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: student
    });

  } catch {
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาด" },
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
  console.log(`🚀 DELETE /api/student/${id} เริ่มทำงาน`);

  try {
    await connectDB();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสนักศึกษา" },
        { status: 400 }
      );
    }

    const student = await Student.findByIdAndUpdate(
      id,
      {
        status: "ลบ",
        updated_at: new Date().toISOString()
      },
      { new: true }
    );

    if (!student) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลนักเรียน" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "ลบข้อมูลสำเร็จ"
    });

  } catch {
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}