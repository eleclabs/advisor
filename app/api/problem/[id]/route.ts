// D:\advisor-main\app\api\problem\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import Student from "@/models/Student";
import Activity from "@/models/Activity";
import mongoose from "mongoose";

// GET: ดึงข้อมูลผู้เรียน
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    console.log("🔍 Searching with ID:", id);
    
    let problem = null;
    
    // ตรวจสอบว่า id เป็น MongoDB ObjectId หรือไม่
    if (mongoose.Types.ObjectId.isValid(id)) {
      problem = await Problem.findById(id)
        .populate('activities.activity_id');
      console.log("📋 Found by _id:", problem ? "Yes" : "No");
    }
    
    // ถ้าไม่เจอด้วย _id ให้ค้นหาด้วย student_id
    if (!problem) {
      problem = await Problem.findOne({ student_id: id })
        .populate('activities.activity_id');
      console.log("📋 Found by student_id:", problem ? "Yes" : "No");
    }
    
    if (problem) {
      const problemData = problem.toObject();
      
      // แปลง Map ให้เป็น plain object
      if (problemData.activities_status && problemData.activities_status instanceof Map) {
        problemData.activities_status = Object.fromEntries(problemData.activities_status);
      }
      if (problemData.activity_join_dates && problemData.activity_join_dates instanceof Map) {
        problemData.activity_join_dates = Object.fromEntries(problemData.activity_join_dates);
      }
      if (problemData.activity_completed_dates && problemData.activity_completed_dates instanceof Map) {
        problemData.activity_completed_dates = Object.fromEntries(problemData.activity_completed_dates);
      }
      
      if (!problemData.activities) {
        problemData.activities = [];
      }
      
      // ✅ Ensure custom_methods is always an array
      if (!problemData.custom_methods) {
        problemData.custom_methods = [];
      }
      
      // ✅ Combine all methods for display
      const methods: string[] = [];
      if (problemData.counseling) methods.push("การให้คำปรึกษาเบื้องต้น");
      if (problemData.behavioral_contract) methods.push("กิจกรรมปรับเปลี่ยนพฤติกรรม");
      if (problemData.home_visit) methods.push("การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง");
      if (problemData.referral) methods.push("การส่งต่อ");
      if (problemData.custom_methods && Array.isArray(problemData.custom_methods)) {
        methods.push(...problemData.custom_methods);
      }
      problemData.methods = methods;
      
      console.log("✅ Sending problem data with methods:", methods);
      
      return NextResponse.json({ 
        success: true, 
        data: problemData
      });
    }
    
    // ถ้าไม่เจอใน Problem ให้ค้นหาผู้เรียนจาก Student
    const student = await Student.findOne({ 
      $or: [
        { id: id },
        { _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null }
      ]
    });
    
    if (student) {
      return NextResponse.json({ 
        success: true, 
        data: {
          student_id: student.id,
          student_name: `${student.prefix || ''} ${student.first_name || ''} ${student.last_name || ''}`.trim(),
          student_data: student,
          isNew: true,
          activities: [],
          activities_status: {},
          activity_join_dates: {},
          activity_completed_dates: {},
          methods: [],
          custom_methods: []
        }
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "ไม่พบรหัสนี้ในระบบ" 
    }, { status: 404 });
    
  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// POST: สร้างแผนใหม่
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    
    const student = await Student.findOne({ id });
    if (!student) {
      return NextResponse.json({ 
        success: false, 
        error: "ไม่พบรหัสนี้ในระบบ" 
      }, { status: 404 });
    }
    
    const existing = await Problem.findOne({ student_id: id });
    if (existing) {
      return NextResponse.json({ 
        success: false, 
        error: "ผู้เรียนนี้มีแผนการช่วยเหลือแล้ว" 
      }, { status: 400 });
    }
    
    const problemData = {
      student_id: id,
      student_name: `${student.prefix || ''} ${student.first_name || ''} ${student.last_name || ''}`.trim(),
      problem: body.problem,
      goal: body.goal,
      counseling: body.counseling || false,
      behavioral_contract: body.behavioral_contract || false,
      home_visit: body.home_visit || false,
      referral: body.referral || false,
      custom_methods: body.custom_methods || [],
      duration: body.duration,
      responsible: body.responsible,
      isp_status: "กำลังดำเนินการ",
      progress: 0,
      evaluations: [],
      activities: [],
      activities_status: new Map(),
      activity_join_dates: new Map(),
      activity_completed_dates: new Map()
    };
    
    const problem = await Problem.create(problemData);
    return NextResponse.json({ success: true, data: problem });
    
  } catch (error: any) {
    console.error("❌ Error in POST:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// PUT: อัปเดตแผนหรือเพิ่มผลประเมิน
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    
    let problem = null;
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      problem = await Problem.findById(id);
    }
    
    if (!problem) {
      problem = await Problem.findOne({ student_id: id });
    }
    
    if (!problem) {
      return NextResponse.json({ 
        success: false, 
        error: "ไม่พบข้อมูลผู้เรียน" 
      }, { status: 404 });
    }
    
    // ✅ ถ้ามี evaluation หมายถึงเป็นการเพิ่มผลประเมิน
    if (body.addEvaluation) {
      const maxNumber = problem.evaluations?.length > 0 
        ? Math.max(...problem.evaluations.map((e: any) => e.evaluation_number || 0)) 
        : 0;
      
      const newEvaluation = {
        evaluation_number: maxNumber + 1,
        improvement_level: body.improvement_level,
        improvement_detail: body.improvement_detail || "",
        result: body.result,
        notes: body.notes || "",
        evaluation_date: new Date()
      };
      
      problem.evaluations.push(newEvaluation);
      
      if (body.result === 'ยุติการช่วยเหลือ') {
        problem.progress = 100;
        problem.isp_status = 'สำเร็จ';
      } else if (body.result === 'ดำเนินการต่อ') {
        problem.progress = 75;
        problem.isp_status = 'กำลังดำเนินการ';
      } else if (body.result === 'ส่งต่อผู้เชี่ยวชาญ') {
        problem.progress = 50;
        problem.isp_status = 'ปรับแผน';
      }
      
      await problem.save();
      
      return NextResponse.json({ success: true, data: problem });
    }
    
    // ✅ อัปเดตแผนปกติ
    const updateData: any = {
      problem: body.problem,
      goal: body.goal,
      duration: body.duration,
      responsible: body.responsible,
      progress: body.progress,
      isp_status: body.isp_status
    };
    
    // ✅ Handle methods properly
    if (body.methods && Array.isArray(body.methods)) {
      // Set boolean flags based on methods array
      updateData.counseling = body.methods.includes("การให้คำปรึกษาเบื้องต้น");
      updateData.behavioral_contract = body.methods.includes("กิจกรรมปรับเปลี่ยนพฤติกรรม");
      updateData.home_visit = body.methods.includes("การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง");
      updateData.referral = body.methods.includes("การส่งต่อ");
      
      // ✅ Extract custom methods (any method not in the default 4)
      const defaultMethods = [
        "การให้คำปรึกษาเบื้องต้น",
        "กิจกรรมปรับเปลี่ยนพฤติกรรม",
        "การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง",
        "การส่งต่อ"
      ];
      updateData.custom_methods = body.methods.filter((m: string) => !defaultMethods.includes(m));
      
      console.log("✅ Updating methods:", {
        counseling: updateData.counseling,
        behavioral_contract: updateData.behavioral_contract,
        home_visit: updateData.home_visit,
        referral: updateData.referral,
        custom_methods: updateData.custom_methods
      });
    }
    
    // ✅ อัปเดตกิจกรรมที่เลือก
    if (body.activities && Array.isArray(body.activities)) {
      const currentActivityIds = problem.activities.map((a: any) => 
        a.activity_id?.toString() || a.activity_id?.toString()
      );
      const newActivityIds = body.activities.map((a: any) => a.activity_id?.toString());
      
      const addedIds = newActivityIds.filter((id: string) => !currentActivityIds.includes(id));
      const removedIds = currentActivityIds.filter((id: string) => !newActivityIds.includes(id));
      
      for (const activityId of addedIds) {
        await Activity.findByIdAndUpdate(
          activityId,
          {
            $push: {
              participants: {
                student_id: problem.student_id,
                student_name: problem.student_name,
                joined: true,
                joined_at: new Date()
              }
            },
            $inc: { total_participants: 1, joined_count: 1 }
          }
        );
        
        problem.activities.push({
          activity_id: new mongoose.Types.ObjectId(activityId),
          status: "เข้าร่วมแล้ว",
          joined_at: new Date(),
          completed_at: null,
          notes: ""
        });
        problem.activities_status.set(activityId, "เข้าร่วมแล้ว");
        problem.activity_join_dates.set(activityId, new Date());
      }
      
      for (const activityId of removedIds) {
        await Activity.findByIdAndUpdate(
          activityId,
          {
            $pull: { participants: { student_id: problem.student_id } },
            $inc: { total_participants: -1, joined_count: -1 }
          }
        );
        
        problem.activities = problem.activities.filter((a: any) => 
          (a.activity_id?.toString() || a.activity_id?.toString()) !== activityId
        );
        problem.activities_status.delete(activityId);
        problem.activity_join_dates.delete(activityId);
        problem.activity_completed_dates.delete(activityId);
      }
    }
    
    // ✅ Apply updates
    const updated = await Problem.findByIdAndUpdate(
      problem._id,
      updateData,
      { new: true }
    );
    
    // ✅ Save activities changes
    await problem.save();
    
    return NextResponse.json({ success: true, data: updated });
    
  } catch (error: any) {
    console.error("❌ Error in PUT:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE: ลบแผน
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Problem.findByIdAndDelete(id);
    } else {
      await Problem.findOneAndDelete({ student_id: id });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error("❌ Error in DELETE:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}