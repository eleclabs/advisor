import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Assessment from "@/models/Assessment";

// GET - ดึงข้อมูลการประเมิน DASS-21 ของนักเรียนคนเดียว
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    console.log('🔍 Fetching DASS-21 assessments for student:', id);

    // ดึงข้อมูลการประเมิน DASS-21 ของนักเรียนคนเดียว
    const assessments = await Assessment.find({ 
      studentId: id,
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
      const depressionLevel = getDASS21Level(depressionScore, 'depression');
      const anxietyLevel = getDASS21Level(anxietyScore, 'anxiety');
      const stressLevel = getDASS21Level(stressScore, 'stress');

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

// ฟังก์ชันคำนวณคะแนน DASS-21
function calculateDepressionScore(answers: any) {
  const depressionQuestions = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'];
  return depressionQuestions.reduce((sum, q) => {
    return sum + parseInt(answers[q] || '0');
  }, 0) * 2; // คูณด้วย 2
}

function calculateAnxietyScore(answers: any) {
  const anxietyQuestions = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'];
  return anxietyQuestions.reduce((sum, q) => {
    return sum + parseInt(answers[q] || '0');
  }, 0) * 2; // คูณด้วย 2
}

function calculateStressScore(answers: any) {
  const stressQuestions = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];
  return stressQuestions.reduce((sum, q) => {
    return sum + parseInt(answers[q] || '0');
  }, 0) * 2; // คูณด้วย 2
}

function getDASS21Level(score: number, type: string) {
  const levels: Record<string, { normal: number; mild: number; moderate: number; severe: number }> = {
    depression: { normal: 9, mild: 13, moderate: 20, severe: 27 },
    anxiety: { normal: 7, mild: 9, moderate: 14, severe: 19 },
    stress: { normal: 14, mild: 18, moderate: 25, severe: 33 }
  };
  
  const level = levels[type];
  if (score <= level.normal) return 'ปกติ';
  if (score <= level.mild) return 'เบา';
  if (score <= level.moderate) return 'ปานกลาง';
  if (score <= level.severe) return 'รุนแรง';
  return 'รุนแรงมาก';
}
