import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Assessment from "@/models/Assessment";

// GET - ดึงข้อมูลการประเมิน SDQ ทั้งหมดหรือตาม student_id
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    
    let query: { assessmentType: string; studentId?: string } = { assessmentType: 'sdq' };
    if (studentId) {
      query.studentId = studentId;
    }
    
    const assessments = await Assessment.find(query)
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
      const totalScore = emotionalScore + conductScore + hyperactivityScore + peerScore; // Exclude prosocial from total
      
      // กำหนดระดับความเสี่ยง
      let overallRisk = 'normal';
      if (totalScore >= 20) overallRisk = 'high';
      else if (totalScore >= 16) overallRisk = 'medium';
      else if (totalScore >= 11) overallRisk = 'low';
      // If score is below 11, it remains 'normal'

      return {
        _id: assessment._id,
        studentId: assessment.studentId,
        studentName: assessment.studentName,
        grade: assessment.grade,
        classroom: assessment.classroom,
        answers: answers,
        totalScore, // Add totalScore directly like student filter expects
        sdqScore: {
          totalScore,
          interpretation: overallRisk === 'normal' ? 'ปกติ' : 
                     overallRisk === 'low' ? 'เสี่ยง' : 
                     overallRisk === 'medium' ? 'คาบเกี่ยว' : 'มีปัญหา'
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
  const reversedItems = ['sdq16', 'sdq24'];
  return emotionalQuestions.reduce((sum, q) => {
    const answer = parseInt(answers[q] || '0');
    return sum + (reversedItems.includes(q) ? (2 - answer) : answer);
  }, 0);
}

function calculateConductScore(answers: any): number {
  const conductQuestions = ['sdq5', 'sdq7', 'sdq12', 'sdq18', 'sdq22'];
  const reversedItems = ['sdq7', 'sdq12'];
  return conductQuestions.reduce((sum, q) => {
    const answer = parseInt(answers[q] || '0');
    return sum + (reversedItems.includes(q) ? (2 - answer) : answer);
  }, 0);
}

function calculateHyperactivityScore(answers: any): number {
  const hyperactivityQuestions = ['sdq2', 'sdq10', 'sdq15', 'sdq21', 'sdq25'];
  const reversedItems = ['sdq25'];
  return hyperactivityQuestions.reduce((sum, q) => {
    const answer = parseInt(answers[q] || '0');
    return sum + (reversedItems.includes(q) ? (2 - answer) : answer);
  }, 0);
}

function calculatePeerScore(answers: any): number {
  const peerQuestions = ['sdq6', 'sdq11', 'sdq14', 'sdq19'];
  const reversedItems = ['sdq11', 'sdq14'];
  return peerQuestions.reduce((sum, q) => {
    const answer = parseInt(answers[q] || '0');
    return sum + (reversedItems.includes(q) ? (2 - answer) : answer);
  }, 0);
}

function calculateProsocialScore(answers: any): number {
  const prosocialQuestions = ['sdq1', 'sdq4', 'sdq9', 'sdq17', 'sdq20'];
  const reversedItems = ['sdq1', 'sdq4', 'sdq9', 'sdq17', 'sdq20']; // All prosocial items are reversed
  return prosocialQuestions.reduce((sum, q) => {
    const answer = parseInt(answers[q] || '0');
    return sum + (reversedItems.includes(q) ? (2 - answer) : answer);
  }, 0);
}
