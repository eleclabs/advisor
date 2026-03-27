// models/User.ts
import mongoose from "mongoose";

/**
 * Schema สำหรับผู้ใช้ระบบ (User)
 * - รองรับการ login ด้วย credentials หรือ OAuth (Google)
 * - กำหนดบทบาท (role) เพื่อควบคุมสิทธิ์การเข้าถึงข้อมูล
 * - เก็บข้อมูลพื้นฐานของครู / ผู้บริหาร / คณะกรรมการ
 * - เก็บข้อมูลการรับผิดชอบนักเรียนทั้งหมดใน Model เดียว
 */
const UserSchema = new mongoose.Schema({
  // ===== ข้อมูลสำหรับการล็อกอิน =====
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    description: "อีเมลสำหรับเข้าสู่ระบบ (ต้องไม่ซ้ำกัน)",
  },
  password: {
    type: String,
    required: function() { return this.provider === "credentials"; },
    description: "รหัสผ่าน (เข้ารหัสแล้ว) - จำเป็นเมื่อใช้ credentials",
  },
  provider: {
    type: String,
    enum: ["credentials", "google"],
    default: "credentials",
    description: "ช่องทางสมัครสมาชิก (credentials = อีเมล/รหัสผ่าน, google = สมัครผ่าน Google)",
  },

  // ===== ข้อมูลส่วนตัว =====
  prefix: {
    type: String,
    enum: ["นาย", "นาง", "นางสาว", "อื่นๆ"],
    description: "คำนำหน้า",
  },
  first_name: {
    type: String,
    required: true,
    trim: true,
    description: "ชื่อจริง",
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
    description: "นามสกุล",
  },
  nickname: {
    type: String,
    trim: true,
    description: "ชื่อเล่น (ถ้ามี)",
  },
  teacher_id: {
    type: String,
    unique: true,
    sparse: true,
    description: "รหัสประจำตัวครู (ถ้ามี)",
  },
  phone: {
    type: String,
    trim: true,
    description: "เบอร์โทรศัพท์ติดต่อ",
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    description: "เพศ",
  },
  birthDate: {
    type: Date,
    description: "วันเกิด",
  },
  line_id: {
    type: String,
    trim: true,
    description: "LINE ID (ถ้ามี)",
  },
  image: {
    type: String,
    description: "URL รูปโปรไฟล์ (อัปโหลดไปที่ Cloudinary)",
  },

  // ===== ข้อมูลบทบาทและสิทธิ์ =====
  role: {
    type: String,
    enum: ["ADMIN", "TEACHER", "EXECUTIVE", "COMMITTEE"],
    default: "TEACHER",
    description: "บทบาทในระบบ: ADMIN = จัดการทุกอย่าง, TEACHER = อาจารย์ที่ปรึกษา, EXECUTIVE = ผู้บริหาร, COMMITTEE = คณะกรรมการ",
  },
  is_active: {
    type: Boolean,
    default: true,
    description: "สถานะเปิดใช้งานบัญชี (ถ้า false จะไม่สามารถล็อกอินได้)",
  },

  // ===== ข้อมูลเพิ่มเติมสำหรับการทำงาน =====
  last_login: {
    type: Date,
    description: "วันที่และเวลาล็อกอินครั้งล่าสุด",
  },

  // ===== ข้อมูลการรับผิดชอบนักเรียน (สำหรับครูที่ปรึกษา) =====
  homeroom_level: {
    type: String,
    description: "ระดับชั้นที่รับผิดชอบ (เช่น ปวช.1, ปวช.2, ปวช.3)",
  },
  homeroom_class: {
    type: String,
    description: "กลุ่มเรียนที่รับผิดชอบ (เช่น 1, 2, 3, ดนตรีไทย, คอมพิวเตอร์)",
  },
  homeroom_class_range: [{
    type: String,
    description: "เลขที่ที่รับผิดชอบ (เช่น ['1', '2', '3'] หรือ ['1-15'])"
  }],
  assigned_students: [{
    student_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Student",
      required: true
    },
    student_name: { type: String },
    class_number: { type: String },
    assigned_date: { 
      type: Date, 
      default: Date.now 
    },
    is_active: { 
      type: Boolean, 
      default: true 
    }
  }],
  department: {
    type: String,
    description: "แผนกวิชาที่สังกัด (เช่น คอมพิวเตอร์ธุรกิจ, ดนตรีไทย, การบัญชี)",
  },
  subject_specialization: [{
    type: String,
    description: "วิชาที่สามารถสอนได้"
  }],
  work_schedule: {
    monday: [{ type: String }],
    tuesday: [{ type: String }],
    wednesday: [{ type: String }],
    thursday: [{ type: String }],
    friday: [{ type: String }],
  },

  // ===== ข้อมูลระบบ =====
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    description: "ผู้ใช้ที่สร้างบัญชีนี้ (admin)",
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    description: "ผู้ใช้ที่แก้ไขบัญชีนี้ล่าสุด",
  },
}, {
  timestamps: true,
  collection: "users",
});

// ✅ คงไว้เฉพาะ index ที่จำเป็น (ไม่มี index ซ้ำ)
UserSchema.index({ role: 1 });
// ❌ ลบอันนี้: UserSchema.index({ teacher_id: 1 });  // ซ้ำกับ unique:true
UserSchema.index({ homeroom_level: 1, homeroom_class: 1 });
UserSchema.index({ department: 1 });
UserSchema.index({ "assigned_students.student_id": 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);