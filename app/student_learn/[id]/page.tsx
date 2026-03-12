// D:\advisor-main\app\student_learn\[id]\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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

interface HomeroomPlan {
  id: string;
  level: string;
  semester: string;
  academicYear: string;
  week: string;
  time: string;
  topic: string;
  objectives: string[];
  
  checkAttendance: string;
  checkUniform: string;
  announceNews: string;
  
  warmup: string;
  mainActivity: string;
  summary: string;
  
  trackProblems: string;
  individualCounsel: string;
  
  evalObservation: boolean;
  evalWorksheet: boolean;
  evalParticipation: boolean;
  
  materials: { name: string; url: string }[];
  materialsNote: string;
  
  suggestions: string;
  
  status: string;
  created_at: string;
  created_by: string;
  
  // ===== ข้อมูลเป้าหมายที่เลือกตอนสร้างแผน =====
  target_class_group?: string;
  target_class_numbers?: string[];
  
  // ===== ข้อมูลจาก Record =====
  teacherNote?: string;
  problems?: string;
  special_track?: string;
  sessionNote?: string;
  individualFollowup?: string;
  activity_date?: string;
  students_attended?: string;
  total_students?: string;
  evaluator?: string;
  has_record?: boolean;
  recorded_at?: string;
  
  activity_notes?: string;
  activity_problems?: string;
  activity_solutions?: string;
}

interface Photo {
  id: string;
  url: string;
  caption?: string;
  createdAt: string;
}

export default function HomeroomPlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [plan, setPlan] = useState<HomeroomPlan | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentLoading, setStudentLoading] = useState(false);
  const [error, setError] = useState("");
  const [showStudentList, setShowStudentList] = useState(false);
  
  const [showGallery, setShowGallery] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [masonryPage, setMasonryPage] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const photosPerPage = 12;

  const teacher_name = "อาจารย์วิมลรัตน์";

  // ดึงข้อมูลแผนและนักเรียน
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. ดึงข้อมูลแผน
        const planResponse = await fetch(`/api/learn/${params.id}`);
        const planResult = await planResponse.json();
        
        if (!planResult.success) {
          setError(planResult.message || "ไม่พบข้อมูลแผนกิจกรรม");
          return;
        }

        const planData = planResult.data;
        
        // Normalize materials
        let normalizedMaterials: { name: string; url: string }[] = [];
        if (Array.isArray(planData.materials)) {
          normalizedMaterials = planData.materials.map((m: any) => {
            if (typeof m === 'string') return { name: m.split('/').pop() || 'ไฟล์', url: m };
            if (m && typeof m === 'object' && m.url) return { name: m.name || m.url.split('/').pop() || 'ไฟล์', url: m.url };
            return null;
          }).filter(Boolean) as { name: string; url: string }[];
        } else if (planData.materials && typeof planData.materials === 'string') {
          normalizedMaterials = [{ name: planData.materials.split('/').pop() || 'ไฟล์', url: planData.materials }];
        }

        setPlan({
          ...planData,
          materials: normalizedMaterials
        });

        // 2. ดึงข้อมูลนักเรียนตามเงื่อนไขของแผน
        await fetchStudentsByPlan(planData);

        // 3. ดึงข้อมูลรูปภาพ
        const photosResponse = await fetch(`/api/learn/photos?planId=${params.id}`);
        const photosResult = await photosResponse.json();
        if (photosResult.success) setPhotos(photosResult.data);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchData();
  }, [params.id]);

  // ฟังก์ชันดึงนักเรียนตามเงื่อนไขของแผน
  const fetchStudentsByPlan = async (planData: any) => {
    setStudentLoading(true);
    try {
      // สร้าง query parameters
      const params = new URLSearchParams();
      if (planData.level) params.append('level', planData.level);
      
      // ดึงข้อมูลนักเรียนทั้งหมดตามระดับชั้น
      const response = await fetch(`/api/student?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        let filteredStudents = result.data;
        
        // กรองตามกลุ่มเรียน ถ้ามี
        if (planData.target_class_group) {
          filteredStudents = filteredStudents.filter((s: any) => 
            s.class_group === planData.target_class_group
          );
        }
        
        // กรองตามเลขที่ ถ้ามี
        if (planData.target_class_numbers && planData.target_class_numbers.length > 0) {
          filteredStudents = filteredStudents.filter((s: any) => 
            planData.target_class_numbers.includes(s.class_number)
          );
        }
        
        // จัดรูปแบบข้อมูล
        const formattedStudents = filteredStudents.map((s: any) => ({
          _id: s._id,
          id: s.id || "",
          prefix: s.prefix || "",
          first_name: s.first_name || "",
          last_name: s.last_name || "",
          name: `${s.prefix || ''}${s.first_name || ''} ${s.last_name || ''}`.trim(),
          level: s.level || "",
          class_group: s.class_group || "",
          class_number: s.class_number || "",
          status: s.status || "ปกติ",
          image: s.image || ""
        }));
        
        setStudents(formattedStudents);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setStudentLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'draft': return <span className="badge bg-secondary rounded-0 px-3 py-2">ร่าง</span>;
      case 'published': return <span className="badge bg-success rounded-0 px-3 py-2">เผยแพร่</span>;
      default: return <span className="badge bg-secondary rounded-0 px-3 py-2">{status}</span>;
    }
  };

  const handleDelete = async () => {
    if (!confirm("คุณต้องการลบแผนกิจกรรมนี้ใช่หรือไม่?")) return;
    try {
      const response = await fetch(`/api/learn/${params.id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) router.push('/student_learn');
      else alert(result.message);
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  // Photo gallery functions
  const openGallery = (index: number) => {
    setCurrentPhotoIndex(index);
    setShowGallery(true);
  };

  const closeGallery = () => setShowGallery(false);
  const goToPrevious = () => setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  const goToNext = () => setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  const goToFirst = () => setCurrentPhotoIndex(0);
  const goToLast = () => setCurrentPhotoIndex(photos.length - 1);

  const downloadCurrentPhoto = async () => {
    const photo = photos[currentPhotoIndex];
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `photo_${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const downloadSinglePhoto = async (photo: Photo) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = photo.caption 
        ? `${photo.caption.replace(/[^a-zA-Z0-9.-]/g, '_')}.jpg`
        : `photo_${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const downloadAllPhotos = async () => {
    if (photos.length === 0) return;
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const response = await fetch(photo.url);
        const blob = await response.blob();
        const fileName = photo.caption 
          ? `${photo.caption.replace(/[^a-zA-Z0-9.-]/g, '_')}.jpg`
          : `photo_${String(i + 1).padStart(3, '0')}.jpg`;
        zip.file(fileName, blob);
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `album_photos_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(zipUrl);
    } catch (error) {
      console.error('Download ZIP error:', error);
      alert('เกิดข้อผิดพลาดในการสร้างโฟลเดอร์ ZIP');
    }
  };

  // Sorting & pagination for photos
  const getSortedPhotos = () => {
    return [...photos].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };

  const getTotalMasonryPages = () => Math.ceil(photos.length / photosPerPage);
  const getCurrentMasonryPagePhotos = () => {
    const sorted = getSortedPhotos();
    const start = masonryPage * photosPerPage;
    return sorted.slice(start, start + photosPerPage);
  };
  
  const goToPreviousMasonryPage = () => {
    if (masonryPage > 0) setMasonryPage(masonryPage - 1);
  };

  const goToNextMasonryPage = () => {
    if (masonryPage < getTotalMasonryPages() - 1) setMasonryPage(masonryPage + 1);
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3 text-muted">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle-fill text-warning fs-1"></i>
          <p className="mt-3 text-muted">{error || "ไม่พบข้อมูลแผนกิจกรรม"}</p>
          <button className="btn btn-primary rounded-0 mt-3" onClick={() => router.back()}>
            <i className="bi bi-arrow-left me-2"></i>กลับ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <style jsx>{`
        .masonry-grid {
          column-count: 2;
          column-gap: 1rem;
        }
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 1rem;
        }
        .masonry-item .card { margin-bottom: 0; }
        .masonry-img {
          width: 100%;
          height: auto;
          display: block;
          min-height: 250px;
        }
        @media (max-width: 768px) {
          .masonry-grid {
            column-count: 1;
            column-gap: 0.5rem;
          }
          .masonry-item { margin-bottom: 0.5rem; }
        }
      `}</style>
      
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="fw-bold m-0">
                <i className="bi bi-file-text me-2 text-warning"></i>
                รายละเอียดแผนกิจกรรมโฮมรูม
              </h2>
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted">ครูที่ปรึกษา: {plan.created_by || teacher_name}</span>
                {getStatusBadge(plan.status)}
                {plan.has_record && (
                  <span className="badge bg-info rounded-0 px-3 py-2">บันทึกผลแล้ว</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="row mb-4">
          <div className="col-12 d-flex justify-content-between">
            <button className="btn btn-outline-dark rounded-0" onClick={() => router.back()}>
              <i className="bi bi-arrow-left me-2"></i>กลับ
            </button>
            <div className="d-flex gap-2">
              <Link href={`/student_learn/${params.id}/record`} className="btn btn-success rounded-0">
                <i className="bi bi-check-circle me-2"></i>
                {plan.has_record ? 'แก้ไขบันทึกผล' : 'บันทึกผลกิจกรรม'}
              </Link>
              <Link href={`/student_learn/${params.id}/edit`} className="btn btn-warning rounded-0">
                <i className="bi bi-pencil me-2"></i>แก้ไขแผน
              </Link>
              <button className="btn btn-danger rounded-0" onClick={handleDelete}>
                <i className="bi bi-trash me-2"></i>ลบ
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white p-4 border">
     {/* ข้อมูลแผนกิจกรรม */}
<div className="mb-4">
  <h4 className="text-primary mb-3">📋 ข้อมูลแผนกิจกรรม</h4>
  
  <div className="row mb-4">
    <div className="col-md-8">
      <h3 className="fw-bold mb-3">{plan.topic || '-'}</h3>
      <div className="d-flex flex-wrap gap-2 mb-2">
        <span className="badge bg-dark rounded-0 p-2">ระดับชั้น: {plan.level || '-'}</span>
        
        {/* ✅ กลุ่มเรียนและเลขที่ ใช้สีดำเหมือนกัน */}
        {plan.target_class_group && (
          <span className="badge bg-dark rounded-0 p-2">กลุ่ม: {plan.target_class_group}</span>
        )}
        {plan.target_class_numbers && plan.target_class_numbers.length > 0 && (
          <span className="badge bg-dark rounded-0 p-2">
            เลขที่: {plan.target_class_numbers.length > 5 
              ? `${plan.target_class_numbers[0]} - ${plan.target_class_numbers[plan.target_class_numbers.length-1]}`
              : plan.target_class_numbers.join(', ')}
          </span>
        )}
        
        <span className="badge bg-dark rounded-0 p-2">สัปดาห์ที่ {plan.week || '-'}</span>
        <span className="badge bg-dark rounded-0 p-2">ภาคเรียนที่ {plan.semester || '-'}/{plan.academicYear || '-'}</span>
        <span className="badge bg-dark rounded-0 p-2">เวลา: {plan.time || '-'} นาที</span>
      </div>
    </div>
  </div>
            {/* Objectives */}
            {plan.objectives && plan.objectives.length > 0 && (
              <div className="mb-4">
                <h5 className="fw-bold text-warning border-bottom border-warning pb-2">
                  <i className="bi bi-bullseye me-2"></i>วัตถุประสงค์
                </h5>
                <ol className="mt-2">
                  {plan.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Activities */}
            <div className="mb-4">
              <h5 className="fw-bold text-warning border-bottom border-warning pb-2">
                <i className="bi bi-list-check me-2"></i>ขั้นตอนการดำเนินกิจกรรม
              </h5>
              
              <h6 className="fw-bold mt-3">ช่วงที่ 1: การจัดการระเบียบและวินัย</h6>
              <div className="bg-light p-3 mb-3">
                <p><span className="fw-bold">เช็คชื่อ:</span> {plan.checkAttendance || '-'}</p>
                <p><span className="fw-bold">ตรวจระเบียบ:</span> {plan.checkUniform || '-'}</p>
                <p><span className="fw-bold">แจ้งข่าวสาร:</span> {plan.announceNews || '-'}</p>
              </div>

              <h6 className="fw-bold">ช่วงที่ 2: กิจกรรมพัฒนาผู้เรียน</h6>
              <div className="bg-light p-3 mb-3">
                <p><span className="fw-bold">กิจกรรมนำ:</span> {plan.warmup || '-'}</p>
                <p><span className="fw-bold">กิจกรรมหลัก:</span> {plan.mainActivity || '-'}</p>
                <p><span className="fw-bold">การสรุป:</span> {plan.summary || '-'}</p>
              </div>

              <h6 className="fw-bold">ช่วงที่ 3: การดูแลรายบุคคล</h6>
              <div className="bg-light p-3">
                <p><span className="fw-bold">ติดตามนักเรียนที่มีปัญหา:</span> {plan.trackProblems || '-'}</p>
                <p><span className="fw-bold">เปิดโอกาสให้นักเรียนปรึกษา:</span> {plan.individualCounsel || '-'}</p>
              </div>
            </div>

            {/* ===== ส่วนสำคัญ: รายชื่อนักเรียนที่เข้าร่วม (ตามแผน) ===== */}
            <div className="mb-4 mt-4 pt-3 border-top">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-info mb-0">
                  <i className="bi bi-people-fill me-2"></i>
                  รายชื่อนักเรียนที่เข้าร่วม (ตามแผน)
                </h5>
                <button
                  className="btn btn-outline-info rounded-0 btn-sm"
                  onClick={() => setShowStudentList(!showStudentList)}
                  disabled={studentLoading}
                >
                  <i className={`bi bi-chevron-${showStudentList ? 'up' : 'down'} me-1`}></i>
                  {showStudentList ? 'ซ่อน' : 'แสดง'}รายชื่อ ({students.length} คน)
                </button>
              </div>

              {/* เงื่อนไขของแผน */}
              <div className="bg-light p-3 mb-3">
                <div className="row">
                  <div className="col-md-4">
                    <strong>ระดับชั้น:</strong> {plan.level}
                  </div>
                  {plan.target_class_group && (
                    <div className="col-md-4">
                      <strong>กลุ่มเรียน:</strong> {plan.target_class_group}
                    </div>
                  )}
                  {plan.target_class_numbers && plan.target_class_numbers.length > 0 && (
                    <div className="col-md-4">
                      <strong>เลขที่:</strong> {plan.target_class_numbers.join(', ')}
                    </div>
                  )}
                </div>
                {!plan.target_class_group && !plan.target_class_numbers?.length && (
                  <div className="text-muted mt-2">
                    <i className="bi bi-info-circle me-2"></i>
                    แผนนี้ไม่ได้ระบุกลุ่มเรียนหรือเลขที่เฉพาะเจาะจง แสดงนักเรียนทั้งหมดในระดับชั้น {plan.level}
                  </div>
                )}
              </div>

              {/* ตารางรายชื่อนักเรียน */}
              {showStudentList && (
                <div className="table-responsive">
                  {studentLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-info me-2"></div>
                      กำลังโหลดรายชื่อนักเรียน...
                    </div>
                  ) : (
                    <table className="table table-bordered table-hover bg-white">
                      <thead className="table-secondary">
                        <tr>
                          <th>#</th>
                          <th>รหัสนักเรียน</th>
                          <th>ชื่อ-นามสกุล</th>
                          <th>ระดับชั้น</th>
                          <th>กลุ่มเรียน</th>
                          <th>เลขที่</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.length > 0 ? (
                          students.map((student, index) => (
                            <tr key={student._id}>
                              <td>{index + 1}</td>
                              <td className="fw-bold">{student.id}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  {student.image ? (
                                    <img 
                                      src={student.image} 
                                      alt={student.name}
                                      className="rounded-circle me-2"
                                      style={{width: '30px', height: '30px', objectFit: 'cover'}}
                                    />
                                  ) : (
                                    <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2" style={{width: '30px', height: '30px'}}>
                                      <i className="bi bi-person-fill"></i>
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
                            <td colSpan={6} className="text-center py-4 text-muted">
                              <i className="bi bi-people fs-1 d-block mb-2"></i>
                              ไม่มีนักเรียนตามเงื่อนไขนี้
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            {/* Evaluation & Materials */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h5 className="fw-bold text-warning border-bottom border-warning pb-2">
                  <i className="bi bi-clipboard-check me-2"></i>การประเมินผล
                </h5>
                <ul className="list-unstyled mt-2">
                  <li><i className={`bi ${plan.evalObservation ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i> การสังเกตพฤติกรรม</li>
                  <li><i className={`bi ${plan.evalWorksheet ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i> การทำใบงาน/แบบทดสอบ</li>
                  <li><i className={`bi ${plan.evalParticipation ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i> การมีส่วนร่วมในกิจกรรม</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h5 className="fw-bold text-warning border-bottom border-warning pb-2">
                  <i className="bi bi-paperclip me-2"></i>สื่อและวัสดุอุปกรณ์
                </h5>
                {plan.materials && plan.materials.length > 0 ? (
                  <div className="row g-3 mt-2">
                    {plan.materials.map((material, index) => {
                      const fileName = material.name;
                      const fileUrl = material.url;
                      const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileName);
                      const isPdf = /\.pdf$/i.test(fileName);
                      
                      let iconClass = 'bi-file-earmark-text text-primary';
                      if (isPdf) iconClass = 'bi-file-earmark-pdf text-danger';
                      
                      return (
                        <div key={index} className="col-md-6 col-lg-4">
                          <div className="card h-100 rounded-0 border shadow-sm">
                            {isImage ? (
                              <div className="ratio ratio-16x9 bg-light overflow-hidden border-bottom">
                                <img 
                                  src={fileUrl} 
                                  alt={fileName}
                                  className="object-fit-cover w-100 h-100"
                                  onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Preview'}
                                />
                              </div>
                            ) : (
                              <div className="ratio ratio-16x9 bg-light d-flex align-items-center justify-content-center border-bottom">
                                <div className="text-center">
                                  <i className={`bi ${iconClass} display-4`}></i>
                                  <p className="small text-muted mb-0">{isPdf ? 'PDF' : 'File'}</p>
                                </div>
                              </div>
                            )}
                            <div className="card-body p-2">
                              <div className="text-truncate small fw-semibold mb-2" title={fileName}>
                                {fileName}
                              </div>
                              <button
                                onClick={async () => {
                                  const response = await fetch(fileUrl);
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = fileName;
                                  link.click();
                                }}
                                className="btn btn-primary btn-sm rounded-0 w-100"
                              >
                                <i className="bi bi-download me-1"></i> ดาวน์โหลด
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-2 text-muted">- ไม่มีสื่อการเรียนรู้ -</p>
                )}
                {plan.materialsNote && (
                  <small className="text-muted d-block mt-2">หมายเหตุ: {plan.materialsNote}</small>
                )}
              </div>
            </div>

            {/* Suggestions */}
            <div className="mb-4">
              <h5 className="fw-bold text-warning border-bottom border-warning pb-2">
                <i className="bi bi-chat-dots me-2"></i>ข้อเสนอแนะ
              </h5>
              <p className="mt-2">{plan.suggestions || '-'}</p>
            </div>
          </div>

          {/* ข้อมูลบันทึกหลังกิจกรรม */}
          {(plan.has_record || plan.activity_notes || plan.activity_problems || plan.activity_solutions || plan.special_track || plan.individualFollowup) && (
            <div className="mb-4 mt-5 pt-4 border-top">
              <h4 className="text-success mb-3">📝 ข้อมูลบันทึกหลังกิจกรรม</h4>
              
              <div className="row mb-3">
                <div className="col-md-3"><p><span className="fw-bold">วันที่จัดกิจกรรม:</span> {plan.activity_date || '-'}</p></div>
                <div className="col-md-3"><p><span className="fw-bold">จำนวนนักเรียน:</span> {plan.students_attended || '-'} / {plan.total_students || '-'} คน</p></div>
                <div className="col-md-3"><p><span className="fw-bold">ผู้บันทึก:</span> {plan.evaluator || '-'}</p></div>
                <div className="col-md-3"><p><span className="fw-bold">บันทึกเมื่อ:</span> {plan.recorded_at || '-'}</p></div>
              </div>

              <div className="mb-3">
                <h5 className="fw-bold text-success border-bottom border-success pb-2">
                  <i className="bi bi-journal-text me-2"></i>6. บันทึกหลังกิจกรรม
                </h5>
                <div className="row">
                  <div className="col-md-6">
                    <p><span className="fw-bold">ผลการจัดกิจกรรม:</span></p>
                    <div className="bg-light p-2 rounded mb-2">{plan.activity_notes || plan.teacherNote || '-'}</div>
                    <p><span className="fw-bold">ปัญหา/อุปสรรคที่พบ:</span></p>
                    <div className="bg-light p-2 rounded mb-2">{plan.activity_problems || plan.problems || '-'}</div>
                  </div>
                  <div className="col-md-6">
                    <p><span className="fw-bold">นักเรียนที่ต้องติดตามเป็นพิเศษ:</span></p>
                    <div className="bg-light p-2 rounded mb-2">{plan.special_track || '-'}</div>
                    <p><span className="fw-bold">บันทึกการจัดกิจกรรม (รายครั้ง):</span></p>
                    <div className="bg-light p-2 rounded">{plan.activity_solutions || plan.sessionNote || '-'}</div>
                  </div>
                </div>
              </div>

              {plan.individualFollowup && (
                <div className="mb-3">
                  <h5 className="fw-bold text-success border-bottom border-success pb-2">
                    <i className="bi bi-person-badge me-2"></i>ติดตามผลรายบุคคล
                  </h5>
                  <div className="bg-light p-2 rounded">{plan.individualFollowup}</div>
                </div>
              )}
            </div>
          )}

          {/* Photo Album Section */}
          <div className="mb-4 mt-5 pt-4 border-top">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="text-info mb-0">
                <i className="bi bi-images me-2"></i>อัลบัมรูปภาพกิจกรรม
              </h4>
              <div className="d-flex align-items-center gap-2">
                <select 
                  className="form-select form-select-sm rounded-0" 
                  style={{ width: 'auto' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                >
                  <option value="newest">ใหม่สุด</option>
                  <option value="oldest">เก่าสุด</option>
                </select>
                <button 
                  className="btn btn-primary rounded-0 btn-sm"
                  onClick={downloadAllPhotos}
                  disabled={photos.length === 0}
                >
                  <i className="bi bi-folder-zip"></i> ดาวน์โหลดทั้งหมด
                </button>
                <span className="badge bg-info rounded-0 px-3 py-2">{photos.length} รูปภาพ</span>
                <Link href={`/student_learn/${params.id}/album`} className="btn btn-info rounded-0 btn-sm">
                  <i className="bi bi-plus-circle me-1"></i>จัดการรูปภาพ
                </Link>
              </div>
            </div>
            
            {photos.length > 0 ? (
              <>
                <div className="masonry-grid">
                  {getCurrentMasonryPagePhotos().map((photo, index) => {
                    const globalIndex = masonryPage * photosPerPage + index;
                    return (
                      <div key={photo.id} className="masonry-item">
                        <div 
                          className="card rounded-0 border shadow-sm h-100"
                          style={{ cursor: 'pointer' }}
                          onClick={() => openGallery(globalIndex)}
                        >
                          <img 
                            src={photo.url} 
                            alt={photo.caption || 'Activity photo'}
                            className="card-img-top masonry-img"
                            loading="lazy"
                          />
                          {photo.caption && (
                            <div className="card-body p-2">
                              <small className="text-muted text-truncate d-block">{photo.caption}</small>
                            </div>
                          )}
                          <div 
                            className="position-absolute top-0 end-0 m-1"
                            onClick={(e) => { e.stopPropagation(); downloadSinglePhoto(photo); }}
                          >
                            <button className="btn btn-primary btn-sm rounded-0">
                              <i className="bi bi-download"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {getTotalMasonryPages() > 1 && (
                  <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                    <button className="btn btn-outline-secondary rounded-0 btn-sm" onClick={() => setMasonryPage(0)} disabled={masonryPage === 0}>
                      <i className="bi bi-chevron-double-left"></i>
                    </button>
                    <button className="btn btn-outline-secondary rounded-0 btn-sm" onClick={goToPreviousMasonryPage} disabled={masonryPage === 0}>
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    
                    <span className="mx-2">
                      หน้า {masonryPage + 1} / {getTotalMasonryPages()}
                    </span>
                    
                    <button className="btn btn-outline-secondary rounded-0 btn-sm" onClick={goToNextMasonryPage} disabled={masonryPage === getTotalMasonryPages() - 1}>
                      <i className="bi bi-chevron-right"></i>
                    </button>
                    <button className="btn btn-outline-secondary rounded-0 btn-sm" onClick={() => setMasonryPage(getTotalMasonryPages() - 1)} disabled={masonryPage === getTotalMasonryPages() - 1}>
                      <i className="bi bi-chevron-double-right"></i>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-5 bg-light rounded">
                <i className="bi bi-images text-muted fs-1"></i>
                <p className="text-muted mt-3 mb-0">ยังไม่มีรูปภาพในอัลบัมนี้</p>
                <Link href={`/student_learn/${params.id}/album`} className="btn btn-info rounded-0 mt-2">
                  <i className="bi bi-camera me-2"></i>เพิ่มรูปภาพแรก
                </Link>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="text-end text-muted small mt-3 pt-3 border-top">
            <div>สร้างเมื่อ: {plan.created_at || new Date().toLocaleDateString('th-TH')}</div>
            <div>สร้างโดย: {plan.created_by || '-'}</div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {showGallery && photos.length > 0 && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-90 d-flex align-items-center justify-content-center" style={{ zIndex: 9999 }}>
          <div className="container-fluid h-100 d-flex flex-column">
            <div className="row py-3">
              <div className="col-12">
                <div className="d-flex justify-content-end align-items-center text-white">
                  <button className="btn btn-sm btn-success rounded-0 me-2" onClick={downloadCurrentPhoto}>
                    <i className="bi bi-download"></i> ดาวน์โหลดรูปนี้
                  </button>
                  <button className="btn btn-sm btn-danger rounded-0" onClick={closeGallery}>
                    <i className="bi bi-x-lg"></i> ปิด
                  </button>
                </div>
              </div>
            </div>

            <div className="row flex-grow-1">
              <div className="col-12 d-flex align-items-center justify-content-center">
                <div className="position-relative">
                  <img 
                    src={photos[currentPhotoIndex].url} 
                    alt={`Photo ${currentPhotoIndex + 1}`}
                    className="img-fluid"
                    style={{ maxHeight: '70vh', objectFit: 'contain' }}
                  />
                </div>
              </div>
            </div>

            <div className="row py-3">
              <div className="col-12">
                <div className="d-flex justify-content-center align-items-center gap-3">
                  <button className="btn btn-sm btn-outline-light rounded-0" onClick={goToFirst} disabled={currentPhotoIndex === 0}>
                    <i className="bi bi-chevron-double-left"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-light rounded-0" onClick={goToPrevious}>
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <span className="text-white">
                    {currentPhotoIndex + 1} / {photos.length}
                  </span>
                  <button className="btn btn-sm btn-outline-light rounded-0" onClick={goToNext}>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-light rounded-0" onClick={goToLast} disabled={currentPhotoIndex === photos.length - 1}>
                    <i className="bi bi-chevron-double-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}