'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  _id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department?: string;
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
  status?: string;
}

interface AssignmentResult {
  teacherId: string;
  teacherName: string;
  assignedCount: number;
  students: string[];
}

export default function UserAssignStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [assignmentResults, setAssignmentResults] = useState<AssignmentResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get current user session
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      
      if (!sessionData?.user || sessionData.user.role !== "ADMIN") {
        router.push('/unauthorized');
        return;
      }

      // Fetch user data
      const userRes = await fetch(`/api/user/${params.id}`);
      const userData = await userRes.json();
      
      if (userData.success) {
        setUser(userData.data);
      }

      // Fetch all students
      const studentsRes = await fetch('/api/student');
      const studentsData = await studentsRes.json();
      
      if (studentsData.success) {
        setStudents(studentsData.data);
      }

      // Fetch already assigned students for this user
      const assignedRes = await fetch(`/api/user/${params.id}/assign-students`);
      const assignedData = await assignedRes.json();
      
      if (assignedData.success && assignedData.data) {
        setAssignedStudents(assignedData.data);
        // Pre-select already assigned students
        const assignedIds = assignedData.data.map((a: any) => 
          a.student_id?._id || a.student_id
        );
        setSelectedStudents(new Set(assignedIds));
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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

  const handleSelectAllStudents = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s._id)));
    }
  };

  const handleSaveAssignments = async () => {
    if (selectedStudents.size === 0) {
      alert('กรุณาเลือกอย่างน้อย 1 นักเรียน');
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch(`/api/user/${params.id}/assign-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentIds: Array.from(selectedStudents)
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAssignmentResults([{
          teacherId: params.id as string,
          teacherName: user ? `${user.prefix} ${user.first_name} ${user.last_name}` : 'ไม่ทราบชื่อ',
          assignedCount: selectedStudents.size,
          students: Array.from(selectedStudents)
        }]);
        setShowResults(true);
        
        // Refresh assigned students
        fetchData();
        
      } else {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการมอบหมายนักเรียน');
      }
      
    } catch (error: any) {
      console.error('Error saving assignments:', error);
      alert(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    student.id.toLowerCase().includes(searchStudent.toLowerCase()) ||
    (student.level && student.level.toLowerCase().includes(searchStudent.toLowerCase())) ||
    (student.class_group && student.class_group.toLowerCase().includes(searchStudent.toLowerCase()))
  );

  const isStudentAssigned = (studentId: string) => {
    return assignedStudents.some(assigned => 
      (assigned.student_id?._id || assigned.student_id) === studentId
    );
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-4 text-muted">กำลังโหลดข้อมูล...</p>
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
      {/* Header */}
      <div className="bg-dark text-white py-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="h3 mb-0">
                มอบหมายนักเรียน: {user.prefix} {user.first_name} {user.last_name}
              </h1>
              <p className="mb-0 text-white-50">เลือกนักเรียนเพื่อมอบหมายความรับผิดชอบ</p>
            </div>
            <div className="col-auto">
              <Link
                href={`/user/${params.id}`}
                className="btn btn-outline-light rounded-0"
              >
                <i className="bi bi-arrow-left me-2"></i>กลับ
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {showResults && (
          <div className="alert alert-success border-0 rounded-0 mb-4" role="alert">
            <h5 className="alert-heading">
              <i className="bi bi-check-circle me-2"></i>มอบหมายนักเรียนสำเร็จ
            </h5>
            <hr />
            <div className="mb-0">
              {assignmentResults.map((result, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center">
                  <span>{result.teacherName}</span>
                  <span className="badge bg-success">รับผิดชอบ {result.assignedCount} คน</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowResults(false)}
              className="btn btn-success rounded-0 mt-3"
            >
              ตกลง
            </button>
          </div>
        )}

        {/* Current Assignments Summary */}
        {assignedStudents.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-0">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-people-fill me-2"></i>
                    นักเรียนที่รับผิดชอบอยู่ ({assignedStudents.length} คน)
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    {assignedStudents.slice(0, 6).map((assigned, index) => (
                      <div key={index} className="col-md-6 col-lg-4 mb-2">
                        <div className="d-flex align-items-center p-2 border rounded bg-light">
                          <div className="flex-grow-1">
                            <div className="small fw-bold">{assigned.student_name}</div>
                            <div className="text-muted small">
                              {assigned.student_id?.level} {assigned.student_id?.class_group}
                            </div>
                          </div>
                          <span className={`badge ${assigned.is_active ? 'bg-success' : 'bg-secondary'} ms-2`}>
                            {assigned.is_active ? 'กำลัง' : 'ไม่ใช้'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {assignedStudents.length > 6 && (
                      <div className="col-12 text-center mt-2">
                        <small className="text-muted">และอีก {assignedStudents.length - 6} คน...</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Selection */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-0">
              <div className="card-header bg-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-mortarboard me-2"></i>เลือกนักเรียนที่จะมอบหมาย
                  </h5>
                  <span className="badge bg-light text-dark">
                    เลือกแล้ว {selectedStudents.size}/{filteredStudents.length} คน
                  </span>
                </div>
              </div>
              <div className="card-body p-0">
                {/* Search Students */}
                <div className="p-3 border-bottom">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      placeholder="ค้นหานักเรียน..."
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      className="form-control border-0 bg-light"
                    />
                  </div>
                </div>

                {/* Select All Students */}
                <div className="p-3 border-bottom bg-light">
                  <label className="form-check">
                    <input
                      type="checkbox"
                      checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                      onChange={handleSelectAllStudents}
                      className="form-check-input"
                    />
                    <span className="form-check-label ms-2">เลือกทั้งหมด</span>
                  </label>
                </div>

                {/* Students List */}
                <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                  {filteredStudents.map((student) => {
                    const isAssigned = isStudentAssigned(student._id);
                    return (
                      <div key={student._id} className={`p-3 border-bottom ${isAssigned ? 'bg-light' : 'hover-bg-light'}`}>
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
                                </div>
                                {student.class_number && (
                                  <div className="text-muted small">เลขที่: {student.class_number}</div>
                                )}
                              </div>
                            </div>
                            {student.status && (
                              <span className={`badge bg-${student.status === 'นักเรียนปกติ' ? 'success' : student.status === 'นักเรียนเสี่ยง' ? 'warning' : 'info'} text-white small`}>
                                {student.status}
                              </span>
                            )}
                            {isAssigned && (
                              <span className="badge bg-secondary text-white small ms-2">
                                ถูกมอบหมายแล้ว
                              </span>
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-0">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">
                  <i className="bi bi-clipboard-check me-2"></i>สรุปการเลือก
                </h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-4">
                    <div className="border-end">
                      <h4 className="text-primary mb-1">{selectedStudents.size}</h4>
                      <small className="text-muted">นักเรียนที่เลือก</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border-end">
                      <h4 className="text-success mb-1">{assignedStudents.length}</h4>
                      <small className="text-muted">นักเรียนที่รับผิดชอบอยู่</small>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex gap-2 justify-content-center">
                      <button
                        onClick={handleSaveAssignments}
                        disabled={saving || selectedStudents.size === 0}
                        className="btn btn-primary rounded-0"
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            กำลังบันทึก...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-save me-2"></i>
                            มอบหมายนักเรียน
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => setSelectedStudents(new Set())}
                        className="btn btn-secondary rounded-0"
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        ยกเลิกการเลือก
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
