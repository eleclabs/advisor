import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Major from "@/models/Major";

// GET - ดึงข้อมูลสาขาวิชาทั้งหมดหรือตาม ID
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const majorId = searchParams.get("id");

    if (majorId) {
      // ดึงข้อมูลสาขาวิชาตาม ID
      const major = await Major.findById(majorId);
      if (!major) {
        return NextResponse.json({ error: "ไม่พบข้อมูลสาขาวิชา" }, { status: 404 });
      }
      return NextResponse.json(major);
    }

    // ดึงข้อมูลสาขาวิชาทั้งหมด
    const majors = await Major.find().sort({ created_at: -1 });
    return NextResponse.json(majors);

  } catch (error) {
    console.error("GET /api/major error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 });
  }
}

// POST - สร้างข้อมูลสาขาวิชาใหม่
export async function POST(request: NextRequest) {
    try {
      await dbConnect();
      const body = await request.json();

    const major = new Major(body);
    await major.save();

    return NextResponse.json({ 
      message: "สร้างข้อมูลสาขาวิชาสำเร็จ", 
      data: major 
    }, { status: 201 });

  } catch (error: any) {
    console.error("POST /api/major error:", error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        error: "ข้อมูลไม่ถูกต้อง", 
        details: error.message 
      }, { status: 400 });
    }
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างข้อมูล" }, { status: 500 });
  }
}

// PUT - อัปเดตข้อมูลสาขาวิชา
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "กรุณาระบุ ID ของสาขาวิชา" }, { status: 400 });
    }

    const major = await Major.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!major) {
      return NextResponse.json({ error: "ไม่พบข้อมูลสาขาวิชา" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "อัปเดตข้อมูลสาขาวิชาสำเร็จ", 
      data: major 
    });

  } catch (error: any) {
    console.error("PUT /api/major error:", error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        error: "ข้อมูลไม่ถูกต้อง", 
        details: error.message 
      }, { status: 400 });
    }
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 });
  }
}

// DELETE - ลบข้อมูลสาขาวิชา
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "กรุณาระบุ ID ของสาขาวิชา" }, { status: 400 });
    }

    const major = await Major.findByIdAndDelete(id);
    if (!major) {
      return NextResponse.json({ error: "ไม่พบข้อมูลสาขาวิชา" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "ลบข้อมูลสาขาวิชาสำเร็จ" 
    });

  } catch (error) {
    console.error("DELETE /api/major error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}