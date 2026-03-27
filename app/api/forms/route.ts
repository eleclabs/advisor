// app/api/forms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Form from "@/models/Form";

// GET - ดึงรายการแบบฟอร์ม
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');
    const category = searchParams.get('category');

    const filter: any = {};
    
    if (category) filter.category = category;

    // ✅ Admin เห็นแบบฟอร์มทั้งหมด (รวม draft)
    if (userRole === 'ADMIN') {
      // ไม่ต้อง filter status
    } else {
      // ✅ ผู้ใช้ทั่วไปเห็น:
      // 1. แบบฟอร์มมาตรฐาน (ทุกสถานะ)
      // 2. แบบฟอร์มที่ active และมอบหมายให้
      // 3. ✅ แบบฟอร์มที่ตัวเองสร้าง (ทุกสถานะ รวม draft)
      filter.$or = [
        { isStandard: true },
        { 
          $and: [
            { status: 'active' },
            { $or: [
              { targetRoles: { $in: [userRole] } },
              { targetAllStudents: true }
            ]}
          ]
        },
        { createdBy: userId } // ✅ เห็นแบบฟอร์มตัวเองทุกสถานะ
      ];
    }

    const forms = await Form.find(filter)
      .populate('createdBy', 'first_name last_name role')
      .sort({ isStandard: -1, createdAt: -1 });

    console.log('✅ Forms found:', forms.length);
    console.log('📋 Forms:', forms.map(f => ({ 
      _id: f._id, 
      title: f.title, 
      isStandard: f.isStandard, 
      status: f.status,
      createdBy: f.createdBy?._id
    })));

    return NextResponse.json({ success: true, forms });
  } catch (error: any) {
    console.error('❌ Forms API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - สร้างแบบฟอร์มใหม่ (เฉพาะแบบกำหนดเอง)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      title,
      description,
      category,
      createdBy,
      createdByName,
      targetRoles,
      targetStudents,
      targetAllStudents,
      questions,
      status,
      startDate,
      endDate
    } = body;

    // ✅ แบบฟอร์มมาตรฐานสร้างผ่าน seed เท่านั้น
    if (body.isStandard) {
      return NextResponse.json(
        { success: false, message: 'แบบฟอร์มมาตรฐานไม่สามารถสร้างผ่าน API ได้' },
        { status: 400 }
      );
    }

    if (!title || !description || !category || !createdBy) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ต้องมีอย่างน้อย 1 ข้อคำถาม' },
        { status: 400 }
      );
    }

    // ✅ Admin ต้องเห็นเสมอ
    const isVisibleToAdmin = true;

    const newForm = await Form.create({
      title,
      description,
      category,
      type: 'custom',
      isStandard: false,
      createdBy,
      createdByName,
      targetRoles: targetRoles || ['STUDENT'],
      targetStudents: targetStudents || [],
      targetAllStudents: targetAllStudents || false,
      isVisibleToAdmin,
      status: status || 'draft',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      questions: questions.map((q: any, index: number) => ({
        order: index + 1,
        questionText: q.questionText,
        questionType: q.questionType || 'scale',
        options: q.options || [],
        required: q.required !== false
      }))
    });

    console.log('✅ Form created:', newForm._id, 'isStandard:', newForm.isStandard, 'status:', newForm.status);

    return NextResponse.json({
      success: true,
      data: newForm,
      message: 'สร้างแบบฟอร์มสำเร็จ'
    });
  } catch (error: any) {
    console.error('❌ Error creating form:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - อัปเดตแบบฟอร์ม (เฉพาะแบบกำหนดเอง)
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ระบุ ID แบบฟอร์ม' },
        { status: 400 }
      );
    }

    const existingForm = await Form.findById(id);
    if (!existingForm) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบแบบฟอร์ม' },
        { status: 404 }
      );
    }

    // ✅ ห้ามแก้ไขแบบฟอร์มมาตรฐาน
    if (existingForm.isStandard) {
      return NextResponse.json(
        { success: false, message: 'แบบฟอร์มมาตรฐานไม่สามารถแก้ไขได้' },
        { status: 403 }
      );
    }

    const updatedForm = await Form.findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json({
      success: true,
      data: updatedForm,
      message: 'อัปเดตแบบฟอร์มสำเร็จ'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - ลบแบบฟอร์ม (เฉพาะแบบกำหนดเอง)
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ระบุ ID แบบฟอร์ม' },
        { status: 400 }
      );
    }

    const existingForm = await Form.findById(id);
    if (!existingForm) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบแบบฟอร์ม' },
        { status: 404 }
      );
    }

    // ✅ ห้ามลบแบบฟอร์มมาตรฐาน
    if (existingForm.isStandard) {
      return NextResponse.json(
        { success: false, message: 'แบบฟอร์มมาตรฐานไม่สามารถลบได้' },
        { status: 403 }
      );
    }

    await Form.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'ลบแบบฟอร์มสำเร็จ'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}