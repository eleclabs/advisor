// app/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = session?.user?.role;

  if (!session || pathname === "/login" || pathname === "/register") {
    return null;
  }

  // เมนูตาม Role (ไม่มี href ซ้ำ)
  const roleMenus = [
   
    { name: "จัดการผู้ใช้", href: "/user", icon: "bi-people", roles: ["ADMIN", "EXECUTIVE"] },
    { name: "กำหนดครูที่ปรึกษา", href: "/student_assignment", icon: "bi-people-fill", roles: ["ADMIN"] },
    { name: "สาขา", href: "/major", icon: "bi-building", roles: ["ADMIN", "TEACHER", "EXECUTIVE", "COMMITTEE"] },
    { name: "รายงาน", href: "/committees/plan", icon: "bi-file-text", roles: ["ADMIN", "EXECUTIVE", "COMMITTEE"] },
   
  ];

  // เมนู Student - แก้ให้ href ไม่ซ้ำกัน
  const studentLinks = [
    { id: "dashboard", name: "📊 Dashboard ภาพรวม", href: "/dashboard", icon: "bi-speedometer2" },
    { id: "profile", name: "👤 การรู้จักผู้เรียนเป็นรายบุคคล", href: "/student", icon: "bi-person-badge" },
    { id: "filter", name: "🔍 การคัดกรองผู้เรียน", href: "/student_filter", icon: "bi-funnel" },
    { id: "learn", name: "📚 การส่งเสริมและพัฒนาผู้เรียน", href: "/student_learn", icon: "bi-book" },
    { id: "problem", name: "🛡️ การป้องกันและแก้ปัญหา", href: "/student_problem", icon: "bi-shield" },
    { id: "send", name: "📤 การส่งต่อผู้เรียน", href: "/student_send", icon: "bi-send" },
    { id: "report", name: "📈 การรายงานและสถิติ", href: "/student/report", icon: "bi-graph-up" },
    { id: "forms", name: "📋 แบบฟอร์ม/เครื่องมือ", href: "/forms", icon: "bi-file-earmark-text" },
    { id: "evaluation", name: "⭐ แบบประเมินความพึงพอใจ", href: "/evaluation", icon: "bi-star" },
  ];

  // กรองเมนูตาม role
  const filteredRoleMenus = roleMenus.filter(m => m.roles.includes(userRole || ""));

  return (
    <div className="bg-dark text-white min-vh-100 p-0">
      {/* โปรไฟล์ผู้ใช้ */}
      <div className="p-3 border-bottom border-warning bg-dark text-center">
        <div className="mb-2">
          <i className="bi bi-person-circle fs-1 text-warning"></i>
        </div>
        <h6 className="mb-0 text-truncate">{session.user?.name || session.user?.email}</h6>
        <span className="badge bg-warning text-dark rounded-0 mt-1 px-3 py-1">
          {userRole}
        </span>
      </div>

      {/* เมนูตาม Role */}
      {filteredRoleMenus.length > 0 && (
        <div className="p-2">
          <h6 className="text-uppercase text-white-50 small fw-bold px-3 mt-3 mb-2">
            <i className="bi bi-gear me-2"></i>จัดการระบบ
          </h6>
          {filteredRoleMenus.map((menu) => (
            <Link
              key={menu.href}  // ✅ href ไม่ซ้ำกันแล้ว
              href={menu.href}
              className={`d-block py-2 px-3 mb-1 text-decoration-none rounded-0 ${
                pathname === menu.href
                  ? "bg-warning text-dark"
                  : "text-white hover-bg-warning hover-text-dark"
              }`}
            >
              <i className={`bi ${menu.icon} me-2`}></i>
              {menu.name}
            </Link>
          ))}
        </div>
      )}

      {/* เมนูนักเรียน */}
      <div className="p-2">
        <h6 className="text-uppercase text-white-50 small fw-bold px-3 mt-3 mb-2">
          <i className="bi bi-people me-2"></i>เมนูนักเรียน
        </h6>
        {studentLinks.map((link) => (
          <Link
            key={link.id}  // ✅ ใช้ id แทน href เพื่อป้องกัน key ซ้ำ
            href={link.href}
            className={`d-block py-2 px-3 mb-1 text-decoration-none rounded-0 ${
              pathname === link.href
                ? "bg-warning text-dark"
                : "text-white hover-bg-warning hover-text-dark"
            }`}
          >
            <i className={`bi ${link.icon} me-2`}></i>
            {link.name}
          </Link>
        ))}
      </div>

      {/* เมนูเพิ่มเติม */}
      <div className="p-2 mt-3 border-top border-secondary">
        <Link
          key="profile"  // ✅ เพิ่ม key
          href="/profile"
          className={`d-block py-2 px-3 mb-1 text-decoration-none rounded-0 ${
            pathname === "/profile"
              ? "bg-warning text-dark"
              : "text-white hover-bg-warning hover-text-dark"
          }`}
        >
          <i className="bi bi-person-circle me-2"></i>
          โปรไฟล์ของฉัน
        </Link>
        <Link
          key="logout"  // ✅ เพิ่ม key
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // logout handled by header
          }}
          className="d-block py-2 px-3 text-decoration-none text-white hover-bg-danger rounded-0"
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          ออกจากระบบ
        </Link>
      </div>

      <style jsx>{`
        .hover-bg-warning:hover {
          background-color: #ffc107 !important;
          color: #000 !important;
        }
        .hover-text-dark:hover {
          color: #000 !important;
        }
        .hover-bg-danger:hover {
          background-color: #dc3545 !important;
        }
      `}</style>
    </div>
  );
}