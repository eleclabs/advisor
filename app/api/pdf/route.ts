import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PdfFile from "@/models/PdfFile";

export async function GET() {
  try {
    await connectDB();

    const pdfs = await PdfFile.find().sort({ createdAt: -1 });

    return NextResponse.json(pdfs);
  } catch (error: any) {
    console.error("Error fetching PDFs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
