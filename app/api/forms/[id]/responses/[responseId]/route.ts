// app/api/forms/[id]/responses/[responseId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FormResponse from "@/models/FormResponse";
import Form from "@/models/Form";

// GET - ดึงข้อมูลการตอบแบบฟอร์มเฉพาะ ID ที่ระบุ
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  try {
    await connectDB();
    const { id, responseId } = await params;

    const response = await FormResponse.findOne({ _id: responseId, formId: id })
      .populate('userId', 'first_name last_name email role gender birthDate')
      .populate('formId', 'title description category questions');

    if (!response) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลการตอบแบบฟอร์ม' },
        { status: 404 }
      );
    }

    // จัดกลุ่มคำตอบตามส่วน (section)
    const answersBySection: any = {};
    const form = response.formId as any;
    
    // สร้างกลุ่มส่วนต่างๆ
    form.questions.forEach((question: any) => {
      const sectionTitle = question.sectionTitle || 'คำถามทั่วไป';
      const sectionOrder = question.sectionOrder || 0;
      
      if (!answersBySection[sectionTitle]) {
        answersBySection[sectionTitle] = {
          order: sectionOrder,
          questions: []
        };
      }
    });

    // จัดเรียงคำตอบตามส่วน
    response.answers.forEach((answer: any) => {
      const sectionTitle = answer.sectionTitle || 'คำถามทั่วไป';
      
      if (answersBySection[sectionTitle]) {
        answersBySection[sectionTitle].questions.push({
          ...answer.toObject(),
          userAnswer: answer.answer
        });
      }
    });

    // เรียงลำดับส่วนตาม order
    const sortedSections = Object.entries(answersBySection)
      .sort(([,a]: any, [,b]: any) => a.order - b.order)
      .reduce((acc: any, [key, value]: any) => {
        acc[key] = value;
        return acc;
      }, {});

    // วิเคราะห์คะแนน (ถ้ามีคำถามแบบ scale)
    const scoreAnalysis: any = {
      totalScore: 0,
      averageScore: 0,
      scoreDistribution: {
        excellent: 0, // 4.5-5
        good: 0,      // 3.5-4.4
        average: 0,   // 2.5-3.4
        poor: 0       // 0-2.4
      },
      sectionScores: {} as any
    };

    let totalScaleQuestions = 0;
    let totalScaleScore = 0;

    // วิเคราะห์คะแนนตามส่วน
    Object.entries(sortedSections).forEach(([sectionTitle, sectionData]: any) => {
      let sectionTotal = 0;
      let sectionCount = 0;
      
      sectionData.questions.forEach((question: any) => {
        if (question.questionType === 'scale' && typeof question.userAnswer === 'number') {
          const score = question.userAnswer;
          sectionTotal += score;
          sectionCount++;
          totalScaleScore += score;
          totalScaleQuestions++;
          
          // จัดประเภทคะแนน
          if (score >= 4.5) scoreAnalysis.scoreDistribution.excellent++;
          else if (score >= 3.5) scoreAnalysis.scoreDistribution.good++;
          else if (score >= 2.5) scoreAnalysis.scoreDistribution.average++;
          else scoreAnalysis.scoreDistribution.poor++;
        }
      });
      
      if (sectionCount > 0) {
        scoreAnalysis.sectionScores[sectionTitle] = {
          average: (sectionTotal / sectionCount).toFixed(2),
          count: sectionCount
        };
      }
    });

    if (totalScaleQuestions > 0) {
      scoreAnalysis.totalScore = totalScaleScore;
      scoreAnalysis.averageScore = (totalScaleScore / totalScaleQuestions).toFixed(2);
    }

    return NextResponse.json({
      success: true,
      data: {
        response,
        answersBySection: sortedSections,
        scoreAnalysis,
        metadata: {
          totalQuestions: response.answers.length,
          scaleQuestions: totalScaleQuestions,
          completionRate: 100 // สมมติว่าทำเสร็จเสมอ
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching form response analysis:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - ลบข้อมูลการตอบแบบฟอร์ม
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  try {
    await connectDB();
    const { id, responseId } = await params;

    const response = await FormResponse.findOneAndDelete({ _id: responseId, formId: id });

    if (!response) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลการตอบแบบฟอร์ม' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ลบข้อมูลการตอบแบบฟอร์มสำเร็จ'
    });
  } catch (error: any) {
    console.error('❌ Error deleting form response:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
