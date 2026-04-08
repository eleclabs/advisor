// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import User from "@/models/User";
import Student from "@/models/Student";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user counts by role
    const teacherCount = await User.countDocuments({ role: "TEACHER" });
    const adminCount = await User.countDocuments({ role: "ADMIN" });
    const executiveCount = await User.countDocuments({ role: "EXECUTIVE" });
    const committeeCount = await User.countDocuments({ role: "COMMITTEE" });

    // Get student count
    const studentCount = await Student.countDocuments();

    return NextResponse.json({
      studentCount,
      teacherCount,
      adminCount,
      executiveCount,
      committeeCount,
      totalUsers: teacherCount + adminCount + executiveCount + committeeCount
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
