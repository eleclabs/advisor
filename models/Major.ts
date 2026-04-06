// models/Major.ts
import mongoose from "mongoose";

const MajorSchema = new mongoose.Schema({
  major_id: { 
    type: Number, 
    required: true,
    unique: true,
    description: "ลำดับที่สาขาวิชา"
  },
  major_name: { 
    type: String, 
    required: true,
    description: "ชื่อสาขาวิชา"
  }
}, {
  timestamps: true,
  collection: "majors"
});

// Pre-save hook to generate sequential ID
MajorSchema.pre('save', async function(next: any) {
  if (this.isNew && !this.major_id) {
    try {
      const Major = mongoose.model('Major');
      const lastMajor = await Major.findOne().sort('-major_id');
      this.major_id = lastMajor ? lastMajor.major_id + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export default mongoose.models.Major || mongoose.model("Major", MajorSchema);