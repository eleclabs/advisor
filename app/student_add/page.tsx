"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BasicInfoFormData {
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  nickname: string;
  gender: string;
  birth_date: string;
  level: string;
  class_group: string;
  class_number: string;  // ✅ เลขที่
  advisor_name: string;
  phone_number: string;
  religion: string;
  address: string;
  weight: string;
  height: string;
  blood_type: string;
}

export default function StudentAddBasicPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<BasicInfoFormData>({
    id: "",
    prefix: "นาย",
    first_name: "",
    last_name: "",
    nickname: "",
    gender: "ชาย",
    birth_date: "",
    level: "ปวช.1",
    class_group: "",
    class_number: "",  // ✅ เลขที่
    advisor_name: "",
    phone_number: "",
    religion: "พุทธ",
    address: "",
    weight: "",
    height: "",
    blood_type: "B",
  });
  const [saving, setSaving] = useState(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateBMI = () => {
    if (formData.weight && formData.height) {
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height) / 100;
      if (weight > 0 && height > 0) {
        return (weight / Math.pow(height, 2)).toFixed(1);
      }
    }
    return "";
  };

  const handleSave = async (e: React.FormEvent, gotoNext: boolean = false) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const bmiValue = calculateBMI();
      
      // ✅ Debug ข้อมูลก่อนส่ง
      console.log("📤 Data to send:", {
        id: formData.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        class_number: formData.class_number,
      });

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, String(value));
          console.log(`📤 Appending ${key}:`, value);
        }
      });
      formDataToSend.append("bmi", bmiValue);

      console.log("📦 FormData entries:");
      for (let pair of formDataToSend.entries()) {
        console.log(`   ${pair[0]}: ${pair[1]}`);
      }

      const response = await fetch("/api/student", {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      console.log("📥 Response:", result);

      if (response.ok && result.success) {
        if (gotoNext) {
          router.push(`/student_add/interview?studentId=${result.data.id}`);
        } else {
          router.push("/student");
        }
      } else {
        alert(result.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Error saving student:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-2 border-warning">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-uppercase" href="/student">
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
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <div>
                <h2 className="text-uppercase fw-bold m-0">
                  <i className="bi bi-plus-circle-fill me-2 text-warning"></i>
                  เพิ่มผู้เรียนใหม่
                </h2>
                <div className="mt-2">
                  <span className="badge bg-primary rounded-0 p-2 me-2">ขั้นตอนที่ 1: ข้อมูลพื้นฐาน</span>
                  <span className="badge bg-secondary rounded-0 p-2">ขั้นตอนที่ 2: บันทึกการสัมภาษณ์</span>
                </div>
              </div>
              <Link href="/student" className="btn btn-outline-dark rounded-0 text-uppercase fw-semibold">
                <i className="bi bi-arrow-left me-2"></i>กลับ
              </Link>
            </div>
          </div>
        </div>

        <form>
          {/* Basic Information Card */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-info-circle me-2 text-warning"></i>
                    ข้อมูลพื้นฐาน <span className="text-warning small ms-2">(กรอกข้อมูลที่จำเป็น)</span>
                  </h5>
                </div>
                <div className="p-4">
                  <div className="row g-3">
                    {/* รหัสนักศึกษา */}
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">รหัสนักศึกษา <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        name="id"
                        className="form-control rounded-0" 
                        value={formData.id}
                        onChange={handleInputChange}
                        placeholder="เช่น 66001"
                        required
                      />
                    </div>

                    {/* คำนำหน้า */}
                    <div className="col-md-2">
                      <label className="form-label text-uppercase fw-semibold small">คำนำหน้า <span className="text-danger">*</span></label>
                      <select 
                        name="prefix"
                        className="form-select rounded-0"
                        value={formData.prefix}
                        onChange={handleInputChange}
                        required
                      >
                        <option>นาย</option>
                        <option>นางสาว</option>
                        <option>นาง</option>
                      </select>
                    </div>

                    {/* ชื่อ */}
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">ชื่อ <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        name="first_name"
                        className="form-control rounded-0"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* นามสกุล */}
                    <div className="col-md-4">
                      <label className="form-label text-uppercase fw-semibold small">นามสกุล <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        name="last_name"
                        className="form-control rounded-0"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* ชื่อเล่น */}
                    <div className="col-md-2">
                      <label className="form-label text-uppercase fw-semibold small">ชื่อเล่น</label>
                      <input 
                        type="text" 
                        name="nickname"
                        className="form-control rounded-0"
                        value={formData.nickname}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* เพศ */}
                    <div className="col-md-2">
                      <label className="form-label text-uppercase fw-semibold small">เพศ</label>
                      <select 
                        name="gender"
                        className="form-select rounded-0"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option>ชาย</option>
                        <option>หญิง</option>
                        <option>ไม่ระบุ</option>
                      </select>
                    </div>

                    {/* วันเกิด */}
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">วันเกิด</label>
                      <input 
                        type="date" 
                        name="birth_date"
                        className="form-control rounded-0"
                        value={formData.birth_date}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* ระดับชั้น */}
                    <div className="col-md-2">
                      <label className="form-label text-uppercase fw-semibold small">ระดับชั้น <span className="text-danger">*</span></label>
                      <select 
                        name="level"
                        className="form-select rounded-0"
                        value={formData.level}
                        onChange={handleInputChange}
                        required
                      >
                        <option>ปวช.1</option>
                        <option>ปวช.2</option>
                        <option>ปวช.3</option>
                        <option>ปวส.1</option>
                        <option>ปวส.2</option>
                      </select>
                    </div>

                    {/* กลุ่มเรียน */}
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">กลุ่มเรียน</label>
                      <input 
                        type="text" 
                        name="class_group"
                        className="form-control rounded-0"
                        value={formData.class_group}
                        onChange={handleInputChange}
                        placeholder="เช่น ชฟ.1"
                      />
                    </div>

                    {/* เลขที่ */}
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">เลขที่</label>
                      <input 
                        type="text" 
                        name="class_number"
                        className="form-control rounded-0"
                        value={formData.class_number}
                        onChange={handleInputChange}
                        placeholder="เช่น 1, 2, 3"
                      />
                    </div>

                    {/* ครูที่ปรึกษา */}
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">ครูที่ปรึกษา</label>
                      <input 
                        type="text" 
                        name="advisor_name"
                        className="form-control rounded-0"
                        value={formData.advisor_name}
                        onChange={handleInputChange}
                        placeholder="ชื่ออาจารย์ที่ปรึกษา"
                      />
                    </div>

                    {/* เบอร์มือถือ */}
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">เบอร์มือถือ</label>
                      <input 
                        type="tel" 
                        name="phone_number"
                        className="form-control rounded-0"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        placeholder="081-234-5678"
                      />
                    </div>

                    {/* ศาสนา */}
                    <div className="col-md-2">
                      <label className="form-label text-uppercase fw-semibold small">ศาสนา</label>
                      <select 
                        name="religion"
                        className="form-select rounded-0"
                        value={formData.religion}
                        onChange={handleInputChange}
                      >
                        <option>พุทธ</option>
                        <option>อิสลาม</option>
                        <option>คริสต์</option>
                        <option>อื่นๆ</option>
                      </select>
                    </div>

                    {/* ที่อยู่ */}
                    <div className="col-12">
                      <label className="form-label text-uppercase fw-semibold small">ที่อยู่</label>
                      <textarea 
                        name="address"
                        className="form-control rounded-0" 
                        rows={3}
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="บ้านเลขที่ หมู่ที่ ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                      />
                    </div>

                    {/* น้ำหนัก */}
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">น้ำหนัก (กก.)</label>
                      <input 
                        type="number" 
                        name="weight"
                        className="form-control rounded-0"
                        value={formData.weight}
                        onChange={handleInputChange}
                        step="0.1"
                      />
                    </div>

                    {/* ส่วนสูง */}
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">ส่วนสูง (ซม.)</label>
                      <input 
                        type="number" 
                        name="height"
                        className="form-control rounded-0"
                        value={formData.height}
                        onChange={handleInputChange}
                        step="0.1"
                      />
                    </div>

                    {/* BMI */}
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">BMI</label>
                      <input 
                        type="text" 
                        className="form-control rounded-0 bg-light"
                        value={calculateBMI()}
                        readOnly
                      />
                    </div>

                    {/* หมู่เลือด */}
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">หมู่เลือด</label>
                      <select 
                        name="blood_type"
                        className="form-select rounded-0"
                        value={formData.blood_type}
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
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="row mb-4">
            <div className="col-12 d-flex justify-content-center gap-3">
              <Link
                href="/student"
                className="btn btn-secondary rounded-0 text-uppercase fw-semibold px-5"
              >
                <i className="bi bi-x-circle me-2"></i>ยกเลิก
              </Link>
              <button 
                type="button"
                className="btn btn-outline-primary rounded-0 text-uppercase fw-semibold px-5"
                onClick={(e) => handleSave(e, false)}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>บันทึกข้อมูล
                  </>
                )}
              </button>
              <button 
                type="button"
                className="btn btn-warning rounded-0 text-uppercase fw-semibold px-5"
                onClick={(e) => handleSave(e, true)}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    บันทึกและถัดไป <i className="bi bi-arrow-right ms-2"></i>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white mt-5 py-3 border-top border-warning">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 text-uppercase small">
              <i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล
            </div>
            <div className="col-md-6 text-end text-uppercase small">
              <span className="me-3">เวอร์ชัน 2.0.0</span>
              <span>เพิ่มผู้เรียนใหม่</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}