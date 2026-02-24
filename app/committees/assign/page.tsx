"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Teacher {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  role?: string;
}

interface Committee {
  id: string;
  name: string;
  description: string;
  members: Teacher[];
}

export default function AssignCommitteePage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<Teacher[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [committees, setCommittees] = useState<Committee[]>([
    { id: "1", name: "คณะกรรมการบริหาร", description: "วางแผนและตัดสินใจ", members: [] },
    { id: "2", name: "คณะกรรมการดำเนินงาน", description: "ดำเนินกิจกรรม", members: [] },
    { id: "3", name: "คณะกรรมการติดตามและประเมินผล", description: "ติดตามและประเมินผล", members: [] },
    { id: "4", name: "คณะกรรมการส่งเสริมและพัฒนา", description: "ส่งเสริมพัฒนาผู้เรียน", members: [] }
  ]);
  const [selectedCommittee, setSelectedCommittee] = useState<string>("1");
  const [saving, setSaving] = useState(false);

  const teacher_name = "อาจารย์วิมลรัตน์";

  useEffect(() => {
    const bootstrapLink = document.createElement("link");
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    bootstrapLink.rel = "stylesheet";
    document.head.appendChild(bootstrapLink);

    const iconLink = document.createElement("link");
    iconLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);
  }, []);

  useEffect(() => {
    // Mock data - รายชื่อครูทั้งหมดในระบบ
    const mockTeachers: Teacher[] = [
      { id: "T001", title: "นาย", firstName: "สมชาย", lastName: "ใจดี", position: "ครูชำนาญการ", department: "สามัญ" },
      { id: "T002", title: "นางสาว", firstName: "วิมลรัตน์", lastName: "พัฒนากุล", position: "ครูชำนาญการพิเศษ", department: "สามัญ" },
      { id: "T003", title: "นาง", firstName: "ประภาพร", lastName: "รักษ์ไทย", position: "ครู", department: "สามัญ" },
      { id: "T004", title: "นาย", firstName: "วิชัย", lastName: "นักพัฒนา", position: "ครูชำนาญการ", department: "คอมพิวเตอร์" },
      { id: "T005", title: "นางสาว", firstName: "กัลยา", lastName: "เรียนดี", position: "ครู", department: "คอมพิวเตอร์" },
      { id: "T006", title: "นาย", firstName: "สมศักดิ์", lastName: "รู้แจ้ง", position: "ครูชำนาญการ", department: "สามัญ" },
      { id: "T007", title: "นาง", firstName: "เพ็ญศรี", lastName: "จันทร์เพ็ญ", position: "ครูชำนาญการพิเศษ", department: "สามัญ" },
      { id: "T008", title: "นาย", firstName: "ธนพล", lastName: "มั่งมี", position: "ครู", department: "บริหารธุรกิจ" },
      { id: "T009", title: "นางสาว", firstName: "นันทนา", lastName: "มีสุข", position: "ครู", department: "บริหารธุรกิจ" },
      { id: "T010", title: "นาย", firstName: "ประเสริฐ", lastName: "ศิลป์", position: "ครูชำนาญการ", department: "ศิลปกรรม" },
    ];
    
    setTeachers(mockTeachers);
    setFilteredTeachers(mockTeachers);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = teachers;
    if (searchKeyword) {
      filtered = filtered.filter(t => 
        `${t.title}${t.firstName}${t.lastName}`.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        t.department.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }
    if (selectedDepartment) {
      filtered = filtered.filter(t => t.department === selectedDepartment);
    }
    setFilteredTeachers(filtered);
  }, [searchKeyword, selectedDepartment, teachers]);

  const addToCommittee = (teacher: Teacher) => {
    if (!selectedTeachers.find(t => t.id === teacher.id)) {
      setSelectedTeachers([...selectedTeachers, teacher]);
    }
  };

  const removeFromCommittee = (teacherId: string) => {
    setSelectedTeachers(selectedTeachers.filter(t => t.id !== teacherId));
  };

  const saveCommittee = () => {
    setSaving(true);
    // Update committee members
    const updatedCommittees = committees.map(c => 
      c.id === selectedCommittee ? { ...c, members: selectedTeachers } : c
    );
    setCommittees(updatedCommittees);
    
    // Clear selection and show success
    setTimeout(() => {
      setSaving(false);
      alert("บันทึกการแต่งตั้งคณะกรรมการเรียบร้อย");
    }, 1000);
  };

  const getDepartmentColor = (dept: string) => {
    const colors: {[key: string]: string} = {
      "สามัญ": "primary",
      "คอมพิวเตอร์": "success",
      "บริหารธุรกิจ": "warning",
      "ศิลปกรรม": "info"
    };
    return colors[dept] || "secondary";
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

  return (
    <div className="min-vh-100 bg-light">
      {/* Navbar */}
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
              <li className="nav-item"><a className="nav-link text-white px-3" href="/student">รายชื่อผู้เรียน</a></li>
              <li className="nav-item"><a className="nav-link text-white px-3 active" href="/committees">คณะกรรมการ</a></li>
              <li className="nav-item"><a className="nav-link text-white px-3" href="/student_learn">โฮมรูม</a></li>
              <li className="nav-item"><a className="nav-link text-white px-3" href="/referrals">ส่งต่อ</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-people-fill me-2 text-warning"></i>
                แต่งตั้งคณะกรรมการ
              </h2>
              <div>
                <span className="text-muted me-3">ผู้ดูแลระบบ: {teacher_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Committee Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-tabs border-bottom-0">
              {committees.map(c => (
                <li className="nav-item" key={c.id}>
                  <button 
                    className={`nav-link rounded-0 ${selectedCommittee === c.id ? 'active bg-dark text-white' : 'bg-light'}`}
                    onClick={() => {
                      setSelectedCommittee(c.id);
                      setSelectedTeachers(c.members);
                    }}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="row">
          {/* Left: Teacher List */}
          <div className="col-md-7">
            <div className="card rounded-0 border-0 shadow-sm">
              <div className="card-header bg-dark text-white">
                <h5 className="m-0"><i className="bi bi-person-lines-fill me-2 text-warning"></i>รายชื่อบุคลากรในระบบ</h5>
              </div>
              <div className="card-body">
                {/* Search */}
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text bg-white border rounded-0"><i className="bi bi-search"></i></span>
                      <input type="text" className="form-control rounded-0" placeholder="ค้นหาชื่อ, แผนก..." 
                        value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select className="form-select rounded-0" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                      <option value="">ทุกแผนก</option>
                      <option value="สามัญ">สามัญ</option>
                      <option value="คอมพิวเตอร์">คอมพิวเตอร์</option>
                      <option value="บริหารธุรกิจ">บริหารธุรกิจ</option>
                      <option value="ศิลปกรรม">ศิลปกรรม</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <span className="badge bg-dark rounded-0 p-2 w-100">พบ {filteredTeachers.length} คน</span>
                  </div>
                </div>

                {/* Teacher Table */}
                <div className="table-responsive" style={{ maxHeight: "400px" }}>
                  <table className="table table-bordered table-hover">
                    <thead className="bg-light sticky-top">
                      <tr>
                        <th>ชื่อ-นามสกุล</th>
                        <th>ตำแหน่ง</th>
                        <th>แผนก</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeachers.map(t => (
                        <tr key={t.id}>
                          <td>{t.title}{t.firstName} {t.lastName}</td>
                          <td>{t.position}</td>
                          <td>
                            <span className={`badge bg-${getDepartmentColor(t.department)} rounded-0`}>
                              {t.department}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-success rounded-0"
                              onClick={() => addToCommittee(t)}
                              disabled={selectedTeachers.some(st => st.id === t.id)}
                            >
                              <i className="bi bi-plus-circle"></i> เลือก
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Selected Committee Members */}
          <div className="col-md-5">
            <div className="card rounded-0 border-0 shadow-sm">
              <div className="card-header bg-dark text-white">
                <h5 className="m-0">
                  <i className="bi bi-people me-2 text-warning"></i>
                  {committees.find(c => c.id === selectedCommittee)?.name}
                  <span className="badge bg-warning text-dark ms-2 rounded-0">{selectedTeachers.length} คน</span>
                </h5>
              </div>
              <div className="card-body">
                <p className="text-muted small mb-3">
                  {committees.find(c => c.id === selectedCommittee)?.description}
                </p>

                {selectedTeachers.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-person-plus fs-1"></i>
                    <p className="mt-2">ยังไม่มีกรรมการในคณะนี้<br />เลือกจากรายชื่อด้านซ้าย</p>
                  </div>
                ) : (
                  <div className="list-group">
                    {selectedTeachers.map(t => (
                      <div key={t.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{t.title}{t.firstName} {t.lastName}</h6>
                          <small className="text-muted">{t.position} | {t.department}</small>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-danger rounded-0"
                          onClick={() => removeFromCommittee(t.id)}
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3">
                  <label className="form-label fw-semibold">บทบาท/หน้าที่ในคณะกรรมการ</label>
                  <textarea 
                    className="form-control rounded-0" 
                    rows={2}
                    placeholder="ระบุบทบาทหน้าที่ของคณะกรรมการชุดนี้..."
                  ></textarea>
                </div>

                <button 
                  className="btn btn-warning rounded-0 w-100 mt-3"
                  onClick={saveCommittee}
                  disabled={saving}
                >
                  {saving ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>กำลังบันทึก...</>
                  ) : (
                    <><i className="bi bi-save me-2"></i>บันทึกการแต่งตั้ง</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white mt-5 py-3 border-top border-warning">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 small"><i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล</div>
            <div className="col-md-6 text-end small"><span className="me-3">เวอร์ชัน 2.0.0</span><span>เข้าสู่ระบบ: {teacher_name}</span></div>
          </div>
        </div>
      </footer>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    </div>
  );
}