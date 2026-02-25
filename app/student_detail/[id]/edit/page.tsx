"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface StudentData {
  _id: string;
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  nickname: string;
  gender: string;
  birth_date: string;
  level: string;
  class_group: string;
  class_number: string;  // ✅ เพิ่มเลขที่
  advisor_name: string;
  phone_number: string;
  religion: string;
  address: string;
  weight: string;
  height: string;
  blood_type: string;
  bmi?: string;
  status?: string;
}

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentDocId = params?.id as string;
  
  console.log("📝 Student _id from params:", studentDocId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentData>({
    _id: studentDocId || "",
    id: "",
    prefix: "",
    first_name: "",
    last_name: "",
    nickname: "",
    gender: "",
    birth_date: "",
    level: "",
    class_group: "",
    class_number: "",  // ✅ เพิ่มเลขที่
    advisor_name: "",
    phone_number: "",
    religion: "",
    address: "",
    weight: "",
    height: "",
    blood_type: "",
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

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentDocId) {
        setError("ไม่พบรหัสนักศึกษา");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log("🔍 Fetching student for edit with _id:", studentDocId);
        
        const response = await fetch("/api/student");
        const result = await response.json();
        
        let studentsData = [];
        if (result.success && Array.isArray(result.data)) {
          studentsData = result.data;
        }
        
        const foundStudent = studentsData.find((s: any) => s._id === studentDocId);
        
        if (foundStudent) {
          setStudentData({
            _id: foundStudent._id,
            id: foundStudent.id || "",
            prefix: foundStudent.prefix || "",
            first_name: foundStudent.first_name || "",
            last_name: foundStudent.last_name || "",
            nickname: foundStudent.nickname || "",
            gender: foundStudent.gender || "",
            birth_date: foundStudent.birth_date || "",
            level: foundStudent.level || "",
            class_group: foundStudent.class_group || "",
            class_number: foundStudent.class_number || "",  // ✅ เพิ่มเลขที่
            advisor_name: foundStudent.advisor_name || "",
            phone_number: foundStudent.phone_number || "",
            religion: foundStudent.religion || "",
            address: foundStudent.address || "",
            weight: foundStudent.weight || "",
            height: foundStudent.height || "",
            blood_type: foundStudent.blood_type || "",
          });
        } else {
          setError("ไม่พบข้อมูลนักเรียน");
        }
      } catch (error) {
        console.error("Error:", error);
        setError("เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentDocId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStudentData(prev => ({ ...prev, [name]: value }));
  };

  const calculateBMI = () => {
    if (studentData.weight && studentData.height) {
      const weight = parseFloat(studentData.weight);
      const height = parseFloat(studentData.height) / 100;
      if (weight > 0 && height > 0) {
        return (weight / Math.pow(height, 2)).toFixed(1);
      }
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const bmiValue = calculateBMI();
      
      const originalStudentId = studentData.id;
      const newStudentId = (e.target as any).id.value;
      const idChanged = originalStudentId !== newStudentId;
      
      if (idChanged) {
        const checkResponse = await fetch("/api/student");
        const checkResult = await checkResponse.json();
        
        let studentsData = [];
        if (checkResult.success && Array.isArray(checkResult.data)) {
          studentsData = checkResult.data;
        }
        
        const existingStudent = studentsData.find((s: any) => 
          s.id === newStudentId && s._id !== studentDocId
        );
        
        if (existingStudent) {
          alert("รหัสนักศึกษานี้มีอยู่ในระบบแล้ว");
          setSaving(false);
          return;
        }
      }

      const formData = new FormData();
      Object.entries(studentData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      formData.append("bmi", bmiValue);
      formData.append("status", "ปกติ");

      console.log("📤 Updating with _id:", studentDocId);

      const response = await fetch(`/api/student/${studentDocId}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push(`/student_detail/${studentDocId}`);
      } else {
        alert(result.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาด");
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

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="alert alert-danger">
          <p>{error}</p>
          <Link href="/student" className="btn btn-dark">
            <i className="bi bi-arrow-left me-2"></i>กลับไปหน้ารายชื่อ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-2 border-warning">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-uppercase" href="/student">
            <i className="bi bi-mortarboard-fill me-2 text-warning"></i>
            <span className="text-warning">ระบบดูแลผู้เรียนรายบุคคล</span>
          </a>
          <div className="ms-3">
            <span className="badge bg-warning text-dark rounded-0 p-2">แก้ไขข้อมูล: {studentData.id}</span>
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

      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-pencil-square me-2 text-warning"></i>
                แก้ไขข้อมูล: {studentData.first_name} {studentData.last_name}
              </h2>
              <div>
                <Link 
                  href={`/student_detail/${studentDocId}`}
                  className="btn btn-outline-dark rounded-0 text-uppercase fw-semibold me-2"
                >
                  <i className="bi bi-arrow-left me-2"></i>กลับ
                </Link>
              </div>
            </div>
          </div>
        </div>

        <form id="editForm" onSubmit={handleSubmit}>
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
                      <label className="form-label text-uppercase fw-semibold small">
                        รหัสนักศึกษา <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="id"
                        className="form-control rounded-0" 
                        value={studentData.id}
                        onChange={handleInputChange}
                        placeholder="เช่น 66001"
                        required
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
                        <option value="">เลือกคำนำหน้า</option>
                        <option value="นาย">นาย</option>
                        <option value="นางสาว">นางสาว</option>
                        <option value="นาง">นาง</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">ชื่อ</label>
                      <input 
                        type="text" 
                        name="first_name"
                        className="form-control rounded-0"
                        value={studentData.first_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label text-uppercase fw-semibold small">นามสกุล</label>
                      <input 
                        type="text" 
                        name="last_name"
                        className="form-control rounded-0"
                        value={studentData.last_name}
                        onChange={handleInputChange}
                        required
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
                        <option value="">เลือกเพศ</option>
                        <option value="ชาย">ชาย</option>
                        <option value="หญิง">หญิง</option>
                        <option value="ไม่ระบุ">ไม่ระบุ</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">วันเกิด</label>
                      <input 
                        type="date" 
                        name="birth_date"
                        className="form-control rounded-0"
                        value={studentData.birth_date}
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
                        <option value="">เลือกระดับชั้น</option>
                        <option value="ปวช.1">ปวช.1</option>
                        <option value="ปวช.2">ปวช.2</option>
                        <option value="ปวช.3">ปวช.3</option>
                        <option value="ปวส.1">ปวส.1</option>
                        <option value="ปวส.2">ปวส.2</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">กลุ่มเรียน</label>
                      <input 
                        type="text" 
                        name="class_group"
                        className="form-control rounded-0"
                        value={studentData.class_group}
                        onChange={handleInputChange}
                        placeholder="เช่น ชฟ.1"
                      />
                    </div>

                    {/* ✅ เลขที่ - เพิ่มใหม่ */}
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">เลขที่</label>
                      <input 
                        type="text" 
                        name="class_number"
                        className="form-control rounded-0"
                        value={studentData.class_number}
                        onChange={handleInputChange}
                        placeholder="เช่น 1, 2, 3"
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">ครูที่ปรึกษา</label>
                      <input 
                        type="text" 
                        name="advisor_name"
                        className="form-control rounded-0"
                        value={studentData.advisor_name}
                        onChange={handleInputChange}
                        placeholder="ชื่ออาจารย์ที่ปรึกษา"
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">เบอร์มือถือ</label>
                      <input 
                        type="tel" 
                        name="phone_number"
                        className="form-control rounded-0"
                        value={studentData.phone_number}
                        onChange={handleInputChange}
                        placeholder="081-234-5678"
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
                        <option value="">เลือกศาสนา</option>
                        <option value="พุทธ">พุทธ</option>
                        <option value="อิสลาม">อิสลาม</option>
                        <option value="คริสต์">คริสต์</option>
                        <option value="อื่นๆ">อื่นๆ</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label text-uppercase fw-semibold small">ที่อยู่</label>
                      <textarea 
                        name="address"
                        className="form-control rounded-0" 
                        rows={3}
                        value={studentData.address}
                        onChange={handleInputChange}
                        placeholder="บ้านเลขที่ หมู่ที่ ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">น้ำหนัก (กก.)</label>
                      <input 
                        type="number" 
                        name="weight"
                        className="form-control rounded-0"
                        value={studentData.weight}
                        onChange={handleInputChange}
                        step="0.1"
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">ส่วนสูง (ซม.)</label>
                      <input 
                        type="number" 
                        name="height"
                        className="form-control rounded-0"
                        value={studentData.height}
                        onChange={handleInputChange}
                        step="0.1"
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">BMI</label>
                      <input 
                        type="text" 
                        className="form-control rounded-0 bg-light"
                        value={calculateBMI()}
                        readOnly
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">หมู่เลือด</label>
                      <select 
                        name="blood_type"
                        className="form-select rounded-0"
                        value={studentData.blood_type}
                        onChange={handleInputChange}
                      >
                        <option value="">เลือกหมู่เลือด</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12 text-center">
              <Link 
                href={`/student_detail/${studentDocId}`}
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
                    <span className="spinner-border spinner-border-sm me-2"></span>
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
        </form>
      </div>

      <footer className="bg-dark text-white mt-5 py-3 border-top border-warning">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 text-uppercase small">
              <i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล
            </div>
            <div className="col-md-6 text-end text-uppercase small">
              <span className="me-3">เวอร์ชัน 2.0.0</span>
              <span>แก้ไขข้อมูล</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}