"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "./Header";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [shouldShowLayout, setShouldShowLayout] = useState(true);

  useEffect(() => {
    // Check if current user is a student
    const isStudent = localStorage.getItem('isStudent') === 'true';
    
    // Define paths that should hide the layout for students
    const studentPaths = [
      '/login/student',
      '/assessment/student',
      '/student/student_detail'
    ];
    
    // Hide layout if user is student and on a student path
    const isStudentPath = studentPaths.some(path => pathname.startsWith(path));
    setShouldShowLayout(!(isStudent && isStudentPath));
  }, [pathname]);

  if (!shouldShowLayout) {
    // For student pages, return children without layout
    return <>{children}</>;
  }

  // For other pages, return children with full layout
  return (
    <>
      <Header />
      <Navbar />
      <div className="row g-0">
        <div className="col-md-3 col-lg-2">
          <Sidebar />
        </div>
        <div className="col-md-9 col-lg-10 p-4">
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
}
