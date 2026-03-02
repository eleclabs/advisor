"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewReferralPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    student_id: "",
    student_name: "",
    student_level: "",
    student_class: "",
    student_number: "",
    type: "internal" as "internal" | "external",
    target: "",
    reason_category: "",
    reason_detail: "",
    actions_taken: "",
  });

  useEffect(() => {
    const bootstrapLink = document.createElement("link");
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    bootstrapLink.rel = "stylesheet";
    document.head.appendChild(bootstrapLink);

    const iconLink = document.createElement("link");
    iconLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);

    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await fetch('/api/student');
      const data = await response.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleStudentSelect = (student: any) => {
    setForm({
      ...form,
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      student_level: student.level,
      student_class: student.class_group,
      student_number: student.class_number,
    });
    setSearchTerm(`${student.first_name} ${student.last_name}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (response.ok) {
        const data = await response.json();
        router.push(`/student_send/${data.data._id}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-2 border-warning">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-uppercase" href="#">
            <i className="bi bi-mortarboard-fill me-2 text-warning"></i>
            <span className="text-warning">ระบบดูแลผู้เรียนรายบุคคล</span>
          </a>
          <div className="navbar-nav ms-auto">
            <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/student">รายชื่อผู้เรียน</a>
            <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/student_problem">ป้องกันและแก้ไข</a>
            <a className="nav-link text-white text-uppercase fw-semibold px-3 active" href="/student_send">ส่งต่อ</a>
          </div>
        </div>
      </nav>

      <div className="flex-grow-1">
        <div className="container-fluid py-4">
          <div className="row mb-4">
            <div className="col-12">
              <div className="border-bottom border-3 border-warning pb-2">
                <h2 className="text-uppercase fw-bold m-0">
                  <i className="bi bi-plus-circle me-2 text-warning"></i>
                  สร้างการส่งต่อใหม่
                </h2>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-8">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-file-text me-2 text-warning"></i>
                    แบบฟอร์มการส่งต่อผู้เรียน
                  </h5>
                </div>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ค้นหาและเลือกนักเรียน</label>
                        <input 
                          type="text" 
                          className="form-control rounded-0 mb-2"
                          placeholder="พิมพ์ชื่อหรือรหัสนักเรียน..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="border rounded" style={{maxHeight: '200px', overflowY: 'auto'}}>
                          {students
                            .filter((s: any) => 
                              searchTerm === '' || 
                              `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              s.id.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .slice(0, 10)
                            .map((s: any) => (
                            <div 
                              key={s.id} 
                              className="p-2 border-bottom cursor-pointer hover-bg-light"
                              style={{cursor: 'pointer'}}
                              onClick={() => handleStudentSelect(s)}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{s.first_name} {s.last_name}</strong>
                                  <br />
                                  <small className="text-muted">รหัส: {s.id} | {s.level}/{s.class_group} เลขที่ {s.class_number}</small>
                                </div>
                                <i className="bi bi-person-plus text-warning"></i>
                              </div>
                            </div>
                          ))}
                          {searchTerm && students.filter((s: any) => 
                            `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.id.toLowerCase().includes(searchTerm.toLowerCase())
                          ).length === 0 && (
                            <div className="p-3 text-center text-muted">
                              <i className="bi bi-search"></i> ไม่พบนักเรียนที่ค้นหา
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ระดับ</label>
                        <input 
                          type="text" 
                          className="form-control rounded-0"
                          value={form.student_level}
                          readOnly
                          style={{backgroundColor: '#f8f9fa'}}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ชั้น</label>
                        <input 
                          type="text" 
                          className="form-control rounded-0"
                          value={form.student_class}
                          readOnly
                          style={{backgroundColor: '#f8f9fa'}}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label text-uppercase fw-semibold small">เลขที่</label>
                        <input 
                          type="text" 
                          className="form-control rounded-0"
                          value={form.student_number}
                          readOnly
                          style={{backgroundColor: '#f8f9fa'}}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-uppercase fw-semibold small d-block">ประเภทการส่งต่อ</label>
                        <div className="form-check form-check-inline">
                          <input 
                            type="radio" 
                            className="form-check-input rounded-0" 
                            name="type"
                            value="internal"
                            checked={form.type === "internal"}
                            onChange={() => setForm({...form, type: "internal"})}
                          />
                          <label className="form-check-label">ภายใน</label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input 
                            type="radio" 
                            className="form-check-input rounded-0" 
                            name="type"
                            value="external"
                            checked={form.type === "external"}
                            onChange={() => setForm({...form, type: "external"})}
                          />
                          <label className="form-check-label">ภายนอก</label>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ส่งต่อ</label>
                        {form.type === "internal" ? (
                          <select 
                            className="form-select rounded-0"
                            value={form.target}
                            onChange={(e) => setForm({...form, target: e.target.value})}
                            required
                          >
                            <option value="">เลือกหน่วยงานภายใน</option>
                            <option value="ฝ่ายแนะแนว">ฝ่ายแนะแนว</option>
                            <option value="ฝ่ายปกครอง">ฝ่ายปกครอง</option>
                            <option value="พยาบาล">พยาบาล</option>
                          </select>
                        ) : (
                          <select 
                            className="form-select rounded-0"
                            value={form.target}
                            onChange={(e) => setForm({...form, target: e.target.value})}
                            required
                          >
                            <option value="">เลือกหน่วยงานภายนอก</option>
                            <option value="โรงพยาบาล">โรงพยาบาล</option>
                            <option value="สถานีตำรวจ">สถานีตำรวจ</option>
                            <option value="พัฒนาสังคมฯ">พัฒนาสังคมและความมั่นคงของมนุษย์</option>
                          </select>
                        )}
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label text-uppercase fw-semibold small">สาเหตุการส่งต่อ</label>
                        <select 
                          className="form-select rounded-0 mb-2"
                          value={form.reason_category}
                          onChange={(e) => setForm({...form, reason_category: e.target.value})}
                          required
                        >
                          <option value="">เลือกสาเหตุ</option>
                          <option value="ด้านการเรียน/สติปัญญา">ด้านการเรียน/สติปัญญา</option>
                          <option value="ด้านพฤติกรรม/ระเบียบวินัย">ด้านพฤติกรรม/ระเบียบวินัย</option>
                          <option value="ด้านอารมณ์/จิตใจ">ด้านอารมณ์/จิตใจ</option>
                          <option value="ด้านครอบครัว/เศรษฐกิจ/ความรุนแรง">ด้านครอบครัว/เศรษฐกิจ/ความรุนแรง</option>
                        </select>
                        <textarea 
                          className="form-control rounded-0" 
                          rows={3}
                          placeholder="สรุปปัญหา/พฤติกรรมที่พบ"
                          value={form.reason_detail}
                          onChange={(e) => setForm({...form, reason_detail: e.target.value})}
                          required
                        ></textarea>
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label text-uppercase fw-semibold small">สิ่งที่ครูที่ปรึกษาได้ดำเนินการไปแล้ว</label>
                        <textarea 
                          className="form-control rounded-0" 
                          rows={4}
                          placeholder="เช่น ให้คำปรึกษา ตักเตือน เยี่ยมบ้าน"
                          value={form.actions_taken}
                          onChange={(e) => setForm({...form, actions_taken: e.target.value})}
                          required
                        ></textarea>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12">
                        <button type="submit" className="btn btn-warning rounded-0 text-uppercase fw-semibold me-2">
                          <i className="bi bi-save me-2"></i>บันทึกการส่งต่อ
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary rounded-0 text-uppercase fw-semibold"
                          onClick={() => router.push('/student_send')}
                        >
                          <i className="bi bi-arrow-left me-2"></i>ย้อนกลับ
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-dark text-white py-3 border-top border-warning">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 text-uppercase small">
              <i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล
            </div>
            <div className="col-md-6 text-end text-uppercase small">
              <span className="me-3">เวอร์ชัน 2.0.0</span>
              <span>ระบบส่งต่อผู้เรียน</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
