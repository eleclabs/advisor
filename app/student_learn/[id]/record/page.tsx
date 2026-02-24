"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface ActivityRecord {
  id: string;
  date: string;
  studentsAttended: number;
  totalStudents: number;
  notes: string;
  problems: string;
  solutions: string;
  evaluator: string;
}

export default function RecordActivityPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [planTitle, setPlanTitle] = useState("");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    studentsAttended: "",
    totalStudents: "",
    notes: "",
    problems: "",
    solutions: "",
    evaluator: "อาจารย์วิมลรัตน์"
  });

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

    // Mock data - ในจริงต้องเรียก API
    setPlanTitle("การปรับตัวเข้าสู่ชีวิตนักเรียน");
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // API call would go here
      console.log("Record data:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to detail page
      router.push(`/student_learn/${params.id}`);
    } catch (error) {
      console.error("Error saving record:", error);
      setLoading(false);
    }
  };

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
                <i className="bi bi-check-circle-fill me-2 text-warning"></i>
                บันทึกผลกิจกรรม
              </h2>
              <div>
                <span className="text-muted me-3">ครูที่ปรึกษา: {teacher_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Info */}
        <div className="card rounded-0 border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-0">{planTitle}</h5>
            <small className="text-muted">รหัสแผน: {params.id}</small>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-12">
              {/* Basic Info */}
              <div className="card rounded-0 border-0 shadow-sm mb-4">
                <div className="card-header bg-dark text-white rounded-0">
                  <h5 className="card-title text-uppercase fw-semibold m-0">
                    <i className="bi bi-info-circle me-2 text-warning"></i>
                    ข้อมูลการจัดกิจกรรม
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label text-uppercase fw-semibold small">วันที่จัดกิจกรรม</label>
                      <input 
                        type="date" 
                        className="form-control rounded-0"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-uppercase fw-semibold small">จำนวนนักเรียนที่เข้าร่วม</label>
                      <input 
                        type="number" 
                        className="form-control rounded-0"
                        name="studentsAttended"
                        value={formData.studentsAttended}
                        onChange={handleInputChange}
                        placeholder="เช่น 30"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-uppercase fw-semibold small">จำนวนนักเรียนทั้งหมด</label>
                      <input 
                        type="number" 
                        className="form-control rounded-0"
                        name="totalStudents"
                        value={formData.totalStudents}
                        onChange={handleInputChange}
                        placeholder="เช่น 35"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Results */}
              <div className="card rounded-0 border-0 shadow-sm mb-4">
                <div className="card-header bg-dark text-white rounded-0">
                  <h5 className="card-title text-uppercase fw-semibold m-0">
                    <i className="bi bi-chat-text me-2 text-warning"></i>
                    ผลการดำเนินกิจกรรม
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">บันทึกผลการจัดกิจกรรม</label>
                    <textarea 
                      className="form-control rounded-0" 
                      rows={4}
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="สรุปผลการจัดกิจกรรม ปัญหาที่พบ ข้อเสนอแนะ..."
                      required
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Problems and Solutions */}
              <div className="card rounded-0 border-0 shadow-sm mb-4">
                <div className="card-header bg-dark text-white rounded-0">
                  <h5 className="card-title text-uppercase fw-semibold m-0">
                    <i className="bi bi-exclamation-triangle me-2 text-warning"></i>
                    ปัญหาและแนวทางแก้ไข
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-uppercase fw-semibold small">ปัญหาที่พบ</label>
                      <textarea 
                        className="form-control rounded-0" 
                        rows={3}
                        name="problems"
                        value={formData.problems}
                        onChange={handleInputChange}
                        placeholder="ระบุปัญหาที่เกิดขึ้นระหว่างการจัดกิจกรรม"
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-uppercase fw-semibold small">แนวทางแก้ไข</label>
                      <textarea 
                        className="form-control rounded-0" 
                        rows={3}
                        name="solutions"
                        value={formData.solutions}
                        onChange={handleInputChange}
                        placeholder="ระบุแนวทางการแก้ไขหรือป้องกันในครั้งต่อไป"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evaluator */}
              <div className="card rounded-0 border-0 shadow-sm mb-4">
                <div className="card-header bg-dark text-white rounded-0">
                  <h5 className="card-title text-uppercase fw-semibold m-0">
                    <i className="bi bi-person-check me-2 text-warning"></i>
                    ผู้บันทึกผล
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label text-uppercase fw-semibold small">ผู้ประเมิน</label>
                      <input 
                        type="text" 
                        className="form-control rounded-0"
                        name="evaluator"
                        value={formData.evaluator}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="row mb-4">
                <div className="col-12 d-flex justify-content-center gap-3">
                  <button 
                    type="button"
                    className="btn btn-secondary rounded-0 text-uppercase fw-semibold px-5"
                    onClick={() => router.back()}
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success rounded-0 text-uppercase fw-semibold px-5"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        กำลังบันทึก...
                      </>
                    ) : (
                      'บันทึกผลกิจกรรม'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
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