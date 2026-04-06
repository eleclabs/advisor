import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Assessment from "@/models/Assessment";

// GET - ดึงข้อมูลการประเมิน DASS-21 สำหรับนักเรียนคนเดียว (จากหน้า results)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    
    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "ต้องระบุ student_id" },
        { status: 400 }
      );
    }
    
    // ค้นหาการประเมินล่าสุดของนักเรียนคนนี้
    const assessment = await Assessment.findOne({ 
      student_id: studentId,
      assessmentType: 'dass21'
    })
    .sort({ createdAt: -1 })
    .limit(1);

    if (!assessment) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "ไม่พบข้อมูลการประเมิน DASS-21"
      });
    }

    // คำนวณคะแนน
    const answers = assessment.answers || {};
    const depressionScore = calculateDepressionScore(answers);
    const anxietyScore = calculateAnxietyScore(answers);
    const stressScore = calculateStressScore(answers);
    const totalScore = depressionScore + anxietyScore + stressScore;
    
    // กำหนดระดับความรุนแรง
    const depressionLevel = getDepressionLevel(depressionScore);
    const anxietyLevel = getAnxietyLevel(anxietyScore);
    const stressLevel = getStressLevel(stressScore);

    return NextResponse.json({
      success: true,
      data: {
        _id: assessment._id,
        student_id: assessment.student_id,
        studentName: assessment.studentName,
        totalScore: totalScore,
        depressionScore,
        anxietyScore,
        stressScore,
        depressionLevel,
        anxietyLevel,
        stressLevel,
        submittedAt: assessment.createdAt,
        answers: assessment.answers
      }
    });

  } catch (error: any) {
    console.error('Error fetching DASS-21 result:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DASS-21 Scoring Functions
function calculateDepressionScore(answers: any): number {
  const depressionQuestions = ['dass3', 'dass5', 'dass10', 'dass13', 'dass16', 'dass17', 'dass21'];
  return depressionQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculateAnxietyScore(answers: any): number {
  const anxietyQuestions = ['dass2', 'dass4', 'dass7', 'dass9', 'dass15', 'dass19', 'dass20'];
  return anxietyQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculateStressScore(answers: any): number {
  const stressQuestions = ['dass1', 'dass6', 'dass8', 'dass11', 'dass12', 'dass14', 'dass18'];
  return stressQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function getDepressionLevel(score: number): string {
  if (score >= 28) return 'severe';
  if (score >= 21) return 'moderate';
  if (score >= 14) return 'mild';
  if (score >= 10) return 'normal';
  return 'normal';
}

function getAnxietyLevel(score: number): string {
  if (score >= 20) return 'severe';
  if (score >= 15) return 'moderate';
  if (score >= 10) return 'mild';
  if (score >= 8) return 'normal';
  return 'normal';
}

function getStressLevel(score: number): string {
  if (score >= 27) return 'severe';
  if (score >= 19) return 'moderate';
  if (score >= 14) return 'mild';
  if (score >= 11) return 'normal';
  return 'normal';
}
