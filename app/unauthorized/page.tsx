// app/unauthorized/page.tsx
"use client";  // ✅ เพิ่มบรรทัดนี้

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center p-5 bg-white shadow-lg" style={{ maxWidth: '500px' }}>
        <div className="mb-4">
          <i className="bi bi-shield-lock-fill text-danger" style={{ fontSize: '5rem' }}></i>
        </div>
        <h1 className="display-6 fw-bold text-uppercase mb-3">ไม่มีสิทธิ์เข้าถึง</h1>
        <p className="text-muted mb-4">
          คุณไม่มีสิทธิ์เพียงพอในการเข้าถึงหน้านี้
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <Link href="/" className="btn btn-dark rounded-0 px-4">
            <i className="bi bi-house-door me-2"></i>หน้าหลัก
          </Link>
          <button
            onClick={() => router.back()}
            className="btn btn-warning rounded-0 px-4"
          >
            <i className="bi bi-arrow-left me-2"></i>ย้อนกลับ
          </button>
        </div>
      </div>
    </div>
  );
}