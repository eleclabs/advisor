import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import PdcaTask from '@/models/PdcaTask';

// PUT update PDCA task
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const updatedTask = await PdcaTask.findByIdAndUpdate(
      id,
      {
        phase,
        task,
        responsible,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'pending',
        notes: notes || ''
      },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTask
    });

  } catch (error) {
    console.error("Error updating PDCA task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE PDCA task
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const deletedTask = await PdcaTask.findByIdAndDelete(id);

    if (!deletedTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting PDCA task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
