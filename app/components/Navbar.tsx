// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // ถ้าไม่มี session หรือกำลังอยู่หน้า login/register ไม่ต้องแสดง Navbar
  if (!session || pathname === "/login" || pathname === "/register") {
    return null;
  }

  const navItems = [
    { name: "หน้าหลัก", href: "/", icon: "bi-house-door" },
    { name: "นักเรียน", href: "/student", icon: "bi-people" },
    { name: "กิจกรรม", href: "/student_learn", icon: "bi-calendar-event" },
    { name: "ปัญหา", href: "/student_problem", icon: "bi-exclamation-triangle" },
    { name: "ส่งต่อ", href: "/student_send", icon: "bi-send" },
    { name: "ผู้ใช้", href: "/user", icon: "bi-person-badge" },
    { name: "รายงาน", href: "/committees/plan", icon: "bi-file-text" },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-warning">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold text-warning" href="/">
          <i className="bi bi-mortarboard-fill me-2"></i>
          Smart Advisor
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {navItems.map((item) => (
              <li className="nav-item" key={item.href}>
                <Link
                  className={`nav-link ${pathname === item.href ? "active text-warning" : ""}`}
                  href={item.href}
                >
                  <i className={`bi ${item.icon} me-1`}></i>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}