// app/api/forms/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Form from "@/models/Form";

// GET - ดึงข้อมูลแบบฟอร์ม
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    console.log('🔍 API: Looking for form with ID:', id);

    const form = await Form.findById(id)
      .populate('createdBy', 'first_name last_name role');

    console.log('📋 API: Form found:', !!form);

    if (!form) {
      console.log('❌ API: Form not found');
      return NextResponse.json(
        { success: false, message: 'ไม่พบแบบฟอร์ม' },
        { status: 404 }
      );
    }

    console.log('✅ API: Form loaded:', form.title);
    
    // ✅ ส่งข้อมูลทั้งหมด - ถ้ามี formStructure ให้ใช้ข้อมูลนั้น ถ้าไม่มีให้ใช้ questions
    const responseData = {
      ...form.toObject(),
      // ถ้ามี formStructure ให้ใช้ข้อมูลนั้น
      hasFormStructure: !!(form as any).formStructure,
      formStructure: (form as any).formStructure || null
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error: any) {
    console.error('❌ API Error fetching form:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
