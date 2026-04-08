import NextAuth from "next-auth";
import type { SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Student from "@/models/Student";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "อีเมล", type: "email" },
        password: { label: "รหัสผ่าน", type: "password" }
      },
      async authorize(credentials) {
        console.log("=".repeat(50));
        console.log("🚀 authorize เริ่มทำงาน");
        console.log("📧 อีเมลที่รับมา:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ ไม่มีอีเมลหรือรหัสผ่าน");
          throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        }

        try {
          console.log("Student Login -  Email:", credentials.email, "Password:", credentials.password);
          
          // Check if it's a student email (ends with @student.com)
          if (credentials.email?.endsWith('@student.com')) {
            console.log("Student authentication detected");
            
            // Connect to database for student authentication
            console.log("🔄 Connecting to database for student auth...");
            await connectDB();
            console.log("✅ Database connected for student auth");
            
            // Extract student ID from email
            const studentId = credentials.email.replace('@student.com', '');
            console.log("Student ID extracted:", studentId);
            
            // Find student by ID
            const student = await Student.findOne({ 
              id: studentId 
            });
            
            if (!student) {
              console.log("Student not found with ID:", studentId);
              throw new Error("Student not found");
            }

            console.log("Student found:", {
              id: student.id,
              email: student.email,
              first_name: student.first_name,
              last_name: student.last_name
            });

            // For students, password should match the student ID
            if (credentials.password !== studentId) {
              console.log("Student password mismatch");
              throw new Error("Invalid student credentials");
            }

            console.log("Student authentication successful");

            const studentData = {
              id: student._id.toString(),
              email: student.email,
              name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
              role: "STUDENT",
              image: student.image || null,
            };

            console.log("Student login success:", studentData);
            return studentData;
          }

          // Regular user authentication
          console.log("Regular user authentication");
          console.log("🔄 กำลังเชื่อมต่อฐานข้อมูล...");
          await connectDB();
          console.log("✅ เชื่อมต่อฐานข้อมูลสำเร็จ");

          console.log("🔍 กำลังค้นหาผู้ใช้:", credentials.email);
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase().trim() 
          });
          
          if (!user) {
            console.log("❌ ไม่พบผู้ใช้ในระบบ:", credentials.email);
            throw new Error("ไม่พบผู้ใช้งานในระบบ");
          }

          console.log("✅ พบผู้ใช้:", {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            first_name: user.first_name,
            last_name: user.last_name,
            has_password: !!user.password
          });

          if (!user.is_active) {
            console.log("❌ ผู้ใช้ถูกปิดการใช้งาน:", user.email);
            throw new Error("บัญชีนี้ถูกปิดการใช้งาน");
          }

          console.log("🔐 กำลังตรวจสอบรหัสผ่าน...");
          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValid) {
            console.log("❌ รหัสผ่านไม่ถูกต้องสำหรับ:", user.email);
            throw new Error("รหัสผ่านไม่ถูกต้อง");
          }

          console.log("✅ รหัสผ่านถูกต้อง");

          // อัปเดต last_login
          user.last_login = new Date();
          await user.save();
          console.log("✅ อัปเดต last_login สำเร็จ");

          const userData = {
            id: user._id.toString(),
            email: user.email,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            role: user.role,
            image: user.image || null,
          };

          console.log("🎉 Login สำเร็จ! ส่งข้อมูลผู้ใช้กลับ:", {
            email: userData.email,
            role: userData.role,
            name: userData.name
          });
          console.log("=".repeat(50));

          return userData;

        } catch (error: any) {
          console.error("❌ Error ใน authorize:", error.message);
          console.log("=".repeat(50));
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      console.log("🔑 JWT callback:", { 
        hasUser: !!user, 
        tokenRole: token?.role,
        userId: user?.id 
      });
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      console.log("📝 Session callback:", { 
        tokenRole: token?.role,
        tokenId: token?.id 
      });
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      console.log("Redirect callback:", { url, baseUrl });
      
      // If it's a student, redirect to student assessment page
      if (url.includes('/login/student') || url.includes('student.com')) {
        return `${baseUrl}/assessment/student`;
      }
      
      // Default redirect
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };