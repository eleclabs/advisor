// app/student/student_filter/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { withPermission } from "@/app/components/withPermission";

interface Student {
  _id: string;
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  name?: string;
  level: string;
  class_group: string;
  class_number: string;
  status: string;
  image?: string;
}

interface Major {
  _id: string;
  major_id: number;
  major_name: string;
}

function StudentFilterPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([]);
  
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedClassGroup, setSelectedClassGroup] = useState("");
  const [selectedClassNumber, setSelectedClassNumber] = useState("");
  
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // ดึงข้อมูลนักเรียนทั้งหมด
      const studentRes = await fetch("/api/student");
      const studentResult = await studentRes.json();
      
      if (studentResult.success) {
        const formattedStudents = studentResult.data.map((s: any) => ({
          _id: s._id,
          id: s.id || "",
          prefix: s.prefix || "",
          first_name: s.first_name || "",
          last_name: s.last_name || "",
          name: `${s.prefix || ''}${s.first_name || ''} ${s.last_name || ''}`.trim(),
          level: s.level || "",
          class_group: s.class_group || "",
          class_number: s.class_number || "",
          status: s.status || "ปกติ",
          image: s.image || ""
        }));
        setStudents(formattedStudents);
        setFilteredStudents(formattedStudents);
      }

      // ดึงข้อมูล majors
      const majorRes = await fetch("/api/major");
      if (majorRes.ok) {
        const majorData = await majorRes.json();
        setMajors(majorData);
      }

      // ดึง assigned students ของ user ปัจจุบัน
      if (session?.user?.id) {
        const assignedRes = await fetch(`/api/user/${session.user.id}/assign-students`);
        if (assignedRes.ok) {
          const assignedData = await assignedRes.json();
          if (assignedData.success) {
            const assignedIds = assignedData.data.map((a: any) => 
              a.student_id?._id || a.student_id
            );
            setAssignedStudentIds(assignedIds);
            setSelectedStudents(assignedIds);
          }
        }
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // กรองนักเรียนตามเงื่อนไข
  useEffect(() => {
    let filtered = students;

    if (selectedLevel) {
      filtered = filtered.filter(s => s.level === selectedLevel);
    }
    if (selectedClassGroup) {
      filtered = filtered.filter(s => s.class_group === selectedClassGroup);
    }
    if (selectedClassNumber) {
      filtered = filtered.filter(s => s.class_number === selectedClassNumber);
    }
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [selectedLevel, selectedClassGroup, selectedClassNumber, searchTerm, students]);

  // จัดการ select/deselect ทั้งหมด
  const handleSelectAll = () => {
    if (filteredStudents.length === 0) return;
    
    const allFilteredIds = filteredStudents.map(s => s._id);
    const allSelected = allFilteredIds.every(id => selectedStudents.includes(id));
    
    if (allSelected) {
      setSelectedStudents(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      const newSelected = [...new Set([...selectedStudents, ...allFilteredIds])];
      setSelectedStudents(newSelected);
    }
  };

  // จัดการ select/deselect รายตัว
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // บันทึกการมอบหมาย
  const handleSave = async () => {
    if (!session?.user?.id) {
      alert("กรุณาเข้าสู่ระบบก่อน");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/user/${session.user.id}/assign-students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedStudents })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ บันทึกสำเร็จ! มอบหมายนักเรียน ${result.data.length} คน`);
        router.push('/student');
      } else {
        alert(result.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  // คำนวณจำนวนนักเรียนที่เลือก
  const selectedCount = selectedStudents.length;

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
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
                <i className="bi bi-funnel me-2 text-warning"></i>
                เลือกสาขาวิชาในความดูแล
              </h2>
              <div>
                <span className="badge bg-info rounded-0 p-2 me-2">
                  เลือกแล้ว {selectedCount} คน
                </span>
                <Link href="/student" className="btn btn-outline-dark rounded-0">
                  <i className="bi bi-arrow-left me-2"></i>กลับ
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">
                  <i className="bi bi-sliders me-2"></i>
                  กรองนักเรียน
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label text-uppercase small fw-semibold">ระดับชั้น</label>
                    <select
                      className="form-select rounded-0"
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                    >
                      <option value="">ทั้งหมด</option>
                      <option value="ปวช.1">ปวช.1</option>
                      <option value="ปวช.2">ปวช.2</option>
                      <option value="ปวช.3">ปวช.3</option>
                      <option value="ปวส.1">ปวส.1</option>
                      <option value="ปวส.2">ปวส.2</option>
                    </select>
                  </div>
                  
                  <div className="col-md-3">
                    <label className="form-label text-uppercase small fw-semibold">สาขาวิชา</label>
                    <select
                      className="form-select rounded-0"
                      value={selectedClassGroup}
                      onChange={(e) => setSelectedClassGroup(e.target.value)}
                    >
                      <option value="">ทั้งหมด</option>
                      {majors.map(major => (
                        <option key={major._id} value={major.major_name}>
                          {major.major_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-3">
                    <label className="form-label text-uppercase small fw-semibold">ห้อง</label>
                    <input
                      type="text"
                      className="form-control rounded-0"
                      placeholder="เช่น 1, 2, 3"
                      value={selectedClassNumber}
                      onChange={(e) => setSelectedClassNumber(e.target.value)}
                    />
                  </div>
                  
                  <div className="col-md-3">
                    <label className="form-label text-uppercase small fw-semibold">ค้นหา</label>
                    <input
                      type="text"
                      className="form-control rounded-0"
                      placeholder="ชื่อ หรือ รหัสนักเรียน"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-people me-2"></i>
                  รายการนักเรียน ({filteredStudents.length} คน)
                </h5>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input rounded-0"
                    id="selectAll"
                    checked={filteredStudents.length > 0 && filteredStudents.every(s => selectedStudents.includes(s._id))}
                    onChange={handleSelectAll}
                  />
                  <label className="form-check-label text-white" htmlFor="selectAll">
                    เลือกทั้งหมดในหน้านี้
                  </label>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '50px' }}>เลือก</th>
                        <th>รหัส</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>ระดับชั้น</th>
                        <th>สาขาวิชา</th>
                        <th>ห้อง</th>
                        <th>สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <tr key={student._id}>
                            <td className="text-center">
                              <input
                                type="checkbox"
                                className="form-check-input rounded-0"
                                checked={selectedStudents.includes(student._id)}
                                onChange={() => handleSelectStudent(student._id)}
                              />
                            </td>
                            <td className="fw-bold">{student.id}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                {student.image ? (
                                  <img
                                    src={student.image}
                                    alt={student.name}
                                    className="rounded-circle me-2"
                                    style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div
                                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2"
                                    style={{ width: '30px', height: '30px' }}
                                  >
                                    <i className="bi bi-person-fill"></i>
                                  </div>
                                )}
                                {student.name}
                              </div>
                            </td>
                            <td>{student.level}</td>
                            <td>{student.class_group || '-'}</td>
                            <td>{student.class_number || '-'}</td>
                            <td>
                              <span className={`badge bg-${student.status === 'ปกติ' ? 'success' : 'warning'}`}>
                                {student.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center py-4 text-muted">
                            ไม่พบนักเรียนตามเงื่อนไขที่เลือก
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="row mt-4">
          <div className="col-12 d-flex justify-content-center gap-3">
            <Link
              href="/student"
              className="btn btn-secondary rounded-0 px-5"
            >
              <i className="bi bi-x-circle me-2"></i>ยกเลิก
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-warning rounded-0 px-5"
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <i className="bi bi-save me-2"></i>
                  บันทึกนักเรียน {selectedCount} คน
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withPermission(StudentFilterPage, "STUDENT_VIEW");