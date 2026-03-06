"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface UserData {
  _id: string;
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  image: string;
  role: string;
  is_active: boolean;
  homeroom_level: string;
  homeroom_class: string;
  department: string;
  teacher_id: string;
  nickname: string;
  line_id: string;
}

interface MajorData {
  _id: string;
  major_id: number;
  major_name: string;
}

interface StudentData {
  _id: string;
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  image?: string;
  status?: string;
  level: string;
  class_group: string;
  class_number: string;
}

export default function UserEditPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    prefix: "นาย",
    first_name: "",
    last_name: "",
    email: "",
    password: "232165",
    nickname: "",
    teacher_id: "",
    phone: "",
    line_id: "",
    role: "TEACHER",
    is_active: true,
  });

  const [isCreating, setIsCreating] = useState(false);
  
  // Access Management states
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedClassGroup, setSelectedClassGroup] = useState("");
  const [selectedClassNumber, setSelectedClassNumber] = useState<string[]>([]);
  const [majors, setMajors] = useState<MajorData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [accessData, setAccessData] = useState<{
    user_id: string;
    level: string;
    class_group: string;
    class_number: string;
  }>({
    user_id: "",
    level: "",
    class_group: "",
    class_number: "",
  });

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/user/${params.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setUser(result.data);
        setFormData({
          prefix: result.data.prefix || "นาย",
          first_name: result.data.first_name || "",
          last_name: result.data.last_name || "",
          email: result.data.email || "",
          password: result.data.password || "",
          nickname: result.data.nickname || "",
          teacher_id: result.data.teacher_id || "",
          phone: result.data.phone || "",
          line_id: result.data.line_id || "",
          role: result.data.role || "TEACHER",
          is_active: result.data.is_active ?? true,
        });
      } else {
        throw new Error(result.message || "ไม่พบข้อมูลผู้ใช้");
      }
    } catch (error: any) {
      setError(error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
  };

  const toggleCreateMode = () => {
    setIsCreating(!isCreating);
    resetForm();
    if (!isCreating) {
      // Switching to create mode, clear user data
      setUser(null);
    }
  };

  useEffect(() => {
    if (params.id && !isCreating) {
      fetchUser();
      fetchUserAccess();
    }
    fetchMajors();
    fetchStudents();
  }, [params.id, isCreating]);
  
  const fetchUserAccess = async () => {
    try {
      const response = await fetch(`/api/user-access?user_id=${params.id}`);
      if (response.ok) {
        const result = await response.json();
        console.log("🔍 User Access Data:", result);
        if (result.success && result.data) {
          setAccessData(result.data);
          setSelectedLevel(result.data.level || "");
          setSelectedClassGroup(result.data.class_group || "");
          setSelectedClassNumber(result.data.class_number ? result.data.class_number.split(', ').filter((n: string) => n.trim()) : []);
          console.log("✅ Set selectedClassNumber:", result.data.class_number ? result.data.class_number.split(', ').filter((n: string) => n.trim()) : []);
        }
      }
    } catch (error) {
      console.error('Error fetching user access:', error);
    }
  };
  
  const fetchMajors = async () => {
    try {
      const response = await fetch('/api/majors');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMajors(result.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching majors:', error);
    }
  };
  
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await fetch('/api/student');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          if (!result.data || !Array.isArray(result.data)) {
            throw new Error("ข้อมูลที่ได้รับไม่ถูกต้อง");
          }
          setStudents(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };
  
  const getStudentsForSelection = () => {
    return students.filter(s => 
      (!selectedLevel || s.level === selectedLevel) && 
      (!selectedClassGroup || s.class_group === selectedClassGroup) && 
      (!selectedClassNumber.length || selectedClassNumber.includes(s.class_number))
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
      
      const endpoint = isCreating ? '/api/user' : `/api/user/${params.id}`;
      const method = isCreating ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        const userId = isCreating ? result.data._id : params.id;
        
        // Update or create access data
        if (selectedLevel || selectedClassGroup || selectedClassNumber.length > 0) {
          const accessResponse = await fetch('/api/user-access', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              level: selectedLevel || "",
              class_group: selectedClassGroup || "",
              class_number: selectedClassNumber.join(', ')
            }),
          });
          
          if (accessResponse.ok) {
            const message = isCreating ? "สร้างผู้ใช้และกำหนดการเข้าถึงสำเร็จ" : "อัปเดตข้อมูลและการเข้าถึงสำเร็จ";
            alert(message);
          } else {
            const message = isCreating ? "สร้างผู้ใช้สำเร็จ แต่ไม่สามารถกำหนดการเข้าถึงได้" : "อัปเดตข้อมูลสำเร็จ แต่ไม่สามารถอัปเดตการเข้าถึงได้";
            alert(message);
          }
        } else {
          const message = isCreating ? "สร้างผู้ใช้สำเร็จ" : "อัปเดตข้อมูลสำเร็จ";
          alert(message);
        }
        
        if (isCreating) {
          resetForm();
          console.log("🔄 Redirecting to /user after creating");
          router.push('/user');
        } else {
          console.log("🔄 Redirecting to /user/${params.id} after updating");
          router.push(`/user/${params.id}`);
        }
      } else {
        alert(result.message || "เกิดข้อผิดพลาด");
      }
    } catch (error: any) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="alert alert-danger">
          <h5 className="alert-heading">เกิดข้อผิดพลาด</h5>
          <p>{error}</p>
          <button onClick={fetchUser} className="btn btn-dark">
            <i className="bi bi-arrow-clockwise me-2"></i>ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="alert alert-warning">
          <h5 className="alert-heading">ไม่พบข้อมูลผู้ใช้</h5>
          <p>ไม่พบข้อมูลผู้ใช้ที่ระบุ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-pencil me-2 text-warning"></i>
                {isCreating ? 'สร้างผู้ใช้ใหม่' : (user ? `แก้ไขข้อมูลผู้ใช้: ${user.prefix} ${user.first_name} ${user.last_name}` : 'แก้ไขข้อมูลผู้ใช้')}
              </h2>
              <div>
                {!isCreating && user && (
                  <a href={`/user/${user._id}`} className="btn btn-secondary me-2">
                    <i className="bi bi-arrow-left me-2"></i>กลับ
                  </a>
                )}
               
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">
                  <i className={`bi ${isCreating ? 'bi-person-plus' : 'bi-person-gear'} me-2`}></i>
                  {isCreating ? 'สร้างผู้ใช้ใหม่' : 'แก้ไขข้อมูลผู้ใช้'}
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">อีเมล *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">รหัสผ่าน</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="กรอกใหม่ถ้าต้องการเปลี่ยน"
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">คำนำหน้า</label>
                      <select
                        className="form-select"
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
                        className="form-control"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label">นามสกุล *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">ชื่อเล่น</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.nickname}
                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">รหัสประจำตัวครู</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.teacher_id}
                        onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">เบอร์โทรศัพท์</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">LINE ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.line_id}
                        onChange={(e) => setFormData({ ...formData, line_id: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">บทบาท</label>
                      <select
                        className="form-select"
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
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            if (isCreating) {
                              router.push('/user');
                            } else {
                              router.push(`/user/${params.id}`);
                            }
                          }}
                        >
                          <i className="bi bi-x-lg me-2"></i>
                          {isCreating ? 'ยกเลิก' : 'กลับ'}
                        </button>
                        <button
                          type="submit"
                          className="btn btn-warning"
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
                              {isCreating ? 'สร้างผู้ใช้' : 'บันทึกการเปลี่ยนแปลง'}
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
        </div>

        {/* Access Management */}
        <div className="row mt-4">
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
                      setSelectedClassNumber([]);
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
                      setSelectedClassNumber([]);
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
                    value={selectedClassNumber.join(', ')}
                    onChange={(e) => setSelectedClassNumber(e.target.value.split(',').map(n => n.trim()).filter(n => n))}
                    placeholder="พิมพ์เลขที่ เช่น 1, 2, 3"
                  />
                </div>

                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <small>
                    {isCreating ? "การกำหนดการเข้าถึงจะถูกบันทึกพร้อมกับการสร้างผู้ใช้" : "การกำหนดการเข้าถึงจะถูกบันทึกพร้อมกับการอัปเดตข้อมูลผู้ใช้"}
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
                            <span className={`badge bg-${getStatusBadge(student.status || '')}`} style={{ fontSize: '10px' }}>
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
