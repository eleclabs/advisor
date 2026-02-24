"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Role {
  id: string;
  name: string;
  committee: string;
  responsibilities: string[];
  qualifications: string;
  reportsTo: string;
}

interface Teacher {
  id: string;
  name: string;
  position: string;
  department: string;
  currentRoles: string[];
}

interface Assignment {
  teacherId: string;
  roleId: string;
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
}

export default function RoleMappingPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState<"matrix" | "chart">("matrix");
  
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

    // Mock data
    const mockRoles: Role[] = [
      { 
        id: "R1", 
        name: "ประธานคณะกรรมการ", 
        committee: "คณะกรรมการบริหาร",
        responsibilities: ["วางแผนยุทธศาสตร์", "กำกับดูแลภาพรวม", "เป็นประธานการประชุม"],
        qualifications: "ผู้บริหารระดับสูง",
        reportsTo: "ผู้อำนวยการ"
      },
      { 
        id: "R2", 
        name: "รองประธาน", 
        committee: "คณะกรรมการบริหาร",
        responsibilities: ["ช่วยเหลืองานประธาน", "ประสานงานระหว่างคณะ", "ดูแลการดำเนินงาน"],
        qualifications: "ครูชำนาญการพิเศษขึ้นไป",
        reportsTo: "ประธานคณะกรรมการ"
      },
      { 
        id: "R3", 
        name: "เลขานุการ", 
        committee: "คณะกรรมการบริหาร",
        responsibilities: ["จัดทำวาระการประชุม", "บันทึกการประชุม", "จัดการเอกสาร"],
        qualifications: "มีความสามารถด้านเอกสาร",
        reportsTo: "ประธานและรองประธาน"
      },
      { 
        id: "R4", 
        name: "หัวหน้าฝ่ายกิจกรรม", 
        committee: "คณะกรรมการดำเนินงาน",
        responsibilities: ["ออกแบบกิจกรรม", "วางแผนกิจกรรมรายสัปดาห์", "ประสานวิทยากร"],
        qualifications: "มีประสบการณ์จัดกิจกรรม",
        reportsTo: "คณะกรรมการบริหาร"
      },
      { 
        id: "R5", 
        name: "ฝ่ายสื่อและเอกสาร", 
        committee: "คณะกรรมการดำเนินงาน",
        responsibilities: ["จัดทำสื่อการสอน", "รวบรวมเอกสาร", "จัดทำใบงาน"],
        qualifications: "มีความสามารถด้านสื่อ",
        reportsTo: "หัวหน้าฝ่ายกิจกรรม"
      },
      { 
        id: "R6", 
        name: "ฝ่ายติดตามและประเมิน", 
        committee: "คณะกรรมการติดตาม",
        responsibilities: ["ติดตามการดำเนินงาน", "เก็บรวบรวมข้อมูล", "ประเมินผลกิจกรรม"],
        qualifications: "มีความรู้ด้านการประเมิน",
        reportsTo: "คณะกรรมการบริหาร"
      },
    ];

    const mockTeachers: Teacher[] = [
      { id: "T1", name: "นายสมชาย ใจดี", position: "ครูชำนาญการ", department: "สามัญ", currentRoles: ["R1"] },
      { id: "T2", name: "นางสาววิมลรัตน์ พัฒนากุล", position: "ครูชำนาญการพิเศษ", department: "สามัญ", currentRoles: ["R2"] },
      { id: "T3", name: "นางประภาพร รักษ์ไทย", position: "ครู", department: "สามัญ", currentRoles: ["R3"] },
      { id: "T4", name: "นายวิชัย นักพัฒนา", position: "ครูชำนาญการ", department: "คอมพิวเตอร์", currentRoles: ["R4"] },
      { id: "T5", name: "นางสาวกัลยา เรียนดี", position: "ครู", department: "คอมพิวเตอร์", currentRoles: ["R5"] },
      { id: "T6", name: "นายสมศักดิ์ รู้แจ้ง", position: "ครูชำนาญการ", department: "สามัญ", currentRoles: ["R6"] },
    ];

    const mockAssignments: Assignment[] = [
      { teacherId: "T1", roleId: "R1", startDate: "2024-05-01", endDate: "2025-04-30", status: "active" },
      { teacherId: "T2", roleId: "R2", startDate: "2024-05-01", endDate: "2025-04-30", status: "active" },
      { teacherId: "T3", roleId: "R3", startDate: "2024-05-01", endDate: "2025-04-30", status: "active" },
      { teacherId: "T4", roleId: "R4", startDate: "2024-05-01", endDate: "2025-04-30", status: "active" },
      { teacherId: "T5", roleId: "R5", startDate: "2024-05-01", endDate: "2025-04-30", status: "active" },
      { teacherId: "T6", roleId: "R6", startDate: "2024-05-01", endDate: "2025-04-30", status: "active" },
    ];

    setRoles(mockRoles);
    setTeachers(mockTeachers);
    setAssignments(mockAssignments);
  }, []);

  const assignRole = () => {
    if (!selectedRole || !selectedTeacher || !startDate) {
      alert("กรุณาเลือกบทบาท, ผู้รับผิดชอบ และวันที่เริ่มต้น");
      return;
    }

    const newAssignment: Assignment = {
      teacherId: selectedTeacher,
      roleId: selectedRole,
      startDate,
      endDate: endDate || "",
      status: "active"
    };

    setAssignments([...assignments, newAssignment]);
    setSelectedRole("");
    setSelectedTeacher("");
    setStartDate("");
    setEndDate("");
  };

  const removeAssignment = (teacherId: string, roleId: string) => {
    if (confirm("ต้องการนำผู้รับผิดชอบออกจากบทบาทนี้?")) {
      setAssignments(assignments.filter(a => !(a.teacherId === teacherId && a.roleId === roleId)));
    }
  };

  const getTeacherName = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId)?.name || "-";
  };

  const getRoleName = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.name || "-";
  };

  const getRoleCommittee = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.committee || "-";
  };

  const getTeachersByRole = (roleId: string) => {
    return assignments
      .filter(a => a.roleId === roleId && a.status === "active")
      .map(a => getTeacherName(a.teacherId));
  };

  return (
    <div className="min-vh-100 bg-light">
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
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-diagram-2 me-2 text-warning"></i>
                กำหนดบทบาทหน้าที่ (Role Mapping)
              </h2>
              <div>
                <span className="text-muted me-3">ผู้ดูแลระบบ: {teacher_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="btn-group">
              <button 
                className={`btn ${viewMode === 'matrix' ? 'btn-dark' : 'btn-outline-dark'} rounded-0`}
                onClick={() => setViewMode('matrix')}
              >
                <i className="bi bi-grid-3x3-gap-fill me-2"></i>Matrix View
              </button>
              <button 
                className={`btn ${viewMode === 'chart' ? 'btn-dark' : 'btn-outline-dark'} rounded-0`}
                onClick={() => setViewMode('chart')}
              >
                <i className="bi bi-diagram-3 me-2"></i>Organizational Chart
              </button>
            </div>
          </div>
        </div>

        {/* Assignment Form */}
        <div className="card rounded-0 border-0 shadow-sm mb-4">
          <div className="card-header bg-dark text-white">
            <h5 className="m-0"><i className="bi bi-person-plus me-2 text-warning"></i>เพิ่ม/แก้ไขการมอบหมายบทบาท</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">เลือกบทบาท</label>
                <select className="form-select rounded-0" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                  <option value="">เลือกบทบาท</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.committee})</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">เลือกผู้รับผิดชอบ</label>
                <select className="form-select rounded-0" value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)}>
                  <option value="">เลือกผู้รับผิดชอบ</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} - {t.department}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">วันที่เริ่ม</label>
                <input type="date" className="form-control rounded-0" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="col-md-2">
                <label className="form-label">วันที่สิ้นสุด</label>
                <input type="date" className="form-control rounded-0" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button className="btn btn-warning rounded-0 w-100" onClick={assignRole}>
                  <i className="bi bi-check-lg me-2"></i>มอบหมายบทบาท
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Matrix View */}
        {viewMode === 'matrix' && (
          <div className="card rounded-0 border-0 shadow-sm">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-grid-3x3-gap-fill me-2 text-warning"></i>Role Assignment Matrix</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-bordered mb-0">
                <thead className="bg-light">
                  <tr>
                    <th style={{minWidth: "200px"}}>บทบาท / คณะกรรมการ</th>
                    <th>รายละเอียดหน้าที่</th>
                    <th>คุณสมบัติ</th>
                    <th>รายงานต่อ</th>
                    <th>ผู้รับผิดชอบปัจจุบัน</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map(role => {
                    const currentTeachers = getTeachersByRole(role.id);
                    return (
                      <tr key={role.id}>
                        <td>
                          <strong>{role.name}</strong>
                          <br />
                          <small className="text-muted">{role.committee}</small>
                        </td>
                        <td>
                          <ul className="list-unstyled mb-0">
                            {role.responsibilities.map((r, i) => (
                              <li key={i}><i className="bi bi-dot me-1"></i>{r}</li>
                            ))}
                          </ul>
                        </td>
                        <td>{role.qualifications}</td>
                        <td>{role.reportsTo}</td>
                        <td>
                          {currentTeachers.length > 0 ? (
                            currentTeachers.map(name => (
                              <div key={name} className="mb-1">
                                <span className="badge bg-success rounded-0 p-2">{name}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-muted">ยังไม่มีผู้รับผิดชอบ</span>
                          )}
                        </td>
                        <td>
                          {currentTeachers.map(name => {
                            const teacher = teachers.find(t => t.name === name);
                            if (teacher) {
                              return (
                                <button 
                                  key={teacher.id}
                                  className="btn btn-sm btn-outline-danger rounded-0 mb-1"
                                  onClick={() => removeAssignment(teacher.id, role.id)}
                                >
                                  <i className="bi bi-person-x"></i> ถอดถอน
                                </button>
                              );
                            }
                            return null;
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Organizational Chart */}
        {viewMode === 'chart' && (
          <div className="row">
            <div className="col-12">
              <div className="card rounded-0 border-0 shadow-sm">
                <div className="card-header bg-dark text-white">
                  <h5 className="m-0"><i className="bi bi-diagram-3 me-2 text-warning"></i>โครงสร้างคณะกรรมการ</h5>
                </div>
                <div className="card-body text-center p-4">
                  {/* Executive Committee */}
                  <div className="mb-4">
                    <div className="bg-primary text-white p-3 d-inline-block rounded-0" style={{minWidth: "300px"}}>
                      <h5 className="mb-1">คณะกรรมการบริหาร</h5>
                      <small>ผู้บริหาร / วางแผนยุทธศาสตร์</small>
                    </div>
                    
                    <div className="d-flex justify-content-center gap-3 mt-3">
                      {roles.filter(r => r.committee === "คณะกรรมการบริหาร").map(role => {
                        const teachers = getTeachersByRole(role.id);
                        return (
                          <div key={role.id} className="bg-light p-3 border" style={{minWidth: "200px"}}>
                            <strong>{role.name}</strong>
                            <hr className="my-2" />
                            {teachers.length > 0 ? (
                              teachers.map(t => <div key={t} className="small">{t}</div>)
                            ) : (
                              <small className="text-muted">- ว่าง -</small>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="mb-4">
                    <i className="bi bi-arrow-down fs-3"></i>
                  </div>

                  {/* Operation Committee */}
                  <div className="mb-4">
                    <div className="bg-success text-white p-3 d-inline-block rounded-0" style={{minWidth: "300px"}}>
                      <h5 className="mb-1">คณะกรรมการดำเนินงาน</h5>
                      <small>ปฏิบัติงาน / จัดกิจกรรม</small>
                    </div>
                    
                    <div className="d-flex justify-content-center gap-3 mt-3">
                      {roles.filter(r => r.committee === "คณะกรรมการดำเนินงาน").map(role => {
                        const teachers = getTeachersByRole(role.id);
                        return (
                          <div key={role.id} className="bg-light p-3 border" style={{minWidth: "200px"}}>
                            <strong>{role.name}</strong>
                            <hr className="my-2" />
                            {teachers.length > 0 ? (
                              teachers.map(t => <div key={t} className="small">{t}</div>)
                            ) : (
                              <small className="text-muted">- ว่าง -</small>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="mb-4">
                    <i className="bi bi-arrow-down fs-3"></i>
                  </div>

                  {/* Monitoring Committee */}
                  <div>
                    <div className="bg-warning text-dark p-3 d-inline-block rounded-0" style={{minWidth: "300px"}}>
                      <h5 className="mb-1">คณะกรรมการติดตามและประเมินผล</h5>
                      <small>ติดตาม / วัดผล / ประเมิน</small>
                    </div>
                    
                    <div className="d-flex justify-content-center gap-3 mt-3">
                      {roles.filter(r => r.committee === "คณะกรรมการติดตาม").map(role => {
                        const teachers = getTeachersByRole(role.id);
                        return (
                          <div key={role.id} className="bg-light p-3 border" style={{minWidth: "200px"}}>
                            <strong>{role.name}</strong>
                            <hr className="my-2" />
                            {teachers.length > 0 ? (
                              teachers.map(t => <div key={t} className="small">{t}</div>)
                            ) : (
                              <small className="text-muted">- ว่าง -</small>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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