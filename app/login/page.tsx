// app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Check user role and redirect accordingly
        try {
          const response = await fetch('/api/auth/me');
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              console.log('Login successful, storing user data:', data.user);
              localStorage.setItem('currentUser', JSON.stringify(data.user));
              localStorage.setItem('token', 'authenticated');
              
              // Redirect based on user role
              if (data.user.role === 'STUDENT') {
                router.push('/student-dashboard');
              } else {
                router.push('/student'); // For admin/teacher/etc.
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user data after login:', error);
          router.push('/student'); // Fallback
        }
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับทดสอบ login เร็วๆ (เลือก role)
  const quickLogin = async (role: string) => {
    const testAccounts = {
      ADMIN: { email: "admin@test.com", password: "123456" },
      TEACHER: { email: "teacher@test.com", password: "123456" },
      EXECUTIVE: { email: "executive@test.com", password: "123456" },
      COMMITTEE: { email: "committee@test.com", password: "123456" },
    };

    const account = testAccounts[role as keyof typeof testAccounts];
    setEmail(account.email);
    setPassword(account.password);
    
    // Auto submit
    setTimeout(() => {
      document.getElementById("loginForm")?.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }, 100);
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
                  ระบบดูแลช่วยเหลือผู้เรียน
                </h3>
                <h4 className="text-white-50 mb-0 mt-2">เข้าสู่ระบบ</h4>
              </div>

              {/* Body */}
              <div className="card-body p-5">
                {error && (
                  <div className="alert alert-danger rounded-0 d-flex align-items-center mb-4">
                    <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                    <span>{error}</span>
                  </div>
                )}

                <form id="loginForm" onSubmit={handleSubmit}>
                  {/* Email */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold small ">
                      <i className="bi bi-person me-2"></i>
                      อีเมล
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 rounded-0">
                        <i className="bi bi-person text-secondary"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 rounded-0"
                        placeholder="กรอกอีเมล"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold small">
                      <i className="bi bi-card-text me-2"></i>
                      รหัสผ่าน
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 rounded-0">
                        <i className="bi bi-lock text-secondary"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control border-start-0 rounded-0"
                        placeholder="กรอกรหัสผ่าน"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0 rounded-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                  </div>

                  

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-warning w-100 py-3 rounded-0 fw-bold text-uppercase mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        กำลังเข้าสู่ระบบ...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        เข้าสู่ระบบ
                      </>
                    )}
                  </button>

                  {/* Register Link */}
                  <div className="text-center">
                    <span className="text-muted">ยังไม่มีบัญชี? </span>
                    <Link href="/register" className="text-warning text-decoration-none fw-bold">
                      สมัครสมาชิก
                    </Link>
                  </div>
                </form>

                {/* Quick Login - สำหรับทดสอบ (สามารถลบออกได้) */}
{/*                 <div className="mt-5 pt-4 border-top">
                  <p className="text-center small text-muted mb-3">ทดลองเข้าใช้งาน (สำหรับพัฒนา)</p>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <button
                      onClick={() => quickLogin("ADMIN")}
                      className="btn btn-sm btn-outline-danger rounded-0"
                    >
                      ADMIN
                    </button>
                    <button
                      onClick={() => quickLogin("TEACHER")}
                      className="btn btn-sm btn-outline-primary rounded-0"
                    >
                      TEACHER
                    </button>
                    <button
                      onClick={() => quickLogin("EXECUTIVE")}
                      className="btn btn-sm btn-outline-success rounded-0"
                    >
                      EXECUTIVE
                    </button>
                    <button
                      onClick={() => quickLogin("COMMITTEE")}
                      className="btn btn-sm btn-outline-warning rounded-0"
                    >
                      COMMITTEE
                    </button>
                  </div>
                </div> */}
              </div>

              {/* Footer */}
              <div className="card-footer bg-light text-center py-3 rounded-0">
                <small className="text-muted">
              
                 
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}