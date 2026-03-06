"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserData {
  _id: string;
  email: string;
  provider: string;
  prefix: string;
  first_name: string;
  last_name: string;
  nickname: string;
  teacher_id: string;
  phone: string;
  line_id: string;
  image: string;
  role: string;
  is_active: boolean;
  homeroom_level: string;
  homeroom_class: string;
  department: string;
  last_login: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form states
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
    homeroom_level: "",
    homeroom_class: "",
    department: "",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('is_active', statusFilter);
      params.append('page', currentPage.toString());
      params.append('limit', '50');

      const response = await fetch(`/api/user?${params}`);
      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
        setTotalPages(result.pagination?.pages || 1);
      } else {
        setError(result.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, currentPage]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateModal(false);
        resetForm();
        fetchUsers();
        alert("สร้างผู้ใช้สำเร็จ");
      } else {
        alert(result.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/user/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setShowEditModal(false);
        resetForm();
        fetchUsers();
        alert("อัปเดตข้อมูลสำเร็จ");
      } else {
        alert(result.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?")) return;

    try {
      const response = await fetch(`/api/user/${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        fetchUsers();
        alert("ลบข้อมูลสำเร็จ");
      } else {
        alert(result.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "",
      provider: user.provider,
      prefix: user.prefix || "นาย",
      first_name: user.first_name,
      last_name: user.last_name,
      nickname: user.nickname || "",
      teacher_id: user.teacher_id || "",
      phone: user.phone || "",
      line_id: user.line_id || "",
      role: user.role,
      is_active: user.is_active,
      homeroom_level: user.homeroom_level || "",
      homeroom_class: user.homeroom_class || "",
      department: user.department || "",
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
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
      homeroom_level: "",
      homeroom_class: "",
      department: "",
    });
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(user =>
    (user.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.teacher_id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

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
          <p>{error}</p>
          <button onClick={fetchUsers} className="btn btn-dark">
            <i className="bi bi-arrow-clockwise me-2"></i>ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <style jsx>{`
        .hover-row:hover {
          background-color: #f8f9fa !important;
          cursor: pointer;
        }
        .hover-row:hover td {
          background-color: #f8f9fa !important;
        }
      `}</style>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-people-fill me-2 text-warning"></i>
                จัดการผู้ใช้ระบบ
              </h2>
              <button
                onClick={() => router.push('/user/new')}
                className="btn btn-warning rounded-0 text-uppercase fw-semibold"
              >
                <i className="bi bi-plus-circle me-2"></i>เพิ่มผู้ใช้
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control rounded-0"
                      placeholder="ค้นหาชื่อ, นามสกุล, อีเมล, รหัสครู..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select rounded-0"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <option value="">ทุกบทบาท</option>
                      <option value="ADMIN">ผู้ดูแลระบบ</option>
                      <option value="TEACHER">อาจารย์</option>
                      <option value="EXECUTIVE">ผู้บริหาร</option>
                      <option value="COMMITTEE">คณะกรรมการ</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select rounded-0"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">ทุกสถานะ</option>
                      <option value="true">ใช้งาน</option>
                      <option value="false">ระงับ</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setRoleFilter("");
                        setStatusFilter("");
                      }}
                      className="btn btn-outline-secondary rounded-0 w-100"
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>รีเซ็ต
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover table-striped mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th className="text-uppercase small">รูป</th>
                        <th className="text-uppercase small">ชื่อ-นามสกุล</th>
                        <th className="text-uppercase small">อีเมล</th>
                        <th className="text-uppercase small">รหัสครู</th>
                        <th className="text-uppercase small">บทบาท</th>
                        <th className="text-uppercase small">เบอร์โทร</th>
                        <th className="text-uppercase small">สถานะ</th>
                        <th className="text-uppercase small text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr 
                          key={user._id} 
                          style={{ cursor: 'pointer' }}
                          onClick={() => window.location.href = `/user/${user._id}`}
                          className="hover-row"
                        >
                          <td>
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={`${user.first_name} ${user.last_name}`}
                                className="rounded-circle"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                                style={{ width: '40px', height: '40px' }}
                              >
                                <i className="bi bi-person-fill"></i>
                              </div>
                            )}
                          </td>
                          <td>
                            <div>
                              <strong>{user.prefix} {user.first_name} {user.last_name}</strong>
                              {user.nickname && (
                                <div className="small text-muted">ชื่อเล่น: {user.nickname}</div>
                              )}
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>{user.teacher_id || '-'}</td>
                          <td>
                            <span className={`badge bg-${getRoleBadge(user.role)}`}>
                              {getRoleText(user.role)}
                            </span>
                          </td>
                          <td>{user.phone || '-'}</td>
                          <td>
                            <span className={`badge bg-${user.is_active ? 'success' : 'secondary'}`}>
                              {user.is_active ? 'ใช้งาน' : 'ระงับ'}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="btn-group" role="group">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/user/${user._id}/edit`);
                                }}
                                className="btn btn-sm btn-outline-warning rounded-0"
                                title="แก้ไข"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUser(user._id);
                                }}
                                className="btn btn-sm btn-outline-danger rounded-0"
                                title="ลบ"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="row mt-4">
            <div className="col-12">
              <nav>
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link rounded-0"
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      ก่อนหน้า
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <li
                      key={page}
                      className={`page-item ${currentPage === page ? 'active' : ''}`}
                    >
                      <button
                        className="page-link rounded-0"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link rounded-0"
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      ถัดไป
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content rounded-0">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title text-uppercase">
                  <i className="bi bi-person-plus me-2"></i>เพิ่มผู้ใช้ใหม่
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
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
                    <div className="col-md-4">
                      <label className="form-label">แผนก/กลุ่มสาระ</label>
                      <input
                        type="text"
                        className="form-control rounded-0"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">ระดับชั้นที่รับผิดชอบ</label>
                      <input
                        type="text"
                        className="form-control rounded-0"
                        value={formData.homeroom_level}
                        onChange={(e) => setFormData({ ...formData, homeroom_level: e.target.value })}
                        placeholder="เช่น ม.4, ม.5"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">กลุ่มเรียนที่รับผิดชอบ</label>
                      <input
                        type="text"
                        className="form-control rounded-0"
                        value={formData.homeroom_class}
                        onChange={(e) => setFormData({ ...formData, homeroom_class: e.target.value })}
                        placeholder="เช่น 1, 2, 3"
                      />
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
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary rounded-0"
                    onClick={() => setShowCreateModal(false)}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="btn btn-warning rounded-0"
                  >
                    <i className="bi bi-save me-2"></i>บันทึก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content rounded-0">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title text-uppercase">
                  <i className="bi bi-pencil-square me-2"></i>แก้ไขข้อมูลผู้ใช้
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUpdateUser}>
                <div className="modal-body">
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
                      <label className="form-label">รหัสผ่าน (ปล่อยว่างถ้าไม่เปลี่ยน)</label>
                      <input
                        type="password"
                        className="form-control rounded-0"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="ใส่รหัสผ่านใหม่ถ้าต้องการเปลี่ยน"
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
                    <div className="col-md-4">
                      <label className="form-label">แผนก/กลุ่มสาระ</label>
                      <input
                        type="text"
                        className="form-control rounded-0"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">ระดับชั้นที่รับผิดชอบ</label>
                      <input
                        type="text"
                        className="form-control rounded-0"
                        value={formData.homeroom_level}
                        onChange={(e) => setFormData({ ...formData, homeroom_level: e.target.value })}
                        placeholder="เช่น ม.4, ม.5"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">กลุ่มเรียนที่รับผิดชอบ</label>
                      <input
                        type="text"
                        className="form-control rounded-0"
                        value={formData.homeroom_class}
                        onChange={(e) => setFormData({ ...formData, homeroom_class: e.target.value })}
                        placeholder="เช่น 1, 2, 3"
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isActiveEdit"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="isActiveEdit">
                          เปิดใช้งานบัญชี
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary rounded-0"
                    onClick={() => setShowEditModal(false)}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="btn btn-warning rounded-0"
                  >
                    <i className="bi bi-save me-2"></i>บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
