"use client";

import Link from "next/link";

export default function Sidebar({ role }: { role?: string }) {

  // เมนูที่เปลี่ยนตาม Role (ถ้าไม่ส่ง role มาจะไม่ขึ้น)
  const roleMenus = [
    { name: "Dashboard", href: "/dashboard", roles: ["ADMIN", "TEACHER", "EXECUTIVE", "COMMITTEE"] },
    { name: "Users", href: "/admin/users", roles: ["ADMIN"] },
    { name: "Students", href: "/teacher/students", roles: ["TEACHER"] },
    { name: "Reports", href: "/executive/report", roles: ["EXECUTIVE"] },
  ];

  // เมนู Student ที่ทุกคนต้องเห็น และ "กดได้"
  const studentLinks = [
    { name: "Dashboard ภาพรวม", href: "/student" },
    { name: "ข้อมูลผู้เรียนรายบุลคล", href: "/student" },
    { name: "การคัดกรองผู้เรียน", href: "/student_filter" },
    { name: "ส่งเสริมและพัฒนาผู้เรียน", href: "/student_learn" },
    { name: "ป้องกันและแก้ปัญหา", href: "/student_problem" },
    { name: "ส่งต่อผู้เรียน", href: "/student_send" },
    { name: "รายงานและสถิติ", href: "/student" },
    { name: "แบบฟอร์ม/เครื่องมือ", href: "/student" },
    { name: "แบบประเมินความพึงพอใจ", href: "/student" },
  ];

  const filteredRoleMenus = roleMenus.filter(m =>
    m.roles.includes(role || "")
  );

  return (
    <ul className="list-group list-group-flush">
      {studentLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href} className="list-group-item"> {link.name}
        </Link>
      ))}
    </ul>
  );
}
