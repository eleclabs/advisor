// D:\advisor-main\app\api\evaluation\route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Evaluation from '@/models/Evaluation';

// GET - ดึงข้อมูลการประเมินทั้งหมด (สำหรับดูผล)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    let evaluations;
    if (studentId) {
      evaluations = await Evaluation.find({ studentId }).sort({ evaluationDate: -1 });
    } else {
      evaluations = await Evaluation.find({}).sort({ evaluationDate: -1 });
    }
    
    // คำนวณสถิติรวม
    const stats = {
      total: evaluations.length,
      averageOverall: evaluations.reduce((sum, e) => sum + e.overallRating, 0) / evaluations.length || 0,
      averageFunctionRequirement: evaluations.reduce((sum, e) => {
        const avg = (e.functionRequirement.dataAccess + e.functionRequirement.dataAdd + 
                     e.functionRequirement.dataUpdate + e.functionRequirement.dataPresentation + 
                     e.functionRequirement.dataAccuracy) / 5;
        return sum + avg;
      }, 0) / evaluations.length || 0,
      averageFunctionality: evaluations.reduce((sum, e) => {
        const avg = (e.functionality.overallAccuracy + e.functionality.dataClassification + 
                     e.functionality.addDataAccuracy + e.functionality.updateDataAccuracy + 
                     e.functionality.presentationAccuracy) / 5;
        return sum + avg;
      }, 0) / evaluations.length || 0,
      averageUsability: evaluations.reduce((sum, e) => {
        const avg = (e.usability.easeOfUse + e.usability.screenDesign + e.usability.textClarity + 
                     e.usability.accessibility + e.usability.overallUsability) / 5;
        return sum + avg;
      }, 0) / evaluations.length || 0,
      averagePerformance: evaluations.reduce((sum, e) => {
        const avg = (e.performance.pageLoadSpeed + e.performance.databaseSpeed + 
                     e.performance.saveUpdateSpeed + e.performance.overallPerformance) / 4;
        return sum + avg;
      }, 0) / evaluations.length || 0,
    };
    
    return NextResponse.json({ success: true, evaluations, stats });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch evaluations' }, { status: 500 });
  }
}

// POST - บันทึกการประเมินใหม่
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // คำนวณคะแนนรวมเฉลี่ย
    const functionReqAvg = (body.functionRequirement.dataAccess + body.functionRequirement.dataAdd + 
                            body.functionRequirement.dataUpdate + body.functionRequirement.dataPresentation + 
                            body.functionRequirement.dataAccuracy) / 5;
    
    const functionalityAvg = (body.functionality.overallAccuracy + body.functionality.dataClassification + 
                              body.functionality.addDataAccuracy + body.functionality.updateDataAccuracy + 
                              body.functionality.presentationAccuracy) / 5;
    
    const usabilityAvg = (body.usability.easeOfUse + body.usability.screenDesign + body.usability.textClarity + 
                          body.usability.accessibility + body.usability.overallUsability) / 5;
    
    const performanceAvg = (body.performance.pageLoadSpeed + body.performance.databaseSpeed + 
                            body.performance.saveUpdateSpeed + body.performance.overallPerformance) / 4;
    
    const overallRating = (functionReqAvg + functionalityAvg + usabilityAvg + performanceAvg) / 4;
    
    const evaluation = await Evaluation.create({
      ...body,
      overallRating: Math.round(overallRating * 10) / 10,
      evaluationDate: new Date()
    });
    
    return NextResponse.json({ success: true, evaluation }, { status: 201 });
  } catch (error) {
    console.error('Error creating evaluation:', error);
    return NextResponse.json({ success: false, error: 'Failed to create evaluation' }, { status: 500 });
  }
}