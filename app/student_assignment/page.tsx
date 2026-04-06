'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

interface AssignmentResult {
  teacherId: string;
  teacherName: string;
  assignedCount: number;
  students: string[];
}

export default function StudentAssignmentPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(new Set());
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>('');
  const [selectedClassNumber, setSelectedClassNumber] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTeacher, setSearchTeacher] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [assignmentResults, setAssignmentResults] = useState<AssignmentResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'level' | 'major' | 'class'>('none'); // เพิ่ม state สำหรับการจัดกลุ่ม

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get current user session to verify admin role
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      
      if (!sessionData?.user || sessionData.user.role !== 'ADMIN') {
        router.push('/unauthorized');
        return;
      }

      // Fetch teachers (TEACHER role)
      const teachersRes = await fetch('/api/user?role=TEACHER');
      const teachersData = await teachersRes.json();
      
      // Fetch all students
      const studentsRes = await fetch('/api/student');
      const studentsData = await studentsRes.json();

      if (teachersData.success) {
        setTeachers(teachersData.data);
      }
      
      if (studentsData.success) {
        setStudents(studentsData.data);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSelect = (teacherId: string) => {
    const newSelected = new Set(selectedTeachers);
    if (newSelected.has(teacherId)) {
      newSelected.delete(teacherId);
    } else {
      newSelected.add(teacherId);
    }
    setSelectedTeachers(newSelected);
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

  const handleSelectAllTeachers = () => {
    if (selectedTeachers.size === filteredTeachers.length) {
      setSelectedTeachers(new Set());
    } else {
      setSelectedTeachers(new Set(filteredTeachers.map(t => t._id)));
    }
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s._id)));
    }
  };

  // จัดกลุ่มนักเรียนตามระดับชั้น สาขาวิชาและห้อง
  const groupStudents = (students: Student[]) => {
    if (groupBy === 'none') return students;
    
    const grouped = students.reduce((acc, student) => {
      if (groupBy === 'level') {
        const key = student.level || 'ไม่ระบุระดับชั้น';
        if (!acc[key]) acc[key] = [];
        acc[key].push(student);
      } else if (groupBy === 'major') {
        const key = student.class_group || 'ไม่ระบุสาขา';
        if (!acc[key]) acc[key] = [];
        acc[key].push(student);
      } else if (groupBy === 'class') {
        const key = `${student.level} ${student.class_group || ''} ${student.class_number || ''}`.trim();
        if (!acc[key]) acc[key] = [];
        acc[key].push(student);
      }
      return acc;
    }, {} as Record<string, Student[]>);
    
    return grouped;
  };

  // คำนวณจำนวนนักเรียนในแต่ละกลุ่ม
  const getGroupCount = (group: Record<string, Student[]>) => {
    return Object.values(group).reduce((total, students) => total + students.length, 0);
  };

  const handleSaveAssignments = async () => {
    if (selectedTeachers.size === 0 || selectedStudents.size === 0) {
      alert('กรุณาเลือกอย่างน้อย 1 ครู และ 1 นักเรียน');
      return;
    }

    try {
      setSaving(true);
      
      // Use the new batch assignment API
      const response = await fetch('/api/admin/batch-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherIds: Array.from(selectedTeachers),
          studentIds: Array.from(selectedStudents)
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAssignmentResults(data.data.results);
        setShowResults(true);
        
        // จัดกลุ่มนักเรียนตามสาขาวิชาและห้อง
        const groupStudents = (students: Student[]) => {
          if (groupBy === 'none') return students;
          
          const grouped = students.reduce((acc, student) => {
            if (groupBy === 'major') {
              const key = student.class_group || 'ไม่ระบุสาขา';
              if (!acc[key]) acc[key] = [];
              acc[key].push(student);
            } else if (groupBy === 'class') {
              const key = `${student.level} ${student.class_group || ''} ${student.class_number || ''}`.trim();
              if (!acc[key]) acc[key] = [];
              acc[key].push(student);
            }
            return acc;
          }, {} as Record<string, Student[]>);
          
          return grouped;
        };

        // คำนวณจำนวนนักเรียนในแต่ละกลุ่ม
        const getGroupCount = (group: Record<string, Student[]>) => {
          return Object.values(group).reduce((total, students) => total + students.length, 0);
        };

        setSelectedTeachers(new Set());
        setSelectedStudents(new Set());
        
        // Refresh teacher data to show updated assignment counts
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

  const filteredTeachers = teachers.filter(teacher =>
    teacher.role === 'TEACHER' && (
      teacher.first_name.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      teacher.last_name.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      (teacher.department && teacher.department.toLowerCase().includes(searchTeacher.toLowerCase()))
    )
  );

  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    student.id.toLowerCase().includes(searchStudent.toLowerCase()) ||
    (student.level && student.level.toLowerCase().includes(searchStudent.toLowerCase())) ||
    (student.class_group && student.class_group.toLowerCase().includes(searchStudent.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
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
              <p className="mb-0 text-white-50">เลือกครูและนักเรียนเพื่อมอบหมายความรับผิดชอบ</p>
            </div>
            <div className="col-auto">
              <Link
                href="/student_assignment/manage"
                className="btn btn-outline-warning rounded-0 me-2"
              >
                <i className="bi bi-gear me-2"></i>จัดการการมอบหมาย
              </Link>
              <Link
                href="/dashboard"
                className="btn btn-outline-light rounded-0"
              >
                <i className="bi bi-arrow-left me-2"></i>กลับหน้า Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {showResults && (
          <div className="alert alert-success border-0 rounded-0 mb-4" role="alert">
            <h5 className="alert-heading">
              <i className="bi bi-check-circle me-2"></i>บันทึกการมอบหมายสำเร็จ
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

        <div className="row">
          {/* Teachers Section - Left */}
          <div className="col-lg-6 mb-4">
            <div className="card border-0 shadow-sm rounded-0">
              <div className="card-header bg-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-people me-2"></i>เลือกครู
                  </h5>
                  <span className="badge bg-light text-dark">
                    เลือกแล้ว {selectedTeachers.size}/{filteredTeachers.length} คน
                  </span>
                </div>
              </div>
              <div className="card-body p-0">
                {/* Search Teachers */}
                <div className="p-3 border-bottom">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      placeholder="ค้นหาครู..."
                      value={searchTeacher}
                      onChange={(e) => setSearchTeacher(e.target.value)}
                      className="form-control border-0 bg-light"
                    />
                  </div>
                </div>

                {/* Select All Teachers */}
                <div className="p-3 border-bottom bg-light">
                  <label className="form-check">
                    <input
                      type="checkbox"
                      checked={selectedTeachers.size === filteredTeachers.length && filteredTeachers.length > 0}
                      onChange={handleSelectAllTeachers}
                      className="form-check-input"
                    />
                    <span className="form-check-label ms-2">เลือกทั้งหมด</span>
                  </label>
                </div>

                {/* Teachers List */}
                <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                  {filteredTeachers.map((teacher) => (
                    <div key={teacher._id} className="p-3 border-bottom hover-bg-light">
                      <label className="form-check mb-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTeachers.has(teacher._id)}
                          onChange={() => handleTeacherSelect(teacher._id)}
                          className="form-check-input"
                        />
                        <div className="form-check-label ms-2 w-100">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <div className="fw-medium">
                                {teacher.prefix} {teacher.first_name} {teacher.last_name}
                              </div>
                              <div className="text-muted small">{teacher.email}</div>
                              {teacher.department && (
                                <div className="text-muted small">แผนก: {teacher.department}</div>
                              )}
                            </div>
                            {teacher.assigned_students && teacher.assigned_students.length > 0 && (
                              <span className="badge bg-info text-white small">
                                รับผิดชอบอยู่ {teacher.assigned_students.length} คน
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Students Section - Right */}
          <div className="col-lg-6 mb-4">
            <div className="card border-0 shadow-sm rounded-0">
              <div className="card-header bg-success text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-mortarboard me-2"></i>เลือกนักเรียน
                  </h5>
                  <span className="badge bg-light text-dark">
                    เลือกแล้ว {selectedStudents.size}/{filteredStudents.length} คน
                  </span>
                </div>
              </div>
              <div className="card-body p-0">
                {/* Grouping Controls */}
                <div className="p-3 border-bottom bg-light">
                  <div className="d-flex gap-2 align-items-center">
                    <label className="form-label mb-0 me-2">จัดกลุ่มตาม:</label>
                    <select
                      className="form-select form-select-sm"
                      value={groupBy}
                      onChange={(e) => setGroupBy(e.target.value as any)}
                    >
                      <option value="none">ไม่จัดกลุ่ม</option>
                      <option value="level">จัดกลุ่มตามระดับชั้น</option>
                      <option value="major">จัดกลุ่มตามสาขาวิชา</option>
                      <option value="class">จัดกลุ่มตามชั้น/สาขา/ห้อง</option>
                    </select>
                  </div>
                </div>

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
                  {groupBy === 'none' ? (
                    // แสดงปกติเมื่อไม่จัดกลุ่ม
                    filteredStudents.map((student) => (
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
                                </div>
                                {student.class_number && (
                                  <div className="text-muted small">ห้อง: {student.class_number}</div>
                                )}
                              </div>
                            </div>
                            {student.advisor_name && (
                              <span className="badge bg-warning text-dark small">
                                ที่ปรึกษา: {student.advisor_name}
                              </span>
                            )}
                          </div>
                        </label>
                      </div>
                    ))
                  ) : (
                    // แสดงแบบจัดกลุ่ม
                    Object.entries(groupStudents(filteredStudents)).map(([groupName, groupStudents]) => (
                      <div key={groupName} className="border-bottom">
                        <div className="p-2 bg-light">
                          <h6 className="mb-2 text-primary">
                            <i className="bi bi-folder me-2"></i>
                            {groupName} ({groupStudents.length} คน)
                          </h6>
                        </div>
                        {groupStudents.map((student: Student) => (
                          <div key={student._id} className="p-3 border-bottom hover-bg-light ms-3">
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
                                      รหัส: {student.id} | {student.level}
                                    </div>
                                  </div>
                                </div>
                                {student.advisor_name && (
                                  <span className="badge bg-warning text-dark small">
                                    ที่ปรึกษา: {student.advisor_name}
                                  </span>
                                )}
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section - Bottom */}
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
                  <div className="col-md-3">
                    <div className="border-end">
                      <h4 className="text-primary mb-1">{selectedTeachers.size}</h4>
                      <small className="text-muted">ครูที่เลือก</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border-end">
                      <h4 className="text-success mb-1">{selectedStudents.size}</h4>
                      <small className="text-muted">นักเรียนที่เลือก</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border-end">
                      <h4 className="text-warning mb-1">{selectedTeachers.size * selectedStudents.size}</h4>
                      <small className="text-muted">การมอบหมายทั้งหมด</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex gap-2 justify-content-center">
                      <button
                        onClick={handleSaveAssignments}
                        disabled={saving || selectedTeachers.size === 0 || selectedStudents.size === 0}
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
                            บันทึกการมอบหมาย
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedTeachers(new Set());
                          setSelectedStudents(new Set());
                        }}
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
