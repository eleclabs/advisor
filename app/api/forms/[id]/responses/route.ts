// app/api/forms/[id]/responses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Form from "@/models/Form";
import FormResponse from "@/models/FormResponse";

// GET - ดึงข้อมูลการตอบแบบฟอร์มทั้งหมดสำหรับวิเคราะห์
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    
    // ดึง query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'submittedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // ตรวจสอบว่าแบบฟอร์มมีอยู่
    const form = await Form.findById(id)
      .populate('createdBy', 'first_name last_name role');

    if (!form) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบแบบฟอร์ม' },
        { status: 404 }
      );
    }

    // สร้าง sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // ดึงข้อมูลการตอบแบบฟอร์ม
    const responses = await FormResponse.find({ formId: id })
      .populate('userId', 'first_name last_name email role gender birthDate')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    // นับจำนวนทั้งหมด
    const total = await FormResponse.countDocuments({ formId: id });

    // สถิติพื้นฐาน
    const stats = {
      totalResponses: total,
      averageCompletion: 0,
      responsesByRole: {} as any,
      responsesByGender: {} as any,
      responsesByAgeRange: {} as any,
      submissionDates: [] as any[]
    };

    // คำนวณสถิติ
    responses.forEach(response => {
      // ตามบทบาท
      const role = response.userRole || 'unknown';
      stats.responsesByRole[role] = (stats.responsesByRole[role] || 0) + 1;
      
      // ตามเพศ
      const gender = response.userGender || 'unknown';
      stats.responsesByGender[gender] = (stats.responsesByGender[gender] || 0) + 1;
      
      // ตามช่วงอายุ
      const ageRange = response.userAgeRange || 'unknown';
      stats.responsesByAgeRange[ageRange] = (stats.responsesByAgeRange[ageRange] || 0) + 1;
      
      // วันที่ส่ง
      const date = new Date(response.submittedAt).toISOString().split('T')[0];
      const existingDate = stats.submissionDates.find(d => d.date === date);
      if (existingDate) {
        existingDate.count++;
      } else {
        stats.submissionDates.push({ date, count: 1 });
      }
    });

    // คำนวณค่าเฉลี่ยการทำแบบฟอร์ม (สมมติว่าทุกคนทำเสร็จเสมอ)
    stats.averageCompletion = 100;

    // เรียงวันที่
    stats.submissionDates.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      data: {
        form,
        responses,
        stats,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: responses.length,
          totalItems: total
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching form responses:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// GET - ดึงข้อมูลการตอบแบบฟอร์มเฉพาะ ID ที่ระบุ
export async function GET_BY_ID(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  try {
    await connectDB();
    const { id, responseId } = await params;

    const response = await FormResponse.findOne({ _id: responseId, formId: id })
      .populate('userId', 'first_name last_name email role gender birthDate')
      .populate('formId', 'title description category');

    if (!response) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลการตอบแบบฟอร์ม' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error: any) {
    console.error('❌ Error fetching form response:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
