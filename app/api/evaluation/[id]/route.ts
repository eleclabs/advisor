import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Evaluation from '@/models/Evaluation';
import User from '@/models/User';

// GET - ดึงข้อมูลการประเมินตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Evaluation ID is required' 
      }, { status: 400 });
    }

    const evaluation = await Evaluation.findById(id)
      .populate('userId', 'first_name last_name role email')
      .lean();

    if (!evaluation) {
      return NextResponse.json({ 
        success: false, 
        error: 'Evaluation not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      evaluation: evaluation 
    });
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch evaluation' 
    }, { status: 500 });
  }
}

// DELETE - ลบข้อมูลการประเมินตาม ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Evaluation ID is required' 
      }, { status: 400 });
    }

    const evaluation = await Evaluation.findByIdAndDelete(id);

    if (!evaluation) {
      return NextResponse.json({ 
        success: false, 
        error: 'Evaluation not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Evaluation deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete evaluation' 
    }, { status: 500 });
  }
}
