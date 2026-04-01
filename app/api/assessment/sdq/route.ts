import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Assessment from "@/models/Assessment";

// GET - ดึงข้อมูลการประเมิน SDQ ทั้งหมด
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const assessments = await Assessment.find({ 
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
    console.error('Error fetching SDQ assessments:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// SDQ Scoring Functions
function calculateEmotionalScore(answers: any): number {
  const emotionalQuestions = ['sdq3', 'sdq8', 'sdq13', 'sdq16', 'sdq24'];
  return emotionalQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculateConductScore(answers: any): number {
  const conductQuestions = ['sdq5', 'sdq7', 'sdq12', 'sdq18', 'sdq22'];
  return conductQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculateHyperactivityScore(answers: any): number {
  const hyperactivityQuestions = ['sdq2', 'sdq10', 'sdq15', 'sdq21', 'sdq25'];
  return hyperactivityQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculatePeerScore(answers: any): number {
  const peerQuestions = ['sdq6', 'sdq11', 'sdq14', 'sdq19', 'sdq23'];
  return peerQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculateProsocialScore(answers: any): number {
  const prosocialQuestions = ['sdq1', 'sdq4', 'sdq9', 'sdq17', 'sdq20'];
  return prosocialQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}
