"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddProblemPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: กรอกรหัส, 2: กรอกฟอร์ม
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [student, setStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    problem: "",
    goal: "",
    counseling: false,
    behavioral_contract: false,
    home_visit: false,
    referral: false,
    duration: "",
    responsible: ""
  });

  // ขั้นตอนที่ 1: ค้นหานักเรียน
  const searchStudent = async () => {
    if (!studentId.trim()) {
      alert("กรุณากรอกรหัสนักเรียน");
      return;
    }

    setLoading(true);
    try {
      // เรียก API เพื่อตรวจสอบว่านักเรียนมีอยู่จริง และยังไม่มีแผน
      const res = await fetch(`/api/problem/${studentId}`);
      const data = await res.json();
      
      if (data.success) {
        if (data.data.student_data) {
          // นักเรียนมีอยู่ และยังไม่มีแผน
          setStudent(data.data.student_data);
          setStep(2); // ไปขั้นตอนกรอกฟอร์ม
        } else if (data.data.student_id) {
          // นักเรียนมีแผนแล้ว
          alert("นักเรียนนี้มีแผนการช่วยเหลือแล้ว");
        }
      } else {
        alert(data.error || "ไม่พบรหัสนักเรียนนี้ในระบบ");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setLoading(false);
    }
  };

  // ขั้นตอนที่ 2: บันทึกแผน
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/problem/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: student.id,
          ...formData
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("เพิ่มแผนการช่วยเหลือเรียบร้อย");
        router.push("/student_problem");
      } else {
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h4 className="mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                เพิ่มแผนการช่วยเหลือนักเรียน
              </h4>
            </div>
            <div className="card-body">
              {/* ขั้นตอนที่ 1: กรอกรหัสนักเรียน */}
              {step === 1 && (
                <div>
                  <div className="text-center mb-4">
                    <div className="badge bg-warning text-dark p-2">ขั้นตอนที่ 1</div>
                    <h5 className="mt-2">กรอกรหัสนักเรียน</h5>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-bold">รหัสนักเรียน</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="เช่น 66002"
                        disabled={loading}
                      />
                      <button
                        className="btn btn-warning"
                        onClick={searchStudent}
                        disabled={loading || !studentId.trim()}
                      >
                        {loading ? "กำลังค้นหา..." : "ค้นหา"}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Link href="/student_problem" className="btn btn-secondary">
                      ยกเลิก
                    </Link>
                  </div>
                </div>
              )}

              {/* ขั้นตอนที่ 2: กรอกฟอร์มแผน */}
              {step === 2 && student && (
                <div>
                  <div className="text-center mb-4">
                    <div className="badge bg-warning text-dark p-2">ขั้นตอนที่ 2</div>
                    <h5 className="mt-2">กรอกแผนการช่วยเหลือ</h5>
                  </div>

                  {/* แสดงข้อมูลนักเรียน */}
                  <div className="alert alert-info mb-4">
                    <div className="row">
                      <div className="col-md-6">
                        <strong>รหัสนักเรียน:</strong> {student.id}<br/>
                        <strong>ชื่อ-สกุล:</strong> {student.prefix || ''} {student.first_name || ''} {student.last_name || ''}
                      </div>
                      <div className="col-md-6">
                        <strong>ชั้น/กลุ่ม:</strong> {student.level || '-'} {student.class_group || ''}<br/>
                        <strong>สถานะ:</strong> {student.status || 'ปกติ'}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">ปัญหาที่พบ</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="เช่น ขาดเรียนบ่อย, ซึมเศร้า, ติดเกม, ก้าวร้าว"
                        value={formData.problem}
                        onChange={(e) => setFormData({...formData, problem: e.target.value})}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">เป้าหมาย</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="เช่น ลดสถิติการขาดเรียน, พัฒนาทักษะการควบคุมอารมณ์"
                        value={formData.goal}
                        onChange={(e) => setFormData({...formData, goal: e.target.value})}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">วิธีการแก้ไข</label>
                      <div className="border p-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="counseling"
                            checked={formData.counseling}
                            onChange={(e) => setFormData({...formData, counseling: e.target.checked})}
                          />
                          <label className="form-check-label" htmlFor="counseling">
                            การให้คำปรึกษาเบื้องต้น (Counseling)
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="behavioral"
                            checked={formData.behavioral_contract}
                            onChange={(e) => setFormData({...formData, behavioral_contract: e.target.checked})}
                          />
                          <label className="form-check-label" htmlFor="behavioral">
                            กิจกรรมปรับเปลี่ยนพฤติกรรม (Behavioral Contract)
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="homevisit"
                            checked={formData.home_visit}
                            onChange={(e) => setFormData({...formData, home_visit: e.target.checked})}
                          />
                          <label className="form-check-label" htmlFor="homevisit">
                            การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="referral"
                            checked={formData.referral}
                            onChange={(e) => setFormData({...formData, referral: e.target.checked})}
                          />
                          <label className="form-check-label" htmlFor="referral">
                            การส่งต่อ (Internal/External Referral)
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">ระยะเวลาดำเนินการ</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="เช่น 3 เดือน"
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">ผู้รับผิดชอบ</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="ชื่อผู้รับผิดชอบ"
                          value={formData.responsible}
                          onChange={(e) => setFormData({...formData, responsible: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setStep(1);
                          setStudent(null);
                          setStudentId("");
                        }}
                      >
                        กลับ
                      </button>
                      <button type="submit" className="btn btn-warning" disabled={loading}>
                        {loading ? "กำลังบันทึก..." : "บันทึกแผน"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}