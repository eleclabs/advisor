// D:\advisor-main\app\student_learn\[id]\edit\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface EditPlan {
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
  
  // การประเมินผล
  evalObservation: boolean;
  evalWorksheet: boolean;
  evalParticipation: boolean;
  
  // สื่อ/เอกสาร
  materials: string;
  materialsNote: string;
  
  // ข้อเสนอแนะ
  suggestions: string;
  
  status: string;
}

export default function EditHomeroomPlanPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<EditPlan>({
    level: "",
    semester: "1",
    academicYear: "2568",
    week: "",
    time: "",
    topic: "",
    objectives: ["", ""],
    
    checkAttendance: "",
    checkUniform: "",
    announceNews: "",
    
    warmup: "",
    mainActivity: "",
    summary: "",
    
    trackProblems: "",
    individualCounsel: "",
    
    evalObservation: false,
    evalWorksheet: false,
    evalParticipation: false,
    
    materials: "",
    materialsNote: "",
    
    suggestions: "",
    
    status: "draft"
  });

  const [file, setFile] = useState<File | null>(null);
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
          setFormData(result.data);
        } else {
          setError(result.message || "ไม่พบข้อมูลแผนกิจกรรม");
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setFetchLoading(false);
      }
    };

    if (params.id) {
      fetchPlanData();
    }
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData(prev => ({ ...prev, objectives: newObjectives }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitFormData = new FormData();
      
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof EditPlan];
        
        if (key === 'objectives' && Array.isArray(value)) {
          value.forEach((obj, index) => {
            if (obj) submitFormData.append(`objectives[${index}]`, obj);
          });
        } else if (typeof value === 'boolean') {
          submitFormData.append(key, value ? 'on' : 'off');
        } else if (value !== undefined && value !== null) {
          submitFormData.append(key, String(value));
        }
      });
      
      if (file) {
        submitFormData.append('materials', file);
      }
      
      submitFormData.append('created_by', teacher_name);
      
      const response = await fetch(`/api/learn/${params.id}/edit`, {
        method: 'PUT',
        body: submitFormData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        router.push(`/student_learn/${params.id}`);
      } else {
        alert(result.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Error updating plan:", error);
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

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle-fill text-warning fs-1"></i>
          <p className="mt-3">{error}</p>
          <button className="btn btn-primary rounded-0 mt-3" onClick={() => router.back()}>
            <i className="bi bi-arrow-left me-2"></i>กลับ
          </button>
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
                <i className="bi bi-pencil-square me-2 text-warning"></i>
                แก้ไขแผนกิจกรรม (ก่อนจัดกิจกรรม)
              </h2>
              <div>
                <span className="text-muted me-3">ครูที่ปรึกษา: {teacher_name}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. ข้อมูลพื้นฐาน */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-info-circle me-2 text-warning"></i>1. ข้อมูลพื้นฐาน
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">ระดับชั้น</label>
                  <select className="form-select rounded-0" name="level" value={formData.level} onChange={handleInputChange} required>
                    <option value="">เลือกระดับชั้น</option>
                    <option value="ปวช.1">ปวช.1</option>
                    <option value="ปวช.2">ปวช.2</option>
                    <option value="ปวช.3">ปวช.3</option>
                    <option value="ปวส.1">ปวส.1</option>
                    <option value="ปวส.2">ปวส.2</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">ภาคเรียนที่</label>
                  <select className="form-select rounded-0" name="semester" value={formData.semester} onChange={handleInputChange}>
                    <option value="1">ภาคเรียนที่ 1</option>
                    <option value="2">ภาคเรียนที่ 2</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">ปีการศึกษา</label>
                  <select className="form-select rounded-0" name="academicYear" value={formData.academicYear} onChange={handleInputChange}>
                    <option value="2568">2568</option>
                    <option value="2567">2567</option>
                    <option value="2566">2566</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">สัปดาห์ที่</label>
                  <input type="text" className="form-control rounded-0" name="week" value={formData.week} onChange={handleInputChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold small">เวลา (นาที)</label>
                  <input type="text" className="form-control rounded-0" name="time" value={formData.time} onChange={handleInputChange} required />
                </div>
                <div className="col-md-8">
                  <label className="form-label fw-semibold small">หัวข้อหลัก</label>
                  <input type="text" className="form-control rounded-0" name="topic" value={formData.topic} onChange={handleInputChange} required />
                </div>
              </div>
            </div>
          </div>

          {/* 2. วัตถุประสงค์ */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-bullseye me-2 text-warning"></i>2. วัตถุประสงค์
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-2">
                  <textarea className="form-control rounded-0" rows={2} placeholder="วัตถุประสงค์ข้อที่ 1"
                    value={formData.objectives[0]} onChange={(e) => handleObjectiveChange(0, e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <textarea className="form-control rounded-0" rows={2} placeholder="วัตถุประสงค์ข้อที่ 2"
                    value={formData.objectives[1]} onChange={(e) => handleObjectiveChange(1, e.target.value)} required />
                </div>
              </div>
            </div>
          </div>

          {/* 3. ขั้นตอนการดำเนินกิจกรรม */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-list-check me-2 text-warning"></i>3. ขั้นตอนการดำเนินกิจกรรม
              </h5>
            </div>
            <div className="card-body">
              <h6 className="fw-bold bg-warning text-dark p-2">ช่วงที่ 1: การจัดการระเบียบและวินัย</h6>
              <div className="row mb-3">
                <div className="col-md-4">
                  <input type="text" className="form-control rounded-0" name="checkAttendance" value={formData.checkAttendance} onChange={handleInputChange} placeholder="เช็คชื่อ" />
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control rounded-0" name="checkUniform" value={formData.checkUniform} onChange={handleInputChange} placeholder="ตรวจระเบียบ" />
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control rounded-0" name="announceNews" value={formData.announceNews} onChange={handleInputChange} placeholder="แจ้งข่าวสาร" />
                </div>
              </div>

              <h6 className="fw-bold bg-warning text-dark p-2">ช่วงที่ 2: กิจกรรมพัฒนาผู้เรียน</h6>
              <div className="row mb-3">
                <div className="col-md-4">
                  <input type="text" className="form-control rounded-0" name="warmup" value={formData.warmup} onChange={handleInputChange} placeholder="กิจกรรมนำ" />
                </div>
                <div className="col-md-4">
                  <textarea className="form-control rounded-0" rows={2} name="mainActivity" value={formData.mainActivity} onChange={handleInputChange} placeholder="กิจกรรมหลัก" />
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control rounded-0" name="summary" value={formData.summary} onChange={handleInputChange} placeholder="การสรุป" />
                </div>
              </div>

              <h6 className="fw-bold bg-warning text-dark p-2">ช่วงที่ 3: การดูแลรายบุคคล</h6>
              <div className="row">
                <div className="col-md-6">
                  <input type="text" className="form-control rounded-0" name="trackProblems" value={formData.trackProblems} onChange={handleInputChange} placeholder="ติดตามนักเรียนที่มีปัญหา" />
                </div>
                <div className="col-md-6">
                  <input type="text" className="form-control rounded-0" name="individualCounsel" value={formData.individualCounsel} onChange={handleInputChange} placeholder="เปิดโอกาสให้นักเรียนปรึกษา" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. การประเมินผล */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-clipboard-check me-2 text-warning"></i>4. การประเมินผล
              </h5>
            </div>
            <div className="card-body">
              <div className="form-check mb-2">
                <input className="form-check-input rounded-0" type="checkbox" name="evalObservation" checked={formData.evalObservation} onChange={handleCheckboxChange} id="obs" />
                <label className="form-check-label" htmlFor="obs">การสังเกตพฤติกรรม</label>
              </div>
              <div className="form-check mb-2">
                <input className="form-check-input rounded-0" type="checkbox" name="evalWorksheet" checked={formData.evalWorksheet} onChange={handleCheckboxChange} id="ws" />
                <label className="form-check-label" htmlFor="ws">การทำใบงาน/แบบทดสอบ</label>
              </div>
              <div className="form-check mb-2">
                <input className="form-check-input rounded-0" type="checkbox" name="evalParticipation" checked={formData.evalParticipation} onChange={handleCheckboxChange} id="part" />
                <label className="form-check-label" htmlFor="part">การมีส่วนร่วมในกิจกรรม</label>
              </div>
            </div>
          </div>

          {/* 5. สื่อและวัสดุอุปกรณ์ */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-paperclip me-2 text-warning"></i>5. สื่อและวัสดุอุปกรณ์
              </h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <input type="text" className="form-control rounded-0 bg-light" value={formData.materials || "ไม่มีไฟล์"} readOnly />
                </div>
                <div className="col-md-6">
                  <input type="file" className="form-control rounded-0" onChange={handleFileChange} />
                </div>
              </div>
              <input type="text" className="form-control rounded-0" name="materialsNote" value={formData.materialsNote} onChange={handleInputChange} placeholder="หมายเหตุ" />
            </div>
          </div>

          {/* ข้อเสนอแนะ */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-chat-dots me-2 text-warning"></i>ข้อเสนอแนะ
              </h5>
            </div>
            <div className="card-body">
              <textarea className="form-control rounded-0" rows={3} name="suggestions" value={formData.suggestions} onChange={handleInputChange}></textarea>
            </div>
          </div>

          {/* สถานะ */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-gear me-2 text-warning"></i>สถานะ
              </h5>
            </div>
            <div className="card-body">
              <select className="form-select rounded-0 w-25" name="status" value={formData.status} onChange={handleInputChange}>
                <option value="draft">ร่าง</option>
                <option value="published">เผยแพร่</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex justify-content-center gap-3 mb-4">
            <button type="button" className="btn btn-secondary rounded-0 px-5" onClick={() => router.back()}>ยกเลิก</button>
            <button type="submit" className="btn btn-warning rounded-0 px-5" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
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