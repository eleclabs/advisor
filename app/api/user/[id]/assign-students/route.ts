// app/api/user/[id]/assign-students/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Student from "@/models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST - บันทึก assigned students
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("🚀 POST /api/user/[id]/assign-students เริ่มทำงาน");
  
  try {
    // ✅ ต้อง await params ก่อนใช้
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // ตรวจสอบว่าเป็น user เดียวกันหรือ ADMIN
    if (session.user?.id !== id && session.user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "ไม่มีสิทธิ์" }, { status: 403 });
    }

    await connectDB();
    
    const { studentIds } = await req.json();
    
    if (!Array.isArray(studentIds)) {
      return NextResponse.json({ success: false, message: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 });
    }

    // ดึงข้อมูลผู้ใช้ที่จะมอบหมาย
    const teacher = await User.findById(id);
    const teacherName = `${teacher.prefix} ${teacher.first_name} ${teacher.last_name}`;
    
    // ดึงข้อมูลผู้เรียนทั้งหมดที่ถูกเลือก
    const students = await Student.find({ _id: { $in: studentIds } });
    
    // สร้าง assigned_students array
    const assignedStudents = students.map(student => ({
      student_id: student._id,
      student_name: `${student.prefix || ''}${student.first_name} ${student.last_name}`.trim(),
      class_number: student.class_number,
      assigned_date: new Date(),
      is_active: true
    }));

    // อัปเดตผู้ใช้
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { assigned_students: assignedStudents },
      { new: true, returnDocument: 'after' }
    );

    // อัปเดตข้อมูลครูที่ปรึกษาให้ผู้เรียนทุกคน
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { 
        advisor_name: teacherName,
        advisor_id: id
      }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    console.log(`✅ มอบหมายผู้เรียน ${assignedStudents.length} คน ให้ผู้ใช้ ${id} และอัปเดตข้อมูลครูที่ปรึกษา`);

    return NextResponse.json({
      success: true,
      data: assignedStudents,
      message: `มอบหมายผู้เรียน ${assignedStudents.length} คน สำเร็จ`
    });

  } catch (error: any) {
    console.error("❌ Error assigning students:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}

// DELETE - ลบ assigned students ที่ระบุ
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    // ตรวจสอบว่าเป็น user เดียวกันหรือ ADMIN
    if (session.user?.id !== id && session.user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "ไม่มีสิทธิ์" }, { status: 403 });
    }

    await connectDB();
    
    const { studentIds } = await req.json();
    
    if (!Array.isArray(studentIds)) {
      return NextResponse.json({ success: false, message: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 });
    }

    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, message: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    // กรองผู้เรียนที่ไม่ต้องการลบออก
    const updatedAssignedStudents = user.assigned_students?.filter(
      (assignment: any) => !studentIds.includes(assignment.student_id?.toString())
    ) || [];

    // อัปเดตผู้ใช้
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { assigned_students: updatedAssignedStudents },
      { new: true, returnDocument: 'after' }
    );

    // เคลียร์ข้อมูลครูที่ปรึกษาของผู้เรียนที่ถูกลบ
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { 
        advisor_name: "",
        advisor_id: ""
      }
    );

    console.log(`✅ ลบผู้เรียน ${studentIds.length} คน จากผู้ใช้ ${id} และเคลียร์ข้อมูลครูที่ปรึกษา`);

    return NextResponse.json({
      success: true,
      data: updatedAssignedStudents,
      message: `ลบผู้เรียน ${studentIds.length} คน สำเร็จ`
    });

  } catch (error: any) {
    console.error("❌ Error removing students:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}

// GET - ดึง assigned students ของ user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await connectDB();
    
    // ดึง user พร้อมข้อมูลผู้เรียนที่ populate
    const user = await User.findById(id).populate({
      path: 'assigned_students.student_id',
      model: Student
    });
    
    if (!user) {
      return NextResponse.json({ success: false, message: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    console.log(`📊 พบ assigned students: ${user.assigned_students?.length || 0} คน`);
    
    // Debug: แสดงข้อมูลผู้เรียนตัวอย่าง
    if (user.assigned_students && user.assigned_students.length > 0) {
      console.log("👥 Sample assigned student data:", JSON.stringify(user.assigned_students[0], null, 2));
      console.log("🏢 Available class_groups:", [...new Set(user.assigned_students.map((a: any) => a.student_id?.class_group).filter(Boolean))]);
      console.log("🎓 Available levels:", [...new Set(user.assigned_students.map((a: any) => a.student_id?.level).filter(Boolean))]);
    }

    return NextResponse.json({
      success: true,
      data: user.assigned_students || []
    });

  } catch (error: any) {
    console.error("❌ Error fetching assigned students:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}