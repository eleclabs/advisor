import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Profile from "@/models/Profile";
import cloudinary from "@/lib/cloudinary";

// ================= POST =================
export async function POST(req: NextRequest) {
  await connectDB();

  const formData = await req.formData();

  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;
  const file = formData.get("image");

  // 🔒 validate text fields
  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  // 🔒 validate file (กันพัง 100%)
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Image file is required" },
      { status: 400 }
    );
  }

  // convert file -> buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // upload to cloudinary
  const upload = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "profiles" }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(buffer);
  });

  const imageUrl = upload.secure_url;

  const profile = await Profile.create({
    name,
    email,
    image: imageUrl,
  });

  return NextResponse.json(profile, { status: 201 });
}

// ================= GET =================
export async function GET() {
  await connectDB();

  const profiles = await Profile.find().sort({ createdAt: -1 });

  return NextResponse.json(profiles);
}