"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface StudentBasic {
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
}

// Mock basic student data (เฉพาะข้อมูลพื้นฐาน)
const mockStudentBasics: { [key: string]: StudentBasic } = {
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
  },
};

export default function StudentBasicPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [student, setStudent] = useState<StudentBasic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    
    // Get student basic data from mock data
    const studentData = mockStudentBasics[studentId];
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
                ข้อมูลพื้นฐาน: {student.name}
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
                  href={`/student_detail/${studentId}/interview`}
                  className="btn btn-primary rounded-0 text-uppercase fw-semibold me-2"
                >
                  <i className="bi bi-journal-text me-2"></i>ดูบันทึกการสัมภาษณ์
                </Link>
                <button className="btn btn-outline-dark rounded-0 text-uppercase fw-semibold">
                  <i className="bi bi-printer me-2"></i>พิมพ์
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

        {/* START: Action Buttons */}
<div className="row mb-4">
  <div className="col-12 d-flex justify-content-end gap-2">
    <Link
      href={`/student_detail/${studentId}/assessment/sdq`}
      className="btn btn-info rounded-0 text-uppercase fw-semibold me-2"
    >
      <i className="bi bi-clipboard-data me-2"></i>SDQ
    </Link>
    <Link
      href={`/student_detail/${studentId}/assessment/dass21`}
      className="btn btn-info rounded-0 text-uppercase fw-semibold me-2"
    >
      <i className="bi bi-clipboard-heart me-2"></i>DASS-21
    </Link>
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