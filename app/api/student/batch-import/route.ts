import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/Student";

// POST - Batch import students with column mapping
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { students, mapping } = await request.json();
    
    if (!students || students.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่มีข้อมูลที่จะนำเข้า' },
        { status: 400 }
      );
    }

    let insertedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const studentData of students) {
      try {
        // Map Excel columns to database fields
        const mappedData: any = {};
        
        // Map based on provided mapping
        if (mapping.studentId) {
          mappedData.id = studentData[mapping.studentId] || '';
        }
        if (mapping.firstName) {
          mappedData.first_name = studentData[mapping.firstName] || '';
        }
        if (mapping.lastName) {
          mappedData.last_name = studentData[mapping.lastName] || '';
        }
        if (mapping.nickname) {
          mappedData.nickname = studentData[mapping.nickname] || '';
        }
        if (mapping.prefix) {
          mappedData.prefix = studentData[mapping.prefix] || '';
        }
        if (mapping.gender) {
          const genderValue = studentData[mapping.gender] || '';
          mappedData.gender = genderValue;
          if (!mappedData.prefix) {
            mappedData.prefix = genderValue === 'ชาย' ? 'นาย' : 
                             genderValue === 'หญิง' ? 'นาง' : 
                             genderValue === 'อื่น' ? 'นางสาว' : 'นาย';
          }
        }
        if (mapping.birthDate) {
          const birthDate = studentData[mapping.birthDate];
          if (birthDate) {
            // Parse date in various formats
            const date = new Date(birthDate);
            if (!isNaN(date.getTime())) {
              // Try Thai date format
              const thaiDateMatch = birthDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
              if (thaiDateMatch) {
                mappedData.birth_date = new Date(
                  parseInt(thaiDateMatch[3]) - 543, // Buddhist to Christian year
                  parseInt(thaiDateMatch[2]) - 1,
                  parseInt(thaiDateMatch[1])
                ).toISOString();
              } else {
                mappedData.birth_date = birthDate;
              }
            }
          }
        }
        if (mapping.level) {
          mappedData.level = studentData[mapping.level] || '';
        }
        if (mapping.major) {
          mappedData.class_group = studentData[mapping.major] || '';
        }
        if (mapping.classRoom) {
          mappedData.class_number = studentData[mapping.classRoom] || '1';
        }
        if (mapping.phone) {
          mappedData.phone_number = studentData[mapping.phone] || '';
        }
        if (mapping.address) {
          mappedData.address = studentData[mapping.address] || '';
        }
        if (mapping.religion) {
          mappedData.religion = studentData[mapping.religion] || 'พุทธ';
        }
        if (mapping.bloodType) {
          mappedData.blood_type = studentData[mapping.bloodType] || 'B';
        }

        // Add missing required fields with defaults
        mappedData.weight = studentData.weight || '';
        mappedData.height = studentData.height || '';
        mappedData.advisor_name = 'ระบบ';
        mappedData.image = '';
        mappedData.status = 'ปกติ';

        // Calculate BMI if weight and height available from Excel or mapped data
        const weightValue = parseFloat(studentData.weight || studentData[mapping.weight || ''] || '0');
        const heightValue = parseFloat(studentData.height || studentData[mapping.height || ''] || '0');
        if (weightValue > 0 && heightValue > 0) {
          const heightInMeters = heightValue / 100;
          const bmi = weightValue / (heightInMeters * heightInMeters);
          mappedData.bmi = bmi.toFixed(2);
        } else {
          mappedData.bmi = '';
        }

        // Check if required fields are present
        if (!mappedData.id || !mappedData.first_name || !mappedData.last_name) {
          errors.push(`ข้อมูลไม่ครบ: ${JSON.stringify(studentData)}`);
          skippedCount++;
          continue;
        }

        // Create student in database
        const student = new Student({
          ...mappedData
        });

        await student.save();
        insertedCount++;

      } catch (error) {
        console.error('Error importing student:', error);
        errors.push(`ข้อผิดพลาด: ${error instanceof Error ? error.message : String(error)}`);
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `นำเข้าสำเร็จ ${insertedCount} รายการ`,
      insertedCount,
      skippedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Batch import error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล' },
      { status: 500 }
    );
  }
}
