import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessment extends Document {
  studentId: string;
  studentName: string;
  grade: string;
  classroom: string;
  gender: string;
  age?: string;
  assessmentType: 'sdq' | 'dass21';
  sdqScore?: {
    totalScore: number;
    interpretation: string;
  };
  dass21Score?: {
    depression: number;
    depressionLevel: string;
    anxiety: number;
    anxietyLevel: string;
    stress: number;
    stressLevel: string;
  };
  answers: Record<string, string>;
  assessmentDate: Date;
}

const AssessmentSchema = new Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  grade: { type: String, required: true },
  classroom: { type: String },
  gender: { type: String },
  age: { type: String },
  assessmentType: { 
    type: String, 
    enum: ['sdq', 'dass21'], 
    required: true 
  },
  sdqScore: {
    totalScore: Number,
    interpretation: String
  },
  dass21Score: {
    depression: Number,
    depressionLevel: String,
    anxiety: Number,
    anxietyLevel: String,
    stress: Number,
    stressLevel: String
  },
  answers: { type: Object, required: true },
  assessmentDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);