import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Coordination } from "@/models/Send";
import { Referral } from "@/models/Send";

// GET - ดึงข้อมูลการประสานงานทั้งหมด
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const referral_id = searchParams.get('referral_id');
    
    let query = {};
    if (referral_id) {
      query = { referral_id };
    }
    
    const coordinations = await Coordination.find(query)
      .sort({ coordination_date: -1 });
    
    return NextResponse.json({
      success: true,
      data: coordinations
    });
  } catch (error) {
    console.error('Error fetching coordinations:', error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถดึงข้อมูลได้" },
      { status: 500 }
    );
  }
}

// POST - สร้างการประสานงานใหม่
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
    
    // สร้างการประสานงานใหม่
    const coordination = new Coordination({
      referral_id: body.referral_id,
      organization: body.organization,
      contact_person: body.contact_person,
      channel: body.channel,
      details: body.details,
      agreement: body.agreement,
      coordination_date: new Date(body.coordination_date),
    });
    
    await coordination.save();
    
    return NextResponse.json({
      success: true,
      data: coordination
    });
  } catch (error) {
    console.error('Error creating coordination:', error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถสร้างการประสานงานได้" },
      { status: 500 }
    );
  }
}
