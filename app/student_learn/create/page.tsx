
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateHomeroomPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    level: "",
    semester: "1",
    academicYear: "2568",
    week: "",
    time: "20-30",
    topic: "",
    objectives: ["", ""],
    
    // ช่วงที่ 1: การจัดการระเบียบและวินัย
    checkAttendance: "",
    checkUniform: "",
    announceNews: "",
    
    // ช่วงที่ 2: กิจกรรมพัฒนาผู้เรียน
    warmup: "",
    mainActivity: "",
    summary: "",
    
    // ช่วงที่ 3: การดูแลรายบุคคล
    trackProblems: "",
    individualCounsel: "",
    
    // การประเมินผล
    evalObservation: false,
    evalWorksheet: false,
    evalParticipation: false,
    
    // บันทึกหลังกิจกรรม
    teacherNote: "",
    problems: "",
    specialTrack: "",
    sessionNote: "",
    
    // สื่อ/เอกสาร
    materials: null as File | null,
    materialsNote: "",
    
    // ข้อเสนอแนะ
    suggestions: "",
    
    // ติดตามผลรายบุคคล
    individualFollowup: "",
    
    status: "draft"
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData(prev => ({ ...prev, objectives: newObjectives }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, materials: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // สร้าง FormData สำหรับส่งไป API
      const submitFormData = new FormData();
      
      // เพิ่มฟิลด์ทั่วไป
      submitFormData.append('level', formData.level);
      submitFormData.append('semester', formData.semester);
      submitFormData.append('academicYear', formData.academicYear);
      submitFormData.append('week', formData.week);
      submitFormData.append('time', formData.time);
      submitFormData.append('topic', formData.topic);
      
      // เพิ่มวัตถุประสงค์
      formData.objectives.forEach((obj, index) => {
        if (obj.trim()) {
          submitFormData.append(`objectives[${index}]`, obj);
        }
      });
      
      // เพิ่มฟิลด์ช่วงที่ 1
      submitFormData.append('checkAttendance', formData.checkAttendance);
      submitFormData.append('checkUniform', formData.checkUniform);
      submitFormData.append('announceNews', formData.announceNews);
      
      // เพิ่มฟิลด์ช่วงที่ 2
      submitFormData.append('warmup', formData.warmup);
      submitFormData.append('mainActivity', formData.mainActivity);
      submitFormData.append('summary', formData.summary);
      
      // เพิ่มฟิลด์ช่วงที่ 3
      submitFormData.append('trackProblems', formData.trackProblems);
      submitFormData.append('individualCounsel', formData.individualCounsel);
      
      // เพิ่มฟิลด์การประเมินผล
      submitFormData.append('evalObservation', formData.evalObservation ? 'on' : 'off');
      submitFormData.append('evalWorksheet', formData.evalWorksheet ? 'on' : 'off');
      submitFormData.append('evalParticipation', formData.evalParticipation ? 'on' : 'off');
      
      // เพิ่มฟิลด์บันทึกหลังกิจกรรม
      submitFormData.append('teacherNote', formData.teacherNote);
      submitFormData.append('problems', formData.problems);
      submitFormData.append('specialTrack', formData.specialTrack);
      submitFormData.append('sessionNote', formData.sessionNote);
      
      // เพิ่มฟิลด์สื่อ/เอกสาร
      if (formData.materials) {
        submitFormData.append('materials', formData.materials);
      }
      submitFormData.append('materialsNote', formData.materialsNote);
      
      // เพิ่มฟิลด์ข้อเสนอแนะและการติดตาม
      submitFormData.append('suggestions', formData.suggestions);
      submitFormData.append('individualFollowup', formData.individualFollowup);
      
      // เพิ่มสถานะและผู้สร้าง
      submitFormData.append('status', formData.status);
      submitFormData.append('created_by', teacher_name);
      
      // ส่งข้อมูลไป API
      const response = await fetch('/api/learn', {
        method: 'POST',
        body: submitFormData,
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        router.push('/student_learn');
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      setLoading(false);
    }
  };

  const topicOptions = [
    "การจัดการความเครียด",
    "มารยาทในที่ทำงาน",
    "การวางแผนการเงิน",
    "การเตรียมตัวสอบ",
    "อื่นๆ"
  ];

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
              <li className="nav-item"><a className="nav-link text-white px-3" href="/student">รายชื่อผู้เรียน</a></li>
              <li className="nav-item"><a className="nav-link text-white px-3" href="/committees">คณะกรรมการ</a></li>
              <li className="nav-item"><a className="nav-link text-white px-3 active" href="/student_learn">โฮมรูม</a></li>
              <li className="nav-item"><a className="nav-link text-white px-3" href="/referrals">ส่งต่อ</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-plus-circle-fill me-2 text-warning"></i>
                แผนการจัดกิจกรรมโฮมรูม
              </h2>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Header Info */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label className="form-label fw-semibold">ระดับชั้น</label>
              <select className="form-select rounded-0" name="level" value={formData.level} onChange={handleInputChange} required>
                <option value="">เลือกระดับชั้น</option>
                <option value="ปวช.1">ปวช.1</option>
                <option value="ปวช.2">ปวช.2</option>
                <option value="ปวช.3">ปวช.3</option>
                <option value="ปวส.1">ปวส.1</option>
                <option value="ปวส.2">ปวส.2</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold">ภาคเรียน</label>
              <select className="form-select rounded-0" name="semester" value={formData.semester} onChange={handleInputChange}>
                <option value="1">ภาคเรียนที่ 1</option>
                <option value="2">ภาคเรียนที่ 2</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold">ปีการศึกษา</label>
              <select className="form-select rounded-0" name="academicYear" value={formData.academicYear} onChange={handleInputChange}>
                <option value="2568">2568</option>
                <option value="2567">2567</option>
                <option value="2566">2566</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold">สัปดาห์ที่</label>
              <input type="number" className="form-control rounded-0" name="week" value={formData.week} onChange={handleInputChange} required />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">เวลา (นาที)</label>
              <input type="text" className="form-control rounded-0" name="time" value={formData.time} onChange={handleInputChange} required />
            </div>
          </div>

          {/* Topic */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-chat-text me-2 text-warning"></i>1. หัวข้อหลักประจำสัปดาห์</h5>
            </div>
            <div className="card-body">
              <select className="form-select rounded-0 mb-3" value={formData.topic} onChange={(e)=>setFormData({...formData, topic: e.target.value})}>
                <option value="">เลือกหัวข้อ</option>
                {topicOptions.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
              <input type="text" className="form-control rounded-0" placeholder="หรือระบุหัวข้ออื่นๆ" value={formData.topic} onChange={(e)=>setFormData({...formData, topic: e.target.value})} />
            </div>
          </div>

          {/* Objectives */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-bullseye me-2 text-warning"></i>2. วัตถุประสงค์</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">เพื่อให้ผู้เรียน</label>
                <input type="text" className="form-control rounded-0 mb-2" placeholder="วัตถุประสงค์ข้อที่ 1" 
                  value={formData.objectives[0]} onChange={(e)=>handleObjectiveChange(0, e.target.value)} required />
                <input type="text" className="form-control rounded-0" placeholder="วัตถุประสงค์ข้อที่ 2" 
                  value={formData.objectives[1]} onChange={(e)=>handleObjectiveChange(1, e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-list-check me-2 text-warning"></i>3. ขั้นตอนการดำเนินกิจกรรม</h5>
            </div>
            <div className="card-body">
              <h6 className="fw-bold bg-warning text-dark p-2">ช่วงที่ 1: การจัดการระเบียบและวินัย (5-10 นาที)</h6>
              <div className="mb-3">
                <label className="form-label">เช็คชื่อ:</label>
                <input type="text" className="form-control rounded-0 mb-2" name="checkAttendance" value={formData.checkAttendance} onChange={handleInputChange} placeholder="ตรวจสอบสถิติการมาเรียน การลา ความทันเวลา" />
                <label className="form-label">ตรวจระเบียบ:</label>
                <input type="text" className="form-control rounded-0 mb-2" name="checkUniform" value={formData.checkUniform} onChange={handleInputChange} placeholder="ความเรียบร้อยของเครื่องแต่งกายและอุปกรณ์" />
                <label className="form-label">แจ้งข่าวสาร:</label>
                <input type="text" className="form-control rounded-0" name="announceNews" value={formData.announceNews} onChange={handleInputChange} placeholder="ประชาสัมพันธ์กิจกรรมหรือประกาศสำคัญ" />
              </div>

              <h6 className="fw-bold bg-warning text-dark p-2">ช่วงที่ 2: กิจกรรมพัฒนาผู้เรียน (15 นาที)</h6>
              <div className="mb-3">
                <label className="form-label">กิจกรรมนำ:</label>
                <input type="text" className="form-control rounded-0 mb-2" name="warmup" value={formData.warmup} onChange={handleInputChange} />
                <label className="form-label">กิจกรรมหลัก:</label>
                <textarea className="form-control rounded-0 mb-2" rows={3} name="mainActivity" value={formData.mainActivity} onChange={handleInputChange} />
                <label className="form-label">การสรุป:</label>
                <input type="text" className="form-control rounded-0" name="summary" value={formData.summary} onChange={handleInputChange} />
              </div>

              <h6 className="fw-bold bg-warning text-dark p-2">ช่วงที่ 3: การดูแลรายบุคคล (5 นาที)</h6>
              <div>
                <label className="form-label">ติดตามนักเรียนที่มีปัญหา:</label>
                <input type="text" className="form-control rounded-0 mb-2" name="trackProblems" value={formData.trackProblems} onChange={handleInputChange} placeholder="ขาดเรียนบ่อย ผลการเรียนลดลง" />
                <label className="form-label">เปิดโอกาสให้นักเรียนปรึกษา:</label>
                <input type="text" className="form-control rounded-0" name="individualCounsel" value={formData.individualCounsel} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* Evaluation */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-clipboard-check me-2 text-warning"></i>5. การประเมินผล</h5>
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

          {/* Teacher's Note */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-journal-text me-2 text-warning"></i>6. บันทึกหลังกิจกรรม</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">ผลการจัดกิจกรรม:</label>
                <textarea className="form-control rounded-0" rows={2} name="teacherNote" value={formData.teacherNote} onChange={handleInputChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">ปัญหา/อุปสรรคที่พบ:</label>
                <textarea className="form-control rounded-0" rows={2} name="problems" value={formData.problems} onChange={handleInputChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">นักเรียนที่ต้องติดตามเป็นพิเศษ:</label>
                <input type="text" className="form-control rounded-0" name="specialTrack" value={formData.specialTrack} onChange={handleInputChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">บันทึกการจัดกิจกรรม (รายครั้ง):</label>
                <textarea className="form-control rounded-0" rows={2} name="sessionNote" value={formData.sessionNote} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* Materials */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-paperclip me-2 text-warning"></i>สื่อและวัสดุอุปกรณ์</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">แนบไฟล์:</label>
                <input type="file" className="form-control rounded-0" onChange={handleFileChange} />
                <small className="text-muted">ใบงาน, สื่อวิดีโอ, คู่มือประเมิน SDQ</small>
              </div>
              <div>
                <label className="form-label">หมายเหตุ:</label>
                <input type="text" className="form-control rounded-0" name="materialsNote" value={formData.materialsNote} onChange={handleInputChange} placeholder="เช่น ใช้แอปพลิเคชันเช็คชื่อ" />
              </div>
            </div>
          </div>

          {/* Suggestions & Follow-up */}
          <div className="row">
            <div className="col-md-6">
              <div className="card rounded-0 border-0 shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                  <h5 className="m-0"><i className="bi bi-chat-dots me-2 text-warning"></i>ข้อเสนอแนะ</h5>
                </div>
                <div className="card-body">
                  <textarea className="form-control rounded-0" rows={3} name="suggestions" value={formData.suggestions} onChange={handleInputChange} />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card rounded-0 border-0 shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                  <h5 className="m-0"><i className="bi bi-person-badge me-2 text-warning"></i>ติดตามผลรายบุคคล</h5>
                </div>
                <div className="card-body">
                  <textarea className="form-control rounded-0" rows={3} name="individualFollowup" value={formData.individualFollowup} onChange={handleInputChange} placeholder="รายชื่อนักเรียนที่ต้องติดตามเป็นพิเศษ..." />
                </div>
              </div>
            </div>
          </div>

          {/* Status & Submit */}
          <div className="row mb-4">
            <div className="col-md-4">
              <label className="form-label fw-semibold">สถานะ</label>
              <select className="form-select rounded-0" name="status" value={formData.status} onChange={handleInputChange}>
                <option value="draft">ร่าง</option>
                <option value="published">เผยแพร่</option>
              </select>
            </div>
            <div className="col-md-8 d-flex align-items-end justify-content-end gap-2">
              <Link href="/student_learn" className="btn btn-secondary rounded-0 px-5">ยกเลิก</Link>
              <button type="submit" className="btn btn-primary rounded-0 px-5" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>กำลังบันทึก...</> : 'บันทึกแผนกิจกรรม'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
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