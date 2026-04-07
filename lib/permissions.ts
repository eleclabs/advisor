// lib/permissions.ts

// ===== นิยาม Role ที่มีในระบบ =====
export const ROLES = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  EXECUTIVE: "EXECUTIVE",
  COMMITTEE: "COMMITTEE",
  STUDENT: "STUDENT",
} as const;

export type Role = keyof typeof ROLES;

// ===== กำหนดสิทธิ์การเข้าถึงหน้าต่างๆ =====
export const PAGE_PERMISSIONS: Record<string, ("ADMIN" | "TEACHER" | "EXECUTIVE" | "COMMITTEE" | "STUDENT")[]> = {
  // Student pages
  STUDENT_LIST: ["ADMIN", "TEACHER", "EXECUTIVE", "COMMITTEE","STUDENT"],
  STUDENT_VIEW: ["ADMIN", "TEACHER", "EXECUTIVE", "COMMITTEE","STUDENT"],
  STUDENT_CREATE: ["ADMIN", "TEACHER"],
  STUDENT_EDIT: ["ADMIN", "TEACHER"],
  STUDENT_DELETE: ["ADMIN"],
  STUDENT_ASSESSMENT: ["ADMIN", "TEACHER"],
  STUDENT_INTERVIEW: ["ADMIN", "TEACHER"],
  
  // Student Learn pages
  LEARN_LIST: ["ADMIN", "TEACHER", "EXECUTIVE", "COMMITTEE"],
  LEARN_VIEW: ["ADMIN", "TEACHER", "EXECUTIVE", "COMMITTEE"],
  LEARN_CREATE: ["ADMIN", "TEACHER"],
  LEARN_EDIT: ["ADMIN", "TEACHER"],
  LEARN_DELETE: ["ADMIN"],
  LEARN_RECORD: ["ADMIN", "TEACHER"],
  LEARN_ALBUM: ["ADMIN", "TEACHER", "EXECUTIVE", "COMMITTEE"],
  
  // Student Problem pages
  PROBLEM_LIST: ["ADMIN", "TEACHER", "EXECUTIVE", "COMMITTEE"],
  PROBLEM_VIEW: ["ADMIN", "TEACHER", "EXECUTIVE", "COMMITTEE"],
  PROBLEM_CREATE: ["ADMIN", "TEACHER"],
  PROBLEM_EDIT: ["ADMIN", "TEACHER"],
  PROBLEM_DELETE: ["ADMIN"],
  PROBLEM_ACTIVITY: ["ADMIN", "TEACHER"],
  PROBLEM_EVALUATION: ["ADMIN", "TEACHER"],
  
  // Student Send pages
  SEND_LIST: ["ADMIN", "TEACHER", "EXECUTIVE", "COMMITTEE"],
  SEND_VIEW: ["ADMIN", "TEACHER", "EXECUTIVE", "COMMITTEE"],
  SEND_CREATE: ["ADMIN", "TEACHER"],
  SEND_EDIT: ["ADMIN", "TEACHER"],
  SEND_DELETE: ["ADMIN"],
  SEND_COORDINATION: ["ADMIN", "TEACHER"],
  SEND_FOLLOWUP: ["ADMIN", "TEACHER"],
  
  // User pages
  USER_LIST: ["ADMIN", "EXECUTIVE"],
  USER_VIEW: ["ADMIN", "EXECUTIVE"],
  USER_CREATE: ["ADMIN"],
  USER_EDIT: ["ADMIN"],
  USER_DELETE: ["ADMIN"],
  
  // Dashboard
  DASHBOARD_VIEW: ["ADMIN", "TEACHER", "EXECUTIVE", "COMMITTEE"],
  DASHBOARD_ADMIN: ["ADMIN"],
  
  // Committee pages
  COMMITTEE_PLAN: ["COMMITTEE", "ADMIN"],
  COMMITTEE_ASSIGN: ["ADMIN"],
  COMMITTEE_ROLES: ["ADMIN"],
  
  // Major pages
  MAJOR_LIST: ["ADMIN", "TEACHER", "EXECUTIVE", "COMMITTEE"],
  MAJOR_MANAGE: ["ADMIN"],
} as const;

export type PagePermission = keyof typeof PAGE_PERMISSIONS;

/**
 * ตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงหน้าหรือไม่
 */
export function hasPagePermission(userRole: Role | undefined, permission: PagePermission): boolean {
  if (!userRole) return false;
  
  const allowedRoles = PAGE_PERMISSIONS[permission];
  return allowedRoles.includes(userRole);
}