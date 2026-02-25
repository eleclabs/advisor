import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return Response.json(
        { success: false, message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const hashed = await bcrypt.hash(body.password, 10);

    const user = await User.create({
      name: body.name,
      email: body.email,
      password: hashed,
      role: body.role || "TEACHER",
    });

    return Response.json({ success: true, message: "User created", data: user });
  } catch (error: any) {
    console.error("Error registering user:", error);

    // Check for duplicate email error
    if (error.code === 11000) {
      return Response.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, message: "Failed to register user", error: error.message },
      { status: 500 }
    );
  }
}

