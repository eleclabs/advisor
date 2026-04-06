// D:\advisor-main\app\student_problem\activity\edit\page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Student {
  id: string;
  student_name: string;
}

interface Activity {
  _id: string;
  name: string;
  objective: string;
  duration: number;
  duration_period: string;
  materials: string;
  steps: string;
  ice_breaking: string;
  group_task: string;
  debrief: string;
  activity_date: string;
  participants: Array<{
    student_id: string;
    student_name: string;
    joined: boolean;
    joined_at?: string;
  }>;
}

export default function EditActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
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
    activity_date: "",
    student_ids: [] as string[]
  });

  useEffect(() => {
    if (id) {
      fetchData();
    } else {
      router.push("/student_problem?tab=activities");
    }
  }, [id]);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // ดึงข้อมูลกิจกรรม
      const activityRes = await fetch(`/api/problem/activity?id=${id}`);
      const activityData = await activityRes.json();
      
      // ดึงรายชื่อนักเรียนทั้งหมด
      const studentsRes = await fetch("/api/problem");
      const studentsData = await studentsRes.json();
      
      if (activityData.success) {
        const activity = activityData.data;
        
        // เตรียม student_ids จาก participants
        const participantIds = activity.participants?.map((p: any) => p.student_id) || [];
        
        setFormData({
          name: activity.name || "",
          objective: activity.objective || "",
          duration: activity.duration || 60,
          duration_period: activity.duration_period || "",
          materials: activity.materials || "",
          steps: activity.steps || "",
          ice_breaking: activity.ice_breaking || "",
          group_task: activity.group_task || "",
          debrief: activity.debrief || "",
          activity_date: activity.activity_date ? new Date(activity.activity_date).toISOString().split('T')[0] : "",
          student_ids: participantIds
        });
      }
      
      if (studentsData.success) {
        const studentList = (studentsData.data || []).map((p: any) => ({
          id: p.student_id,
          student_name: p.student_name
        }));
        setStudents(studentList);
        setFilteredStudents(studentList);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    
    try {
      const res = await fetch(`/api/problem/activity?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("แก้ไขกิจกรรมเรียบร้อย");
        router.push(`/student_problem/activity/view?id=${id}`);
      } else {
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "-";
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-2 text-muted">กำลังโหลดข้อมูล...</p>
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
                <i className="bi bi-pencil-square me-2"></i>
                แก้ไขกิจกรรมสาขาวิชา
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
                      />
                    </div>

                    {/* วัตถุประสงค์ */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">วัตถุประสงค์ / เป้าหมายกิจกรรม</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.objective}
                        onChange={(e) => setFormData({...formData, objective: e.target.value})}
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
                        />
                      </div>
                    </div>

                    {/* วันที่จัดกิจกรรม */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">วันที่จัดกิจกรรม</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.activity_date}
                        onChange={(e) => setFormData({...formData, activity_date: e.target.value})}
                      />
                    </div>

                    {/* ระยะเวลาดำเนินการ */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">ระยะเวลาดำเนินการ / ครั้งที่จัด</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.duration_period}
                        onChange={(e) => setFormData({...formData, duration_period: e.target.value})}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">ขั้นตอน</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={formData.steps}
                        onChange={(e) => setFormData({...formData, steps: e.target.value})}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">ละลายพฤติกรรม</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.ice_breaking}
                        onChange={(e) => setFormData({...formData, ice_breaking: e.target.value})}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">โจทย์สาขาวิชา</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.group_task}
                        onChange={(e) => setFormData({...formData, group_task: e.target.value})}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">ถอดบทเรียน (AAR)</label>
                      <textarea
                        className="form-control"
                        rows={3}
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
                        {filteredStudents.length === 0 ? (
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
                      
                      <div className="mt-2">
                        <span className="text-success">
                          <i className="bi bi-check-circle me-1"></i>
                          เลือกแล้ว {formData.student_ids.length} คน
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Link href={`/student_problem/activity/view?id=${id}`} className="btn btn-secondary">
                    ยกเลิก
                  </Link>
                  <button type="submit" className="btn btn-warning" disabled={saving}>
                    {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
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