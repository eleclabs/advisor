import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/Student";

// GET - ดึงข้อมูลการสัมภาษณ์นักเรียนทั้งหมดหรือตาม student_id
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    
    let query = {};
    if (studentId) {
      query = { _id: studentId };
    }
    
    const students = await Student.find(query)
      .select('id prefix first_name last_name parent_name parent_phone parent_concerns family_status living_with housing_type transportation strengths hobbies home_behavior chronic_disease risk_behaviors family_income daily_allowance assistance_needs student_group help_guidelines created_at updated_at')
      .sort({ created_at: -1 });

    // จัดรูปแบบข้อมูลการสัมภาษณ์
    const interviewData = students.map(student => ({
      _id: student._id,
      student_id: student.id,
      student_name: `${student.prefix} ${student.first_name} ${student.last_name}`,
      parent_name: student.parent_name,
      parent_phone: student.parent_phone,
      parent_concerns: student.parent_concerns,
      family_status: student.family_status,
      living_with: student.living_with,
      housing_type: student.housing_type,
      transportation: student.transportation,
      strengths: student.strengths,
      hobbies: student.hobbies,
      home_behavior: student.home_behavior,
      chronic_disease: student.chronic_disease,
      risk_behaviors: student.risk_behaviors,
      family_income: student.family_income,
      daily_allowance: student.daily_allowance,
      assistance_needs: student.assistance_needs,
      student_group: student.student_group,
      help_guidelines: student.help_guidelines,
      created_at: student.created_at,
      updated_at: student.updated_at
    }));

    return NextResponse.json({
      success: true,
      data: studentId ? (interviewData[0] || null) : interviewData
    });

  } catch (error) {
    console.error('Error fetching interview data:', error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลการสัมภาษณ์" },
      { status: 500 }
    );
  }
}
