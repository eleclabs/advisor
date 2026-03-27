// D:\advisor-main\models\Evaluation.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IEvaluation extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  studentName: string;
  gender: string;
  ageRange: string;
  role: string;
  evaluationDate: Date;
  functionRequirement: {
    dataAccess: number;
    dataAdd: number;
    dataUpdate: number;
    dataPresentation: number;
    dataAccuracy: number;
  };
  functionality: {
    overallAccuracy: number;
    dataClassification: number;
    addDataAccuracy: number;
    updateDataAccuracy: number;
    presentationAccuracy: number;
  };
  usability: {
    easeOfUse: number;
    screenDesign: number;
    textClarity: number;
    accessibility: number;
    overallUsability: number;
  };
  performance: {
    pageLoadSpeed: number;
    databaseSpeed: number;
    saveUpdateSpeed: number;
    overallPerformance: number;
  };
  additionalSuggestions: string;
  overallRating: number;
}

const EvaluationSchema = new Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  studentName: { type: String, required: true },
  // ❌ ลบ studentCode, studentClass ออก
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'], 
    required: true 
  },
  ageRange: { 
    type: String, 
    enum: ['under-20', '20-30', '31-40', '41-50', 'over-50'], 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['ADMIN', 'TEACHER', 'EXECUTIVE', 'COMMITTEE'], 
    required: true 
  },
  evaluationDate: { type: Date, default: Date.now },
  functionRequirement: {
    dataAccess: { type: Number, required: true, min: 1, max: 5 },
    dataAdd: { type: Number, required: true, min: 1, max: 5 },
    dataUpdate: { type: Number, required: true, min: 1, max: 5 },
    dataPresentation: { type: Number, required: true, min: 1, max: 5 },
    dataAccuracy: { type: Number, required: true, min: 1, max: 5 }
  },
  functionality: {
    overallAccuracy: { type: Number, required: true, min: 1, max: 5 },
    dataClassification: { type: Number, required: true, min: 1, max: 5 },
    addDataAccuracy: { type: Number, required: true, min: 1, max: 5 },
    updateDataAccuracy: { type: Number, required: true, min: 1, max: 5 },
    presentationAccuracy: { type: Number, required: true, min: 1, max: 5 }
  },
  usability: {
    easeOfUse: { type: Number, required: true, min: 1, max: 5 },
    screenDesign: { type: Number, required: true, min: 1, max: 5 },
    textClarity: { type: Number, required: true, min: 1, max: 5 },
    accessibility: { type: Number, required: true, min: 1, max: 5 },
    overallUsability: { type: Number, required: true, min: 1, max: 5 }
  },
  performance: {
    pageLoadSpeed: { type: Number, required: true, min: 1, max: 5 },
    databaseSpeed: { type: Number, required: true, min: 1, max: 5 },
    saveUpdateSpeed: { type: Number, required: true, min: 1, max: 5 },
    overallPerformance: { type: Number, required: true, min: 1, max: 5 }
  },
  additionalSuggestions: { type: String, default: '' },
  overallRating: { type: Number, default: 0 }
}, { timestamps: true });

EvaluationSchema.index({ userId: 1 });
EvaluationSchema.index({ role: 1 });
EvaluationSchema.index({ evaluationDate: -1 });

export default mongoose.models.Evaluation || mongoose.model('Evaluation', EvaluationSchema);