"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface InterviewFormData {
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
}

// Mock student data for preview
const mockStudentData: { [key: string]: { name: string; level: string; class: string } } = {
  "66001": {
    name: "นายสมชาย ใจดี",
    level: "ปวช.3",
    class: "ชฟ.1"
  },
  "66002": {
    name: "นางสาวจิรา สวยใจ",
    level: "ปวช.3",
    class: "ชฟ.2"
  },
  "66003": {
    name: "นายสมเด็จ วิจิตร",
    level: "ปวช.2",
    class: "ชฟ.1"
  }
};

// Mock existing interview data for edit mode
const mockInterviewData: { [key: string]: InterviewFormData } = {
  "66001": {
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
    transportation: ["รถส่วนตัว", "รถรับส่ง"],
    
    strengths: "ชอบวิทยาศาสตร์ คณิตศาสตร์ มีความตั้งใจเรียน",
    weak_subjects: "ภาษาอังกฤษ",
    hobbies: "เล่นฟุตบอล, เล่นเกม",
    home_behavior: "ช่วยทำงานบ้าน รับผิดชอบตัวเองดี แต่ติดเกมบ้างเล็กน้อย",
    
    chronic_disease: "ไม่มี",
    risk_behaviors: ["ไม่มี"],
    parent_concerns: "อยากให้เรียนต่อระดับสูง กลัวติดเกมมากเกินไป",
    
    family_income: "25,000",
    daily_allowance: "120",
    assistance_needs: ["ทุนการศึกษา"],
    
    student_group: "ปกติ",
    help_guidelines: "สนับสนุนให้ศึกษาต่อในสาขาวิชาที่เกี่ยวข้องกับวิทยาศาสตร์",
  },
  "66002": {
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
    weak_subjects: "วิทยาศาสตร์, คณิตศาสตร์",
    hobbies: "วาดรูป, ร้องเพลง",
    home_behavior: "ช่วยงานบ้าน ชอบเก็บตัว เงียบๆ",
    
    chronic_disease: "ไม่มี",
    risk_behaviors: ["ไม่มี"],
    parent_concerns: "ฐานะทางบ้าน不太好 ต้องการทุน กลัวลูกจะเครียด",
    
    family_income: "15,000",
    daily_allowance: "80",
    assistance_needs: ["ทุนการศึกษา", "อุปกรณ์การเรียน"],
    
    student_group: "เสี่ยง",
    help_guidelines: "ติดตามด้านการเงิน มอบทุนการศึกษา เยี่ยมบ้านอย่างสม่ำเสมอ",
  }
};

export default function StudentAddInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId") || "66001"; // Default to 66001 for demo
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [studentInfo, setStudentInfo] = useState({ name: "", level: "", class: "" });
  
  const [formData, setFormData] = useState<InterviewFormData>({
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

    // Load mock data
    setTimeout(() => {
      // Get student basic info
      if (studentId && mockStudentData[studentId]) {
        setStudentInfo(mockStudentData[studentId]);
      } else {
        setStudentInfo({
          name: "นายสมชาย ใจดี",
          level: "ปวช.3",
          class: "ชฟ.1"
        });
      }
      
      // Check if there's existing interview data (edit mode)
      if (studentId && mockInterviewData[studentId]) {
        setFormData(mockInterviewData[studentId]);
        setIsEditMode(true);
      }
      
      setLoading(false);
    }, 500); // Simulate loading
  }, [studentId]);

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

  const handleSkip = async () => {
    setSkipping(true);
    // ข้ามไปหน้ารายชื่อ
    setTimeout(() => {
      router.push("/student");
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Calculate student status color based on form data
      let calculatedStatus = "ปกติ";
      if (formData.risk_behaviors.length > 0 || formData.student_group === "มีปัญหา") {
        calculatedStatus = "มีปัญหา";
      } else if (formData.student_group === "เสี่ยง" || formData.family_status.includes("หย่าร้าง")) {
        calculatedStatus = "เสี่ยง";
      }
      
      // Simulate API call
      console.log("Saving interview data:", {
        ...formData,
        student_status: calculatedStatus,
        studentId: studentId
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push("/student");
    } catch (error) {
      console.error("Error saving interview:", error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = () => {
    if (formData.risk_behaviors.length > 0 || formData.student_group === "มีปัญหา") return "danger";
    if (formData.student_group === "เสี่ยง" || formData.family_status.includes("หย่าร้าง")) return "warning";
    return "success";
  };

  const handleLoadExample = () => {
    // Load example data for demo
    setFormData({
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
    });
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

  return (
    <div className="min-vh-100 bg-light">
      {/* START: Navigation Bar */}
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
                  {isEditMode ? "แก้ไข" : "เพิ่ม"}บันทึกการสัมภาษณ์
                </h2>
                <div className="mt-2">
                  <span className="badge bg-success rounded-0 p-2 me-2">✓ ขั้นตอนที่ 1: ข้อมูลพื้นฐาน</span>
                  <span className="badge bg-primary rounded-0 p-2">ขั้นตอนที่ 2: บันทึกการสัมภาษณ์</span>
                </div>
                <p className="text-muted mt-2 mb-0">
                  <i className="bi bi-info-circle me-1"></i>
                  สามารถข้ามขั้นตอนนี้ไปก่อน แล้วค่อยมาเพิ่มทีหลังได้
                </p>
              </div>
              <div className="text-end">
                <span className="badge bg-dark rounded-0 p-2 d-block mb-2">รหัสนักศึกษา: {studentId}</span>
                <span className="badge bg-secondary rounded-0 p-2">{studentInfo.name}</span>
              </div>
            </div>
          </div>
        </div>
        {/* END: Page Header */}

       

        <form onSubmit={handleSubmit}>
          {/* START: Student Info Summary */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-light p-3">
                <div className="row">
                  <div className="col-md-4">
                    <span className="text-uppercase fw-semibold small">ชื่อ-นามสกุล:</span>
                    <span className="ms-2">{studentInfo.name}</span>
                  </div>
                  <div className="col-md-4">
                    <span className="text-uppercase fw-semibold small">ระดับชั้น:</span>
                    <span className="ms-2">{studentInfo.level}</span>
                  </div>
                  <div className="col-md-4">
                    <span className="text-uppercase fw-semibold small">กลุ่มเรียน:</span>
                    <span className="ms-2">{studentInfo.class}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* END: Student Info Summary */}

          {/* START: ข้อมูลทั่วไป */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-person-lines-fill me-2 text-warning"></i>
                    1. ข้อมูลทั่วไป
                  </h5>
                </div>
                <div className="p-3">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-uppercase fw-semibold small">ชื่อ-นามสกุล (ผู้ปกครองที่ให้ข้อมูล)</label>
                      <input 
                        type="text" 
                        name="parent_name"
                        className="form-control rounded-0"
                        value={formData.parent_name}
                        onChange={handleInputChange}
                        placeholder="เช่น นายสมศักดิ์ ใจดี"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">ความสัมพันธ์</label>
                      <input 
                        type="text" 
                        name="parent_relationship"
                        className="form-control rounded-0"
                        value={formData.parent_relationship}
                        onChange={handleInputChange}
                        placeholder="เช่น บิดา, มารดา"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">เบอร์โทรศัพท์ติดต่อ</label>
                      <input 
                        type="text" 
                        name="parent_phone"
                        className="form-control rounded-0"
                        value={formData.parent_phone}
                        onChange={handleInputChange}
                        placeholder="เช่น 089-765-4321"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* END: 1. ข้อมูลทั่วไป */}

          {/* START: 2. สถานภาพครอบครัวและการเป็นอยู่ */}
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
                          placeholder="ระบุ (ถ้าเป็นบุคคลอื่น)"
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
          {/* END: 2. สถานภาพครอบครัวและการเป็นอยู่ */}

          {/* START: 3. ด้านการเรียนและพฤติกรรม */}
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
                      placeholder="เช่น ชอบวิทยาศาสตร์ มีความตั้งใจเรียน"
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
                      placeholder="เช่น ไม่ชอบภาษาอังกฤษ"
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
                      placeholder="เช่น เล่นฟุตบอล, วาดรูป"
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
          {/* END: 3. ด้านการเรียนและพฤติกรรม */}

          {/* START: 4. ด้านสุขภาพและปัจจัยเสี่ยง */}
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
                      placeholder="เช่น ไม่มี, แพ้นม"
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
                      placeholder="เช่น อยากให้เรียนต่อระดับสูง"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* END: 4. ด้านสุขภาพและปัจจัยเสี่ยง */}

          {/* START: 5. ด้านเศรษฐกิจ */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-cash-stack me-2 text-warning"></i>
                    5. ด้านเศรษฐกิจ (การเงิน)
                  </h5>
                </div>
                <div className="p-3">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-uppercase fw-semibold small">รายได้เฉลี่ยต่อเดือนของครอบครัว (บาท)</label>
                      <input 
                        type="text" 
                        name="family_income"
                        className="form-control rounded-0"
                        value={formData.family_income}
                        onChange={handleInputChange}
                        placeholder="เช่น 25000"
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
                        placeholder="เช่น 120"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
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
          {/* END: 5. ด้านเศรษฐกิจ */}

          {/* START: 6. สรุปความเห็นของครูที่ปรึกษา */}
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
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label text-uppercase fw-semibold small">กลุ่มนักเรียน</label>
                      <select 
                        name="student_group"
                        className="form-select rounded-0"
                        value={formData.student_group}
                        onChange={handleInputChange}
                      >
                        <option value="ปกติ">กลุ่มปกติ</option>
                        <option value="เสี่ยง">กลุ่มเสี่ยง</option>
                        <option value="มีปัญหา">กลุ่มมีปัญหา</option>
                      </select>
                    </div>
                    <div className="col-md-8">
                      <label className="form-label text-uppercase fw-semibold small">แนวทางการช่วยเหลือ/ส่งต่อ</label>
                      <textarea 
                        name="help_guidelines"
                        className="form-control rounded-0" 
                        rows={3}
                        value={formData.help_guidelines}
                        onChange={handleInputChange}
                        placeholder="เช่น สนับสนุนให้ศึกษาต่อ"
                      ></textarea>
                    </div>
                  </div>

                  <div className="mt-3 p-3 border" style={{ backgroundColor: getStatusColor() === 'success' ? '#d4edda' : getStatusColor() === 'warning' ? '#fff3cd' : '#f8d7da' }}>
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
          {/* END: 6. สรุปความเห็นของครูที่ปรึกษา */}

          {/* START: Form Actions */}
          <div className="row mb-4">
            <div className="col-12 d-flex justify-content-center gap-3">
              <Link
                href="/student"
                className="btn btn-secondary rounded-0 text-uppercase fw-semibold px-5"
                onClick={(e) => {
                  e.preventDefault();
                  handleSkip();
                }}
              >
                {skipping ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    กำลังข้าม...
                  </>
                ) : (
                  <>
                    <i className="bi bi-skip-forward me-2"></i>ข้ามไปก่อน
                  </>
                )}
              </Link>
              <button 
                type="submit" 
                className="btn btn-warning rounded-0 text-uppercase fw-semibold px-5"
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
              <span>{isEditMode ? "แก้ไข" : "เพิ่ม"}บันทึกการสัมภาษณ์</span>
            </div>
          </div>
        </div>
      </footer>
      {/* END: Footer */}
    </div>
  );
}