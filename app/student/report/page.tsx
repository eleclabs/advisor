// app/student/report/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface ReportStats {
  totalStudents: number;
  normalCount: number;
  riskCount: number;
  riskBehaviorCount: number;
  familyProblemCount: number;
  lowIncomeCount: number;
  problemSolvedCount: number;
  referredCount: number;
}

export default function StudentReport() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/student/report/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching report stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center p-4">
          <div className="mb-3">
            <i className="bi bi-person-circle fs-1 text-warning"></i>
          </div>
          <h2 className="mb-3 text-dark">กรุณาเข้าสู่ระบบ</h2>
          <a href="/login" className="btn btn-warning rounded-0 px-4 py-2">
            <i className="bi bi-box-arrow-in-right me-2"></i>
            เข้าสู่ระบบ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="border-bottom border-3 border-warning pb-2">
            <h1 className="text-uppercase fw-bold m-0">
              <i className="bi bi-graph-up me-2 text-warning"></i>
              การรายงานและสถิติ
            </h1>
           {/*  <p className="text-muted mb-0 mt-2">ภาพรวมสถานะนักเรียนและการดำเนินงาน</p> */}
          </div>
        </div>
      </div>

      {/* Student Status Overview */}
{/* 
      <div className="row mb-4">
        <div className="col-12">
          <h3 className="mb-3">
            <i className="bi bi-people me-2 text-primary"></i>
            ภาพรวมสถานะนักเรียน
          </h3>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white rounded-0 h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-2">
                <i className="bi bi-check-circle fs-1"></i>
              </div>
              <h5 className="card-title fw-bold">ปกติ</h5>
              <p className="card-text display-4 fw-bold">
                {loading ? "..." : stats?.normalCount || 0}
              </p>
              <small className="card-text">นักเรียน</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-dark rounded-0 h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-2">
                <i className="bi bi-exclamation-triangle fs-1"></i>
              </div>
              <h5 className="card-title fw-bold">เสี่ยง</h5>
              <p className="card-text display-4 fw-bold">
                {loading ? "..." : stats?.riskCount || 0}
              </p>
              <small className="card-text">นักเรียน</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card bg-danger text-white rounded-0 h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-2">
                <i className="bi bi-x-circle fs-1"></i>
              </div>
              <h5 className="card-title fw-bold">มีปัญหา</h5>
              <p className="card-text display-4 fw-bold">
                {loading ? "..." : stats?.riskBehaviorCount || 0}
              </p>
              <small className="card-text">นักเรียน</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white rounded-0 h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-2">
                <i className="bi bi-people-fill fs-1"></i>
              </div>
              <h5 className="card-title fw-bold">นักเรียนทั้งหมด</h5>
              <p className="card-text display-4 fw-bold">
                {loading ? "..." : stats?.totalStudents || 0}
              </p>
              <small className="card-text">คน</small>
            </div>
          </div>
        </div>
      </div>
  */}     

      {/* Problem Categories */}
{/*       
      <div className="row mb-4">
        <div className="col-12">
          <h3 className="mb-3">
            <i className="bi bi-exclamation-diamond me-2 text-warning"></i>
            หมวดหมู่ปัญหา
          </h3>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="card bg-info text-white rounded-0 h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-2">
                <i className="bi bi-house-heart fs-1"></i>
              </div>
              <h5 className="card-title fw-bold">ปัญหาครอบครัว</h5>
              <p className="card-text display-4 fw-bold">
                {loading ? "..." : stats?.familyProblemCount || 0}
              </p>
              <small className="card-text">นักเรียนได้รับผลกระทบ</small>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card bg-secondary text-white rounded-0 h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-2">
                <i className="bi bi-cash-stack fs-1"></i>
              </div>
              <h5 className="card-title fw-bold">เศรษฐกิจรายได้น้อย</h5>
              <p className="card-text display-4 fw-bold">
                {loading ? "..." : stats?.lowIncomeCount || 0}
              </p>
              <small className="card-text">นักเรียนได้รับผลกระทบ</small>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card bg-dark text-white rounded-0 h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-2">
                <i className="bi bi-exclamation-triangle-fill fs-1"></i>
              </div>
              <h5 className="card-title fw-bold">พฤติกรรมเสี่ยง</h5>
              <p className="card-text display-4 fw-bold">
                {loading ? "..." : (stats?.familyProblemCount || 0) + (stats?.lowIncomeCount || 0)}
              </p>
              <small className="card-text">นักเรียนได้รับผลกระทบ</small>
            </div>
          </div>
        </div>
      </div>
 */}

      {/* Intervention Statistics */}
{/*       
      <div className="row mb-4">
        <div className="col-12">
          <h3 className="mb-3">
            <i className="bi bi-shield-check me-2 text-success"></i>
            สถิติการดำเนินงาน
          </h3>
        </div>
        
        <div className="col-md-6 mb-3">
          <div className="card bg-success text-white rounded-0 h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-2">
                <i className="bi bi-check-square fs-1"></i>
              </div>
              <h5 className="card-title fw-bold">ป้องกันและแก้ไขปัญหา</h5>
              <p className="card-text display-4 fw-bold">
                {loading ? "..." : stats?.problemSolvedCount || 0}
              </p>
              <small className="card-text">นักเรียนได้รับการช่วยเหลือ</small>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card bg-warning text-dark rounded-0 h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-2">
                <i className="bi bi-send fs-1"></i>
              </div>
              <h5 className="card-title fw-bold">ระบบบริหารการส่งต่อ</h5>
              <p className="card-text display-4 fw-bold">
                {loading ? "..." : stats?.referredCount || 0}
              </p>
              <small className="card-text">นักเรียนที่ถูกส่งต่อ</small>
            </div>
          </div>
        </div>
      </div>
 */}

      {/* Summary Table */}
      <div className="row">
        <div className="col-12">
          <h3 className="mb-3">
            <i className="bi bi-table me-2 text-info"></i>
            สรุปสถิติ
          </h3>
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>หมวดหมู่</th>
                  <th>จำนวน</th>
                  <th>เปอร์เซ็นต์</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><i className="bi bi-check-circle me-2 text-success"></i>นักเรียนปกติ</td>
                  <td className="fw-bold">{loading ? "..." : stats?.normalCount || 0}</td>
                  <td className="fw-bold">{loading ? "..." : stats ? ((stats.normalCount / stats.totalStudents) * 100).toFixed(1) : 0}%</td>
                  <td><span className="badge bg-success rounded-0">ดี</span></td>
                </tr>
                <tr>
                  <td><i className="bi bi-exclamation-triangle me-2 text-warning"></i>นักเรียนเสี่ยง</td>
                  <td className="fw-bold">{loading ? "..." : stats?.riskCount || 0}</td>
                  <td className="fw-bold">{loading ? "..." : stats ? ((stats.riskCount / stats.totalStudents) * 100).toFixed(1) : 0}%</td>
                  <td><span className="badge bg-warning text-dark rounded-0">ติดตาม</span></td>
                </tr>
                <tr>
                  <td><i className="bi bi-x-circle me-2 text-danger"></i>นักเรียนพฤติกรรมเสี่ยง</td>
                  <td className="fw-bold">{loading ? "..." : stats?.riskBehaviorCount || 0}</td>
                  <td className="fw-bold">{loading ? "..." : stats ? ((stats.riskBehaviorCount / stats.totalStudents) * 100).toFixed(1) : 0}%</td>
                  <td><span className="badge bg-danger rounded-0">ต้องดำเนินการ</span></td>
                </tr>
                <tr>
                  <td><i className="bi bi-house-heart me-2 text-info"></i>ปัญหาครอบครัว</td>
                  <td className="fw-bold">{loading ? "..." : stats?.familyProblemCount || 0}</td>
                  <td className="fw-bold">{loading ? "..." : stats ? ((stats.familyProblemCount / stats.totalStudents) * 100).toFixed(1) : 0}%</td>
                  <td><span className="badge bg-info rounded-0">ต้องการการสนับสนุน</span></td>
                </tr>
                <tr>
                  <td><i className="bi bi-cash-stack me-2 text-secondary"></i>เศรษฐกิจรายได้น้อย</td>
                  <td className="fw-bold">{loading ? "..." : stats?.lowIncomeCount || 0}</td>
                  <td className="fw-bold">{loading ? "..." : stats ? ((stats.lowIncomeCount / stats.totalStudents) * 100).toFixed(1) : 0}%</td>
                  <td><span className="badge bg-secondary rounded-0">ต้องการความช่วยเหลือ</span></td>
                </tr>
                <tr>
                  <td><i className="bi bi-check-square me-2 text-success"></i>นักเรียนที่ได้รับการป้องกันและแก้ปัญหา</td>
                  <td className="fw-bold">{loading ? "..." : stats?.problemSolvedCount || 0}</td>
                  <td className="text-muted">-</td>
                  <td><span className="badge bg-success rounded-0"></span></td>
                </tr>
                <tr>
                  <td><i className="bi bi-send me-2 text-warning"></i>นักเรียนที่ส่งต่อ</td>
                  <td className="fw-bold">{loading ? "..." : stats?.referredCount || 0}</td>
                  <td className="text-muted">-</td>
                  <td><span className="badge bg-warning text-dark rounded-0"></span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
