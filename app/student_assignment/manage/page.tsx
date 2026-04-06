"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface User {
  _id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department?: string;
  assigned_students?: any[];
}

interface Student {
  _id: string;
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  level: string;
  class_group: string;
  class_number: string;
  advisor_name?: string;
}

export default function ManageAssignmentPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [teachers, setTeachers] = useState<User[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<User[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchTeachers();
    } else if (session?.user?.id) {
      setSelectedTeacher(session.user.id);
      fetchAssignedStudents(session.user.id);
    }
  }, [session]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/user?role=TEACHER");
      const data = await response.json();
      if (data.success) {
        setTeachers(data.data);
        setFilteredTeachers(data.data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  useEffect(() => {
    const filtered = teachers.filter(teacher => {
      const searchTerm = teacherSearchTerm.toLowerCase().trim();
      if (!searchTerm) return true;
      
      return (
        teacher.first_name.toLowerCase().includes(searchTerm) ||
        teacher.last_name.toLowerCase().includes(searchTerm) ||
        `${teacher.first_name} ${teacher.last_name}`.toLowerCase().includes(searchTerm) ||
        teacher.email.toLowerCase().includes(searchTerm) ||
        (teacher.department && teacher.department.toLowerCase().includes(searchTerm))
      );
    });
    setFilteredTeachers(filtered);
  }, [teacherSearchTerm, teachers]);

  const fetchAssignedStudents = async (teacherId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/${teacherId}/assign-students`);
      const data = await response.json();
      if (data.success) {
        setAssignedStudents(data.data);
      }
    } catch (error) {
      console.error("Error fetching assigned students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSelect = (teacherId: string) => {
    setSelectedTeacher(teacherId);
    setSelectedStudents(new Set());
    if (teacherId) {
      fetchAssignedStudents(teacherId);
    } else {
      setAssignedStudents([]);
    }
  };

  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacher(teacherId);
    setSelectedStudents(new Set());
    if (teacherId) {
      fetchAssignedStudents(teacherId);
    } else {
      setAssignedStudents([]);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.student_id?._id || s.student_id)));
    }
  };

  const handleRemoveStudents = async () => {
    if (selectedStudents.size === 0) {
      alert("กรุณาเลือกนักเรียนที่ต้องการลบ");
      return;
    }

    if (!confirm(`คุณต้องการลบนักเรียน ${selectedStudents.size} คน จากรายการรับผิดชอบหรือไม่?`)) {
      return;
    }

    try {
      setRemoving(true);
      
      const response = await fetch(`/api/user/${selectedTeacher}/assign-students`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentIds: Array.from(selectedStudents)
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`ลบนักเรียน ${selectedStudents.size} คน สำเร็จ`);
        setSelectedStudents(new Set());
        fetchAssignedStudents(selectedTeacher);
      } else {
        alert(data.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error removing students:", error);
      alert("เกิดข้อผิดพลาดในการลบนักเรียน");
    } finally {
      setRemoving(false);
    }
  };

  const filteredStudents = assignedStudents.filter(assignment => {
    const student = assignment.student_id;
    if (!student) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      student.first_name?.toLowerCase().includes(searchLower) ||
      student.last_name?.toLowerCase().includes(searchLower) ||
      student.id?.toLowerCase().includes(searchLower) ||
      `${student.prefix} ${student.first_name} ${student.last_name}`.toLowerCase().includes(searchLower)
    );
  });

  if (!session) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="alert alert-danger">
          กรุณาเข้าสู่ระบบก่อน
        </div>
      </div>
    );
  }

  if (session.user?.role !== "ADMIN" && session.user?.role !== "TEACHER") {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="alert alert-danger">
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-dark text-white py-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="h3 mb-0">จัดการการมอบหมายนักเรียน</h1>
              <p className="mb-0 text-white-50">ลบนักเรียนออกจากรายการรับผิดชอบ</p>
            </div>
            <div className="col-auto">
              <Link
                href="/student_assignment"
                className="btn btn-outline-light rounded-0 me-2"
              >
                <i className="bi bi-arrow-left me-2"></i>กลับหน้ามอบหมาย
              </Link>
              <Link
                href="/dashboard"
                className="btn btn-outline-light rounded-0"
              >
                <i className="bi bi-house me-2"></i>หน้า Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-0">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-person-check me-2"></i>
                  เลือกครูที่ต้องการจัดการ
                </h5>
              </div>
              <div className="card-body">
                {session.user?.role === "ADMIN" ? (
                  <div>
                    <div className="row mb-3">
                      <div className="col-md-8">
                        <label className="form-label">ค้นหาครู</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0">
                            <i className="bi bi-search"></i>
                          </span>
                          <input
                            type="text"
                            placeholder="พิมพ์ชื่อครู, อีเมล หรือแผนก..."
                            value={teacherSearchTerm}
                            onChange={(e) => setTeacherSearchTerm(e.target.value)}
                            className="form-control border-0 bg-light"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">ครูที่เลือก</label>
                        <div className="form-control bg-light">
                          {selectedTeacher ? (
                            (() => {
                              const teacher = teachers.find(t => t._id === selectedTeacher);
                              return teacher ? `${teacher.prefix} ${teacher.first_name} ${teacher.last_name}` : 'ไม่พบข้อมูล';
                            })()
                          ) : (
                            'ยังไม่ได้เลือก'
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-bordered table-hover">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '60px' }}>เลือก</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>อีเมล</th>
                            <th>แผนก</th>
                            <th style={{ width: '120px' }}>รับผิดชอบ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTeachers.map((teacher) => (
                            <tr key={teacher._id} className={selectedTeacher === teacher._id ? 'table-primary' : ''}>
                              <td className="text-center">
                                <input
                                  type="radio"
                                  name="teacherSelection"
                                  checked={selectedTeacher === teacher._id}
                                  onChange={() => handleTeacherSelect(teacher._id)}
                                  className="form-check-input"
                                />
                              </td>
                              <td className="fw-medium">
                                {teacher.prefix} {teacher.first_name} {teacher.last_name}
                              </td>
                              <td>{teacher.email}</td>
                              <td>{teacher.department || '-'}</td>
                              <td className="text-center">
                                {teacher.assigned_students && teacher.assigned_students.length > 0 ? (
                                  <span className="badge bg-success">
                                    {teacher.assigned_students.length} คน
                                  </span>
                                ) : (
                                  <span className="text-muted">0 คน</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredTeachers.length === 0 && (
                        <div className="text-center py-4 text-muted">
                          ไม่พบครูที่ค้นหา
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="mb-0">
                      ครู: <strong>
                        {session.user?.name || 'ไม่ระบุชื่อ'}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {selectedTeacher && (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-0">
                <div className="card-header bg-success text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <i className="bi bi-people me-2"></i>
                      นักเรียนที่รับผิดชอบ ({assignedStudents.length} คน)
                    </h5>
                    <div className="d-flex gap-2 align-items-center">
                      <span className="badge bg-light text-dark">
                        เลือกแล้ว {selectedStudents.size}/{filteredStudents.length} คน
                      </span>
                      {selectedStudents.size > 0 && (
                        <button
                          onClick={handleRemoveStudents}
                          disabled={removing}
                          className="btn btn-danger btn-sm rounded-0"
                        >
                          {removing ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              กำลังลบ...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-trash me-2"></i>
                              ลบ {selectedStudents.size} คน
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body p-0">
                  {/* Search */}
                  <div className="p-3 border-bottom">
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        placeholder="ค้นหานักเรียน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control border-0 bg-light"
                      />
                    </div>
                  </div>

                  {/* Select All */}
                  <div className="p-3 border-bottom bg-light">
                    <label className="form-check">
                      <input
                        type="checkbox"
                        checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                        onChange={handleSelectAll}
                        className="form-check-input"
                      />
                      <span className="form-check-label ms-2">เลือกทั้งหมด</span>
                    </label>
                  </div>

                  {/* Students List */}
                  <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                    {loading ? (
                      <div className="text-center p-4">
                        <div className="spinner-border text-success" role="status">
                          <span className="visually-hidden">กำลังโหลด...</span>
                        </div>
                      </div>
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map((assignment) => {
                        const student = assignment.student_id;
                        if (!student) return null;
                        
                        return (
                          <div key={student._id} className="p-3 border-bottom hover-bg-light">
                            <label className="form-check mb-0 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedStudents.has(student._id)}
                                onChange={() => handleStudentSelect(student._id)}
                                className="form-check-input"
                              />
                              <div className="form-check-label ms-2 w-100">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <div className="fw-medium">
                                      {student.prefix} {student.first_name} {student.last_name}
                                    </div>
                                    <div className="text-muted small">
                                      รหัส: {student.id} | {student.level} {student.class_group}
                                      {student.class_number && ` | ห้อง: ${student.class_number}`}
                                    </div>
                                  </div>
                                  <div>
                                    {student.advisor_name && (
                                      <span className="badge bg-warning text-dark small">
                                        ที่ปรึกษา: {student.advisor_name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </label>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center p-4 text-muted">
                        {searchTerm ? "ไม่พบนักเรียนที่ค้นหา" : "ไม่มีนักเรียนที่รับผิดชอบ"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
