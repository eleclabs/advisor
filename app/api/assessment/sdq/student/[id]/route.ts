import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Assessment from "@/models/Assessment";

// GET - ดึงข้อมูลการประเมิน SDQ ของผู้เรียนคนเดียว
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    console.log('🔍 Fetching SDQ assessments for student:', id);

    const studentId = id;

    const assessments = await Assessment.find({
      studentId: studentId,
      assessmentType: 'sdq'
    })
    .sort({ createdAt: -1 });

    const processedAssessments = assessments.map(assessment => {
      const answers = assessment.answers || {};
      
      // ✅ คำนวณคะแนน SDQ ตามรูป
      const emotionalScore = calculateEmotionalScore(answers);
      const conductScore = calculateConductScore(answers);
      const hyperactivityScore = calculateHyperactivityScore(answers);
      const peerScore = calculatePeerScore(answers);
      const prosocialScore = calculateProsocialScore(answers);
      
      // ✅ คะแนนรวม = 4 ด้านปัญหา (ไม่รวม prosocial)
      const totalScore = emotionalScore + conductScore + hyperactivityScore + peerScore;
      
      // ✅ เกณฑ์ตามรูป: ปกติ 0-16, เสี่ยง 17-18, มีปัญหา 19-40
      let overallRisk = 'ปกติ';
      if (totalScore >= 19) overallRisk = 'มีปัญหา';
      else if (totalScore >= 17) overallRisk = 'เสี่ยง';

      return {
        _id: assessment._id,
        studentId: assessment.studentId,
        studentName: assessment.studentName,
        grade: assessment.grade,
        classroom: assessment.classroom,
        answers: answers,
        totalScore,
        emotionalScore,
        conductScore,
        hyperactivityScore,
        peerScore,
        prosocialScore,
        overallRisk,
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
    console.error('❌ Error fetching SDQ assessments:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ✅ SDQ Scoring Functions ตามรูป
function calculateEmotionalScore(answers: any): number {
  const questions = ['sdq3', 'sdq8', 'sdq13', 'sdq16', 'sdq24'];
  return questions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculateConductScore(answers: any): number {
  const questions = ['sdq5', 'sdq7', 'sdq12', 'sdq18', 'sdq22'];
  const reversed = ['sdq7', 'sdq12'];
  return questions.reduce((sum, q) => {
    const score = parseInt(answers[q] || '0');
    return sum + (reversed.includes(q) ? (2 - score) : score);
  }, 0);
}

function calculateHyperactivityScore(answers: any): number {
  const questions = ['sdq2', 'sdq10', 'sdq15', 'sdq21', 'sdq25'];
  const reversed = ['sdq15', 'sdq21', 'sdq25'];
  return questions.reduce((sum, q) => {
    const score = parseInt(answers[q] || '0');
    return sum + (reversed.includes(q) ? (2 - score) : score);
  }, 0);
}

function calculatePeerScore(answers: any): number {
  const questions = ['sdq6', 'sdq11', 'sdq14', 'sdq19', 'sdq23'];
  const reversed = ['sdq11', 'sdq14'];
  return questions.reduce((sum, q) => {
    const score = parseInt(answers[q] || '0');
    return sum + (reversed.includes(q) ? (2 - score) : score);
  }, 0);
}

function calculateProsocialScore(answers: any): number {
  const questions = ['sdq1', 'sdq4', 'sdq9', 'sdq17', 'sdq20'];
  return questions.reduce((sum, q) => {
    const score = parseInt(answers[q] || '0');
    return sum + (2 - score);
  }, 0);
}