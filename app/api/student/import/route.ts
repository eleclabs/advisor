import { NextRequest, NextResponse } from "next/server";
import * as XLSX from 'xlsx';
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/Student";

// POST - Import students from Excel file
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'กรุณาอัปโหลดไฟล์ Excel' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { success: false, message: 'ไฟล์ต้องมีนามสกุล .xlsx หรือ .xls' },
        { status: 400 }
      );
    }

    // Read Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert to JSON with headers as keys (not array format)
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบข้อมูลในไฟล์ Excel' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: jsonData,
      count: jsonData.length
    });

  } catch (error) {
    console.error('Error importing Excel:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการอ่านไฟล์ Excel' },
      { status: 500 }
    );
  }
}
