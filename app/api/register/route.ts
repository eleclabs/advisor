import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const body = await req.json();

  await connectDB();

  const hashed = await bcrypt.hash(body.password, 10);

  await User.create({
    name: body.name,
    email: body.email,
    password: hashed,
    role: body.role || "TEACHER",
  });

  return Response.json({ message: "User created" });
}

