// D:\advisor-main\models\Problem.ts
import mongoose from "mongoose";

const ProblemSchema = new mongoose.Schema({
  // ข้อมูลนักเรียน
  student_id: { type: String, required: true },
  student_name: { type: String, required: true },
  
  // ส่วนที่ 1: เครื่องมือวางแผนกิจกรรมแก้ไขปัญหา (ISP)
  problem: { type: String }, // ปัญหาที่พบ
  goal: { type: String }, // เป้าหมาย
  counseling: { type: Boolean, default: false }, // การให้คำปรึกษา
  behavioral_contract: { type: Boolean, default: false }, // กิจกรรมปรับเปลี่ยนพฤติกรรม
  home_visit: { type: Boolean, default: false }, // การเยี่ยมบ้าน
  referral: { type: Boolean, default: false }, // การส่งต่อ
  duration: { type: String }, // ระยะเวลาดำเนินการ
  responsible: { type: String }, // ผู้รับผิดชอบ
  isp_status: { type: String, enum: ["กำลังดำเนินการ", "สำเร็จ", "ปรับแผน"] }, // สถานะแผน
  progress: { type: Number, default: 0 }, // ความคืบหน้า
  
  // ส่วนที่ 2: กิจกรรมกลุ่มสัมพันธ์ (สามารถมีหลายกิจกรรม)
  activities: [{
    name: { type: String }, // ชื่อกิจกรรม
    duration: { type: Number }, // เวลา (นาที)
    materials: { type: String }, // อุปกรณ์
    step1: { type: String }, // ขั้นตอนที่ 1
    step2: { type: String }, // ขั้นตอนที่ 2
    step3: { type: String }, // ขั้นตอนที่ 3
    ice_breaking: { type: String }, // ละลายพฤติกรรม
    group_task: { type: String }, // โจทย์กลุ่ม
    debrief: { type: String }, // ถอดบทเรียน
    activity_date: { type: Date },
    joined: { type: Boolean, default: false } // นักเรียนคนนี้เข้าร่วมหรือไม่
  }],
  
  // ส่วนที่ 3: การประเมินผลการช่วยเหลือ (สามารถมีหลายครั้ง)
  evaluations: [{
    evaluation_number: { type: Number }, // ครั้งที่
    improvement_level: { 
      type: String, 
      enum: ["ดีขึ้นชัดเจน", "เริ่มเห็นการเปลี่ยนแปลง", "คงเดิม/ไม่เปลี่ยนแปลง"]
    },
    improvement_detail: { type: String },
    result: { 
      type: String, 
      enum: ["ยุติการช่วยเหลือ", "ดำเนินการต่อ", "ส่งต่อผู้เชี่ยวชาญ"]
    },
    notes: { type: String },
    evaluation_date: { type: Date, default: Date.now }
  }],
  
  // ส่วนที่ 4: ระบบติดตามความก้าวหน้า (คำนวณจากข้อมูลที่มี)
  last_updated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Problem || mongoose.model("Problem", ProblemSchema);