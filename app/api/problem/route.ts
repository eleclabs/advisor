// D:\advisor-main\app\api\problem\activity\route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";

// GET: ดูกิจกรรมทั้งหมด
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const student_id = searchParams.get("student_id");
    const index = searchParams.get("index");
    
    // ถ้ามี student_id และ index แสดงว่าดูกิจกรรมเดียว
    if (student_id && index !== null) {
      const problem = await Problem.findOne({ student_id });
      if (!problem || !problem.activities || !problem.activities[parseInt(index)]) {
        return NextResponse.json({ 
          success: false, 
          error: "ไม่พบกิจกรรม" 
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        success: true, 
        data: {
          ...problem.activities[parseInt(index)].toObject(),
          student_id: problem.student_id,
          student_name: problem.student_name,
          index: parseInt(index)
        }
      });
    }
    
    // ถ้าไม่มี param แสดงว่าดูกิจกรรมทั้งหมด
    const problems = await Problem.find({ "activities.0": { $exists: true } });
    
    const allActivities = problems.flatMap(p => 
      p.activities.map((a: any, idx: number) => ({
        ...a.toObject(),
        activity_id: `${p.student_id}_${idx}`,
        student_id: p.student_id,
        student_name: p.student_name,
        index: idx
      }))
    );
    
    return NextResponse.json({ success: true, data: allActivities });
    
  } catch (error: any) {
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
    const body = await request.json();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!body.name) {
      return NextResponse.json({ 
        success: false, 
        error: "กรุณาระบุชื่อกิจกรรม" 
      }, { status: 400 });
    }
    
    const newActivity = {
      name: body.name,
      duration: body.duration || 60,
      materials: body.materials || "",
      step1: body.step1 || "",
      step2: body.step2 || "",
      step3: body.step3 || "",
      ice_breaking: body.ice_breaking || "",
      group_task: body.group_task || "",
      debrief: body.debrief || "",
      activity_date: body.activity_date || new Date(),
      joined: false
    };
    
    // ถ้ามี student_ids ให้เพิ่มให้หลายคน
    if (body.student_ids && body.student_ids.length > 0) {
      const result = await Problem.updateMany(
        { student_id: { $in: body.student_ids } },
        { $push: { activities: newActivity } }
      );
      
      return NextResponse.json({ 
        success: true, 
        message: `เพิ่มกิจกรรมให้ ${result.modifiedCount} คนเรียบร้อย`,
        data: { modifiedCount: result.modifiedCount }
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "กรุณาระบุรายชื่อนักเรียน" 
    }, { status: 400 });
    
  } catch (error: any) {
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
    const { searchParams } = new URL(request.url);
    const student_id = searchParams.get("student_id");
    const index = parseInt(searchParams.get("index") || "0");
    const body = await request.json();
    
    if (!student_id) {
      return NextResponse.json({ 
        success: false, 
        error: "กรุณาระบุรหัสนักเรียน" 
      }, { status: 400 });
    }
    
    const problem = await Problem.findOne({ student_id });
    if (!problem) {
      return NextResponse.json({ 
        success: false, 
        error: "ไม่พบข้อมูลนักเรียน" 
      }, { status: 404 });
    }
    
    if (!problem.activities || !problem.activities[index]) {
      return NextResponse.json({ 
        success: false, 
        error: "ไม่พบกิจกรรม" 
      }, { status: 404 });
    }
    
    // อัปเดตกิจกรรม
    const updatedActivity = {
      ...problem.activities[index].toObject(),
      name: body.name !== undefined ? body.name : problem.activities[index].name,
      duration: body.duration !== undefined ? body.duration : problem.activities[index].duration,
      materials: body.materials !== undefined ? body.materials : problem.activities[index].materials,
      step1: body.step1 !== undefined ? body.step1 : problem.activities[index].step1,
      step2: body.step2 !== undefined ? body.step2 : problem.activities[index].step2,
      step3: body.step3 !== undefined ? body.step3 : problem.activities[index].step3,
      ice_breaking: body.ice_breaking !== undefined ? body.ice_breaking : problem.activities[index].ice_breaking,
      group_task: body.group_task !== undefined ? body.group_task : problem.activities[index].group_task,
      debrief: body.debrief !== undefined ? body.debrief : problem.activities[index].debrief,
      joined: body.joined !== undefined ? body.joined : problem.activities[index].joined
    };
    
    problem.activities[index] = updatedActivity;
    await problem.save();
    
    return NextResponse.json({ 
      success: true, 
      data: updatedActivity,
      message: "แก้ไขกิจกรรมเรียบร้อย" 
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}