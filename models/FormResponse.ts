// models/FormResponse.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IFormResponse extends Document {
  formId: mongoose.Schema.Types.ObjectId;
  userId?: mongoose.Schema.Types.ObjectId;
  userName: string;
  userEmail: string;
  userRole: string;
  answers: {
    questionId: number;
    questionText: string;
    answer: any;
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
  answers: [{
    questionId: { type: Number, required: true },
    questionText: { type: String, required: true },
    answer: Schema.Types.Mixed
  }],
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

FormResponseSchema.index({ formId: 1 });
FormResponseSchema.index({ userId: 1 });
FormResponseSchema.index({ submittedAt: -1 });

export default mongoose.models.FormResponse || mongoose.model('FormResponse', FormResponseSchema);