"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface HomeroomPlan {
  id: string;
  title: string;
  level: string;
  week: string;
  semester: string;
  academicYear: string;
  date: string;
  time: string;
  status: string;
  objectives: string[];
  disciplineManagement: string;
  studentDevelopment: string;
  individualCare: string;
  evaluation: {
    observation: boolean;
    worksheet: boolean;
    participation: boolean;
  };
  materials?: string;
  createdAt: string;
}

interface ActivityRecord {
  id: string;
  date: string;
  studentsAttended: number;
  totalStudents: number;
  notes: string;
  problems: string;
  solutions: string;
  evaluator: string;
  createdAt: string;
}

export default function HomeroomPlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [plan, setPlan] = useState<HomeroomPlan | null>(null);
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"plan" | "records">("plan");

  const teacher_name = "อาจารย์วิมลรัตน์";

  useEffect(() => {
    // Load Bootstrap CSS
    const bootstrapLink = document.createElement("link");
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    bootstrapLink.rel = "stylesheet";
    document.head.appendChild(bootstrapLink);

    const iconLink = document.createElement("link");
    iconLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);
  }, []);

  useEffect(() => {
    // Mock data - ในจริงต้องเรียก API
    const mockPlan: HomeroomPlan = {
      id: params.id as string,
      title: "การปรับตัวเข้าสู่ชีวิตนักเรียน",
      level: "ปวช.1",
      week: "สัปดาห์ที่ 1",
      semester: "ภาคเรียนที่ 1",
      academicYear: "2568",
      date: "2024-05-01",
      time: "20-30 นาที",
      status: "เผยแพร่",
      objectives: [
        "เพื่อให้นักเรียนปรับตัวเข้ากับเพื่อนและครูได้",
        "เพื่อให้นักเรียนเข้าใจกฎระเบียบของสถานศึกษา"
      ],
      disciplineManagement: "เช็คชื่อ ตรวจระเบียบ แจ้งข่าวสาร และทำความเข้าใจกฎระเบียบของโรงเรียน",
      studentDevelopment: "กิจกรรมละลายพฤติกรรม ให้นักเรียนแนะนำตัวเอง และกิจกรรมกลุ่มสัมพันธ์",
      individualCare: "สังเกตนักเรียนที่มีปัญหาในการปรับตัว และเปิดโอกาสให้นักเรียนปรึกษาเป็นรายบุคคล",
      evaluation: {
        observation: true,
        worksheet: false,
        participation: true
      },
      materials: "ใบกิจกรรม, เอกสารแนะนำตัว",
      createdAt: "01/05/2568"
    };

    const mockRecords: ActivityRecord[] = [
      {
        id: "r1",
        date: "2024-05-01",
        studentsAttended: 32,
        totalStudents: 35,
        notes: "นักเรียนให้ความร่วมมือดี กิจกรรมผ่านไปด้วยดี นักเรียนส่วนใหญ่กล้าแสดงออก",
        problems: "มีนักเรียน 3 คนไม่ร่วมกิจกรรม ต้องเรียกพูดคุยแยก",
        solutions: "นัดหมายพูดคุยรายบุคคลในคาบว่าง",
        evaluator: "อาจารย์วิมลรัตน์",
        createdAt: "01/05/2568"
      }
    ];

    setPlan(mockPlan);
    setRecords(mockRecords);
    setLoading(false);
  }, [params.id]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ร่าง':
        return <span className="badge bg-secondary rounded-0 text-uppercase fw-semibold px-3 py-2">ร่าง</span>;
      case 'เผยแพร่':
        return <span className="badge bg-success rounded-0 text-uppercase fw-semibold px-3 py-2">เผยแพร่</span>;
      case 'เสร็จสิ้น':
        return <span className="badge bg-info rounded-0 text-uppercase fw-semibold px-3 py-2">เสร็จสิ้น</span>;
      default:
        return <span className="badge bg-secondary rounded-0 text-uppercase fw-semibold px-3 py-2">{status}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${parseInt(year)+543}`;
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle-fill text-warning fs-1"></i>
          <p className="mt-3">ไม่พบข้อมูลแผนกิจกรรม</p>
          <button 
            className="btn btn-primary rounded-0 mt-2"
            onClick={() => router.push('/student_learn')}
          >
            กลับไปหน้ารายการ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-2 border-warning">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-uppercase" href="#">
            <i className="bi bi-mortarboard-fill me-2 text-warning"></i>
            <span className="text-warning">ระบบดูแลผู้เรียนรายบุคคล</span>
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/student">รายชื่อผู้เรียน</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/committees">คณะกรรมการ</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3 active" href="/student_learn">ISP</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/referrals">ส่งต่อ</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-file-text me-2 text-warning"></i>
                รายละเอียดแผนกิจกรรมโฮมรูม
              </h2>
              <div>
                <span className="text-muted me-3">ครูที่ปรึกษา: {teacher_name}</span>
                <span className="badge bg-dark text-white rounded-0">ปีการศึกษา {plan.academicYear}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="row mb-4">
          <div className="col-12 d-flex justify-content-between">
            <button 
              className="btn btn-outline-dark rounded-0 text-uppercase fw-semibold"
              onClick={() => router.push('/student_learn')}
            >
              <i className="bi bi-arrow-left me-2"></i>กลับ
            </button>
            <div>
              {plan.status === 'ร่าง' && (
                <button 
                  className="btn btn-warning rounded-0 text-uppercase fw-semibold me-2"
                  onClick={() => router.push(`/student_learn/${plan.id}/edit`)}
                >
                  <i className="bi bi-pencil me-2"></i>แก้ไข
                </button>
              )}
              {plan.status !== 'เสร็จสิ้น' && (
                <button 
                  className="btn btn-success rounded-0 text-uppercase fw-semibold"
                  onClick={() => router.push(`/student_learn/${plan.id}/record`)}
                >
                  <i className="bi bi-check-circle me-2"></i>บันทึกผลกิจกรรม
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className="row mb-4">
          <div className="col-12">
            <div className={`p-3 rounded-0 ${
              plan.status === 'ร่าง' ? 'bg-secondary bg-opacity-10' :
              plan.status === 'เผยแพร่' ? 'bg-success bg-opacity-10' :
              'bg-info bg-opacity-10'
            }`}>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  {getStatusBadge(plan.status)}
                </div>
                <div>
                  {plan.status === 'ร่าง' && <span className="text-secondary">แผนกิจกรรมนี้ยังไม่ได้เผยแพร่ สามารถแก้ไขได้</span>}
                  {plan.status === 'เผยแพร่' && <span className="text-success">แผนกิจกรรมนี้เผยแพร่แล้ว พร้อมดำเนินการ</span>}
                  {plan.status === 'เสร็จสิ้น' && <span className="text-info">แผนกิจกรรมนี้ดำเนินการเสร็จสิ้นแล้ว</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs border-bottom-0">
          <li className="nav-item">
            <button 
              className={`nav-link rounded-0 ${activeTab === 'plan' ? 'active bg-dark text-white' : 'bg-light'}`}
              onClick={() => setActiveTab('plan')}
            >
              <i className="bi bi-file-text me-2"></i>รายละเอียดแผน
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link rounded-0 ${activeTab === 'records' ? 'active bg-dark text-white' : 'bg-light'}`}
              onClick={() => setActiveTab('records')}
            >
              <i className="bi bi-journal-text me-2"></i>บันทึกผลกิจกรรม ({records.length})
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content bg-white p-4 border">
          {/* แผนรายละเอียด */}
          {activeTab === 'plan' && (
            <div>
              {/* Header Info */}
              <div className="mb-4">
                <div className="row">
                  <div className="col-md-8">
                    <h3 className="fw-bold mb-3">{plan.title}</h3>
                    <div className="d-flex gap-3 mb-2 flex-wrap">
                      <span className="badge bg-dark rounded-0 p-2">ระดับชั้น: {plan.level}</span>
                      <span className="badge bg-dark rounded-0 p-2">{plan.week}</span>
                      <span className="badge bg-dark rounded-0 p-2">{plan.semester}</span>
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <div className="text-muted small mb-1">
                      <i className="bi bi-calendar me-1"></i> วันที่จัด: {formatDate(plan.date)}
                    </div>
                    <div className="text-muted small">
                      <i className="bi bi-clock me-1"></i> เวลา: {plan.time}
                    </div>
                  </div>
                </div>
              </div>

              {/* Objectives */}
              <div className="mb-4">
                <h5 className="fw-bold text-warning border-bottom border-warning pb-2">
                  <i className="bi bi-bullseye me-2"></i>วัตถุประสงค์
                </h5>
                <ol className="mt-3">
                  {plan.objectives.map((obj, index) => (
                    <li key={index} className="mb-2">{obj}</li>
                  ))}
                </ol>
              </div>

              {/* Activity Steps */}
              <div className="mb-4">
                <h5 className="fw-bold text-warning border-bottom border-warning pb-2">
                  <i className="bi bi-list-check me-2"></i>ขั้นตอนการดำเนินกิจกรรม
                </h5>
                <div className="mt-3">
                  <div className="mb-3 p-3 bg-light">
                    <h6 className="fw-bold">ช่วงที่ 1: การจัดการระเบียบและวินัย</h6>
                    <p className="mb-0">{plan.disciplineManagement}</p>
                  </div>
                  <div className="mb-3 p-3 bg-light">
                    <h6 className="fw-bold">ช่วงที่ 2: กิจกรรมพัฒนาผู้เรียน</h6>
                    <p className="mb-0">{plan.studentDevelopment}</p>
                  </div>
                  <div className="p-3 bg-light">
                    <h6 className="fw-bold">ช่วงที่ 3: การดูแลรายบุคคล</h6>
                    <p className="mb-0">{plan.individualCare}</p>
                  </div>
                </div>
              </div>

              {/* Evaluation and Materials */}
              <div className="row">
                <div className="col-md-6">
                  <h5 className="fw-bold text-warning border-bottom border-warning pb-2">
                    <i className="bi bi-clipboard-check me-2"></i>การประเมินผล
                  </h5>
                  <ul className="list-unstyled mt-3">
                    <li className="mb-2">
                      <i className={`bi ${plan.evaluation.observation ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i>
                      การสังเกตพฤติกรรม
                    </li>
                    <li className="mb-2">
                      <i className={`bi ${plan.evaluation.worksheet ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i>
                      ทำใบงาน
                    </li>
                    <li className="mb-0">
                      <i className={`bi ${plan.evaluation.participation ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i>
                      การมีส่วนร่วม
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h5 className="fw-bold text-warning border-bottom border-warning pb-2">
                    <i className="bi bi-paperclip me-2"></i>สื่อและวัสดุอุปกรณ์
                  </h5>
                  <div className="mt-3">
                    {plan.materials ? (
                      <p className="mb-0">{plan.materials}</p>
                    ) : (
                      <p className="text-muted mb-0">ไม่มีเอกสารแนบ</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* บันทึกผลกิจกรรม */}
          {activeTab === 'records' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold m-0">ประวัติการบันทึกผลกิจกรรม</h5>
                {plan.status !== 'เสร็จสิ้น' && (
                  <button 
                    className="btn btn-success rounded-0 text-uppercase fw-semibold"
                    onClick={() => router.push(`/student_learn/${plan.id}/record`)}
                  >
                    <i className="bi bi-plus-circle me-2"></i>เพิ่มบันทึกผล
                  </button>
                )}
              </div>

              {records.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-journal-x fs-1 text-muted"></i>
                  <p className="mt-3 text-muted">ยังไม่มีบันทึกผลกิจกรรม</p>
                  {plan.status !== 'เสร็จสิ้น' && (
                    <button 
                      className="btn btn-success rounded-0 mt-2"
                      onClick={() => router.push(`/student_learn/${plan.id}/record`)}
                    >
                      <i className="bi bi-plus-circle me-2"></i>บันทึกผลกิจกรรมครั้งแรก
                    </button>
                  )}
                </div>
              ) : (
                <div className="accordion" id="recordsAccordion">
                  {records.map((record, index) => (
                    <div className="accordion-item rounded-0 border mb-2" key={record.id}>
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button bg-light text-dark fw-bold collapsed rounded-0" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target={`#record${index}`}
                        >
                          <div className="d-flex w-100 justify-content-between align-items-center">
                            <span>
                              <i className="bi bi-calendar-check me-2 text-success"></i>
                              บันทึกผลวันที่ {formatDate(record.date)}
                            </span>
                            <span className="badge bg-dark rounded-0 me-3">
                              เข้าร่วม {record.studentsAttended}/{record.totalStudents} คน
                            </span>
                          </div>
                        </button>
                      </h2>
                      <div 
                        id={`record${index}`} 
                        className="accordion-collapse collapse" 
                        data-bs-parent="#recordsAccordion"
                      >
                        <div className="accordion-body">
                          <div className="row">
                            <div className="col-md-6">
                              <p className="mb-2">
                                <span className="fw-bold">จำนวนผู้เข้าร่วม:</span>{' '}
                                {record.studentsAttended} คน จากทั้งหมด {record.totalStudents} คน
                              </p>
                              <p className="mb-2">
                                <span className="fw-bold">ผู้บันทึก:</span> {record.evaluator}
                              </p>
                              <p className="mb-2">
                                <span className="fw-bold">วันที่บันทึก:</span> {record.createdAt}
                              </p>
                            </div>
                            <div className="col-md-6">
                              <p className="mb-2">
                                <span className="fw-bold">บันทึกผล:</span>
                              </p>
                              <p className="bg-light p-2">{record.notes}</p>
                            </div>
                          </div>
                          
                          {(record.problems || record.solutions) && (
                            <div className="row mt-3">
                              <div className="col-md-6">
                                <p className="mb-2 fw-bold text-danger">ปัญหาที่พบ:</p>
                                <p className="bg-light p-2">{record.problems || 'ไม่มี'}</p>
                              </div>
                              <div className="col-md-6">
                                <p className="mb-2 fw-bold text-success">แนวทางแก้ไข:</p>
                                <p className="bg-light p-2">{record.solutions || 'ไม่มี'}</p>
                              </div>
                            </div>
                          )}

                          <div className="text-end mt-3">
                            <button 
                              className="btn btn-sm btn-outline-primary rounded-0 me-2"
                              onClick={() => router.push(`/student_learn/${plan.id}/record/${record.id}`)}
                            >
                              <i className="bi bi-eye"></i> ดูรายละเอียด
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-warning rounded-0"
                              onClick={() => router.push(`/student_learn/${plan.id}/record/${record.id}/edit`)}
                            >
                              <i className="bi bi-pencil"></i> แก้ไข
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Created Date */}
        <div className="text-end text-muted small mt-3">
          สร้างเมื่อ: {plan.createdAt}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white mt-5 py-3 border-top border-warning">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 text-uppercase small">
              <i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล
            </div>
            <div className="col-md-6 text-end text-uppercase small">
              <span className="me-3">เวอร์ชัน 2.0.0</span>
              <span>เข้าสู่ระบบ: {teacher_name}</span>
            </div>
          </div>
        </div>
      </footer>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    </div>
  );
}