import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Referral, Coordination, FollowUp } from "@/models/Send";
import mongoose from "mongoose";

// GET - ดึงข้อมูลการส่งต่อตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // ตรวจสอบว่า id เป็น MongoDB ObjectId ที่ถูกต้องหรือไม่
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "รหัสไม่ถูกต้อง" },
        { status: 400 }
      );
    }
    
    // ดึงข้อมูลการส่งต่อ
    const referral = await Referral.findById(id);
    
    if (!referral) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลการส่งต่อ" },
        { status: 404 }
      );
    }
    
    // ดึงข้อมูลการประสานงานที่เกี่ยวข้อง
    const coordinations = await Coordination.find({ referral_id: id })
      .sort({ coordination_date: -1 });
    
    // ดึงข้อมูลการติดตามผลที่เกี่ยวข้อง
    const followUps = await FollowUp.find({ referral_id: id })
      .sort({ follow_date: -1 });
    
    return NextResponse.json({
      success: true,
      data: {
        referral,
        coordinations,
        followUps
      }
    });
  } catch (error) {
    console.error('Error fetching referral:', error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถดึงข้อมูลได้" },
      { status: 500 }
    );
  }
}

// PUT - อัปเดตข้อมูลการส่งต่อ
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    
    // ตรวจสอบว่า id เป็น MongoDB ObjectId ที่ถูกต้องหรือไม่
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "รหัสไม่ถูกต้อง" },
        { status: 400 }
      );
    }
    
    // ตรวจสอบว่ามีการส่งต่ออยู่จริง
    const referral = await Referral.findById(id);
    if (!referral) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลการส่งต่อ" },
        { status: 404 }
      );
    }
    
    // อัปเดตข้อมูล
    const updatedReferral = await Referral.findByIdAndUpdate(
      id,
      { ...body, updated_at: new Date() },
      { new: true }
    );
    
    return NextResponse.json({
      success: true,
      data: updatedReferral
    });
  } catch (error) {
    console.error('Error updating referral:', error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถอัปเดตข้อมูลได้" },
      { status: 500 }
    );
  }
}

// DELETE - ลบข้อมูลการส่งต่อ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // ตรวจสอบว่า id เป็น MongoDB ObjectId ที่ถูกต้องหรือไม่
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "รหัสไม่ถูกต้อง" },
        { status: 400 }
      );
    }
    
    // ตรวจสอบว่ามีการส่งต่ออยู่จริง
    const referral = await Referral.findById(id);
    if (!referral) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลการส่งต่อ" },
        { status: 404 }
      );
    }
    
    // ลบข้อมูลการประสานงานที่เกี่ยวข้อง
    await Coordination.deleteMany({ referral_id: id });
    
    // ลบข้อมูลการติดตามผลที่เกี่ยวข้อง
    await FollowUp.deleteMany({ referral_id: id });
    
    // ลบการส่งต่อ
    await Referral.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: "ลบข้อมูลสำเร็จ"
    });
  } catch (error) {
    console.error('Error deleting referral:', error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถลบข้อมูลได้" },
      { status: 500 }
    );
  }
}
