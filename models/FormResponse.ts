// models/FormResponse.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IFormResponse extends Document {
  formId: mongoose.Schema.Types.ObjectId;
  userId?: mongoose.Schema.Types.ObjectId;
  userName: string;
  userEmail: string;
  userRole: string;
  userGender?: string;
  userAgeRange?: string;
  userBirthDate?: string;
  answers: {
    questionId: number;
    questionText: string;
    questionType?: string;
    answer: any;
    sectionId?: string;
    sectionTitle?: string;
    sectionOrder?: number;
  }[];
  submittedAt: Date;
}

const FormResponseSchema = new Schema({
  formId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Form', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userRole: { type: String, required: true },
  userGender: { type: String },
  userAgeRange: { type: String },
  userBirthDate: { type: String },
  answers: [{
    questionId: { type: Number, required: true },
    questionText: { type: String, required: true },
    questionType: { type: String },
    answer: Schema.Types.Mixed,
    sectionId: { type: String },
    sectionTitle: { type: String },
    sectionOrder: { type: Number }
  }],
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

FormResponseSchema.index({ formId: 1 });
FormResponseSchema.index({ userId: 1 });
FormResponseSchema.index({ submittedAt: -1 });

export default mongoose.models.FormResponse || mongoose.model('FormResponse', FormResponseSchema);