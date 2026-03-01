"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function CoordinationPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    agency_name: "",
    contact_person: "",
    channel: "โทรศัพท์" as "โทรศัพท์" | "พบปะโดยตรง" | "หนังสือราชการ" | "ออนไลน์",
    details: "",
    agreement: "",
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/send/coordination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referral_id: params.id,
          ...form
        }),
      });
      
      if (response.ok) {
        router.push(`/student_send/${params.id}`);
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
                  <i className="bi bi-telephone me-2 text-warning"></i>
                  2. บันทึกการประสานงานเครือข่าย
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
                    แบบฟอร์มบันทึกการประสานงาน
                  </h5>
                </div>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-uppercase fw-semibold small">วัน/เวลา</label>
                        <input 
                          type="date" 
                          className="form-control rounded-0"
                          value={form.date}
                          onChange={(e) => setForm({...form, date: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ช่องทาง</label>
                        <select 
                          className="form-select rounded-0"
                          value={form.channel}
                          onChange={(e) => setForm({...form, channel: e.target.value as any})}
                          required
                        >
                          <option value="โทรศัพท์">โทรศัพท์</option>
                          <option value="พบปะโดยตรง">พบปะโดยตรง</option>
                          <option value="หนังสือราชการ">หนังสือราชการ</option>
                          <option value="ออนไลน์">ออนไลน์</option>
                        </select>
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ชื่อหน่วยงาน/บุคคลที่ประสาน</label>
                        <input 
                          type="text" 
                          className="form-control rounded-0"
                          placeholder="เช่น โรงพยาบาลสมเด็จพระพุทธเจดีย์ (คุณสมศรี ใจดี)"
                          value={form.agency_name}
                          onChange={(e) => setForm({...form, agency_name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ชื่อบุคคลที่ประสาน</label>
                        <input 
                          type="text" 
                          className="form-control rounded-0"
                          placeholder="เช่น คุณสมศรี ใจดี"
                          value={form.contact_person}
                          onChange={(e) => setForm({...form, contact_person: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label text-uppercase fw-semibold small">สรุปรายละเอียดการประสานงาน</label>
                        <textarea 
                          className="form-control rounded-0" 
                          rows={4}
                          placeholder="บันทึกรายละเอียดการสนทนา ปัญหาที่นำเสนอ ข้อมูลที่แลกเปลี่ยน..."
                          value={form.details}
                          onChange={(e) => setForm({...form, details: e.target.value})}
                          required
                        ></textarea>
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ข้อตกลง/แนวทางปฏิบัติร่วมกัน</label>
                        <textarea 
                          className="form-control rounded-0" 
                          rows={4}
                          placeholder="บันทึกข้อตกลง แผนการช่วยเหลือ กำหนดการ หน้าที่ร่วมกัน..."
                          value={form.agreement}
                          onChange={(e) => setForm({...form, agreement: e.target.value})}
                          required
                        ></textarea>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12">
                        <button type="submit" className="btn btn-warning rounded-0 text-uppercase fw-semibold me-2">
                          <i className="bi bi-save me-2"></i>บันทึกการประสานงาน
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary rounded-0 text-uppercase fw-semibold"
                          onClick={() => router.push(`/student_send/${params.id}`)}
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
