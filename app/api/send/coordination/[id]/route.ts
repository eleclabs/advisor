import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Coordination } from "@/models/Send";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    
    // ตรวจสอบว่า id เป็น MongoDB ObjectId ที่ถูกต้องหรือไม่
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "รหัสไม่ถูกต้อง" },
        { status: 400 }
      );
    }
    
    // ลบข้อมูลการประสานงาน
    const result = await Coordination.findByIdAndDelete(id);
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลการประสานงาน" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "ลบข้อมูลสำเร็จ"
    });
  } catch (error) {
    console.error('Error deleting coordination:', error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถลบข้อมูลได้" },
      { status: 500 }
    );
  }
}