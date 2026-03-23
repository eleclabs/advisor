// D:\advisor-main\models\Evaluation.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IEvaluation extends Document {
  studentId: string;
  studentName: string;
  studentCode: string;
  studentClass: string;
  evaluationDate: Date;
  
  // 1. ด้านตรงตามความต้องการ (Function Requirement)
  functionRequirement: {
    dataAccess: number;        // ความสามารถในการเรียกใช้งานในระบบฐานข้อมูล
    dataAdd: number;           // ความสามารถของระบบในการเพิ่มข้อมูล
    dataUpdate: number;        // ความสามารถของระบบในการปรับปรุงข้อมูล
    dataPresentation: number;  // ความสามารถของระบบในการนำเสนอข้อมูล
    dataAccuracy: number;      // ระบบฐานข้อมูลมีความถูกต้องครบถ้วน
  };
  
  // 2. ด้านสามารถทำงานได้ตามหน้าที่ (Function)
  functionality: {
    overallAccuracy: number;   // ความถูกต้องของการทำงานระบบในภาพรวม
    dataClassification: number; // ความถูกต้องของระบบในการจัดประเภทของข้อมูล
    addDataAccuracy: number;   // ความถูกต้องของระบบในการเพิ่มข้อมูล
    updateDataAccuracy: number; // ความถูกต้องของระบบในการปรับปรุงข้อมูล
    presentationAccuracy: number; // ความถูกต้องของระบบในการนำเสนอข้อมูล
  };
  
  // 3. ด้านความง่ายต่อการใช้งาน (Usability)
  usability: {
    easeOfUse: number;         // ความง่ายในการเรียกใช้ระบบ
    screenDesign: number;      // ความเหมาะสมในการออกแบบหน้าจอโดยภาพรวม
    textClarity: number;       // ความชัดเจนของข้อความที่แสดงบนจอภาพ
    accessibility: number;     // ความสะดวกในการเข้าใช้ระบบ
    overallUsability: number;  // ความน่าใช้ของระบบในภาพรวม
  };
  
  // 4. ด้านประสิทธิภาพ (Performance)
  performance: {
    pageLoadSpeed: number;     // ความเร็วในการแสดงผลจากการเชื่อมโยงเพจ
    databaseSpeed: number;     // ความเร็วในการติดต่อกับฐานข้อมูล
    saveUpdateSpeed: number;   // ความเร็วในการบันทึกปรับปรุงข้อมูล
    overallPerformance: number; // ความเร็วในการทำงานของระบบในภาพรวม
  };
  
  additionalSuggestions: string; // ข้อเสนอแนะอื่นๆ
  overallRating: number;        // คะแนนรวมเฉลี่ย
}

const EvaluationSchema = new Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentCode: { type: String, required: true },
  studentClass: { type: String, required: true },
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

export default mongoose.models.Evaluation || mongoose.model<IEvaluation>('Evaluation', EvaluationSchema);