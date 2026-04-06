import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Assessment from '@/models/Assessment';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get all assessments
    const allAssessments = await Assessment.find({}).sort({ createdAt: -1 });
    
    console.log('🔍 All assessments in database:', allAssessments.length);
    
    // Get SDQ assessments only
    const sdqAssessments = await Assessment.find({ assessmentType: 'sdq' });
    console.log('📊 SDQ assessments:', sdqAssessments.length);
    
    // Get DASS-21 assessments only
    const dass21Assessments = await Assessment.find({ assessmentType: 'dass21' });
    console.log('🧠 DASS-21 assessments:', dass21Assessments.length);
    
    return NextResponse.json({
      success: true,
      total: allAssessments.length,
      sdq: sdqAssessments.length,
      dass21: dass21Assessments.length,
      all: allAssessments.map(a => ({
        id: a._id,
        studentId: a.studentId,
        studentName: a.studentName,
        assessmentType: a.assessmentType,
        createdAt: a.createdAt
      }))
    });
    
  } catch (error: any) {
    console.error('❌ Debug error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
