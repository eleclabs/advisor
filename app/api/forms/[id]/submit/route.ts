// app/api/forms/[id]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
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

    const { formId, userId, userName, userRole, answers } = body;

    // ตรวจสอบว่าแบบฟอร์มมีอยู่และ active
    const form = await Form.findById(formId || id);
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
    const answeredIds = answers.map((a: any) => a.questionOrder);
    
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

    // ดึงข้อมูลผู้ใช้เพิ่มเติมจาก userId ถ้ามี
    let userEmail = '';
    let userGender = '';
    let userAgeRange = '';
    let userBirthDate = '';
    
    if (userId) {
      try {
        const User = mongoose.model('User');
        const user = await User.findById(userId);
        if (user) {
          userEmail = user.email || '';
          userGender = user.gender || '';
          userBirthDate = user.birthDate || user.dob || user.date_of_birth || '';
          
          // คำนวณช่วงอายุ
          if (userBirthDate) {
            const birth = new Date(userBirthDate);
            const today = new Date();
            const age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? age - 1 : age;
            
            if (actualAge < 20) userAgeRange = 'under-20';
            else if (actualAge <= 30) userAgeRange = '20-30';
            else if (actualAge <= 40) userAgeRange = '31-40';
            else if (actualAge <= 50) userAgeRange = '41-50';
            else userAgeRange = 'over-50';
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    // บันทึกคำตอบพร้อมข้อมูลผู้ใช้
    const response = await FormResponse.create({
      formId: formId || id,
      userId: userId || null,
      userName,
      userEmail,
      userRole,
      userGender,
      userAgeRange,
      userBirthDate,
      answers: answers.map((a: any) => ({
        questionId: a.questionOrder,
        questionText: a.questionText,
        questionType: a.questionType,
        answer: a.answer,
        sectionId: a.sectionId,
        sectionTitle: a.sectionTitle,
        sectionOrder: a.sectionOrder
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