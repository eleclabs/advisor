import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import PdcaTask from '@/models/PdcaTask';

// GET all PDCA tasks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear') || '2568';

    const tasks = await PdcaTask.find({ academicYear }).sort({ createdAt: 1 });

    return NextResponse.json({
      success: true,
      data: tasks
    });

  } catch (error) {
    console.error("Error fetching PDCA tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new PDCA task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { phase, task, responsible, startDate, endDate, status, notes } = body;

    if (!phase || !task || !responsible || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const newTask = new PdcaTask({
      phase,
      task,
      responsible,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || 'pending',
      notes: notes || '',
      createdBy: session.user.name || 'Unknown',
      academicYear: body.academicYear || '2568'
    });

    await newTask.save();

    return NextResponse.json({
      success: true,
      data: newTask
    });

  } catch (error) {
    console.error("Error creating PDCA task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
