// D:\advisor-main\app\student_problem\page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Problem {
  _id: string;
  student_id: string;
  student_name: string;
  problem?: string;
  goal?: string;
  progress?: number;
  isp_status?: "กำลังดำเนินการ" | "สำเร็จ" | "ปรับแผน";
  evaluations?: any[];
}

interface Activity {
  _id: string;
  name: string;
  duration: number;
  materials: string;
  steps: string;
  ice_breaking: string;
  group_task: string;
  debrief: string;
  activity_date: string;
  participants: Array<{
    student_id: string;
    student_name: string;
    joined: boolean;
  }>;
  total_participants: number;
  joined_count: number;
}

export default function StudentProblemPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("students");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load Bootstrap
    const bootstrapLink = document.createElement("link");
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    bootstrapLink.rel = "stylesheet";
    document.head.appendChild(bootstrapLink);

    const iconLink = document.createElement("link");
    iconLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/problem");
      const data = await res.json();
      setProblems(data.data || []);
      
      // ดึงกิจกรรมทั้งหมด
      const activitiesRes = await fetch("/api/problem/activity");
      const activitiesData = await activitiesRes.json();
      setActivities(activitiesData.data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLatestEvaluation = (evaluations: any[]) => {
    if (!evaluations?.length) return "-";
    const latest = evaluations.sort((a, b) => 
      new Date(b.evaluation_date).getTime() - new Date(a.evaluation_date).getTime()
    )[0];
    return latest.improvement_level;
  };

  const handleDeleteActivity = async (id: string) => {
    if (!id) return;
    
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้?")) {
      try {
        const res = await fetch(`/api/problem/activity?id=${id}`, {
          method: "DELETE"
        });
        
        if (res.ok) {
          alert("ลบกิจกรรมเรียบร้อย");
          fetchData(); // โหลดข้อมูลใหม่
        } else {
          alert("เกิดข้อผิดพลาดในการลบ");
        }
      } catch (error) {
        console.error("Error deleting activity:", error);
        alert("เกิดข้อผิดพลาด");
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('th-TH');
    } catch {
      return '-';
    }
  };

  const stats = {
    total: problems.length,
    active: problems.filter(p => p.isp_status === "กำลังดำเนินการ").length,
    completed: problems.filter(p => p.isp_status === "สำเร็จ").length,
    totalActivities: activities.length
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand text-warning fw-bold" href="/">
            <i className="bi bi-mortarboard-fill me-2"></i>
            ระบบดูแลผู้เรียนรายบุคคล
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center border-bottom border-3 border-warning pb-2">
              <h2 className="fw-bold">
                <i className="bi bi-shield-check text-warning me-2"></i>
                ป้องกันและแก้ไขปัญหาผู้เรียน
              </h2>
              <div>
                <span className="badge bg-warning text-dark rounded-0 p-2 me-2">
                  ดำเนินการ: {stats.active}
                </span>
                <span className="badge bg-success rounded-0 p-2 me-2">
                  สำเร็จ: {stats.completed}
                </span>
                <span className="badge bg-info text-dark rounded-0 p-2">
                  กิจกรรม: {stats.totalActivities}
                </span>
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
                  className={`nav-link rounded-0 ${activeTab === 'students' ? 'active bg-dark text-white' : 'bg-light'}`}
                  onClick={() => setActiveTab('students')}
                >
                  <i className="bi bi-people me-2"></i>นักเรียน
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link rounded-0 ${activeTab === 'activities' ? 'active bg-dark text-white' : 'bg-light'}`}
                  onClick={() => setActiveTab('activities')}
                >
                  <i className="bi bi-activity me-2"></i>กิจกรรม
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tab: Students */}
        {activeTab === 'students' && (
          <div className="row">
            <div className="col-12">
              <div className="card rounded-0 border-0 shadow-sm">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center rounded-0">
                  <h5 className="mb-0">
                    <i className="bi bi-list-check me-2 text-warning"></i>
                    รายการนักเรียนที่ต้องแก้ไขปัญหา
                  </h5>
                  <Link href="/student_problem/add" className="btn btn-warning btn-sm rounded-0">
                    <i className="bi bi-plus-circle me-2"></i>เพิ่มนักเรียน
                  </Link>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>รหัสนักศึกษา</th>
                          <th>ชื่อ-นามสกุล</th>
                          <th>ปัญหา</th>
                          <th>แผน ISP</th>
                          <th>ความคืบหน้า</th>
                          <th>สถานะ</th>
                          <th>การประเมินล่าสุด</th>
                          <th>จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {problems.map((p) => (
                          <tr key={p._id}>
                            <td className="align-middle">
                              <span className="fw-bold">{p.student_id}</span>
                            </td>
                            <td className="align-middle">
                              <span>{p.student_name}</span>
                            </td>
                            <td className="align-middle">{p.problem || '-'}</td>
                            <td className="align-middle">{p.goal || '-'}</td>
                            <td className="align-middle" style={{ width: '150px' }}>
                              <div className="d-flex align-items-center">
                                <div className="progress rounded-0 flex-grow-1" style={{ height: '8px' }}>
                                  <div className="progress-bar bg-warning" style={{ width: `${p.progress || 0}%` }}></div>
                                </div>
                                <span className="ms-2 small fw-bold">{p.progress || 0}%</span>
                              </div>
                            </td>
                            <td className="align-middle">
                              <span className={`badge rounded-0 px-3 py-2 ${
                                p.isp_status === 'กำลังดำเนินการ' ? 'bg-warning text-dark' :
                                p.isp_status === 'สำเร็จ' ? 'bg-success' : 'bg-secondary'
                              }`}>
                                {p.isp_status || 'รอดำเนินการ'}
                              </span>
                            </td>
                            <td className="align-middle">
                              <span className={`badge rounded-0 px-3 py-2 ${
                                getLatestEvaluation(p.evaluations || []) === 'ดีขึ้นชัดเจน' ? 'bg-success' :
                                getLatestEvaluation(p.evaluations || []) === 'เริ่มเห็นการเปลี่ยนแปลง' ? 'bg-warning text-dark' :
                                getLatestEvaluation(p.evaluations || []) === 'คงเดิม/ไม่เปลี่ยนแปลง' ? 'bg-danger' : 'bg-secondary bg-opacity-25 text-dark'
                              }`}>
                                {getLatestEvaluation(p.evaluations || [])}
                              </span>
                            </td>
                            <td className="align-middle">
                              <div className="btn-group btn-group-sm">
                                <Link href={`/student_problem/${p._id}`} 
                                  className="btn btn-outline-primary" title="ดูรายละเอียด">
                                  <i className="bi bi-eye"></i>
                                </Link>
                                <Link href={`/student_problem/${p._id}/edit`} 
                                  className="btn btn-outline-success" title="แก้ไขแผน">
                                  <i className="bi bi-pencil"></i>
                                </Link>
                                <Link href={`/student_problem/${p._id}?tab=activities`} 
                                  className="btn btn-outline-info" title="กำหนดกิจกรรม">
                                  <i className="bi bi-calendar-check"></i>
                                </Link>
                                <Link href={`/student_problem/${p._id}/result`} 
                                  className="btn btn-outline-warning" title="บันทึกผล">
                                  <i className="bi bi-bar-chart"></i>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {problems.length === 0 && (
                          <tr>
                            <td colSpan={8} className="text-center py-5">
                              <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
                              <p className="text-muted mb-0">ยังไม่มีข้อมูลนักเรียน</p>
                              <Link href="/student_problem/add" className="btn btn-warning btn-sm mt-3">
                                <i className="bi bi-plus-circle me-2"></i>เพิ่มนักเรียน
                              </Link>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Activities */}
        {activeTab === 'activities' && (
          <div className="row">
            <div className="col-12">
              <div className="card rounded-0 border-0 shadow-sm">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center rounded-0">
                  <h5 className="mb-0">
                    <i className="bi bi-activity me-2 text-warning"></i>
                    จัดการกิจกรรมกลุ่มสัมพันธ์
                  </h5>
                  <Link href="/student_problem/activity/add" className="btn btn-warning btn-sm rounded-0">
                    <i className="bi bi-plus-circle me-2"></i>เพิ่มกิจกรรม
                  </Link>
                </div>
                <div className="card-body">
                  {activities.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-calendar-x fs-1 text-muted d-block mb-3"></i>
                      <p className="text-muted mb-0">ยังไม่มีกิจกรรม</p>
                      <Link href="/student_problem/activity/add" className="btn btn-warning btn-sm mt-3">
                        <i className="bi bi-plus-circle me-2"></i>เพิ่มกิจกรรม
                      </Link>
                    </div>
                  ) : (
                    <div className="row">
                      {activities.map((act) => (
                        <div key={act._id} className="col-md-6 col-lg-4 mb-4">
                          <div className="card h-100 border-0 shadow-sm">
                            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                              <h6 className="fw-bold mb-0 text-truncate" style={{ maxWidth: '180px' }} title={act.name}>
                                {act.name}
                              </h6>
                              <span className="badge bg-info rounded-0">
                                {act.joined_count || 0}/{act.total_participants || 0}
                              </span>
                            </div>
                            <div className="card-body">
                              <div className="mb-3">
                                <p className="small mb-2">
                                  <i className="bi bi-clock me-2 text-warning"></i>
                                  <strong>เวลา:</strong> {act.duration} นาที
                                </p>
                                <p className="small mb-2">
                                  <i className="bi bi-calendar me-2 text-warning"></i>
                                  <strong>วันที่:</strong> {formatDate(act.activity_date)}
                                </p>
                                {act.materials && (
                                  <p className="small mb-2">
                                    <i className="bi bi-tools me-2 text-warning"></i>
                                    <strong>อุปกรณ์:</strong> {act.materials}
                                  </p>
                                )}
                              </div>
                              <div className="small text-muted bg-light p-2 rounded">
                                <i className="bi bi-chat-quote me-1"></i>
                                {act.debrief ? (act.debrief.length > 50 ? act.debrief.substring(0, 50) + '...' : act.debrief) : 'ไม่มีบทเรียน'}
                              </div>
                            </div>
                            <div className="card-footer bg-transparent p-2">
                              <div className="btn-group w-100">
                                <Link 
                                  href={`/student_problem/activity/view?id=${act._id}`} 
                                  className="btn btn-sm btn-outline-primary"
                                  title="ดูรายละเอียด"
                                >
                                  <i className="bi bi-eye"></i>
                                </Link>
                                <Link 
                                  href={`/student_problem/activity/edit?id=${act._id}`} 
                                  className="btn btn-sm btn-outline-warning"
                                  title="แก้ไข"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Link>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  title="ลบ"
                                  onClick={() => handleDeleteActivity(act._id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}