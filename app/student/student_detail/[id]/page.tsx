"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface StudentBasic {
  _id: string;
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  name?: string;
  status: string;
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
  bmi: string;
  blood_type: string;
  image?: string;
  email?: string;
}

export default function StudentBasicPage() {
  const router = useRouter();
  const params = useParams();
  const studentDocId = params?.id as string;
  
  console.log("📝 Student _id from params:", studentDocId);

  const [student, setStudent] = useState<StudentBasic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  
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
        console.log("🔍 Fetching student with _id:", studentDocId);
        
        const response = await fetch("/api/student");
        const result = await response.json();
        
        let studentsData = [];
        if (result.success && Array.isArray(result.data)) {
          studentsData = result.data;
        }
        
        const foundStudent = studentsData.find((s: any) => s._id === studentDocId);
        
        if (foundStudent) {
          console.log("📥 Found student data:", foundStudent); // ✅ ดูว่ามี class_number มั้ย
          
          const formattedData: StudentBasic = {
            _id: foundStudent._id,
            id: foundStudent.id || "",
            prefix: foundStudent.prefix || "",
            first_name: foundStudent.first_name || "",
            last_name: foundStudent.last_name || "",
            name: `${foundStudent.prefix || ''}${foundStudent.first_name || ''} ${foundStudent.last_name || ''}`.trim(),
            status: foundStudent.status || "ปกติ",
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
            bmi: foundStudent.bmi || "",
            blood_type: foundStudent.blood_type || "",
            image: foundStudent.image || "",
            email: foundStudent.email || "",
          };
          setStudent(formattedData);
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH');
    } catch {
      return dateStr;
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

  if (error || !student) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="alert alert-danger mb-0" style={{ minWidth: '300px' }}>
          <p className="mb-0">{error || "ไม่พบข้อมูลนักเรียน"}</p>
          <div className="mt-3 d-flex gap-2">
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-sm btn-warning"
            >
              <i className="bi bi-arrow-repeat me-2"></i>ลองอีกครั้ง
            </button>
            <Link href="/student" className="btn btn-sm btn-dark">
              <i className="bi bi-arrow-left me-2"></i>กลับไป
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      

      <div className="container-fluid py-4">
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
                  href={`/student/student_detail/${student._id}/interview`}
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
                  {/* รูปโปรไฟล์ */}
                  <div className="col-md-12">
                    <div className="d-flex align-items-start gap-4 mb-4">
                      <div className="text-center">
                        {student.image ? (
                          <img 
                            src={student.image} 
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
                        <h4 className="fw-bold mb-1">{student.name}</h4>
                        <p className="text-muted mb-2">รหัสนักศึกษา: {student.id}</p>
                        <span
                          className={`badge rounded-0 text-uppercase fw-semibold p-2 ${
                            student.status === "ปกติ"
                              ? "bg-success"
                              : student.status === "เสี่ยง"
                              ? "bg-warning text-dark"
                              : "bg-danger"
                          }`}
                        >
                          สถานะ: {student.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ชื่อ-นามสกุล</label>
                    <p className="fw-bold">{student.name}</p>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ชื่อเล่น</label>
                    <p>{student.nickname || "-"}</p>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label text-uppercase fw-semibold small text-muted">เพศ</label>
                    <p>{student.gender || "-"}</p>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label text-uppercase fw-semibold small text-muted">วันเกิด</label>
                    <p>{formatDate(student.birth_date)}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ระดับชั้น</label>
                    <p>{student.level}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">กลุ่มเรียน</label>
                    <p>{student.class_group || "-"}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">เลขที่</label>  {/* ✅ เพิ่มเลขที่ */}
                    <p className="fw-bold">{student.class_number || "-"}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ครูที่ปรึกษา</label>
                    <p>{student.advisor_name || "-"}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">เบอร์โทรศัพท์</label>
                    <p>{student.phone_number || "-"}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ศาสนา</label>
                    <p>{student.religion || "-"}</p>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-uppercase fw-semibold small text-muted">ที่อยู่</label>
                    <p>{student.address || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="border bg-white p-3">
              <label className="form-label text-uppercase fw-semibold small text-muted">น้ำหนัก</label>
              <p className="fw-bold h3">{student.weight || "0"} กก.</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="border bg-white p-3">
              <label className="form-label text-uppercase fw-semibold small text-muted">ส่วนสูง</label>
              <p className="fw-bold h3">{student.height || "0"} ซม.</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="border bg-white p-3">
              <label className="form-label text-uppercase fw-semibold small text-muted">BMI</label>
              <p className="fw-bold h3">{student.bmi || "0"}</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="border bg-white p-3">
              <label className="form-label text-uppercase fw-semibold small text-muted">หมู่เลือด</label>
              <p className="fw-bold h3">{student.blood_type || "-"}</p>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12 d-flex justify-content-end gap-2">
            <Link
              href={`/student/student_detail/${student._id}/assessment/sdq`}
              className="btn btn-info rounded-0 text-uppercase fw-semibold me-2"
            >
              <i className="bi bi-clipboard-data me-2"></i>SDQ
            </Link>
            <Link
              href={`/student/student_detail/${student._id}/assessment/dass21`}
              className="btn btn-warning rounded-0 text-uppercase fw-semibold me-2"
            >
              <i className="bi bi-clipboard-heart me-2"></i>DASS-21
            </Link>
            <Link
              href={`/student/student_detail/${student._id}/edit`}
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
      </div>

    </div>
  );
}