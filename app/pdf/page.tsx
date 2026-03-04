"use client";

import { useEffect, useState } from "react";

interface PdfFile {
  _id: string;
  title: string;
  fileUrl: string;
  createdAt: string;
}

export default function PdfPage() {
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pdf")
      .then(res => res.json())
      .then(data => {
        setPdfs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching PDFs:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">PDF Files</h2>

      {pdfs.length === 0 ? (
        <p className="text-muted">ไม่พบไฟล์ PDF</p>
      ) : (
        <div className="row g-4">
          {pdfs.map((pdf) => (
            <div key={pdf._id} className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h3 className="card-title h5">{pdf.title}</h3>
                  <p className="small text-muted mb-3">
                    อัปโหลดเมื่อ: {new Date(pdf.createdAt).toLocaleDateString('th-TH')}
                  </p>
                  
                  <div className="ratio ratio-4x3 mb-3 border rounded">
                    <iframe
                      src={pdf.fileUrl}
                      title={pdf.title}
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-auto gap-2">
                    <a 
                      href={pdf.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm flex-fill"
                    >
                      <i className="bi bi-box-arrow-up-right me-1"></i>
                      Open PDF
                    </a>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(pdf.fileUrl);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = pdf.title;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error('Download error:', error);
                        }
                      }}
                      className="btn btn-primary btn-sm flex-fill"
                    >
                      <i className="bi bi-download me-1"></i>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
