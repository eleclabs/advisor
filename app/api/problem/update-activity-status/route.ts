import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import Activity from "@/models/Activity";
import mongoose from "mongoose";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    console.log("📤 Received payload:", body);
    
    // รับค่าจาก Payload
    const { activity_id, student_id, status, notes, joined_at, completed_at } = body;

    if (!activity_id || !student_id) {
      return NextResponse.json(
        { success: false, error: "Missing activity_id or student_id" }, 
        { status: 400 }
      );
    }

    const objActivityId = new mongoose.Types.ObjectId(activity_id);

    // 1. อัปเดตข้อมูลกิจกรรมในตาราง Activity
    await Activity.findByIdAndUpdate(
      activity_id,
      { 
        status, 
        notes, 
        updated_at: new Date() 
      },
      { new: true }
    );

    // 2. ค้นหานักเรียน
    const student = await Problem.findOne({ student_id: student_id });
    if (!student) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลนักเรียน" }, 
        { status: 404 }
      );
    }

    console.log("🔍 Found student:", student._id);
    console.log("🔍 Student activities before update:", student.activities);

    // 3. ตรวจสอบว่ามีกิจกรรมนี้อยู่แล้วหรือไม่
    const existingActivityIndex = student.activities?.findIndex(
      (a: any) => String(a.activity_id) === String(activity_id)
    );

    if (existingActivityIndex !== -1 && existingActivityIndex !== undefined) {
      // ✅ ถ้ามีอยู่แล้ว → อัปเดตทุกฟิลด์
      console.log("📝 Updating existing activity at index:", existingActivityIndex);
      
      // อัปเดตใน activities array (เก็บทุกฟิลด์)
      student.activities[existingActivityIndex] = {
        activity_id: objActivityId,
        status: status,
        notes: notes || "", // ✅ เก็บ notes
        joined_at: joined_at ? new Date(joined_at) : null,
        completed_at: completed_at ? new Date(completed_at) : null // ✅ เก็บ completed_at
      };

      // อัปเดต Maps
      student.activities_status.set(activity_id, status);
      if (joined_at) {
        student.activity_join_dates.set(activity_id, new Date(joined_at));
      }
      if (completed_at) {
        student.activity_completed_dates.set(activity_id, new Date(completed_at)); // ✅ เก็บใน map
      }

    } else {
      // ✅ ถ้ายังไม่มี → เพิ่มใหม่
      console.log("➕ Adding new activity to student");
      
      const newActivity = {
        activity_id: objActivityId,
        status: status,
        notes: notes || "", // ✅ เก็บ notes
        joined_at: joined_at ? new Date(joined_at) : null,
        completed_at: completed_at ? new Date(completed_at) : null // ✅ เก็บ completed_at
      };

      student.activities.push(newActivity);
      student.activities_status.set(activity_id, status);
      
      if (joined_at) {
        student.activity_join_dates.set(activity_id, new Date(joined_at));
      }
      if (completed_at) {
        student.activity_completed_dates.set(activity_id, new Date(completed_at)); // ✅ เก็บใน map
      }
    }

    // บันทึกและ populate
    student.last_updated = new Date();
    await student.save();
    
    // ✅ ดึงข้อมูลล่าสุดที่ populate แล้ว
    const updatedStudent = await Problem.findOne({ student_id: student_id })
      .populate('activities.activity_id');

    return NextResponse.json({ 
      success: true, 
      message: "บันทึกข้อมูลสำเร็จ",
      data: updatedStudent
    });

  } catch (err: any) {
    console.error("❌ UPDATE ACTIVITY ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message }, 
      { status: 500 }
    );
  }
}