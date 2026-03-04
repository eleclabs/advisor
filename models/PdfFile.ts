import mongoose from "mongoose";

const PdfSchema = new mongoose.Schema({
  title: String,
  fileName: String,
  fileUrl: String,
  publicId: String,
  fileType: String,
  format: String, // นามสกุลไฟล์จาก Cloudinary
  resourceType: String, // ประเภททรัพยากร (image, video, raw)
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.PdfFile || mongoose.model("PdfFile", PdfSchema);
