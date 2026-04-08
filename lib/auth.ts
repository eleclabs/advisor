import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";

import bcrypt from "bcrypt";
import User from "@/models/User";
import Student from "@/models/Student";
import { connectDB } from "./mongodb";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("=".repeat(50));
        console.log("Auth authorize starting");
        console.log("Email received:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("No email or password");
          throw new Error("Please provide email and password");
        }

        try {
          // Check if it's a student email (ends with @student.com)
          if (credentials.email?.endsWith('@student.com')) {
            console.log("Student authentication detected");
            
            // Connect to database for student authentication
            console.log("Connecting to database for student auth...");
            await connectDB();
            console.log("Database connected for student auth");
            
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
          console.log("Connecting to database...");
          await connectDB();
          console.log("Database connected");

          console.log("Finding user:", credentials.email);
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase().trim() 
          });
          
          if (!user) {
            console.log("User not found:", credentials.email);
            throw new Error("User not found");
          }

          console.log("User found:", {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            is_active: user.is_active
          });

          if (!user.is_active) {
            console.log("User is inactive:", user.email);
            throw new Error("Account is disabled");
          }

          console.log("Checking password...");
          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValid) {
            console.log("Invalid password for:", user.email);
            throw new Error("Invalid password");
          }

          console.log("Password valid");

          // Update last_login
          user.last_login = new Date();
          await user.save();
          console.log("Updated last_login");

          const userData = {
            id: user._id.toString(),
            email: user.email,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            role: user.role,
            image: user.image || null,
          };

          console.log("Login successful! Returning user data:", {
            email: userData.email,
            role: userData.role,
            name: userData.name
          });
          console.log("=".repeat(50));

          return userData;

        } catch (error: any) {
          console.error("Error in authorize:", error.message);
          console.log("=".repeat(50));
          throw error;
        }
      }
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }: any) {
      console.log("JWT callback:", { 
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
      console.log("Session callback:", { 
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
  secret: process.env.NEXTAUTH_SECRET,
});