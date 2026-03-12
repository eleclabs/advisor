// D:\advisor-main\app\student_learn\[id]\edit\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface EditPlan {
  level: string;
  semester: string;
  academicYear: string;
  week: string;
  time: string;
  topic: string;
  objectives: string[];
  
  // ช่วงที่ 1
  checkAttendance: string;
  checkUniform: string;
  announceNews: string;
  
  // ช่วงที่ 2
  warmup: string;
  mainActivity: string;
  summary: string;
  
  // ช่วงที่ 3
  trackProblems: string;
  individualCounsel: string;
  
  // การประเมินผล
  evalObservation: boolean;
  evalWorksheet: boolean;
  evalParticipation: boolean;
  
  // บันทึกหลังกิจกรรม
  teacherNote: string;
  problems: string;
  specialTrack: string;
  sessionNote: string;
  
  // สื่อ/เอกสาร
  materials: string[];
  materialsNote: string;
  
  // ข้อเสนอแนะ
  suggestions: string;
  
  // ติดตามผลรายบุคคล
  individualFollowup: string;
  
  status: string;
}

export default function EditHomeroomPlanPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [planData, setPlanData] = useState<any>(null);
  
  const [formData, setFormData] = useState<EditPlan>({
    level: "",
    semester: "1",
    academicYear: "2568",
    week: "",
    time: "",
    topic: "",
    objectives: ["", ""],
    
    checkAttendance: "",
    checkUniform: "",
    announceNews: "",
    
    warmup: "",
    mainActivity: "",
    summary: "",
    
    trackProblems: "",
    individualCounsel: "",
    
    evalObservation: false,
    evalWorksheet: false,
    evalParticipation: false,
    
    teacherNote: "",
    problems: "",
    specialTrack: "",
    sessionNote: "",
    
    materials: [],
    materialsNote: "",
    
    suggestions: "",
    
    individualFollowup: "",
    
    status: "draft"
  });

  const [materials, setMaterials] = useState<File[]>([]);
  const [existingMaterials, setExistingMaterials] = useState<{ name: string; url: string }[]>([]);
  const teacher_name = session?.user?.name || "ไม่พบชื่อผู้ใช้";

  useEffect(() => {
  
  }, []);

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        setFetchLoading(true);
        const response = await fetch(`/api/learn/${params.id}`);
        const result = await response.json();
        
        if (result.success) {
          // ตรวจสอบสิทธิ์การแก้ไข
          const currentUser = session?.user?.name;
          const userRole = session?.user?.role;
          const isAdmin = userRole === 'ADMIN';
          const planOwner = result.data.created_by;
          
          // ถ้า created_by เป็น - หรือว่าง ให้ใครก็แก้ไขได้ (ข้อมูลเก่า)
          if (!isAdmin && planOwner && planOwner !== "-" && planOwner !== currentUser) {
            setError("ไม่มีสิทธิ์แก้ไขแผนกิจกรรมนี้");
            return;
          }
          
          setPlanData(result.data);
          setFormData(result.data);
          setExistingMaterials(result.data.materials || []);
        } else {
          setError(result.message || "ไม่พบข้อมูลแผนกิจกรรม");
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setFetchLoading(false);
      }
    };

    if (params.id && session) {
      fetchPlanData();
    }
  }, [params.id, session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData(prev => ({ ...prev, objectives: newObjectives }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      // ตรวจสอบว่ามีไฟล์ซ้ำหรือไม่ (ทั้งไฟล์ใหม่และไฟล์เดิม)
      const currentFileNames = materials.map(f => f.name);
      const existingFileNames = existingMaterials.map(m => m.name);
      const allFileNames = [...currentFileNames, ...existingFileNames];
      
      const uniqueFiles = newFiles.filter(file => !allFileNames.includes(file.name));
      
      if (uniqueFiles.length > 0) {
        setMaterials(prev => [...prev, ...uniqueFiles]);
        console.log(`✅ Added ${uniqueFiles.length} new files:`, uniqueFiles.map(f => f.name));
      }
      
      // แจ้งเตือนว่ามีไฟล์ซ้ำ
      const duplicateFiles = newFiles.filter(file => allFileNames.includes(file.name));
      if (duplicateFiles.length > 0) {
        alert(`ไฟล์เหล่านี้มีอยู่แล้ว: ${duplicateFiles.map(f => f.name).join(', ')}`);
      }
      
      // Reset input to allow selecting same file again
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = (index: number) => {
    setExistingMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // สร้าง FormData สำหรับส่งไป API
      const submitFormData = new FormData();
      
      // เพิ่มฟิลด์ทั่วไป (แบบเดียวกับ Create Page)
      submitFormData.append('level', formData.level);
      submitFormData.append('semester', formData.semester);
      submitFormData.append('academicYear', formData.academicYear);
      submitFormData.append('week', formData.week);
      submitFormData.append('time', formData.time);
      submitFormData.append('topic', formData.topic);
      
      // เพิ่มวัตถุประสงค์
      formData.objectives.forEach((obj, index) => {
        if (obj.trim()) {
          submitFormData.append(`objectives[${index}]`, obj);
        }
      });
      
      // เพิ่มฟิลด์ช่วงที่ 1
      submitFormData.append('checkAttendance', formData.checkAttendance);
      submitFormData.append('checkUniform', formData.checkUniform);
      submitFormData.append('announceNews', formData.announceNews);
      
      // เพิ่มฟิลด์ช่วงที่ 2
      submitFormData.append('warmup', formData.warmup);
      submitFormData.append('mainActivity', formData.mainActivity);
      submitFormData.append('summary', formData.summary);
      
      // เพิ่มฟิลด์ช่วงที่ 3
      submitFormData.append('trackProblems', formData.trackProblems);
      submitFormData.append('individualCounsel', formData.individualCounsel);
      
      // เพิ่มฟิลด์การประเมินผล
      submitFormData.append('evalObservation', formData.evalObservation ? 'on' : 'off');
      submitFormData.append('evalWorksheet', formData.evalWorksheet ? 'on' : 'off');
      submitFormData.append('evalParticipation', formData.evalParticipation ? 'on' : 'off');
      
      // เพิ่มฟิลด์บันทึกหลังกิจกรรม
      submitFormData.append('teacherNote', formData.teacherNote);
      submitFormData.append('problems', formData.problems);
      submitFormData.append('specialTrack', formData.specialTrack);
      submitFormData.append('sessionNote', formData.sessionNote);
      
      // เพิ่มฟิลด์ข้อเสนอแนะและการติดตาม
      submitFormData.append('suggestions', formData.suggestions);
      submitFormData.append('individualFollowup', formData.individualFollowup);
      
      // เพิ่มสถานะ
      submitFormData.append('status', formData.status);
      
      // เพิ่มไฟล์ใหม่ (หลายไฟล์)
      materials.forEach((file, index) => {
        submitFormData.append(`materials[${index}]`, file);
      });
      submitFormData.append('materialsNote', formData.materialsNote);
      
      // Debug: ตรวจสอบข้อมูลที่ส่ง
      console.log("📤 Edit Page - Sending FormData:");
      console.log("  New materials count:", materials.length);
      materials.forEach((file, index) => {
        console.log(`  materials[${index}]:`, file.name, file.size);
      });
      console.log("  Existing materials count:", existingMaterials.length);
      existingMaterials.forEach((material, index) => {
        console.log(`  existingMaterials[${index}]:`, material.name, material.url);
      });
      
      // Debug: แสดงทุก FormData entries
      console.log("📤 Edit Page - All FormData entries:");
      for (let [key, value] of submitFormData.entries()) {
        console.log(`  ${key}:`, value);
      }
      
      // เพิ่มไฟล์เดิมที่คงไว้
      existingMaterials.forEach((material, index) => {
        submitFormData.append(`existingMaterials[${index}]`, JSON.stringify(material));
      });
      
      // ถ้าไม่มีไฟล์เดิมและไม่มีไฟล์ใหม่ ให้ส่งค่าว่างเพื่อล้างข้อมูลเดิม
      if (existingMaterials.length === 0 && materials.length === 0) {
        submitFormData.append('materials_clear', 'true');
      }
      
      submitFormData.append('created_by', teacher_name);
      
      const response = await fetch(`/api/learn/${params.id}`, {
        method: 'PUT',
        body: submitFormData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        router.push(`/student_learn/${params.id}`);
      } else {
        alert(result.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

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
                แก้ไขแผนกิจกรรม (ก่อนจัดกิจกรรม)
              </h2>
              <div>
                <span className="text-muted me-3">ครูที่ปรึกษา: {teacher_name}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. ข้อมูลพื้นฐาน */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-info-circle me-2 text-warning"></i>1. ข้อมูลพื้นฐาน
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">ระดับชั้น</label>
                  <select className="form-select rounded-0" name="level" value={formData.level} onChange={handleInputChange} required>
                    <option value="">เลือกระดับชั้น</option>
                    <option value="ปวช.1">ปวช.1</option>
                    <option value="ปวช.2">ปวช.2</option>
                    <option value="ปวช.3">ปวช.3</option>
                    <option value="ปวส.1">ปวส.1</option>
                    <option value="ปวส.2">ปวส.2</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">ภาคเรียนที่</label>
                  <select className="form-select rounded-0" name="semester" value={formData.semester} onChange={handleInputChange}>
                    <option value="1">ภาคเรียนที่ 1</option>
                    <option value="2">ภาคเรียนที่ 2</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">ปีการศึกษา</label>
                  <select className="form-select rounded-0" name="academicYear" value={formData.academicYear} onChange={handleInputChange}>
                    <option value="2568">2568</option>
                    <option value="2567">2567</option>
                    <option value="2566">2566</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">สัปดาห์ที่</label>
                  <input type="text" className="form-control rounded-0" name="week" value={formData.week} onChange={handleInputChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold small">เวลา (นาที)</label>
                  <input type="text" className="form-control rounded-0" name="time" value={formData.time} onChange={handleInputChange} required />
                </div>
                <div className="col-md-8">
                  <label className="form-label fw-semibold small">หัวข้อหลัก</label>
                  <input type="text" className="form-control rounded-0" name="topic" value={formData.topic} onChange={handleInputChange} required />
                </div>
              </div>
            </div>
          </div>

          {/* 2. วัตถุประสงค์ */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-bullseye me-2 text-warning"></i>2. วัตถุประสงค์
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-2">
                  <textarea className="form-control rounded-0" rows={2} placeholder="วัตถุประสงค์ข้อที่ 1"
                    value={formData.objectives[0]} onChange={(e) => handleObjectiveChange(0, e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <textarea className="form-control rounded-0" rows={2} placeholder="วัตถุประสงค์ข้อที่ 2"
                    value={formData.objectives[1]} onChange={(e) => handleObjectiveChange(1, e.target.value)} required />
                </div>
              </div>
            </div>
          </div>

          {/* 3. ขั้นตอนการดำเนินกิจกรรม */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-list-check me-2 text-warning"></i>3. ขั้นตอนการดำเนินกิจกรรม
              </h5>
            </div>
            <div className="card-body">
              <h6 className="fw-bold bg-warning text-dark p-2">ช่วงที่ 1: การจัดการระเบียบและวินัย</h6>
              <div className="row mb-3">
                <div className="col-md-4">
                  <input type="text" className="form-control rounded-0" name="checkAttendance" value={formData.checkAttendance} onChange={handleInputChange} placeholder="เช็คชื่อ" />
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control rounded-0" name="checkUniform" value={formData.checkUniform} onChange={handleInputChange} placeholder="ตรวจระเบียบ" />
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control rounded-0" name="announceNews" value={formData.announceNews} onChange={handleInputChange} placeholder="แจ้งข่าวสาร" />
                </div>
              </div>

              <h6 className="fw-bold bg-warning text-dark p-2">ช่วงที่ 2: กิจกรรมพัฒนาผู้เรียน</h6>
              <div className="row mb-3">
                <div className="col-md-4">
                  <input type="text" className="form-control rounded-0" name="warmup" value={formData.warmup} onChange={handleInputChange} placeholder="กิจกรรมนำ" />
                </div>
                <div className="col-md-4">
                  <textarea className="form-control rounded-0" rows={2} name="mainActivity" value={formData.mainActivity} onChange={handleInputChange} placeholder="กิจกรรมหลัก" />
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control rounded-0" name="summary" value={formData.summary} onChange={handleInputChange} placeholder="การสรุป" />
                </div>
              </div>

              <h6 className="fw-bold bg-warning text-dark p-2">ช่วงที่ 3: การดูแลรายบุคคล</h6>
              <div className="row">
                <div className="col-md-6">
                  <input type="text" className="form-control rounded-0" name="trackProblems" value={formData.trackProblems} onChange={handleInputChange} placeholder="ติดตามนักเรียนที่มีปัญหา" />
                </div>
                <div className="col-md-6">
                  <input type="text" className="form-control rounded-0" name="individualCounsel" value={formData.individualCounsel} onChange={handleInputChange} placeholder="เปิดโอกาสให้นักเรียนปรึกษา" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. การประเมินผล */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-clipboard-check me-2 text-warning"></i>4. การประเมินผล
              </h5>
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

          {/* 5. สื่อและวัสดุอุปกรณ์ */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-paperclip me-2 text-warning"></i>5. สื่อและวัสดุอุปกรณ์
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">แนบไฟล์ใหม่:</label>
                <input 
                  type="file" 
                  name="materials"
                  className="form-control rounded-0" 
                  onChange={handleFileChange} 
                  multiple 
                  accept="*"
                />
                <small className="text-muted">ใบงาน, สื่อวิดีโอ, รูปภาพ, หรือไฟล์เอกสารอื่นๆ (ไม่จำกัดนามสกุลไฟล์)</small>
                
                {materials.length > 0 && (
                  <div className="mt-3">
                    <label className="form-label">ไฟล์ใหม่ที่เลือก:</label>
                    <div className="border rounded p-2 bg-light">
                      {materials.map((file, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center py-1">
                          <small className="text-dark">
                            <i className="bi bi-file-earmark me-2"></i>
                            {file.name} ({(file.size / 1024).toFixed(2)} KB)
                          </small>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger rounded-0"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {existingMaterials.length > 0 && (
                <div className="mb-3">
                  <label className="form-label">ไฟล์เดิม:</label>
                  <div className="border rounded p-2 bg-light">
                    {existingMaterials.map((material, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center py-1">
                        <small className="text-dark">
                          <i className="bi bi-file-earmark me-2"></i>
                          {material.name} (ไฟล์เดิม)
                        </small>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger rounded-0"
                          onClick={() => handleRemoveExistingFile(index)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="form-label">หมายเหตุ:</label>
                <input type="text" className="form-control rounded-0" name="materialsNote" value={formData.materialsNote} onChange={handleInputChange} placeholder="เช่น ใช้แอปพลิเคชันเช็คชื่อ" />
              </div>
            </div>
          </div>

          {/* ข้อเสนอแนะ */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-chat-dots me-2 text-warning"></i>ข้อเสนอแนะ
              </h5>
            </div>
            <div className="card-body">
              <textarea className="form-control rounded-0" rows={3} name="suggestions" value={formData.suggestions} onChange={handleInputChange}></textarea>
            </div>
          </div>

          {/* สถานะ */}
          <div className="card rounded-0 border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white rounded-0">
              <h5 className="card-title text-uppercase fw-semibold m-0">
                <i className="bi bi-gear me-2 text-warning"></i>สถานะ
              </h5>
            </div>
            <div className="card-body">
              <select className="form-select rounded-0 w-25" name="status" value={formData.status} onChange={handleInputChange}>
                <option value="draft">ร่าง</option>
                <option value="published">เผยแพร่</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex justify-content-center gap-3 mb-4">
            <button type="button" className="btn btn-secondary rounded-0 px-5" onClick={() => router.back()}>ยกเลิก</button>
            <button type="submit" className="btn btn-warning rounded-0 px-5" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}