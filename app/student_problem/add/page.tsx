// D:\advisor-main\app\student_problem\add\page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Activity {
  _id: string;
  name: string;
  duration: number;
  materials: string;
  steps: string;
  ice_breaking: string;
  group_task: string;
  debrief: string;
  activity_date: string;
}

interface Student {
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  level: string;
  class_group: string;
  status: string;
}

// ✅ ตัวเลือกวิธีการแก้ไขเริ่มต้น
const DEFAULT_METHODS = [
  "การให้คำปรึกษาเบื้องต้น",
  "กิจกรรมปรับเปลี่ยนพฤติกรรม",
  "การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง",
  "การส่งต่อ"
];

export default function AddProblemPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [student, setStudent] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [activitySearchTerm, setActivitySearchTerm] = useState("");
  
  // ✅ State สำหรับวิธีการแก้ไข
  const [methods, setMethods] = useState<string[]>(DEFAULT_METHODS);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [newMethod, setNewMethod] = useState("");
  
  const [formData, setFormData] = useState({
    problem: "",
    goal: "",
    duration: "",
    responsible: ""
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    const searchStudents = async () => {
      if (searchQuery.length < 1) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(`/api/problem/add?q=${searchQuery}`);
        const data = await res.json();
        if (data.success) setSearchResults(data.data || []);
      } catch (error) {
        console.error("Error searching students:", error);
      } finally {
        setSearching(false);
      }
    };
    const debounce = setTimeout(() => searchStudents(), 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/problem/activity");
      const data = await res.json();
      setActivities(data.data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const selectStudent = (selectedStudent: Student) => {
    setStudent(selectedStudent);
    setSearchQuery("");
    setSearchResults([]);
    setStep(2);
  };

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
          ...formData,
          methods: selectedMethods,
          activity_ids: selectedActivities
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

  const toggleActivity = (activityId: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
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

  // ✅ ลบวิธีการแก้ไข
  const removeMethod = (method: string) => {
    if (DEFAULT_METHODS.includes(method)) {
      setSelectedMethods(prev => prev.filter(m => m !== method));
      return;
    }
    setMethods(prev => prev.filter(m => m !== method));
    setSelectedMethods(prev => prev.filter(m => m !== method));
  };

  const filteredActivities = activities.filter(act => 
    act.name.toLowerCase().includes(activitySearchTerm.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('th-TH');
    } catch {
      return '-';
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h4 className="mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                เพิ่มแผนการช่วยเหลือผู้เรียน (การป้องกันและแก้ไขปัญหา)
              </h4>
            </div>
            <div className="card-body">
              {/* ขั้นตอนที่ 1: ค้นหาและเลือกผู้เรียน */}
              {step === 1 && (
                <div>
                  <div className="text-center mb-4">
                    <div className="badge bg-warning text-dark p-2">ขั้นตอนที่ 1</div>
                    <h5 className="mt-2">ค้นหาและเลือกผู้เรียน</h5>
                    <p className="text-muted">พิมพ์ชื่อหรือรหัสเพื่อค้นหา</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-bold">ค้นหาผู้เรียน</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark text-white">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="พิมพ์ชื่อหรือรหัส..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setSearchResults([]);
                          }}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  {searching && (
                    <div className="text-center py-4">
                      <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">กำลังค้นหา...</span>
                      </div>
                      <p className="mt-2 text-muted">กำลังค้นหาข้อมูล...</p>
                    </div>
                  )}

                  {!searching && searchResults.length > 0 && (
                    <div className="table-responsive">
                      <table className="table table-bordered table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>รหัส</th>
                            <th>คำนำหน้า</th>
                            <th>ชื่อ</th>
                            <th>นามสกุล</th>
                            <th>ระดับชั้น</th>
                            <th>สาขาวิชา</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults.map((student) => (
                            <tr key={student.id}>
                              <td className="align-middle">
                                <span className="fw-bold">{student.id}</span>
                              </td>
                              <td className="align-middle">{student.prefix}</td>
                              <td className="align-middle">{student.first_name}</td>
                              <td className="align-middle">{student.last_name}</td>
                              <td className="align-middle">{student.level}</td>
                              <td className="align-middle">{student.class_group}</td>
                              <td className="align-middle">
                                <span className={`badge bg-${student.status === 'เสี่ยง' ? 'warning' : 'danger'} rounded-0`}>
                                  {student.status || 'ปกติ'}
                                </span>
                              </td>
                              <td className="align-middle">
                                <button
                                  className="btn btn-sm btn-warning rounded-0"
                                  onClick={() => selectStudent(student)}
                                >
                                  <i className="bi bi-plus-circle me-1"></i>เลือก
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {!searching && searchQuery.length >= 1 && searchResults.length === 0 && (
                    <div className="text-center py-5">
                      <i className="bi bi-emoji-frown fs-1 text-muted d-block mb-3"></i>
                      <p className="text-muted mb-1">ไม่พบผู้เรียน "{searchQuery}"</p>
                      <small className="text-muted">ลองค้นหาด้วยชื่อหรือรหัสอื่น</small>
                    </div>
                  )}

                  {!searching && searchQuery.length === 0 && (
                    <div className="text-center py-5">
                      <i className="bi bi-search fs-1 text-muted d-block mb-3"></i>
                      <p className="text-muted">พิมพ์ชื่อหรือรหัสเพื่อค้นหา</p>
                    </div>
                  )}
                  
                  <div className="text-center mt-4">
                    <Link href="/student_problem" className="btn btn-secondary">
                      ยกเลิก
                    </Link>
                  </div>
                </div>
              )}

              {/* ขั้นตอนที่ 2: กรอกฟอร์มแผนและเลือกกิจกรรม */}
              {step === 2 && student && (
                <div>
                  <div className="text-center mb-4">
                    <div className="badge bg-warning text-dark p-2">ขั้นตอนที่ 2</div>
                    <h5 className="mt-2">แผนการช่วยเหลือและเลือกกิจกรรม</h5>
                  </div>

                  {/* ข้อมูลผู้เรียนที่เลือก */}
                  <div className="alert alert-info mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold fs-5">
                          {student.prefix} {student.first_name} {student.last_name}
                        </div>
                        <div className="d-flex gap-3 mt-2">
                          <span className="badge bg-dark rounded-0">
                            <i className="bi bi-person-badge me-1"></i>
                            รหัส {student.id}
                          </span>
                          <span className="badge bg-dark rounded-0">
                            <i className="bi bi-book me-1"></i>
                            {student.level} {student.class_group}
                          </span>
                          <span className={`badge bg-${student.status === 'เสี่ยง' ? 'warning' : 'danger'} rounded-0`}>
                            {student.status || 'ปกติ'}
                          </span>
                        </div>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          setStep(1);
                          setStudent(null);
                        }}
                      >
                        <i className="bi bi-arrow-left me-1"></i>เปลี่ยนผู้เรียน
                      </button>
                    </div>
                  </div>

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
                            placeholder="เช่น ขาดเรียนบ่อย, ซึมเศร้า, ติดเกม, อื่นๆ"
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

                        {/* ✅ วิธีการแก้ไข - แบบ checkbox + เพิ่ม/ลบเองได้ */}
                        <div className="mb-3">
                          <label className="form-label fw-bold">วิธีการแก้ไข</label>
                          
                          {/* Checkbox รายการที่มี */}
                          <div className="border p-3 mb-2">
                            {methods.map((method, index) => (
                              <div key={`method-${index}-${method}`} className="form-check d-flex align-items-center gap-2 mb-1">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  id={`method-${index}-${method}`}
                                  checked={selectedMethods.includes(method)}
                                  onChange={() => toggleMethod(method)}
                                />
                                <label className="form-check-label flex-grow-1" htmlFor={`method-${index}-${method}`}>
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
                              placeholder="พิมพ์วิธีการแก้ไขเพิ่มเติม..."
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
                          
                          {/* แสดงจำนวนที่เลือก */}
                          {selectedMethods.length > 0 && (
                            <div className="mt-2">
                              <span className="badge bg-success rounded-0">
                                <i className="bi bi-check-circle me-1"></i>
                                เลือก {selectedMethods.length} วิธี
                              </span>
                              <div className="mt-1">
                                {selectedMethods.map((m, idx) => (
                                  <span key={`selected-${idx}-${m}`} className="badge bg-light text-dark me-1 mb-1 border">
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
                            filteredActivities.map((act) => (
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
                                        วันที่: {formatDate(act.activity_date)}
                                      </small>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            ))
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
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setStep(1);
                          setStudent(null);
                        }}
                      >
                        กลับ
                      </button>
                      <button type="submit" className="btn btn-warning" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            กำลังบันทึก...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-save me-2"></i>
                            บันทึกแผน
                          </>
                        )}
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