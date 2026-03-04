"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file) {
      alert("กรุณาเลือกไฟล์");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Upload success");
        setFile(null);
        // รีเซ็ตค่า input file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow-sm p-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2 className="mb-4">Upload PDF</h2>

        <div className="mb-3">
          <label className="form-label">เลือกไฟล์ (รองรับ PDF, Office, รูปภาพ, วิดีโอ, เสียง)</label>
          <input
            type="file"
            className="form-control"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.mp3,.mp4,.png,.jpeg,.jpg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <button 
          className="btn btn-primary w-100" 
          onClick={upload}
          disabled={loading}
        >
          {loading ? "กำลังอัปโหลด..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
