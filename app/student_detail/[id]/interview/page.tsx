"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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
  created_at: string;
  updated_at: string;
}

export default function InterviewViewPage() {
  const router = useRouter();
  const params = useParams();
  const studentDocId = params?.id as string;  // รับ _id จาก URL
  
  console.log("📝 Student _id from params:", studentDocId);

  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentBasic, setStudentBasic] = useState<any>(null);

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
        setStudentBasic(foundStudent);
        
        // ดึงข้อมูลสัมภาษณ์ (ถ้ามี)
        const interviewRes = await fetch(`/api/interview/${studentDocId}`);
        const interviewResult = await interviewRes.json();
        
        if (interviewResult.success && interviewResult.data) {
          setInterview(interviewResult.data);
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="alert alert-warning mb-0 text-center">
          <i className="bi bi-exclamation-triangle-fill fs-1 d-block mb-3"></i>
          <h5>ไม่พบข้อมูลการสัมภาษณ์</h5>
          <p className="mb-3">ยังไม่มีบันทึกการสัมภาษณ์สำหรับนักเรียนคนนี้</p>
          <Link
            href={`/student_detail/${studentDocId}/interview/edit`}
            className="btn btn-warning rounded-0 text-uppercase fw-semibold me-2"
          >
            <i className="bi bi-plus-circle me-2"></i>เพิ่มบันทึกการสัมภาษณ์
          </Link>
          <Link
            href={`/student_detail/${studentDocId}`}
            className="btn btn-dark rounded-0 text-uppercase fw-semibold"
          >
            <i className="bi bi-arrow-left me-2"></i>กลับไปข้อมูลพื้นฐาน
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
              <div>
                <h2 className="text-uppercase fw-bold m-0">
                  <i className="bi bi-journal-text me-2 text-warning"></i>
                  บันทึกการสัมภาษณ์: {interview.student_name}
                </h2>
                <p className="text-muted mb-0 mt-1">
                  <i className="bi bi-clock me-1"></i>บันทึกเมื่อ: {interview.created_at} | แก้ไขล่าสุด: {interview.updated_at}
                </p>
              </div>
              <div>
                <span
                  className={`badge bg-${getStatusColor(interview.student_group)} rounded-0 text-uppercase fw-semibold p-2 me-2`}
                >
                  {interview.student_group}
                </span>
                <Link
                  href={`/student_detail/${studentDocId}/interview/edit`}
                  className="btn btn-warning rounded-0 text-uppercase fw-semibold me-2"
                >
                  <i className="bi bi-pencil me-2"></i>แก้ไขบันทึก
                </Link>
                <Link
                  href={`/student_detail/${studentDocId}`}
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
                  <p className="fw-bold mb-0">{interview.semester}/{interview.academic_year}</p>
                </div>
                <div className="col-md-3">
                  <span className="text-uppercase fw-semibold small">ผู้ปกครองที่ให้ข้อมูล:</span>
                  <p className="fw-bold mb-0">{interview.parent_name} ({interview.parent_relationship})</p>
                </div>
                <div className="col-md-2">
                  <span className="text-uppercase fw-semibold small">เบอร์ติดต่อ:</span>
                  <p className="mb-0">{interview.parent_phone}</p>
                </div>
                <div className="col-md-2">
                  <span className="text-uppercase fw-semibold small">ระดับชั้น/กลุ่ม:</span>
                  <p className="mb-0">{interview.student_level}/{interview.student_class}</p>
                </div>
                <div className="col-md-2">
                  <span className="text-uppercase fw-semibold small">เลขที่:</span>
                  <p className="mb-0">{interview.student_number}</p>
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
                  <p>{interview.family_status.join(", ")}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">พักอาศัยกับ</label>
                  <p>{interview.living_with} {interview.living_with_other && `(${interview.living_with_other})`}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">ลักษณะที่อยู่อาศัย</label>
                  <p>{interview.housing_type} {interview.housing_type_other && `(${interview.housing_type_other})`}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">การเดินทางมาโรงเรียน</label>
                  <p>{interview.transportation.join(", ")}</p>
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
                  <p>{interview.family_income} บาท</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">เงินมาโรงเรียน/วัน</label>
                  <p>{interview.daily_allowance} บาท</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">ความต้องการช่วยเหลือ</label>
                  <p>{interview.assistance_needs.join(", ")}</p>
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
                  <p>{interview.strengths || "-"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">วิชาที่ไม่ถนัด / ปัญหาการเรียน</label>
                  <p>{interview.weak_subjects || "-"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">งานอดิเรก/ความสนใจพิเศษ</label>
                  <p>{interview.hobbies || "-"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">พฤติกรรมที่บ้าน</label>
                  <p>{interview.home_behavior || "-"}</p>
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
                  <p>{interview.chronic_disease || "-"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">พฤติกรรมเสี่ยงที่ควรเฝ้าระวัง</label>
                  <p>{interview.risk_behaviors.join(", ")}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-uppercase fw-semibold small text-muted">ความกังวลใจของผู้ปกครอง</label>
                  <p>{interview.parent_concerns || "-"}</p>
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
                    <label className="form-label text-uppercase fw-semibold small text-muted">กลุ่มนักเรียน</label>
                    <p>
                      <span className={`badge bg-${getStatusColor(interview.student_group)} rounded-0 p-2`}>
                        {interview.student_group}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-10">
                    <label className="form-label text-uppercase fw-semibold small text-muted">แนวทางการช่วยเหลือ/ส่งต่อ</label>
                    <p>{interview.help_guidelines}</p>
                  </div>
                </div>
                {interview.home_visit_file && (
                  <div className="mt-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">แบบเยี่ยมบ้าน</label>
                    <div>
                      <a href={interview.home_visit_file} target="_blank" className="btn btn-sm btn-outline-primary rounded-0">
                        <i className="bi bi-file-earmark-pdf me-2"></i>ดูไฟล์แนบ
                      </a>
                    </div>
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