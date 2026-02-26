import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";

// GET /api/interview/[id]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }  // ✅ แก้เป็น Promise
) {
  const { id } = await context.params;  // ✅ await
  console.log(`🚀 GET /api/interview/${id} เริ่มทำงาน`);
  
  try {
    await connectDB();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสนักศึกษา" },
        { status: 400 }
      );
    }

    const student = await Student.findById(id);

    if (!student) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลนักเรียน" },
        { status: 404 }
      );
    }

    const interviewData = {
      student_id: student.id || "",
      student_name: `${student.prefix || ''}${student.first_name || ''} ${student.last_name || ''}`.trim(),
      student_nickname: student.nickname || "",
      student_level: student.level || "",
      student_class: student.class_group || "",
      student_number: student.class_number || "",
      
      semester: student.semester || "",
      academic_year: student.academic_year || "",
      parent_name: student.parent_name || "",
      parent_relationship: student.parent_relationship || "",
      parent_phone: student.parent_phone || "",
      
      family_status: student.family_status || [],
      living_with: student.living_with || "",
      living_with_other: student.living_with_other || "",
      housing_type: student.housing_type || "",
      housing_type_other: student.housing_type_other || "",
      transportation: student.transportation || [],
      
      strengths: student.strengths || "",
      weak_subjects: student.weak_subjects || "",
      hobbies: student.hobbies || "",
      home_behavior: student.home_behavior || "",
      
      chronic_disease: student.chronic_disease || "",
      risk_behaviors: student.risk_behaviors || [],
      parent_concerns: student.parent_concerns || "",
      
      family_income: student.family_income || "",
      daily_allowance: student.daily_allowance || "",
      assistance_needs: student.assistance_needs || [],
      
      student_group: student.student_group || "ปกติ",
      help_guidelines: student.help_guidelines || "",
      home_visit_file: student.home_visit_file || "",
      created_at: student.created_at || "",
      updated_at: student.updated_at || "",
    };

    return NextResponse.json({ 
      success: true, 
      data: interviewData 
    });

  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/interview/[id]
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }  // ✅ แก้เป็น Promise
) {
  const { id } = await context.params;  // ✅ await
  console.log(`🚀 POST /api/interview/${id} เริ่มทำงาน`);
  
  try {
    await connectDB();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสนักศึกษา" },
        { status: 400 }
      );
    }

    const data = await req.json();
    console.log("📝 ข้อมูลที่ได้รับ:", data);

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        semester: data.semester,
        academic_year: data.academic_year,
        parent_name: data.parent_name,
        parent_relationship: data.parent_relationship,
        parent_phone: data.parent_phone,
        
        family_status: data.family_status,
        living_with: data.living_with,
        living_with_other: data.living_with_other,
        housing_type: data.housing_type,
        housing_type_other: data.housing_type_other,
        transportation: data.transportation,
        
        strengths: data.strengths,
        weak_subjects: data.weak_subjects,
        hobbies: data.hobbies,
        home_behavior: data.home_behavior,
        
        chronic_disease: data.chronic_disease,
        risk_behaviors: data.risk_behaviors,
        parent_concerns: data.parent_concerns,
        
        family_income: data.family_income,
        daily_allowance: data.daily_allowance,
        assistance_needs: data.assistance_needs,
        
        student_group: data.student_group,
        help_guidelines: data.help_guidelines,
        home_visit_file: data.home_visit_file,
        
        updated_at: new Date().toISOString(),
      },
      { new: true }
    );

    if (!updatedStudent) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลนักเรียน" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedStudent,
      message: "บันทึกข้อมูลสำเร็จ" 
    });

  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT เหมือน POST
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return POST(req, context);
}