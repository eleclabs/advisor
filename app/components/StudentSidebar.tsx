"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function StudentSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [studentId, setStudentId] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");

  useEffect(() => {
    // Get student information from session first
    if (session?.user) {
      setStudentName(session.user.name || '');
      setStudentId(session.user.id || '');
    } else {
      // Fallback to localStorage for backward compatibility
      const stored = localStorage.getItem('currentUser');
      const studentMongoId = localStorage.getItem('studentMongoId');
      
      if (stored) {
        const user = JSON.parse(stored);
        setStudentName(`${user.first_name || ''} ${user.last_name || ''}`.trim());
        setStudentId(studentMongoId || '');
      }
    }
  }, [session]);

  const handleLogout = async () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.setItem('isStudent', 'false');
    localStorage.removeItem('studentMongoId');
    
    // Sign out from NextAuth
    await signOut({ redirect: false });
    
    // Redirect to login page
    router.push('/login/student');
  };

  const handleProfileClick = () => {
    if (studentId) {
      router.push(`/student/student_detail/${studentId}`);
    }
  };

  return (
    <div className="bg-dark text-white min-vh-100 p-0" style={{ width: '250px' }}>
      {/* โปรไฟล์ผู้ใช้ */}
      <div className="p-3 border-bottom border-warning bg-dark text-center">
        <div className="mb-2">
          <i className="bi bi-person-circle fs-1 text-warning"></i>
        </div>
        <h6 className="mb-0 text-truncate">{studentName || 'นักเรียน'}</h6>
        <span className="badge bg-warning text-dark rounded-0 mt-1 px-3 py-1">
          STUDENT
        </span>
      </div>

      {/* เมนูนักเรียน */}
      <div className="p-2">
        <h6 className="text-uppercase text-white-50 small fw-bold px-3 mt-3 mb-2">
          <i className="bi bi-person me-2"></i>เมนูของฉัน
        </h6>
        
        <button
          onClick={handleProfileClick}
          className={`w-full d-block py-2 px-3 mb-1 text-decoration-none rounded-0 text-left ${
            pathname?.includes('/student/student_detail')
              ? "bg-warning text-dark"
              : "text-white hover-bg-warning hover-text-dark"
          }`}
          style={{
            backgroundColor: pathname?.includes('/student/student_detail') ? '#ffc107' : 'transparent',
            color: pathname?.includes('/student/student_detail') ? '#000' : '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <i className="bi bi-person-circle me-2"></i>
          โปรไฟล์ของฉัน
        </button>

        <button
          onClick={handleLogout}
          className="w-full d-block py-2 px-3 text-decoration-none text-left hover-bg-danger rounded-0"
          style={{
            backgroundColor: 'transparent',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          ออกจากระบบ
        </button>
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
