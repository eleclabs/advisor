// app/components/Header.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // Hide login button on student login page
  const isStudentLoginPage = pathname === "/login/student";

  return (
    <header className="bg-primary text-white py-3 px-4 d-flex justify-content-between align-items-center">
      <div>
        <h1 className="h4 mb-0">
          <i className="bi bi-mortarboard-fill me-2 text-warning"></i>
          ระบบดูแลช่วยเหลือผู้เรียน
        </h1>
      </div>
      <div className="d-flex align-items-center gap-3">
        {session ? (
          <>
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

            <span className="text-white-50">
              {/* <i className="bi bi-person-circle me-2"></i> */}
              {session.user?.name || session.user?.email}
              {session.user?.role && (
                <span className="badge bg-warning text-dark ms-2 rounded-0">
                  {session.user.role}
                </span>
              )}
            </span>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="btn btn-outline-warning btn-sm rounded-0"
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              ออกจากระบบ
            </button>
          </>
        ) : (
          !isStudentLoginPage && (
            <Link href="/login" className="btn btn-warning btn-sm rounded-0">
              <i className="bi bi-box-arrow-in-right me-1"></i>
              เข้าสู่ระบบ
            </Link>
          )
        )}
      </div>
    </header>
  );
}