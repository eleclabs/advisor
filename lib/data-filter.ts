// lib/data-filter.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "./mongodb";
import User from "@/models/User";

export type CollectionType = "student" | "learn" | "problem" | "send" | "user";

/**
 * กรอง query ตามสิทธิ์ผู้ใช้
 * ใช้กับทุก API และ Page ในระบบ
 */
export async function filterDataByUser(
  collection: CollectionType,
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

  // ===== เริ่มกรองตาม Role =====
  let filteredQuery = { ...query };

  switch (userRole) {
    case "TEACHER":
      // ดึงข้อมูลครูเพื่อดูว่าสอนห้องอะไร
      await connectDB();
      const teacher = await User.findById(userId);
      
      // กรองตาม collection
      switch (collection) {
        case "student":
          // TEACHER เห็นเฉพาะนักเรียนในที่ปรึกษา
          filteredQuery = {
            ...query,
            advisor_id: userId
          };
          break;

        case "learn":
          // TEACHER เห็นกิจกรรมที่ตัวเองสร้าง + กิจกรรมของนักเรียนในที่ปรึกษา
          filteredQuery = {
            ...query,
            $or: [
              { created_by: userId },
              { "participants.advisor_id": userId }
            ]
          };
          break;

        case "problem":
          // TEACHER เห็นปัญหาของนักเรียนในที่ปรึกษา
          filteredQuery = {
            ...query,
            $or: [
              { advisor_id: userId },
              { created_by: userId }
            ]
          };
          break;

        case "send":
          // TEACHER เห็นการส่งต่อของนักเรียนในที่ปรึกษา
          filteredQuery = {
            ...query,
            advisor_id: userId
          };
          break;

        case "user":
          // TEACHER เห็นเฉพาะผู้ใช้ที่เป็นครูด้วยกัน (ไม่เห็น admin)
          filteredQuery = {
            ...query,
            role: { $in: ["TEACHER", "EXECUTIVE", "COMMITTEE"] }
          };
          break;
      }
      break;

    case "EXECUTIVE":
    case "COMMITTEE":
      // ผู้บริหารและกรรมการเห็นทั้งหมด (แบบอ่านอย่างเดียว)
      filteredQuery = query;
      break;

    default:
      filteredQuery = { _id: null };
  }

  return { filteredQuery };
}

/**
 * ตรวจสอบสิทธิ์เข้าถึงข้อมูลเฉพาะรายการ
 */
export async function canAccessItem(
  collection: CollectionType,
  itemId: string,
  action: "view" | "edit" | "delete" = "view"
) {
  const session = await getServerSession(authOptions);
  
  if (!session) return false;
  if (session.user?.role === "ADMIN") return true;

  const userRole = session.user?.role;
  const userId = session.user?.id;

  await connectDB();

  // ดึงข้อมูลตาม collection
  let item = null;
  switch (collection) {
    case "student": {
      const Student = (await import("@/models/Student")).default;
      item = await Student.findById(itemId);
      break;
    }
    case "learn": {
      const Learn = (await import("@/models/Learn")).default;
      item = await Learn.findById(itemId);
      break;
    }
    case "problem": {
      const Problem = (await import("@/models/Problem")).default;
      item = await Problem.findById(itemId);
      break;
    }
    case "send": {
      const { Referral } = await import("@/models/Send");
      item = await Referral.findById(itemId);
      break;
    }
    default:
      return false;
  }

  if (!item) return false;

  // ตรวจสอบตาม role
  switch (userRole) {
    case "TEACHER":
      // ตรวจสอบ ownership
      if (item.advisor_id) return item.advisor_id === userId;
      if (item.created_by) return item.created_by === userId;
      if (item.teacher_id) return item.teacher_id === userId;
      return false;

    case "EXECUTIVE":
    case "COMMITTEE":
      // ผู้บริหารและกรรมการดูได้อย่างเดียว
      return action === "view";

    default:
      return false;
  }
}