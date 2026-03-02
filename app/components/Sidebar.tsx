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
    { name: "✅ Student - /student", href: "/student" },
    { name: "✅ Student Filter - /student_filter", href: "/student_filter" },
    { name: "✅ Student Learn - /student_learn", href: "/student_learn" },
    { name: "✅ Student Problem - /student_problem", href: "/student_problem" },
    { name: "✅ Student Send - /student_send", href: "/student_send" },
  ];

  const filteredRoleMenus = roleMenus.filter(m =>
    m.roles.includes(role || "")
  );

  return (
    <div className="w-64 bg-black text-white min-h-screen p-4 border-r border-gray-800">
      
      <div className="text-xl font-bold mb-6">
        MENU
      </div>

      <nav className="space-y-4">
        
        {/* กลุ่มเมนูตามสิทธิ์ (Role-based) */}
        <div className="space-y-1">
          {filteredRoleMenus.map(menu => (
            <Link
              key={menu.href}
              href={menu.href}
              className="block p-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white transition-all"
            >
              {menu.name}
            </Link>
          ))}
        </div>

        {/* กลุ่มเมนู Student (กดได้ทุกคน + ดีไซน์สีขาว/ดำ) */}
        <div className="pt-4 border-t border-gray-800 space-y-2">
          {studentLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block p-2 text-white bg-gray-900 border border-gray-700 rounded hover:bg-white hover:text-black transition-all font-medium"
            >
              {link.name}
            </Link>
          ))}
        </div>

      </nav>
    </div>
  );
}
