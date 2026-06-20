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
    objectives: [""] as string[], // ✅ เริ่มต้นด้วย 1 element

    target_class_group: "",
    target_class_numbers: [] as string[],

    mainActivity: "",

    evalObservation: false,
    evalWorksheet: false,
    evalParticipation: false,

    materials: [] as { name: string; url: string }[],
    materialsNote: "",

    suggestions: "",

    status: "draft"
  });

  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [showStudentList, setShowStudentList] = useState(false);
  const [selectAllNumbers, setSelectAllNumbers] = useState(false);

  const [existingMaterials, setExistingMaterials] = useState<{ name: string; url: string }[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const [isCustomTopic, setIsCustomTopic] = useState(false);

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
            objectives: data.objectives?.length ? data.objectives : [""], // ✅ รองรับข้อมูลจาก API
            target_class_group: data.target_class_group || "",
            target_class_numbers: data.target_class_numbers || [],
            mainActivity: data.mainActivity || "",
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

  // จัดการการเลือกห้องทั้งหมด
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

  // ✅ เพิ่มฟังก์ชันเพิ่ม/ลบวัตถุประสงค์
  const addObjective = () => {
    setFormData(prev => ({ ...prev, objectives: [...prev.objectives, ""] }));
  };

  const removeObjective = (index: number) => {
    if (formData.objectives.length <= 1) return;
    setFormData(prev => ({ 
      ...prev, 
      objectives: prev.objectives.filter((_, i) => i !== index) 
    }));
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

  const handleTopicInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, topic: value });
    if (value && value.trim() !== "") {
      setIsCustomTopic(true);
    } else if (!value || value.trim() === "") {
      setIsCustomTopic(false);
    }
  };

  const handleTopicSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "อื่นๆ") {
      setIsCustomTopic(true);
      setFormData({ ...formData, topic: "" });
    } else if (value === "") {
      setIsCustomTopic(false);
      setFormData({ ...formData, topic: "" });
    } else {
      setIsCustomTopic(false);
      setFormData({ ...formData, topic: value });
    }
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
        alert("เลือกระดับชั้น");
        setLoading(false);
        return;
      }

      const submitFormData = new FormData();

      submitFormData.append('level', formData.level);
      submitFormData.append('semester', formData.semester);
      submitFormData.append('academicYear', formData.academicYear);
      submitFormData.append('week', formData.week);
      submitFormData.append('time', formData.time);
      submitFormData.append('topic', formData.topic);
      submitFormData.append('target_class_group', formData.target_class_group);
      submitFormData.append('target_class_numbers', JSON.stringify(formData.target_class_numbers));

      // ✅ ส่งเฉพาะวัตถุประสงค์ที่ไม่ว่าง
      const validObjectives = formData.objectives.filter(obj => obj.trim());
      validObjectives.forEach((obj, index) => {
        if (obj.trim()) {
          submitFormData.append(`objectives[${index}]`, obj);
        }
      });

      submitFormData.append('mainActivity', formData.mainActivity);
      submitFormData.append('evalObservation', formData.evalObservation ? 'on' : 'off');
      submitFormData.append('evalWorksheet', formData.evalWorksheet ? 'on' : 'off');
      submitFormData.append('evalParticipation', formData.evalParticipation ? 'on' : 'off');
      submitFormData.append('materialsNote', formData.materialsNote);
      submitFormData.append('suggestions', formData.suggestions);
      submitFormData.append('status', formData.status);
      submitFormData.append('created_by', teacher_name);

      newFiles.forEach((file, index) => {
        submitFormData.append(`materials[${index}]`, file);
      });

      existingMaterials.forEach((material, index) => {
        submitFormData.append(`existingMaterials[${index}]`, JSON.stringify(material));
      });

      if (existingMaterials.length === 0 && newFiles.length === 0) {
        submitFormData.append('materials_clear', 'true');
      }

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
    "การเตรียมตัวสอบ"
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
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-pencil-square me-2 text-warning"></i>
                แก้ไขแผนกิจกรรมโฮมรูม (การส่งเสริมและพัฒนาผู้เรียน)
              </h2>
              <div>
                <span className="badge bg-dark text-white rounded-0">2568</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* แถวที่ 1: ระดับชั้น, สาขาวิชาเรียน, ห้อง, ดูรายชื่อ */}
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
                <option value="ปวช.1">ปวช.1</option>
                <option value="ปวช.2">ปวช.2</option>
                <option value="ปวช.3">ปวช.3</option>
                <option value="ปวส.1">ปวส.1</option>
                <option value="ปวส.2">ปวส.2</option>
                <option value="ป.ตรี">ป.ตรี</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">
                2. สาขา
              </label>
              <select
                className="form-select rounded-0"
                name="target_class_group"
                value={formData.target_class_group}
                onChange={handleClassGroupChange}
                disabled={!formData.level}
              >
                <option value="">-- กรุณาเลือกสาขาวิชาเรียน --</option>
                {majors.map(major => (
                  <option key={major._id} value={major.major_name}>
                    {major.major_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">
                3. ห้อง <span className="text-danger">*</span>
              </label>
              <select
                className="form-select rounded-0"
                value={formData.target_class_numbers[0] || ""}
                onChange={(e) => {
                  const selectedNumber = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    target_class_numbers: selectedNumber ? [selectedNumber] : []
                  }));
                }}
                disabled={!formData.level || !formData.target_class_group}
                required
              >
                <option value="">-- เลือกห้อง --</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
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
                <option value="2574">2574</option>
                <option value="2573">2573</option>
                <option value="2572">2572</option>
                <option value="2571">2571</option>
                <option value="2570">2570</option>
                <option value="2569">2569</option>
                <option value="2568">2568</option>
                <option value="2567">2567</option>
                <option value="2566">2566</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">สัปดาห์ <span className="text-danger">*</span></label>
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
                      {formData.target_class_group && <span className="badge bg-dark ms-2">สาขา {formData.target_class_group}</span>}
                      {formData.target_class_numbers.length > 0 && (
                        <span className="badge bg-dark ms-2">
                          ห้อง {formData.target_class_numbers.length > 5
                            ? `${formData.target_class_numbers[0]} - ${formData.target_class_numbers[formData.target_class_numbers.length - 1]}`
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
                            <th className="text-center" style={{ width: '50px' }}>#</th>
                            <th>รหัสนักเรียน</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>ระดับชั้น</th>
                            <th>สาขา</th>
                            <th>ห้อง</th>
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
                                        style={{ width: '25px', height: '25px', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2" style={{ width: '25px', height: '25px' }}>
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

          {/* Topic */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-chat-text me-2 text-warning"></i>1. หัวข้อหลักประจำสัปดาห์</h5>
            </div>
            <div className="card-body">
              <select
                className="form-select rounded-0 mb-3"
                value={isCustomTopic ? "อื่นๆ" : formData.topic}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "อื่นๆ") {
                    setIsCustomTopic(true);
                    setFormData({ ...formData, topic: "" });
                  } else {
                    setIsCustomTopic(false);
                    setFormData({ ...formData, topic: value });
                  }
                }}
              >
                <option value="">-- เลือกหัวข้อ --</option>
                {topicOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="อื่นๆ">อื่นๆ</option>
              </select>

              <input
                type="text"
                className="form-control rounded-0"
                placeholder={isCustomTopic ? "พิมพ์หัวข้อ..." : "เลือกจาก dropdown หรือพิมพ์ที่นี่"}
                value={formData.topic}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, topic: value });
                  if (value && !topicOptions.includes(value)) {
                    setIsCustomTopic(true);
                  }
                }}
              />
            </div>
          </div>

          {/* 2. วัตถุประสงค์ - แบบไดนามิก */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-bullseye me-2 text-warning"></i>2. วัตถุประสงค์</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
              
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="input-group mb-2">
                    <span className="input-group-text bg-light">{index + 1}.</span>
                    <input 
                      type="text" 
                      className="form-control rounded-0" 
                      placeholder={`วัตถุประสงค์ข้อที่ ${index + 1}`}
                      value={objective} 
                      onChange={(e) => handleObjectiveChange(index, e.target.value)} 
                      required 
                    />
                    <button 
                      type="button" 
                      className="btn btn-outline-danger rounded-0" 
                      onClick={() => removeObjective(index)}
                      disabled={formData.objectives.length <= 1}
                    >
                      <i className="bi bi-dash-lg"></i>
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="btn btn-outline-success btn-sm rounded-0 mt-2"
                  onClick={addObjective}
                >
                  <i className="bi bi-plus-lg me-1"></i>เพิ่มวัตถุประสงค์
                </button>
              </div>
            </div>
          </div>

          {/* 3. ขั้นตอนการดำเนินกิจกรรม */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-list-check me-2 text-warning"></i>3. ขั้นตอนการดำเนินกิจกรรม</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">กิจกรรมหลัก</label>
                <textarea
                  className="form-control rounded-0"
                  rows={6}
                  name="mainActivity"
                  value={formData.mainActivity}
                  onChange={handleInputChange}
                  placeholder="รายละเอียดกิจกรรมที่จัดในคาบโฮมรูม..."
                />
              </div>
            </div>
          </div>

          {/* 4. การประเมินผล */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-clipboard-check me-2 text-warning"></i>4. การประเมินผล</h5>
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

                {existingMaterials.length > 0 && (
                  <div className="row mt-4">
                    <div className="col-12">
                      <div className="mb-2">
                        <span>ไฟล์ที่มีอยู่แล้ว:</span>
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
    </div>
  );
}