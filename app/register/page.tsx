// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    prefix: "นาย",
    first_name: "",
    last_name: "",
    nickname: "",
    teacher_id: "",
    phone: "",
    role: "TEACHER", // ค่าเริ่มต้น
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("สมัครสมาชิกสำเร็จ! กำลังนำไปยังหน้าเข้าสู่ระบบ...");
        
        // รอ 2 วินาทีแล้วไปหน้า login
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
      }
    } catch (error) {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0 rounded-0">
              {/* Header */}
              <div className="card-header bg-dark text-white text-center py-4 rounded-0">
                <h3 className="fw-bold mb-0">
                  <i className="bi bi-person-plus-fill me-2 text-warning"></i>
                  สมัครสมาชิก
                </h3>
                <p className="text-white-50 mb-0 mt-2">กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้</p>
              </div>

              {/* Body */}
              <div className="card-body p-5">
                {error && (
                  <div className="alert alert-danger rounded-0 d-flex align-items-center mb-4">
                    <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success rounded-0 d-flex align-items-center mb-4">
                    <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* แสดงบทบาทที่กำหนด */}
                  <div className="mb-4">
                    <div className="alert alert-info rounded-0 d-flex align-items-center">
                      <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                      <span>บัญชีของคุณจะถูกสร้างในฐานะ <strong>อาจารย์</strong></span>
                    </div>
                  </div>

                  <div className="row">
                    {/* อีเมล */}
                    <div className="col-md-12 mb-3">
                      <label className="form-label fw-semibold small text-uppercase">
                        <i className="bi bi-envelope me-2"></i>
                        อีเมล <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="form-control rounded-0"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        required
                      />
                    </div>

                    {/* รหัสผ่าน */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold small text-uppercase">
                        <i className="bi bi-lock me-2"></i>
                        รหัสผ่าน <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className="form-control rounded-0"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          minLength={6}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                      </div>
                      <small className="text-muted">อย่างน้อย 6 ตัวอักษร</small>
                    </div>

                    {/* ยืนยันรหัสผ่าน */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold small text-uppercase">
                        <i className="bi bi-lock-fill me-2"></i>
                        ยืนยันรหัสผ่าน <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          className="form-control rounded-0"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-0"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                      </div>
                    </div>

                    {/* คำนำหน้า */}
                    <div className="col-md-3 mb-3">
                      <label className="form-label fw-semibold small text-uppercase">
                        คำนำหน้า
                      </label>
                      <select
                        name="prefix"
                        className="form-select rounded-0"
                        value={formData.prefix}
                        onChange={handleChange}
                      >
                        <option value="นาย">นาย</option>
                        <option value="นาง">นาง</option>
                        <option value="นางสาว">นางสาว</option>
                        <option value="อื่นๆ">อื่นๆ</option>
                      </select>
                    </div>

                    {/* ชื่อ */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold small text-uppercase">
                        ชื่อ <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        className="form-control rounded-0"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* นามสกุล */}
                    <div className="col-md-5 mb-3">
                      <label className="form-label fw-semibold small text-uppercase">
                        นามสกุล <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        className="form-control rounded-0"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* ชื่อเล่น */}
                    <div className="col-md-3 mb-3">
                      <label className="form-label fw-semibold small text-uppercase">
                        ชื่อเล่น
                      </label>
                      <input
                        type="text"
                        name="nickname"
                        className="form-control rounded-0"
                        value={formData.nickname}
                        onChange={handleChange}
                      />
                    </div>

                    {/* รหัสครู */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold small text-uppercase">
                        รหัสประจำตัวครู
                      </label>
                      <input
                        type="text"
                        name="teacher_id"
                        className="form-control rounded-0"
                        value={formData.teacher_id}
                        onChange={handleChange}
                        placeholder="(ถ้ามี)"
                      />
                    </div>

                    {/* เบอร์โทร */}
                    <div className="col-md-5 mb-3">
                      <label className="form-label fw-semibold small text-uppercase">
                        เบอร์โทรศัพท์
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control rounded-0"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="081-234-5678"
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input rounded-0"
                        id="terms"
                        required
                      />
                      <label className="form-check-label small" htmlFor="terms">
                        ข้าพเจ้ายอมรับ{" "}
                        <Link href="/terms" className="text-warning text-decoration-none">
                          ข้อกำหนดและเงื่อนไข
                        </Link>{" "}
                        และ{" "}
                        <Link href="/privacy" className="text-warning text-decoration-none">
                          นโยบายความเป็นส่วนตัว
                        </Link>
                      </label>
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
                        กำลังสมัครสมาชิก...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>
                        สมัครสมาชิก
                      </>
                    )}
                  </button>

                  {/* Login Link */}
                  <div className="text-center">
                    <span className="text-muted">มีบัญชีอยู่แล้ว? </span>
                    <Link href="/login" className="text-warning text-decoration-none fw-bold">
                      เข้าสู่ระบบ
                    </Link>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="card-footer bg-light text-center py-3 rounded-0">
                <small className="text-muted">
                  <i className="bi bi-c-circle me-1"></i>
                  2568 ระบบดูแลผู้เรียนรายบุคคล
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}