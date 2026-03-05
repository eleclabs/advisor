"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface StudentBasicInfo {
  _id: string;
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  name?: string;
  nickname: string;
  level: string;
  class_group: string;
  student_number?: string;
}

interface InterviewFormData {
  student_id: string;
  semester: string;
  academic_year: string;
  parent_name: string;
  parent_relationship: string;
  parent_phone: string;
  
  family_status: string[];
  living_with: string;
  living_with_other: string;
  housing_type: string;
  housing_type_other: string;
  transportation: string[];
  
  strengths: string;
  weak_subjects: string;
  hobbies: string;
  home_behavior: string;
  
  chronic_disease: string;
  risk_behaviors: string[];
  parent_concerns: string;
  
  family_income: string;
  daily_allowance: string;
  assistance_needs: string[];
  
  student_group: string;
  help_guidelines: string;
  home_visit_file: string;
}

export default function InterviewEditPage() {
  const router = useRouter();
  const params = useParams();
  const studentDocId = params?.id as string;  // รับ _id จาก URL
  
  console.log("📝 Student _id from params:", studentDocId);

  const [student, setStudent] = useState<StudentBasicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State สำหรับจัดการไฟล์เยี่ยมบ้าน
  const [homeVisitFiles, setHomeVisitFiles] = useState<File[]>([]);
  const [existingHomeVisitFiles, setExistingHomeVisitFiles] = useState<{ name: string; url: string }[]>([]);
  
  const [formData, setFormData] = useState<InterviewFormData>({
    student_id: "",
    semester: "2",
    academic_year: "2567",
    parent_name: "",
    parent_relationship: "",
    parent_phone: "",
    
    family_status: [],
    living_with: "",
    living_with_other: "",
    housing_type: "",
    housing_type_other: "",
    transportation: [],
    
    strengths: "",
    weak_subjects: "",
    hobbies: "",
    home_behavior: "",
    
    chronic_disease: "",
    risk_behaviors: [],
    parent_concerns: "",
    
    family_income: "",
    daily_allowance: "",
    assistance_needs: [],
    
    student_group: "ปกติ",
    help_guidelines: "",
    home_visit_file: "",
  });

  useEffect(() => {
   
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!studentDocId) return;
      
      try {
        setLoading(true);
        
        // ดึงข้อมูลนักเรียนและข้อมูลเยี่ยมบ้าน
        const studentRes = await fetch(`/api/student/${studentDocId}`);
        const studentResult = await studentRes.json();
        
        if (studentResult.success && studentResult.data) {
          const studentData = studentResult.data;
          setStudent({
            _id: studentData._id,
            id: studentData.id || "",
            prefix: studentData.prefix || "",
            first_name: studentData.first_name || "",
            last_name: studentData.last_name || "",
            name: `${studentData.prefix || ''}${studentData.first_name || ''} ${studentData.last_name || ''}`.trim(),
            nickname: studentData.nickname || "",
            level: studentData.level || "",
            class_group: studentData.class_group || "",
          });
          
          // ดึงข้อมูลการสัมภาษณ์จาก student data
          setFormData(prev => ({
            ...prev,
            student_id: studentData.id || "",
            semester: studentData.semester || "2",
            academic_year: studentData.academic_year || "2567",
            parent_name: studentData.parent_name || "",
            parent_relationship: studentData.parent_relationship || "",
            parent_phone: studentData.parent_phone || "",
            family_status: studentData.family_status || [],
            living_with: studentData.living_with || "",
            living_with_other: studentData.living_with_other || "",
            housing_type: studentData.housing_type || "",
            housing_type_other: studentData.housing_type_other || "",
            transportation: studentData.transportation || [],
            strengths: studentData.strengths || "",
            weak_subjects: studentData.weak_subjects || "",
            hobbies: studentData.hobbies || "",
            home_behavior: studentData.home_behavior || "",
            chronic_disease: studentData.chronic_disease || "",
            risk_behaviors: studentData.risk_behaviors || [],
            parent_concerns: studentData.parent_concerns || "",
            family_income: studentData.family_income || "",
            daily_allowance: studentData.daily_allowance || "",
            assistance_needs: studentData.assistance_needs || [],
            student_group: studentData.student_group || "ปกติ",
            help_guidelines: studentData.help_guidelines || "",
            home_visit_file: studentData.home_visit_file || ""
          }));
          
          // ดึงไฟล์เยี่ยมบ้านที่มีอยู่
          if (studentData.home_visit_files && Array.isArray(studentData.home_visit_files)) {
            setExistingHomeVisitFiles(studentData.home_visit_files);
          }
          
          // ถ้ามีข้อมูลการสัมภาษณ์อยู่แล้ว ให้เป็น edit mode
          if (studentData.parent_name || studentData.family_status?.length > 0) {
            setIsEditMode(true);
          }
        }
        
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentDocId]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentValues = prev[field as keyof InterviewFormData] as string[] || [];
      if (checked) {
        return { ...prev, [field]: [...currentValues, value] };
      } else {
        return { ...prev, [field]: currentValues.filter(item => item !== value) };
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      // ตรวจสอบว่ามีไฟล์ซ้ำหรือไม่
      const currentFileNames = homeVisitFiles.map(f => f.name);
      const existingFileNames = existingHomeVisitFiles.map(m => m.name);
      const allFileNames = [...currentFileNames, ...existingFileNames];
      
      const uniqueFiles = newFiles.filter(file => !allFileNames.includes(file.name));
      
      if (uniqueFiles.length > 0) {
        setHomeVisitFiles(prev => [...prev, ...uniqueFiles]);
        console.log(`✅ Added ${uniqueFiles.length} new files:`, uniqueFiles.map(f => f.name));
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setHomeVisitFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = (index: number) => {
    setExistingHomeVisitFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // สร้าง FormData สำหรับส่งไฟล์และข้อมูล
      const submitFormData = new FormData();
      
      // เพิ่มข้อมูลฟอร์มทั้งหมด
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          submitFormData.append(key, JSON.stringify(value));
        } else {
          submitFormData.append(key, String(value));
        }
      });
      
      // เพิ่มไฟล์ใหม่
      homeVisitFiles.forEach((file, index) => {
        submitFormData.append(`home_visit_files[${index}]`, file);
      });
      
      // เพิ่มไฟล์เดิมที่คงไว้
      existingHomeVisitFiles.forEach((file, index) => {
        submitFormData.append(`existingHomeVisitFiles[${index}]`, JSON.stringify(file));
      });
      
      // ถ้าไม่มีไฟล์เดิมและไม่มีไฟล์ใหม่ ให้ส่งค่าว่างเพื่อล้างข้อมูลเดิม
      if (existingHomeVisitFiles.length === 0 && homeVisitFiles.length === 0) {
        submitFormData.append('home_visit_files_clear', 'true');
      }
      
      console.log("📤 Submitting FormData with files:");
      console.log("  New files count:", homeVisitFiles.length);
      console.log("  Existing files count:", existingHomeVisitFiles.length);
      
      const response = await fetch(`/api/student/${studentDocId}`, {
        method: 'PUT',
        body: submitFormData,
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        router.push(`/student/student_detail/${studentDocId}/interview`);
      } else {
        alert(result.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error saving interview:", error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = () => {
    if (formData.risk_behaviors.length > 0 || formData.student_group === "มีปัญหา") return "danger";
    if (formData.student_group === "เสี่ยง" || formData.family_status.includes("หย่าร้าง")) return "warning";
    return "success";
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

  if (!student) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="alert alert-danger mb-0">
          <p className="mb-0">ไม่พบข้อมูลนักเรียน</p>
          <Link href={`/student/student_detail/${studentDocId}/interview`} className="btn btn-sm btn-dark mt-3">
            <i className="bi bi-arrow-left me-2"></i>กลับไป
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      
      <div className="container-fluid py-4">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-journal-text me-2 text-warning"></i>
                {isEditMode ? "แก้ไข" : "เพิ่ม"}บันทึกการสัมภาษณ์
              </h2>
              <div>
                <span 
                  className={`badge bg-${getStatusColor()} rounded-0 text-uppercase fw-semibold p-2 me-2`}
                >
                  สรุปสถานะ: {formData.student_group}
                </span>
                <Link
                  href={`/student/student_detail/${studentDocId}/interview`}
                  className="btn btn-outline-dark rounded-0 text-uppercase fw-semibold"
                >
                  <i className="bi bi-x-circle me-2"></i>ยกเลิก
                </Link>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Student Basic Info */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-person-badge me-2 text-warning"></i>
                    ข้อมูลนักเรียน
                  </h5>
                </div>
                <div className="p-3 bg-light">
                  <div className="row">
                    <div className="col-md-8">
                      <div className="row">
                        <div className="col-md-6 mb-2">
                          <span className="text-uppercase fw-semibold small">ชื่อ-นามสกุล:</span>
                          <span className="ms-2 fw-bold">{student.name}</span>
                        </div>
                        <div className="col-md-3 mb-2">
                          <span className="text-uppercase fw-semibold small">ชื่อเล่น:</span>
                          <span className="ms-2">{student.nickname}</span>
                        </div>
                        <div className="col-md-3 mb-2">
                          <span className="text-uppercase fw-semibold small">ชั้น:</span>
                          <span className="ms-2">{student.level}</span>
                        </div>
                        <div className="col-md-6 mb-2">
                          <span className="text-uppercase fw-semibold small">กลุ่มเรียน:</span>
                          <span className="ms-2">{student.class_group || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Header Form */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <label className="form-label text-uppercase fw-semibold small">ภาคเรียนที่ <span className="text-danger">*</span></label>
                <select 
                  name="semester"
                  className="form-select rounded-0"
                  value={formData.semester}
                  onChange={handleInputChange}
                  required
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <label className="form-label text-uppercase fw-semibold small">ปีการศึกษา <span className="text-danger">*</span></label>
                <select 
                  name="academic_year"
                  className="form-select rounded-0"
                  value={formData.academic_year}
                  onChange={handleInputChange}
                  required
                >
                  <option value="2568">2568</option>
                  <option value="2567">2567</option>
                  <option value="2566">2566</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="border bg-white p-3">
                <label className="form-label text-uppercase fw-semibold small">ชื่อ-นามสกุล (ผู้ปกครองที่ให้ข้อมูล) <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  name="parent_name"
                  className="form-control rounded-0"
                  value={formData.parent_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <label className="form-label text-uppercase fw-semibold small">ความสัมพันธ์ <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  name="parent_relationship"
                  className="form-control rounded-0"
                  value={formData.parent_relationship}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <label className="form-label text-uppercase fw-semibold small">เบอร์โทรศัพท์ติดต่อ <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  name="parent_phone"
                  className="form-control rounded-0"
                  value={formData.parent_phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Family Status */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-house-heart me-2 text-warning"></i>
                    2. สถานภาพครอบครัวและการเป็นอยู่
                  </h5>
                </div>
                <div className="p-3">
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">สถานภาพบิดา-มารดา</label>
                    <div className="row">
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="อยู่ด้วยกัน"
                            checked={formData.family_status.includes("อยู่ด้วยกัน")}
                            onChange={(e) => handleCheckboxChange(e, "family_status")}
                          />
                          <label className="form-check-label">อยู่ด้วยกัน</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="แยกกันอยู่"
                            checked={formData.family_status.includes("แยกกันอยู่")}
                            onChange={(e) => handleCheckboxChange(e, "family_status")}
                          />
                          <label className="form-check-label">แยกกันอยู่</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="หย่าร้าง"
                            checked={formData.family_status.includes("หย่าร้าง")}
                            onChange={(e) => handleCheckboxChange(e, "family_status")}
                          />
                          <label className="form-check-label">หย่าร้าง</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="บิดา/มารดาเสียชีวิต"
                            checked={formData.family_status.includes("บิดา/มารดาเสียชีวิต")}
                            onChange={(e) => handleCheckboxChange(e, "family_status")}
                          />
                          <label className="form-check-label">บิดา/มารดาเสียชีวิต</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">นักเรียนพักอาศัยกับ</label>
                    <div className="row">
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="radio" 
                            name="living_with"
                            className="form-check-input rounded-0" 
                            value="บิดา-มารดา"
                            checked={formData.living_with === "บิดา-มารดา"}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">บิดา-มารดา</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="radio" 
                            name="living_with"
                            className="form-check-input rounded-0" 
                            value="บุคคลอื่น"
                            checked={formData.living_with === "บุคคลอื่น"}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">บุคคลอื่น</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <input 
                          type="text" 
                          className="form-control rounded-0" 
                          placeholder="ระบุ"
                          value={formData.living_with_other}
                          onChange={(e) => setFormData(prev => ({ ...prev, living_with_other: e.target.value }))}
                          disabled={formData.living_with !== "บุคคลอื่น"}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">ลักษณะที่อยู่อาศัย</label>
                    <div className="row">
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="radio" 
                            name="housing_type"
                            className="form-check-input rounded-0" 
                            value="บ้านตนเอง"
                            checked={formData.housing_type === "บ้านตนเอง"}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">บ้านตนเอง</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="radio" 
                            name="housing_type"
                            className="form-check-input rounded-0" 
                            value="บ้านเช่า"
                            checked={formData.housing_type === "บ้านเช่า"}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">บ้านเช่า</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="radio" 
                            name="housing_type"
                            className="form-check-input rounded-0" 
                            value="หอพัก"
                            checked={formData.housing_type === "หอพัก"}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">หอพัก</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="radio" 
                            name="housing_type"
                            className="form-check-input rounded-0" 
                            value="อื่นๆ"
                            checked={formData.housing_type === "อื่นๆ"}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">อื่นๆ</label>
                        </div>
                      </div>
                      <div className="col-md-6 mt-2">
                        <input 
                          type="text" 
                          className="form-control rounded-0" 
                          placeholder="ระบุ"
                          value={formData.housing_type_other}
                          onChange={(e) => setFormData(prev => ({ ...prev, housing_type_other: e.target.value }))}
                          disabled={formData.housing_type !== "อื่นๆ"}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">การเดินทางมาโรงเรียน</label>
                    <div className="row">
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="รถส่วนตัว"
                            checked={formData.transportation.includes("รถส่วนตัว")}
                            onChange={(e) => handleCheckboxChange(e, "transportation")}
                          />
                          <label className="form-check-label">รถส่วนตัว</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="รถรับส่ง"
                            checked={formData.transportation.includes("รถรับส่ง")}
                            onChange={(e) => handleCheckboxChange(e, "transportation")}
                          />
                          <label className="form-check-label">รถรับส่ง</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="รถเมล์/รถสาธารณะ"
                            checked={formData.transportation.includes("รถเมล์/รถสาธารณะ")}
                            onChange={(e) => handleCheckboxChange(e, "transportation")}
                          />
                          <label className="form-check-label">รถเมล์/รถสาธารณะ</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="เดิน"
                            checked={formData.transportation.includes("เดิน")}
                            onChange={(e) => handleCheckboxChange(e, "transportation")}
                          />
                          <label className="form-check-label">เดิน</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning and Behavior */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-journal-bookmark-fill me-2 text-warning"></i>
                    3. ด้านการเรียนและพฤติกรรม
                  </h5>
                </div>
                <div className="p-3">
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">วิชาที่ชอบ / จุดแข็ง</label>
                    <textarea 
                      name="strengths"
                      className="form-control rounded-0" 
                      rows={2}
                      value={formData.strengths}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">วิชาที่ไม่ถนัด / ปัญหาการเรียน</label>
                    <textarea 
                      name="weak_subjects"
                      className="form-control rounded-0" 
                      rows={2}
                      value={formData.weak_subjects}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">งานอดิเรก/ความสนใจพิเศษ</label>
                    <textarea 
                      name="hobbies"
                      className="form-control rounded-0" 
                      rows={2}
                      value={formData.hobbies}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">พฤติกรรมที่บ้าน</label>
                    <textarea 
                      name="home_behavior"
                      className="form-control rounded-0" 
                      rows={3}
                      value={formData.home_behavior}
                      onChange={handleInputChange}
                      placeholder="เช่น ช่วยทำงานบ้าน, ชอบเก็บตัว, ติดเกม, รับผิดชอบตัวเองได้ดี"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Health and Risks */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-heart-pulse me-2 text-warning"></i>
                    4. ด้านสุขภาพและปัจจัยเสี่ยง
                  </h5>
                </div>
                <div className="p-3">
                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">โรคประจำตัว/แพ้อาหาร</label>
                    <textarea 
                      name="chronic_disease"
                      className="form-control rounded-0" 
                      rows={2}
                      value={formData.chronic_disease}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">พฤติกรรมเสี่ยงที่ควรเฝ้าระวัง</label>
                    <div className="row">
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="การใช้สารเสพติด/บุหรี่"
                            checked={formData.risk_behaviors.includes("การใช้สารเสพติด/บุหรี่")}
                            onChange={(e) => handleCheckboxChange(e, "risk_behaviors")}
                          />
                          <label className="form-check-label">การใช้สารเสพติด/บุหรี่</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="การใช้ความรุนแรง"
                            checked={formData.risk_behaviors.includes("การใช้ความรุนแรง")}
                            onChange={(e) => handleCheckboxChange(e, "risk_behaviors")}
                          />
                          <label className="form-check-label">การใช้ความรุนแรง</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="สภาวะทางอารมณ์/ซึมเศร้า"
                            checked={formData.risk_behaviors.includes("สภาวะทางอารมณ์/ซึมเศร้า")}
                            onChange={(e) => handleCheckboxChange(e, "risk_behaviors")}
                          />
                          <label className="form-check-label">สภาวะทางอารมณ์/ซึมเศร้า</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="ไม่มี"
                            checked={formData.risk_behaviors.includes("ไม่มี")}
                            onChange={(e) => handleCheckboxChange(e, "risk_behaviors")}
                          />
                          <label className="form-check-label">ไม่มี</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">ความกังวลใจของผู้ปกครองที่มีต่อนักเรียน</label>
                    <textarea 
                      name="parent_concerns"
                      className="form-control rounded-0" 
                      rows={3}
                      value={formData.parent_concerns}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Economics */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-cash-stack me-2 text-warning"></i>
                    5. ด้านเศรษฐกิจ
                  </h5>
                </div>
                <div className="p-3">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-uppercase fw-semibold small">รายได้เฉลี่ยต่อเดือนของครอบครัว (บาท)</label>
                      <input 
                        type="text" 
                        name="family_income"
                        className="form-control rounded-0"
                        value={formData.family_income}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-uppercase fw-semibold small">เงินมาโรงเรียนต่อวัน (บาท)</label>
                      <input 
                        type="text" 
                        name="daily_allowance"
                        className="form-control rounded-0"
                        value={formData.daily_allowance}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label text-uppercase fw-semibold small">ความต้องการความช่วยเหลือเพิ่มเติม</label>
                    <div className="row">
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="ทุนการศึกษา"
                            checked={formData.assistance_needs.includes("ทุนการศึกษา")}
                            onChange={(e) => handleCheckboxChange(e, "assistance_needs")}
                          />
                          <label className="form-check-label">ทุนการศึกษา</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="อุปกรณ์การเรียน"
                            checked={formData.assistance_needs.includes("อุปกรณ์การเรียน")}
                            onChange={(e) => handleCheckboxChange(e, "assistance_needs")}
                          />
                          <label className="form-check-label">อุปกรณ์การเรียน</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="ชุดนักเรียน"
                            checked={formData.assistance_needs.includes("ชุดนักเรียน")}
                            onChange={(e) => handleCheckboxChange(e, "assistance_needs")}
                          />
                          <label className="form-check-label">ชุดนักเรียน</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="อื่นๆ"
                            checked={formData.assistance_needs.includes("อื่นๆ")}
                            onChange={(e) => handleCheckboxChange(e, "assistance_needs")}
                          />
                          <label className="form-check-label">อื่นๆ</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Summary */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-clipboard-check me-2 text-warning"></i>
                    6. สรุปความเห็นของครูที่ปรึกษา
                  </h5>
                </div>
                <div className="p-3">
                  <div className="row g-3 mb-3">
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">กลุ่มนักเรียน <span className="text-danger">*</span></label>
                      <select 
                        name="student_group"
                        className="form-select rounded-0"
                        value={formData.student_group}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="ปกติ">กลุ่มปกติ</option>
                        <option value="เสี่ยง">กลุ่มเสี่ยง</option>
                        <option value="มีปัญหา">กลุ่มมีปัญหา</option>
                      </select>
                    </div>
                    <div className="col-md-9">
                      <label className="form-label text-uppercase fw-semibold small">แนวทางการช่วยเหลือ/ส่งต่อ</label>
                      <textarea 
                        name="help_guidelines"
                        className="form-control rounded-0" 
                        rows={3}
                        value={formData.help_guidelines}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-uppercase fw-semibold small">แบบเยี่ยมบ้าน (แนบไฟล์/ภาพได้)</label>
                    <input 
                      type="file" 
                      className="form-control rounded-0" 
                      onChange={handleFileChange}
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    />
                    <small className="text-muted">รองรับไฟล์ .jpg, .png, .pdf, .doc, .docx ขนาดไม่เกิน 10MB</small>
                    
                    {homeVisitFiles.length > 0 && (
                      <div className="mt-3">
                        <label className="form-label">ไฟล์ใหม่ที่เลือก:</label>
                        <div className="border rounded p-2 bg-light">
                          {homeVisitFiles.map((file, index) => (
                            <div key={index} className="d-flex justify-content-between align-items-center py-1">
                              <small className="text-dark">
                                <i className="bi bi-file-earmark me-2"></i>
                                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </small>
                              <button 
                                type="button"
                                className="btn btn-sm btn-outline-danger rounded-0"
                                onClick={() => handleRemoveFile(index)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {existingHomeVisitFiles.length > 0 && (
                      <div className="mt-3">
                        <label className="form-label">ไฟล์เดิม:</label>
                        <div className="border rounded p-2 bg-light">
                          {existingHomeVisitFiles.map((file, index) => (
                            <div key={index} className="d-flex justify-content-between align-items-center py-1">
                              <small className="text-dark">
                                <i className="bi bi-file-earmark me-2"></i>
                                {file.name}
                              </small>
                              <button 
                                type="button"
                                className="btn btn-sm btn-outline-danger rounded-0"
                                onClick={() => handleRemoveExistingFile(index)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 p-3 border rounded-0" style={{ backgroundColor: getStatusColor() === 'success' ? '#d4edda' : getStatusColor() === 'warning' ? '#fff3cd' : '#f8d7da' }}>
                    <div className="d-flex align-items-center">
                      <i className={`bi bi-${getStatusColor() === 'success' ? 'check-circle' : getStatusColor() === 'warning' ? 'exclamation-triangle' : 'exclamation-octagon'} fs-1 me-3`}></i>
                      <div>
                        <h5 className="fw-bold mb-1">
                          ระบบสรุปผล: 
                          <span className={`ms-2 badge bg-${getStatusColor()} rounded-0 p-2`}>
                            {formData.student_group}
                          </span>
                        </h5>
                        <p className="mb-0">
                          {getStatusColor() === 'success' && 'นักเรียนอยู่ในเกณฑ์ปกติ เหมาะสมกับการดูแลทั่วไป'}
                          {getStatusColor() === 'warning' && 'นักเรียนอยู่ในกลุ่มเสี่ยง ควรได้รับการดูแลและติดตามอย่างใกล้ชิด'}
                          {getStatusColor() === 'danger' && 'นักเรียนอยู่ในกลุ่มมีปัญหา จำเป็นต้องได้รับการช่วยเหลือและส่งต่อทันที'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="row mb-4">
            <div className="col-12 text-center">
              <Link
                href={`/student/student_detail/${studentDocId}/interview`}
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
        </form>
      </div>

     
    </div>
  );
}