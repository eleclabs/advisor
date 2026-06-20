"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

interface EvaluationItem {
  id: string;
  name: string;
  checked: boolean;
  isCustom?: boolean;
}

export default function CreateHomeroomPlanPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    level: "",
    semester: "1",
    academicYear: "2568",
    week: "",
    time: "20-30",
    topic: "",
    objectives: [""] as string[],

    target_class_group: "",
    target_class_numbers: [] as string[],

    mainActivity: "",

    evaluationMethods: [] as EvaluationItem[],

    teacherNote: "",
    problems: "",
    specialTrack: "",
    sessionNote: "",

    materials: [] as { name: string; url: string }[],
    materialsNote: "",

    suggestions: "",
    individualFollowup: "",

    status: "draft"
  });

  const [customEvalText, setCustomEvalText] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [showStudentList, setShowStudentList] = useState(false);
  const [selectAllNumbers, setSelectAllNumbers] = useState(false);

  const teacher_name = session?.user?.name || "ไม่พบชื่อผู้ใช้";
  const userRole = session?.user?.role || "";
  const userId = session?.user?.id || "";

  const [newFiles, setNewFiles] = useState<File[]>([]);

  const predefinedEvaluations = [
    { id: "observation", name: "การสังเกตพฤติกรรม" },
    { id: "worksheet", name: "การทำใบงาน/แบบทดสอบ" },
    { id: "participation", name: "การมีส่วนร่วมในกิจกรรม" },
  ];

  useEffect(() => {
    const initialEvaluations: EvaluationItem[] = predefinedEvaluations.map(e => ({
      id: e.id,
      name: e.name,
      checked: false
    }));
    
    setFormData(prev => ({ 
      ...prev, 
      evaluationMethods: initialEvaluations 
    }));
  }, []);

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

  useEffect(() => {
    const bootstrapLink = document.createElement("link");
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    bootstrapLink.rel = "stylesheet";
    document.head.appendChild(bootstrapLink);

    const iconLink = document.createElement("link");
    iconLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);
  }, []);

  const [isCustomTopic, setIsCustomTopic] = useState(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ จัดการวัตถุประสงค์ (แบบ string array)
  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData(prev => ({ ...prev, objectives: newObjectives }));
  };

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

  const handleEvaluationCheckboxChange = (id: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      evaluationMethods: prev.evaluationMethods.map(item =>
        item.id === id ? { ...item, checked } : item
      )
    }));
  };

  const addCustomEvaluation = () => {
    if (customEvalText.trim() === "") return;
    const newId = `custom_eval_${Date.now()}`;
    const newEvaluation: EvaluationItem = {
      id: newId,
      name: customEvalText.trim(),
      checked: true,
      isCustom: true
    };
    setFormData(prev => ({
      ...prev,
      evaluationMethods: [...prev.evaluationMethods, newEvaluation]
    }));
    setCustomEvalText("");
    setShowCustomInput(false);
  };

  const removeCustomEvaluation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      evaluationMethods: prev.evaluationMethods.filter(item => item.id !== id)
    }));
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
      submitFormData.append('objectives', JSON.stringify(validObjectives));

      submitFormData.append('mainActivity', formData.mainActivity);

      const evaluationData = formData.evaluationMethods
        .filter(item => item.checked)
        .map(item => item.name);
      submitFormData.append('evaluationMethods', JSON.stringify(evaluationData));

      submitFormData.append('teacherNote', formData.teacherNote);
      submitFormData.append('problems', formData.problems);
      submitFormData.append('specialTrack', formData.specialTrack);
      submitFormData.append('sessionNote', formData.sessionNote);

      newFiles.forEach((file, index) => {
        submitFormData.append(`materials[${index}]`, file);
      });
      submitFormData.append('materialsNote', formData.materialsNote);

      submitFormData.append('suggestions', formData.suggestions);
      submitFormData.append('individualFollowup', formData.individualFollowup);

      submitFormData.append('status', formData.status);
      submitFormData.append('created_by', teacher_name);

      const response = await fetch('/api/learn', {
        method: 'POST',
        body: submitFormData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push('/student_learn');
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
  ];

  const availableNumbers = getAvailableNumbers();

  return (
    <div className="min-vh-100 bg-light">
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-plus-circle-fill me-2 text-warning"></i>
                แผนการจัดกิจกรรมโฮมรูม (การส่งเสริมและพัฒนาผู้เรียน)
              </h2>
              <div>
                <span className="text-muted me-3">ครูที่ปรึกษา: {teacher_name} ({userRole})</span>
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
                <option value="">-- เลือกระดับชั้น --</option>
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
                <option value="">-- เลือกสาขา --</option>
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

          {/* แถวที่ 3: รายชื่อนักเรียน */}
          {showStudentList && formData.level && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-light py-2">
                    <span className="fw-bold">
                      <i className="bi bi-people-fill me-2 text-info"></i>
                      รายชื่อผู้เรียน
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
                            <th>รหัส</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>ระดับชั้น</th>
                            <th>สาขาเรียน</th>
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
                                      <img src={student.image} alt={student.name} className="rounded-circle me-2" style={{ width: '25px', height: '25px', objectFit: 'cover' }} />
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
                                ไม่มีผู้เรียนตามเงื่อนไขนี้
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
                value={isCustomTopic ? "อื่นๆ" : (formData.topic && topicOptions.includes(formData.topic) ? formData.topic : "")}
                onChange={handleTopicSelectChange}
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
                placeholder={isCustomTopic ? "กรุณาระบุหัวข้อ..." : "หรือพิมพ์หัวข้ออื่นๆ ที่นี่"}
                value={formData.topic}
                onChange={handleTopicInputChange}
                onFocus={() => {
                  if (formData.topic && !topicOptions.includes(formData.topic)) {
                    setIsCustomTopic(true);
                  }
                }}
              />
            </div>
          </div>

          {/* ✅ Objectives - แบบ input-group เพิ่ม/ลบได้ */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-bullseye me-2 text-warning"></i>2. วัตถุประสงค์</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">เพื่อให้ผู้เรียน</label>
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

          {/* Activities */}
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

          {/* Evaluation */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="m-0"><i className="bi bi-clipboard-check me-2 text-warning"></i>4. การประเมินผล</h5>
              <button
                type="button"
                className="btn btn-sm btn-outline-light rounded-0"
                onClick={() => setShowCustomInput(!showCustomInput)}
              >
                <i className="bi bi-plus-lg me-1"></i> เพิ่มอื่นๆ
              </button>
            </div>
            <div className="card-body">
              {formData.evaluationMethods.map((item) => (
                <div key={item.id} className="form-check mb-2 d-flex align-items-center">
                  <input
                    className="form-check-input rounded-0"
                    type="checkbox"
                    id={item.id}
                    checked={item.checked}
                    onChange={(e) => handleEvaluationCheckboxChange(item.id, e.target.checked)}
                  />
                  <label className="form-check-label flex-grow-1" htmlFor={item.id}>
                    {item.name}
                  </label>
                  {item.isCustom && (
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-danger p-0 ms-2"
                      onClick={() => removeCustomEvaluation(item.id)}
                      style={{ textDecoration: 'none' }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              ))}

              {showCustomInput && (
                <div className="mt-3 p-3 border rounded-0 bg-light">
                  <div className="row g-2">
                    <div className="col-8">
                      <input
                        type="text"
                        className="form-control form-control-sm rounded-0"
                        placeholder="ระบุวิธีการประเมินผล เช่น การนำเสนอผลงาน"
                        value={customEvalText}
                        onChange={(e) => setCustomEvalText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomEvaluation();
                          }
                        }}
                        autoFocus
                      />
                    </div>
                    <div className="col-4">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm rounded-0 w-100"
                        onClick={addCustomEvaluation}
                        disabled={!customEvalText.trim()}
                      >
                        <i className="bi bi-check-lg me-1"></i> เพิ่ม
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {formData.evaluationMethods.filter(m => m.checked).length === 0 && (
                <div className="text-muted small mt-2">
                  <i className="bi bi-info-circle me-1"></i>
                  ยังไม่ได้เลือกวิธีการประเมินผล
                </div>
              )}
            </div>
          </div>

          {/* Teacher's Note */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-journal-text me-2 text-warning"></i>5. บันทึกหลังกิจกรรม</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">ผลการจัดกิจกรรม:</label>
                <textarea className="form-control rounded-0" rows={2} name="teacherNote" value={formData.teacherNote} onChange={handleInputChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">ปัญหา/อุปสรรคที่พบ:</label>
                <textarea className="form-control rounded-0" rows={2} name="problems" value={formData.problems} onChange={handleInputChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">ผู้เรียนที่ต้องติดตามเป็นพิเศษ:</label>
                <input type="text" className="form-control rounded-0" name="specialTrack" value={formData.specialTrack} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* Materials */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-paperclip me-2 text-warning"></i>สื่อและวัสดุอุปกรณ์</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">แนบไฟล์:</label>
                <input
                  type="file"
                  name="materials"
                  className="form-control rounded-0"
                  onChange={handleFileChange}
                  multiple
                  accept="*"
                />
                <small className="text-muted">ใบงาน, สื่อวิดีโอ, รูปภาพ, หรือไฟล์เอกสารอื่นๆ</small>

                {newFiles.length > 0 && (
                  <div className="mt-3">
                    <label className="form-label">ไฟล์ที่เลือก:</label>
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

          {/* Suggestions & Follow-up */}
          <div className="row">
            <div className="col-md-6">
              <div className="card rounded-0 border-0 shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                  <h5 className="m-0"><i className="bi bi-chat-dots me-2 text-warning"></i>ข้อเสนอแนะ</h5>
                </div>
                <div className="card-body">
                  <textarea className="form-control rounded-0" rows={3} name="suggestions" value={formData.suggestions} onChange={handleInputChange} />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card rounded-0 border-0 shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                  <h5 className="m-0"><i className="bi bi-person-badge me-2 text-warning"></i>ติดตามผลรายบุคคล</h5>
                </div>
                <div className="card-body">
                  <textarea className="form-control rounded-0" rows={3} name="individualFollowup" value={formData.individualFollowup} onChange={handleInputChange} placeholder="รายชื่อผู้เรียนที่ต้องติดตามเป็นพิเศษ..." />
                </div>
              </div>
            </div>
          </div>

          {/* Status & Submit */}
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
              <Link href="/student_learn" className="btn btn-secondary rounded-0 px-5">ยกเลิก</Link>
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
                    บันทึกแผนกิจกรรม
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