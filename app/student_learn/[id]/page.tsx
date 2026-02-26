// D:\advisor-main\app\student_learn\[id]\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface HomeroomPlan {
  id: string;
  // ข้อมูลพื้นฐาน (จาก Edit)
  level: string;
  semester: string;
  academicYear: string;
  week: string;
  time: string;
  topic: string;
  objectives: string[];
  
  // ช่วงที่ 1
  checkAttendance: string;
  checkUniform: string;
  announceNews: string;
  
  // ช่วงที่ 2
  warmup: string;
  mainActivity: string;
  summary: string;
  
  // ช่วงที่ 3
  trackProblems: string;
  individualCounsel: string;
  
  // การประเมิน
  evalObservation: boolean;
  evalWorksheet: boolean;
  evalParticipation: boolean;
  
  // สื่อ
  materials: string;
  materialsNote: string;
  
  // ข้อเสนอแนะ
  suggestions: string;
  
  // สถานะ
  status: string;
  created_at: string;
  created_by: string;
  
  // ===== ข้อมูลจาก Record (บันทึกหลังกิจกรรม) =====
  teacherNote?: string;
  problems?: string;
  specialTrack?: string;
  sessionNote?: string;
  individualFollowup?: string;
  activity_date?: string;
  students_attended?: string;
  total_students?: string;
  evaluator?: string;
  has_record?: boolean;
  recorded_at?: string;
}

export default function HomeroomPlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [plan, setPlan] = useState<HomeroomPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const teacher_name = "อาจารย์วิมลรัตน์";

  useEffect(() => {
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
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/learn/${params.id}`);
        const result = await response.json();
        
        if (result.success) {
          setPlan(result.data);
        } else {
          setError(result.message || "ไม่พบข้อมูลแผนกิจกรรม");
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPlan();
    }
  }, [params.id]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'draft': 
        return <span className="badge bg-secondary rounded-0 px-3 py-2">ร่าง</span>;
      case 'published': 
        return <span className="badge bg-success rounded-0 px-3 py-2">เผยแพร่</span>;
      default: 
        return <span className="badge bg-secondary rounded-0 px-3 py-2">{status}</span>;
    }
  };

  const handleDelete = async () => {
    if (!confirm("คุณต้องการลบแผนกิจกรรมนี้ใช่หรือไม่?")) return;
    
    try {
      const response = await fetch(`/api/learn/${params.id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        router.push('/student_learn');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3 text-muted">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle-fill text-warning fs-1"></i>
          <p className="mt-3 text-muted">{error || "ไม่พบข้อมูลแผนกิจกรรม"}</p>
          <button className="btn btn-primary rounded-0 mt-3" onClick={() => router.back()}>
            <i className="bi bi-arrow-left me-2"></i>กลับ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Navbar */}
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
                <a className="nav-link text-white px-3" href="/student">รายชื่อผู้เรียน</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white px-3" href="/committees">คณะกรรมการ</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white px-3 active" href="/student_learn">โฮมรูม</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white px-3" href="/referrals">ส่งต่อ</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="fw-bold m-0">
                <i className="bi bi-file-text me-2 text-warning"></i>
                รายละเอียดแผนกิจกรรมโฮมรูม
              </h2>
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted">ครูที่ปรึกษา: {plan.created_by || teacher_name}</span>
                {getStatusBadge(plan.status)}
                {plan.has_record && (
                  <span className="badge bg-info rounded-0 px-3 py-2">บันทึกผลแล้ว</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="row mb-4">
          <div className="col-12 d-flex justify-content-between">
            <button className="btn btn-outline-dark rounded-0" onClick={() => router.back()}>
              <i className="bi bi-arrow-left me-2"></i>กลับ
            </button>
            <div className="d-flex gap-2">
              <Link href={`/student_learn/${params.id}/record`} className="btn btn-success rounded-0">
                <i className="bi bi-check-circle me-2"></i>
                {plan.has_record ? 'แก้ไขบันทึกผล' : 'บันทึกผลกิจกรรม'}
              </Link>
              <Link href={`/student_learn/${params.id}/edit`} className="btn btn-warning rounded-0">
                <i className="bi bi-pencil me-2"></i>แก้ไขแผน
              </Link>
              <button className="btn btn-danger rounded-0" onClick={handleDelete}>
                <i className="bi bi-trash me-2"></i>ลบ
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white p-4 border">
          {/* ===== ข้อมูลจาก Edit Page ===== */}
          <div className="mb-4">
            <h4 className="text-primary mb-3">📋 ข้อมูลแผนกิจกรรม (ก่อนจัดกิจกรรม)</h4>
            
            {/* Header Info */}
            <div className="row mb-4">
              <div className="col-md-8">
                <h3 className="fw-bold mb-3">{plan.topic}</h3>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <span className="badge bg-dark rounded-0 p-2">ระดับชั้น: {plan.level}</span>
                  <span className="badge bg-dark rounded-0 p-2">สัปดาห์ที่ {plan.week}</span>
                  <span className="badge bg-dark rounded-0 p-2">ภาคเรียนที่ {plan.semester}/{plan.academicYear}</span>
                  <span className="badge bg-dark rounded-0 p-2">เวลา: {plan.time} นาที</span>
                </div>
              </div>
            </div>

            {/* Objectives */}
            {plan.objectives && plan.objectives.length > 0 && (
              <div className="mb-4">
                <h5 className="fw-bold text-warning border-bottom border-warning pb-2">
                  <i className="bi bi-bullseye me-2"></i>วัตถุประสงค์
                </h5>
                <ol className="mt-2">
                  {plan.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Activities */}
            <div className="mb-4">
              <h5 className="fw-bold text-warning border-bottom border-warning pb-2">
                <i className="bi bi-list-check me-2"></i>ขั้นตอนการดำเนินกิจกรรม
              </h5>
              
              <h6 className="fw-bold mt-3">ช่วงที่ 1: การจัดการระเบียบและวินัย</h6>
              <div className="bg-light p-3 mb-3">
                <p><span className="fw-bold">เช็คชื่อ:</span> {plan.checkAttendance || '-'}</p>
                <p><span className="fw-bold">ตรวจระเบียบ:</span> {plan.checkUniform || '-'}</p>
                <p><span className="fw-bold">แจ้งข่าวสาร:</span> {plan.announceNews || '-'}</p>
              </div>

              <h6 className="fw-bold">ช่วงที่ 2: กิจกรรมพัฒนาผู้เรียน</h6>
              <div className="bg-light p-3 mb-3">
                <p><span className="fw-bold">กิจกรรมนำ:</span> {plan.warmup || '-'}</p>
                <p><span className="fw-bold">กิจกรรมหลัก:</span> {plan.mainActivity || '-'}</p>
                <p><span className="fw-bold">การสรุป:</span> {plan.summary || '-'}</p>
              </div>

              <h6 className="fw-bold">ช่วงที่ 3: การดูแลรายบุคคล</h6>
              <div className="bg-light p-3">
                <p><span className="fw-bold">ติดตามนักเรียนที่มีปัญหา:</span> {plan.trackProblems || '-'}</p>
                <p><span className="fw-bold">เปิดโอกาสให้นักเรียนปรึกษา:</span> {plan.individualCounsel || '-'}</p>
              </div>
            </div>

            {/* Evaluation & Materials */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h5 className="fw-bold text-warning border-bottom border-warning pb-2">
                  <i className="bi bi-clipboard-check me-2"></i>การประเมินผล
                </h5>
                <ul className="list-unstyled mt-2">
                  <li>
                    <i className={`bi ${plan.evalObservation ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i>
                    การสังเกตพฤติกรรม
                  </li>
                  <li>
                    <i className={`bi ${plan.evalWorksheet ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i>
                    การทำใบงาน/แบบทดสอบ
                  </li>
                  <li>
                    <i className={`bi ${plan.evalParticipation ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i>
                    การมีส่วนร่วมในกิจกรรม
                  </li>
                </ul>
              </div>
              <div className="col-md-6">
                <h5 className="fw-bold text-warning border-bottom border-warning pb-2">
                  <i className="bi bi-paperclip me-2"></i>สื่อและวัสดุอุปกรณ์
                </h5>
                <p className="mt-2 mb-1">{plan.materials || '-'}</p>
                {plan.materialsNote && (
                  <small className="text-muted">หมายเหตุ: {plan.materialsNote}</small>
                )}
              </div>
            </div>

            {/* Suggestions */}
            <div className="mb-4">
              <h5 className="fw-bold text-warning border-bottom border-warning pb-2">
                <i className="bi bi-chat-dots me-2"></i>ข้อเสนอแนะ
              </h5>
              <p className="mt-2">{plan.suggestions || '-'}</p>
            </div>
          </div>

          {/* ===== ข้อมูลจาก Record Page ===== */}
          {plan.has_record && (
            <div className="mb-4">
              <h4 className="text-success mb-3">📝 ข้อมูลบันทึกหลังกิจกรรม</h4>
              
              {/* ข้อมูลการจัดกิจกรรม */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <p><span className="fw-bold">วันที่จัดกิจกรรม:</span> {plan.activity_date}</p>
                </div>
                <div className="col-md-3">
                  <p><span className="fw-bold">จำนวนนักเรียน:</span> {plan.students_attended}/{plan.total_students} คน</p>
                </div>
                <div className="col-md-3">
                  <p><span className="fw-bold">ผู้บันทึก:</span> {plan.evaluator}</p>
                </div>
                <div className="col-md-3">
                  <p><span className="fw-bold">บันทึกเมื่อ:</span> {plan.recorded_at}</p>
                </div>
              </div>

              {/* 6. บันทึกหลังกิจกรรม */}
              <div className="mb-3">
                <h5 className="fw-bold text-success border-bottom border-success pb-2">
                  <i className="bi bi-journal-text me-2"></i>6. บันทึกหลังกิจกรรม
                </h5>
                <div className="row">
                  <div className="col-md-6">
                    {plan.teacherNote && (
                      <p><span className="fw-bold">ผลการจัดกิจกรรม:</span> {plan.teacherNote}</p>
                    )}
                    {plan.problems && (
                      <p><span className="fw-bold">ปัญหา/อุปสรรค:</span> {plan.problems}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    {plan.specialTrack && (
                      <p><span className="fw-bold">นักเรียนที่ต้องติดตามเป็นพิเศษ:</span> {plan.specialTrack}</p>
                    )}
                    {plan.sessionNote && (
                      <p><span className="fw-bold">บันทึกการจัดกิจกรรม:</span> {plan.sessionNote}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ติดตามผลรายบุคคล */}
              {plan.individualFollowup && (
                <div className="mb-3">
                  <h5 className="fw-bold text-success border-bottom border-success pb-2">
                    <i className="bi bi-person-badge me-2"></i>ติดตามผลรายบุคคล
                  </h5>
                  <p className="mt-2">{plan.individualFollowup}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer Info */}
          <div className="text-end text-muted small mt-3 pt-3 border-top">
            <div>สร้างเมื่อ: {plan.created_at || new Date().toLocaleDateString('th-TH')}</div>
            {plan.created_by && <div>สร้างโดย: {plan.created_by}</div>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white mt-5 py-3 border-top border-warning">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 small">
              <i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล
            </div>
            <div className="col-md-6 text-end small">
              <span className="me-3">เวอร์ชัน 2.0.0</span>
              <span>เข้าสู่ระบบ: {teacher_name}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}