"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface StudentData {
  _id: string;
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  level: string;
  class_group: string;
  class_number: string;
  status: string;
  image: string;
}

interface MajorData {
  _id: string;
  major_id: number;
  major_name: string;
}

interface AccessData {
  user_id: string;
  level: string;
  class_group: string;
  class_number: string;
}

export default function NewUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    provider: "credentials",
    prefix: "นาย",
    first_name: "",
    last_name: "",
    nickname: "",
    teacher_id: "",
    phone: "",
    line_id: "",
    role: "TEACHER",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [majors, setMajors] = useState<MajorData[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>("");
  const [selectedClassNumber, setSelectedClassNumber] = useState<string>("");
  const [accessData, setAccessData] = useState<AccessData>({
    user_id: "",
    level: "",
    class_group: "",
    class_number: ""
  });

  const fetchMajors = async () => {
    try {
      const response = await fetch('/api/majors');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setMajors(result.data || []);
      } else {
        throw new Error(result.message || "เกิดข้อผิดพลาดจาก API");
      }
    } catch (error: any) {
      console.log("Error fetching majors:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      
      const response = await fetch('/api/student');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("ข้อมูลที่ได้รับไม่ถูกต้อง");
        }
        
        setStudents(result.data);
      } else {
        throw new Error(result.message || "เกิดข้อผิดพลาดจาก API");
      }
    } catch (error: any) {
      console.log("Error fetching students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchMajors();
    fetchStudents();
  }, []);

  // Get unique levels
  const getLevels = () => {
    return [...new Set(students.map(s => s.level).filter(Boolean))].sort();
  };

  // Get class groups for selected level
  const getClassGroups = () => {
    return [...new Set(students
      .filter(s => s.level === selectedLevel)
      .map(s => s.class_group)
      .filter(Boolean)
    )].sort();
  };

  // Get class numbers for selected level and class group
  const getClassNumbers = () => {
    return [...new Set(students
      .filter(s => s.level === selectedLevel && s.class_group === selectedClassGroup)
      .map(s => s.class_number)
      .filter(Boolean)
    )].sort();
  };

  // Get students for selected criteria
  const getStudentsForSelection = () => {
    return students.filter(s => 
      (!selectedLevel || s.level === selectedLevel) && 
      (!selectedClassGroup || s.class_group === selectedClassGroup) && 
      (!selectedClassNumber || s.class_number === selectedClassNumber)
    ).sort((a: StudentData, b: StudentData) => a.id.localeCompare(b.id));
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'นักเรียนปกติ': 'success',
      'นักเรียนเสี่ยง': 'warning',
      'นักเรียนพิเศษ': 'info'
    };
    return colors[status as keyof typeof colors] || 'secondary';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // If access data is configured, save it after user creation
        if (selectedLevel || selectedClassGroup || selectedClassNumber) {
          const accessResponse = await fetch('/api/user-access', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: result.data._id,
              level: selectedLevel || "",
              class_group: selectedClassGroup || "",
              class_number: selectedClassNumber || ""
            }),
          });
          
          if (accessResponse.ok) {
            alert("สร้างผู้ใช้และกำหนดการเข้าถึงสำเร็จ");
          } else {
            alert("สร้างผู้ใช้สำเร็จ แต่ไม่สามารถกำหนดการเข้าถึงได้");
          }
        } else {
          alert("สร้างผู้ใช้สำเร็จ");
        }
        
        router.push('/user');
      } else {
        alert(result.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-person-plus me-2 text-warning"></i>
                สร้างผู้ใช้ใหม่
              </h2>
              <a href="/user" className="btn btn-secondary">
                <i className="bi bi-arrow-left me-2"></i>กลับ
              </a>
            </div>
          </div>
        </div>

        {/* Create Form and Access Management */}
        <div className="row">
          {/* User Creation Form */}
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">
                  <i className="bi bi-person-plus me-2"></i>
                  สร้างผู้ใช้ใหม่
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">อีเมล *</label>
                      <input
                        type="email"
                        className="form-control rounded-0"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">รหัสผ่าน *</label>
                      <input
                        type="password"
                        className="form-control rounded-0"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">คำนำหน้า</label>
                      <select
                        className="form-select rounded-0"
                        value={formData.prefix}
                        onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                      >
                        <option value="นาย">นาย</option>
                        <option value="นาง">นาง</option>
                        <option value="นางสาว">นางสาว</option>
                        <option value="อื่นๆ">อื่นๆ</option>
                      </select>
                    </div>
                    <div className="col-md-5">
                      <label className="form-label">ชื่อ *</label>
                      <input
                        type="text"
                        className="form-control rounded-0"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label">นามสกุล *</label>
                      <input
                        type="text"
                        className="form-control rounded-0"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">ชื่อเล่น</label>
                      <input
                        type="text"
                        className="form-control rounded-0"
                        value={formData.nickname}
                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">รหัสประจำตัวครู</label>
                      <input
                        type="text"
                        className="form-control rounded-0"
                        value={formData.teacher_id}
                        onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">เบอร์โทรศัพท์</label>
                      <input
                        type="tel"
                        className="form-control rounded-0"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">LINE ID</label>
                      <input
                        type="text"
                        className="form-control rounded-0"
                        value={formData.line_id}
                        onChange={(e) => setFormData({ ...formData, line_id: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">บทบาท</label>
                      <select
                        className="form-select rounded-0"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="TEACHER">อาจารย์</option>
                        <option value="ADMIN">ผู้ดูแลระบบ</option>
                        <option value="EXECUTIVE">ผู้บริหาร</option>
                        <option value="COMMITTEE">คณะกรรมการ</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isActive"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="isActive">
                          เปิดใช้งานบัญชี
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex justify-content-between">
                        <a href="/user" className="btn btn-secondary rounded-0">
                          <i className="bi bi-x-lg me-2"></i>ยกเลิก
                        </a>
                        <button
                          type="submit"
                          className="btn btn-warning rounded-0"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              กำลังบันทึก...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-save me-2"></i>
                              สร้างผู้ใช้
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Access Management */}
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">
                  <i className="bi bi-sliders me-2"></i>
                  กำหนดการเข้าถึงนักเรียน
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">ระดับชั้น</label>
                  <select
                    className="form-select rounded-0"
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value);
                      setSelectedClassGroup("");
                      setSelectedClassNumber("");
                    }}
                  >
                    <option value="">เลือกระดับชั้น</option>
                    <option value="ปวช.1">ปวช.1</option>
                    <option value="ปวช.2">ปวช.2</option>
                    <option value="ปวช.3">ปวช.3</option>
                    <option value="ปวส.1">ปวส.1</option>
                    <option value="ปวส.2">ปวส.2</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">กลุ่มเรียน</label>
                  <select
                    className="form-select rounded-0"
                    value={selectedClassGroup}
                    onChange={(e) => {
                      setSelectedClassGroup(e.target.value);
                      setSelectedClassNumber("");
                    }}
                  >
                    <option value="">เลือกกลุ่มเรียน</option>
                    {majors.map((major) => (
                      <option key={major._id} value={major.major_name}>
                        {major.major_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">เลขที่</label>
                  <input
                    type="text"
                    className="form-control rounded-0"
                    value={selectedClassNumber}
                    onChange={(e) => setSelectedClassNumber(e.target.value)}
                    placeholder="พิมพ์เลขที่ เช่น 1, 2, 3"
                  />
                </div>

                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <small>
                    การกำหนดการเข้าถึงจะถูกบันทึกพร้อมกับการสร้างผู้ใช้
                  </small>
                </div>

                {/* Students Preview */}
                {(selectedLevel || selectedClassGroup || selectedClassNumber) && (
                  <div className="mt-3">
                    <h6 className="mb-2">นักเรียนที่จะเข้าถึงได้:</h6>
                    <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {loadingStudents ? (
                        <div className="text-center py-2">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">กำลังโหลด...</span>
                          </div>
                        </div>
                      ) : getStudentsForSelection().length > 0 ? (
                        getStudentsForSelection().slice(0, 5).map((student: StudentData) => (
                          <div key={student._id} className="d-flex align-items-center mb-2">
                            {student.image ? (
                              <img
                                src={student.image}
                                alt={`${student.prefix} ${student.first_name} ${student.last_name}`}
                                className="rounded-circle me-2"
                                style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white me-2"
                                style={{ width: '30px', height: '30px', fontSize: '12px' }}
                              >
                                <i className="bi bi-person-fill"></i>
                              </div>
                            )}
                            <div className="flex-grow-1">
                              <div className="small fw-bold">{student.id}</div>
                              <div className="small text-muted">{student.prefix} {student.first_name}</div>
                            </div>
                            <span className={`badge bg-${getStatusBadge(student.status)}`} style={{ fontSize: '10px' }}>
                              {student.status || '-'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-2">
                          <small className="text-muted">ไม่พบนักเรียนในเงื่อนไขที่เลือก</small>
                        </div>
                      )}
                      {getStudentsForSelection().length > 5 && (
                        <div className="text-center mt-2">
                          <small className="text-muted">และอีก {getStudentsForSelection().length - 5} คน...</small>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
