// D:\advisor-main\app\api\evaluation\route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Evaluation from '@/models/Evaluation';
import User from '@/models/User';

// GET - ดึงข้อมูลการประเมินทั้งหมด
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let evaluations;
    if (userId) {
      evaluations = await Evaluation.find({ userId }).populate('userId', 'first_name last_name role').sort({ evaluationDate: -1 });
    } else {
      evaluations = await Evaluation.find({}).populate('userId', 'first_name last_name role').sort({ evaluationDate: -1 });
    }

    const stats = {
      total: evaluations.length,
      averageOverall: evaluations.length > 0 ? evaluations.reduce((sum: number, e: any) => sum + e.overallRating, 0) / evaluations.length : 0,
      averageFunctionRequirement: evaluations.length > 0 ? evaluations.reduce((sum: number, e: any) => {
        const avg = (e.functionRequirement.dataAccess + e.functionRequirement.dataAdd + 
                     e.functionRequirement.dataUpdate + e.functionRequirement.dataPresentation + 
                     e.functionRequirement.dataAccuracy) / 5;
        return sum + avg;
      }, 0) / evaluations.length : 0,
      averageFunctionality: evaluations.length > 0 ? evaluations.reduce((sum: number, e: any) => {
        const avg = (e.functionality.overallAccuracy + e.functionality.dataClassification + 
                     e.functionality.addDataAccuracy + e.functionality.updateDataAccuracy + 
                     e.functionality.presentationAccuracy) / 5;
        return sum + avg;
      }, 0) / evaluations.length : 0,
      averageUsability: evaluations.length > 0 ? evaluations.reduce((sum: number, e: any) => {
        const avg = (e.usability.easeOfUse + e.usability.screenDesign + e.usability.textClarity + 
                     e.usability.accessibility + e.usability.overallUsability) / 5;
        return sum + avg;
      }, 0) / evaluations.length : 0,
      averagePerformance: evaluations.length > 0 ? evaluations.reduce((sum: number, e: any) => {
        const avg = (e.performance.pageLoadSpeed + e.performance.databaseSpeed + 
                     e.performance.saveUpdateSpeed + e.performance.overallPerformance) / 4;
        return sum + avg;
      }, 0) / evaluations.length : 0,
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

    // ✅ Validate userId
    if (!body.userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required field: userId' 
      }, { status: 400 });
    }

    // ✅ Validate user exists
    const user = await User.findById(body.userId);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Validate required fields
    if (!body.studentName || !body.gender || !body.ageRange) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: studentName, gender, ageRange' 
      }, { status: 400 });
    }

    // Validate nested objects
    if (!body.functionRequirement || !body.functionality || !body.usability || !body.performance) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing evaluation data sections' 
      }, { status: 400 });
    }

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

    // ✅ Map frontend fields to backend schema
    const evaluationData = {
      userId: body.userId,
      studentName: body.studentName,
      studentCode: body.studentCode || `STU_${Date.now()}`,
      studentClass: body.studentClass || 'N/A',
      gender: body.gender,
      ageRange: body.ageRange,
      role: body.role || user.role,
      functionRequirement: body.functionRequirement,
      functionality: body.functionality,
      usability: body.usability,
      performance: body.performance,
      additionalSuggestions: body.additionalSuggestions || '',
      overallRating: Math.round(overallRating * 10) / 10,
      evaluationDate: new Date()
    };

    const evaluation = await Evaluation.create(evaluationData);

    return NextResponse.json({ success: true, evaluation }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating evaluation:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create evaluation',
      details: error.message
    }, { status: 500 });
  }
}