// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface DashboardStats {
  studentCount: number;
  teacherCount: number;
  adminCount: number;
  executiveCount: number;
  committeeCount: number;
  totalUsers: number;
}


export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch user statistics
      const statsResponse = await fetch("/api/dashboard/stats");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="card">
            <div className="card-body">
              <h2 className="mb-4">กรุณาเข้าสู่ระบบ</h2>
              <Link href="/login" className="btn btn-primary">
                ไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userRole = session.user?.role;

  return (
    <div className="container-fluid p-0">

        <div className="container-fluid p-4">
          {/* Welcome Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card bg-dark text-white">
                <div className="card-body text-center py-4">
                  <h3 className="mb-3">ยินดีต้อนรับกลับมา, {session.user?.name?.split(' ')[0] || session.user?.name}!</h3>
                  <p className="mb-0 fs-5">บทบาท: <span className="badge bg-warning text-dark">{userRole}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="bi bi-people-fill" style={{ fontSize: "3rem", color: "#007bff" }}></i>
                  </div>
                  <h5 className="card-title">นักเรียน</h5>
                  <p className="display-4 fw-bold text-primary">
                    {loading ? "..." : stats?.studentCount || 0}
                  </p>
                  <p className="text-muted">นักเรียนทั้งหมด</p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="bi bi-person-badge-fill" style={{ fontSize: "3rem", color: "#28a745" }}></i>
                  </div>
                  <h5 className="card-title">ครู</h5>
                  <p className="display-4 fw-bold text-success">
                    {loading ? "..." : stats?.teacherCount || 0}
                  </p>
                  <p className="text-muted">ครูทั้งหมด</p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="bi bi-shield-fill" style={{ fontSize: "3rem", color: "#dc3545" }}></i>
                  </div>
                  <h5 className="card-title">ผู้ดูแลระบบ</h5>
                  <p className="display-4 fw-bold text-danger">
                    {loading ? "..." : stats?.adminCount || 0}
                  </p>
                  <p className="text-muted">ผู้ดูแลระบบทั้งหมด</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="row mb-4">
            <div className="col-12">
              <h4 className="mb-3"><i className="bi bi-lightning-fill me-2"></i>การทำงานด่วน</h4>
            </div>
            {(userRole === "ADMIN" || userRole === "TEACHER") && (
              <div className="col-md-4 mb-3">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <i className="bi bi-person-lines-fill" style={{ fontSize: "3rem", color: "#007bff" }}></i>
                    </div>
                    <h5 className="card-title">จัดการนักเรียน</h5>
                    <p className="text-muted">ดูและจัดการข้อมูลนักเรียน</p>
                    <Link href="/student" className="btn btn-primary w-100">
                      <i className="bi bi-arrow-right me-1"></i> ไปยังนักเรียน
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="bi bi-file-earmark-bar-graph-fill" style={{ fontSize: "3rem", color: "#28a745" }}></i>
                  </div>
                  <h5 className="card-title">รายงานและสถิติ</h5>
                  <p className="text-muted">ดูรายงานและการวิเคราะห์โดยละเอียด</p>
                  <Link href="/student/report" className="btn btn-outline-primary w-100">
                    <i className="bi bi-graph-up me-1"></i> ดูรายงาน
                  </Link>
                </div>
              </div>
            </div>

            {userRole === "ADMIN" && (
              <div className="col-md-4 mb-3">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <i className="bi bi-emoji-smile-fill" style={{ fontSize: "3rem", color: "#ffc107" }}></i>
                    </div>
                    <h5 className="card-title">การประเมินความพึงพอใจ</h5>
                    <p className="text-muted">การประเมินความพึงพอใจของผู้ใช้</p>
                    <Link href="/evaluation" className="btn btn-warning w-100">
                      <i className="bi bi-star me-1"></i> การประเมินความพึงพอใจ
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Features Section */}
          <div className="row mb-4">
            <div className="col-12">
              <h4 className="mb-3"><i className="bi bi-grid-3x3-gap me-2"></i>คุณสมบัติระบบ</h4>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card">
                <div className="card-body text-center">
                  <i className="bi bi-clipboard-data-fill" style={{ fontSize: "2rem", color: "#007bff" }}></i>
                  <h6 className="mt-2">การประเมิน</h6>
                  <p className="small text-muted">SDQ & DASS-21</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card">
                <div className="card-body text-center">
                  <i className="bi bi-clipboard-check-fill" style={{ fontSize: "2rem", color: "#28a745" }}></i>
                  <h6 className="mt-2">การประเมินผล</h6>
                  <p className="small text-muted">การประเมินนักเรียน</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card">
                <div className="card-body text-center">
                  <i className="bi bi-file-earmark-text-fill" style={{ fontSize: "2rem", color: "#ffc107" }}></i>
                  <h6 className="mt-2">แบบฟอร์ม</h6>
                  <p className="small text-muted">แบบฟอร์มที่กำหนดเอง</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card">
                <div className="card-body text-center">
                  <i className="bi bi-bar-chart-fill" style={{ fontSize: "2rem", color: "#dc3545" }}></i>
                  <h6 className="mt-2">สรุป</h6>
                  <p className="small text-muted">ข้อมูลทั้งหมด</p>
                </div>
              </div>
            </div>
            
                </div>
              </div>
            </div>
         
  );
}