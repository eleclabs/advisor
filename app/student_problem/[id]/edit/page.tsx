"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

interface Activity {
  _id: string;
  name: string;
  objective?: string;
  duration: number;
  duration_period?: string;
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
  total_participants?: number;
  joined_count?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ ตัวเลือกวิธีการแก้ไขเริ่มต้น
const DEFAULT_METHODS = [
  "การให้คำปรึกษาเบื้องต้น",
  "กิจกรรมปรับเปลี่ยนพฤติกรรม",
  "การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง",
  "การส่งต่อ"
];

export default function EditProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [problem, setProblem] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [activitySearchTerm, setActivitySearchTerm] = useState("");
  
  // ✅ State สำหรับวิธีการแก้ไขแบบไดนามิก
  const [methods, setMethods] = useState<string[]>(DEFAULT_METHODS);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [newMethod, setNewMethod] = useState("");
  
  const [formData, setFormData] = useState({
    problem: "",
    goal: "",
    duration: "",
    responsible: "",
    progress: 0,
    isp_status: "กำลังดำเนินการ" as "กำลังดำเนินการ" | "สำเร็จ" | "ปรับแผน"
  });

  useEffect(() => {
    fetchData();
    fetchAllActivities();
  }, [id]);

  const fetchData = async () => {
    try {
      setFetchLoading(true);
      const res = await fetch(`/api/problem/${id}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        setProblem(data.data);
        
        // ✅ โหลดวิธีการแก้ไขจาก API (ถ้ามี)
        if (data.data.methods && Array.isArray(data.data.methods)) {
          setSelectedMethods(data.data.methods);
          // รวม methods จาก API เข้ากับ DEFAULT_METHODS
          const allMethods = [...new Set([...DEFAULT_METHODS, ...data.data.methods])];
          setMethods(allMethods);
        } else {
          // fallback จาก checkbox เก่า
          const loadedMethods: string[] = [];
          if (data.data.counseling) loadedMethods.push("การให้คำปรึกษาเบื้องต้น");
          if (data.data.behavioral_contract) loadedMethods.push("กิจกรรมปรับเปลี่ยนพฤติกรรม");
          if (data.data.home_visit) loadedMethods.push("การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง");
          if (data.data.referral) loadedMethods.push("การส่งต่อ");
          setSelectedMethods(loadedMethods);
        }
        
        setFormData({
          problem: data.data.problem || "",
          goal: data.data.goal || "",
          duration: data.data.duration || "",
          responsible: data.data.responsible || "",
          progress: data.data.progress || 0,
          isp_status: data.data.isp_status || "กำลังดำเนินการ"
        });
        
        // เตรียมกิจกรรมที่เลือกไว้แล้ว
        if (data.data.activities && data.data.activities.length > 0) {
          const selectedIds = data.data.activities
            .filter((a: any) => a.activity_id)
            .map((a: any) => a.activity_id.toString());
          setSelectedActivities(selectedIds);
        }
      }
    } catch (error) {
      console.error("Error fetching problem:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchAllActivities = async () => {
    try {
      const res = await fetch("/api/problem/activity");
      const data = await res.json();
      setActivities(data.data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  // ✅ Toggle วิธีการแก้ไข
  const toggleMethod = (method: string) => {
    setSelectedMethods(prev => 
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  // ✅ เพิ่มวิธีการแก้ไขใหม่
  const addNewMethod = () => {
    const trimmed = newMethod.trim();
    if (trimmed && !methods.includes(trimmed)) {
      setMethods(prev => [...prev, trimmed]);
      setSelectedMethods(prev => [...prev, trimmed]);
      setNewMethod("");
    }
  };

  // ✅ ลบวิธีการแก้ไข (เฉพาะที่เพิ่มเอง)
  const removeMethod = (method: string) => {
    setMethods(prev => prev.filter(m => m !== method));
    setSelectedMethods(prev => prev.filter(m => m !== method));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // เตรียมข้อมูลกิจกรรมที่เลือก
      const selectedActivitiesData = selectedActivities.map(actId => {
        const act = activities.find(a => a._id === actId);
        return act ? { 
          activity_id: act._id,
          name: act.name,
          duration: act.duration,
          materials: act.materials,
          steps: act.steps,
          ice_breaking: act.ice_breaking,
          group_task: act.group_task,
          debrief: act.debrief,
          activity_date: act.activity_date,
          status: "เข้าร่วมแล้ว"
        } : null;
      }).filter(Boolean);

      const res = await fetch(`/api/problem/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          methods: selectedMethods, // ✅ ส่งวิธีการแก้ไข
          activities: selectedActivitiesData
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("แก้ไขแผนการช่วยเหลือเรียบร้อย");
        router.push(`/student_problem/${id}`);
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

  const toggleActivity = (activityId: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const filteredActivities = activities.filter(act => 
    act.name.toLowerCase().includes(activitySearchTerm.toLowerCase())
  );

  if (fetchLoading) {
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
                แก้ไขแผนการช่วยเหลือ (การป้องกันและแก้ไขปัญหา)
              </h4>
            </div>
            <div className="card-body">
              {/* ข้อมูลนักเรียน */}
              {problem && (
                <div className="alert alert-info mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold fs-5">{problem.student_name}</div>
                      <div className="d-flex gap-3 mt-2">
                        <span className="badge bg-dark rounded-0">
                          <i className="bi bi-person-badge me-1"></i>
                          รหัส {problem.student_id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* ฟอร์มแผน ISP */}
                  <div className="col-md-6">
                    <h5 className="border-bottom pb-2 mb-3">📋 แผน</h5>
                    
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

                    {/* ✅ วิธีการแก้ไข - แบบไดนามิก */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">วิธีการแก้ไข</label>
                      
                      <div className="border p-3 mb-2">
                        {methods.map((method) => (
                          <div key={method} className="form-check d-flex align-items-center gap-2">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`method-${method}`}
                              checked={selectedMethods.includes(method)}
                              onChange={() => toggleMethod(method)}
                            />
                            <label className="form-check-label flex-grow-1" htmlFor={`method-${method}`}>
                              {method}
                            </label>
                            {!DEFAULT_METHODS.includes(method) && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger rounded-0"
                                onClick={() => removeMethod(method)}
                                title="ลบรายการนี้"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* ✅ ช่องเพิ่มวิธีการแก้ไขใหม่ */}
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="พิมพ์วิธีการแก้ไข..."
                          value={newMethod}
                          onChange={(e) => setNewMethod(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addNewMethod();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-warning rounded-0"
                          onClick={addNewMethod}
                          disabled={!newMethod.trim()}
                        >
                          <i className="bi bi-plus-lg me-1"></i>เพิ่ม
                        </button>
                      </div>
                      
                      {selectedMethods.length > 0 && (
                        <div className="mt-2">
                          <span className="badge bg-success rounded-0">
                            <i className="bi bi-check-circle me-1"></i>
                            เลือก {selectedMethods.length} วิธี
                          </span>
                          <div className="mt-1">
                            {selectedMethods.map(m => (
                              <span key={m} className="badge bg-light text-dark me-1 mb-1 border">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">ระยะเวลาดำเนินการ</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder=""
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

                    <div className="row">
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">สถานะ</label>
                        <select
                          className="form-select"
                          value={formData.isp_status}
                          onChange={(e) => setFormData({...formData, isp_status: e.target.value as any})}
                        >
                          <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                          <option value="สำเร็จ">สำเร็จ</option>
                          <option value="ปรับแผน">ปรับแผน</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ส่วนเลือกกิจกรรม */}
                  <div className="col-md-6">
                    <h5 className="border-bottom pb-2 mb-3">🎯 เลือกกิจกรรมที่เข้าร่วม</h5>
                    
                    <div className="mb-3">
                      <div className="input-group">
                        <span className="input-group-text bg-dark text-white">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="ค้นหากิจกรรม..."
                          value={activitySearchTerm}
                          onChange={(e) => setActivitySearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="border p-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {filteredActivities.length === 0 ? (
                        <p className="text-muted text-center py-4">ไม่มีกิจกรรม</p>
                      ) : (
                        filteredActivities.map((act) => {
                          return (
                            <div key={act._id} className="card mb-2 border-0 bg-light">
                              <div className="card-body p-2">
                                <div className="form-check">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={act._id}
                                    checked={selectedActivities.includes(act._id)}
                                    onChange={() => toggleActivity(act._id)}
                                  />
                                  <label className="form-check-label w-100" htmlFor={act._id}>
                                    <div className="d-flex justify-content-between">
                                      <span className="fw-bold">{act.name}</span>
                                      <small className="text-muted">{act.duration} นาที</small>
                                    </div>
                                    <small className="text-muted d-block">
                                      วันที่: {act.activity_date ? new Date(act.activity_date).toLocaleDateString('th-TH') : '-'}
                                    </small>
                                  </label>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {selectedActivities.length > 0 && (
                      <div className="mt-2 text-success">
                        <i className="bi bi-check-circle me-1"></i>
                        เลือกแล้ว {selectedActivities.length} กิจกรรม
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Link href={`/student_problem/${id}`} className="btn btn-secondary">
                    ยกเลิก
                  </Link>
                  <button type="submit" className="btn btn-warning" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>
                        บันทึกการแก้ไข
                      </>
                    )}
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