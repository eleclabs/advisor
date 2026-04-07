"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface StudentLayoutWrapperProps {
  children: React.ReactNode;
}

export default function StudentLayoutWrapper({ children }: StudentLayoutWrapperProps) {
  const pathname = usePathname();
  const [isStudentPage, setIsStudentPage] = useState(false);

  useEffect(() => {
    // Check if current user is a student and on a student page
    const isStudent = localStorage.getItem('isStudent') === 'true';
    const studentPaths = [
      '/login/student',
      '/assessment/student',
      '/student/student_detail'
    ];
    
    const onStudentPath = studentPaths.some(path => pathname.startsWith(path));
    setIsStudentPage(isStudent && onStudentPath);
  }, [pathname]);

  if (isStudentPage) {
    // For student pages, return children without header/sidebar
    return <>{children}</>;
  }

  // For non-student pages, return children with normal layout
  return <>{children}</>;
}
