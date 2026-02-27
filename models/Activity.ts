// D:\advisor-main\models\Activity.ts
import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  // ข้อมูลพื้นฐานกิจกรรม
  name: { type: String, required: true }, // ชื่อกิจกรรม
  objective: { type: String }, // ✅ วัตถุประสงค์ / เป้าหมายกิจกรรม
  duration: { type: Number, default: 60 }, // เวลา (นาที)
  duration_period: { type: String }, // ✅ ระยะเวลาดำเนินการ / ครั้งที่จัด
  materials: { type: String }, // อุปกรณ์
  steps: { type: String }, // ขั้นตอน (text box รวม)
  ice_breaking: { type: String }, // ละลายพฤติกรรม
  group_task: { type: String }, // โจทย์กลุ่ม
  debrief: { type: String }, // ถอดบทเรียน
  activity_date: { type: Date, default: Date.now }, // วันที่จัดกิจกรรม
  
  // การเชื่อมโยงกับนักเรียน (หลายคน)
  participants: [{
    student_id: { type: String, required: true },
    student_name: { type: String, required: true },
    joined: { type: Boolean, default: false },
    joined_at: { type: Date }
  }],
  
  // สถิติ
  total_participants: { type: Number, default: 0 },
  joined_count: { type: Number, default: 0 },
  
  // ข้อมูลระบบ
  created_by: { type: String },
  updated_by: { type: String }
}, { timestamps: true });

export default mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);