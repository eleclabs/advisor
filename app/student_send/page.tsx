"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  level: string;
  class: string;
  number: string;
  status: string;
}

interface Referral {
  id: string;
  student_id: string;
  student_name: string;
  level: string;
  class: string;
  number: string;
  type: "internal" | "external";
  target: string;
  reason_category: string;
  reason_detail: string;
  actions_taken: string;
  status: "อยู่ระหว่างดำเนินการ" | "สิ้นสุดการช่วยเหลือ";
  created_at: string;
}

interface Coordination {
  id: string;
  referral_id: string;
  date: string;
  organization: string;
  contact_person: string;
  channel: string;
  details: string;
  agreement: string;
}

interface FollowUp {
  id: string;
  referral_id: string;
  follow_date: string;
  result: string;
  notes: string;
}

export default function StudentSendPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("referral");
  const [selectedType, setSelectedType] = useState<"internal" | "external">("internal");
  
  const [students, setStudents] = useState<Student[]>([
    { id: "66003", name: "นายสมเด็จ วิจิตร", level: "ปวช.2", class: "ชฟ.1", number: "8", status: "มีปัญหา" },
    { id: "66008", name: "นางสาวกัญญา เก่งกล้า", level: "ปวส.1", class: "ชฟ.1", number: "5", status: "มีปัญหา" },
  ]);

  const [referrals, setReferrals] = useState<Referral[]>([
    {
      id: "REF001",
      student_id: "66003",
      student_name: "นายสมเด็จ วิจิตร",
      level: "ปวช.2",
      class: "ชฟ.1",
      number: "8",
      type: "internal",
      target: "ฝ่ายแนะแนว",
      reason_category: "ด้านพฤติกรรม/ระเบียบวินัย",
      reason_detail: "ติดเกม ก้าวร้าว ไม่เชื่อฟังครู",
      actions_taken: "ให้คำปรึกษา 3 ครั้ง ตักเตือน 2 ครั้ง",
      status: "อยู่ระหว่างดำเนินการ",
      created_at: "2024-02-20",
    },
    {
      id: "REF002",
      student_id: "66008",
      student_name: "นางสาวกัญญา เก่งกล้า",
      level: "ปวส.1",
      class: "ชฟ.1",
      number: "5",
      type: "external",
      target: "โรงพยาบาลจิตเวช",
      reason_category: "ด้านอารมณ์/จิตใจ",
      reason_detail: "ทำร้ายร่างกายตนเอง มีแนวโน้มฆ่าตัวตาย",
      actions_taken: "พูดคุย เยี่ยมบ้าน แจ้งผู้ปกครอง",
      status: "อยู่ระหว่างดำเนินการ",
      created_at: "2024-02-22",
    },
  ]);

  const [coordinations, setCoordinations] = useState<Coordination[]>([
    {
      id: "COR001",
      referral_id: "REF002",
      date: "2024-02-23",
      organization: "โรงพยาบาลจิตเวชขอนแก่น",
      contact_person: "จิตแพทย์หญิงสมหญิง",
      channel: "โทรศัพท์",
      details: "ประสานงานนัดหมายพบจิตแพทย์ วันที่ 25 ก.พ. 2567",
      agreement: "ให้ผู้ปกครองพามาพบจิตแพทย์ตามนัด",
    },
  ]);

  const [followUps, setFollowUps] = useState<FollowUp[]>([
    {
      id: "FUP001",
      referral_id: "REF002",
      follow_date: "2024-02-25",
      result: "พฤติกรรมดีขึ้น",
      notes: "พบจิตแพทย์แล้ว ได้รับยาควบคุมอารมณ์ อาการดีขึ้น",
    },
  ]);

  const [referralForm, setReferralForm] = useState({
    student_id: "",
    type: "internal" as "internal" | "external",
    target: "",
    reason_category: "",
    reason_detail: "",
    actions_taken: "",
  });

  const [coordinationForm, setCoordinationForm] = useState({
    referral_id: "",
    organization: "",
    contact_person: "",
    channel: "โทรศัพท์",
    details: "",
    agreement: "",
  });

  const [followUpForm, setFollowUpForm] = useState({
    referral_id: "",
    result: "",
    notes: "",
  });

  useEffect(() => {
    // Load Bootstrap CSS
    const bootstrapLink = document.createElement("link");
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    bootstrapLink.rel = "stylesheet";
    document.head.appendChild(bootstrapLink);

    // Load Bootstrap Icons
    const iconLink = document.createElement("link");
    iconLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);
  }, []);

  const stats = {
    total: referrals.length,
    internal: referrals.filter(r => r.type === "internal").length,
    external: referrals.filter(r => r.type === "external").length,
    active: referrals.filter(r => r.status === "อยู่ระหว่างดำเนินการ").length,
    completed: referrals.filter(r => r.status === "สิ้นสุดการช่วยเหลือ").length,
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* START: Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-2 border-warning flex-shrink-0">
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
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/student_problem">ป้องกันและแก้ไข</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3 active" href="/student_send">ส่งต่อ</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* END: Navigation Bar */}

      {/* START: Main Content */}
      <div className="flex-grow-1">
        <div className="container-fluid py-4">
          {/* START: Page Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
                <h2 className="text-uppercase fw-bold m-0">
                  <i className="bi bi-send me-2 text-warning"></i>
                  ระบบบริหารการส่งต่อ (Referral System)
                </h2>
                <div>
                  <span className="badge bg-info rounded-0 p-2 me-2">ส่งต่อภายใน: {stats.internal}</span>
                  <span className="badge bg-primary rounded-0 p-2">ส่งต่อภายนอก: {stats.external}</span>
                </div>
              </div>
            </div>
          </div>
          {/* END: Page Header */}

          {/* START: Stats Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-uppercase fw-semibold small text-muted">การส่งต่อทั้งหมด</div>
                    <div className="display-6 fw-bold">{stats.total}</div>
                  </div>
                  <i className="bi bi-send fs-1 text-warning"></i>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-uppercase fw-semibold small text-muted">อยู่ระหว่างดำเนินการ</div>
                    <div className="display-6 fw-bold text-warning">{stats.active}</div>
                  </div>
                  <i className="bi bi-hourglass-split fs-1 text-warning"></i>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-uppercase fw-semibold small text-muted">สิ้นสุดการช่วยเหลือ</div>
                    <div className="display-6 fw-bold text-success">{stats.completed}</div>
                  </div>
                  <i className="bi bi-check-circle-fill fs-1 text-success"></i>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-uppercase fw-semibold small text-muted">รอดำเนินการ</div>
                    <div className="display-6 fw-bold text-danger">{stats.total - stats.active - stats.completed}</div>
                  </div>
                  <i className="bi bi-exclamation-triangle-fill fs-1 text-danger"></i>
                </div>
              </div>
            </div>
          </div>
          {/* END: Stats Cards */}

          {/* START: Tabs */}
          <div className="row mb-4">
            <div className="col-12">
              <ul className="nav nav-tabs border-0">
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-0 text-uppercase fw-semibold ${activeTab === 'referral' ? 'active bg-dark text-white' : 'bg-light'}`}
                    onClick={() => setActiveTab('referral')}
                  >
                    <i className="bi bi-send me-2"></i>แบบฟอร์มส่งต่อ
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-0 text-uppercase fw-semibold ${activeTab === 'coordination' ? 'active bg-dark text-white' : 'bg-light'}`}
                    onClick={() => setActiveTab('coordination')}
                  >
                    <i className="bi bi-people me-2"></i>บันทึกการประสานงาน
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-0 text-uppercase fw-semibold ${activeTab === 'followup' ? 'active bg-dark text-white' : 'bg-light'}`}
                    onClick={() => setActiveTab('followup')}
                  >
                    <i className="bi bi-clipboard-check me-2"></i>ติดตามผลหลังส่งต่อ
                  </button>
                </li>
              </ul>
            </div>
          </div>
          {/* END: Tabs */}

          {/* START: Tab Content - Referral Form */}
          {activeTab === 'referral' && (
            <div className="row">
              <div className="col-md-5">
                <div className="border bg-white">
                  <div className="p-3 border-bottom bg-dark">
                    <h5 className="text-uppercase fw-semibold m-0 text-white">
                      <i className="bi bi-plus-circle me-2 text-warning"></i>
                      แบบฟอร์มการส่งต่อผู้เรียน
                    </h5>
                  </div>
                  <div className="p-3">
                    <form>
                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">เลือกนักเรียน</label>
                        <select 
                          className="form-select rounded-0"
                          value={referralForm.student_id}
                          onChange={(e) => setReferralForm({...referralForm, student_id: e.target.value})}
                        >
                          <option value="">เลือกนักเรียน</option>
                          {students.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} {s.level}/{s.class} เลขที่ {s.number}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small d-block">ประเภทการส่งต่อ</label>
                        <div className="form-check form-check-inline">
                          <input 
                            type="radio" 
                            className="form-check-input rounded-0" 
                            name="type"
                            value="internal"
                            checked={referralForm.type === "internal"}
                            onChange={() => setReferralForm({...referralForm, type: "internal"})}
                          />
                          <label className="form-check-label">ภายใน</label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input 
                            type="radio" 
                            className="form-check-input rounded-0" 
                            name="type"
                            value="external"
                            checked={referralForm.type === "external"}
                            onChange={() => setReferralForm({...referralForm, type: "external"})}
                          />
                          <label className="form-check-label">ภายนอก</label>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ส่งต่อ</label>
                        {referralForm.type === "internal" ? (
                          <select 
                            className="form-select rounded-0"
                            value={referralForm.target}
                            onChange={(e) => setReferralForm({...referralForm, target: e.target.value})}
                          >
                            <option value="">เลือกหน่วยงานภายใน</option>
                            <option value="ฝ่ายแนะแนว">ฝ่ายแนะแนว</option>
                            <option value="ฝ่ายปกครอง">ฝ่ายปกครอง</option>
                            <option value="พยาบาล">พยาบาล</option>
                          </select>
                        ) : (
                          <select 
                            className="form-select rounded-0"
                            value={referralForm.target}
                            onChange={(e) => setReferralForm({...referralForm, target: e.target.value})}
                          >
                            <option value="">เลือกหน่วยงานภายนอก</option>
                            <option value="โรงพยาบาล">โรงพยาบาล</option>
                            <option value="สถานีตำรวจ">สถานีตำรวจ</option>
                            <option value="พัฒนาสังคมฯ">พัฒนาสังคมและความมั่นคงของมนุษย์</option>
                          </select>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">สาเหตุการส่งต่อ</label>
                        <select 
                          className="form-select rounded-0 mb-2"
                          value={referralForm.reason_category}
                          onChange={(e) => setReferralForm({...referralForm, reason_category: e.target.value})}
                        >
                          <option value="">เลือกสาเหตุ</option>
                          <option value="ด้านการเรียน/สติปัญญา">ด้านการเรียน/สติปัญญา</option>
                          <option value="ด้านพฤติกรรม/ระเบียบวินัย">ด้านพฤติกรรม/ระเบียบวินัย</option>
                          <option value="ด้านอารมณ์/จิตใจ">ด้านอารมณ์/จิตใจ (ซึมเศร้า/เสี่ยงทำร้ายตนเอง)</option>
                          <option value="ด้านครอบครัว/เศรษฐกิจ/ความรุนแรง">ด้านครอบครัว/เศรษฐกิจ/ความรุนแรง</option>
                        </select>
                        <textarea 
                          className="form-control rounded-0" 
                          rows={2}
                          placeholder="สรุปปัญหา/พฤติกรรมที่พบ"
                          value={referralForm.reason_detail}
                          onChange={(e) => setReferralForm({...referralForm, reason_detail: e.target.value})}
                        ></textarea>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">สิ่งที่ครูที่ปรึกษาได้ดำเนินการไปแล้ว</label>
                        <textarea 
                          className="form-control rounded-0" 
                          rows={3}
                          placeholder="เช่น ให้คำปรึกษา ตักเตือน เยี่ยมบ้าน"
                          value={referralForm.actions_taken}
                          onChange={(e) => setReferralForm({...referralForm, actions_taken: e.target.value})}
                        ></textarea>
                      </div>

                      <button className="btn btn-warning rounded-0 text-uppercase fw-semibold w-100">
                        <i className="bi bi-save me-2"></i>บันทึกการส่งต่อ
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-md-7">
                <div className="border bg-white">
                  <div className="p-3 border-bottom bg-dark">
                    <h5 className="text-uppercase fw-semibold m-0 text-white">
                      <i className="bi bi-list-check me-2 text-warning"></i>
                      รายการส่งต่อล่าสุด
                    </h5>
                  </div>
                  <div className="p-3">
                    {referrals.map(ref => (
                      <div key={ref.id} className="border mb-3 p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold">{ref.student_name}</h6>
                          <span className={`badge bg-${ref.type === 'internal' ? 'info' : 'primary'} rounded-0 text-uppercase`}>
                            {ref.type === 'internal' ? 'ส่งต่อภายใน' : 'ส่งต่อภายนอก'}
                          </span>
                        </div>
                        <p className="small mb-1"><span className="fw-semibold">ส่งต่อ:</span> {ref.target}</p>
                        <p className="small mb-1"><span className="fw-semibold">สาเหตุ:</span> {ref.reason_category}</p>
                        <p className="small mb-1"><span className="fw-semibold">ปัญหา:</span> {ref.reason_detail}</p>
                        <p className="small mb-1"><span className="fw-semibold">สิ่งที่ดำเนินการ:</span> {ref.actions_taken}</p>
                        <p className="small mb-1">
                          <span className="fw-semibold">สถานะ:</span>{' '}
                          <span className={`badge bg-${ref.status === 'อยู่ระหว่างดำเนินการ' ? 'warning' : 'success'} rounded-0`}>
                            {ref.status}
                          </span>
                        </p>
                        <p className="small mb-0 text-muted">วันที่: {ref.created_at}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* END: Tab Content - Referral Form */}

          {/* START: Tab Content - Coordination */}
          {activeTab === 'coordination' && (
            <div className="row">
              <div className="col-md-5">
                <div className="border bg-white">
                  <div className="p-3 border-bottom bg-dark">
                    <h5 className="text-uppercase fw-semibold m-0 text-white">
                      <i className="bi bi-plus-circle me-2 text-warning"></i>
                      บันทึกการประสานงานเครือข่าย
                    </h5>
                  </div>
                  <div className="p-3">
                    <form>
                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">เลือกรายการส่งต่อ</label>
                        <select 
                          className="form-select rounded-0"
                          value={coordinationForm.referral_id}
                          onChange={(e) => setCoordinationForm({...coordinationForm, referral_id: e.target.value})}
                        >
                          <option value="">เลือกรายการ</option>
                          {referrals.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.student_name} - {r.target}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">วัน/เวลา</label>
                        <input 
                          type="date" 
                          className="form-control rounded-0"
                          value={coordinationForm.date}
                          onChange={(e) => setCoordinationForm({...coordinationForm, date: e.target.value})}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ชื่อหน่วยงาน/บุคคลที่ประสาน</label>
                        <input 
                          type="text" 
                          className="form-control rounded-0"
                          placeholder="เช่น โรงพยาบาลจิตเวชขอนแก่น"
                          value={coordinationForm.organization}
                          onChange={(e) => setCoordinationForm({...coordinationForm, organization: e.target.value})}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ช่องทาง</label>
                        <select 
                          className="form-select rounded-0"
                          value={coordinationForm.channel}
                          onChange={(e) => setCoordinationForm({...coordinationForm, channel: e.target.value})}
                        >
                          <option value="โทรศัพท์">โทรศัพท์</option>
                          <option value="พบปะโดยตรง">พบปะโดยตรง</option>
                          <option value="หนังสือราชการ">หนังสือราชการ</option>
                          <option value="ออนไลน์">ออนไลน์</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">สรุปรายละเอียดการประสานงาน</label>
                        <textarea 
                          className="form-control rounded-0" 
                          rows={3}
                          value={coordinationForm.details}
                          onChange={(e) => setCoordinationForm({...coordinationForm, details: e.target.value})}
                        ></textarea>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ข้อตกลง/แนวทางปฏิบัติร่วมกัน</label>
                        <textarea 
                          className="form-control rounded-0" 
                          rows={3}
                          value={coordinationForm.agreement}
                          onChange={(e) => setCoordinationForm({...coordinationForm, agreement: e.target.value})}
                        ></textarea>
                      </div>

                      <button className="btn btn-warning rounded-0 text-uppercase fw-semibold w-100">
                        <i className="bi bi-save me-2"></i>บันทึกการประสานงาน
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-md-7">
                <div className="border bg-white">
                  <div className="p-3 border-bottom bg-dark">
                    <h5 className="text-uppercase fw-semibold m-0 text-white">
                      <i className="bi bi-journal-text me-2 text-warning"></i>
                      ประวัติการประสานงาน
                    </h5>
                  </div>
                  <div className="p-3">
                    {coordinations.map(cor => {
                      const referral = referrals.find(r => r.id === cor.referral_id);
                      return (
                        <div key={cor.id} className="border mb-3 p-3">
                          <h6 className="fw-bold mb-2">{referral?.student_name}</h6>
                          <p className="small mb-1"><span className="fw-semibold">วันที่:</span> {cor.date}</p>
                          <p className="small mb-1"><span className="fw-semibold">หน่วยงาน:</span> {cor.organization}</p>
                          <p className="small mb-1"><span className="fw-semibold">ผู้ประสาน:</span> {cor.contact_person}</p>
                          <p className="small mb-1"><span className="fw-semibold">ช่องทาง:</span> {cor.channel}</p>
                          <p className="small mb-1"><span className="fw-semibold">รายละเอียด:</span> {cor.details}</p>
                          <p className="small mb-0"><span className="fw-semibold">ข้อตกลง:</span> {cor.agreement}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* END: Tab Content - Coordination */}

          {/* START: Tab Content - Follow Up */}
          {activeTab === 'followup' && (
            <div className="row">
              <div className="col-md-5">
                <div className="border bg-white">
                  <div className="p-3 border-bottom bg-dark">
                    <h5 className="text-uppercase fw-semibold m-0 text-white">
                      <i className="bi bi-plus-circle me-2 text-warning"></i>
                      ติดตามผลหลังการส่งต่อ
                    </h5>
                  </div>
                  <div className="p-3">
                    <form>
                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">เลือกรายการส่งต่อ</label>
                        <select 
                          className="form-select rounded-0"
                          value={followUpForm.referral_id}
                          onChange={(e) => setFollowUpForm({...followUpForm, referral_id: e.target.value})}
                        >
                          <option value="">เลือกรายการ</option>
                          {referrals.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.student_name} - {r.target}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">วันที่ติดตาม</label>
                        <input 
                          type="date" 
                          className="form-control rounded-0"
                          value={followUpForm.follow_date}
                          onChange={(e) => setFollowUpForm({...followUpForm, follow_date: e.target.value})}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ผลการช่วยเหลือจากหน่วยงาน</label>
                        <select 
                          className="form-select rounded-0 mb-2"
                          value={followUpForm.result}
                          onChange={(e) => setFollowUpForm({...followUpForm, result: e.target.value})}
                        >
                          <option value="">เลือกผลการช่วยเหลือ</option>
                          <option value="พฤติกรรมดีขึ้น">พฤติกรรมดีขึ้น/ปัญหาคลี่คลาย</option>
                          <option value="พฤติกรรมคงเดิม">พฤติกรรมคงเดิม</option>
                          <option value="มีภาวะวิกฤตเพิ่มเติม">มีภาวะวิกฤตเพิ่มเติม</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">บันทึกเพิ่มเติม</label>
                        <textarea 
                          className="form-control rounded-0" 
                          rows={3}
                          value={followUpForm.notes}
                          onChange={(e) => setFollowUpForm({...followUpForm, notes: e.target.value})}
                        ></textarea>
                      </div>

                      <button className="btn btn-warning rounded-0 text-uppercase fw-semibold w-100">
                        <i className="bi bi-save me-2"></i>บันทึกการติดตาม
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-md-7">
                <div className="border bg-white">
                  <div className="p-3 border-bottom bg-dark">
                    <h5 className="text-uppercase fw-semibold m-0 text-white">
                      <i className="bi bi-clock-history me-2 text-warning"></i>
                      ประวัติการติดตามผล
                    </h5>
                  </div>
                  <div className="p-3">
                    {followUps.map(fup => {
                      const referral = referrals.find(r => r.id === fup.referral_id);
                      return (
                        <div key={fup.id} className="border mb-3 p-3">
                          <h6 className="fw-bold mb-2">{referral?.student_name}</h6>
                          <p className="small mb-1"><span className="fw-semibold">วันที่ติดตาม:</span> {fup.follow_date}</p>
                          <p className="small mb-1">
                            <span className="fw-semibold">ผลการช่วยเหลือ:</span>{' '}
                            <span className={`badge bg-${
                              fup.result === 'พฤติกรรมดีขึ้น' ? 'success' :
                              fup.result === 'พฤติกรรมคงเดิม' ? 'warning' : 'danger'
                            } rounded-0`}>
                              {fup.result}
                            </span>
                          </p>
                          <p className="small mb-0"><span className="fw-semibold">บันทึก:</span> {fup.notes}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* END: Tab Content - Follow Up */}

          {/* START: Dashboard */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-graph-up me-2 text-warning"></i>
                    Dashboard และรายงาน
                  </h5>
                </div>
                <div className="p-3">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-3">จำนวนผู้เรียนแต่ละกลุ่ม</h6>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>กลุ่มปกติ</span>
                          <span className="fw-bold text-success">45 คน</span>
                        </div>
                        <div className="progress rounded-0" style={{ height: "20px" }}>
                          <div className="progress-bar bg-success" style={{ width: "75%" }}>75%</div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>กลุ่มเสี่ยง</span>
                          <span className="fw-bold text-warning">10 คน</span>
                        </div>
                        <div className="progress rounded-0" style={{ height: "20px" }}>
                          <div className="progress-bar bg-warning" style={{ width: "16.7%" }}>16.7%</div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>กลุ่มมีปัญหา (ดูแลเร่งด่วน)</span>
                          <span className="fw-bold text-danger">5 คน</span>
                        </div>
                        <div className="progress rounded-0" style={{ height: "20px" }}>
                          <div className="progress-bar bg-danger" style={{ width: "8.3%" }}>8.3%</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-3">งานที่ต้องติดตามเร่งด่วน</h6>
                      <div className="list-group">
                        <div className="list-group-item border rounded-0 d-flex justify-content-between align-items-center">
                          <div>
                            <span className="fw-semibold">นางสาวกัญญา เก่งกล้า</span>
                            <br />
                            <small>ส่งต่อโรงพยาบาลจิตเวช - รอผลการรักษา</small>
                          </div>
                          <span className="badge bg-danger rounded-0">เร่งด่วน</span>
                        </div>
                        <div className="list-group-item border rounded-0 d-flex justify-content-between align-items-center">
                          <div>
                            <span className="fw-semibold">นายสมเด็จ วิจิตร</span>
                            <br />
                            <small>ติดตามพฤติกรรมหลังให้คำปรึกษา</small>
                          </div>
                          <span className="badge bg-warning rounded-0">7 วัน</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* END: Dashboard */}
        </div>
      </div>
      {/* END: Main Content */}

      {/* START: Footer */}
      <footer className="bg-dark text-white py-3 border-top border-warning flex-shrink-0">
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
      {/* END: Footer */}
    </div>
  );
}