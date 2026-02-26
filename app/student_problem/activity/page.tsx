"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    fetchData();
    fetchStudents();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/problem/activity");
      const data = await res.json();
      setActivities(data.data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/problem");
      const data = await res.json();
      setStudents(data.data || []);
    } catch (error) {
      console.error("Error:", error);
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
      
      if (res.ok) {
        alert("เพิ่มกิจกรรมเรียบร้อย");
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
        fetchData();
      }
    } catch (error) {
      console.error("Error:", error);
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

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-5">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                เพิ่มกิจกรรมกลุ่มสัมพันธ์
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
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

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">เวลา (นาที)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
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

                <div className="mb-3">
                  <label className="form-label fw-bold">ขั้นตอน</label>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="ขั้นตอนที่ 1"
                    value={formData.step1}
                    onChange={(e) => setFormData({...formData, step1: e.target.value})}
                  />
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="ขั้นตอนที่ 2"
                    value={formData.step2}
                    onChange={(e) => setFormData({...formData, step2: e.target.value})}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ขั้นตอนที่ 3"
                    value={formData.step3}
                    onChange={(e) => setFormData({...formData, step3: e.target.value})}
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
                  <label className="form-label fw-bold">โจทย์กลุ่ม</label>
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
                    rows={2}
                    placeholder="สิ่งที่ได้เรียนรู้จากการทำงานร่วมกับเพื่อน"
                    value={formData.debrief}
                    onChange={(e) => setFormData({...formData, debrief: e.target.value})}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">เลือกนักเรียนที่เข้าร่วม</label>
                  <div className="border p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {students.map(s => (
                      <div className="form-check" key={s.student_id}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={formData.student_ids.includes(s.student_id)}
                          onChange={() => handleStudentSelect(s.student_id)}
                        />
                        <label className="form-check-label">
                          {s.student_name} ({s.student_id})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn btn-warning w-100" disabled={loading}>
                  {loading ? "กำลังบันทึก..." : "บันทึกกิจกรรม"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                <i className="bi bi-list-check me-2"></i>
                รายการกิจกรรมทั้งหมด
              </h5>
            </div>
            <div className="card-body">
              {activities.map((act, idx) => (
                <div key={idx} className="border mb-3 p-3">
                  <div className="d-flex justify-content-between">
                    <h6 className="fw-bold">{act.name}</h6>
                    <Link href={`/problem/activity/edit?student_id=${act.student_id}&index=${act.index}`}
                          className="btn btn-sm btn-outline-warning">
                      <i className="bi bi-pencil"></i>
                    </Link>
                  </div>
                  <p className="small mb-1">
                    <i className="bi bi-clock me-2"></i>{act.duration} นาที
                  </p>
                  <p className="small mb-1">
                    <i className="bi bi-people me-2"></i>{act.student_name}
                  </p>
                  <p className="small mb-1">
                    <i className="bi bi-calendar me-2"></i>
                    {act.activity_date ? new Date(act.activity_date).toLocaleDateString('th-TH') : '-'}
                  </p>
                  <div className="mt-2">
                    <span className={`badge ${act.joined ? 'bg-success' : 'bg-secondary'}`}>
                      {act.joined ? 'เข้าร่วมแล้ว' : 'รอเข้าร่วม'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}