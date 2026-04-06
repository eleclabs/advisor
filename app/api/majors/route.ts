import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Major from "@/models/Major";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const majors = await Major.find({}).sort({ major_id: 1 });
    
    return NextResponse.json({ 
      success: true, 
      data: majors 
    });

  } catch (error: any) {
    console.error("❌ Error in GET /api/majors:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
