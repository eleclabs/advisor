"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Photo {
  id: string;
  url: string;
  caption?: string;
  createdAt: string;
}

export default function PhotoAlbumPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [planInfo, setPlanInfo] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const photosPerPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchLoading(true);
        
        // Fetch plan info
        const planResponse = await fetch(`/api/learn/${params.id}`);
        const planResult = await planResponse.json();
        
        if (planResult.success) {
          setPlanInfo(planResult.data);
        } else {
          setError("ไม่พบข้อมูลแผนกิจกรรม");
          return;
        }

        // Fetch photos
        const photosResponse = await fetch(`/api/learn/photos?planId=${params.id}`);
        const photosResult = await photosResponse.json();
        
        if (photosResult.success) {
          setPhotos(photosResult.data);
        } else {
          console.error("Failed to fetch photos:", photosResult.message);
          setPhotos([]);
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setFetchLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (validFiles.length === 0) {
        alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return;
      }

      setSelectedFiles(prev => [...prev, ...validFiles]);
      
      // Create preview URLs
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
      
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemovePreview = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke the removed URL to free memory
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("กรุณาเลือกรูปภาพอย่างน้อย 1 รูป");
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('planId', params.id as string);
      
      selectedFiles.forEach((file, index) => {
        formData.append(`photos[${index}]`, file);
      });

      const response = await fetch('/api/learn/photos', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Clear previews
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewUrls([]);
      
      alert(result.message || "อัปโหลดรูปภาพเรียบร้อยแล้ว");
      
      // Refresh photos
      const photosResponse = await fetch(`/api/learn/photos?planId=${params.id}`);
      const photosResult = await photosResponse.json();
      
      if (photosResult.success) {
        setPhotos(photosResult.data);
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("คุณต้องการลบรูปภาพนี้ใช่หรือไม่?")) return;
    
    try {
      const response = await fetch(`/api/learn/photos?planId=${params.id}&photoId=${photoId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      alert(result.message || "ลบรูปภาพเรียบร้อยแล้ว");
      
      // Remove photo from state
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      
    } catch (error) {
      console.error("Delete error:", error);
      alert("เกิดข้อผิดพลาดในการลบรูปภาพ");
    }
  };

  // Pagination functions
  const getTotalPages = () => Math.ceil(photos.length / photosPerPage);
  const getCurrentPagePhotos = () => {
    const start = currentPage * photosPerPage;
    const end = start + photosPerPage;
    return photos.slice(start, end);
  };
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  const goToNextPage = () => {
    if (currentPage < getTotalPages() - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (fetchLoading) {
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

  if (error || !planInfo) {
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
                <i className="bi bi-images me-2 text-warning"></i>
                อัลบัมรูปภาพกิจกรรม
              </h2>
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted">{planInfo.topic}</span>
                <span className="badge bg-dark rounded-0 px-3 py-2">
                  {photos.length} รูปภาพ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="row mb-4">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/student_learn" className="text-decoration-none">
                    <i className="bi bi-house me-1"></i>แผนกิจกรรมโฮมรูม
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href={`/student_learn/${params.id}`} className="text-decoration-none">
                    {planInfo.topic}
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  อัลบัมรูปภาพ
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Upload Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card rounded-0 border-0 shadow-sm">
              <div className="card-header bg-dark text-white rounded-0">
                <h5 className="card-title text-uppercase fw-semibold m-0">
                  <i className="bi bi-cloud-upload me-2"></i>อัปโหลดรูปภาพ
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <input 
                    type="file" 
                    className="form-control rounded-0"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                  />
                  <small className="text-muted">รองรับไฟล์รูปภาพ (JPG, PNG, GIF) สามารถเลือกได้หลายไฟล์</small>
                </div>

                {/* Preview Section */}
                {previewUrls.length > 0 && (
                  <div className="mb-3">
                    <h6 className="fw-bold mb-3">รูปภาพที่เลือก:</h6>
                    <div className="row g-3">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="col-md-3 col-sm-6">
                          <div className="position-relative">
                            <img 
                              src={url} 
                              alt={`Preview ${index + 1}`}
                              className="img-fluid rounded"
                              style={{ height: '150px', objectFit: 'cover', width: '100%' }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm rounded-0 position-absolute top-0 end-0 m-1"
                              onClick={() => handleRemovePreview(index)}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-primary rounded-0"
                  onClick={handleUpload}
                  disabled={loading || selectedFiles.length === 0}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      กำลังอัปโหลด...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-upload me-2"></i>
                      อัปโหลดรูปภาพ ({selectedFiles.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Photos Gallery */}
        <div className="row">
          <div className="col-12">
            <div className="card rounded-0 border-0 shadow-sm">
              <div className="card-header bg-dark text-white rounded-0 d-flex justify-content-between align-items-center">
                <h5 className="card-title text-uppercase fw-semibold m-0">
                  <i className="bi bi-gallery me-2"></i>รูปภาพทั้งหมด
                </h5>
                <span className="badge bg-light text-dark rounded-0">
                  {photos.length} รูปภาพ
                </span>
              </div>
              <div className="card-body">
                {photos.length > 0 ? (
                  <>
                    <div className="masonry-grid">
                      {getCurrentPagePhotos().map((photo) => (
                        <div key={photo.id} className="masonry-item">
                          <div className="card rounded-0 border shadow-sm h-100">
                            <img 
                              src={photo.url} 
                              alt={photo.caption || 'Activity photo'}
                              className="card-img-top masonry-img"
                              loading="lazy"
                            />
                            <div className="position-absolute top-0 end-0 m-1">
                              <button
                                className="btn btn-danger btn-sm rounded-0"
                                onClick={() => handleDeletePhoto(photo.id)}
                                title="ลบรูปภาพ"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                            {photo.caption && (
                              <div className="card-body p-2">
                                <small className="text-muted text-truncate d-block">{photo.caption}</small>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {getTotalPages() > 1 && (
                      <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                        <button 
                          className="btn btn-outline-secondary rounded-0 btn-sm"
                          onClick={goToPreviousPage}
                          disabled={currentPage === 0}
                        >
                          <i className="bi bi-chevron-double-left"></i>
                        </button>
                        
                        <button 
                          className="btn btn-outline-secondary rounded-0 btn-sm"
                          onClick={goToPreviousPage}
                          disabled={currentPage === 0}
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                        
                        <div className="d-flex gap-1">
                          {(() => {
                            const pages = [];
                            const totalPages = getTotalPages();
                            const maxVisible = 5;
                            
                            if (totalPages <= maxVisible) {
                              // Show all pages
                              for (let i = 0; i < totalPages; i++) {
                                pages.push(
                                  <button
                                    key={i}
                                    className={`btn btn-sm rounded-0 ${i === currentPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => goToPage(i)}
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
                                  className={`btn btn-sm rounded-0 ${0 === currentPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                                  onClick={() => goToPage(0)}
                                >
                                  1
                                </button>
                              );
                              
                              if (currentPage > 2) {
                                pages.push(<span key="start-dots" className="px-2">...</span>);
                              }
                              
                              const start = Math.max(1, Math.min(currentPage - 1, totalPages - 3));
                              const end = Math.min(totalPages - 2, Math.max(currentPage + 1, 3));
                              
                              for (let i = start; i <= end; i++) {
                                pages.push(
                                  <button
                                    key={i}
                                    className={`btn btn-sm rounded-0 ${i === currentPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => goToPage(i)}
                                  >
                                    {i + 1}
                                  </button>
                                );
                              }
                              
                              if (currentPage < totalPages - 3) {
                                pages.push(<span key="end-dots" className="px-2">...</span>);
                              }
                              
                              pages.push(
                                <button
                                  key={totalPages - 1}
                                  className={`btn btn-sm rounded-0 ${totalPages - 1 === currentPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                                  onClick={() => goToPage(totalPages - 1)}
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
                          onClick={goToNextPage}
                          disabled={currentPage === getTotalPages() - 1}
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                        
                        <button 
                          className="btn btn-outline-secondary rounded-0 btn-sm"
                          onClick={goToNextPage}
                          disabled={currentPage === getTotalPages() - 1}
                        >
                          <i className="bi bi-chevron-double-right"></i>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-images text-muted fs-1"></i>
                    <p className="text-muted mt-3">ยังไม่มีรูปภาพในอัลบัมนี้</p>
                    <p className="text-muted">อัปโหลดรูปภาพเพื่อเริ่มสร้างอัลบัมกิจกรรม</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="d-flex justify-content-between">
              <button className="btn btn-secondary rounded-0" onClick={() => router.back()}>
                <i className="bi bi-arrow-left me-2"></i>กลับ
              </button>
              <Link href={`/student_learn/${params.id}`} className="btn btn-primary rounded-0">
                <i className="bi bi-eye me-2"></i>ดูรายละเอียดกิจกรรม
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
