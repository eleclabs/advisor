import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Assessment from "@/models/Assessment";

// GET - ดึงข้อมูลการประเมิน SDQ สำหรับนักเรียนคนเดียว (จากหน้า results)
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
      assessmentType: 'sdq'
    })
    .sort({ createdAt: -1 })
    .limit(1);

    if (!assessment) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "ไม่พบข้อมูลการประเมิน SDQ"
      });
    }

    // คำนวณคะแนน
    const answers = assessment.answers || {};
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
    
    return NextResponse.json({
      success: true,
      data: {
        _id: assessment._id,
        student_id: assessment.student_id,
        studentName: assessment.studentName,
        totalScore: totalScore,
        emotionalScore,
        conductScore,
        hyperactivityScore,
        peerScore,
        prosocialScore,
        overallRisk,
        submittedAt: assessment.createdAt,
        answers: assessment.answers
      }
    });

  } catch (error: any) {
    console.error('Error fetching SDQ result:', error);
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
