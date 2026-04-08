// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/">
          ระบบที่ปรึกษา
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${pathname === '/' ? 'active' : ''}`} 
                href="/"
              >
                หน้าแรก
              </Link>
            </li>
            {session?.user?.role !== 'STUDENT' && (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${pathname.startsWith('/students') ? 'active' : ''}`} 
                    href="/students"
                  >
                    นักเรียน
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${pathname.startsWith('/forms') ? 'active' : ''}`} 
                    href="/forms"
                  >
                    แบบฟอร์ม
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${pathname.startsWith('/assessment') ? 'active' : ''}`} 
                    href="/assessment"
                  >
                    การประเมิน
                  </Link>
                </li>
              </>
            )}
          </ul>
          
          <ul className="navbar-nav">
            {session ? (
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle" 
                  href="#" 
                  role="button" 
                  data-bs-toggle="dropdown"
                >
                  {session.user?.name}
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" href="/profile">
                      โปรไฟล์
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" href="/api/auth/signout">
                      ออกจากระบบ
                    </Link>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" href="/login">
                  เข้าสู่ระบบ
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}