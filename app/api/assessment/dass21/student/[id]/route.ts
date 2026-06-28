import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Assessment from "@/models/Assessment";

// GET - ดึงข้อมูลการประเมิน DASS-21 ของผู้เรียนคนเดียว
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    console.log('🔍 Fetching DASS-21 assessments for student:', id);

    const studentId = id;

    const assessments = await Assessment.find({
      studentId: studentId,
      assessmentType: 'dass21'
    })
    .sort({ createdAt: -1 });

    const processedAssessments = assessments.map(assessment => {
      const answers = assessment.answers || {};
      
      // ✅ คำนวณคะแนน DASS-21 (คะแนนดิบ)
      const depressionScore = calculateDepressionScore(answers);
      const anxietyScore = calculateAnxietyScore(answers);
      const stressScore = calculateStressScore(answers);
      
      // ✅ กำหนดระดับตามรูป
      const depressionLevel = getDepressionLevel(depressionScore);
      const anxietyLevel = getAnxietyLevel(anxietyScore);
      const stressLevel = getStressLevel(stressScore);

      return {
        _id: assessment._id,
        studentId: assessment.studentId,
        studentName: assessment.studentName,
        grade: assessment.grade,
        classroom: assessment.classroom,
        answers: answers,
        depressionScore,
        anxietyScore,
        stressScore,
        depressionLevel,
        anxietyLevel,
        stressLevel,
        submittedAt: assessment.createdAt,
        submittedBy: 'ระบบ'
      };
    });

    return NextResponse.json({
      success: true,
      data: processedAssessments,
      count: processedAssessments.length
    });

  } catch (error: any) {
    console.error('❌ Error fetching DASS-21 assessments:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ✅ DASS-21 Scoring Functions (คะแนนดิบ)
function calculateDepressionScore(answers: any): number {
  const questions = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'];
  return questions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculateAnxietyScore(answers: any): number {
  const questions = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'];
  return questions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculateStressScore(answers: any): number {
  const questions = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];
  return questions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

// ✅ เกณฑ์ตามรูป 33674
function getDepressionLevel(score: number): string {
  if (score <= 4) return 'ปกติ';
  if (score <= 6) return 'ต่ำ';
  if (score <= 10) return 'ปานกลาง';
  if (score <= 13) return 'รุนแรง';
  return 'รุนแรงที่สุด';
}

function getAnxietyLevel(score: number): string {
  if (score <= 3) return 'ปกติ';
  if (score <= 5) return 'ต่ำ';
  if (score <= 7) return 'ปานกลาง';
  if (score <= 9) return 'รุนแรง';
  return 'รุนแรงที่สุด';
}

function getStressLevel(score: number): string {
  if (score <= 7) return 'ปกติ';
  if (score <= 9) return 'ต่ำ';
  if (score <= 12) return 'ปานกลาง';
  if (score <= 16) return 'รุนแรง';
  return 'รุนแรงที่สุด';
}