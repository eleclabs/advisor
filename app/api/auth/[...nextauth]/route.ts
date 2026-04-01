// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import type { SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
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