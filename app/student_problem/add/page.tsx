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

export default function AddProblemPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // State สำหรับค้นหานักเรียน
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [student, setStudent] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [activitySearchTerm, setActivitySearchTerm] = useState("");
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

  // โหลดกิจกรรมทั้งหมด
  useEffect(() => {
    fetchActivities();
  }, []);

  // ค้นหานักเรียนแบบ Real-time
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
        
        if (data.success) {
          setSearchResults(data.data || []);
        }
      } catch (error) {
        console.error("Error searching students:", error);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(() => {
      searchStudents();
    }, 300);

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
          activity_ids: selectedActivities // ส่งเฉพาะ id ของกิจกรรมที่เลือก
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
                เพิ่มแผนการช่วยเหลือนักเรียน
              </h4>
            </div>
            <div className="card-body">
              {/* ขั้นตอนที่ 1: ค้นหาและเลือกนักเรียน */}
              {step === 1 && (
                <div>
                  <div className="text-center mb-4">
                    <div className="badge bg-warning text-dark p-2">ขั้นตอนที่ 1</div>
                    <h5 className="mt-2">ค้นหาและเลือกนักเรียน</h5>
                    <p className="text-muted">พิมพ์ชื่อหรือรหัสนักเรียนเพื่อค้นหา</p>
                  </div>
                  
                  {/* ช่องค้นหา */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">ค้นหานักเรียน</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark text-white">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="พิมพ์ชื่อหรือรหัสนักเรียน..."
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

                  {/* แสดงสถานะกำลังค้นหา */}
                  {searching && (
                    <div className="text-center py-4">
                      <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">กำลังค้นหา...</span>
                      </div>
                      <p className="mt-2 text-muted">กำลังค้นหาข้อมูล...</p>
                    </div>
                  )}

                  {/* แสดงผลการค้นหาในตาราง */}
                  {!searching && searchResults.length > 0 && (
                    <div className="table-responsive">
                      <table className="table table-bordered table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>รหัสนักศึกษา</th>
                            <th>คำนำหน้า</th>
                            <th>ชื่อ</th>
                            <th>นามสกุล</th>
                            <th>ระดับชั้น</th>
                            <th>กลุ่มเรียน</th>
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

                  {/* แสดงเมื่อไม่พบข้อมูล */}
                  {!searching && searchQuery.length >= 1 && searchResults.length === 0 && (
                    <div className="text-center py-5">
                      <i className="bi bi-emoji-frown fs-1 text-muted d-block mb-3"></i>
                      <p className="text-muted mb-1">ไม่พบนักเรียน "{searchQuery}"</p>
                      <small className="text-muted">ลองค้นหาด้วยชื่อหรือรหัสนักเรียนอื่น</small>
                    </div>
                  )}

                  {/* แสดงตารางว่างเมื่อยังไม่ได้ค้นหา */}
                  {!searching && searchQuery.length === 0 && (
                    <div className="text-center py-5">
                      <i className="bi bi-search fs-1 text-muted d-block mb-3"></i>
                      <p className="text-muted">พิมพ์ชื่อหรือรหัสนักเรียนเพื่อค้นหา</p>
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
                    <h5 className="mt-2">กรอกแผนการช่วยเหลือและเลือกกิจกรรม</h5>
                  </div>

                  {/* ข้อมูลนักเรียนที่เลือก */}
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
                        <i className="bi bi-arrow-left me-1"></i>เปลี่ยนนักเรียน
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      {/* ฟอร์มแผน ISP */}
                      <div className="col-md-6">
                        <h5 className="border-bottom pb-2 mb-3">📋 แผน ISP</h5>
                        
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
                                การให้คำปรึกษาเบื้องต้น
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
                                กิจกรรมปรับเปลี่ยนพฤติกรรม
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
                                การส่งต่อ
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