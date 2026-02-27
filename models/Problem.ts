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
  
  // ✅ ส่วนที่เพิ่ม: ข้อมูลกิจกรรมที่นักเรียนเข้าร่วม
  activities: [{
    activity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }, // อ้างอิงถึง Activity
    status: { 
      type: String, 
      enum: ["ยังไม่เข้าร่วม", "เข้าร่วมแล้ว", "เสร็จสิ้น"],
      default: "ยังไม่เข้าร่วม"
    },
    joined_at: { type: Date }, // วันที่เข้าร่วม
    completed_at: { type: Date }, // วันที่เสร็จสิ้น
    notes: { type: String } // หมายเหตุเพิ่มเติม
  }],
  
  // ✅ หรือใช้แบบ Map (ถ้าต้องการเข้าถึงง่าย)
  activities_status: {
    type: Map,
    of: String,
    default: {}
  }, // เก็บสถานะกิจกรรม { activity_id: 'ยังไม่เข้าร่วม'/'เข้าร่วมแล้ว'/'เสร็จสิ้น' }
  
  activity_join_dates: {
    type: Map,
    of: Date,
    default: {}
  }, // เก็บวันที่เข้าร่วม { activity_id: Date }
  
  activity_completed_dates: {
    type: Map,
    of: Date,
    default: {}
  }, // เก็บวันที่เสร็จสิ้น { activity_id: Date }
  
  // ส่วนที่ 2: การประเมินผลการช่วยเหลือ (สามารถมีหลายครั้ง)
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
  
  // ส่วนที่ 3: ระบบติดตามความก้าวหน้า (คำนวณจากข้อมูลที่มี)
  last_updated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Problem || mongoose.model("Problem", ProblemSchema);