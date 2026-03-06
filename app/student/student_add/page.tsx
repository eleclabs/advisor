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
  class_number: string;  // 
  advisor_name: string;
  phone_number: string;
  religion: string;
  address: string;
  weight: string;
  height: string;
  blood_type: string;
  image: string;
}

interface Major {
  _id: string;
  major_id: number;
  major_name: string;
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
    class_number: "1",  // 
    advisor_name: "",
    phone_number: "",
    religion: "พุทธ",
    address: "",
    weight: "",
    height: "",
    blood_type: "B",
    image: "",
  });
  const [majors, setMajors] = useState<Major[]>([]);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    fetchMajors();
  }, []);

  const fetchMajors = async () => {
    try {
      const response = await fetch("/api/major");
      if (response.ok) {
        const data = await response.json();
        setMajors(data);
      }
    } catch (error) {
      console.error("Error fetching majors:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  const handleSave = async (e: React.FormEvent) => {
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
        if (key !== 'image' && value !== undefined && value !== null) {
          formDataToSend.append(key, String(value));
          console.log(`📤 Appending ${key}:`, value);
        }
      });
      formDataToSend.append("bmi", bmiValue);

      // เพิ่มรูปภาพถ้ามี
      if (profileImage) {
        formDataToSend.append("profileImage", profileImage);
        console.log("📤 Appending profileImage:", profileImage.name);
      }

      console.log("📦 FormData entries:");
      for (let pair of formDataToSend.entries()) {
        console.log(`   ${pair[0]}: ${pair[1]}`);
      }

      const response = await fetch("/api/student", {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      console.log(" Response:", result);

      if (response.ok && result.success) {
        router.push(`/student/student_detail/${result.data._id || result.data.id}`);
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
                  <span className="badge bg-primary rounded-0 p-2">เพิ่มข้อมูลนักเรียนใหม่</span>
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
                    {/* รูปโปรไฟล์ */}
                    <div className="col-md-12">
                      <label className="form-label text-uppercase fw-semibold small">รูปโปรไฟล์นักเรียน</label>
                      <div className="d-flex align-items-start gap-4">
                        <div className="text-center">
                          {imagePreview ? (
                            <img 
                              src={imagePreview} 
                              alt="รูปโปรไฟล์" 
                              className="rounded-circle border border-3 border-warning"
                              style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle border border-3 border-secondary d-flex align-items-center justify-content-center bg-light"
                              style={{ width: '120px', height: '120px' }}
                            >
                              <i className="bi bi-person-fill fs-1 text-secondary"></i>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageChange}
                            className="form-control rounded-0"
                          />
                          <small className="text-muted">รองรับไฟล์รูปภาพ .jpg, .png, .gif ขนาดไม่เกิน 5MB</small>
                        </div>
                      </div>
                    </div>

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

                    {/* กลุ่มเรียน/สาขาวิชา */}
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">กลุ่มเรียน/สาขาวิชา</label>
                      <select 
                        name="class_group"
                        className="form-select rounded-0"
                        value={formData.class_group}
                        onChange={handleInputChange}
                      >
                        <option value="">เลือกสาขาวิชา</option>
                        {majors.map((major) => (
                          <option key={major._id} value={major.major_name}>
                            {major.major_id} - {major.major_name}
                          </option>
                        ))}
                      </select>
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
                onClick={handleSave}
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
                onClick={handleSave}
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

  
    </div>
  );
}