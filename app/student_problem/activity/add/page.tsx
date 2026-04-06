// D:\advisor-main\app\student_problem\activity\add\page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  student_name: string;
}

// ตรวจสอบว่า export default ถูกต้อง
export default function AddActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    objective: "",
    duration: 60,
    duration_period: "",
    materials: "",
    steps: "",
    ice_breaking: "",
    group_task: "",
    debrief: "",
    student_ids: [] as string[]
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = students.filter(student => 
        student.student_name?.toLowerCase().includes(term) || 
        student.id?.toLowerCase().includes(term)
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await fetch("/api/problem");
      const data = await res.json();
      
      const studentList = (data.data || []).map((p: any) => ({
        id: p.student_id,
        student_name: p.student_name
      }));
      
      setStudents(studentList);
      setFilteredStudents(studentList);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const res = await fetch("/api/problem/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(data.message || "เพิ่มกิจกรรมเรียบร้อย");
        router.push("/student_problem?tab=activities");
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

  const handleStudentSelect = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      student_ids: prev.student_ids.includes(studentId)
        ? prev.student_ids.filter(id => id !== studentId)
        : [...prev.student_ids, studentId]
    }));
  };

  // ถ้ายังโหลดนักเรียนอยู่
  if (loadingStudents) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-2 text-muted">กำลังโหลดข้อมูลนักเรียน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h4 className="mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                เพิ่มกิจกรรมสาขาวิชา
              </h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* ฟอร์มกิจกรรม */}
                  <div className="col-md-7">
                    <h5 className="border-bottom pb-2 mb-3">📋 รายละเอียดกิจกรรม</h5>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold">ชื่อกิจกรรม</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        placeholder="เช่น ละลายพฤติกรรม สร้างทีม"
                      />
                    </div>

                    {/* วัตถุประสงค์ / เป้าหมายกิจกรรม */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        วัตถุประสงค์ / เป้าหมายกิจกรรม
                        <small className="text-muted ms-2">(เพื่อแก้ปัญหาอะไร)</small>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.objective}
                        onChange={(e) => setFormData({...formData, objective: e.target.value})}
                        placeholder="เช่น ลดความขัดแย้ง / เสริมการทำงานเป็นทีม / พัฒนาการสื่อสาร"
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">เวลา (นาที)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 60})}
                          min="1"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">อุปกรณ์</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.materials}
                          onChange={(e) => setFormData({...formData, materials: e.target.value})}
                          placeholder="กระดาษ, ปากกา, บอลล์"
                        />
                      </div>
                    </div>

                    {/* ระยะเวลาดำเนินการ / ครั้งที่จัด */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        ระยะเวลาดำเนินการ / ครั้งที่จัด
                        <small className="text-muted ms-2">(ทำครั้งเดียว หรือ ต่อเนื่อง)</small>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.duration_period}
                        onChange={(e) => setFormData({...formData, duration_period: e.target.value})}
                        placeholder="ครั้งที่ 1 / 1 หรือ ก.พ. – มี.ค. 2569"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">ขั้นตอน</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={formData.steps}
                        onChange={(e) => setFormData({...formData, steps: e.target.value})}
                        placeholder="1. แนะนำตัว
2. จับคู่ทำกิจกรรม
3. สรุปผล"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">ละลายพฤติกรรม</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.ice_breaking}
                        onChange={(e) => setFormData({...formData, ice_breaking: e.target.value})}
                        placeholder="เกมหรือกิจกรรมละลายพฤติกรรม"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">โจทย์สาขาวิชา</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.group_task}
                        onChange={(e) => setFormData({...formData, group_task: e.target.value})}
                        placeholder="โจทย์ที่ให้สาขาวิชาทำ"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">ถอดบทเรียน (AAR)</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="สิ่งที่ได้เรียนรู้จากการทำงานร่วมกับเพื่อน"
                        value={formData.debrief}
                        onChange={(e) => setFormData({...formData, debrief: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* ส่วนเลือกนักเรียน */}
                  <div className="col-md-5">
                    <h5 className="border-bottom pb-2 mb-3">
                      👥 เลือกนักเรียนที่เข้าร่วม 
                      <small className="text-muted ms-2">(ไม่บังคับ)</small>
                    </h5>
                    
                    <div className="mb-3">
                      <div className="input-group">
                        <span className="input-group-text bg-dark text-white">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="ค้นหาชื่อหรือรหัสนักเรียน..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="border p-3 bg-light" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {loadingStudents ? (
                          <div className="text-center py-4">
                            <div className="spinner-border spinner-border-sm text-warning me-2"></div>
                            <span className="text-muted">กำลังโหลด...</span>
                          </div>
                        ) : filteredStudents.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-muted mb-0">ไม่พบนักเรียน</p>
                          </div>
                        ) : (
                          filteredStudents.map((student) => (
                            <div key={student.id} className="form-check mb-2">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={student.id}
                                checked={formData.student_ids.includes(student.id)}
                                onChange={() => handleStudentSelect(student.id)}
                              />
                              <label className="form-check-label" htmlFor={student.id}>
                                {student.student_name} <small className="text-muted">({student.id})</small>
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {formData.student_ids.length > 0 ? (
                        <div className="mt-2 text-success">
                          <i className="bi bi-check-circle me-1"></i>
                          เลือกแล้ว {formData.student_ids.length} คน
                        </div>
                      ) : (
                        <div className="mt-2 text-muted small">
                          <i className="bi bi-info-circle me-1"></i>
                          ไม่เลือกนักเรียนก็ได้
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Link href="/student_problem?tab=activities" className="btn btn-secondary">
                    ยกเลิก
                  </Link>
                  <button type="submit" className="btn btn-warning" disabled={loading}>
                    {loading ? "กำลังบันทึก..." : "บันทึกกิจกรรม"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}