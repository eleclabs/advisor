"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  level: string;
  status: string;
  advisorName: string;
}

export default function StudentListPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [search_keyword, setSearchKeyword] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedYear, setSelectedYear] = useState("2568");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const teacher_name = "อาจารย์วิมลรัตน์";
  const academic_year = "2568";

  // Load students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students");
        const result = await response.json();
        setStudents(result.data);
        setFilteredStudents(result.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Search and filter students
  useEffect(() => {
    let filtered = students;

    if (search_keyword) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(search_keyword.toLowerCase()) ||
          student.id.includes(search_keyword)
      );
    }

    if (selectedLevel) {
      filtered = filtered.filter((student) => student.level === selectedLevel);
    }

    if (selectedStatus) {
      filtered = filtered.filter((student) => student.status === selectedStatus);
    }

    setFilteredStudents(filtered);
  }, [search_keyword, selectedLevel, selectedStatus, students]);

  useEffect(() => {
    // Load Bootstrap CSS
    const bootstrapLink = document.createElement("link");
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    bootstrapLink.rel = "stylesheet";
    document.head.appendChild(bootstrapLink);

    // Load Bootstrap Icons
    const iconLink = document.createElement("link");
    iconLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      // Soft Delete API call
      const response = await fetch(`/api/students/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ softDelete: true })
      });

      if (response.ok) {
        // Remove from local state
        setStudents(students.filter(s => s.id !== deleteId));
        setFilteredStudents(filteredStudents.filter(s => s.id !== deleteId));
        
        // Close modal
        const modal = document.getElementById('deleteModal');
        if (modal) {
          const bsModal = bootstrap.Modal.getInstance(modal);
          bsModal.hide();
        }
        setDeleteId(null);
      }
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const total_records = filteredStudents.length;
  const itemsPerPage = 10;
  const total_pages = Math.ceil(total_records / itemsPerPage);
  const current_page = 1;

  return (
    <div className="min-vh-100 bg-light">
      {/* START: Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-2 border-warning">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-uppercase" href="#">
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
      {/* END: Navigation Bar */}

      <div className="container-fluid py-4">
        {/* START: Page Header */}
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
        {/* END: Page Header */}

        {/* START: Search and Filter Section */}
        <div className="row g-3 mb-4">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white border rounded-0">
                <i className="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                className="form-control rounded-0" 
                placeholder="ค้นหาด้วยชื่อ, รหัสนักศึกษา, ชั้น..."
                value={search_keyword}
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
              <option value="">ระดับชั้น</option>
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
              <option value="">สถานะ</option>
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
        {/* END: Search and Filter Section */}

      {/* START: Action Bar */}
<div className="row mb-3">
  <div className="col-12 d-flex justify-content-between align-items-center">
    <div>
      <span className="text-muted">แสดง {total_records} รายการ (หน้า {current_page} จาก {total_pages})</span>
    </div>
    <div>
      <button className="btn btn-outline-dark rounded-0 text-uppercase fw-semibold me-2" data-bs-toggle="modal" data-bs-target="#importModal">
        <i className="bi bi-upload me-2"></i>นำเข้าข้อมูล (Excel)
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
{/* END: Action Bar */}

        {/* START: Student Table */}
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
                      <th className="text-uppercase fw-semibold">ลำดับ</th>
                      <th className="text-uppercase fw-semibold">รหัสนักศึกษา</th>
                      <th className="text-uppercase fw-semibold">ชื่อ-นามสกุล</th>
                      <th className="text-uppercase fw-semibold">ระดับชั้น</th>
                      <th className="text-uppercase fw-semibold">สถานะ</th>
                      <th className="text-uppercase fw-semibold">ครูที่ปรึกษา</th>
                      <th className="text-uppercase fw-semibold">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student, index) => (
                        <tr key={student.id}>
                          <td>{index + 1}</td>
                          <td className="fw-semibold">{student.id}</td>
                          <td>
                            <a 
                              href={`/student_detail/${student.id}`}
                              className="text-decoration-none"
                              onClick={(e) => {
                                e.preventDefault();
                                router.push(`/student_detail/${student.id}`);
                              }}
                            >
                              {student.name}
                            </a>
                          </td>
                          <td>{student.level}</td>
                          <td>
                            <span 
                              className={`badge rounded-0 text-uppercase fw-semibold ${
                                student.status === 'ปกติ' ? 'bg-success' :
                                student.status === 'เสี่ยง' ? 'bg-warning text-dark' :
                                'bg-danger'
                              }`}
                            >
                              {student.status}
                            </span>
                          </td>
                          <td>{student.advisorName}</td>
                          <td>
                            <div className="btn-group" role="group">
                              <button 
                                className="btn btn-sm btn-outline-primary rounded-0"
                                onClick={() => router.push(`/student_detail/${student.id}`)}
                                title="ดูรายละเอียด"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-warning rounded-0"
                                onClick={() => router.push(`/student_detail/${student.id}/edit`)}
                                title="แก้ไข"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger rounded-0"
                                title="ลบ"
                                data-bs-toggle="modal"
                                data-bs-target="#deleteModal"
                                onClick={() => setDeleteId(student.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-3">
                          ไม่พบข้อมูลนักเรียน
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        {/* END: Student Table */}

        {/* START: Pagination */}
        <div className="row mt-3">
          <div className="col-12 d-flex justify-content-center">
            <nav aria-label="Page navigation">
              <ul className="pagination rounded-0">
                <li className={`page-item ${current_page === 1 ? 'disabled' : ''}`}>
                  <a className="page-link rounded-0" href="#" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                  </a>
                </li>
                {Array.from({ length: total_pages }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${page === current_page ? 'active' : ''}`}>
                    <a className="page-link rounded-0" href="#">{page}</a>
                  </li>
                ))}
                <li className={`page-item ${current_page === total_pages ? 'disabled' : ''}`}>
                  <a className="page-link rounded-0" href="#" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        {/* END: Pagination */}
      </div>

      {/* START: Delete Confirmation Modal */}
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
              <p className="text-danger small">การลบข้อมูลนี้จะส่งผลต่อประวัติการดูแลและข้อมูลที่เกี่ยวข้องทั้งหมด (Soft Delete)</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary rounded-0 text-uppercase fw-semibold" data-bs-dismiss="modal">ยกเลิก</button>
              <button type="button" className="btn btn-danger rounded-0 text-uppercase fw-semibold" onClick={handleDelete}>ยืนยันการลบ</button>
            </div>
          </div>
        </div>
      </div>
      {/* END: Delete Confirmation Modal */}

      {/* START: Import Modal */}
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
      {/* END: Import Modal */}

      {/* START: Add Student Modal */}
      <div className="modal fade" id="addStudentModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content rounded-0">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title text-uppercase fw-semibold">
                <i className="bi bi-plus-circle-fill text-warning me-2"></i>เพิ่มผู้เรียนใหม่
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-uppercase fw-semibold small">รหัสนักศึกษา</label>
                    <input type="text" className="form-control rounded-0" placeholder="เช่น 66001" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-uppercase fw-semibold small">คำนำหน้า</label>
                    <select className="form-select rounded-0">
                      <option>นาย</option>
                      <option>นางสาว</option>
                      <option>นาง</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-uppercase fw-semibold small">ชื่อ</label>
                    <input type="text" className="form-control rounded-0" placeholder="ชื่อ" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-uppercase fw-semibold small">นามสกุล</label>
                    <input type="text" className="form-control rounded-0" placeholder="นามสกุล" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-uppercase fw-semibold small">ระดับชั้น</label>
                    <select className="form-select rounded-0">
                      <option>ปวช.1</option>
                      <option>ปวช.2</option>
                      <option>ปวช.3</option>
                      <option>ปวส.1</option>
                      <option>ปวส.2</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-uppercase fw-semibold small">กลุ่มเรียน</label>
                    <input type="text" className="form-control rounded-0" placeholder="เช่น 1" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-uppercase fw-semibold small">ครูที่ปรึกษา</label>
                    <select className="form-select rounded-0">
                      <option value="1">อาจารย์วิมลรัตน์ ใจดี</option>
                      <option value="2">อาจารย์สมศักดิ์ รู้แจ้ง</option>
                      <option value="3">อาจารย์วิชัย นักพัฒนา</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary rounded-0 text-uppercase fw-semibold" data-bs-dismiss="modal">ยกเลิก</button>
              <button type="button" className="btn btn-primary rounded-0 text-uppercase fw-semibold">บันทึกข้อมูล</button>
            </div>
          </div>
        </div>
      </div>
      {/* END: Add Student Modal */}

      {/* START: Footer */}
      <footer className="bg-dark text-white mt-5 py-3 border-top border-warning">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 text-uppercase small">
              <i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล
            </div>
            <div className="col-md-6 text-end text-uppercase small">
              <span className="me-3">เวอร์ชัน 2.0.0</span>
              <span>เข้าสู่ระบบ: {teacher_name}</span>
            </div>
          </div>
        </div>
      </footer>
      {/* END: Footer */}

      {/* Bootstrap JS Bundle */}
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    </div>
  );
}