// D:\advisor-main\models\Learn.ts
import mongoose from "mongoose";

const LearnSchema = new mongoose.Schema({
  // ===== ข้อมูลพื้นฐาน (แก้ไขก่อนจัดกิจกรรม) =====
  level: { type: String },
  semester: { type: String },
  academicYear: { type: String },
  week: { type: String },
  time: { type: String },
  topic: { type: String },
  objectives: [{ type: String }],
  
  // ช่วงที่ 1: การจัดการระเบียบและวินัย
  checkAttendance: { type: String },
  checkUniform: { type: String },
  announceNews: { type: String },
  
  // ช่วงที่ 2: กิจกรรมพัฒนาผู้เรียน
  warmup: { type: String },
  mainActivity: { type: String },
  summary: { type: String },
  
  // ช่วงที่ 3: การดูแลรายบุคคล
  trackProblems: { type: String },
  individualCounsel: { type: String },
  
  // การประเมินผล (ที่วางแผนไว้)
  evalObservation: { type: Boolean, default: false },
  evalWorksheet: { type: Boolean, default: false },
  evalParticipation: { type: Boolean, default: false },
  
  // สื่อ/เอกสาร
  materials: { type: String },
  materialsNote: { type: String },
  
  // ข้อเสนอแนะ (สำหรับวางแผนล่วงหน้า)
  suggestions: { type: String },
  
  // ติดตามผลรายบุคคล (ที่วางแผนไว้)
  individualFollowup: { type: String },
  
  // สถานะ
  status: { type: String, default: "draft" },
  created_by: { type: String },
  
  // ===== ฟิลด์สำหรับบันทึกหลังกิจกรรม =====
  activity_date: { type: String },
  students_attended: { type: String },
  total_students: { type: String },
  activity_notes: { type: String },
  activity_problems: { type: String },
  activity_solutions: { type: String },
  evaluator: { type: String },
  has_record: { type: Boolean, default: false },
  recorded_at: { type: String },
  
  // Timestamps
  created_at: { type: String },
  updated_at: { type: String },
}, { timestamps: true });

export default mongoose.models.Learn || mongoose.model("Learn", LearnSchema);