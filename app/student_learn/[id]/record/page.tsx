// D:\advisor-main\app\student_learn\[id]\record\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function RecordActivityPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [planTitle, setPlanTitle] = useState("");
  const [hasRecord, setHasRecord] = useState(false);

  const [formData, setFormData] = useState({
    // 6. บันทึกหลังกิจกรรม
    teacherNote: "",
    problems: "",
    specialTrack: "",
    sessionNote: "",
    
    // ติดตามผลรายบุคคล
    individualFollowup: "",
    
    // ข้อมูลเพิ่มเติม
    activity_date: new Date().toISOString().split('T')[0],
    students_attended: "",
    total_students: "",
    evaluator: "อาจารย์วิมลรัตน์"
  });

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
    const fetchPlanData = async () => {
      try {
        setFetchLoading(true);
        const response = await fetch(`/api/learn/${params.id}`);
        const result = await response.json();
        
        if (result.success) {
          setPlanTitle(result.data.topic || "ไม่มีหัวข้อ");
          setHasRecord(result.data.has_record || false);
          
          // โหลดข้อมูลเดิมถ้ามี
          setFormData({
            teacherNote: result.data.teacherNote || "",
            problems: result.data.problems || "",
            specialTrack: result.data.specialTrack || "",
            sessionNote: result.data.sessionNote || "",
            individualFollowup: result.data.individualFollowup || "",
            activity_date: result.data.activity_date || new Date().toISOString().split('T')[0],
            students_attended: result.data.students_attended || "",
            total_students: result.data.total_students || "",
            evaluator: result.data.evaluator || teacher_name
          });
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
      } finally {
        setFetchLoading(false);
      }
    };

    if (params.id) {
      fetchPlanData();
    }
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitFormData = new FormData();
      
      // ส่งเฉพาะฟิลด์บันทึกหลังกิจกรรม
      submitFormData.append('teacherNote', formData.teacherNote);
      submitFormData.append('problems', formData.problems);
      submitFormData.append('specialTrack', formData.specialTrack);
      submitFormData.append('sessionNote', formData.sessionNote);
      submitFormData.append('individualFollowup', formData.individualFollowup);
      submitFormData.append('activity_date', formData.activity_date);
      submitFormData.append('students_attended', formData.students_attended);
      submitFormData.append('total_students', formData.total_students);
      submitFormData.append('evaluator', formData.evaluator);
      submitFormData.append('has_record', 'true');
      submitFormData.append('recorded_at', new Date().toLocaleDateString('th-TH'));
      
      const response = await fetch(`/api/learn/${params.id}/record`, {
        method: 'POST',
        body: submitFormData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        router.push(`/student_learn/${params.id}`);
      } else {
        alert(result.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Error saving record:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
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
              <li className="nav-item"><a className="nav-link text-white px-3" href="/student">รายชื่อผู้เรียน</a></li>
              <li className="nav-item"><a className="nav-link text-white px-3" href="/committees">คณะกรรมการ</a></li>
              <li className="nav-item"><a className="nav-link text-white px-3 active" href="/student_learn">ISP</a></li>
              <li className="nav-item"><a className="nav-link text-white px-3" href="/referrals">ส่งต่อ</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-check-circle-fill me-2 text-warning"></i>
                บันทึกผลกิจกรรม (หลังจัดกิจกรรม)
              </h2>
              <div>
                <span className="text-muted me-3">ครูที่ปรึกษา: {teacher_name}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card rounded-0 border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-0">{planTitle}</h5>
            <small className="text-muted">รหัสแผน: {params.id}</small>
            {hasRecord && <span className="badge bg-success rounded-0 ms-3">บันทึกผลแล้ว</span>}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 6. บันทึกหลังกิจกรรม */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-journal-text me-2 text-warning"></i>6. บันทึกหลังกิจกรรม
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">ผลการจัดกิจกรรม</label>
                  <textarea className="form-control rounded-0" rows={3} name="teacherNote" value={formData.teacherNote} onChange={handleInputChange} placeholder="สรุปผลการจัดกิจกรรม" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">ปัญหา/อุปสรรคที่พบ</label>
                  <textarea className="form-control rounded-0" rows={3} name="problems" value={formData.problems} onChange={handleInputChange} placeholder="ปัญหาที่เกิดขึ้นระหว่างการจัดกิจกรรม" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">นักเรียนที่ต้องติดตามเป็นพิเศษ</label>
                  <input type="text" className="form-control rounded-0" name="specialTrack" value={formData.specialTrack} onChange={handleInputChange} placeholder="รายชื่อนักเรียนที่ต้องติดตาม" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">บันทึกการจัดกิจกรรม (รายครั้ง)</label>
                  <textarea className="form-control rounded-0" rows={2} name="sessionNote" value={formData.sessionNote} onChange={handleInputChange} placeholder="บันทึกเพิ่มเติม" />
                </div>
              </div>
            </div>
          </div>

          {/* ติดตามผลรายบุคคล */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-person-badge me-2 text-warning"></i>ติดตามผลรายบุคคล
              </h5>
            </div>
            <div className="card-body">
              <textarea className="form-control rounded-0" rows={4} name="individualFollowup" value={formData.individualFollowup} onChange={handleInputChange} placeholder="รายชื่อนักเรียนที่ต้องติดตามเป็นพิเศษ และแนวทางการติดตาม..." />
            </div>
          </div>

          {/* ข้อมูลการจัดกิจกรรม */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-info-circle me-2 text-warning"></i>ข้อมูลการจัดกิจกรรม
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold small">วันที่จัดกิจกรรม</label>
                  <input type="date" className="form-control rounded-0" name="activity_date" value={formData.activity_date} onChange={handleInputChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold small">จำนวนนักเรียนที่เข้าร่วม</label>
                  <input type="number" className="form-control rounded-0" name="students_attended" value={formData.students_attended} onChange={handleInputChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold small">จำนวนนักเรียนทั้งหมด</label>
                  <input type="number" className="form-control rounded-0" name="total_students" value={formData.total_students} onChange={handleInputChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold small">ผู้บันทึกผล</label>
                  <input type="text" className="form-control rounded-0" name="evaluator" value={formData.evaluator} onChange={handleInputChange} readOnly />
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center gap-3 mb-4">
            <button type="button" className="btn btn-secondary rounded-0 px-5" onClick={() => router.back()}>ยกเลิก</button>
            <button type="submit" className="btn btn-success rounded-0 px-5" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกผลกิจกรรม'}
            </button>
          </div>
        </form>
      </div>

      <footer className="bg-dark text-white mt-5 py-3 border-top border-warning">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 small"><i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล</div>
            <div className="col-md-6 text-end small"><span className="me-3">เวอร์ชัน 2.0.0</span><span>เข้าสู่ระบบ: {teacher_name}</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}