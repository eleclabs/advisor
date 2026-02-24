"use client";

import { useEffect } from "react";

export default function StudentListPage() {
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

  // สมมติค่าตัวแปร (คุณควรแทนที่ด้วย state หรือ props จริง)
  const teacher_name = "อาจารย์วิมลรัตน์";
  const academic_year = "2568";
  const search_keyword = "";
  const total_records = 0;
  const current_page = 1;
  const total_pages = 1;

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
                <a className="nav-link text-white text-uppercase fw-semibold px-3 active" href="/students">รายชื่อผู้เรียน</a>
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

        {/* START: Search and Filter Section */}
        <div className="row g-3 mb-4">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white border rounded-0">
                <i className="bi bi-search"></i>
              </span>
              <input type="text" className="form-control rounded-0" placeholder="ค้นหาด้วยชื่อ, รหัสนักศึกษา, ชั้น..." defaultValue={search_keyword} />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select rounded-0" defaultValue="">
              <option value="">ทั้งหมด: ระดับชั้น</option>
              <option value="ปวช.1">ปวช.1</option>
              <option value="ปวช.2">ปวช.2</option>
              <option value="ปวช.3">ปวช.3</option>
              <option value="ปวส.1">ปวส.1</option>
              <option value="ปวส.2">ปวส.2</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select rounded-0" defaultValue="">
              <option value="">ทั้งหมด: สถานะการคัดกรอง</option>
              <option value="ปกติ">ปกติ</option>
              <option value="เสี่ยง">เสี่ยง</option>
              <option value="มีปัญหา">มีปัญหา</option>
            </select>
          </div>
          <div className="col-md-1">
            <button className="btn btn-warning rounded-0 w-100 text-uppercase fw-semibold">
              <i className="bi bi-funnel me-2"></i>ค้นหา
            </button>
          </div>
        </div>

        {/* START: Action Bar */}
        <div className="row mb-3">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div>
              <span className="text-muted">แสดง {total_records} รายการ (หน้า {current_page} จาก {total_pages})</span>
            </div>
            <div>
              <button className="btn btn-dark rounded-0 text-uppercase fw-semibold me-2" data-bs-toggle="modal" data-bs-target="#importModal">
                <i className="bi bi-upload me-2"></i>นำเข้าข้อมูล
              </button>
              <button className="btn btn-warning rounded-0 text-uppercase fw-semibold" data-bs-toggle="modal" data-bs-target="#addStudentModal">
                <i className="bi bi-plus-circle me-2"></i>เพิ่มผู้เรียน
              </button>
            </div>
          </div>
        </div>

        {/* START: Student Table */}
        <div className="row">
          <div className="col-12">
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
                  {/* ตัวอย่างแถวข้อมูลที่แก้ไข class เป็น className และลบ syntax ผิดออก */}
                  <tr>
                    <td>1</td>
                    <td className="fw-semibold">66001</td>
                    <td><a href="/students/66001" className="text-decoration-none">นายสมชาย ใจดี</a></td>
                    <td>ปวช.3</td>
                    <td><span className="badge bg-success rounded-0 text-uppercase fw-semibold">ปกติ</span></td>
                    <td>อาจารย์วิมลรัตน์</td>
                    <td>
                      <div className="btn-group" role="group">
                        <a href="/students/66001" className="btn btn-sm btn-outline-primary rounded-0"><i className="bi bi-eye"></i></a>
                        <a href="/students/66001/edit" className="btn btn-sm btn-outline-warning rounded-0"><i className="bi bi-pencil"></i></a>
                        <button className="btn btn-sm btn-outline-danger rounded-0"><i className="bi bi-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

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
                <li className="page-item active"><a className="page-link rounded-0" href="#">1</a></li>
                <li className={`page-item ${current_page === total_pages ? 'disabled' : ''}`}>
                  <a className="page-link rounded-0" href="#" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* MODALS (ตัวอย่างการแก้เบื้องต้น) */}
      <div className="modal fade" id="deleteModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content rounded-0">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title text-uppercase fw-semibold">
                <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>ยืนยันการลบข้อมูล
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p>คุณต้องการลบข้อมูลใช่หรือไม่?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary rounded-0" data-bs-dismiss="modal">ยกเลิก</button>
              <button type="button" className="btn btn-danger rounded-0">ยืนยันการลบ</button>
            </div>
          </div>
        </div>
      </div>

      {/* START: Footer */}
      <footer className="bg-dark text-white mt-5 py-3 border-top border-warning">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 text-uppercase small">
              <i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล
            </div>
            <div className="col-md-6 text-end text-uppercase small">
              <span className="me-3">เวอร์ชัน 1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}