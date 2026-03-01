import mongoose from "mongoose";

// Schema สำหรับการส่งต่อ
const ReferralSchema = new mongoose.Schema({
  student_id: { type: String, required: true, ref: 'Student' },
  student_name: { type: String, required: true },
  student_level: { type: String, required: true },
  student_class: { type: String, required: true },
  student_number: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["internal", "external"], 
    required: true 
  },
  target: { type: String, required: true },
  reason_category: { type: String, required: true },
  reason_detail: { type: String, required: true },
  actions_taken: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["อยู่ระหว่างดำเนินการ", "สิ้นสุดการช่วยเหลือ"], 
    default: "อยู่ระหว่างดำเนินการ" 
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Schema สำหรับการประสานงาน
const CoordinationSchema = new mongoose.Schema({
  referral_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Referral', required: true },
  organization: { type: String, required: true },
  contact_person: { type: String, required: true },
  channel: { type: String, required: true },
  details: { type: String, required: true },
  agreement: { type: String, required: true },
  coordination_date: { type: Date, required: true },
  created_at: { type: Date, default: Date.now }
});

// Schema สำหรับการติดตามผล
const FollowUpSchema = new mongoose.Schema({
  referral_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Referral', required: true },
  follow_date: { type: Date, required: true },
  result: { type: String, required: true },
  notes: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

export const Referral = mongoose.models.Referral || mongoose.model('Referral', ReferralSchema);
export const Coordination = mongoose.models.Coordination || mongoose.model('Coordination', CoordinationSchema);
export const FollowUp = mongoose.models.FollowUp || mongoose.model('FollowUp', FollowUpSchema);
