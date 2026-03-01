import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { FollowUp } from "@/models/Send";
import { Referral } from "@/models/Send";

// GET - ดึงข้อมูลการติดตามผลทั้งหมด
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const referral_id = searchParams.get('referral_id');
    
    let query = {};
    if (referral_id) {
      query = { referral_id };
    }
    
    const followUps = await FollowUp.find(query)
      .sort({ follow_date: -1 });
    
    return NextResponse.json({
      success: true,
      data: followUps
    });
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถดึงข้อมูลได้" },
      { status: 500 }
    );
  }
}

// POST - สร้างการติดตามผลใหม่
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // ตรวจสอบว่ามีการส่งต่ออยู่จริง
    const referral = await Referral.findById(body.referral_id);
    if (!referral) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลการส่งต่อ" },
        { status: 404 }
      );
    }
    
    // สร้างการติดตามผลใหม่
    const followUp = new FollowUp({
      referral_id: body.referral_id,
      follow_date: new Date(body.follow_date),
      result: body.result,
      notes: body.notes,
    });
    
    await followUp.save();
    
    // ถ้าการช่วยเหลือเสร็จสิ้น อัปเดตสถานะการส่งต่อ
    if (body.result === "พฤติกรรมดีขึ้น/ปัญหาคลี่คลาย") {
      await Referral.findByIdAndUpdate(body.referral_id, {
        status: "สิ้นสุดการช่วยเหลือ",
        updated_at: new Date()
      });
    }
    
    return NextResponse.json({
      success: true,
      data: followUp
    });
  } catch (error) {
    console.error('Error creating follow-up:', error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถสร้างการติดตามผลได้" },
      { status: 500 }
    );
  }
}
