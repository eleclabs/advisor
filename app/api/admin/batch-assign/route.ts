// app/api/admin/batch-assign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Student from "@/models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST - มอบหมายนักเรียนหลายคนให้กับครูหลายคนพร้อมกัน
export async function POST(req: NextRequest) {
  console.log("🚀 POST /api/admin/batch-assign เริ่มทำงาน");
  
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const { teacherIds, studentIds } = await req.json();
    
    if (!Array.isArray(teacherIds) || !Array.isArray(studentIds)) {
      return NextResponse.json({ 
        success: false, 
        message: "รูปแบบข้อมูลไม่ถูกต้อง ต้องเป็น array" 
      }, { status: 400 });
    }

    if (teacherIds.length === 0 || studentIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "กรุณาเลือกอย่างน้อย 1 ครู และ 1 นักเรียน" 
      }, { status: 400 });
    }

    await connectDB();
    
    // ตรวจสอบว่า teacherIds มีอยู่จริงและเป็น TEACHER
    const teachers = await User.find({ 
      _id: { $in: teacherIds },
      role: "TEACHER"
    });
    
    if (teachers.length !== teacherIds.length) {
      return NextResponse.json({ 
        success: false, 
        message: "พบครูที่ไม่มีในระบบหรือไม่ใช่บทบาทครู" 
      }, { status: 400 });
    }

    // ตรวจสอบว่า studentIds มีอยู่จริง
    const students = await Student.find({ 
      _id: { $in: studentIds }
    });
    
    if (students.length !== studentIds.length) {
      return NextResponse.json({ 
        success: false, 
        message: "พบนักเรียนที่ไม่มีในระบบ" 
      }, { status: 400 });
    }

    // ดึงข้อมูลนักเรียนทั้งหมดที่ถูกเลือก
    const selectedStudents = students.map(student => ({
      student_id: student._id,
      student_name: `${student.prefix || ''}${student.first_name} ${student.last_name}`.trim(),
      class_number: student.class_number,
      assigned_date: new Date(),
      is_active: true
    }));

    const results = [];
    const errors = [];

    // มอบหมายนักเรียนให้กับแต่ละครู
    for (const teacherId of teacherIds) {
      try {
        // ดึงข้อมูลครูปัจจุบันเพื่อเก็บ assigned_students เดิม
        const currentTeacher = await User.findById(teacherId);
        if (!currentTeacher) {
          errors.push({ teacherId, error: "ไม่พบข้อมูลครู" });
          continue;
        }

        // รวม assigned_students เดิมกับใหม่ โดยไม่ซ้ำกัน
        const existingStudentIds = (currentTeacher.assigned_students || [])
          .map((assignment: any) => assignment.student_id.toString());
        
        const newStudentIds = studentIds.filter(id => !existingStudentIds.includes(id));
        const newAssignments = selectedStudents.filter(assignment => 
          newStudentIds.includes(assignment.student_id.toString())
        );

        // ถ้าไม่มีนักเรียนใหม่ที่จะเพิ่ม ข้ามไป
        if (newAssignments.length === 0) {
          results.push({
            teacherId,
            teacherName: `${currentTeacher.prefix} ${currentTeacher.first_name} ${currentTeacher.last_name}`,
            assignedCount: 0,
            message: "ไม่มีนักเรียนใหม่ที่จะเพิ่ม (ทั้งหมดถูกมอบหมายแล้ว)"
          });
          continue;
        }

        // อัปเดตผู้ใช้ด้วยการรวม assigned_students เดิมและใหม่
        const updatedUser = await User.findByIdAndUpdate(
          teacherId,
          { 
            $push: { 
              assigned_students: { $each: newAssignments }
            }
          },
          { new: true, returnDocument: 'after' }
        );

        if (updatedUser) {
          results.push({
            teacherId,
            teacherName: `${updatedUser.prefix} ${updatedUser.first_name} ${updatedUser.last_name}`,
            assignedCount: newAssignments.length,
            totalAssigned: updatedUser.assigned_students?.length || 0
          });
        } else {
          errors.push({ teacherId, error: "ไม่สามารถอัปเดตข้อมูลครูได้" });
        }
      } catch (error: any) {
        console.error(`Error assigning to teacher ${teacherId}:`, error);
        errors.push({ teacherId, error: error.message });
      }
    }

    console.log(`✅ มอบหมายนักเรียน ${studentIds.length} คน ให้ครู ${results.length} คนสำเร็จ`);

    return NextResponse.json({
      success: true,
      data: {
        totalTeachers: teacherIds.length,
        successCount: results.length,
        errorCount: errors.length,
        results,
        errors
      },
      message: `มอบหมายนักเรียนสำเร็จ ${results.length}/${teacherIds.length} ครู`
    });

  } catch (error: any) {
    console.error("❌ Error in batch assignment:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}

// GET - ดึงข้อมูลการมอบหมายทั้งหมด (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    await connectDB();
    
    // ดึงข้อมูลครูทั้งหมดพร้อม assigned_students
    const teachers = await User.find({ role: "TEACHER" })
      .select('prefix first_name last_name email department assigned_students')
      .populate({
        path: 'assigned_students.student_id',
        select: 'prefix first_name last_name id level class_group class_number',
        model: Student
      });

    const assignmentSummary = teachers.map(teacher => ({
      teacherId: teacher._id,
      teacherName: `${teacher.prefix} ${teacher.first_name} ${teacher.last_name}`,
      email: teacher.email,
      department: teacher.department,
      assignedCount: teacher.assigned_students?.length || 0,
      activeAssignments: teacher.assigned_students?.filter((assignment: any) => assignment.is_active).length || 0,
      students: teacher.assigned_students?.map((assignment: any) => ({
        studentId: assignment.student_id?._id,
        studentName: assignment.student_name,
        studentCode: assignment.student_id?.id,
        level: assignment.student_id?.level,
        class: assignment.student_id?.class_group,
        classNumber: assignment.student_id?.class_number,
        assignedDate: assignment.assigned_date,
        isActive: assignment.is_active
      })) || []
    }));

    return NextResponse.json({
      success: true,
      data: assignmentSummary,
      summary: {
        totalTeachers: teachers.length,
        totalAssignments: teachers.reduce((sum, teacher) => sum + (teacher.assigned_students?.length || 0), 0),
        activeAssignments: teachers.reduce((sum, teacher) => 
          sum + (teacher.assigned_students?.filter((assignment: any) => assignment.is_active).length || 0), 0)
      }
    });

  } catch (error: any) {
    console.error("❌ Error fetching assignment data:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
