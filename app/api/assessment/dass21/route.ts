import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Assessment from "@/models/Assessment";

// GET - ดึงข้อมูลการประเมิน DASS-21 ทั้งหมดหรือตาม student_id
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    
    let query: { assessmentType: string; studentId?: string } = { assessmentType: 'dass21' };
    if (studentId) {
      query.studentId = studentId;
    }
    
    const assessments = await Assessment.find(query)
    .sort({ createdAt: -1 });

    const processedAssessments = assessments.map(assessment => {
      const answers = assessment.answers || {};
      
      // ✅ คำนวณคะแนน DASS-21 (คะแนนดิบ ไม่คูณ 2) ตามรูป
      const depressionScore = calculateDepressionScore(answers);
      const anxietyScore = calculateAnxietyScore(answers);
      const stressScore = calculateStressScore(answers);
      
      // ✅ กำหนดระดับความรุนแรงตามรูป 33674
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
        dass21Score: {
          depression: depressionScore,
          depressionLevel,
          anxiety: anxietyScore,
          anxietyLevel,
          stress: stressScore,
          stressLevel
        },
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
    console.error('Error fetching DASS-21 assessments:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ✅ DASS-21 Scoring Functions (คะแนนดิบ ไม่คูณ 2)
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
// Depression: ปกติ 0-4, ต่ำ 5-6, ปานกลาง 7-10, รุนแรง 11-13, รุนแรงที่สุด 14+
function getDepressionLevel(score: number): string {
  if (score <= 4) return 'ปกติ';
  if (score <= 6) return 'ต่ำ';
  if (score <= 10) return 'ปานกลาง';
  if (score <= 13) return 'รุนแรง';
  return 'รุนแรงที่สุด';
}

// Anxiety: ปกติ 0-3, ต่ำ 4-5, ปานกลาง 6-7, รุนแรง 8-9, รุนแรงที่สุด 10+
function getAnxietyLevel(score: number): string {
  if (score <= 3) return 'ปกติ';
  if (score <= 5) return 'ต่ำ';
  if (score <= 7) return 'ปานกลาง';
  if (score <= 9) return 'รุนแรง';
  return 'รุนแรงที่สุด';
}

// Stress: ปกติ 0-7, ต่ำ 8-9, ปานกลาง 10-12, รุนแรง 13-16, รุนแรงที่สุด 17+
function getStressLevel(score: number): string {
  if (score <= 7) return 'ปกติ';
  if (score <= 9) return 'ต่ำ';
  if (score <= 12) return 'ปานกลาง';
  if (score <= 16) return 'รุนแรง';
  return 'รุนแรงที่สุด';
}