import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Assessment from "@/models/Assessment";

// GET - ดึงข้อมูลการประเมิน SDQ ของนักเรียนคนเดียว
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    console.log('🔍 Fetching SDQ assessments for student:', id);

    // ดึงข้อมูลการประเมิน SDQ ของนักเรียนคนเดียว
    const assessments = await Assessment.find({ 
      studentId: id,
      assessmentType: 'sdq'
    })
    .sort({ createdAt: -1 });

    // คำนวณคะแนนและจัดกลุ่ม
    const processedAssessments = assessments.map(assessment => {
      const answers = assessment.answers || {};
      
      // คำนวณคะแนน SDQ
      const emotionalScore = calculateEmotionalScore(answers);
      const conductScore = calculateConductScore(answers);
      const hyperactivityScore = calculateHyperactivityScore(answers);
      const peerScore = calculatePeerScore(answers);
      const prosocialScore = calculateProsocialScore(answers);
      const totalScore = emotionalScore + conductScore + hyperactivityScore + peerScore + prosocialScore;
      
      // กำหนดระดับความเสี่ยง
      let overallRisk = 'normal';
      if (totalScore >= 20) overallRisk = 'high';
      else if (totalScore >= 16) overallRisk = 'medium';
      else if (totalScore >= 11) overallRisk = 'low';

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

// ฟังก์ชันคำนวณคะแนน
function calculateEmotionalScore(answers: any) {
  const emotionalQuestions = ['sdq1', 'sdq2', 'sdq3', 'sdq4', 'sdq6', 'sdq8', 'sdq10', 'sdq13', 'sdq17', 'sdq19'];
  return emotionalQuestions.reduce((sum, q) => {
    const score = parseInt(answers[q] || '0');
    // ข้อที่ต้อง reverse scoring: sdq6, sdq17, sdq19
    const reversed = ['sdq6', 'sdq17', 'sdq19'].includes(q);
    return sum + (reversed ? (2 - score) : score);
  }, 0);
}

function calculateConductScore(answers: any) {
  const conductQuestions = ['sdq5', 'sdq7', 'sdq12', 'sdq14', 'sdq22'];
  return conductQuestions.reduce((sum, q) => {
    const score = parseInt(answers[q] || '0');
    // ข้อที่ต้อง reverse scoring: sdq7, sdq12, sdq14
    const reversed = ['sdq7', 'sdq12', 'sdq14'].includes(q);
    return sum + (reversed ? (2 - score) : score);
  }, 0);
}

function calculateHyperactivityScore(answers: any) {
  const hyperactivityQuestions = ['sdq9', 'sdq15', 'sdq18', 'sdq20', 'sdq21'];
  return hyperactivityQuestions.reduce((sum, q) => {
    const score = parseInt(answers[q] || '0');
    // ข้อที่ต้อง reverse scoring: sdq15, sdq18, sdq20, sdq21
    const reversed = ['sdq15', 'sdq18', 'sdq20', 'sdq21'].includes(q);
    return sum + (reversed ? (2 - score) : score);
  }, 0);
}

function calculatePeerScore(answers: any) {
  const peerQuestions = ['sdq11', 'sdq16', 'sdq23', 'sdq24'];
  return peerQuestions.reduce((sum, q) => {
    const score = parseInt(answers[q] || '0');
    // ข้อที่ต้อง reverse scoring: sdq11, sdq16, sdq23, sdq24
    const reversed = ['sdq11', 'sdq16', 'sdq23', 'sdq24'].includes(q);
    return sum + (reversed ? (2 - score) : score);
  }, 0);
}

function calculateProsocialScore(answers: any) {
  const prosocialQuestions = ['sdq4', 'sdq25'];
  return prosocialQuestions.reduce((sum, q) => {
    const score = parseInt(answers[q] || '0');
    // ข้อที่ต้อง reverse scoring: sdq4, sdq25
    const reversed = ['sdq4', 'sdq25'].includes(q);
    return sum + (reversed ? (2 - score) : score);
  }, 0);
}
