import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Profile from "@/models/Profile";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  await connectDB();

  const formData = await req.formData();

  const name = formData.get("name");
  const email = formData.get("email");
  const file = formData.get("image") as File;

  // convert file -> buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // upload to cloudinary
  const upload = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "profiles" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    ).end(buffer);
  });

  const imageUrl = (upload as any).secure_url;

  const profile = await Profile.create({
    name,
    email,
    image: imageUrl,
  });

  return NextResponse.json(profile);
}


// ✅ GET profiles
export async function GET() {
  await connectDB();

  const profiles = await Profile.find().sort({ createdAt: -1 });

  return NextResponse.json(profiles);
}

