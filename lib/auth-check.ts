// lib/auth-check.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hasPagePermission, PagePermission } from "./permissions";
import { canAccessItem } from "./data-filter";

/**
 * ตรวจสอบสิทธิ์การเข้าถึงหน้า
 * ใช้กับ middleware และ page
 */
export async function checkPagePermission(
  permission: PagePermission,
  redirectTo: string = "/unauthorized"
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return {
      allowed: false,
      redirect: "/login",
      session: null
    };
  }

  const userRole = session.user?.role;
  
  if (!userRole) {
    return {
      allowed: false,
      redirect: redirectTo,
      session
    };
  }

  const allowed = hasPagePermission(userRole, permission);

  return {
    allowed,
    redirect: allowed ? null : redirectTo,
    session
  };
}

/**
 * ตรวจสอบสิทธิ์การเข้าถึงข้อมูลเฉพาะรายการ
 * ใช้กับ API routes
 */
export async function checkItemPermission(
  collection: "student" | "learn" | "problem" | "send",
  itemId: string,
  action: "view" | "edit" | "delete" = "view"
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return {
      allowed: false,
      status: 401,
      message: "กรุณาเข้าสู่ระบบ"
    };
  }

  const hasAccess = await canAccessItem(collection, itemId, action);

  if (!hasAccess) {
    return {
      allowed: false,
      status: 403,
      message: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้"
    };
  }

  return {
    allowed: true,
    status: 200,
    session
  };
}

/**
 * ตรวจสอบสิทธิ์การแก้ไขข้อมูล (ownership)
 */
export async function checkItemOwnership(
  userId: string,
  userRole: string,
  item: any
): Promise<boolean> {
  if (userRole === "ADMIN") return true;
  
  if (userRole === "TEACHER") {
    if (item.advisor_id) return item.advisor_id === userId;
    if (item.created_by) return item.created_by === userId;
    if (item.teacher_id) return item.teacher_id === userId;
  }
  
  return false;
}