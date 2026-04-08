"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

function ConditionalLayoutContent({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
    
    // Check if this is an assessment page with type parameter
    const assessmentType = searchParams.get('type');
    const isAssessmentWithParams = pathname === '/assessment' && 
      (assessmentType === 'sdq' || assessmentType === 'dass21');
    
    // Hide layout if user is student and on a student path or assessment with params
    const isStudentPath = studentPaths.some(path => pathname.startsWith(path)) || isAssessmentWithParams;
    setShouldShowLayout(!(isStudent && isStudentPath));
  }, [pathname, searchParams]);

  if (!shouldShowLayout) {
    // For student pages, return children without layout
    return <>{children}</>;
  }

  // For other pages, return children with full layout
  return (
    <>
      <Header />
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

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #007bff', 
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '16px', color: '#6c757d' }}>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <ConditionalLayoutContent>{children}</ConditionalLayoutContent>
    </Suspense>
  );
}
