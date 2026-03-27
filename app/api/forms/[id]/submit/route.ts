// app/api/forms/[id]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Form from "@/models/Form";
import FormResponse from "@/models/FormResponse";

// POST - ส่งคำตอบแบบฟอร์ม
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const { answers, userName, userEmail, userRole, userId } = body;

    // ตรวจสอบว่าแบบฟอร์มมีอยู่และ active
    const form = await Form.findById(id);
    if (!form) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบแบบฟอร์ม' },
        { status: 404 }
      );
    }

    if (form.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'แบบฟอร์มนี้ยังไม่เปิดใช้งาน' },
        { status: 403 }
      );
    }

    // ตรวจสอบคำตอบครบทุกข้อที่ required
    const requiredQuestions = form.questions.filter((q: any) => q.required);
    const answeredIds = answers.map((a: any) => a.questionId);
    
    const missingQuestions = requiredQuestions.filter(
      (q: any) => !answeredIds.includes(q.order)
    );

    if (missingQuestions.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `กรุณาตอบคำถามให้ครบทุกข้อ (${missingQuestions.length} ข้อที่ยังไม่ได้ตอบ)` 
        },
        { status: 400 }
      );
    }

    // บันทึกคำตอบ
    const response = await FormResponse.create({
      formId: id,
      userId: userId || null,
      userName,
      userEmail,
      userRole,
      answers: answers.map((a: any) => ({
        questionId: a.questionId,
        questionText: a.questionText,
        answer: a.answer
      }))
    });

    console.log('✅ Form response saved:', response._id);

    return NextResponse.json({
      success: true,
      data: response,
      message: 'ส่งแบบฟอร์มสำเร็จ'
    });
  } catch (error: any) {
    console.error('❌ Error submitting form:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// GET - ดึงข้อมูลแบบฟอร์มสำหรับทำ
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const form = await Form.findById(id)
      .populate('createdBy', 'first_name last_name role');

    if (!form) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบแบบฟอร์ม' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: form
    });
  } catch (error: any) {
    console.error('❌ Error fetching form:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}