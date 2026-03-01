"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function FollowUpPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({
    status: "อยู่ระหว่างดำเนินการ" as "อยู่ระหว่างดำเนินการ" | "สิ้นสุดการช่วยเหลือ",
    result: "พฤติกรรมดีขึ้น/ปัญหาคลี่คลาย" as "พฤติกรรมดีขึ้น/ปัญหาคลี่คลาย" | "พฤติกรรมคงเดิม" | "มีภาวะวิกฤตเพิ่มเติม",
    follow_up_1: "",
    follow_up_2: "",
    follow_up_3: "",
    continuous_plan: "",
    collaboration: [] as string[],
    report: "",
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

  const handleCollaborationChange = (value: string, checked: boolean) => {
    if (checked) {
      setForm({...form, collaboration: [...form.collaboration, value]});
    } else {
      setForm({...form, collaboration: form.collaboration.filter(item => item !== value)});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/send/followup', {
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
                  <i className="bi bi-clipboard-check me-2 text-warning"></i>
                  3. แบบประเมินและติดตามผลหลังการส่งต่อ
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
                    แบบฟอร์มประเมินและติดตามผล
                  </h5>
                </div>
                <div className="p-3">
                  <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label text-uppercase fw-semibold small">สถานะการดำเนินการ</label>
                        <select 
                          className="form-select rounded-0"
                          value={form.status}
                          onChange={(e) => setForm({...form, status: e.target.value as any})}
                        >
                          <option value="อยู่ระหว่างดำเนินการ">อยู่ระหว่างดำเนินการ</option>
                          <option value="สิ้นสุดการช่วยเหลือ">สิ้นสุดการช่วยเหลือ</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-uppercase fw-semibold small">ผลการช่วยเหลือจากหน่วยงานรับส่งต่อ</label>
                        <select 
                          className="form-select rounded-0"
                          value={form.result}
                          onChange={(e) => setForm({...form, result: e.target.value as any})}
                        >
                          <option value="พฤติกรรมดีขึ้น/ปัญหาคลี่คลาย">พฤติกรรมดีขึ้น/ปัญหาคลี่คลาย</option>
                          <option value="พฤติกรรมคงเดิม">พฤติกรรมคงเดิม</option>
                          <option value="มีภาวะวิกฤตเพิ่มเติม">มีภาวะวิกฤตเพิ่มเติม</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="text-uppercase fw-semibold small mb-3">4. การติดตามผลในสถานศึกษา (Follow-up)</h6>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label text-uppercase fw-semibold small">ครั้งที่ 1 (7 วัน)</label>
                          <textarea 
                            className="form-control rounded-0" 
                            rows={3}
                            placeholder="บันทึกผลการติดตามครั้งที่ 1"
                            value={form.follow_up_1}
                            onChange={(e) => setForm({...form, follow_up_1: e.target.value})}
                          ></textarea>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label text-uppercase fw-semibold small">ครั้งที่ 2 (30 วัน)</label>
                          <textarea 
                            className="form-control rounded-0" 
                            rows={3}
                            placeholder="บันทึกผลการติดตามครั้งที่ 2"
                            value={form.follow_up_2}
                            onChange={(e) => setForm({...form, follow_up_2: e.target.value})}
                          ></textarea>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label text-uppercase fw-semibold small">ครั้งที่ 3 (90 วัน)</label>
                          <textarea 
                            className="form-control rounded-0" 
                            rows={3}
                            placeholder="บันทึกผลการติดตามครั้งที่ 3"
                            value={form.follow_up_3}
                            onChange={(e) => setForm({...form, follow_up_3: e.target.value})}
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-uppercase fw-semibold small">แผนการดูแลต่อเนื่อง</label>
                      <textarea 
                        className="form-control rounded-0" 
                        rows={4}
                        placeholder="บันทึกแผนการดูแลต่อเนื่อง กิจกรรมที่ต้องทำ ตารางเวลา..."
                        value={form.continuous_plan}
                        onChange={(e) => setForm({...form, continuous_plan: e.target.value})}
                      ></textarea>
                    </div>

                    <div className="mb-4">
                      <h6 className="text-uppercase fw-semibold small mb-3">การมีส่วนร่วม</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-check">
                            <input 
                              type="checkbox" 
                              className="form-check-input rounded-0"
                              id="teacher"
                              checked={form.collaboration.includes("ครู")}
                              onChange={(e) => handleCollaborationChange("ครู", e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="teacher">ครู</label>
                          </div>
                          <div className="form-check">
                            <input 
                              type="checkbox" 
                              className="form-check-input rounded-0"
                              id="parent"
                              checked={form.collaboration.includes("ผู้ปกครอง")}
                              onChange={(e) => handleCollaborationChange("ผู้ปกครอง", e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="parent">ผู้ปกครอง</label>
                          </div>
                          <div className="form-check">
                            <input 
                              type="checkbox" 
                              className="form-check-input rounded-0"
                              id="community"
                              checked={form.collaboration.includes("ชุมชน")}
                              onChange={(e) => handleCollaborationChange("ชุมชน", e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="community">ชุมชน</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-uppercase fw-semibold small">รายงานเพื่อปรับปรุงงาน</label>
                      <textarea 
                        className="form-control rounded-0" 
                        rows={4}
                        placeholder="บันทึกข้อเสนอแนะ ปัญหาที่พบ แนวทางปรับปรุง..."
                        value={form.report}
                        onChange={(e) => setForm({...form, report: e.target.value})}
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
