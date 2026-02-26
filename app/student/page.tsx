"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Student {
  _id: string;
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  name?: string;
  level: string;
  status: string;
  advisor_name: string;
  class_group: string;
  phone_number: string;
}

export default function StudentListPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student[]>([]);
  const [filteredStudent, setFilteredStudent] = useState<Student[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedYear, setSelectedYear] = useState("2568");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const teacher_name = "อาจารย์วิมลรัตน์ ใจดี";
  const academic_year = "2568";

  // Load student data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/student");
        const result = await response.json();
        
        console.log("API Response:", result);
        
        let studentsData = [];
        if (result.success && Array.isArray(result.data)) {
          studentsData = result.data;
        } else if (Array.isArray(result)) {
          studentsData = result;
        }
        
        const formattedData = studentsData.map((s: any) => ({
          _id: s._id,
          id: s.id || s._id,
          prefix: s.prefix || "",
          first_name: s.first_name || "",
          last_name: s.last_name || "",
          name: s.first_name && s.last_name ? `${s.prefix || ''}${s.first_name} ${s.last_name}` : s.name || "",
          level: s.level || "",
          status: s.status || "ปกติ",
          advisor_name: s.advisor_name || "",
          class_group: s.class_group || "",
          phone_number: s.phone_number || ""
        }));
        
        setStudent(formattedData);
        setFilteredStudent(formattedData);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Search and filter students
  useEffect(() => {
    let filtered = [...student];

    if (searchKeyword) {
      filtered = filtered.filter(
        (s) =>
          (s.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
           s.first_name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
           s.last_name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
           s.id?.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }

    if (selectedLevel) {
      filtered = filtered.filter((s) => s.level === selectedLevel);
    }

    if (selectedStatus) {
      filtered = filtered.filter((s) => s.status === selectedStatus);
    }

    setFilteredStudent(filtered);
    setCurrentPage(1);
  }, [searchKeyword, selectedLevel, selectedStatus, student]);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const response = await fetch(`/api/student/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setStudent(prev => prev.filter(s => s._id !== deleteId));
        
        const modal = document.getElementById('deleteModal');
        if (modal) {
          const bsModal = (window as any).bootstrap?.Modal.getInstance(modal);
          if (bsModal) {
            bsModal.hide();
          }
        }
        setDeleteId(null);
      } else {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  // Pagination
  const totalRecords = filteredStudent.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudent.slice(startIndex, endIndex);

  const getStatusBadgeClass = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'ปกติ': return 'bg-success';
      case 'เสี่ยง': return 'bg-warning text-dark';
      case 'มีปัญหา': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-2 border-warning">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-uppercase" href="/student">
            <i className="bi bi-mortarboard-fill me-2 text-warning"></i>
            <span className="text-warning">ระบบดูแลผู้เรียนรายบุคคล</span>
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3 active" href="/student">รายชื่อผู้เรียน</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/committees">คณะกรรมการ</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/isp">ISP</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/referrals">ส่งต่อ</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-people-fill me-2 text-warning"></i>
                รายชื่อผู้เรียน
              </h2>
              <div>
                <span className="text-muted me-3">ครูที่ปรึกษา: {teacher_name}</span>
                <span className="badge bg-dark text-white rounded-0">ปีการศึกษา {academic_year}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="row g-3 mb-4">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white border rounded-0">
                <i className="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                className="form-control rounded-0" 
                placeholder="ค้นหาด้วยชื่อ, รหัสนักศึกษา..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-2">
            <select 
              className="form-select rounded-0"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="">ระดับชั้นทั้งหมด</option>
              <option value="ปวช.1">ปวช.1</option>
              <option value="ปวช.2">ปวช.2</option>
              <option value="ปวช.3">ปวช.3</option>
              <option value="ปวส.1">ปวส.1</option>
              <option value="ปวส.2">ปวส.2</option>
            </select>
          </div>
          <div className="col-md-2">
            <select 
              className="form-select rounded-0"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">สถานะทั้งหมด</option>
              <option value="ปกติ">ปกติ</option>
              <option value="เสี่ยง">เสี่ยง</option>
              <option value="มีปัญหา">มีปัญหา</option>
            </select>
          </div>
          <div className="col-md-2">
            <select 
              className="form-select rounded-0"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2568">ปี 2568</option>
              <option value="2567">ปี 2567</option>
              <option value="2566">ปี 2566</option>
            </select>
          </div>
          <div className="col-md-1">
            <button className="btn btn-warning rounded-0 w-100 text-uppercase fw-semibold">
              <i className="bi bi-funnel me-2"></i>ค้นหา
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="row mb-3">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div>
              <span className="text-muted">
                แสดง {filteredStudent.length} รายการ 
                {filteredStudent.length > 0 && ` (หน้า ${currentPage} จาก ${totalPages || 1})`}
              </span>
            </div>
            <div>
              <button className="btn btn-outline-dark rounded-0 text-uppercase fw-semibold me-2" data-bs-toggle="modal" data-bs-target="#importModal">
                <i className="bi bi-upload me-2"></i>นำเข้าข้อมูล
              </button>
              <Link
                href="/student_add"
                className="btn btn-primary rounded-0 text-uppercase fw-semibold"
              >
                <i className="bi bi-plus-circle me-2"></i>เพิ่มผู้เรียน
              </Link>
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="row">
          <div className="col-12">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">กำลังโหลด...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover bg-white">
                  <thead className="bg-dark text-white">
                    <tr>
                      <th className="text-center" width="50">ลำดับ</th>
                      <th className="text-uppercase fw-semibold">รหัสนักศึกษา</th>
                      <th className="text-uppercase fw-semibold">ชื่อ-นามสกุล</th>
                      <th className="text-uppercase fw-semibold">ระดับชั้น</th>
                      <th className="text-uppercase fw-semibold">กลุ่ม</th>
                      <th className="text-uppercase fw-semibold">สถานะ</th>
                      <th className="text-uppercase fw-semibold">ครูที่ปรึกษา</th>
                      <th className="text-uppercase fw-semibold text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.length > 0 ? (
                      currentStudents.map((student, index) => (
                        <tr key={student._id}>
                          <td className="text-center">{startIndex + index + 1}</td>
                          <td className="fw-semibold">{student.id}</td>
                          <td>
                            {student._id ? (
                              <Link 
                                href={`/student_detail/${student._id}`}
                                className="text-decoration-none text-primary"
                              >
                                {student.name || `${student.prefix || ''}${student.first_name} ${student.last_name}`}
                              </Link>
                            ) : (
                              <span>{student.name || `${student.prefix || ''}${student.first_name} ${student.last_name}`}</span>
                            )}
                          </td>
                          <td>{student.level}</td>
                          <td>{student.class_group || '-'}</td>
                          <td>
                            <span 
                              className={`badge rounded-0 text-uppercase fw-semibold ${getStatusBadgeClass(student.status)}`}
                            >
                              {student.status || 'ปกติ'}
                            </span>
                          </td>
                          <td>{student.advisor_name || '-'}</td>
                          <td className="text-center">
                            <div className="btn-group" role="group">
                              <button 
                                className="btn btn-sm btn-outline-primary rounded-0"
                                onClick={() => student._id && router.push(`/student_detail/${student._id}`)}
                                title="ดูรายละเอียด"
                                disabled={!student._id}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-warning rounded-0"
                                onClick={() => student._id && router.push(`/student_detail/${student._id}/edit`)}
                                title="แก้ไข"
                                disabled={!student._id}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger rounded-0"
                                title="ลบ"
                                data-bs-toggle="modal"
                                data-bs-target="#deleteModal"
                                onClick={() => student._id && setDeleteId(student._id)}
                                disabled={!student._id}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center text-muted py-4">
                          {searchKeyword || selectedLevel || selectedStatus 
                            ? "ไม่พบข้อมูลที่ค้นหา" 
                            : "ไม่มีข้อมูลนักเรียน"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="row mt-3">
            <div className="col-12 d-flex justify-content-center">
              <nav aria-label="Page navigation">
                <ul className="pagination rounded-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link rounded-0" 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      <span aria-hidden="true">&laquo;</span>
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
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
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      <span aria-hidden="true">&raquo;</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <div className="modal fade" id="deleteModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content rounded-0">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title text-uppercase fw-semibold">
                <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>ยืนยันการลบข้อมูล
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p>คุณต้องการลบข้อมูลผู้เรียนนี้ใช่หรือไม่?</p>
              <p className="text-danger small">การลบข้อมูลนี้จะไม่สามารถกู้คืนได้</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary rounded-0 text-uppercase fw-semibold" data-bs-dismiss="modal">ยกเลิก</button>
              <button type="button" className="btn btn-danger rounded-0 text-uppercase fw-semibold" onClick={handleDelete}>ยืนยันการลบ</button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <div className="modal fade" id="importModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content rounded-0">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title text-uppercase fw-semibold">
                <i className="bi bi-upload text-warning me-2"></i>นำเข้าข้อมูล Excel
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label text-uppercase fw-semibold small">เลือกไฟล์ Excel</label>
                <input type="file" className="form-control rounded-0" accept=".xlsx,.xls" />
              </div>
              <p className="text-muted small">ไฟล์ต้องมีนามสกุล .xlsx หรือ .xls และมีข้อมูลตามรูปแบบที่กำหนด</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary rounded-0 text-uppercase fw-semibold" data-bs-dismiss="modal">ยกเลิก</button>
              <button type="button" className="btn btn-warning rounded-0 text-uppercase fw-semibold">อัปโหลด</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}