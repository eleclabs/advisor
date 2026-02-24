"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface InterviewData {
  id: string;
  student_id: string;
  student_name: string;
  student_nickname: string;
  student_level: string;
  student_class: string;
  student_number: string;
  
  // ข้อมูลทั่วไป
  semester: string;
  academic_year: string;
  parent_name: string;
  parent_relationship: string;
  parent_phone: string;
  
  // สถานภาพครอบครัว
  family_status: string[];
  living_with: string;
  living_with_other: string;
  housing_type: string;
  housing_type_other: string;
  transportation: string[];
  
  // ด้านการเรียน
  strengths: string;
  weak_subjects: string;
  hobbies: string;
  home_behavior: string;
  
  // ด้านสุขภาพ
  chronic_disease: string;
  risk_behaviors: string[];
  parent_concerns: string;
  
  // ด้านเศรษฐกิจ
  family_income: string;
  daily_allowance: string;
  assistance_needs: string[];
  
  // สรุปความเห็น
  student_group: string;
  help_guidelines: string;
  home_visit_file: string;
  created_at: string;
  updated_at: string;
}

// Mock interview data for viewing
const mockInterviewData: { [key: string]: InterviewData } = {
  "66001": {
    id: "INT001",
    student_id: "66001",
    student_name: "นายสมชาย ใจดี",
    student_nickname: "ชาย",
    student_level: "ปวช.3",
    student_class: "ชฟ.1",
    student_number: "1",
    
    semester: "2",
    academic_year: "2567",
    parent_name: "นายสมศักดิ์ ใจดี",
    parent_relationship: "บิดา",
    parent_phone: "089-765-4321",
    
    family_status: ["อยู่ด้วยกัน"],
    living_with: "บิดา-มารดา",
    living_with_other: "",
    housing_type: "บ้านตนเอง",
    housing_type_other: "",
    transportation: ["รถส่วนตัว"],
    
    strengths: "ชอบวิทยาศาสตร์ คณิตศาสตร์ มีความตั้งใจเรียน",
    weak_subjects: "ภาษาอังกฤษ",
    hobbies: "เล่นฟุตบอล",
    home_behavior: "ช่วยทำงานบ้าน รับผิดชอบตัวเองดี",
    
    chronic_disease: "ไม่มี",
    risk_behaviors: ["ไม่มี"],
    parent_concerns: "อยากให้เรียนต่อระดับสูง",
    
    family_income: "25,000",
    daily_allowance: "120",
    assistance_needs: ["ทุนการศึกษา"],
    
    student_group: "ปกติ",
    help_guidelines: "สนับสนุนให้ศึกษาต่อในสาขาวิชาที่เกี่ยวข้องกับวิทยาศาสตร์",
    home_visit_file: "/uploads/66001_homevisit.pdf",
    created_at: "2024-02-15 10:30:00",
    updated_at: "2024-02-15 10:30:00",
  },
  "66002": {
    id: "INT002",
    student_id: "66002",
    student_name: "นางสาวจิรา สวยใจ",
    student_nickname: "จิรา",
    student_level: "ปวช.3",
    student_class: "ชฟ.2",
    student_number: "15",
    
    semester: "2",
    academic_year: "2567",
    parent_name: "นางสมหญิง สวยใจ",
    parent_relationship: "มารดา",
    parent_phone: "081-234-5678",
    
    family_status: ["บิดา/มารดาเสียชีวิต"],
    living_with: "บุคคลอื่น",
    living_with_other: "ยาย",
    housing_type: "บ้านตนเอง",
    housing_type_other: "",
    transportation: ["รถเมล์/รถสาธารณะ"],
    
    strengths: "ชอบวาดรูป มีความคิดสร้างสรรค์",
    weak_subjects: "วิทยาศาสตร์",
    hobbies: "วาดรูป, ร้องเพลง",
    home_behavior: "ช่วยงานบ้าน ชอบเก็บตัว",
    
    chronic_disease: "ไม่มี",
    allergies: "แพ้นม",
    risk_behaviors: ["ไม่มี"],
    parent_concerns: "ฐานะทางบ้าน不太好 ต้องการทุน",
    
    family_income: "15,000",
    daily_allowance: "80",
    assistance_needs: ["ทุนการศึกษา", "อุปกรณ์การเรียน"],
    
    student_group: "เสี่ยง",
    help_guidelines: "ติดตามด้านการเงิน มอบทุนการศึกษา เยี่ยมบ้านอย่างสม่ำเสมอ",
    home_visit_file: "/uploads/66002_homevisit.pdf",
    created_at: "2024-02-16 14:20:00",
    updated_at: "2024-02-16 14:20:00",
  },
};

export default function InterviewViewPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    
    // Get interview data from mock data
    const interviewData = mockInterviewData[studentId];
    if (interviewData) {
      setInterview(interviewData);
    }
    setLoading(false);
  }, [studentId]);

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

  const getStatusColor = (status: string) => {
    switch(status) {
      case "ปกติ": return "success";
      case "เสี่ยง": return "warning";
      case "มีปัญหา": return "danger";
      default: return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="alert alert-warning mb-0 text-center">
          <i className="bi bi-exclamation-triangle-fill fs-1 d-block mb-3"></i>
          <h5>ไม่พบข้อมูลการสัมภาษณ์</h5>
          <p className="mb-3">ยังไม่มีบันทึกการสัมภาษณ์สำหรับนักเรียนคนนี้</p>
          <Link
            href={`/student_detail/${studentId}/interview/edit`}
            className="btn btn-warning rounded-0 text-uppercase fw-semibold me-2"
          >
            <i className="bi bi-plus-circle me-2"></i>เพิ่มบันทึกการสัมภาษณ์
          </Link>
          <Link
            href={`/student_detail/${studentId}`}
            className="btn btn-dark rounded-0 text-uppercase fw-semibold"
          >
            <i className="bi bi-arrow-left me-2"></i>กลับไปข้อมูลพื้นฐาน
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* START: Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-2 border-warning">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-uppercase" href="/student">
            <i className="bi bi-mortarboard-fill me-2 text-warning"></i>
            <span className="text-warning">ระบบดูแลผู้เรียนรายบุคคล</span>
          </a>
          <div className="ms-3">
            <span className="badge bg-warning text-dark rounded-0 p-2">รหัสนักศึกษา: {studentId}</span>
          </div>
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
              <div>
                <h2 className="text-uppercase fw-bold m-0">
                  <i className="bi bi-journal-text me-2 text-warning"></i>
                  บันทึกการสัมภาษณ์: {interview.student_name}
                </h2>
                <p className="text-muted mb-0 mt-1">
                  <i className="bi bi-clock me-1"></i>บันทึกเมื่อ: {interview.created_at} | แก้ไขล่าสุด: {interview.updated_at}
                </p>
              </div>
              <div>
                <span
                  className={`badge bg-${getStatusColor(interview.student_group)} rounded-0 text-uppercase fw-semibold p-2 me-2`}
                >
                  {interview.student_group}
                </span>
                <Link
                  href={`/student_detail/${studentId}/interview/edit`}
                  className="btn btn-warning rounded-0 text-uppercase fw-semibold me-2"
                >
                  <i className="bi bi-pencil me-2"></i>แก้ไขบันทึก
                </Link>
                <Link
                  href={`/student_detail/${studentId}`}
                  className="btn btn-outline-dark rounded-0 text-uppercase fw-semibold"
                >
                  <i className="bi bi-arrow-left me-2"></i>กลับข้อมูลพื้นฐาน
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* END: Page Header */}

        {/* START: Header Info */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border bg-white p-3">
              <div className="row">
                <div className="col-md-2">
                  <span className="text-uppercase fw-semibold small">ภาคเรียนที่/ปีการศึกษา:</span>
                  <p className="fw-bold mb-0">{interview.semester}/{interview.academic_year}</p>
                </div>
                <div className="col-md-3">
                  <span className="text-uppercase fw-semibold small">ผู้ปกครองที่ให้ข้อมูล:</span>
                  <p className="fw-bold mb-0">{interview.parent_name} ({interview.parent_relationship})</p>
                </div>
                <div className="col-md-2">
                  <span className="text-uppercase fw-semibold small">เบอร์ติดต่อ:</span>
                  <p className="mb-0">{interview.parent_phone}</p>
                </div>
                <div className="col-md-2">
                  <span className="text-uppercase fw-semibold small">ระดับชั้น/กลุ่ม:</span>
                  <p className="mb-0">{interview.student_level}/{interview.student_class}</p>
                </div>
                <div className="col-md-2">
                  <span className="text-uppercase fw-semibold small">เลขที่:</span>
                  <p className="mb-0">{interview.student_number}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* END: Header Info */}

        {/* START: Family Information */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="border bg-white h-100">
              <div className="p-3 border-bottom bg-dark">
                <h5 className="text-uppercase fw-semibold m-0 text-white">
                  <i className="bi bi-house-heart me-2 text-warning"></i>
                  ข้อมูลครอบครัวและการเป็นอยู่
                </h5>
              </div>
              <div className="p-3">
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">สถานภาพบิดา-มารดา</label>
                  <p>{interview.family_status.join(", ")}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">พักอาศัยกับ</label>
                  <p>{interview.living_with} {interview.living_with_other && `(${interview.living_with_other})`}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">ลักษณะที่อยู่อาศัย</label>
                  <p>{interview.housing_type} {interview.housing_type_other && `(${interview.housing_type_other})`}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">การเดินทางมาโรงเรียน</label>
                  <p>{interview.transportation.join(", ")}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="border bg-white h-100">
              <div className="p-3 border-bottom bg-dark">
                <h5 className="text-uppercase fw-semibold m-0 text-white">
                  <i className="bi bi-cash-stack me-2 text-warning"></i>
                  ข้อมูลเศรษฐกิจ
                </h5>
              </div>
              <div className="p-3">
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">รายได้ครอบครัว/เดือน</label>
                  <p>{interview.family_income} บาท</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">เงินมาโรงเรียน/วัน</label>
                  <p>{interview.daily_allowance} บาท</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">ความต้องการช่วยเหลือ</label>
                  <p>{interview.assistance_needs.join(", ")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* END: Family Information */}

        {/* START: Learning and Health */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="border bg-white h-100">
              <div className="p-3 border-bottom bg-dark">
                <h5 className="text-uppercase fw-semibold m-0 text-white">
                  <i className="bi bi-journal-bookmark-fill me-2 text-warning"></i>
                  ด้านการเรียนและพฤติกรรม
                </h5>
              </div>
              <div className="p-3">
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">วิชาที่ชอบ / จุดแข็ง</label>
                  <p>{interview.strengths || "-"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">วิชาที่ไม่ถนัด / ปัญหาการเรียน</label>
                  <p>{interview.weak_subjects || "-"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">งานอดิเรก/ความสนใจพิเศษ</label>
                  <p>{interview.hobbies || "-"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">พฤติกรรมที่บ้าน</label>
                  <p>{interview.home_behavior || "-"}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="border bg-white h-100">
              <div className="p-3 border-bottom bg-dark">
                <h5 className="text-uppercase fw-semibold m-0 text-white">
                  <i className="bi bi-heart-pulse me-2 text-warning"></i>
                  ด้านสุขภาพและปัจจัยเสี่ยง
                </h5>
              </div>
              <div className="p-3">
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">โรคประจำตัว/แพ้อาหาร</label>
                  <p>{interview.chronic_disease || "-"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">พฤติกรรมเสี่ยงที่ควรเฝ้าระวัง</label>
                  <p>{interview.risk_behaviors.join(", ")}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">ความกังวลใจของผู้ปกครอง</label>
                  <p>{interview.parent_concerns || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* END: Learning and Health */}

        {/* START: Teacher Recommendations */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border bg-white">
              <div className="p-3 border-bottom bg-dark">
                <h5 className="text-uppercase fw-semibold m-0 text-white">
                  <i className="bi bi-clipboard-check me-2 text-warning"></i>
                  สรุปความเห็นของครูที่ปรึกษา
                </h5>
              </div>
              <div className="p-3">
                <div className="row g-3">
                  <div className="col-md-2">
                    <label className="form-label text-uppercase fw-semibold small text-muted">กลุ่มนักเรียน</label>
                    <p>
                      <span className={`badge bg-${getStatusColor(interview.student_group)} rounded-0 p-2`}>
                        {interview.student_group}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-10">
                    <label className="form-label text-uppercase fw-semibold small text-muted">แนวทางการช่วยเหลือ/ส่งต่อ</label>
                    <p>{interview.help_guidelines}</p>
                  </div>
                </div>
                {interview.home_visit_file && (
                  <div className="mt-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">แบบเยี่ยมบ้าน</label>
                    <div>
                      <a href={interview.home_visit_file} target="_blank" className="btn btn-sm btn-outline-primary rounded-0">
                        <i className="bi bi-file-earmark-pdf me-2"></i>ดูไฟล์แนบ
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* END: Teacher Recommendations */}
      </div>

      {/* START: Footer */}
      <footer className="bg-dark text-white mt-5 py-3 border-top border-warning">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 text-uppercase small">
              <i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล
            </div>
            <div className="col-md-6 text-end text-uppercase small">
              <span className="me-3">เวอร์ชัน 2.0.0</span>
              <span>ดูบันทึกการสัมภาษณ์: {studentId}</span>
            </div>
          </div>
        </div>
      </footer>
      {/* END: Footer */}
    </div>
  );
}