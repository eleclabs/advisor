"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface StudentDetail {
  id: string;
  name: string;
  status: string;
  nickname: string;
  gender: string;
  birth_date: string;
  level: string;
  class_group: string;
  advisor_name: string;
  phone_number: string;
  religion: string;
  address: string;
  weight: string;
  height: string;
  bmi: string;
  blood_type: string;
  parent_status: string;
  living_with: string;
  housing_type: string;
  transportation: string;
  family_income: string;
  daily_allowance: string;
  assistance_needs: string;
  chronic_disease: string;
  allergies: string;
  risk_behaviors: string;
  favorite_subjects: string;
  weak_subjects: string;
  hobbies: string;
  help_guidelines: string;
}

// Mock detailed student data
const mockStudentDetails: { [key: string]: StudentDetail } = {
  "66001": {
    id: "66001",
    name: "นายสมชาย ใจดี",
    status: "ปกติ",
    nickname: "ชาย",
    gender: "ชาย",
    birth_date: "01/01/2548",
    level: "ปวช.3",
    class_group: "ชฟ.1",
    advisor_name: "อาจารย์วิมลรัตน์",
    phone_number: "081-234-5678",
    religion: "พุทธ",
    address: "123 ม.1 ต.ในเมือง อ.เมือง จ.ขอนแก่น",
    weight: "65",
    height: "175",
    bmi: "21.2",
    blood_type: "O",
    parent_status: "อยู่ด้วยกัน",
    living_with: "บิดา-มารดา",
    housing_type: "บ้านปูนชั้นเดียว",
    transportation: "รถจักรยานยนต์ส่วนตัว",
    family_income: "25,000",
    daily_allowance: "120",
    assistance_needs: "ทุนการศึกษา",
    chronic_disease: "ไม่มี",
    allergies: "ไม่มี",
    risk_behaviors: "ไม่มี",
    favorite_subjects: "วิทยาศาสตร์, คณิตศาสตร์",
    weak_subjects: "ภาษาอังกฤษ",
    hobbies: "เล่นฟุตบอล",
    help_guidelines: "สนับสนุนให้ศึกษาต่อในสาขาวิชาที่เกี่ยวข้องกับวิทยาศาสตร์",
  },
  "66002": {
    id: "66002",
    name: "นางสาวจิรา สวยใจ",
    status: "เสี่ยง",
    nickname: "จิรา",
    gender: "หญิง",
    birth_date: "15/05/2549",
    level: "ปวช.3",
    class_group: "ชฟ.2",
    advisor_name: "อาจารย์วิมลรัตน์",
    phone_number: "089-876-5432",
    religion: "พุทธ",
    address: "456 ถ.ประชาสำมงค์ อ.เมือง จ.ขอนแก่น",
    weight: "55",
    height: "162",
    bmi: "20.9",
    blood_type: "A",
    parent_status: "บิดาเสียชีวิต",
    living_with: "มารดา",
    housing_type: "บ้านไม้",
    transportation: "รถเมล์",
    family_income: "15,000",
    daily_allowance: "80",
    assistance_needs: "ทุนการศึกษา, อาหารกลางวัน",
    chronic_disease: "ไม่มี",
    allergies: "แพ้นม",
    risk_behaviors: "ขาด",
    favorite_subjects: "ศิลปศาสตร์",
    weak_subjects: "วิชาวิทยาศาสตร์",
    hobbies: "วาดรูป, ร้องเพลง",
    help_guidelines: "ติดตามด้านการเงิน มอบทุนการศึกษา เยี่ยมบ้านอย่างสม่ำเสมอ",
  },
  "66003": {
    id: "66003",
    name: "นายสมเด็จ วิจิตร",
    status: "มีปัญหา",
    nickname: "เด็จ",
    gender: "ชาย",
    birth_date: "22/08/2549",
    level: "ปวช.2",
    class_group: "ชฟ.1",
    advisor_name: "อาจารย์วิมลรัตน์",
    phone_number: "091-234-5678",
    religion: "พุทธ",
    address: "789 ม.3 ต.อีสาน อ.เมือง จ.ขอนแก่น",
    weight: "70",
    height: "180",
    bmi: "21.6",
    blood_type: "B",
    parent_status: "อยู่ด้วยกัน",
    living_with: "บิดา-มารดา",
    housing_type: "บ้านปูนสองชั้น",
    transportation: "รถจักรยาน",
    family_income: "30,000",
    daily_allowance: "150",
    assistance_needs: "ไม่มี",
    chronic_disease: "เบาหวาน",
    allergies: "ไม่มี",
    risk_behaviors: "ติดเล่นเกม",
    favorite_subjects: "-",
    weak_subjects: "ทุกวิชา",
    hobbies: "เล่นเกม",
    help_guidelines: "ส่งต่อให้ครูโรงเรียนและจิตวิทยาเพื่อประเมินความเสี่ยง",
  },
  "66004": {
    id: "66004",
    name: "นางสาวมาศ สุขศรี",
    status: "ปกติ",
    nickname: "น้อย",
    gender: "หญิง",
    birth_date: "10/12/2548",
    level: "ปวช.3",
    class_group: "ชฟ.3",
    advisor_name: "อาจารย์วิมลรัตน์",
    phone_number: "086-543-2109",
    religion: "พุทธ",
    address: "321 ถ.วิทยาสมบูรณ์ อ.เมือง จ.ขอนแก่น",
    weight: "60",
    height: "165",
    bmi: "22.0",
    blood_type: "O",
    parent_status: "อยู่ด้วยกัน",
    living_with: "บิดา-มารดา",
    housing_type: "บ้านปูนชั้นเดียว",
    transportation: "รถจักรยานยนต์",
    family_income: "35,000",
    daily_allowance: "200",
    assistance_needs: "ไม่มี",
    chronic_disease: "ไม่มี",
    allergies: "ไม่มี",
    risk_behaviors: "ไม่มี",
    favorite_subjects: "ภาษาไทย, ศรุปศิลป์",
    weak_subjects: "คณิตศาสตร์",
    hobbies: "เขียนบทความ, อ่านหนังสือ",
    help_guidelines: "สนับสนุนให้เข้าร่วมกิจกรรมนอกหลักสูตร",
  },
  "66005": {
    id: "66005",
    name: "นายกิจ ขยันหนุ่ม",
    status: "ปกติ",
    nickname: "หนุ่ม",
    gender: "ชาย",
    birth_date: "05/03/2549",
    level: "ปวช.2",
    class_group: "ชฟ.2",
    advisor_name: "อาจารย์วิมลรัตน์",
    phone_number: "084-765-4321",
    religion: "พุทธ",
    address: "654 ม.2 ต.ชุมชน อ.เมือง จ.ขอนแก่น",
    weight: "68",
    height: "178",
    bmi: "21.5",
    blood_type: "AB",
    parent_status: "อยู่ด้วยกัน",
    living_with: "บิดา-มารดา",
    housing_type: "บ้านปูนชั้นเดียว",
    transportation: "รถจักรยานยนต์",
    family_income: "28,000",
    daily_allowance: "140",
    assistance_needs: "ไม่มี",
    chronic_disease: "ไม่มี",
    allergies: "ไม่มี",
    risk_behaviors: "ไม่มี",
    favorite_subjects: "เทคโนโลยีสารสนเทศ",
    weak_subjects: "-",
    hobbies: "ซ่อมคอมพิวเตอร์, รหัส",
    help_guidelines: "สนับสนุนให้ศึกษาต่อในสาขา IT",
  },
};

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    
    // Get student data from mock data
    const studentData = mockStudentDetails[studentId];
    if (studentData) {
      setStudent(studentData);
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="alert alert-danger mb-0">
          <p className="mb-0">ไม่พบข้อมูลนักเรียน</p>
          <a href="/student" className="btn btn-sm btn-dark mt-3">
            <i className="bi bi-arrow-left me-2"></i>กลับไป
          </a>
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
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-person-badge me-2 text-warning"></i>
                ข้อมูลผู้เรียน: {student.name}
              </h2>
              <div>
                <span
                  className={`badge rounded-0 text-uppercase fw-semibold p-2 me-2 ${
                    student.status === "ปกติ"
                      ? "bg-success"
                      : student.status === "เสี่ยง"
                      ? "bg-warning text-dark"
                      : "bg-danger"
                  }`}
                >
                  สถานะ: {student.status}
                </span>
                <Link
                  href={`/student_detail/${studentId}/edit`}
                  className="btn btn-warning rounded-0 text-uppercase fw-semibold me-2"
                >
                  <i className="bi bi-pencil me-2"></i>แก้ไขข้อมูล
                </Link>
                <button className="btn btn-outline-dark rounded-0 text-uppercase fw-semibold">
                  <i className="bi bi-printer me-2"></i>พิมพ์โปรไฟล์
                </button>
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
                    <p className="fw-bold">{student.id}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ชื่อ-นามสกุล</label>
                    <p className="fw-bold">{student.name}</p>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ชื่อเล่น</label>
                    <p>{student.nickname}</p>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label text-uppercase fw-semibold small text-muted">เพศ</label>
                    <p>{student.gender}</p>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label text-uppercase fw-semibold small text-muted">วันเกิด</label>
                    <p>{student.birth_date}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ระดับชั้น/กลุ่ม</label>
                    <p>{student.level}/{student.class_group}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ครูที่ปรึกษา</label>
                    <p>{student.advisor_name}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">เบอร์โทรศัพท์</label>
                    <p>{student.phone_number}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ศาสนา</label>
                    <p>{student.religion}</p>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ที่อยู่</label>
                    <p>{student.address}</p>
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
              <p className="fw-bold h3">{student.weight} กก.</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="border bg-white p-3">
              <label className="form-label text-uppercase fw-semibold small text-muted">ส่วนสูง</label>
              <p className="fw-bold h3">{student.height} ซม.</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="border bg-white p-3">
              <label className="form-label text-uppercase fw-semibold small text-muted">BMI</label>
              <p className="fw-bold h3">{student.bmi}</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="border bg-white p-3">
              <label className="form-label text-uppercase fw-semibold small text-muted">หมู่เลือด</label>
              <p className="fw-bold h3">{student.blood_type}</p>
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
                  <p>{student.parent_status}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">พักอาศัยกับใคร</label>
                  <p>{student.living_with}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">ลักษณะที่อยู่อาศัย</label>
                  <p>{student.housing_type}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">การเดินทางมาเรียน</label>
                  <p>{student.transportation}</p>
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
                  <p>{student.family_income}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">เงินที่ได้รับมาโรงเรียน/วัน</label>
                  <p>{student.daily_allowance}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">ความต้องการช่วยเหลือ</label>
                  <p>{student.assistance_needs}</p>
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
                  <p>{student.chronic_disease}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">แพ้อาหาร/ยา</label>
                  <p>{student.allergies}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">พฤติกรรมเสี่ยง</label>
                  <p>{student.risk_behaviors}</p>
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
              <div className="p-3">
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">วิชาที่ชอบ/จุดแข็ง</label>
                  <p>{student.favorite_subjects || "-"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">วิชาที่ไม่ถนัด/ปัญหา</label>
                  <p>{student.weak_subjects || "-"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">งานอดิเรก/ความสนใจพิเศษ</label>
                  <p>{student.hobbies || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* END: Health and Risk Card */}

        {/* START: Teacher Recommendations Card */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border bg-white">
              <div className="p-3 border-bottom bg-dark">
                <h5 className="text-uppercase fw-semibold m-0 text-white">
                  <i className="bi bi-clipboard-check me-2 text-warning"></i>
                  ความเห็นครูที่ปรึกษา
                </h5>
              </div>
              <div className="p-3">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">กลุ่มนักเรียน</label>
                    <p>
                      <span className={`badge rounded-0 text-uppercase fw-semibold ${
                        student.status === "ปกติ" ? "bg-success" :
                        student.status === "เสี่ยง" ? "bg-warning text-dark" :
                        "bg-danger"
                      }`}>
                        {student.status}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-9">
                    <label className="form-label text-uppercase fw-semibold small text-muted">แนวทางการช่วยเหลือ/ส่งต่อ</label>
                    <p>{student.help_guidelines || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* END: Teacher Recommendations Card */}

        {/* START: Action Buttons */}
<div className="row mb-4">
  <div className="col-12 d-flex justify-content-end gap-2">
    <Link
      href={`/student_detail/${studentId}/interview`}
      className="btn btn-primary rounded-0 text-uppercase fw-semibold me-2"
    >
      <i className="bi bi-journal-text me-2"></i>บันทึกการสัมภาษณ์
    </Link>
    <Link
      href={`/student_detail/${studentId}/edit`}
      className="btn btn-warning rounded-0 text-uppercase fw-semibold me-2"
    >
      <i className="bi bi-pencil me-2"></i>แก้ไขข้อมูล
    </Link>
    <Link
      href="/student"
      className="btn btn-dark rounded-0 text-uppercase fw-semibold"
    >
      <i className="bi bi-arrow-left me-2"></i>กลับไป
    </Link>
  </div>
</div>
{/* END: Action Buttons */}
      </div>

      {/* START: Footer */}
      <footer className="bg-dark text-white mt-5 py-3 border-top border-warning">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 text-uppercase small">
              <i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล
            </div>
            <div className="col-md-6 text-end text-uppercase small">
              <span className="me-3">เวอร์ชัน 1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
