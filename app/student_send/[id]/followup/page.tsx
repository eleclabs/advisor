"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function FollowUpPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({
    follow_date: new Date().toISOString().split('T')[0],
    result: "พฤติกรรมดีขึ้น/ปัญหาคลี่คลาย" as "พฤติกรรมดีขึ้น/ปัญหาคลี่คลาย" | "พฤติกรรมคงเดิม" | "มีภาวะวิกฤตเพิ่มเติม",
    notes: "", // ✅ เพิ่มฟิลด์ notes
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
    
    // ✅ ตรวจสอบข้อมูลก่อนส่ง
    if (!form.notes) {
      alert("กรุณากรอกหมายเหตุ");
      return;
    }
    
    try {
      const response = await fetch('/api/send/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referral_id: params.id,
          follow_date: form.follow_date, // ✅ ส่ง follow_date
          result: form.result,
          notes: form.notes, // ✅ ส่ง notes
        }),
      });
      
      if (response.ok) {
        // ถ้าการช่วยเหลือเสร็จสิ้น อัปเดตสถานะการส่งต่อ
        if (form.result === "พฤติกรรมดีขึ้น/ปัญหาคลี่คลาย") {
          await fetch(`/api/send/${params.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: "สิ้นสุดการช่วยเหลือ" })
          });
        }
        router.push(`/student_send/${params.id}`);
      } else {
        const error = await response.json();
        alert(error.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error('Error:', error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navbar (เหมือนเดิม) */}
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
                  <i className="bi bi-clipboard-check me-2 text-warning"></i>
                  บันทึกการติดตามผล
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
                    แบบฟอร์มติดตามผล
                  </h5>
                </div>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label text-uppercase fw-semibold small">วันที่ติดตาม <span className="text-danger">*</span></label>
                        <input 
                          type="date" 
                          className="form-control rounded-0"
                          value={form.follow_date}
                          onChange={(e) => setForm({...form, follow_date: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-uppercase fw-semibold small">ผลการช่วยเหลือ <span className="text-danger">*</span></label>
                        <select 
                          className="form-select rounded-0"
                          value={form.result}
                          onChange={(e) => setForm({...form, result: e.target.value as any})}
                          required
                        >
                          <option value="พฤติกรรมดีขึ้น/ปัญหาคลี่คลาย">พฤติกรรมดีขึ้น/ปัญหาคลี่คลาย</option>
                          <option value="พฤติกรรมคงเดิม">พฤติกรรมคงเดิม</option>
                          <option value="มีภาวะวิกฤตเพิ่มเติม">มีภาวะวิกฤตเพิ่มเติม</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-uppercase fw-semibold small">หมายเหตุ <span className="text-danger">*</span></label>
                      <textarea 
                        className="form-control rounded-0" 
                        rows={4}
                        placeholder="บันทึกผลการติดตาม..."
                        value={form.notes}
                        onChange={(e) => setForm({...form, notes: e.target.value})}
                        required
                      ></textarea>
                    </div>

                    <div className="row">
                      <div className="col-12">
                        <button type="submit" className="btn btn-warning rounded-0 text-uppercase fw-semibold me-2">
                          <i className="bi bi-save me-2"></i>บันทึกการติดตามผล
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