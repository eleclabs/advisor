// D:\advisor-main\app\student_problem\[id]\page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";

export default function ViewProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [problem, setProblem] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      console.log("🔍 Fetching problem with ID:", id);
      const res = await fetch(`/api/problem/${id}`);
      const data = await res.json();
      console.log("📥 Response:", data);
      setProblem(data.data);
      
      // ดึงกิจกรรมที่นักเรียนคนนี้เข้าร่วม
      if (data.data && data.data.student_id) {
        const activitiesRes = await fetch(`/api/problem/activity?student_id=${data.data.student_id}`);
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData.data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return "-";
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "-";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "success";
    if (progress >= 50) return "info";
    if (progress >= 20) return "warning";
    return "danger";
  };

  // ✅ ดึงสถานะกิจกรรมจาก Problem (activities_status)
  const getActivityStatus = (activityId: string) => {
    const status = problem?.activities_status?.[activityId];
    
    if (status === 'completed') return 'เสร็จสิ้น';
    if (status === 'joined') return 'เข้าร่วมแล้ว';
    return 'ยังไม่เข้าร่วม';
  };

  // ✅ ดึงวันที่เข้าร่วมจาก Problem (activity_join_dates)
  const getJoinDate = (activityId: string) => {
    return problem?.activity_join_dates?.[activityId] || null;
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'เสร็จสิ้น': return 'bg-success';
      case 'เข้าร่วมแล้ว': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-2 text-muted">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle fs-1 text-warning d-block mb-3"></i>
          <h4>ไม่พบข้อมูลนักเรียน</h4>
          <p className="text-muted">อาจถูกลบหรือไม่มีอยู่ในระบบ</p>
          <Link href="/student_problem" className="btn btn-warning mt-3">
            <i className="bi bi-arrow-left me-2"></i>กลับไปหน้ารายการ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center border-bottom border-3 border-warning pb-2">
            <h2 className="fw-bold">
              <i className="bi bi-person text-warning me-2"></i>
              รายละเอียดนักเรียน: {problem.student_name}
            </h2>
            <div>
              <Link href={`/student_problem/${problem._id}/edit`} className="btn btn-warning btn-sm me-2">
                <i className="bi bi-pencil me-1"></i>แก้ไขแผน
              </Link>
              <Link href={`/student_problem/${problem._id}/result`} className="btn btn-info btn-sm">
                <i className="bi bi-bar-chart me-1"></i>ผลประเมิน
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'info' ? 'active bg-dark text-white' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <i className="bi bi-info-circle me-2"></i>ข้อมูลทั่วไป
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'isp' ? 'active bg-dark text-white' : ''}`}
                onClick={() => setActiveTab('isp')}
              >
                <i className="bi bi-clipboard-check me-2"></i>แผน ISP
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'activities' ? 'active bg-dark text-white' : ''}`}
                onClick={() => setActiveTab('activities')}
              >
                <i className="bi bi-activity me-2"></i>กิจกรรม
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'evaluations' ? 'active bg-dark text-white' : ''}`}
                onClick={() => setActiveTab('evaluations')}
              >
                <i className="bi bi-bar-chart me-2"></i>การประเมิน
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="row">
        <div className="col-12">
          {/* TAB 1: ข้อมูลทั่วไป */}
          {activeTab === 'info' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-4">
                      <h6 className="text-muted mb-2">รหัสนักเรียน</h6>
                      <p className="fs-5 fw-bold">{problem.student_id}</p>
                    </div>
                    <div className="mb-4">
                      <h6 className="text-muted mb-2">ชื่อ-นามสกุล</h6>
                      <p className="fs-5">{problem.student_name}</p>
                    </div>
                    <div className="mb-4">
                      <h6 className="text-muted mb-2">วันที่สร้าง</h6>
                      <p>{formatDateTime(problem.createdAt)}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-4">
                      <h6 className="text-muted mb-2">สถานะแผน</h6>
                      <span className={`badge bg-${
                        problem.isp_status === 'กำลังดำเนินการ' ? 'warning' :
                        problem.isp_status === 'สำเร็จ' ? 'success' : 'danger'
                      } fs-6 p-2`}>
                        {problem.isp_status || 'ไม่ระบุ'}
                      </span>
                    </div>
                    <div className="mb-4">
                      <h6 className="text-muted mb-2">ความคืบหน้า</h6>
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1" style={{ height: '20px' }}>
                          <div 
                            className={`progress-bar bg-${getProgressColor(problem.progress || 0)}`}
                            style={{ width: `${problem.progress || 0}%` }}
                          >
                            {problem.progress || 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h6 className="text-muted mb-2">อัปเดตล่าสุด</h6>
                      <p>{formatDateTime(problem.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: แผน ISP */}
          {activeTab === 'isp' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="text-muted mb-2">ปัญหาที่พบ</h6>
                    <div className="bg-light p-3 rounded">
                      <p className="mb-0">{problem.problem || 'ไม่ระบุ'}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted mb-2">เป้าหมาย</h6>
                    <div className="bg-light p-3 rounded">
                      <p className="mb-0">{problem.goal || 'ไม่ระบุ'}</p>
                    </div>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="text-muted mb-2">ระยะเวลาดำเนินการ</h6>
                    <p className="fw-bold">{problem.duration || 'ไม่ระบุ'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted mb-2">ผู้รับผิดชอบ</h6>
                    <p className="fw-bold">{problem.responsible || 'ไม่ระบุ'}</p>
                  </div>
                </div>

                <div>
                  <h6 className="text-muted mb-2">วิธีการแก้ไขที่เลือก</h6>
                  <div className="row">
                    <div className="col-12">
                      {problem.counseling && (
                        <div className="mb-2 p-2 bg-light rounded">
                          <span className="badge bg-success me-2">✓</span>
                          การให้คำปรึกษาเบื้องต้น
                        </div>
                      )}
                      {problem.behavioral_contract && (
                        <div className="mb-2 p-2 bg-light rounded">
                          <span className="badge bg-success me-2">✓</span>
                          กิจกรรมปรับเปลี่ยนพฤติกรรม
                        </div>
                      )}
                      {problem.home_visit && (
                        <div className="mb-2 p-2 bg-light rounded">
                          <span className="badge bg-success me-2">✓</span>
                          การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง
                        </div>
                      )}
                      {problem.referral && (
                        <div className="mb-2 p-2 bg-light rounded">
                          <span className="badge bg-success me-2">✓</span>
                          การส่งต่อ
                        </div>
                      )}
                      {!problem.counseling && !problem.behavioral_contract && !problem.home_visit && !problem.referral && (
                        <p className="text-muted">ไม่มีวิธีการแก้ไข</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: กิจกรรม - ใช้ข้อมูลจาก Problem โดยตรง */}
          {activeTab === 'activities' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="mb-3">กิจกรรมที่เข้าร่วม</h5>
                {activities && activities.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '5%' }}>#</th>
                          <th style={{ width: '30%' }}>ชื่อกิจกรรม</th>
                          <th style={{ width: '20%' }}>วันที่เข้าร่วม</th>
                          <th style={{ width: '15%' }}>เวลากิจกรรม</th>
                          <th style={{ width: '20%' }}>สถานะกิจกรรม</th>
                          <th style={{ width: '10%' }}>ดูรายละเอียด</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map((act: any, idx: number) => {
                          // ✅ ดึงข้อมูลจาก Problem โดยตรง
                          const status = getActivityStatus(act._id);
                          const joinDate = getJoinDate(act._id);
                          
                          return (
                            <tr key={act._id || idx}>
                              <td className="fw-bold text-center">{idx + 1}</td>
                              <td>
                                <Link href={`/student_problem/activity/view?id=${act._id}`} className="text-decoration-none fw-bold">
                                  {act.name || 'ไม่ระบุชื่อ'}
                                </Link>
                              </td>
                              <td>
                                {joinDate 
                                  ? formatDate(joinDate)
                                  : '-'
                                }
                              </td>
                              <td className="text-center">{act.duration || '-'} นาที</td>
                              <td className="text-center">
                                <span className={`badge ${getStatusBadgeClass(status)} text-white px-3 py-2`}>
                                  {status}
                                </span>
                              </td>
                              <td className="text-center">
                                <Link 
                                  href={`/student_problem/activity/view?id=${act._id}`} 
                                  className="btn btn-sm btn-outline-info"
                                >
                                  <i className="bi bi-eye"></i>
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-calendar-x fs-1 text-muted d-block mb-3"></i>
                    <p className="text-muted mb-0">ยังไม่มีกิจกรรม</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: การประเมิน */}
          {activeTab === 'evaluations' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="mb-3">ประวัติการประเมิน</h5>
                {console.log("🔍 Evaluations data:", problem.evaluations)}
                {problem.evaluations && Array.isArray(problem.evaluations) && problem.evaluations.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>ครั้งที่</th>
                          <th>วันที่ประเมิน</th>
                          <th>ระดับการเปลี่ยนแปลง</th>
                          <th>ผลสรุป</th>
                          <th>หมายเหตุ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {problem.evaluations.map((e: any, idx: number) => (
                          <tr key={idx}>
                            <td className="fw-bold">{e.evaluation_number || idx + 1}</td>
                            <td>{formatDate(e.evaluation_date)}</td>
                            <td>
                              <span className={`badge bg-${
                                e.improvement_level === 'ดีขึ้นชัดเจน' ? 'success' :
                                e.improvement_level === 'เริ่มเห็นการเปลี่ยนแปลง' ? 'warning' : 'danger'
                              }`}>
                                {e.improvement_level || 'ไม่ระบุ'}
                              </span>
                            </td>
                            <td>{e.result || '-'}</td>
                            <td>{e.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-bar-chart fs-1 text-muted d-block mb-3"></i>
                    <p className="text-muted mb-0">ยังไม่มีการประเมิน</p>
                    <Link href={`/student_problem/${problem._id}/result`} className="btn btn-warning btn-sm mt-3">
                      <i className="bi bi-plus-circle me-2"></i>เพิ่มการประเมิน
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="row mt-4">
        <div className="col-12">
          <Link href="/student_problem" className="btn btn-secondary">
            <i className="bi bi-arrow-left me-2"></i>กลับไปหน้ารายการ
          </Link>
        </div>
      </div>
    </div>
  );
}