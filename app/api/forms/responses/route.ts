import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FormResponse from "@/models/FormResponse";
import Form from "@/models/Form";

// GET - ดึงข้อมูลการตอบแบบฟอร์มทั้งหมด
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const formId = searchParams.get('formId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');

    const filter: any = {};
    
    if (formId) filter.formId = formId;
    if (userId) filter.userId = userId;

    const skip = (page - 1) * limit;

    // ดึงข้อมูลการตอบแบบฟอร์มพร้อมข้อมูลแบบฟอร์ม
    const responses = await FormResponse.find(filter)
      .populate('formId', 'title description category')
      .populate('userId', 'first_name last_name email role')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    // แปลงข้อมูลให้ตรงกับ interface ที่ต้องการ
    const formattedResponses = responses.map(response => ({
      _id: response._id,
      formId: response.formId._id,
      formTitle: response.formId.title,
      studentName: response.userName,
      studentId: response.userId?._id || response.userEmail,
      answers: response.answers,
      submittedAt: response.submittedAt,
      submittedBy: response.userName
    }));

    // นับจำนวนทั้งหมด
    const totalCount = await FormResponse.countDocuments(filter);

    return NextResponse.json({
      success: true,
      responses: formattedResponses,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error: any) {
    console.error('Error fetching form responses:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
