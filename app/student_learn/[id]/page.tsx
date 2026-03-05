// D:\advisor-main\app\student_learn\[id]\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface HomeroomPlan {
  id: string;
  // ข้อมูลพื้นฐาน (จาก Edit)
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
  
  // การประเมิน
  evalObservation: boolean;
  evalWorksheet: boolean;
  evalParticipation: boolean;
  
  // สื่อ
  materials: { name: string; url: string }[];
  materialsNote: string;
  
  // ข้อเสนอแนะ
  suggestions: string;
  
  // สถานะ
  status: string;
  created_at: string;
  created_by: string;
  
  // ===== ข้อมูลจาก Record (บันทึกหลังกิจกรรม) =====
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
  
  // Database fields mapping
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
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showGallery, setShowGallery] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [masonryPage, setMasonryPage] = useState(0);
  const photosPerPage = 12; // Show 12 photos per masonry page

  const teacher_name = "อาจารย์วิมลรัตน์";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch plan data
        const planResponse = await fetch(`/api/learn/${params.id}`);
        const planResult = await planResponse.json();
        
        if (planResult.success) {
          console.log("🔍 API Response data:", planResult.data);
          console.log("🔍 special_track value:", planResult.data.special_track);
          console.log("Detail page planResult.data:", planResult.data);
          
          // Normalize materials field to always be an array of objects
          let normalizedMaterials: { name: string; url: string }[] = [];
          
          if (Array.isArray(planResult.data.materials)) {
            normalizedMaterials = planResult.data.materials.map((m: any) => {
              if (typeof m === 'string') {
                return { name: m.split('/').pop() || 'ไฟล์', url: m };
              }
              if (m && typeof m === 'object' && m.url) {
                return { name: m.name || m.url.split('/').pop() || 'ไฟล์', url: m.url };
              }
              return null;
            }).filter(Boolean) as { name: string; url: string }[];
          } else if (planResult.data.materials && typeof planResult.data.materials === 'string') {
            normalizedMaterials = [{ name: (planResult.data.materials as string).split('/').pop() || 'ไฟล์', url: planResult.data.materials }];
          }

          setPlan({
            ...planResult.data,
            materials: normalizedMaterials
          });
          
          console.log("Detail page plan.special_track:", planResult.data.special_track);
        } else {
          setError(planResult.message || "ไม่พบข้อมูลแผนกิจกรรม");
          return;
        }

        // Fetch photos
        const photosResponse = await fetch(`/api/photos?planId=${params.id}`);
        const photosResult = await photosResponse.json();
        
        if (photosResult.success) {
          setPhotos(photosResult.data);
        } else {
          console.error("Failed to fetch photos:", photosResult.message);
          setPhotos([]);
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'draft': 
        return <span className="badge bg-secondary rounded-0 px-3 py-2">ร่าง</span>;
      case 'published': 
        return <span className="badge bg-success rounded-0 px-3 py-2">เผยแพร่</span>;
      default: 
        return <span className="badge bg-secondary rounded-0 px-3 py-2">{status}</span>;
    }
  };

  const handleDelete = async () => {
    if (!confirm("คุณต้องการลบแผนกิจกรรมนี้ใช่หรือไม่?")) return;
    
    try {
      const response = await fetch(`/api/learn/${params.id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        router.push('/student_learn');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const openGallery = (index: number) => {
    setCurrentPhotoIndex(index);
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
  };

  const goToPrevious = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const goToFirst = () => {
    setCurrentPhotoIndex(0);
  };

  const goToLast = () => {
    setCurrentPhotoIndex(photos.length - 1);
  };

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

  const downloadAllPhotos = async () => {
    if (photos.length === 0) return;
    
    try {
      // Create a ZIP file with all photos
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Download all photos and add to ZIP
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const response = await fetch(photo.url);
        const blob = await response.blob();
        
        // Add photo to ZIP with proper filename
        const fileName = photo.caption 
          ? `${photo.caption.replace(/[^a-zA-Z0-9.-]/g, '_')}.jpg`
          : `photo_${String(i + 1).padStart(3, '0')}.jpg`;
        
        zip.file(fileName, blob);
      }
      
      // Generate and download ZIP
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

  // Masonry pagination functions
  const getTotalMasonryPages = () => Math.ceil(photos.length / photosPerPage);
  const getCurrentMasonryPagePhotos = () => {
    const start = masonryPage * photosPerPage;
    const end = start + photosPerPage;
    return photos.slice(start, end);
  };
  const goToMasonryPage = (page: number) => {
    setMasonryPage(page);
  };
  const goToNextMasonryPage = () => {
    if (masonryPage < getTotalMasonryPages() - 1) {
      setMasonryPage(masonryPage + 1);
    }
  };
  const goToPreviousMasonryPage = () => {
    if (masonryPage > 0) {
      setMasonryPage(masonryPage - 1);
    }
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
        
        .masonry-item .card {
          margin-bottom: 0;
        }
        
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
          .masonry-item {
            margin-bottom: 0.5rem;
          }
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
            <h4 className="text-primary mb-3">📋 ข้อมูลแผนกิจกรรม (ก่อนจัดกิจกรรม)</h4>
            
            <div className="row mb-4">
              <div className="col-md-8">
                <h3 className="fw-bold mb-3">{plan.topic || '-'}</h3>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <span className="badge bg-dark rounded-0 p-2">ระดับชั้น: {plan.level || '-'}</span>
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

            {/* Evaluation & Materials */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h5 className="fw-bold text-warning border-bottom border-warning pb-2">
                  <i className="bi bi-clipboard-check me-2"></i>การประเมินผล
                </h5>
                <ul className="list-unstyled mt-2">
                  <li>
                    <i className={`bi ${plan.evalObservation ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i>
                    การสังเกตพฤติกรรม
                  </li>
                  <li>
                    <i className={`bi ${plan.evalWorksheet ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i>
                    การทำใบงาน/แบบทดสอบ
                  </li>
                  <li>
                    <i className={`bi ${plan.evalParticipation ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i>
                    การมีส่วนร่วมในกิจกรรม
                  </li>
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
                      const isWord = /\.(doc|docx)$/i.test(fileName);
                      const isExcel = /\.(xls|xlsx)$/i.test(fileName);
                      const isPpt = /\.(ppt|pptx)$/i.test(fileName);
                      const isTxt = /\.txt$/i.test(fileName);
                      
                      let iconClass = 'bi-file-earmark-text text-primary';
                      if (isPdf) iconClass = 'bi-file-earmark-pdf text-danger';
                      if (isWord) iconClass = 'bi-file-earmark-word text-primary';
                      if (isExcel) iconClass = 'bi-file-earmark-excel text-success';
                      if (isPpt) iconClass = 'bi-file-earmark-slides text-warning';
                      if (isTxt) iconClass = 'bi-file-earmark-font text-secondary';
                      
                      return (
                        <div key={index} className="col-md-6 col-lg-4">
                          <div className="card h-100 rounded-0 border shadow-sm">
                            {isImage ? (
                              <div className="ratio ratio-16x9 bg-light overflow-hidden border-bottom">
                                <img 
                                  src={fileUrl} 
                                  alt={fileName}
                                  className="object-fit-cover w-100 h-100"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Preview';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="ratio ratio-16x9 bg-light d-flex align-items-center justify-content-center border-bottom">
                                <div className="text-center">
                                  <i className={`bi ${iconClass} display-4`}></i>
                                  <p className="small text-muted mb-0">
                                    {isPdf ? 'PDF' : isPpt ? 'PowerPoint' : isWord ? 'Word' : isTxt ? 'Text' : 'File'}
                                  </p>
                                </div>
                              </div>
                            )}
                            <div className="card-body p-2 d-flex flex-column justify-content-between">
                              <div className="text-truncate mb-2 small fw-semibold" title={fileName}>
                                {fileName}
                              </div>
                              <div className="d-grid gap-2">
                                <button
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(fileUrl);
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = fileName;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                      console.error('Download error:', error);
                                    }
                                  }}
                                  className="btn btn-primary btn-sm rounded-0"
                                >
                                  <i className="bi bi-download me-1"></i> ดาวน์โหลด
                                </button>
                              </div>
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

          {/* ข้อมูลจาก Record Page */}
          {(plan.has_record || plan.activity_notes || plan.activity_problems || plan.activity_solutions || plan.special_track || plan.individualFollowup) && (
            <div className="mb-4 mt-5 pt-4 border-top">
              <h4 className="text-success mb-3">📝 ข้อมูลบันทึกหลังกิจกรรม</h4>
              
              <div className="row mb-3">
                <div className="col-md-3">
                  <p><span className="fw-bold">วันที่จัดกิจกรรม:</span> {plan.activity_date || '-'}</p>
                </div>
                <div className="col-md-3">
                  <p><span className="fw-bold">จำนวนนักเรียน:</span> {plan.students_attended || '-'} / {plan.total_students || '-'} คน</p>
                </div>
                <div className="col-md-3">
                  <p><span className="fw-bold">ผู้บันทึก:</span> {plan.evaluator || '-'}</p>
                </div>
                <div className="col-md-3">
                  <p><span className="fw-bold">บันทึกเมื่อ:</span> {plan.recorded_at || '-'}</p>
                </div>
              </div>

              <div className="mb-3">
                <h5 className="fw-bold text-success border-bottom border-success pb-2">
                  <i className="bi bi-journal-text me-2"></i>6. บันทึกหลังกิจกรรม
                </h5>
                <div className="row">
                  <div className="col-md-6">
                    <p><span className="fw-bold">ผลการจัดกิจกรรม:</span></p>
                    <div className="bg-light p-2 rounded mb-2">
                      {plan.activity_notes || plan.teacherNote || '-'}
                    </div>
                    
                    <p><span className="fw-bold">ปัญหา/อุปสรรคที่พบ:</span></p>
                    <div className="bg-light p-2 rounded mb-2">
                      {plan.activity_problems || plan.problems || '-'}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <p><span className="fw-bold">นักเรียนที่ต้องติดตามเป็นพิเศษ:</span></p>
                    <div className="bg-light p-2 rounded mb-2">
                      {plan.special_track || '-'}
                    </div>
                    
                    <p><span className="fw-bold">บันทึกการจัดกิจกรรม (รายครั้ง):</span></p>
                    <div className="bg-light p-2 rounded">
                      {plan.activity_solutions || plan.sessionNote || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {(plan.special_track && plan.special_track !== '-') && (
                <div className="mb-3">
                  <h5 className="fw-bold text-success border-bottom border-success pb-2">
                    <i className="bi bi-person-badge me-2"></i>นักเรียนที่ต้องติดตามเป็นพิเศษ
                  </h5>
                  <div className="bg-light p-2 rounded">
                    {plan.special_track}
                  </div>
                </div>
              )}

              {plan.individualFollowup && (
                <div className="mb-3">
                  <h5 className="fw-bold text-success border-bottom border-success pb-2">
                    <i className="bi bi-person-badge me-2"></i>ติดตามผลรายบุคคล
                  </h5>
                  <div className="bg-light p-2 rounded">
                    {plan.individualFollowup || '-'}
                  </div>
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
                <span className="badge bg-info rounded-0 px-3 py-2">
                  {photos.length} รูปภาพ
                </span>
                <Link href={`/student_learn/${params.id}/album`} className="btn btn-info rounded-0 btn-sm">
                  <i className="bi bi-plus-circle me-1"></i>จัดการรูปภาพ
                </Link>
              </div>
            </div>
            
            {/* Photos Gallery - Masonry Layout with Pagination */}
            {photos.length > 0 ? (
              <>
                <div className="masonry-grid">
                  {getCurrentMasonryPagePhotos().map((photo, index) => {
                    const globalIndex = masonryPage * photosPerPage + index;
                    return (
                      <div key={photo.id} className="masonry-item">
                        <div 
                          className="card rounded-0 border shadow-sm h-100 cursor-pointer"
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
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Masonry Pagination */}
                {getTotalMasonryPages() > 1 && (
                  <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                    <button 
                      className="btn btn-outline-secondary rounded-0 btn-sm"
                      onClick={() => goToPreviousMasonryPage()}
                      disabled={masonryPage === 0}
                    >
                      <i className="bi bi-chevron-double-left"></i>
                    </button>
                    
                    <button 
                      className="btn btn-outline-secondary rounded-0 btn-sm"
                      onClick={() => goToPreviousMasonryPage()}
                      disabled={masonryPage === 0}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    
                    <div className="d-flex gap-1">
                      {(() => {
                        const pages = [];
                        const totalPages = getTotalMasonryPages();
                        const maxVisible = 5;
                        
                        if (totalPages <= maxVisible) {
                          // Show all pages
                          for (let i = 0; i < totalPages; i++) {
                            pages.push(
                              <button
                                key={i}
                                className={`btn btn-sm rounded-0 ${i === masonryPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => goToMasonryPage(i)}
                              >
                                {i + 1}
                              </button>
                            );
                          }
                        } else {
                          // Show smart pagination
                          pages.push(
                            <button
                              key={0}
                              className={`btn btn-sm rounded-0 ${0 === masonryPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                              onClick={() => goToMasonryPage(0)}
                            >
                              1
                            </button>
                          );
                          
                          if (masonryPage > 2) {
                            pages.push(<span key="start-dots" className="px-2">...</span>);
                          }
                          
                          const start = Math.max(1, Math.min(masonryPage - 1, totalPages - 3));
                          const end = Math.min(totalPages - 2, Math.max(masonryPage + 1, 3));
                          
                          for (let i = start; i <= end; i++) {
                            pages.push(
                              <button
                                key={i}
                                className={`btn btn-sm rounded-0 ${i === masonryPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => goToMasonryPage(i)}
                              >
                                {i + 1}
                              </button>
                            );
                          }
                          
                          if (masonryPage < totalPages - 3) {
                            pages.push(<span key="end-dots" className="px-2">...</span>);
                          }
                          
                          pages.push(
                            <button
                              key={totalPages - 1}
                              className={`btn btn-sm rounded-0 ${totalPages - 1 === masonryPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                              onClick={() => goToMasonryPage(totalPages - 1)}
                            >
                              {totalPages}
                            </button>
                          );
                        }
                        
                        return pages;
                      })()}
                    </div>
                    
                    <button 
                      className="btn btn-outline-secondary rounded-0 btn-sm"
                      onClick={() => goToNextMasonryPage()}
                      disabled={masonryPage === getTotalMasonryPages() - 1}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                    
                    <button 
                      className="btn btn-outline-secondary rounded-0 btn-sm"
                      onClick={() => goToNextMasonryPage()}
                      disabled={masonryPage === getTotalMasonryPages() - 1}
                    >
                      <i className="bi bi-chevron-double-right"></i>
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty state - no photos yet */
              <div className="text-center py-5 bg-light rounded">
                <i className="bi bi-images text-muted fs-1"></i>
                <p className="text-muted mt-3 mb-0">ยังไม่มีรูปภาพในอัลบัมนี้</p>
                <p className="text-muted">เพิ่มรูปภาพบันทึกความทรงจำจากกิจกรรมโฮมรูม</p>
                <Link href={`/student_learn/${params.id}/album`} className="btn btn-info rounded-0 mt-2">
                  <i className="bi bi-camera me-2"></i>เพิ่มรูปภาพแรก
                </Link>
              </div>
            )}
            
            {/* Photo Gallery Popup */}
            {showGallery && photos.length > 0 && (
              <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-90 d-flex align-items-center justify-content-center" style={{ zIndex: 9999 }}>
                <div className="container-fluid h-100 d-flex flex-column">
                  {/* Gallery Header */}
                  <div className="row py-3">
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center text-white">
                        <div className="d-flex align-items-center gap-3">
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-light rounded-0" onClick={goToFirst} disabled={currentPhotoIndex === 0}>
                              <i className="bi bi-chevron-double-left"></i> แรกสุด
                            </button>
                            <button className="btn btn-sm btn-outline-light rounded-0" onClick={goToPrevious}>
                              <i className="bi bi-chevron-left"></i> ก่อนหน้า
                            </button>
                            <button className="btn btn-sm btn-outline-light rounded-0" onClick={goToNext}>
                              ถัดไป <i className="bi bi-chevron-right"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-light rounded-0" onClick={goToLast} disabled={currentPhotoIndex === photos.length - 1}>
                              สุดท้าย <i className="bi bi-chevron-double-right"></i>
                            </button>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <button className="btn btn-sm btn-success rounded-0" onClick={downloadCurrentPhoto}>
                            <i className="bi bi-download"></i> ดาวน์โหลดรูปนี้
                          </button>
                          <button className="btn btn-sm btn-primary rounded-0" onClick={downloadAllPhotos}>
                            <i className="bi bi-folder-zip"></i> ดาวน์โหลดทั้งหมด
                          </button>
                          <button className="btn btn-sm btn-danger rounded-0" onClick={closeGallery}>
                            <i className="bi bi-x-lg"></i> ปิด
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gallery Content */}
                  <div className="row flex-grow-1">
                    <div className="col-12 d-flex align-items-center justify-content-center">
                      <div className="position-relative">
                        <img 
                          src={photos[currentPhotoIndex].url} 
                          alt={`Photo ${currentPhotoIndex + 1}`}
                          className="img-fluid"
                          style={{ maxHeight: '70vh', objectFit: 'contain' }}
                        />
                        {photos[currentPhotoIndex].caption && (
                          <div className="text-center mt-3 text-white">
                            <p className="mb-0">{photos[currentPhotoIndex].caption}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gallery Footer - Page Numbers */}
                  <div className="row py-3">
                    <div className="col-12">
                      <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
                        {/* Navigation buttons */}
                        <div className="d-flex gap-1">
                          <button 
                            className="btn btn-sm btn-outline-light rounded-0" 
                            onClick={goToFirst} 
                            disabled={currentPhotoIndex === 0}
                          >
                            <i className="bi bi-chevron-double-left"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-light rounded-0" 
                            onClick={goToPrevious}
                          >
                            <i className="bi bi-chevron-left"></i>
                          </button>
                        </div>
                        
                        {/* Page numbers */}
                        <div className="d-flex gap-2 flex-wrap">
                          {photos.length <= 5 ? (
                            // Show all pages if 5 or less
                            Array.from({ length: photos.length }, (_, i) => (
                              <button
                                key={i}
                                className={`btn btn-sm rounded-0 ${i === currentPhotoIndex ? 'btn-primary' : 'btn-outline-light'}`}
                                onClick={() => setCurrentPhotoIndex(i)}
                              >
                                {i + 1}
                              </button>
                            ))
                          ) : (
                            // Show smart pagination for more than 5 pages
                            (() => {
                              const pages = [];
                              const current = currentPhotoIndex;
                              const total = photos.length;
                              
                              // Always show first page
                              pages.push(
                                <button
                                  key={0}
                                  className={`btn btn-sm rounded-0 ${0 === current ? 'btn-primary' : 'btn-outline-light'}`}
                                  onClick={() => setCurrentPhotoIndex(0)}
                                >
                                  1
                                </button>
                              );
                              
                              // Show dots if needed
                              if (current > 2) {
                                pages.push(<span key="start-dots" className="text-white align-self-center">...</span>);
                              }
                              
                              // Show current page area
                              const start = Math.max(1, Math.min(current - 1, total - 3));
                              const end = Math.min(total - 1, Math.max(current + 1, 3));
                              
                              for (let i = start; i <= end; i++) {
                                if (i !== 0 && i !== total - 1) {
                                  pages.push(
                                    <button
                                      key={i}
                                      className={`btn btn-sm rounded-0 ${i === current ? 'btn-primary' : 'btn-outline-light'}`}
                                      onClick={() => setCurrentPhotoIndex(i)}
                                    >
                                      {i + 1}
                                    </button>
                                  );
                                }
                              }
                              
                              // Show dots if needed
                              if (current < total - 3) {
                                pages.push(<span key="end-dots" className="text-white align-self-center">...</span>);
                              }
                              
                              // Always show last page
                              if (total > 1) {
                                pages.push(
                                  <button
                                    key={total - 1}
                                    className={`btn btn-sm rounded-0 ${total - 1 === current ? 'btn-primary' : 'btn-outline-light'}`}
                                    onClick={() => setCurrentPhotoIndex(total - 1)}
                                  >
                                    {total}
                                  </button>
                                );
                              }
                              
                              return pages;
                            })()
                          )}
                        </div>
                        
                        {/* Navigation buttons */}
                        <div className="d-flex gap-1">
                          <button 
                            className="btn btn-sm btn-outline-light rounded-0" 
                            onClick={goToNext}
                          >
                            <i className="bi bi-chevron-right"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-light rounded-0" 
                            onClick={goToLast} 
                            disabled={currentPhotoIndex === photos.length - 1}
                          >
                            <i className="bi bi-chevron-double-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
    </div>
  );
}