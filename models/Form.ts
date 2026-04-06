// models/Form.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IForm extends Document {
  type: string;
  title: string;
  description: string;
  category: 'psychological' | 'survey' | 'custom';
  subType?: 'sdq' | 'dass21' | 'system';
  isStandard: boolean; // true = แบบมาตรฐาน (แก้ไขไม่ได้) , false = แบบสร้างเอง
  
  // เพิมฟีลด์สำหรับโครงสร้างแบบหัวข้อหลัก/ย่อย
  formStructure?: {
    title: string;
    description: string;
    category: 'psychological' | 'survey' | 'custom';
    sections: {
      id: string;
      title: string;
      description: string;
      questions: {
        order: number;
        questionText: string;
        questionType: 'radio' | 'checkbox' | 'text' | 'scale';
        options: { id: string; text: string }[];
        required: boolean;
        sectionId: string;
        sectionTitle: string;
        sectionOrder: number;
      }[];
      order: number;
    }[];
  };
  
  createdBy?: mongoose.Schema.Types.ObjectId;
  createdByName?: string;
  targetRoles: string[];
  targetStudents?: mongoose.Schema.Types.ObjectId[];
  targetAllStudents?: boolean;
  isVisibleToAdmin: boolean;
  status: 'active' | 'inactive' | 'draft';
  startDate?: Date;
  endDate?: Date;
  questions: {
    order: number;
    questionText: string;
    questionType: 'radio' | 'checkbox' | 'text' | 'scale';
    options?: string[];
    required: boolean;
    // เพิมฟีลด์สำหรับจัดการหัวข้อ
    sectionId?: string;
    sectionTitle?: string;
    sectionOrder?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const FormSchema = new Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['psychological', 'survey', 'custom'], 
    required: true 
  },
  subType: { 
    type: String, 
    enum: ['sdq', 'dass21', 'system']
  },
  isStandard: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdByName: { type: String },
  targetRoles: [{ 
    type: String, 
    enum: ['STUDENT', 'TEACHER', 'ADMIN', 'EXECUTIVE', 'COMMITTEE'] 
  }],
  targetStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  targetAllStudents: { type: Boolean, default: false },
  isVisibleToAdmin: { type: Boolean, default: true },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'draft'], 
    default: 'active' 
  },
  startDate: { type: Date },
  endDate: { type: Date },
  // เพิม formStructure field สำหรับเก็บโครงสร้างแบบหัวข้อหลัก/ย่อย
  formStructure: {
    title: { type: String },
    description: { type: String },
    category: { 
      type: String, 
      enum: ['psychological', 'survey', 'custom']
    },
    sections: [{
      id: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String },
      order: { type: Number, required: true },
      questions: [{
        order: { type: Number, required: true },
        questionText: { type: String, required: true },
        questionType: { 
          type: String, 
          enum: ['radio', 'checkbox', 'text', 'scale'], 
          required: true,
          default: 'scale' 
        },
        options: [{
          id: { type: String, required: true },
          text: { type: String, required: true }
        }],
        required: { type: Boolean, default: true },
        sectionId: { type: String, required: true },
        sectionTitle: { type: String, required: true },
        sectionOrder: { type: Number, required: true }
      }]
    }]
  },
  questions: [{
    order: { type: Number, required: true },
    questionText: { type: String, required: true },
    questionType: { 
      type: String, 
      enum: ['radio', 'checkbox', 'text', 'scale'], 
      required: true,
      default: 'scale' 
    },
    options: [String],
    required: { type: Boolean, default: true },
    // เพิมฟีลด์สำหรับจัดการหัวข้อ
    sectionId: { type: String },
    sectionTitle: { type: String },
    sectionOrder: { type: Number }
  }]
}, { timestamps: true });

FormSchema.index({ category: 1, isStandard: 1 });
FormSchema.index({ createdBy: 1 });
FormSchema.index({ status: 1 });

export default mongoose.models.Form || mongoose.model('Form', FormSchema);