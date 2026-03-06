"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface UserData {
  _id: string;
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  email: string;
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
  last_login: string;
  createdAt: string;
  updatedAt: string;
}

interface AccessData {
  user_id: string;
  level: string;
  class_group: string;
  class_number: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [accessData, setAccessData] = useState<AccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔍 Fetching user data for ID:", params.id);
      const response = await fetch(`/api/user/${params.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("📥 User data result:", result);
      
      if (result.success) {
        setUser(result.data);
      } else {
        throw new Error(result.message || "ไม่พบข้อมูลผู้ใช้");
      }
    } catch (error: any) {
      setError(error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // Fetch access data for this user
  const fetchAccessData = async () => {
    try {
      const response = await fetch(`/api/user-access?user_id=${params.id}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setAccessData(result.data);
        }
      }
    } catch (error) {
      console.log("No access data or error fetching:", error);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchUser();
      fetchAccessData();
    }
  }, [params.id]);

  const getRoleBadge = (role: string) => {
    const colors = {
      ADMIN: 'danger',
      TEACHER: 'primary',
      EXECUTIVE: 'success',
      COMMITTEE: 'warning'
    };
    return colors[role as keyof typeof colors] || 'secondary';
  };

  const getRoleText = (role: string) => {
    const texts = {
      ADMIN: 'ผู้ดูแลระบบ',
      TEACHER: 'อาจารย์',
      EXECUTIVE: 'ผู้บริหาร',
      COMMITTEE: 'คณะกรรมการ'
    };
    return texts[role as keyof typeof texts] || role;
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
                <i className="bi bi-person-badge me-2 text-warning"></i>
                ข้อมูลผู้ใช้: {user.prefix} {user.first_name} {user.last_name}
              </h2>
              <div>
                <a href="/user" className="btn btn-secondary me-2">
                  <i className="bi bi-arrow-left me-2"></i>กลับ
                </a>
                <a href={`/user/${user._id}/edit`} className="btn btn-primary">
                  <i className="bi bi-pencil me-2"></i>แก้ไขข้อมูล
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="row">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={`${user.prefix} ${user.first_name} ${user.last_name}`}
                    className="rounded-circle mb-3"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white mb-3 mx-auto"
                    style={{ width: '150px', height: '150px', fontSize: '60px' }}
                  >
                    <i className="bi bi-person-fill"></i>
                  </div>
                )}
                <h5 className="card-title">{user.prefix} {user.first_name} {user.last_name}</h5>
                {user.nickname && (
                  <p className="text-muted">ชื่อเล่น: {user.nickname}</p>
                )}
                <span className={`badge bg-${getRoleBadge(user.role)} mb-2`}>
                  {getRoleText(user.role)}
                </span>
                <div>
                  <span className={`badge bg-${user.is_active ? 'success' : 'secondary'}`}>
                    {user.is_active ? 'ใช้งาน' : 'ระงับ'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  ข้อมูลทั่วไป
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">รหัสประจำตัวครู</label>
                    <p className="form-control-plaintext fw-bold">{user.teacher_id || '-'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">อีเมล</label>
                    <p className="form-control-plaintext">{user.email}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">เบอร์โทรศัพท์</label>
                    <p className="form-control-plaintext">{user.phone || '-'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">LINE ID</label>
                    <p className="form-control-plaintext">{user.line_id || '-'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">ระดับชั้นที่รับผิดชอบ</label>
                    <p className="form-control-plaintext fw-bold">{accessData?.level || '-'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">กลุ่มเรียนที่รับผิดชอบ</label>
                    <p className="form-control-plaintext fw-bold">{accessData?.class_group || '-'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">เลขที่ที่รับผิดชอบ</label>
                    <p className="form-control-plaintext fw-bold">{accessData?.class_number || '-'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">บทบาท</label>
                    <p className="form-control-plaintext">
                      <span className={`badge bg-${getRoleBadge(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">สถานะ</label>
                    <p className="form-control-plaintext">
                      <span className={`badge bg-${user.is_active ? 'success' : 'secondary'}`}>
                        {user.is_active ? 'ใช้งาน' : 'ระงับ'}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">เข้าใช้งานล่าสุด</label>
                    <p className="form-control-plaintext">{user.last_login || '-'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">สร้างเมื่อ</label>
                    <p className="form-control-plaintext">{new Date(user.createdAt).toLocaleDateString('th-TH')}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">อัปเดตล่าสุด</label>
                    <p className="form-control-plaintext">{new Date(user.updatedAt).toLocaleDateString('th-TH')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
