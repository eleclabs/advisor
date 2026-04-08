// app/api/student/report/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import Student from "@/models/Student";
import Assessment from "@/models/Assessment";
import Problem from "@/models/Problem";
import { Referral } from "@/models/Send";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all students
    const students = await Student.find({});

    // Initialize counters
    let normalCount = 0;
    let riskCount = 0;
    let riskBehaviorCount = 0;
    let familyProblemCount = 0;
    let lowIncomeCount = 0;
    let problemSolvedCount = 0;
    let referredCount = 0;

    // Count student categories based on assessment data
    for (const student of students) {
      // Get SDQ assessments for this student
      const sdqAssessments = await Assessment.find({
        studentId: student.id,
        assessmentType: 'sdq'
      }).sort({ assessmentDate: -1 }).limit(1);

      if (sdqAssessments.length > 0) {
        const latestSDQ = sdqAssessments[0];
        
        // Categorize based on SDQ total score
        if (latestSDQ.sdqScore && latestSDQ.sdqScore.totalScore <= 13) {
          normalCount++;
        } else if (latestSDQ.sdqScore && latestSDQ.sdqScore.totalScore <= 16) {
          riskCount++;
        } else {
          riskBehaviorCount++;
        }
      } else {
        // Default to normal if no assessment
        normalCount++;
      }

      // Check for family problems based on student status or family data
      if (student.family_status && student.family_status.length > 0) {
        familyProblemCount++;
      }

      // Check for economic problems (you might need to adjust this based on your actual data)
      if (student.status && student.status.includes('economic')) {
        lowIncomeCount++;
      }
    }

    // Count all problems (ป้องกันและแก้ไขปัญหา) - นับตามจำนวน id ใน Problem.ts
    problemSolvedCount = await Problem.countDocuments({});

    // Count all referrals (ระบบบริหารการส่งต่อ) - นับตามจำนวน id ใน Send.ts
    referredCount = await Referral.countDocuments({});

    return NextResponse.json({
      totalStudents: students.length,
      normalCount,
      riskCount,
      riskBehaviorCount,
      familyProblemCount,
      lowIncomeCount,
      problemSolvedCount,
      referredCount
    });

  } catch (error) {
    console.error("Error fetching report stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
