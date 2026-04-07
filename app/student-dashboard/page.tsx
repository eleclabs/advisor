"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is a student
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!token || !currentUser) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(currentUser);
      if (user.role !== 'STUDENT') {
        router.push('/login');
        return;
      }
    } catch (error) {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
            <h2 className="text-uppercase fw-bold m-0">
              <i className="bi bi-speedometer2 me-2 text-warning"></i>
              หน้าแรกสำหรับนักเรียน
            </h2>
            <button 
              className="btn btn-outline-danger rounded-0 text-uppercase fw-semibold"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="alert alert-info rounded-0">
            <h5 className="alert-heading">
              <i className="bi bi-info-circle me-2"></i>
              ยินดีต้อนรับสู่ระบบประเมินทางจิตวิทยา
            </h5>
            <p className="mb-0">
              กรุณาเลือกแบบประเมินที่ต้องการทำเพื่อประเมินสุขภาพจิตใจ
            </p>
          </div>
        </div>
      </div>

      {/* Assessment Cards */}
      <div className="row g-4">
        {/* SDQ Card */}
        <div className="col-md-6">
          <div className="card h-100 rounded-0 border-0 shadow-sm">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <div className="d-inline-block p-3 bg-light rounded-circle">
                  <i className="bi bi-clipboard-check fs-1 text-primary"></i>
                </div>
              </div>
              <h5 className="card-title fw-semibold mb-3">SDQ</h5>
              <p className="card-text text-muted mb-4">
                Strengths and Difficulties Questionnaire<br/>
                <small>แบบประเมินจุดแข็งและปัญหาพฤติกรรมสำหรับเด็กและวัยรุ่น (25 ข้อ)</small>
              </p>
              <div className="mb-3">
                <span className="badge bg-info text-white rounded-0">
                  <i className="bi bi-clock me-1"></i>
                  ใช้เวลาประมาณ 5-10 นาที
                </span>
              </div>
              <div className="d-grid gap-2">
                <Link 
                  href="/assessment/sdq" 
                  className="btn btn-primary rounded-0 text-uppercase fw-semibold"
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  เริ่มทำแบบประเมิน
                </Link>
                <Link 
                  href="/assessment/sdq/results" 
                  className="btn btn-outline-primary rounded-0 text-uppercase fw-semibold"
                >
                  <i className="bi bi-eye me-2"></i>
                  ดูผลการประเมิน
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* DASS-21 Card */}
        <div className="col-md-6">
          <div className="card h-100 rounded-0 border-0 shadow-sm">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <div className="d-inline-block p-3 bg-light rounded-circle">
                  <i className="bi bi-emoji-smile fs-1 text-success"></i>
                </div>
              </div>
              <h5 className="card-title fw-semibold mb-3">DASS-21</h5>
              <p className="card-text text-muted mb-4">
                Depression Anxiety Stress Scales<br/>
                <small>แบบประเมินภาวะซึมเศร้าย วิตกกังวล และความเครียด (21 ข้อ)</small>
              </p>
              <div className="mb-3">
                <span className="badge bg-success text-white rounded-0">
                  <i className="bi bi-clock me-1"></i>
                  ใช้เวลาประมาณ 5-10 นาที
                </span>
              </div>
              <div className="d-grid gap-2">
                <Link 
                  href="/assessment/dass21" 
                  className="btn btn-success rounded-0 text-uppercase fw-semibold"
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  เริ่มทำแบบประเมิน
                </Link>
                <Link 
                  href="/assessment/dass21/results" 
                  className="btn btn-outline-success rounded-0 text-uppercase fw-semibold"
                >
                  <i className="bi bi-eye me-2"></i>
                  ดูผลการประเมิน
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card border-0 bg-light rounded-0">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">
                <i className="bi bi-info-circle me-2"></i>
                วิธีการทำแบบประเมิน
              </h6>
              <ol className="mb-0">
                <li className="mb-2">เลือกแบบประเมินที่ต้องการทำ (SDQ หรือ DASS-21)</li>
                <li className="mb-2">ตอบคำถามตามความรู้สึกจริงใจ</li>
                <li className="mb-2">อ่านคำถามให้ละเอียดก่อนตอบ</li>
                <li className="mb-2">ทำแบบประเมินให้เสร็จสิ้นทุกข้อ</li>
                <li className="mb-2">กดส่งเพื่อบันทึกผลการประเมิน</li>
                <li>สามารถกลับมาดูผลการประเมินได้ทุกเมื่อ</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
