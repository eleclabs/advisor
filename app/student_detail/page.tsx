"use client";

import { useEffect } from "react";

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const studentId = params.id;

  // Placeholder variables (แทนที่ด้วยข้อมูลจริงจาก API/State)
  const student_id = studentId;
  const student_name = "นายสมชาย ใจดี";
  const student_status = "ปกติ"; // หรือ 'เสี่ยง', 'มีปัญหา'
  const nickname = "ชาย";
  const gender = "ชาย";
  const birth_date = "01/01/2548";
  const level = "ปวช.3";
  const class_group = "ชฟ.1";
  const advisor_name = "อาจารย์วิมลรัตน์";
  const phone_number = "081-234-5678";
  const religion = "พุทธ";
  const address = "123 ม.1 ต.ในเมือง อ.เมือง จ.ขอนแก่น";
  const weight = "65";
  const height = "175";
  const bmi = "21.2";
  const blood_type = "O";
  const parent_status = "อยู่ด้วยกัน";
  const living_with = "บิดา-มารดา";
  const housing_type = "บ้านปูนชั้นเดียว";
  const transportation = "รถจักรยานยนต์ส่วนตัว";
  const family_income = "25,000";
  const daily_allowance = "120";
  const assistance_needs = "ทุนการศึกษา";
  const chronic_disease = "ไม่มี";
  const allergies = "ไม่มี";
  const risk_behaviors = "ไม่มี";

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

  return (
    <div className="min-vh-100 bg-light">
      {/* START: Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-2 border-warning">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-uppercase" href="/students">
            <i className="bi bi-mortarboard-fill me-2 text-warning"></i>
            <span className="text-warning">ระบบดูแลผู้เรียนรายบุคคล</span>
          </a>
          <div className="ms-3">
            <span className="badge bg-warning text-dark rounded-0 p-2">รหัสนักศึกษา: {student_id}</span>
          </div>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/students">รายชื่อผู้เรียน</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/committees">คณะกรรมการ</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/isp">ISP</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/referrals">ส่งต่อ</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* END: Navigation Bar */}

      <div className="container-fluid py-4">
        {/* START: Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-person-badge me-2 text-warning"></i>
                ข้อมูลผู้เรียน: {student_name}
              </h2>
              <div>
                <span className={`badge rounded-0 text-uppercase fw-semibold p-2 me-2 ${
                  student_status === 'ปกติ' ? 'bg-success' : 
                  student_status === 'เสี่ยง' ? 'bg-warning text-dark' : 
                  student_status === 'มีปัญหา' ? 'bg-danger' : ''
                }`}>
                  สถานะ: {student_status}
                </span>
                <a href={`/students/${student_id}/edit`} className="btn btn-warning rounded-0 text-uppercase fw-semibold me-2">
                  <i className="bi bi-pencil me-2"></i>แก้ไขข้อมูล
                </a>
                <a href={`/students/${student_id}/print`} className="btn btn-outline-dark rounded-0 text-uppercase fw-semibold" target="_blank">
                  <i className="bi bi-printer me-2"></i>พิมพ์โปรไฟล์
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* END: Page Header */}

        {/* START: Basic Information Card */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border bg-white">
              <div className="p-3 border-bottom bg-dark">
                <h5 className="text-uppercase fw-semibold m-0 text-white">
                  <i className="bi bi-info-circle me-2 text-warning"></i>
                  ข้อมูลพื้นฐาน
                </h5>
              </div>
              <div className="p-4">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">รหัสนักศึกษา</label>
                    <p className="fw-bold">{student_id}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ชื่อ-นามสกุล</label>
                    <p className="fw-bold">{student_name}</p>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ชื่อเล่น</label>
                    <p>{nickname}</p>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label text-uppercase fw-semibold small text-muted">เพศ</label>
                    <p>{gender}</p>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label text-uppercase fw-semibold small text-muted">วันเกิด</label>
                    <p>{birth_date}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ระดับชั้น/กลุ่ม</label>
                    <p>{level}/{class_group}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ครูที่ปรึกษา</label>
                    <p>{advisor_name}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">เบอร์โทรศัพท์</label>
                    <p>{phone_number}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ศาสนา</label>
                    <p>{religion}</p>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ที่อยู่</label>
                    <p>{address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* END: Basic Information Card */}

        {/* START: Physical Information Row */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="border bg-white p-3">
              <label className="form-label text-uppercase fw-semibold small text-muted">น้ำหนัก</label>
              <p className="fw-bold h3">{weight} กก.</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="border bg-white p-3">
              <label className="form-label text-uppercase fw-semibold small text-muted">ส่วนสูง</label>
              <p className="fw-bold h3">{height} ซม.</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="border bg-white p-3">
              <label className="form-label text-uppercase fw-semibold small text-muted">BMI</label>
              <p className="fw-bold h3">{bmi}</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="border bg-white p-3">
              <label className="form-label text-uppercase fw-semibold small text-muted">หมู่เลือด</label>
              <p className="fw-bold h3">{blood_type}</p>
            </div>
          </div>
        </div>
        {/* END: Physical Information Row */}

        {/* START: Family Information Card */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="border bg-white">
              <div className="p-3 border-bottom bg-dark">
                <h5 className="text-uppercase fw-semibold m-0 text-white">
                  <i className="bi bi-house-heart me-2 text-warning"></i>
                  ข้อมูลครอบครัว
                </h5>
              </div>
              <div className="p-3">
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">สถานภาพบิดา-มารดา</label>
                  <p>{parent_status}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">พักอาศัยกับใคร</label>
                  <p>{living_with}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">ลักษณะที่อยู่อาศัย</label>
                  <p>{housing_type}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">การเดินทางมาเรียน</label>
                  <p>{transportation}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="border bg-white">
              <div className="p-3 border-bottom bg-dark">
                <h5 className="text-uppercase fw-semibold m-0 text-white">
                  <i className="bi bi-cash-stack me-2 text-warning"></i>
                  ข้อมูลเศรษฐกิจ
                </h5>
              </div>
              <div className="p-3">
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">รายได้ครอบครัว/เดือน</label>
                  <p>{family_income}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">เงินที่ได้รับมาโรงเรียน/วัน</label>
                  <p>{daily_allowance}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">ความต้องการช่วยเหลือ</label>
                  <p>{assistance_needs}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* END: Family Information Card */}

        {/* START: Health and Risk Card */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="border bg-white">
              <div className="p-3 border-bottom bg-dark">
                <h5 className="text-uppercase fw-semibold m-0 text-white">
                  <i className="bi bi-heart-pulse me-2 text-warning"></i>
                  ข้อมูลสุขภาพ/ปัจจัยเสี่ยง
                </h5>
              </div>
              <div className="p-3">
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">โรคประจำตัว</label>
                  <p>{chronic_disease}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">แพ้อาหาร/ยา</label>
                  <p>{allergies}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">พฤติกรรมเสี่ยง</label>
                  <p>{risk_behaviors}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="border bg-white h-100">
              <div className="p-3 border-bottom bg-dark">
                <h5 className="text-uppercase fw-semibold m-0 text-white">
                  <i className="bi bi-journal-bookmark-fill me-2 text-warning"></i>
                  ข้อมูลการเรียน/พฤติกรรม
                </h5>
              </div>
              <div className="p-3 text-center text-muted py-5">
                 <p>กำลังเตรียมข้อมูลส่วนที่เหลือ...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}