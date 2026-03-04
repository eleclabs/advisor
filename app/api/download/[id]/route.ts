import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PdfFile from "@/models/PdfFile";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const pdf = await PdfFile.findById(params.id);

    if (!pdf) {
      return new Response("File not found", { status: 404 });
    }

    const cloudinaryRes = await fetch(pdf.fileUrl);

    if (!cloudinaryRes.ok) {
      return new Response("Failed to fetch file from Cloudinary", { status: 500 });
    }

    const buffer = await cloudinaryRes.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="e.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
