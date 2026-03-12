// app/api/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Referral } from "@/models/Send";
import Student from "@/models/Student";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - ดึงข้อมูลการส่งต่อทั้งหมด
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // ตรวจสอบ session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        message: "กรุณาเข้าสู่ระบบ" 
      }, { status: 401 });
    }
    
    const userRole = session.user.role;
    const userId = session.user.id;
    const isAdmin = userRole === 'ADMIN';
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    
    const skip = (page - 1) * limit;
    
    // สร้าง query สำหรับการค้นหา
    let query: any = {};
    
    if (search) {
      query.$or = [
        { student_name: { $regex: search, $options: 'i' } },
        { student_id: { $regex: search, $options: 'i' } },
        { target: { $regex: search, $options: 'i' } },
        { reason_category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    // ✅ ถ้าไม่ใช่ Admin ให้กรองเฉพาะนักเรียนที่ดูแล
    if (!isAdmin && userId) {
      try {
        // ดึงข้อมูลนักเรียนที่ครูคนนี้ดูแล
        const user = await User.findById(userId).populate({
          path: 'assigned_students.student_id',
          model: Student
        });
        
        if (user && user.assigned_students && user.assigned_students.length > 0) {
          // ดึงรหัสนักเรียนที่ครูดูแล (ใช้ student.id)
          const assignedStudentIds = user.assigned_students
            .filter((item: any) => item.student_id)
            .map((item: any) => item.student_id.id);
          
          console.log("📊 Assigned student IDs for send page:", assignedStudentIds);
          
          // กรองตามรหัสนักเรียนที่ดูแล
          query.student_id = { $in: assignedStudentIds };
        } else {
          // ถ้าครูไม่มีนักเรียนในความดูแล ให้คืนค่าว่าง
          return NextResponse.json({
            success: true,
            data: [],
            pagination: {
              page,
              limit,
              total: 0,
              pages: 0
            }
          });
        }
      } catch (error) {
        console.error("Error fetching assigned students:", error);
        // ถ้า error ให้คืนค่าว่าง
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        });
      }
    }
    
    console.log("🔍 Send query:", JSON.stringify(query, null, 2));
    
    // ดึงข้อมูลการส่งต่อ
    const referrals = await Referral.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    // นับจำนวนทั้งหมด
    const total = await Referral.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: referrals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถดึงข้อมูลได้" },
      { status: 500 }
    );
  }
}

// POST - สร้างการส่งต่อใหม่
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // ตรวจสอบ session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        message: "กรุณาเข้าสู่ระบบ" 
      }, { status: 401 });
    }
    
    const userRole = session.user.role;
    const userId = session.user.id;
    const isAdmin = userRole === 'ADMIN';
    
    const body = await request.json();
    
    // ตรวจสอบว่ามีนักเรียนอยู่จริง
    const student = await Student.findOne({ id: body.student_id });
    if (!student) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลนักเรียน" },
        { status: 404 }
      );
    }
    
    // ✅ ถ้าไม่ใช่ Admin ตรวจสอบว่านักเรียนอยู่ในความดูแลหรือไม่
    if (!isAdmin && userId) {
      const user = await User.findById(userId).populate({
        path: 'assigned_students.student_id',
        model: Student
      });
      
      if (user && user.assigned_students && user.assigned_students.length > 0) {
        const assignedStudentIds = user.assigned_students
          .filter((item: any) => item.student_id)
          .map((item: any) => item.student_id.id);
        
        if (!assignedStudentIds.includes(body.student_id)) {
          return NextResponse.json(
            { success: false, error: "ไม่มีสิทธิ์สร้างการส่งต่อสำหรับนักเรียนนี้" },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: "คุณไม่มีนักเรียนในความดูแล" },
          { status: 403 }
        );
      }
    }
    
    // สร้างการส่งต่อใหม่
    const referral = new Referral({
      student_id: body.student_id,
      student_name: `${student.first_name} ${student.last_name}`,
      student_level: student.level,
      student_class: student.class_group,
      student_number: student.class_number,
      type: body.type,
      target: body.target,
      reason_category: body.reason_category,
      reason_detail: body.reason_detail,
      actions_taken: body.actions_taken,
    });
    
    await referral.save();
    
    return NextResponse.json({
      success: true,
      data: referral
    });
  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถสร้างการส่งต่อได้" },
      { status: 500 }
    );
  }
}