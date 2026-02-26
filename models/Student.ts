import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  id: { type: String }, //รหัสนักเรียน
  prefix: { type: String }, //คำนำหน้า
  first_name: { type: String }, //ชื่อจริง
  last_name: { type: String }, //นามสกุล
  email: { type: String }, //อีเมล
  phone_number: { type: String }, //เบอร์โทรศัพท์   
  image: { type: String },   // Cloudinary URL
  status: { type: String },  //สถานะ (เช่น นักเรียนปกติ, นักเรียนเสี่ยง)
  nickname: { type: String }, //ชื่อเล่น
  gender: { type: String }, //เพศ
  birth_date: { type: String }, //วันเกิด
  level: { type: String },    //ระดับชั้น
  class_group: { type: String }, //กลุ่มเรียน
  class_number: { type: String }, //เลขที่
  advisor_id: { type: String }, //รหัสอาจารย์ที่ปรึกษา
  advisor_name: { type: String }, //ชื่ออาจารย์ที่ปรึกษา
  religion: { type: String }, //ศาสนา
  address: { type: String }, //ที่อยู่
  weight: { type: String }, //น้ำหนัก
  height: { type: String },  //ส่วนสูง
  bmi: { type: String }, //ค่าดัชนีมวลกาย
  blood_type: { type: String }, //กรุ๊ปเลือด 
  // ข้อมูลทั่วไป
  semester: { type: String }, //ภาคเรียน
  academic_year: { type: String }, //ปีการศึกษา
  parent_name: { type: String }, //ชื่อผู้ปกครอง
  parent_relationship: { type: String }, //ความสัมพันธ์กับนักเรียน
  parent_phone: { type: String }, //เบอร์โทรผู้ปกครอง
  
  // สถานภาพครอบครัว
  family_status: [{ type: String }], // ✅ แก้ไขจาก String[] เป็น [{ type: String }]
  living_with: { type: String }, //อาศัยอยู่กับใคร
  living_with_other: { type: String }, //รายละเอียดเพิ่มเติมสำหรับสถานภาพครอบครัว
  housing_type: { type: String }, //ประเภทที่อยู่อาศัย (เช่น บ้าน, คอนโด, หอพัก)
  housing_type_other: { type: String }, //รายละเอียดเพิ่มเติมสำหรับประเภทที่อยู่อาศัย
  transportation: [{ type: String }], // ✅ แก้ไขจาก String[] เป็น [{ type: String }]
  
  // ด้านการเรียน
  strengths: { type: String }, //จุดแข็งด้านการเรียน
  weak_subjects: { type: String }, //วิชาที่อ่อนแอ
  hobbies: { type: String }, //งานอดิเรก
  home_behavior: { type: String }, //พฤติกรรมที่บ้าน
  
  // ด้านสุขภาพ
  chronic_disease: { type: String }, //โรคประจำตัว
  risk_behaviors: [{ type: String }], // ✅ แก้ไขจาก String[] เป็น [{ type: String }]
  parent_concerns: { type: String }, //ความกังวลของผู้ปกครองเกี่ยวกับสุขภาพของนักเรียน
  
  // ด้านเศรษฐกิจ
  family_income: { type: String }, //รายได้ครอบครัว
  daily_allowance: { type: String }, //ค่าใช้จ่ายรายวัน
  assistance_needs: [{ type: String }], // ✅ แก้ไขจาก String[] เป็น [{ type: String }]
  
  // สรุปความเห็น
  student_group: { type: String }, //กลุ่มนักเรียน (เช่น กลุ่มเสี่ยง, กลุ่มปกติ)
  help_guidelines: { type: String }, //แนวทางการช่วยเหลือ
  home_visit_file: { type: String }, //ไฟล์รายงานการเยี่ยมบ้าน (เช่น PDF หรือรูปภาพ)
  created_at: { type: String }, //วันที่สร้าง
  updated_at: { type: String }, //วันที่อัปเดต
}, { timestamps: true });

export default mongoose.models.Student ||
  mongoose.model("Student", StudentSchema);