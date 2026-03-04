import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/mongodb";
import PdfFile from "@/models/PdfFile";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadRes = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "raw", // สำคัญสำหรับ PDF
          folder: "pdf_files",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    await connectDB();

    // Use the complete filename as title
    const fileName = file.name;
    const title = fileName;
    const fileType = uploadRes.format;

    const pdf = await PdfFile.create({
      title,
      fileName,
      fileUrl: uploadRes.secure_url,
      publicId: uploadRes.public_id,
      fileType,
      format: uploadRes.format,
      resourceType: uploadRes.resource_type,
    });

    return NextResponse.json(pdf);
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
