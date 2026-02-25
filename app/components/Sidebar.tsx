"use client";

import Link from "next/link";

export default function Sidebar({ role }: { role?: string }) {

  const menus = [
    { name: "Dashboard", href: "/dashboard", roles: ["ADMIN","TEACHER","EXECUTIVE","COMMITTEE"] },
    { name: "Users", href: "/admin/users", roles: ["ADMIN"] },
    { name: "Students", href: "/teacher/students", roles: ["TEACHER"] },
    { name: "Reports", href: "/executive/report", roles: ["EXECUTIVE"] },
  ];

  const filtered = menus.filter(m =>
    m.roles.includes(role || "")
  );

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">

      <div className="text-xl font-bold mb-6">
        MENU
      </div>

      <nav className="space-y-2">
        {filtered.map(menu => (
          <Link
            key={menu.href}
            href={menu.href}
            className="block p-2 rounded hover:bg-gray-700"
          >
            {menu.name}
          </Link>
        ))}
      </nav>

    </div>
  );
}