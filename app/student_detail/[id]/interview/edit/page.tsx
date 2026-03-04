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
        
        // ดึงข้อมูลนักเรียน
        const studentRes = await fetch("/api/student");
        const studentResult = await studentRes.json();
        
        let studentsData = [];
        if (studentResult.success && Array.isArray(studentResult.data)) {
          studentsData = studentResult.data;
        }
        
        const foundStudent = studentsData.find((s: any) => s._id === studentDocId);
        
        if (foundStudent) {
          setStudent({
            _id: foundStudent._id,
            id: foundStudent.id || "",
            prefix: foundStudent.prefix || "",
            first_name: foundStudent.first_name || "",
            last_name: foundStudent.last_name || "",
            name: `${foundStudent.prefix || ''}${foundStudent.first_name || ''} ${foundStudent.last_name || ''}`.trim(),
            nickname: foundStudent.nickname || "",
            level: foundStudent.level || "",
            class_group: foundStudent.class_group || "",
          });
          
          setFormData(prev => ({
            ...prev,
            student_id: foundStudent.id || ""
          }));
        }
        
        // ดึงข้อมูลสัมภาษณ์ (ถ้ามี)
        const interviewRes = await fetch(`/api/interview/${studentDocId}`);
        const interviewResult = await interviewRes.json();
        
        if (interviewResult.success && interviewResult.data) {
          setFormData(interviewResult.data);
          setIsEditMode(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const submitData = {
        ...formData,
        student_doc_id: studentDocId, // ส่ง _id ไปด้วย
      };
      
      console.log("Saving interview data:", submitData);
      
      const response = await fetch(`/api/interview/${studentDocId}`, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        router.push(`/student_detail/${studentDocId}/interview`);
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
          <Link href="/student" className="btn btn-sm btn-dark mt-3">
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
                  href={`/student_detail/${studentDocId}/interview`}
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
                      accept=".jpg,.jpeg,.png,.pdf"
                    />
                    <div className="mt-2 text-muted small">
                      <i className="bi bi-info-circle me-1"></i>
                      รองรับไฟล์ .jpg, .png, .pdf ขนาดไม่เกิน 10MB
                    </div>
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
                href={`/student_detail/${studentDocId}/interview`}
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