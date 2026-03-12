// D:\advisor-main\app\student_learn\[id]\edit\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Student {
  _id: string;
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  name?: string;
  level: string;
  class_group: string;
  class_number: string;
  status: string;
  image?: string;
}

interface Major {
  _id: string;
  major_id: number;
  major_name: string;
}

export default function EditHomeroomPlanPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    level: "",
    semester: "1",
    academicYear: "2568",
    week: "",
    time: "20-30",
    topic: "",
    objectives: ["", ""],
    
    // กลุ่มเป้าหมาย
    target_class_group: "",
    target_class_numbers: [] as string[],
    
    // ช่วงที่ 1: การจัดการระเบียบและวินัย
    checkAttendance: "",
    checkUniform: "",
    announceNews: "",
    
    // ช่วงที่ 2: กิจกรรมพัฒนาผู้เรียน
    warmup: "",
    mainActivity: "",
    summary: "",
    
    // ช่วงที่ 3: การดูแลรายบุคคล (เฉพาะที่วางแผนไว้)
    trackProblems: "",
    individualCounsel: "",
    
    // การประเมินผล
    evalObservation: false,
    evalWorksheet: false,
    evalParticipation: false,
    
    // สื่อ/เอกสาร
    materials: [] as { name: string; url: string }[],
    materialsNote: "",
    
    // ข้อเสนอแนะ
    suggestions: "",
    
    // สถานะ
    status: "draft"
  });

  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [showStudentList, setShowStudentList] = useState(false);
  const [selectAllNumbers, setSelectAllNumbers] = useState(false);
  
  const [existingMaterials, setExistingMaterials] = useState<{ name: string; url: string }[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const teacher_name = session?.user?.name || "ไม่พบชื่อผู้ใช้";
  const userRole = session?.user?.role || "";
  const userId = session?.user?.id || "";

  // โหลดข้อมูลแผน
  useEffect(() => {
    const fetchPlanData = async () => {
      if (!params.id) return;
      
      try {
        setFetchLoading(true);
        const response = await fetch(`/api/learn/${params.id}`);
        const result = await response.json();
        
        if (result.success) {
          const data = result.data;
          console.log("📥 โหลดข้อมูลแผน:", data);
          
          // ตรวจสอบสิทธิ์
          if (userRole !== 'ADMIN' && data.created_by !== teacher_name) {
            setError("ไม่มีสิทธิ์แก้ไขแผนนี้");
            return;
          }
          
          setFormData({
            level: data.level || "",
            semester: data.semester || "1",
            academicYear: data.academicYear || "2568",
            week: data.week || "",
            time: data.time || "20-30",
            topic: data.topic || "",
            objectives: data.objectives || ["", ""],
            target_class_group: data.target_class_group || "",
            target_class_numbers: data.target_class_numbers || [],
            checkAttendance: data.checkAttendance || "",
            checkUniform: data.checkUniform || "",
            announceNews: data.announceNews || "",
            warmup: data.warmup || "",
            mainActivity: data.mainActivity || "",
            summary: data.summary || "",
            trackProblems: data.trackProblems || "",
            individualCounsel: data.individualCounsel || "",
            evalObservation: data.evalObservation || false,
            evalWorksheet: data.evalWorksheet || false,
            evalParticipation: data.evalParticipation || false,
            materials: data.materials || [],
            materialsNote: data.materialsNote || "",
            suggestions: data.suggestions || "",
            status: data.status || "draft"
          });
          
          setExistingMaterials(data.materials || []);
          
        } else {
          setError(result.message || "ไม่พบข้อมูลแผน");
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchPlanData();
  }, [params.id, teacher_name, userRole]);

  // โหลดข้อมูลนักเรียนและ majors
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (userId) {
          const assignedRes = await fetch(`/api/user/${userId}/assign-students`);
          if (assignedRes.ok) {
            const assignedData = await assignedRes.json();
            if (assignedData.success) {
              const students = assignedData.data.map((a: any) => {
                const student = a.student_id;
                return {
                  _id: student._id,
                  id: student.id || "",
                  prefix: student.prefix || "",
                  first_name: student.first_name || "",
                  last_name: student.last_name || "",
                  name: `${student.prefix || ''}${student.first_name || ''} ${student.last_name || ''}`.trim(),
                  level: student.level || "",
                  class_group: student.class_group || "",
                  class_number: student.class_number || "",
                  status: student.status || "ปกติ",
                  image: student.image || ""
                };
              });
              setAssignedStudents(students);
            }
          }
        }

        const majorRes = await fetch("/api/major");
        if (majorRes.ok) {
          const majorData = await majorRes.json();
          setMajors(majorData);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, [userId]);

  // กรองนักเรียนตามที่เลือก
  useEffect(() => {
    if (!formData.level) {
      setFilteredStudents([]);
      return;
    }

    let filtered = assignedStudents.filter(s => s.level === formData.level);
    
    if (formData.target_class_group) {
      filtered = filtered.filter(s => s.class_group === formData.target_class_group);
    }
    
    if (formData.target_class_numbers.length > 0) {
      filtered = filtered.filter(s => formData.target_class_numbers.includes(s.class_number));
    }
    
    setFilteredStudents(filtered);
  }, [formData.level, formData.target_class_group, formData.target_class_numbers, assignedStudents]);

  // จัดการการเลือกเลขที่ทั้งหมด
  useEffect(() => {
    if (formData.level && formData.target_class_group) {
      const studentsInClass = assignedStudents.filter(
        s => s.level === formData.level && s.class_group === formData.target_class_group
      );
      const availableNumbers = studentsInClass.map(s => s.class_number).filter(Boolean);
      
      if (selectAllNumbers) {
        setFormData(prev => ({ ...prev, target_class_numbers: availableNumbers }));
      }
    }
  }, [selectAllNumbers, formData.level, formData.target_class_group, assignedStudents]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData(prev => ({ ...prev, objectives: newObjectives }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...files]);
    }
  };

  const handleRemoveNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = (index: number) => {
    setExistingMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const handleNumberToggle = (number: string) => {
    setFormData(prev => ({
      ...prev,
      target_class_numbers: prev.target_class_numbers.includes(number)
        ? prev.target_class_numbers.filter(n => n !== number)
        : [...prev.target_class_numbers, number].sort((a, b) => parseInt(a) - parseInt(b))
    }));
    setSelectAllNumbers(false);
  };

  const handleClassGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      target_class_group: e.target.value,
      target_class_numbers: []
    }));
    setSelectAllNumbers(false);
  };

  const getAvailableNumbers = () => {
    if (!formData.level || !formData.target_class_group) return [];
    
    return assignedStudents
      .filter(s => s.level === formData.level && s.class_group === formData.target_class_group)
      .map(s => s.class_number)
      .filter(Boolean)
      .sort((a, b) => parseInt(a) - parseInt(b));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!formData.level) {
        alert("กรุณาเลือกระดับชั้น");
        setLoading(false);
        return;
      }

      const submitFormData = new FormData();
      
      // ฟิลด์ทั่วไป
      submitFormData.append('level', formData.level);
      submitFormData.append('semester', formData.semester);
      submitFormData.append('academicYear', formData.academicYear);
      submitFormData.append('week', formData.week);
      submitFormData.append('time', formData.time);
      submitFormData.append('topic', formData.topic);
      
      // กลุ่มเป้าหมาย
      submitFormData.append('target_class_group', formData.target_class_group);
      submitFormData.append('target_class_numbers', JSON.stringify(formData.target_class_numbers));
      
      // วัตถุประสงค์
      formData.objectives.forEach((obj, index) => {
        if (obj.trim()) {
          submitFormData.append(`objectives[${index}]`, obj);
        }
      });
      
      // ฟิลด์กิจกรรม
      submitFormData.append('checkAttendance', formData.checkAttendance);
      submitFormData.append('checkUniform', formData.checkUniform);
      submitFormData.append('announceNews', formData.announceNews);
      submitFormData.append('warmup', formData.warmup);
      submitFormData.append('mainActivity', formData.mainActivity);
      submitFormData.append('summary', formData.summary);
      submitFormData.append('trackProblems', formData.trackProblems);
      submitFormData.append('individualCounsel', formData.individualCounsel);
      
      // การประเมิน
      submitFormData.append('evalObservation', formData.evalObservation ? 'on' : 'off');
      submitFormData.append('evalWorksheet', formData.evalWorksheet ? 'on' : 'off');
      submitFormData.append('evalParticipation', formData.evalParticipation ? 'on' : 'off');
      
      // หมายเหตุสื่อ
      submitFormData.append('materialsNote', formData.materialsNote);
      
      // ข้อเสนอแนะ
      submitFormData.append('suggestions', formData.suggestions);
      
      // สถานะ
      submitFormData.append('status', formData.status);
      submitFormData.append('created_by', teacher_name);
      
      // ไฟล์ใหม่
      newFiles.forEach((file, index) => {
        submitFormData.append(`materials[${index}]`, file);
      });
      
      // ไฟล์เดิมที่คงไว้
      existingMaterials.forEach((material, index) => {
        submitFormData.append(`existingMaterials[${index}]`, JSON.stringify(material));
      });
      
      // ถ้าไม่มีไฟล์เลย
      if (existingMaterials.length === 0 && newFiles.length === 0) {
        submitFormData.append('materials_clear', 'true');
      }
      
      console.log("📤 ส่งข้อมูลแก้ไข...");
      
      const response = await fetch(`/api/learn/${params.id}`, {
        method: 'PUT',
        body: submitFormData,
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        router.push(`/student_learn/${params.id}`);
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      setLoading(false);
    }
  };

  const topicOptions = [
    "การจัดการความเครียด",
    "มารยาทในที่ทำงาน",
    "การวางแผนการเงิน",
    "การเตรียมตัวสอบ",
    "อื่นๆ"
  ];

  const availableNumbers = getAvailableNumbers();

  if (fetchLoading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle-fill text-warning fs-1"></i>
          <p className="mt-3">{error}</p>
          <button className="btn btn-primary rounded-0 mt-3" onClick={() => router.back()}>
            <i className="bi bi-arrow-left me-2"></i>กลับ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-2 border-warning">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-uppercase" href="#">
            <i className="bi bi-mortarboard-fill me-2 text-warning"></i>
            <span className="text-warning">ระบบดูแลผู้เรียนรายบุคคล</span>
          </a>
          <div className="collapse navbar-collapse justify-content-end">
            <ul className="navbar-nav">
              <li className="nav-item"><a className="nav-link text-white px-3" href="/student">รายชื่อผู้เรียน</a></li>
              <li className="nav-item"><a className="nav-link text-white px-3" href="/committees">คณะกรรมการ</a></li>
              <li className="nav-item"><a className="nav-link text-white px-3 active" href="/student_learn">โฮมรูม</a></li>
              <li className="nav-item"><a className="nav-link text-white px-3" href="/referrals">ส่งต่อ</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-pencil-square me-2 text-warning"></i>
                แก้ไขแผนกิจกรรมโฮมรูม
              </h2>
              <div>
                <span className="text-muted me-3">ครูที่ปรึกษา: {teacher_name} ({userRole})</span>
                <span className="badge bg-dark text-white rounded-0">ปีการศึกษา 2568</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* แถวที่ 1: ระดับชั้น, กลุ่มเรียน, เลขที่, ดูรายชื่อ */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label className="form-label fw-semibold">
                1. ระดับชั้น <span className="text-danger">*</span>
              </label>
              <select 
                className="form-select rounded-0" 
                name="level" 
                value={formData.level} 
                onChange={handleInputChange}
                required
              >
                <option value="">-- กรุณาเลือกระดับชั้น --</option>
                <option value="ปวช.1">🚹 ปวช.1</option>
                <option value="ปวช.2">🚹 ปวช.2</option>
                <option value="ปวช.3">🚹 ปวช.3</option>
                <option value="ปวส.1">🚺 ปวส.1</option>
                <option value="ปวส.2">🚺 ปวส.2</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label fw-semibold">
                2. กลุ่มเรียน
              </label>
              <select
                className="form-select rounded-0"
                name="target_class_group"
                value={formData.target_class_group}
                onChange={handleClassGroupChange}
                disabled={!formData.level}
              >
                <option value="">-- กรุณาเลือกกลุ่มเรียน --</option>
                {majors.map(major => (
                  <option key={major._id} value={major.major_name}>
                    📚 {major.major_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label fw-semibold">
                3. เลขที่ (เลือกได้หลายหมายเลข)
              </label>
              <div 
                className="form-control rounded-0 overflow-auto" 
                style={{ 
                  maxHeight: '120px',
                  backgroundColor: formData.level && formData.target_class_group ? '#fff' : '#e9ecef'
                }}
              >
                {formData.level && formData.target_class_group ? (
                  availableNumbers.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2 py-1">
                      <div className="form-check form-check-inline me-2">
                        <input
                          type="checkbox"
                          className="form-check-input rounded-0"
                          id="selectAll"
                          checked={selectAllNumbers}
                          onChange={(e) => setSelectAllNumbers(e.target.checked)}
                        />
                        <label className="form-check-label small" htmlFor="selectAll">
                          เลือกทั้งหมด
                        </label>
                      </div>
                      {availableNumbers.map(number => (
                        <div className="form-check form-check-inline" key={number}>
                          <input
                            type="checkbox"
                            className="form-check-input rounded-0"
                            id={`num-${number}`}
                            checked={formData.target_class_numbers.includes(number)}
                            onChange={() => handleNumberToggle(number)}
                          />
                          <label className="form-check-label small" htmlFor={`num-${number}`}>
                            {number}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted small py-1">ไม่มีนักเรียนในกลุ่มนี้</div>
                  )
                ) : (
                  <div className="text-muted small py-1">กรุณาเลือกระดับชั้นและกลุ่มเรียนก่อน</div>
                )}
              </div>
            </div>
            
            <div className="col-md-3">
              <label className="form-label fw-semibold">
                &nbsp;
              </label>
              <button
                type="button"
                className="btn btn-outline-info rounded-0 w-100"
                onClick={() => setShowStudentList(!showStudentList)}
                disabled={!formData.level}
              >
                <i className={`bi bi-chevron-${showStudentList ? 'up' : 'down'} me-2`}></i>
                {showStudentList ? 'ซ่อน' : 'แสดง'}รายชื่อ ({filteredStudents.length} คน)
              </button>
            </div>
          </div>

          {/* แถวที่ 2: ภาคเรียน, ปีการศึกษา, สัปดาห์, เวลา */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label className="form-label fw-semibold">ภาคเรียน</label>
              <select className="form-select rounded-0" name="semester" value={formData.semester} onChange={handleInputChange}>
                <option value="1">ภาคเรียนที่ 1</option>
                <option value="2">ภาคเรียนที่ 2</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">ปีการศึกษา</label>
              <select className="form-select rounded-0" name="academicYear" value={formData.academicYear} onChange={handleInputChange}>
                <option value="2568">2568</option>
                <option value="2567">2567</option>
                <option value="2566">2566</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">สัปดาห์ที่ <span className="text-danger">*</span></label>
              <input type="number" className="form-control rounded-0" name="week" value={formData.week} onChange={handleInputChange} required />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">เวลา (นาที) <span className="text-danger">*</span></label>
              <input type="text" className="form-control rounded-0" name="time" value={formData.time} onChange={handleInputChange} required />
            </div>
          </div>

          {/* แถวที่ 3: รายชื่อนักเรียน (แสดงเมื่อกดปุ่ม) */}
          {showStudentList && formData.level && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-light py-2">
                    <span className="fw-bold">
                      <i className="bi bi-people-fill me-2 text-info"></i>
                      รายชื่อนักเรียน
                      {formData.target_class_group && <span className="badge bg-dark ms-2">กลุ่ม {formData.target_class_group}</span>}
                      {formData.target_class_numbers.length > 0 && (
                        <span className="badge bg-dark ms-2">
                          เลขที่ {formData.target_class_numbers.length > 5 
                            ? `${formData.target_class_numbers[0]} - ${formData.target_class_numbers[formData.target_class_numbers.length-1]}`
                            : formData.target_class_numbers.join(', ')}
                        </span>
                      )}
                      {!formData.target_class_group && formData.target_class_numbers.length === 0 && (
                        <span className="badge bg-secondary ms-2">ทั้งหมดในระดับชั้น {formData.level}</span>
                      )}
                    </span>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <table className="table table-sm table-bordered mb-0">
                        <thead className="table-secondary sticky-top">
                          <tr>
                            <th className="text-center" style={{width: '50px'}}>#</th>
                            <th>รหัสนักเรียน</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>ระดับชั้น</th>
                            <th>กลุ่มเรียน</th>
                            <th>เลขที่</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, index) => (
                              <tr key={student._id}>
                                <td className="text-center">{index + 1}</td>
                                <td className="fw-bold">{student.id}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {student.image ? (
                                      <img 
                                        src={student.image} 
                                        alt={student.name}
                                        className="rounded-circle me-2"
                                        style={{width: '25px', height: '25px', objectFit: 'cover'}}
                                      />
                                    ) : (
                                      <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2" style={{width: '25px', height: '25px'}}>
                                        <i className="bi bi-person-fill small"></i>
                                      </div>
                                    )}
                                    {student.name}
                                  </div>
                                </td>
                                <td>{student.level}</td>
                                <td>{student.class_group}</td>
                                <td>{student.class_number}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="text-center py-3 text-muted">
                                <i className="bi bi-info-circle me-2"></i>
                                ไม่มีนักเรียนตามเงื่อนไขนี้
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          

          {/* 1. หัวข้อหลักประจำสัปดาห์ */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-chat-text me-2 text-warning"></i>1. หัวข้อหลักประจำสัปดาห์</h5>
            </div>
            <div className="card-body">
              <select className="form-select rounded-0 mb-3" value={formData.topic} onChange={(e)=>setFormData({...formData, topic: e.target.value})}>
                <option value="">เลือกหัวข้อ</option>
                {topicOptions.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
              <input type="text" className="form-control rounded-0" placeholder="หรือระบุหัวข้ออื่นๆ" value={formData.topic} onChange={(e)=>setFormData({...formData, topic: e.target.value})} />
            </div>
          </div>

          {/* 2. วัตถุประสงค์ */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-bullseye me-2 text-warning"></i>2. วัตถุประสงค์</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">เพื่อให้ผู้เรียน</label>
                <input type="text" className="form-control rounded-0 mb-2" placeholder="วัตถุประสงค์ข้อที่ 1" 
                  value={formData.objectives[0]} onChange={(e)=>handleObjectiveChange(0, e.target.value)} required />
                <input type="text" className="form-control rounded-0" placeholder="วัตถุประสงค์ข้อที่ 2" 
                  value={formData.objectives[1]} onChange={(e)=>handleObjectiveChange(1, e.target.value)} required />
              </div>
            </div>
          </div>

          {/* 3. ขั้นตอนการดำเนินกิจกรรม */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-list-check me-2 text-warning"></i>3. ขั้นตอนการดำเนินกิจกรรม</h5>
            </div>
            <div className="card-body">
              <h6 className="fw-bold bg-warning text-dark p-2">ช่วงที่ 1: การจัดการระเบียบและวินัย (5-10 นาที)</h6>
              <div className="mb-3">
                <label className="form-label">เช็คชื่อ:</label>
                <input type="text" className="form-control rounded-0 mb-2" name="checkAttendance" value={formData.checkAttendance} onChange={handleInputChange} placeholder="ตรวจสอบสถิติการมาเรียน การลา ความทันเวลา" />
                <label className="form-label">ตรวจระเบียบ:</label>
                <input type="text" className="form-control rounded-0 mb-2" name="checkUniform" value={formData.checkUniform} onChange={handleInputChange} placeholder="ความเรียบร้อยของเครื่องแต่งกายและอุปกรณ์" />
                <label className="form-label">แจ้งข่าวสาร:</label>
                <input type="text" className="form-control rounded-0" name="announceNews" value={formData.announceNews} onChange={handleInputChange} placeholder="ประชาสัมพันธ์กิจกรรมหรือประกาศสำคัญ" />
              </div>

              <h6 className="fw-bold bg-warning text-dark p-2">ช่วงที่ 2: กิจกรรมพัฒนาผู้เรียน (15 นาที)</h6>
              <div className="mb-3">
                <label className="form-label">กิจกรรมนำ:</label>
                <input type="text" className="form-control rounded-0 mb-2" name="warmup" value={formData.warmup} onChange={handleInputChange} />
                <label className="form-label">กิจกรรมหลัก:</label>
                <textarea className="form-control rounded-0 mb-2" rows={3} name="mainActivity" value={formData.mainActivity} onChange={handleInputChange} />
                <label className="form-label">การสรุป:</label>
                <input type="text" className="form-control rounded-0" name="summary" value={formData.summary} onChange={handleInputChange} />
              </div>

              <h6 className="fw-bold bg-warning text-dark p-2">ช่วงที่ 3: การดูแลรายบุคคล (5 นาที)</h6>
              <div>
                <label className="form-label">ติดตามนักเรียนที่มีปัญหา:</label>
                <input type="text" className="form-control rounded-0 mb-2" name="trackProblems" value={formData.trackProblems} onChange={handleInputChange} placeholder="ขาดเรียนบ่อย ผลการเรียนลดลง" />
                <label className="form-label">เปิดโอกาสให้นักเรียนปรึกษา:</label>
                <input type="text" className="form-control rounded-0" name="individualCounsel" value={formData.individualCounsel} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* 5. การประเมินผล */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-clipboard-check me-2 text-warning"></i>5. การประเมินผล</h5>
            </div>
            <div className="card-body">
              <div className="form-check mb-2">
                <input className="form-check-input rounded-0" type="checkbox" name="evalObservation" checked={formData.evalObservation} onChange={handleCheckboxChange} id="obs" />
                <label className="form-check-label" htmlFor="obs">การสังเกตพฤติกรรม</label>
              </div>
              <div className="form-check mb-2">
                <input className="form-check-input rounded-0" type="checkbox" name="evalWorksheet" checked={formData.evalWorksheet} onChange={handleCheckboxChange} id="ws" />
                <label className="form-check-label" htmlFor="ws">การทำใบงาน/แบบทดสอบ</label>
              </div>
              <div className="form-check mb-2">
                <input className="form-check-input rounded-0" type="checkbox" name="evalParticipation" checked={formData.evalParticipation} onChange={handleCheckboxChange} id="part" />
                <label className="form-check-label" htmlFor="part">การมีส่วนร่วมในกิจกรรม</label>
              </div>
            </div>
          </div>

          {/* สื่อและวัสดุอุปกรณ์ */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-paperclip me-2 text-warning"></i>สื่อและวัสดุอุปกรณ์</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">แนบไฟล์เพิ่มเติม:</label>
                <input 
                  type="file" 
                  name="materials"
                  className="form-control rounded-0" 
                  onChange={handleFileChange} 
                  multiple 
                  accept="*"
                />
                <small className="text-muted">ใบงาน, สื่อวิดีโอ, รูปภาพ, หรือไฟล์เอกสารอื่นๆ</small>
                {/* ส่วนของไฟล์เดิม */}
{existingMaterials.length > 0 && (
  <div className="row mt-4">
    <div className="col-12">
      <div className="mb-2">
        <span>
        
        ไฟล์ที่มีอยู่แล้ว:
        </span>
      </div>
      <div className="row g-3">
        {existingMaterials.map((material, index) => (
          <div key={index} className="col-md-4">
            <div className="d-flex justify-content-between align-items-center border p-2 bg-light">
              <span className="text-truncate small">{material.name}</span>
              <button
                type="button"
                className="btn btn-sm btn-danger rounded-0"
                onClick={() => handleRemoveExistingFile(index)}
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
                {newFiles.length > 0 && (
                  <div className="mt-3">
                    <label className="form-label">ไฟล์ใหม่ที่เลือก:</label>
                    <div className="border rounded p-2 bg-light">
                      {newFiles.map((file, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center py-1">
                          <small className="text-dark">
                            <i className="bi bi-file-earmark me-2"></i>
                            {file.name} ({(file.size / 1024).toFixed(2)} KB)
                          </small>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger rounded-0"
                            onClick={() => handleRemoveNewFile(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="form-label">หมายเหตุ:</label>
                <input type="text" className="form-control rounded-0" name="materialsNote" value={formData.materialsNote} onChange={handleInputChange} placeholder="เช่น ใช้แอปพลิเคชันเช็คชื่อ" />
              </div>
            </div>
          </div>

          {/* ข้อเสนอแนะ */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-chat-dots me-2 text-warning"></i>ข้อเสนอแนะ</h5>
            </div>
            <div className="card-body">
              <textarea className="form-control rounded-0" rows={3} name="suggestions" value={formData.suggestions} onChange={handleInputChange} />
            </div>
          </div>

          {/* สถานะ & ปุ่มบันทึก */}
          <div className="row mb-4">
            <div className="col-md-4">
              <label className="form-label fw-semibold">สถานะ</label>
              <select className="form-select rounded-0" name="status" value={formData.status} onChange={handleInputChange}>
                <option value="draft">ร่าง</option>
                <option value="published">เผยแพร่</option>
              </select>
              <small className="text-muted d-block mt-1">
                {formData.status === 'draft' 
                  ? '🔒 เฉพาะคุณเท่านั้นที่เห็นแผนนี้' 
                  : '🌐 ครูทุกคนเห็นแผนนี้'}
              </small>
            </div>
            <div className="col-md-8 d-flex align-items-end justify-content-end gap-2">
              <Link href={`/student_learn/${params.id}`} className="btn btn-secondary rounded-0 px-5">ยกเลิก</Link>
              <button 
                type="submit" 
                className="btn btn-warning rounded-0 px-5 fw-bold" 
                disabled={loading || !formData.level}
              >
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
          </div>
        </form>
      </div>

      <footer className="bg-dark text-white mt-5 py-3 border-top border-warning">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 small"><i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล</div>
            <div className="col-md-6 text-end small"><span className="me-3">เวอร์ชัน 2.0.0</span><span>เข้าสู่ระบบ: {teacher_name} ({userRole})</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}