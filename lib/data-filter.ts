// lib/data-filter.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "./mongodb";
import User from "@/models/User";
import Student from "@/models/Student";

/**
 * ฟังก์ชันกรองข้อมูลตามสิทธิ์ของผู้ใช้
 * แก้ที่ไฟล์นี้ที่เดียว ใช้กับทุกหน้า
 */
export async function filterDataByUser(
  collection: "student" | "activity" | "problem" | "report",
  query: any = {}
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return { filteredQuery: { _id: null } }; // ไม่ให้เห็นข้อมูล
  }

  const userRole = session.user?.role;
  const userId = session.user?.id;

  // ===== ADMIN เห็นทั้งหมด =====
  if (userRole === "ADMIN") {
    return { filteredQuery: query };
  }

  // ===== เริ่มกรองตาม Role และ Collection =====
  let filteredQuery = { ...query };

  switch (userRole) {
    case "TEACHER":
      // ดึงข้อมูลครูเพื่อดูว่าสอนห้องอะไรบ้าง
      await connectDB();
      const teacher = await User.findById(userId);
      
      if (!teacher) {
        return { filteredQuery: { _id: null } };
      }

      // กรองตาม collection
      switch (collection) {
        case "student":
          // TEACHER เห็นเฉพาะนักเรียนในที่ปรึกษา
          filteredQuery = {
            ...query,
            advisor_id: userId  // กรองตาม advisor_id
          };
          break;

        case "activity":
          // TEACHER เห็นกิจกรรมที่ตัวเองสร้าง + กิจกรรมของนักเรียนในที่ปรึกษา
          filteredQuery = {
            ...query,
            $or: [
              { created_by: userId },
              { "participants.student_id": { $in: teacher.students || [] } }
            ]
          };
          break;

        case "problem":
          // TEACHER เห็นปัญหาของนักเรียนในที่ปรึกษา
          filteredQuery = {
            ...query,
            advisor_id: userId
          };
          break;

        case "report":
          // TEACHER เห็นรายงานเฉพาะห้องตัวเอง
          filteredQuery = {
            ...query,
            advisor_id: userId
          };
          break;
      }
      break;

    case "EXECUTIVE":
      // ผู้บริหารเห็นทั้งหมด (อาจกรองตามภาควิชา)
      filteredQuery = query; // หรือเพิ่มกรองตาม department
      break;

    case "COMMITTEE":
      // คณะกรรมการเห็นทั้งหมด (แบบอ่านอย่างเดียว)
      filteredQuery = query;
      break;

    default:
      filteredQuery = { _id: null };
  }

  return { filteredQuery };
}

/**
 * ฟังก์ชันตรวจสอบว่าเข้าถึงข้อมูลเฉพาะรายการได้ไหม
 */
export async function canAccessItem(
  collection: "student" | "activity" | "problem",
  itemId: string
) {
  const session = await getServerSession(authOptions);
  
  if (!session) return false;
  if (session.user?.role === "ADMIN") return true;

  await connectDB();

  switch (collection) {
    case "student": {
      const student = await Student.findById(itemId);
      if (!student) return false;
      
      if (session.user?.role === "TEACHER") {
        return student.advisor_id === session.user?.id;
      }
      return ["EXECUTIVE", "COMMITTEE"].includes(session.user?.role || "");
    }

    case "activity": {
      // ตรวจสอบสิทธิ์เข้าถึงกิจกรรม
      const Activity = (await import("@/models/Activity")).default;
      const activity = await Activity.findById(itemId);
      
      if (!activity) return false;
      
      if (session.user?.role === "TEACHER") {
        return activity.created_by === session.user?.id;
      }
      return ["EXECUTIVE", "COMMITTEE"].includes(session.user?.role || "");
    }

    default:
      return false;
  }
}