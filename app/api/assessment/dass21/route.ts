import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Assessment from "@/models/Assessment";

// GET - ดึงข้อมูลการประเมิน DASS-21 ทั้งหมด
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const assessments = await Assessment.find({ 
      assessmentType: 'dass21'
    })
    .sort({ createdAt: -1 });

    // คำนวณคะแนนและจัดกลุ่ม
    const processedAssessments = assessments.map(assessment => {
      const answers = assessment.answers || {};
      
      // คำนวณคะแนน DASS-21
      const depressionScore = calculateDepressionScore(answers);
      const anxietyScore = calculateAnxietyScore(answers);
      const stressScore = calculateStressScore(answers);
      
      // กำหนดระดับความรุนแรง
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
    console.error('Error fetching DASS-21 assessments:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DASS-21 Scoring Functions
function calculateDepressionScore(answers: any): number {
  const depressionQuestions = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'];
  return depressionQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0) * 2;
}

function calculateAnxietyScore(answers: any): number {
  const anxietyQuestions = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'];
  return anxietyQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0) * 2;
}

function calculateStressScore(answers: any): number {
  const stressQuestions = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];
  return stressQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0) * 2;
}

function getDepressionLevel(score: number): string {
  if (score <= 9) return 'ปกติ';
  if (score <= 13) return 'เบา';
  if (score <= 20) return 'ปานกลาง';
  if (score <= 27) return 'รุนแรง';
  return 'รุนแรงมาก';
}

function getAnxietyLevel(score: number): string {
  if (score <= 7) return 'ปกติ';
  if (score <= 9) return 'เบา';
  if (score <= 14) return 'ปานกลาง';
  if (score <= 19) return 'รุนแรง';
  return 'รุนแรงมาก';
}

function getStressLevel(score: number): string {
  if (score <= 14) return 'ปกติ';
  if (score <= 18) return 'เบา';
  if (score <= 25) return 'ปานกลาง';
  if (score <= 33) return 'รุนแรง';
  return 'รุนแรงมาก';
}
