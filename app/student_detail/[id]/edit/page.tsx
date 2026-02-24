"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface StudentData {
  id: string;
  prefix: string;
  firstName: string;
  lastName: string;
  nickname: string;
  gender: string;
  birthDate: string;
  level: string;
  classGroup: string;
  advisorName: string;
  phone: string;
  religion: string;
  address: string;
  weight: string;
  height: string;
  bloodType: string;
  
  // ครอบครัว
  parentStatus: string;
  livingWith: string;
  housingType: string;
  transportation: string;
  
  // เศรษฐกิจ
  familyIncome: string;
  dailyAllowance: string;
  assistanceNeeds: string;
  
  // สุขภาพ
  chronicDisease: string;
  allergies: string;
  riskBehaviors: string;
  
  // การเรียน
  favoriteSubjects: string;
  weakSubjects: string;
  hobbies: string;
  
  // ความเห็นครู
  studentStatus: string;
  helpGuidelines: string;
}

// Mock detailed student data
const mockStudentDetails: { [key: string]: StudentData } = {
  "66001": {
    id: "66001",
    prefix: "นาย",
    firstName: "สมชาย",
    lastName: "ใจดี",
    nickname: "ชาย",
    gender: "ชาย",
    birthDate: "01/01/2548",
    level: "ปวช.3",
    classGroup: "ชฟ.1",
    advisorName: "อาจารย์วิมลรัตน์",
    phone: "081-234-5678",
    religion: "พุทธ",
    address: "123 ม.1 ต.ในเมือง อ.เมือง จ.ขอนแก่น",
    weight: "65",
    height: "175",
    bloodType: "O",
    parentStatus: "อยู่ด้วยกัน",
    livingWith: "บิดา-มารดา",
    housingType: "บ้านปูนชั้นเดียว",
    transportation: "รถจักรยานยนต์ส่วนตัว",
    familyIncome: "25,000",
    dailyAllowance: "120",
    assistanceNeeds: "ทุนการศึกษา",
    chronicDisease: "ไม่มี",
    allergies: "ไม่มี",
    riskBehaviors: "ไม่มี",
    favoriteSubjects: "วิทยาศาสตร์, คณิตศาสตร์",
    weakSubjects: "ภาษาอังกฤษ",
    hobbies: "เล่นฟุตบอล",
    studentStatus: "ปกติ",
    helpGuidelines: "สนับสนุนให้ศึกษาต่อในสาขาวิชาที่เกี่ยวข้องกับวิทยาศาสตร์",
  },
  "66002": {
    id: "66002",
    prefix: "นางสาว",
    firstName: "จิรา",
    lastName: "สวยใจ",
    nickname: "จิรา",
    gender: "หญิง",
    birthDate: "15/05/2549",
    level: "ปวช.3",
    classGroup: "ชฟ.2",
    advisorName: "อาจารย์วิมลรัตน์",
    phone: "089-876-5432",
    religion: "พุทธ",
    address: "456 ถ.ประชาสำมงค์ อ.เมือง จ.ขอนแก่น",
    weight: "55",
    height: "162",
    bloodType: "A",
    parentStatus: "บิดาเสียชีวิต",
    livingWith: "มารดา",
    housingType: "บ้านไม้",
    transportation: "รถเมล์",
    familyIncome: "15,000",
    dailyAllowance: "80",
    assistanceNeeds: "ทุนการศึกษา, อาหารกลางวัน",
    chronicDisease: "ไม่มี",
    allergies: "แพ้นม",
    riskBehaviors: "ขาด",
    favoriteSubjects: "ศิลปศาสตร์",
    weakSubjects: "วิชาวิทยาศาสตร์",
    hobbies: "วาดรูป, ร้องเพลง",
    studentStatus: "เสี่ยง",
    helpGuidelines: "ติดตามด้านการเงิน มอบทุนการศึกษา เยี่ยมบ้านอย่างสม่ำเสมอ",
  },
  "66003": {
    id: "66003",
    prefix: "นาย",
    firstName: "สมเด็จ",
    lastName: "วิจิตร",
    nickname: "เด็จ",
    gender: "ชาย",
    birthDate: "22/08/2549",
    level: "ปวช.2",
    classGroup: "ชฟ.1",
    advisorName: "อาจารย์วิมลรัตน์",
    phone: "091-234-5678",
    religion: "พุทธ",
    address: "789 ม.3 ต.อีสาน อ.เมือง จ.ขอนแก่น",
    weight: "70",
    height: "180",
    bloodType: "B",
    parentStatus: "อยู่ด้วยกัน",
    livingWith: "บิดา-มารดา",
    housingType: "บ้านปูนสองชั้น",
    transportation: "รถจักรยาน",
    familyIncome: "30,000",
    dailyAllowance: "150",
    assistanceNeeds: "ไม่มี",
    chronicDisease: "เบาหวาน",
    allergies: "ไม่มี",
    riskBehaviors: "ติดเล่นเกม",
    favoriteSubjects: "-",
    weakSubjects: "ทุกวิชา",
    hobbies: "เล่นเกม",
    studentStatus: "มีปัญหา",
    helpGuidelines: "ส่งต่อให้ครูโรงเรียนและจิตวิทยาเพื่อประเมินความเสี่ยง",
  },
  "66004": {
    id: "66004",
    prefix: "นางสาว",
    firstName: "มาศ",
    lastName: "สุขศรี",
    nickname: "น้อย",
    gender: "หญิง",
    birthDate: "10/12/2548",
    level: "ปวช.3",
    classGroup: "ชฟ.3",
    advisorName: "อาจารย์วิมลรัตน์",
    phone: "086-543-2109",
    religion: "พุทธ",
    address: "321 ถ.วิทยาสมบูรณ์ อ.เมือง จ.ขอนแก่น",
    weight: "60",
    height: "165",
    bloodType: "O",
    parentStatus: "อยู่ด้วยกัน",
    livingWith: "บิดา-มารดา",
    housingType: "บ้านปูนชั้นเดียว",
    transportation: "รถจักรยานยนต์",
    familyIncome: "35,000",
    dailyAllowance: "200",
    assistanceNeeds: "ไม่มี",
    chronicDisease: "ไม่มี",
    allergies: "ไม่มี",
    riskBehaviors: "ไม่มี",
    favoriteSubjects: "ภาษาไทย, ศรุปศิลป์",
    weakSubjects: "คณิตศาสตร์",
    hobbies: "เขียนบทความ, อ่านหนังสือ",
    studentStatus: "ปกติ",
    helpGuidelines: "สนับสนุนให้เข้าร่วมกิจกรรมนอกหลักสูตร",
  },
  "66005": {
    id: "66005",
    prefix: "นาย",
    firstName: "กิจ",
    lastName: "ขยันหนุ่ม",
    nickname: "หนุ่ม",
    gender: "ชาย",
    birthDate: "05/03/2549",
    level: "ปวช.2",
    classGroup: "ชฟ.2",
    advisorName: "อาจารย์วิมลรัตน์",
    phone: "084-765-4321",
    religion: "พุทธ",
    address: "654 ม.2 ต.ชุมชน อ.เมือง จ.ขอนแก่น",
    weight: "68",
    height: "178",
    bloodType: "AB",
    parentStatus: "อยู่ด้วยกัน",
    livingWith: "บิดา-มารดา",
    housingType: "บ้านปูนชั้นเดียว",
    transportation: "รถจักรยานยนต์",
    familyIncome: "28,000",
    dailyAllowance: "140",
    assistanceNeeds: "ไม่มี",
    chronicDisease: "ไม่มี",
    allergies: "ไม่มี",
    riskBehaviors: "ไม่มี",
    favoriteSubjects: "เทคโนโลยีสารสนเทศ",
    weakSubjects: "-",
    hobbies: "ซ่อมคอมพิวเตอร์, รหัส",
    studentStatus: "ปกติ",
    helpGuidelines: "สนับสนุนให้ศึกษาต่อในสาขา IT",
  },
};

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studentData, setStudentData] = useState<StudentData>({
    id: studentId,
    prefix: "นาย",
    firstName: "",
    lastName: "",
    nickname: "",
    gender: "ชาย",
    birthDate: "",
    level: "ปวช.3",
    classGroup: "1",
    advisorName: "อาจารย์วิมลรัตน์ ใจดี",
    phone: "",
    religion: "พุทธ",
    address: "",
    weight: "",
    height: "",
    bloodType: "B",
    
    parentStatus: "อยู่ด้วยกัน",
    livingWith: "บิดา มารดา",
    housingType: "บ้านตัวเอง",
    transportation: "รถรับส่ง",
    
    familyIncome: "",
    dailyAllowance: "",
    assistanceNeeds: "",
    
    chronicDisease: "ไม่มี",
    allergies: "ไม่มี",
    riskBehaviors: "ไม่มี",
    
    favoriteSubjects: "",
    weakSubjects: "",
    hobbies: "",
    
    studentStatus: "ปกติ",
    helpGuidelines: "",
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

    // Load student data from mock data
    if (studentId && mockStudentDetails[studentId]) {
      setStudentData(mockStudentDetails[studentId]);
    }
    setLoading(false);
  }, [studentId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStudentData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Note: In a real app, you would send this to an API
      // For now, we'll just redirect back to the detail page
      router.push(`/student_detail/${studentId}`);
    } catch (error) {
      console.error("Error saving student:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
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
            <span className="badge bg-warning text-dark rounded-0 p-2">แก้ไขข้อมูล: {studentId}</span>
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
                <i className="bi bi-pencil-square me-2 text-warning"></i>
                แก้ไขข้อมูลผู้เรียน: {studentId}
              </h2>
              <div>
                <Link 
                  href={`/student_detail/${studentId}`}
                  className="btn btn-outline-dark rounded-0 text-uppercase fw-semibold me-2"
                >
                  <i className="bi bi-arrow-left me-2"></i>กลับหน้ารายละเอียด
                </Link>
                <button 
                  type="submit" 
                  form="editForm"
                  className="btn btn-warning rounded-0 text-uppercase fw-semibold"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save me-2"></i>บันทึกข้อมูล
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* END: Page Header */}

        <form id="editForm" onSubmit={handleSubmit}>
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
                    <div className="col-md-2">
                      <label className="form-label text-uppercase fw-semibold small">รหัสนักศึกษา</label>
                      <input 
                        type="text" 
                        className="form-control rounded-0 bg-light" 
                        value={studentData.id}
                        readOnly
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label text-uppercase fw-semibold small">คำนำหน้า</label>
                      <select 
                        name="prefix"
                        className="form-select rounded-0"
                        value={studentData.prefix}
                        onChange={handleInputChange}
                      >
                        <option>นาย</option>
                        <option>นางสาว</option>
                        <option>นาง</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">ชื่อ</label>
                      <input 
                        type="text" 
                        name="firstName"
                        className="form-control rounded-0"
                        value={studentData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">นามสกุล</label>
                      <input 
                        type="text" 
                        name="lastName"
                        className="form-control rounded-0"
                        value={studentData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label text-uppercase fw-semibold small">ชื่อเล่น</label>
                      <input 
                        type="text" 
                        name="nickname"
                        className="form-control rounded-0"
                        value={studentData.nickname}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label text-uppercase fw-semibold small">เพศ</label>
                      <select 
                        name="gender"
                        className="form-select rounded-0"
                        value={studentData.gender}
                        onChange={handleInputChange}
                      >
                        <option>ชาย</option>
                        <option>หญิง</option>
                        <option>ไม่ระบุ</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label text-uppercase fw-semibold small">วันเกิด</label>
                      <input 
                        type="date" 
                        name="birthDate"
                        className="form-control rounded-0"
                        value={studentData.birthDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label text-uppercase fw-semibold small">ระดับชั้น</label>
                      <select 
                        name="level"
                        className="form-select rounded-0"
                        value={studentData.level}
                        onChange={handleInputChange}
                      >
                        <option>ปวช.1</option>
                        <option>ปวช.2</option>
                        <option>ปวช.3</option>
                        <option>ปวส.1</option>
                        <option>ปวส.2</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label text-uppercase fw-semibold small">กลุ่มเรียน</label>
                      <input 
                        type="text" 
                        name="classGroup"
                        className="form-control rounded-0"
                        value={studentData.classGroup}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">ครูที่ปรึกษา</label>
                      <select 
                        name="advisorName"
                        className="form-select rounded-0"
                        value={studentData.advisorName}
                        onChange={handleInputChange}
                      >
                        <option>อาจารย์วิมลรัตน์ ใจดี</option>
                        <option>อาจารย์สมศักดิ์ รู้แจ้ง</option>
                        <option>อาจารย์วิชัย นักพัฒนา</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">เบอร์โทรศัพท์</label>
                      <input 
                        type="tel" 
                        name="phone"
                        className="form-control rounded-0"
                        value={studentData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label text-uppercase fw-semibold small">ศาสนา</label>
                      <select 
                        name="religion"
                        className="form-select rounded-0"
                        value={studentData.religion}
                        onChange={handleInputChange}
                      >
                        <option>พุทธ</option>
                        <option>อิสลาม</option>
                        <option>คริสต์</option>
                        <option>อื่นๆ</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-uppercase fw-semibold small">ที่อยู่</label>
                      <textarea 
                        name="address"
                        className="form-control rounded-0" 
                        rows={2}
                        value={studentData.address}
                        onChange={handleInputChange}
                      ></textarea>
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
                <label className="form-label text-uppercase fw-semibold small">น้ำหนัก (กก.)</label>
                <input 
                  type="number" 
                  name="weight"
                  className="form-control rounded-0"
                  value={studentData.weight}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <label className="form-label text-uppercase fw-semibold small">ส่วนสูง (ซม.)</label>
                <input 
                  type="number" 
                  name="height"
                  className="form-control rounded-0"
                  value={studentData.height}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <label className="form-label text-uppercase fw-semibold small">BMI</label>
                <input 
                  type="text" 
                  className="form-control rounded-0 bg-light"
                  value={studentData.weight && studentData.height ? 
                    (parseFloat(studentData.weight) / Math.pow(parseFloat(studentData.height)/100, 2)).toFixed(1) 
                    : ''}
                  readOnly
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <label className="form-label text-uppercase fw-semibold small">หมู่เลือด</label>
                <select 
                  name="bloodType"
                  className="form-select rounded-0"
                  value={studentData.bloodType}
                  onChange={handleInputChange}
                >
                  <option>A</option>
                  <option>B</option>
                  <option>AB</option>
                  <option>O</option>
                </select>
              </div>
            </div>
          </div>
          {/* END: Physical Information Row */}

          {/* START: Family Information Row */}
          <div className="row g-3 mb-4">
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
                    <label className="form-label text-uppercase fw-semibold small">สถานภาพบิดา-มารดา</label>
                    <input 
                      type="text" 
                      name="parentStatus"
                      className="form-control rounded-0"
                      value={studentData.parentStatus}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">พักอาศัยกับใคร</label>
                    <input 
                      type="text" 
                      name="livingWith"
                      className="form-control rounded-0"
                      value={studentData.livingWith}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">ลักษณะที่อยู่อาศัย</label>
                    <input 
                      type="text" 
                      name="housingType"
                      className="form-control rounded-0"
                      value={studentData.housingType}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">การเดินทางมาเรียน</label>
                    <input 
                      type="text" 
                      name="transportation"
                      className="form-control rounded-0"
                      value={studentData.transportation}
                      onChange={handleInputChange}
                    />
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
                    <label className="form-label text-uppercase fw-semibold small">รายได้ครอบครัว/เดือน</label>
                    <input 
                      type="text" 
                      name="familyIncome"
                      className="form-control rounded-0"
                      value={studentData.familyIncome}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">เงินที่ได้รับมาโรงเรียน/วัน</label>
                    <input 
                      type="text" 
                      name="dailyAllowance"
                      className="form-control rounded-0"
                      value={studentData.dailyAllowance}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">ความต้องการช่วยเหลือ</label>
                    <textarea 
                      name="assistanceNeeds"
                      className="form-control rounded-0" 
                      rows={3}
                      value={studentData.assistanceNeeds}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* END: Family Information Row */}

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
                    <label className="form-label text-uppercase fw-semibold small">โรคประจำตัว</label>
                    <input 
                      type="text" 
                      name="chronicDisease"
                      className="form-control rounded-0"
                      value={studentData.chronicDisease}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">แพ้อาหาร/ยา</label>
                    <input 
                      type="text" 
                      name="allergies"
                      className="form-control rounded-0"
                      value={studentData.allergies}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">พฤติกรรมเสี่ยง</label>
                    <textarea 
                      name="riskBehaviors"
                      className="form-control rounded-0" 
                      rows={3}
                      value={studentData.riskBehaviors}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-journal-bookmark-fill me-2 text-warning"></i>
                    ข้อมูลการเรียน/พฤติกรรม
                  </h5>
                </div>
                <div className="p-3">
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">วิชาที่ชอบ/ถนัด</label>
                    <input 
                      type="text" 
                      name="favoriteSubjects"
                      className="form-control rounded-0"
                      value={studentData.favoriteSubjects}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">วิชาที่ไม่ถนัด</label>
                    <input 
                      type="text" 
                      name="weakSubjects"
                      className="form-control rounded-0"
                      value={studentData.weakSubjects}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">งานอดิเรก</label>
                    <input 
                      type="text" 
                      name="hobbies"
                      className="form-control rounded-0"
                      value={studentData.hobbies}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* END: Health and Risk Card */}

          {/* START: Advisor Comment Card */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-chat-dots me-2 text-warning"></i>
                    ความเห็นครูที่ปรึกษา
                  </h5>
                </div>
                <div className="p-3">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label text-uppercase fw-semibold small">กลุ่มนักเรียน</label>
                      <select 
                        name="studentStatus"
                        className="form-select rounded-0"
                        value={studentData.studentStatus}
                        onChange={handleInputChange}
                      >
                        <option value="ปกติ">ปกติ</option>
                        <option value="เสี่ยง">เสี่ยง</option>
                        <option value="มีปัญหา">มีปัญหา</option>
                      </select>
                    </div>
                    <div className="col-md-8">
                      <label className="form-label text-uppercase fw-semibold small">แนวทางการช่วยเหลือ/ส่งต่อ</label>
                      <textarea 
                        name="helpGuidelines"
                        className="form-control rounded-0" 
                        rows={3}
                        value={studentData.helpGuidelines}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* END: Advisor Comment Card */}

          {/* START: Form Actions */}
          <div className="row mb-4">
            <div className="col-12 text-center">
              <Link 
                href={`/student_detail/${studentId}`}
                className="btn btn-secondary rounded-0 text-uppercase fw-semibold me-3 px-5"
              >
                <i className="bi bi-x-circle me-2"></i>ยกเลิก
              </Link>
              <button 
                type="submit" 
                className="btn btn-warning rounded-0 text-uppercase fw-semibold px-5"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>บันทึกข้อมูล
                  </>
                )}
              </button>
            </div>
          </div>
          {/* END: Form Actions */}
        </form>
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
              <span>กำลังแก้ไข: {studentId}</span>
            </div>
          </div>
        </div>
      </footer>
      {/* END: Footer */}

      {/* Bootstrap JS Bundle */}
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    </div>
  );
}