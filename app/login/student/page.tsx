"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentLoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Use student ID as email for authentication (students have email like "600@student.com")
      const email = `${studentId}@student.com`;
      
      const result = await signIn("credentials", {
        email,
        password: studentId,
        redirect: false,
      });

      if (result?.error) {
        setError("การเข้าสู่ระบบล้มเหลว กรุณาตรวจสอบข้อมูลอีกครั้ง");
      } else {
        // Wait for session to be available
        setTimeout(() => {
          if (session?.user) {
            // Set student session in localStorage for backward compatibility
            const studentName = `${firstName} ${lastName}`;
            localStorage.setItem('studentName', studentName);
            localStorage.setItem('studentId', studentId);
            localStorage.setItem('studentMongoId', session.user.id || ''); // Use session ID
            localStorage.setItem('isStudent', 'true');
            localStorage.setItem('token', 'student-session');
            
            // Redirect to student assessment page
            router.push("/assessment/student");
          } else {
            setError("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้");
          }
        }, 1000);
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0 rounded-0">
              {/* Header */}
              <div className="card-header bg-dark text-white text-center py-4 rounded-0">
                <h3 className="fw-bold mb-0">
                  <i className="bi bi-mortarboard-fill me-2 text-warning"></i>
                   ระบบประเมินสำหรับนักเรียน
                </h3>
                <h4 className="text-white-50 mb-0 mt-2">เข้าสู่ระบบนักเรียน</h4>
              </div>

              {/* Body */}
              <div className="card-body p-5">
                {error && (
                  <div className="alert alert-danger rounded-0 d-flex align-items-center mb-4">
                    <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* First Name */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-person me-2"></i>
                      ชื่อจริง
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 rounded-0">
                        <i className="bi bi-person text-secondary"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 rounded-0"
                        placeholder="ชื่อจริง"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-person me-2"></i>
                      นามสกุล
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 rounded-0">
                        <i className="bi bi-person text-secondary"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 rounded-0"
                        placeholder="นามสกุล"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Student ID */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-card-text me-2"></i>
                      รหัสนักเรียน
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 rounded-0">
                        <i className="bi bi-lock text-secondary"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 rounded-0"
                        placeholder="รหัสนักเรียน"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-dark w-100 rounded-0 text-uppercase fw-semibold py-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        กำลังเข้าสู่ระบบ...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        เข้าสู่ระบบ
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Footer */}
              <div className="card-footer bg-light text-center py-3 rounded-0">
                <small className="text-muted">
                  Student Portal - Assessment System
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
