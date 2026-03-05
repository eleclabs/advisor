import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Problem from "@/models/Problem";
import { Referral } from "@/models/Send";
import cloudinary from "@/lib/cloudinary";

/* ===================== PUT ===================== */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  console.log(`🚀 PUT /api/student/${id} เริ่มทำงาน`);

  try {
    await connectDB();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสนักศึกษา" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    console.log("📝 ข้อมูลที่ได้รับจาก FormData:");

    // สร้าง object สำหรับเก็บข้อมูลที่จะอัปเดต
    const updateData: any = {};

    // ดึงข้อมูลจาก FormData ยกเว้นไฟล์
    const allowedFields = [
      'id', 'prefix', 'first_name', 'last_name', 'nickname', 'gender', 'birth_date',
      'level', 'class_group', 'class_number', 'advisor_name', 'phone_number', 'religion',
      'address', 'weight', 'height', 'blood_type', 'status',
      // ข้อมูลการสัมภาษณ์
      'semester', 'academic_year', 'parent_name', 'parent_relationship', 'parent_phone',
      'family_status', 'living_with', 'living_with_other', 'housing_type', 'housing_type_other',
      'transportation', 'strengths', 'weak_subjects', 'hobbies', 'home_behavior',
      'chronic_disease', 'risk_behaviors', 'parent_concerns', 'family_income',
      'daily_allowance', 'assistance_needs', 'student_group', 'help_guidelines'
    ];

    for (const field of allowedFields) {
      const value = formData.get(field);
      if (value !== null && value !== undefined) {
        // จัดการ array fields
        if (field === 'family_status' || field === 'transportation' || field === 'risk_behaviors' || field === 'assistance_needs') {
          if (typeof value === 'string') {
            try {
              updateData[field] = JSON.parse(value);
            } catch {
              updateData[field] = [value];
            }
          } else {
            updateData[field] = value;
          }
        } else {
          updateData[field] = value;
        }
      }
    }

    // จัดการไฟล์เยี่ยมบ้านใหม่ (ถ้ามี)
    const newHomeVisitFiles: { name: string, url: string }[] = [];

    for (let i = 0; formData.has(`home_visit_files[${i}]`); i++) {
      const file = formData.get(`home_visit_files[${i}]`) as File;

      if (file && file.size > 0) {
        try {
          // อัปโหลดไป Cloudinary
          const buffer = Buffer.from(await file.arrayBuffer());

          const upload = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { 
                folder: "home_visit_files",
                resource_type: "raw"
              }, 
              (err, result) => {
                if (err) reject(err);
                else resolve(result);
              }
            ).end(buffer);
          });

          newHomeVisitFiles.push({
            name: file.name,
            url: upload.secure_url
          });

          console.log(`✅ อัปโหลดไฟล์เยี่ยมบ้าน: ${file.name} -> ${upload.secure_url}`);
        } catch (error) {
          console.error(`❌ อัปโหลดไฟล์เยี่ยมบ้าน ${file.name} ล้มเหลว:`, error);
        }
      }
    }

    // จัดการรูปโปรไฟล์ (ถ้ามี)
    const profileImage = formData.get("profileImage") as File;
    if (profileImage && profileImage.size > 0) {
      try {
        const buffer = Buffer.from(await profileImage.arrayBuffer());
        const upload = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { 
              folder: "student_profiles",
              resource_type: "image"
            }, 
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          ).end(buffer);
        });
        updateData.image = upload.secure_url;
        console.log(`✅ อัปเดตรูปโปรไฟล์: ${profileImage.name} -> ${upload.secure_url}`);
      } catch (error) {
        console.error(`❌ อัปเดตรูปโปรไฟล์ ${profileImage.name} ล้มเหลว:`, error);
      }
    }

    // รับไฟล์เดิมที่คงไว้
    const existingHomeVisitFiles: { name: string, url: string }[] = [];
    for (let i = 0; formData.has(`existingHomeVisitFiles[${i}]`); i++) {
      const fileData = formData.get(`existingHomeVisitFiles[${i}]`) as string;
      if (fileData) {
        try {
          const parsed = JSON.parse(fileData);
          existingHomeVisitFiles.push(parsed);
        } catch (e) {
          // สร้างชื่อไฟล์ที่สวยงามจาก timestamp และ random ID
          const urlParts = fileData.split('/');
          const timestamp = urlParts[urlParts.length - 2];
          const hashId = urlParts[urlParts.length - 1];
          
          // สร้างชื่อไฟล์ที่มีความหมาย เหมือน learn API
          const beautifulName = `home_visit_${timestamp}_${hashId.substring(0, 8)}.file`;
          
          existingHomeVisitFiles.push({
            name: beautifulName,
            url: fileData
          });
        }
      }
    }

    // รวมไฟล์เดิมและไฟล์ใหม่
    const allHomeVisitFiles = [...existingHomeVisitFiles, ...newHomeVisitFiles];

    if (allHomeVisitFiles.length > 0) {
      updateData.home_visit_files = allHomeVisitFiles;
      console.log(`🔗 Final home visit files array (${allHomeVisitFiles.length} files):`, allHomeVisitFiles);
    } else if (formData.get('home_visit_files_clear') === 'true') {
      updateData.home_visit_files = [];
      console.log(`🔗 Cleared all home visit files`);
    }


    updateData.updated_at = new Date().toISOString();

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedStudent) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลนักเรียน" },
        { status: 404 }
      );
    }
 
    // อัปเดตข้อมูลที่เกี่ยวข้องใน model อื่นด้วย
    console.log(`🔄 อัปเดตข้อมูลที่เกี่ยวข้องกับนักเรียน ID: ${id}`);
 
    // อัปเดตข้อมูลปัญหา (Problem)
    const oldStudent = await Student.findById(id);
    const updatedProblems = await Problem.updateMany(
      { student_id: id },
      { 
        student_name: `${updateData.prefix || oldStudent?.prefix || ''}${updateData.first_name || oldStudent?.first_name} ${updateData.last_name || oldStudent?.last_name}`.trim(),
        student_id: updateData.id || oldStudent?.id || id
      }
    );
    console.log(`📋 อัปเดตข้อมูลปัญหา: ${updatedProblems.modifiedCount} รายการ`);
 
    // อัปเดตข้อมูลการส่งต่อ (Referral)
    const updatedReferrals = await Referral.updateMany(
      { student_id: id },
      { 
        student_name: `${updateData.prefix || oldStudent?.prefix || ''}${updateData.first_name || oldStudent?.first_name} ${updateData.last_name || oldStudent?.last_name}`.trim(),
        student_id: updateData.id || oldStudent?.id || id,
        student_level: updateData.level || oldStudent?.level,
        student_class: updateData.class || oldStudent?.class,
        student_number: updateData.number || oldStudent?.number
      }
    );
    console.log(`📤 อัปเดตข้อมูลการส่งต่อ: ${updatedReferrals.modifiedCount} รายการ`);
 
    // อัปเดตตามชื่อเก่าด้วย (กรณี student_id ไม่ตรงกัน)
    const oldName = `${oldStudent?.prefix || ''}${oldStudent?.first_name} ${oldStudent?.last_name}`.trim();
    const newName = `${updateData.prefix || oldStudent?.prefix || ''}${updateData.first_name || oldStudent?.first_name} ${updateData.last_name || oldStudent?.last_name}`.trim();
 
    if (oldName !== newName) {
      const updatedProblemsByName = await Problem.updateMany(
        { student_name: oldName },
        { student_name: newName }
      );
      console.log(`📋 อัปเดตข้อมูลปัญหา (ตามชื่อ): ${updatedProblemsByName.modifiedCount} รายการ`);
 
      const updatedReferralsByName = await Referral.updateMany(
        { student_name: oldName },
        { student_name: newName }
      );
      console.log(`📤 อัปเดตข้อมูลการส่งต่อ (ตามชื่อ): ${updatedReferralsByName.modifiedCount} รายการ`);
    }
 
    return NextResponse.json({
      success: true,
      data: updatedStudent,
      message: "อัปเดตข้อมูลสำเร็จ"
    });
 
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "รหัสนักศึกษาซ้ำ" },
        { status: 400 }
      );
    }
 
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
 
/* ===================== GET ===================== */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  console.log(`🚀 GET /api/student/${id} เริ่มทำงาน`);
 
  try {
    await connectDB();
 
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสนักศึกษา" },
        { status: 400 }
      );
    }
 
    const student = await Student.findById(id);
 
    if (!student) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลนักเรียน" },
        { status: 404 }
      );
    }
 
    return NextResponse.json({
      success: true,
      data: student
    });
 
  } catch {
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
 
/* ===================== DELETE ===================== */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  console.log(`🚀 DELETE /api/student/${id} เริ่มทำงาน`);
 
  try {
    await connectDB();
 
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบรหัสนักศึกษา" },
        { status: 400 }
      );
    }
 
    // ตรวจสอบว่ามีนักเรียนนี้อยู่จริงหรือไม่
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลนักเรียน" },
        { status: 404 }
      );
    }
 
    // 1. ลบข้อมูลที่เกี่ยวข้องทั้งหมดก่อน
    console.log(`🧹 เริ่มลบข้อมูลที่เกี่ยวข้องกับนักเรียน ID: ${id}`);
 
    // ลบข้อมูลปัญหา (Problem) - ลบตาม student_id และ ObjectId
    const deletedProblems = await Problem.deleteMany({ 
      $or: [
        { student_id: id },
        { student_id: student.id }
      ]
    });
    console.log(`📋 ลบข้อมูลปัญหา: ${deletedProblems.deletedCount} รายการ`);
 
    // ลบข้อมูลการส่งต่อ (Referral) - ลบตาม student_id และ ObjectId
    const deletedReferrals = await Referral.deleteMany({ 
      $or: [
        { student_id: id },
        { student_id: student.id }
      ]
    });
    console.log(`📤 ลบข้อมูลการส่งต่อ: ${deletedReferrals.deletedCount} รายการ`);
 
    // ลบตามชื่อนักเรียนด้วย (กรณี student_id ไม่ตรง)
    const deletedProblemsByName = await Problem.deleteMany({ 
      student_name: `${student.prefix || ''}${student.first_name} ${student.last_name}`.trim()
    });
    console.log(`📋 ลบข้อมูลปัญหา (ตามชื่อ): ${deletedProblemsByName.deletedCount} รายการ`);
 
    const deletedReferralsByName = await Referral.deleteMany({ 
      student_name: `${student.prefix || ''}${student.first_name} ${student.last_name}`.trim()
    });
    console.log(`📤 ลบข้อมูลการส่งต่อ (ตามชื่อ): ${deletedReferralsByName.deletedCount} รายการ`);
 
    // 2. ลบข้อมูลนักเรียนจริงๆ จากฐานข้อมูล
    const deletedStudent = await Student.findByIdAndDelete(id);
 
    if (!deletedStudent) {
      return NextResponse.json(
        { success: false, message: "ไม่สามารถลบข้อมูลได้" },
        { status: 500 }
      );
    }
 
    console.log(`✅ ลบนักเรียน ID: ${id} ชื่อ: ${student.first_name} ${student.last_name} และข้อมูลที่เกี่ยวข้องทั้งหมดเรียบร้อยแล้ว`);
 
    return NextResponse.json({
      success: true,
      message: "ลบข้อมูลสำเร็จ",
      data: {
        student: deletedStudent,
        deletedProblems: deletedProblems.deletedCount,
        deletedReferrals: deletedReferrals.deletedCount
      }
    });
 
  } catch (error: any) {
    console.error("❌ Error deleting student:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}