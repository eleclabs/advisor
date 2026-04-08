import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: studentId } = await params;
    
    // Find student by ID field (not MongoDB _id)
    const student = await Student.findOne({ id: studentId });
    
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: student
    });
    
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student data' },
      { status: 500 }
    );
  }
}
