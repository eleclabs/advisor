import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import Activity from "@/models/Activity";
import mongoose from "mongoose";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    // รับค่าจาก Payload
    const { activity_id, student_id, status, notes, joined_at, completed_at } = body;

    // 🚩 ตรวจสอบ ID เบื้องต้น
    if (!activity_id || !student_id) {
      return NextResponse.json(
        { success: false, error: "Missing activity_id or student_id" }, 
        { status: 400 }
      );
    }

    // 🚩 แปลง activity_id เป็น ObjectId เพื่อให้ Mongoose ค้นหาใน Array เจอ
    const objActivityId = new mongoose.Types.ObjectId(activity_id);

    // 1. อัปเดตข้อมูลกิจกรรมในตาราง Activity (ตารางหลักของกิจกรรม)
    await Activity.findByIdAndUpdate(
      activity_id,
      { status, notes, updated_at: new Date() },
      { new: true }
    );

    // 2. พยายามอัปเดตกิจกรรมในตัวนักเรียน (Problem) กรณีที่มีกิจกรรมนี้อยู่แล้ว
    // เราหาด้วย student_id (ก, 55) และเช็ค activity_id ใน Array activities
    const updatedStudent = await Problem.findOneAndUpdate(
      { 
        student_id: student_id, 
        "activities.activity_id": objActivityId 
      },
      { 
        $set: { 
          "activities.$.status": status,
          "activities.$.notes": notes,
          "activities.$.joined_at": joined_at ? new Date(joined_at) : null,
          "activities.$.completed_at": completed_at ? new Date(completed_at) : null,
          // อัปเดตข้อมูลใน Map ไปด้วยเพื่อความซ้ำซ้อนที่ถูกต้องตาม Model
          [`activities_status.${activity_id}`]: status,
          [`activity_join_dates.${activity_id}`]: joined_at ? new Date(joined_at) : null,
          [`activity_completed_dates.${activity_id}`]: completed_at ? new Date(completed_at) : null
        } 
      },
      { new: true }
    );

    // 3. 🚩 ถ้าหาใน Array ไม่เจอ (updatedStudent เป็น null) แปลว่าเด็กคนนี้ยังไม่มีกิจกรรมนี้
    if (!updatedStudent) {
      console.log(`➕ เพิ่มกิจกรรมใหม่ให้รหัสนักเรียน: ${student_id}`);
      await Problem.findOneAndUpdate(
        { student_id: student_id },
        { 
          $push: { 
            activities: {
              activity_id: objActivityId,
              status,
              notes,
              joined_at: joined_at ? new Date(joined_at) : null,
              completed_at: completed_at ? new Date(completed_at) : null
            } 
          },
          $set: {
            [`activities_status.${activity_id}`]: status,
            [`activity_join_dates.${activity_id}`]: joined_at ? new Date(joined_at) : null,
            [`activity_completed_dates.${activity_id}`]: completed_at ? new Date(completed_at) : null
          }
        }
      );
    }

    return NextResponse.json({ success: true, message: "บันทึกข้อมูลสำเร็จ" });

  } catch (err: any) {
    console.error("❌ UPDATE ACTIVITY ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message }, 
      { status: 500 }
    );
  }
}
