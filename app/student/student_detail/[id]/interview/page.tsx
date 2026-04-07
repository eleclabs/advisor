"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface InterviewData {
  _id: string;
  student_id: string;
  student_name: string;
  student_nickname: string;
  student_level: string;
  student_class: string;
  student_number: string;
  
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
  home_visit_files: { name: string; url: string }[];
  created_at: string;
  updated_at: string;
}

export default function InterviewViewPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const studentDocId = params?.id as string;  // รับ _id จาก URL
  
  console.log("📝 Student _id from params:", studentDocId);

  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentBasic, setStudentBasic] = useState<any>(null);
  const [isStudentUser, setIsStudentUser] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);

  useEffect(() => {
    // ตรวจสอบว่าเป็น student login หรือไม่
    const isStudent = localStorage.getItem('isStudent') === 'true';
    const studentMongoId = localStorage.getItem('studentMongoId');
    const token = localStorage.getItem('token');
    
    setIsStudentUser(isStudent);
    setCurrentStudentId(studentMongoId);
    
    console.log("Is student user:", isStudent);
    console.log("Current student ID:", studentMongoId);
    console.log("Viewing student ID:", studentDocId);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!studentDocId) return;
      
      try {
        setLoading(true);
        
        // ดึงข้อมูลนักเรียนและข้อมูลการสัมภาษณ์จาก student API
        const studentRes = await fetch(`/api/student/${studentDocId}`);
        const studentResult = await studentRes.json();
        
        if (studentResult.success && studentResult.data) {
          const studentData = studentResult.data;
          setStudentBasic({
            _id: studentData._id,
            id: studentData.id || "",
            prefix: studentData.prefix || "",
            first_name: studentData.first_name || "",
            last_name: studentData.last_name || "",
            name: `${studentData.prefix || ''}${studentData.first_name || ''} ${studentData.last_name || ''}`.trim(),
            nickname: studentData.nickname || "",
            level: studentData.level || "",
            class_group: studentData.class_group || "",
            student_number: studentData.student_number || ""
          });
          
          // สร้างข้อมูลการสัมภาษณ์จาก student data (ถ้ามีข้อมูล)
          if (studentData.parent_name || studentData.family_status?.length > 0) {
            setInterview({
              _id: studentData._id,
              student_id: studentData.id || "",
              student_name: `${studentData.prefix || ''}${studentData.first_name || ''} ${studentData.last_name || ''}`.trim(),
              student_nickname: studentData.nickname || "",
              student_level: studentData.level || "",
              student_class: studentData.class_group || "",
              student_number: studentData.student_number || "",
              
              semester: studentData.semester || "",
              academic_year: studentData.academic_year || "",
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
              home_visit_file: studentData.home_visit_file || "",
              home_visit_files: studentData.home_visit_files || [],
              created_at: studentData.created_at || "",
              updated_at: studentData.updated_at || ""
            });
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

  const getStatusColor = (status: string) => {
    switch(status) {
      case "ปกติ": return "success";
      case "เสี่ยง": return "warning";
      case "มีปัญหา": return "danger";
      default: return "secondary";
    }
  };

  const downloadFile = async (file: { name: string; url: string }) => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์');
    }
  };

  const downloadAllFiles = async () => {
    if (!interviewData.home_visit_files || interviewData.home_visit_files.length === 0) return;
    
    try {
      // สร้าง ZIP file เพื่อให้ผู้ใช้เลือกโฟลเดอร์และแตกไฟล์เอง
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      for (let i = 0; i < interviewData.home_visit_files.length; i++) {
        const file = interviewData.home_visit_files[i];
        const response = await fetch(file.url);
        const blob = await response.blob();
        
        const fileExtension = file.name.split('.').pop() || 'file';
        const fileName = file.name.includes('.') ? file.name : `${file.name}.${fileExtension}`;
        
        zip.file(fileName, blob);
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `home_visit_files_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(zipUrl);
      
    } catch (error) {
      console.error('Download ZIP error:', error);
      // ถ้า JSZip ล้มเหลว ให้ดาวน์โหลดทีละไฟล์
      for (const file of interviewData.home_visit_files) {
        await downloadFile(file);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
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

  if (!studentBasic) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="alert alert-danger mb-0 text-center">
          <i className="bi bi-exclamation-triangle-fill fs-1 d-block mb-3"></i>
          <h5>ไม่พบข้อมูลนักเรียน</h5>
          <Link href={`/student/student_detail/${studentDocId}`} className="btn btn-dark mt-3">
            <i className="bi bi-arrow-left me-2"></i>กลับไป
          </Link>
        </div>
      </div>
    );
  }

  // สร้างข้อมูลการสัมภาษณ์เสมอ แม้ไม่มีข้อมูลจริง
  const interviewData: InterviewData = {
    _id: studentBasic._id,
    student_id: studentBasic.id || "",
    student_name: studentBasic.name || "",
    student_nickname: studentBasic.nickname || "",
    student_level: studentBasic.level || "",
    student_class: studentBasic.class_group || "",
    student_number: studentBasic.student_number || "",
    
    semester: interview?.semester || "-",
    academic_year: interview?.academic_year || "-",
    parent_name: interview?.parent_name || "-",
    parent_relationship: interview?.parent_relationship || "-",
    parent_phone: interview?.parent_phone || "-",
    
    family_status: interview?.family_status || [],
    living_with: interview?.living_with || "-",
    living_with_other: interview?.living_with_other || "",
    housing_type: interview?.housing_type || "-",
    housing_type_other: interview?.housing_type_other || "",
    transportation: interview?.transportation || [],
    
    strengths: interview?.strengths || "-",
    weak_subjects: interview?.weak_subjects || "-",
    hobbies: interview?.hobbies || "-",
    home_behavior: interview?.home_behavior || "-",
    
    chronic_disease: interview?.chronic_disease || "-",
    risk_behaviors: interview?.risk_behaviors || [],
    parent_concerns: interview?.parent_concerns || "-",
    
    family_income: interview?.family_income || "-",
    daily_allowance: interview?.daily_allowance || "-",
    assistance_needs: interview?.assistance_needs || [],
    
    student_group: interview?.student_group || "ปกติ",
    help_guidelines: interview?.help_guidelines || "-",
    home_visit_file: interview?.home_visit_file || "",
    home_visit_files: interview?.home_visit_files || [],
    created_at: interview?.created_at || "-",
    updated_at: interview?.updated_at || "-"
  };

  // ตรวจสอบว่า student คนนี้เป็นคนเดียวกับที่ login หรือไม่
  const isOwnProfile = isStudentUser && currentStudentId === studentBasic?._id;

  return (
    <div className="min-vh-100 bg-light">
      

      <div className="container-fluid py-4">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <div>
                <h2 className="text-uppercase fw-bold m-0">
                  <i className="bi bi-journal-text me-2 text-warning"></i>
                  บันทึกการสัมภาษณ์: {interviewData.student_name}
                </h2>
                <p className="text-muted mb-0 mt-1">
                  <i className="bi bi-clock me-1"></i>บันทึกเมื่อ: {interviewData.created_at} | แก้ไขล่าสุด: {interviewData.updated_at}
                </p>
              </div>
              <div>
                <span
                  className={`badge bg-${getStatusColor(interviewData.student_group)} rounded-0 text-uppercase fw-semibold p-2 me-2`}
                >
                  {interviewData.student_group}
                </span>
                {/* แสดงปุ่มแก้ไขบันทึกเฉพาะ admin/teacher เท่านั้น (student ไม่เห็น) */}
                {!isStudentUser && (
                  <Link
                    href={`/student/student_detail/${studentDocId}/interview/edit`}
                    className="btn btn-warning rounded-0 text-uppercase fw-semibold me-2"
                  >
                    <i className="bi bi-pencil me-2"></i>แก้ไขบันทึก
                  </Link>
                )}
                <Link
                  href={`/student/student_detail/${studentDocId}`}
                  className="btn btn-outline-dark rounded-0 text-uppercase fw-semibold"
                >
                  <i className="bi bi-arrow-left me-2"></i>กลับข้อมูลพื้นฐาน
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Header Info */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border bg-white p-3">
              <div className="row">
                <div className="col-md-2">
                  <span className="text-uppercase fw-semibold small">ภาคเรียนที่/ปีการศึกษา:</span>
                  <p className="fw-bold mb-0">{interviewData.semester}/{interviewData.academic_year}</p>
                </div>
                <div className="col-md-3">
                  <span className="text-uppercase fw-semibold small">ผู้ปกครองที่ให้ข้อมูล:</span>
                  <p className="fw-bold mb-0">{interviewData.parent_name} ({interviewData.parent_relationship})</p>
                </div>
                <div className="col-md-2">
                  <span className="text-uppercase fw-semibold small">เบอร์ติดต่อ:</span>
                  <p className="mb-0">{interviewData.parent_phone}</p>
                </div>
                <div className="col-md-2">
                  <span className="text-uppercase fw-semibold small">ระดับชั้น/สาขาวิชา:</span>
                  <p className="mb-0">{interviewData.student_level}/{interviewData.student_class}</p>
                </div>
                <div className="col-md-2">
                  <span className="text-uppercase fw-semibold small">ห้อง:</span>
                  <p className="mb-0">{interviewData.student_number}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Family Information */}
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
                  <p>{interviewData.family_status.join(", ") || "-"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">พักอาศัยกับ</label>
                  <p>{interviewData.living_with} {interviewData.living_with_other && `(${interviewData.living_with_other})`}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">ลักษณะที่อยู่อาศัย</label>
                  <p>{interviewData.housing_type} {interviewData.housing_type_other && `(${interviewData.housing_type_other})`}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">การเดินทางมาโรงเรียน</label>
                  <p>{interviewData.transportation.join(", ") || "-"}</p>
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
                  <p>{interviewData.family_income} บาท</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">เงินมาโรงเรียน/วัน</label>
                  <p>{interviewData.daily_allowance} บาท</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">ความต้องการช่วยเหลือ</label>
                  <p>{interviewData.assistance_needs.join(", ") || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning and Health */}
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
                  <p>{interviewData.strengths}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">วิชาที่ไม่ถนัด / ปัญหาการเรียน</label>
                  <p>{interviewData.weak_subjects}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">งานอดิเรก/ความสนใจพิเศษ</label>
                  <p>{interviewData.hobbies}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">พฤติกรรมที่บ้าน</label>
                  <p>{interviewData.home_behavior}</p>
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
                  <p>{interviewData.chronic_disease}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">พฤติกรรมเสี่ยงที่ควรเฝ้าระวัง</label>
                  <p>{interviewData.risk_behaviors.join(", ") || "-"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">ความกังวลใจของผู้ปกครอง</label>
                  <p>{interviewData.parent_concerns}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Recommendations */}
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
                    <label className="form-label text-uppercase fw-semibold small text-muted">สาขาวิชานักเรียน</label>
                    <p>
                      <span className={`badge bg-${getStatusColor(interviewData.student_group)} rounded-0 p-2`}>
                        {interviewData.student_group}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-10">
                    <label className="form-label text-uppercase fw-semibold small text-muted">แนวทางการช่วยเหลือ/ส่งต่อ</label>
                    <p>{interviewData.help_guidelines}</p>
                  </div>
                </div>
                {interviewData.home_visit_files && interviewData.home_visit_files.length > 0 && (
                  <div className="mt-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">แบบเยี่ยมบ้าน</label>
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {interviewData.home_visit_files.map((file, index) => (
                        <div key={index} className="d-flex align-items-center gap-1">
                          <span 
                            className="btn btn-sm btn-outline-secondary rounded-0"
                            onDoubleClick={() => downloadFile(file)}
                            title="ดับเบิลคลิกเพื่อดาวน์โหลด"
                            style={{ cursor: 'pointer' }}
                          >
                            <i className="bi bi-file-earmark me-1"></i>{file.name}
                          </span>
                          <button 
                            className="btn btn-sm btn-success rounded-0"
                            onClick={() => downloadFile(file)}
                            title="ดาวน์โหลดไฟล์นี้"
                          >
                            <i className="bi bi-download"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                    <button 
                      className="btn btn-primary rounded-0 btn-sm"
                      onClick={downloadAllFiles}
                      disabled={interviewData.home_visit_files.length === 0}
                    >
                      <i className="bi bi-folder-zip"></i> ดาวน์โหลดทั้งหมด
                    </button>
                    <span className="badge bg-info rounded-0 px-3 py-2 ms-2">
                      {interviewData.home_visit_files.length} ไฟล์
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}