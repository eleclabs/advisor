// D:\advisor-main\app\api\problem\activity\route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Activity from "@/models/Activity";
import Problem from "@/models/Problem";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

// GET: ดูกิจกรรมทั้งหมด
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
    const id = searchParams.get("id"); // ค้นหาด้วย _id ของกิจกรรม
    const student_id = searchParams.get("student_id");
    
    // ✅ กรณีที่ 1: ค้นหาด้วย _id ของกิจกรรม (ดูรายละเอียดกิจกรรม)
    if (id) {
      console.log("🔍 Searching activity by _id:", id);
      
      const activity = await Activity.findById(id);
      
      if (activity) {
        return NextResponse.json({ 
          success: true, 
          data: activity
        });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: "ไม่พบกิจกรรม" 
      }, { status: 404 });
    }
    
    // ✅ กรณีที่ 2: ค้นหากิจกรรมของนักเรียนคนเดียว
    if (student_id) {
      // ถ้าไม่ใช่ Admin ต้องตรวจสอบว่านักเรียนคนนี้อยู่ในความดูแลหรือไม่
      if (!isAdmin && userId) {
        const user = await User.findById(userId).populate({
          path: 'assigned_students.student_id',
          model: 'Student'
        });
        
        if (user && user.assigned_students && user.assigned_students.length > 0) {
          // ดึงรหัสนักเรียนที่ครูดูแล
          const assignedStudentIds = user.assigned_students
            .filter((item: any) => item.student_id)
            .map((item: any) => item.student_id.id);
          
          // ตรวจสอบว่านักเรียนที่ขอมาอยู่ในความดูแลหรือไม่
          if (!assignedStudentIds.includes(student_id)) {
            return NextResponse.json({ 
              success: false, 
              error: "ไม่มีสิทธิ์เข้าถึงข้อมูลนักเรียนนี้" 
            }, { status: 403 });
          }
        } else {
          // ถ้าครูไม่มีนักเรียนในความดูแล ให้คืนค่าว่าง
          return NextResponse.json({ 
            success: true, 
            data: [] 
          });
        }
      }
      
      const activities = await Activity.find({
        "participants.student_id": student_id
      });
      
      return NextResponse.json({ 
        success: true, 
        data: activities 
      });
    }
    
    // ✅ กรณีที่ 3: ดูกิจกรรมทั้งหมด (สำหรับหน้า activities list)
    let activities = [];
    
    if (isAdmin) {
      // Admin เห็นทั้งหมด
      activities = await Activity.find().sort({ createdAt: -1 });
    } else if (userId) {
      // Teacher: ดึงกิจกรรมที่มีนักเรียนในความดูแลเข้าร่วม
      const user = await User.findById(userId).populate({
        path: 'assigned_students.student_id',
        model: 'Student'
      });
      
      if (user && user.assigned_students && user.assigned_students.length > 0) {
        // ดึงรหัสนักเรียนที่ครูดูแล
        const assignedStudentIds = user.assigned_students
          .filter((item: any) => item.student_id)
          .map((item: any) => item.student_id.id);
        
        // ค้นหากิจกรรมที่มีนักเรียนเหล่านี้เข้าร่วม
        activities = await Activity.find({
          "participants.student_id": { $in: assignedStudentIds }
        }).sort({ createdAt: -1 });
      } else {
        activities = [];
      }
    }
    
    return NextResponse.json({ success: true, data: activities });
    
  } catch (error: any) {
    console.error("❌ Error in GET /api/problem/activity:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// POST: เพิ่มกิจกรรมใหม่
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // ตรวจสอบ session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        error: "กรุณาเข้าสู่ระบบ" 
      }, { status: 401 });
    }
    
    const currentUser = session.user.name;
    const body = await request.json();
    
    console.log("📥 POST /api/problem/activity - Received:", body);
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!body.name) {
      return NextResponse.json({ 
        success: false, 
        error: "กรุณาระบุชื่อกิจกรรม" 
      }, { status: 400 });
    }
    
    // ===== เตรียมข้อมูล participants =====
    let participants = [];
    if (body.student_ids && body.student_ids.length > 0) {
      // ดึงข้อมูลนักเรียนจาก Problem model
      const problems = await Problem.find({
        student_id: { $in: body.student_ids }
      });
      
      console.log("📚 Found students in DB:", problems.map(p => ({ 
        id: p.student_id, 
        name: p.student_name 
      })));
      
      // สร้าง map สำหรับค้นหาชื่อนักเรียน
      const studentMap = new Map();
      problems.forEach(p => {
        studentMap.set(p.student_id, p.student_name);
      });
      
      // ✅ สร้าง participants โดยให้ joined = true ทันที
      participants = body.student_ids.map((id: string) => {
        const studentName = studentMap.get(id);
        if (!studentName) {
          console.warn(`⚠️ ไม่พบชื่อนักเรียนสำหรับรหัส: ${id}`);
        }
        return {
          student_id: id,
          student_name: studentName || `ไม่พบชื่อ (${id})`,
          joined: true,
          joined_at: new Date()
        };
      });
      
      console.log(`✅ Created ${participants.length} participants with joined=true`);
    }
    
    // ✅ สร้างกิจกรรมใหม่
    const newActivity = {
      name: body.name,
      objective: body.objective || "",
      duration: body.duration || 60,
      duration_period: body.duration_period || "",
      materials: body.materials || "",
      steps: body.steps || "",
      ice_breaking: body.ice_breaking || "",
      group_task: body.group_task || "",
      debrief: body.debrief || "",
      activity_date: body.activity_date || new Date(),
      participants: participants,
      total_participants: participants.length,
      joined_count: participants.length,
      created_by: currentUser
    };
    
    console.log("📝 New activity:", {
      name: newActivity.name,
      objective: newActivity.objective,
      duration: newActivity.duration,
      duration_period: newActivity.duration_period,
      total_participants: newActivity.total_participants,
      joined_count: newActivity.joined_count,
      created_by: newActivity.created_by
    });
    
    const activity = await Activity.create(newActivity);
    
    return NextResponse.json({ 
      success: true, 
      data: activity,
      message: "เพิ่มกิจกรรมเรียบร้อย" 
    });
    
  } catch (error: any) {
    console.error("❌ Error in POST /api/problem/activity:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// PUT: แก้ไขกิจกรรม
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    // ตรวจสอบ session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        error: "กรุณาเข้าสู่ระบบ" 
      }, { status: 401 });
    }
    
    const currentUser = session.user.name;
    const userRole = session.user.role;
    const isAdmin = userRole === 'ADMIN';
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();
    
    console.log("📥 PUT /api/problem/activity - id:", id);
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "กรุณาระบุ id" 
      }, { status: 400 });
    }
    
    const activity = await Activity.findById(id);
    
    if (!activity) {
      return NextResponse.json({ 
        success: false, 
        error: "ไม่พบกิจกรรม" 
      }, { status: 404 });
    }
    
    // ตรวจสอบสิทธิ์การแก้ไข (เฉพาะเจ้าของหรือ Admin)
    if (!isAdmin && activity.created_by !== currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: "ไม่มีสิทธิ์แก้ไขกิจกรรมนี้" 
      }, { status: 403 });
    }
    
    // อัปเดตข้อมูลทั่วไป
    if (body.name) activity.name = body.name;
    if (body.objective !== undefined) activity.objective = body.objective;
    if (body.duration) activity.duration = body.duration;
    if (body.duration_period !== undefined) activity.duration_period = body.duration_period;
    if (body.materials !== undefined) activity.materials = body.materials;
    if (body.steps !== undefined) activity.steps = body.steps;
    if (body.ice_breaking !== undefined) activity.ice_breaking = body.ice_breaking;
    if (body.group_task !== undefined) activity.group_task = body.group_task;
    if (body.debrief !== undefined) activity.debrief = body.debrief;
    if (body.activity_date) activity.activity_date = body.activity_date;
    
    // ถ้ามีการส่ง student_ids มา ให้อัปเดต participants
    if (body.student_ids) {
      // ดึงข้อมูลนักเรียนปัจจุบัน
      const students = await Problem.find({
        student_id: { $in: body.student_ids }
      });
      
      const studentMap = new Map();
      students.forEach(s => {
        studentMap.set(s.student_id, s.student_name);
      });
      
      // สร้าง participants ใหม่ โดยรักษาสถานะ joined เดิมไว้ถ้ามี
      const existingParticipants = new Map();
      activity.participants.forEach((p: any) => {
        existingParticipants.set(p.student_id, p);
      });
      
      const newParticipants = body.student_ids.map((id: string) => {
        const existing = existingParticipants.get(id);
        if (existing) {
          return existing;
        } else {
          return {
            student_id: id,
            student_name: studentMap.get(id) || "ไม่พบชื่อ",
            joined: true,
            joined_at: new Date()
          };
        }
      });
      
      activity.participants = newParticipants;
      activity.total_participants = newParticipants.length;
    }
    
    // อัปเดตสถานะการเข้าร่วมของนักเรียนทีละคน
    if (body.student_id && body.joined !== undefined) {
      const participantIndex = activity.participants.findIndex(
        (p: any) => p.student_id === body.student_id
      );
      
      if (participantIndex !== -1) {
        activity.participants[participantIndex].joined = body.joined;
        activity.participants[participantIndex].joined_at = body.joined ? new Date() : null;
      }
    }
    
    activity.joined_count = activity.participants.filter((p: any) => p.joined).length;
    
    await activity.save();
    
    return NextResponse.json({ 
      success: true, 
      data: activity,
      message: "แก้ไขกิจกรรมเรียบร้อย" 
    });
    
  } catch (error: any) {
    console.error("❌ Error in PUT /api/problem/activity:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE: ลบกิจกรรม
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    // ตรวจสอบ session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        error: "กรุณาเข้าสู่ระบบ" 
      }, { status: 401 });
    }
    
    const currentUser = session.user.name;
    const userRole = session.user.role;
    const isAdmin = userRole === 'ADMIN';
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "กรุณาระบุ id" 
      }, { status: 400 });
    }
    
    const activity = await Activity.findById(id);
    
    if (!activity) {
      return NextResponse.json({ 
        success: false, 
        error: "ไม่พบกิจกรรม" 
      }, { status: 404 });
    }
    
    // ตรวจสอบสิทธิ์การลบ (เฉพาะเจ้าของหรือ Admin)
    if (!isAdmin && activity.created_by !== currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: "ไม่มีสิทธิ์ลบกิจกรรมนี้" 
      }, { status: 403 });
    }
    
    await Activity.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      success: true, 
      message: "ลบกิจกรรมเรียบร้อย" 
    });
    
  } catch (error: any) {
    console.error("❌ Error in DELETE /api/problem/activity:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}