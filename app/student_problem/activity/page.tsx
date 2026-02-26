"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Activity {
  _id?: string;
  name: string;
  duration: number;
  materials: string;
  step1: string;
  step2: string;
  step3: string;
  ice_breaking: string;
  group_task: string;
  debrief: string;
  activity_date?: string;
  joined: boolean;
  student_id?: string;
  student_name?: string;
  index?: number;
}

interface Student {
  student_id: string;
  student_name: string;
}

export default function ActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    duration: 60,
    materials: "",
    step1: "",
    step2: "",
    step3: "",
    ice_breaking: "",
    group_task: "",
    debrief: "",
    student_ids: [] as string[]
  });

  useEffect(() => {
    fetchActivities();
    fetchStudents();
  }, []);

  const fetchActivities = async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/problem/activity");
      const data = await res.json();
      console.log("Activities fetched:", data);
      setActivities(data.data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setFetching(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/problem");
      const data = await res.json();
      console.log("Students fetched:", data);
      
      // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
      const studentList = (data.data || []).map((p: any) => ({
        student_id: p.student_id,
        student_name: p.student_name
      }));
      
      setStudents(studentList);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.student_ids.length === 0) {
      alert("กรุณาเลือกนักเรียนที่เข้าร่วมกิจกรรม");
      return;
    }

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
        setFormData({
          name: "",
          duration: 60,
          materials: "",
          step1: "",
          step2: "",
          step3: "",
          ice_breaking: "",
          group_task: "",
          debrief: "",
          student_ids: []
        });
        fetchActivities();
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center border-bottom border-3 border-warning pb-2">
            <h2 className="fw-bold">
              <i className="bi bi-activity text-warning me-2"></i>
              จัดการกิจกรรมกลุ่มสัมพันธ์
            </h2>
          </div>
        </div>
      </div>

      <div className="row">
        {/* ฟอร์มเพิ่มกิจกรรม */}
        <div className="col-lg-5 mb-4">
          <div className="card rounded-0 border-0 shadow-sm">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="mb-0">
                <i className="bi bi-plus-circle me-2 text-warning"></i>
                เพิ่มกิจกรรมใหม่
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">ชื่อกิจกรรม</label>
                  <input
                    type="text"
                    className="form-control rounded-0"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="เช่น ละลายพฤติกรรม สร้างทีม"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">เวลา (นาที)</label>
                    <input
                      type="number"
                      className="form-control rounded-0"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 60})}
                      min="1"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">อุปกรณ์</label>
                    <input
                      type="text"
                      className="form-control rounded-0"
                      value={formData.materials}
                      onChange={(e) => setFormData({...formData, materials: e.target.value})}
                      placeholder="กระดาษ, ปากกา, บอลล์"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">ขั้นตอน</label>
                  <input
                    type="text"
                    className="form-control rounded-0 mb-2"
                    placeholder="ขั้นตอนที่ 1"
                    value={formData.step1}
                    onChange={(e) => setFormData({...formData, step1: e.target.value})}
                  />
                  <input
                    type="text"
                    className="form-control rounded-0 mb-2"
                    placeholder="ขั้นตอนที่ 2"
                    value={formData.step2}
                    onChange={(e) => setFormData({...formData, step2: e.target.value})}
                  />
                  <input
                    type="text"
                    className="form-control rounded-0"
                    placeholder="ขั้นตอนที่ 3"
                    value={formData.step3}
                    onChange={(e) => setFormData({...formData, step3: e.target.value})}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">ละลายพฤติกรรม</label>
                  <input
                    type="text"
                    className="form-control rounded-0"
                    value={formData.ice_breaking}
                    onChange={(e) => setFormData({...formData, ice_breaking: e.target.value})}
                    placeholder="เกมหรือกิจกรรมละลายพฤติกรรม"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">โจทย์กลุ่ม</label>
                  <input
                    type="text"
                    className="form-control rounded-0"
                    value={formData.group_task}
                    onChange={(e) => setFormData({...formData, group_task: e.target.value})}
                    placeholder="โจทย์ที่ให้กลุ่มทำ"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">ถอดบทเรียน (AAR)</label>
                  <textarea
                    className="form-control rounded-0"
                    rows={3}
                    placeholder="สิ่งที่ได้เรียนรู้จากการทำงานร่วมกับเพื่อน"
                    value={formData.debrief}
                    onChange={(e) => setFormData({...formData, debrief: e.target.value})}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">เลือกนักเรียนที่เข้าร่วม</label>
                  <div className="border rounded-0 p-3 bg-light" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {students.length === 0 ? (
                      <p className="text-muted text-center py-3">ไม่มีข้อมูลนักเรียน</p>
                    ) : (
                      students.map((s) => (
                        <div className="form-check mb-2" key={s.student_id}>
                          <input
                            type="checkbox"
                            className="form-check-input rounded-0"
                            id={s.student_id}
                            checked={formData.student_ids.includes(s.student_id)}
                            onChange={() => handleStudentSelect(s.student_id)}
                          />
                          <label className="form-check-label" htmlFor={s.student_id}>
                            {s.student_name} <small className="text-muted">({s.student_id})</small>
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  {formData.student_ids.length > 0 && (
                    <small className="text-success mt-1 d-block">
                      เลือกแล้ว {formData.student_ids.length} คน
                    </small>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-warning rounded-0 w-100 py-2 fw-bold" 
                  disabled={loading || formData.student_ids.length === 0}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save me-2"></i>
                      บันทึกกิจกรรม
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* รายการกิจกรรม */}
        <div className="col-lg-7 mb-4">
          <div className="card rounded-0 border-0 shadow-sm">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="mb-0">
                <i className="bi bi-list-check me-2 text-warning"></i>
                รายการกิจกรรมทั้งหมด ({activities.length})
              </h5>
            </div>
            <div className="card-body p-0">
              {fetching ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">กำลังโหลด...</span>
                  </div>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-calendar-x fs-1 text-muted d-block mb-3"></i>
                  <p className="text-muted mb-0">ยังไม่มีกิจกรรม</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {activities.map((act, idx) => (
                    <div key={idx} className="list-group-item p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <h6 className="fw-bold mb-0 me-2">{act.name}</h6>
                            <span className={`badge rounded-0 ${act.joined ? 'bg-success' : 'bg-secondary'}`}>
                              {act.joined ? 'เข้าร่วมแล้ว' : 'รอเข้าร่วม'}
                            </span>
                          </div>
                          
                          <div className="row small">
                            <div className="col-md-6 mb-1">
                              <i className="bi bi-clock me-2 text-warning"></i>
                              {act.duration} นาที
                            </div>
                            <div className="col-md-6 mb-1">
                              <i className="bi bi-person me-2 text-warning"></i>
                              {act.student_name}
                            </div>
                            <div className="col-md-6 mb-1">
                              <i className="bi bi-calendar me-2 text-warning"></i>
                              {formatDate(act.activity_date)}
                            </div>
                            <div className="col-md-6 mb-1">
                              <i className="bi bi-tools me-2 text-warning"></i>
                              {act.materials || 'ไม่มีอุปกรณ์'}
                            </div>
                          </div>

                          {act.debrief && (
                            <div className="mt-2 p-2 bg-light small">
                              <i className="bi bi-chat-quote me-1 text-warning"></i>
                              {act.debrief.length > 100 
                                ? act.debrief.substring(0, 100) + '...' 
                                : act.debrief}
                            </div>
                          )}
                        </div>
                        
                        <Link 
                          href={`/student_problem/activity/edit?student_id=${act.student_id}&index=${act.index}`}
                          className="btn btn-sm btn-outline-warning rounded-0 ms-3"
                          title="แก้ไขกิจกรรม"
                        >
                          <i className="bi bi-pencil"></i>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}