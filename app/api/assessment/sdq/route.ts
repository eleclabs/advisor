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
      
      // ✅ คำนวณคะแนน SDQ ตามรูป
      const emotionalScore = calculateEmotionalScore(answers);
      const conductScore = calculateConductScore(answers);
      const hyperactivityScore = calculateHyperactivityScore(answers);
      const peerScore = calculatePeerScore(answers);
      const prosocialScore = calculateProsocialScore(answers);
      
      // ✅ คะแนนรวม = 4 ด้านปัญหา (ไม่รวม prosocial) ตามรูป
      const totalScore = emotionalScore + conductScore + hyperactivityScore + peerScore;
      
      // ✅ เกณฑ์ตามรูป: ปกติ 0-16, เสี่ยง 17-18, มีปัญหา 19-40
      let interpretation = 'ปกติ';
      if (totalScore >= 19) interpretation = 'มีปัญหา';
      else if (totalScore >= 17) interpretation = 'เสี่ยง';

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
        sdqScore: {
          totalScore,
          interpretation
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

// ✅ SDQ Scoring Functions ตามรูป
function calculateEmotionalScore(answers: any): number {
  // ข้อ 3, 8, 13, 16, 24
  const questions = ['sdq3', 'sdq8', 'sdq13', 'sdq16', 'sdq24'];
  return questions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculateConductScore(answers: any): number {
  // ข้อ 5, 7, 12, 18, 22
  const questions = ['sdq5', 'sdq7', 'sdq12', 'sdq18', 'sdq22'];
  // ข้อ 7, 12 เป็นข้อกลับ (reverse scoring)
  const reversed = ['sdq7', 'sdq12'];
  return questions.reduce((sum, q) => {
    const score = parseInt(answers[q] || '0');
    return sum + (reversed.includes(q) ? (2 - score) : score);
  }, 0);
}

function calculateHyperactivityScore(answers: any): number {
  // ข้อ 2, 10, 15, 21, 25
  const questions = ['sdq2', 'sdq10', 'sdq15', 'sdq21', 'sdq25'];
  // ข้อ 15, 21, 25 เป็นข้อกลับ (reverse scoring)
  const reversed = ['sdq15', 'sdq21', 'sdq25'];
  return questions.reduce((sum, q) => {
    const score = parseInt(answers[q] || '0');
    return sum + (reversed.includes(q) ? (2 - score) : score);
  }, 0);
}

function calculatePeerScore(answers: any): number {
  // ข้อ 6, 11, 14, 19, 23
  const questions = ['sdq6', 'sdq11', 'sdq14', 'sdq19', 'sdq23'];
  // ข้อ 11, 14 เป็นข้อกลับ (reverse scoring)
  const reversed = ['sdq11', 'sdq14'];
  return questions.reduce((sum, q) => {
    const score = parseInt(answers[q] || '0');
    return sum + (reversed.includes(q) ? (2 - score) : score);
  }, 0);
}

function calculateProsocialScore(answers: any): number {
  // ข้อ 1, 4, 9, 17, 20
  const questions = ['sdq1', 'sdq4', 'sdq9', 'sdq17', 'sdq20'];
  // ✅ ทุกข้อเป็นข้อกลับ (reverse scoring) ตามรูป
  return questions.reduce((sum, q) => {
    const score = parseInt(answers[q] || '0');
    return sum + (2 - score);
  }, 0);
}