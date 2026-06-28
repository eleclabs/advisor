import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Assessment from '@/models/Assessment';
import Student from '@/models/Student';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      studentId,
      studentName,
      grade,
      classroom,
      gender,
      age,
      assessmentType,
      sdqScore,
      dass21Score,
      answers
    } = body;

    if (!studentName || !assessmentType) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate studentId - must be a valid student.id from Student model
    let finalStudentId = studentId;
    if (studentId) {
      // Check if student exists by id field
      const student = await Student.findOne({ id: studentId });
      if (!student) {
        return NextResponse.json({
          success: false,
          error: `ไม่พบผู้เรียนที่มีรหัส "${studentId}"`
        }, { status: 404 });
      }
      finalStudentId = student.id; // Use student.id directly
      console.log(`✅ Using student.id: "${finalStudentId}"`);
    }

    const assessmentData = {
      studentId: finalStudentId,
      studentName,
      grade,
      classroom,
      gender,
      age,
      assessmentType,
      sdqScore: assessmentType === 'sdq' ? sdqScore : null,
      dass21Score: assessmentType === 'dass21' ? dass21Score : null,
      answers,
      assessmentDate: new Date()
    };

    const assessment = await Assessment.create(assessmentData);

    return NextResponse.json({ success: true, assessment }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating assessment:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create assessment',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const assessmentType = searchParams.get('type');

    let filter: any = {};
    if (studentId) {
      // Use student.id directly
      filter.studentId = studentId;
    }
    if (assessmentType) filter.assessmentType = assessmentType;

    const assessments = await Assessment.find(filter).sort({ assessmentDate: -1 });

    return NextResponse.json({ success: true, assessments });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}