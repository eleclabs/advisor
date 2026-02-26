"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  level: string;
  class: string;
  status: string;
  advisorName: string;
  sdq_score?: number;
  dass2_score?: number;
  lastInterview?: string;
}

// เพิ่ม Interface สำหรับข้อมูลสัมภาษณ์
interface InterviewData {
  student_id: string;
  interview_status: string;  // ปกติ, เสี่ยง, มีปัญหา
  interview_date: string;
}

interface AssessmentData {
  studentId: string;
  studentName: string;
  sdq: {
    total: number;
    emotional: number;
    conduct: number;
    hyperactivity: number;
    peer: number;
    prosocial: number;
    level: string;
  };
  dass2: {
    total: number;
    depression: number;
    anxiety: number;
    stress: number;
    level: string;
  };
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>("ทั้งหมด");
  const [selectedInterviewFilter, setSelectedInterviewFilter] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);

  // เพิ่ม Mock ข้อมูลสัมภาษณ์
  const [interviewData, setInterviewData] = useState<{ [key: string]: InterviewData }>({
    "66001": { student_id: "66001", interview_status: "ปกติ", interview_date: "15 ก.พ. 2568" },
    "66002": { student_id: "66002", interview_status: "เสี่ยง", interview_date: "10 ก.พ. 2568" },
    "66003": { student_id: "66003", interview_status: "มีปัญหา", interview_date: "5 ก.พ. 2568" },
    "66004": { student_id: "66004", interview_status: "ปกติ", interview_date: "12 ก.พ. 2568" },
    "66005": { student_id: "66005", interview_status: "ปกติ", interview_date: "8 ก.พ. 2568" },
    "66006": { student_id: "66006", interview_status: "เสี่ยง", interview_date: "14 ก.พ. 2568" },
    "66007": { student_id: "66007", interview_status: "ปกติ", interview_date: "9 ก.พ. 2568" },
    "66008": { student_id: "66008", interview_status: "มีปัญหา", interview_date: "7 ก.พ. 2568" },
  });

  const teacher_name = "อาจารย์วิมลรัตน์ ใจดี";
  const academic_year = "2568";

  // Mock data for students
  useEffect(() => {
    const mockStudents: Student[] = [
      { id: "66001", name: "นายสมชาย ใจดี", level: "ปวช.3", class: "ชฟ.1", status: "ปกติ", advisorName: "อาจารย์วิมลรัตน์", sdq_score: 12, dass2_score: 15, lastInterview: "15 ก.พ. 2568" },
      { id: "66002", name: "นางสาวจิรา สวยใจ", level: "ปวช.3", class: "ชฟ.2", status: "เสี่ยง", advisorName: "อาจารย์วิมลรัตน์", sdq_score: 18, dass2_score: 25, lastInterview: "10 ก.พ. 2568" },
      { id: "66003", name: "นายสมเด็จ วิจิตร", level: "ปวช.2", class: "ชฟ.1", status: "มีปัญหา", advisorName: "อาจารย์วิมลรัตน์", sdq_score: 24, dass2_score: 35, lastInterview: "5 ก.พ. 2568" },
      { id: "66004", name: "นางสาวมาศ สุขศรี", level: "ปวช.3", class: "ชฟ.3", status: "ปกติ", advisorName: "อาจารย์วิมลรัตน์", sdq_score: 10, dass2_score: 12, lastInterview: "12 ก.พ. 2568" },
      { id: "66005", name: "นายกิจ ขยันหนุ่ม", level: "ปวช.2", class: "ชฟ.2", status: "ปกติ", advisorName: "อาจารย์วิมลรัตน์", sdq_score: 14, dass2_score: 18, lastInterview: "8 ก.พ. 2568" },
      { id: "66006", name: "นางสาวพิมพ์ ใจดี", level: "ปวช.1", class: "ชฟ.1", status: "เสี่ยง", advisorName: "อาจารย์วิมลรัตน์", sdq_score: 19, dass2_score: 28, lastInterview: "14 ก.พ. 2568" },
      { id: "66007", name: "นายอนุชา รักเรียน", level: "ปวช.1", class: "ชฟ.2", status: "ปกติ", advisorName: "อาจารย์วิมลรัตน์", sdq_score: 11, dass2_score: 14, lastInterview: "9 ก.พ. 2568" },
      { id: "66008", name: "นางสาวกัญญา เก่งกล้า", level: "ปวส.1", class: "ชฟ.1", status: "มีปัญหา", advisorName: "อาจารย์วิมลรัตน์", sdq_score: 26, dass2_score: 38, lastInterview: "7 ก.พ. 2568" },
    ];
    
    setStudents(mockStudents);
    setFilteredStudents(mockStudents);
    setLoading(false);
  }, []);

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

  // Filter students based on selected filter and search
  useEffect(() => {
    let filtered = students;

    // Filter by status
    if (selectedFilter !== "ทั้งหมด") {
      filtered = filtered.filter(student => student.status === selectedFilter);
    }

    // Filter by interview status
    if (selectedInterviewFilter) {
      filtered = filtered.filter(student => {
        const interview = interviewData[student.id];
        return interview?.interview_status === selectedInterviewFilter;
      });
    }

    // Filter by assessment
    if (selectedAssessment === "sdq") {
      filtered = filtered.filter(student => (student.sdq_score || 0) >= 17);
    } else if (selectedAssessment === "dass2") {
      filtered = filtered.filter(student => (student.dass2_score || 0) >= 25);
    }

    // Search
    if (searchKeyword) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        student.id.includes(searchKeyword)
      );
    }

    setFilteredStudents(filtered);
  }, [selectedFilter, selectedInterviewFilter, searchKeyword, selectedAssessment, students, interviewData]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "ปกติ": return "success";
      case "เสี่ยง": return "warning";
      case "มีปัญหา": return "danger";
      default: return "secondary";
    }
  };

  const getAssessmentLevel = (score: number, type: string) => {
    if (type === "sdq") {
      if (score <= 13) return { text: "ปกติ", color: "success" };
      if (score <= 16) return { text: "เสี่ยง", color: "warning" };
      return { text: "มีปัญหา", color: "danger" };
    } else {
      if (score <= 20) return { text: "ปกติ", color: "success" };
      if (score <= 30) return { text: "ปานกลาง", color: "warning" };
      return { text: "รุนแรง", color: "danger" };
    }
  };

  const handleViewAssessment = (student: Student) => {
    setSelectedStudent(student);
    // Mock assessment data
    setAssessmentData({
      studentId: student.id,
      studentName: student.name,
      sdq: {
        total: student.sdq_score || 0,
        emotional: 4,
        conduct: 3,
        hyperactivity: 5,
        peer: 3,
        prosocial: 7,
        level: getAssessmentLevel(student.sdq_score || 0, "sdq").text
      },
      dass2: {
        total: student.dass2_score || 0,
        depression: 8,
        anxiety: 7,
        stress: 10,
        level: getAssessmentLevel(student.dass2_score || 0, "dass2").text
      }
    });
    setShowAssessmentModal(true);
  };

  const stats = {
    total: students.length,
    normal: students.filter(s => s.status === "ปกติ").length,
    risk: students.filter(s => s.status === "เสี่ยง").length,
    problem: students.filter(s => s.status === "มีปัญหา").length,
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* START: Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-2 border-warning flex-shrink-0">
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
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/student">รายชื่อผู้เรียน</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3 active" href="/teacher-dashboard">Dashboard</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/committees">คณะกรรมการ</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/referrals">ส่งต่อ</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* END: Navigation Bar */}

      {/* START: Main Content */}
      <div className="flex-grow-1">
        <div className="container-fluid py-4">
          {/* START: Page Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
                <h2 className="text-uppercase fw-bold m-0">
                  <i className="bi bi-speedometer2 me-2 text-warning"></i>
                  Dashboard ครูที่ปรึกษา
                </h2>
                <div>
                  <span className="text-muted me-3">ครูที่ปรึกษา: {teacher_name}</span>
                  <span className="badge bg-dark text-white rounded-0">ปีการศึกษา {academic_year}</span>
                </div>
              </div>
            </div>
          </div>
          {/* END: Page Header */}

          {/* START: Stats Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-uppercase fw-semibold small text-muted">นักเรียนทั้งหมด</div>
                    <div className="display-6 fw-bold">{stats.total}</div>
                  </div>
                  <i className="bi bi-people-fill fs-1 text-warning"></i>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-uppercase fw-semibold small text-muted">กลุ่มปกติ</div>
                    <div className="display-6 fw-bold text-success">{stats.normal}</div>
                  </div>
                  <i className="bi bi-check-circle-fill fs-1 text-success"></i>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-uppercase fw-semibold small text-muted">กลุ่มเสี่ยง</div>
                    <div className="display-6 fw-bold text-warning">{stats.risk}</div>
                  </div>
                  <i className="bi bi-exclamation-triangle-fill fs-1 text-warning"></i>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-uppercase fw-semibold small text-muted">กลุ่มมีปัญหา</div>
                    <div className="display-6 fw-bold text-danger">{stats.problem}</div>
                  </div>
                  <i className="bi bi-exclamation-octagon-fill fs-1 text-danger"></i>
                </div>
              </div>
            </div>
          </div>
          {/* END: Stats Cards */}

          {/* START: Filter Section */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-funnel me-2 text-warning"></i>
                    ตัวเลือกการกรองข้อมูล
                  </h5>
                </div>
                <div className="p-3">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">กรองตามสถานะทั่วไป</label>
                      <div className="btn-group w-100" role="group">
                        <button 
                          className={`btn btn-outline-${selectedFilter === 'ทั้งหมด' ? 'dark' : 'secondary'} rounded-0 text-uppercase fw-semibold`}
                          onClick={() => setSelectedFilter('ทั้งหมด')}
                        >
                          ทั้งหมด
                        </button>
                        <button 
                          className={`btn btn-outline-${selectedFilter === 'ปกติ' ? 'success' : 'secondary'} rounded-0 text-uppercase fw-semibold`}
                          onClick={() => setSelectedFilter('ปกติ')}
                        >
                          ปกติ
                        </button>
                        <button 
                          className={`btn btn-outline-${selectedFilter === 'เสี่ยง' ? 'warning' : 'secondary'} rounded-0 text-uppercase fw-semibold`}
                          onClick={() => setSelectedFilter('เสี่ยง')}
                        >
                          เสี่ยง
                        </button>
                        <button 
                          className={`btn btn-outline-${selectedFilter === 'มีปัญหา' ? 'danger' : 'secondary'} rounded-0 text-uppercase fw-semibold`}
                          onClick={() => setSelectedFilter('มีปัญหา')}
                        >
                          มีปัญหา
                        </button>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label text-uppercase fw-semibold small">กรองตามสัมภาษณ์</label>
                      <select 
                        className="form-select rounded-0"
                        value={selectedInterviewFilter}
                        onChange={(e) => setSelectedInterviewFilter(e.target.value)}
                      >
                        <option value="">ทั้งหมด</option>
                        <option value="ปกติ">ปกติ</option>
                        <option value="เสี่ยง">เสี่ยง</option>
                        <option value="มีปัญหา">มีปัญหา</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label text-uppercase fw-semibold small">กรองตามแบบประเมิน</label>
                      <select 
                        className="form-select rounded-0"
                        value={selectedAssessment}
                        onChange={(e) => setSelectedAssessment(e.target.value)}
                      >
                        <option value="">ทั้งหมด</option>
                        <option value="sdq">SDQ</option>
                        <option value="dass2">DASS-2</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">ค้นหา</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border rounded-0">
                          <i className="bi bi-search"></i>
                        </span>
                        <input 
                          type="text" 
                          className="form-control rounded-0" 
                          placeholder="ชื่อหรือรหัส..."
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                      <button 
                        className="btn btn-warning rounded-0 w-100 text-uppercase fw-semibold"
                        onClick={() => {
                          setSelectedFilter('ทั้งหมด');
                          setSelectedInterviewFilter('');
                          setSelectedAssessment('');
                          setSearchKeyword('');
                        }}
                      >
                        <i className="bi bi-arrow-counterclockwise me-2"></i>รีเซ็ต
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* END: Filter Section */}

          {/* START: Student List with Assessments */}
          <div className="row">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-table me-2 text-warning"></i>
                    รายชื่อนักเรียน ({filteredStudents.length} คน)
                  </h5>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover m-0">
                    <thead>
                      <tr>
                        <th className="text-uppercase fw-semibold">ลำดับ</th>
                        <th className="text-uppercase fw-semibold">รหัส</th>
                        <th className="text-uppercase fw-semibold">ชื่อ-นามสกุล</th>
                        <th className="text-uppercase fw-semibold">ระดับชั้น</th>
                        <th className="text-uppercase fw-semibold">สถานะทั่วไป</th>
                        <th className="text-uppercase fw-semibold">สัมภาษณ์</th>
                        <th className="text-uppercase fw-semibold">SDQ</th>
                        <th className="text-uppercase fw-semibold">DASS-2</th>
                        <th className="text-uppercase fw-semibold">สัมภาษณ์ล่าสุด</th>
                        <th className="text-uppercase fw-semibold">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={10} className="text-center py-4">
                            <div className="spinner-border text-warning" role="status">
                              <span className="visually-hidden">กำลังโหลด...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredStudents.length > 0 ? (
                        filteredStudents.map((student, index) => (
                          <tr key={student.id}>
                            <td>{index + 1}</td>
                            <td className="fw-semibold">{student.id}</td>
                            <td>
                              <Link href={`/student_detail/${student.id}`} className="text-decoration-none">
                                {student.name}
                              </Link>
                            </td>
                            <td>{student.level}/{student.class}</td>
                            <td>
                              <span className={`badge bg-${getStatusColor(student.status)} rounded-0 text-uppercase fw-semibold`}>
                                {student.status}
                              </span>
                            </td>
                            <td>
                              {interviewData[student.id] ? (
                                <span className={`badge bg-${getStatusColor(interviewData[student.id].interview_status)} rounded-0`}>
                                  {interviewData[student.id].interview_status}
                                </span>
                              ) : (
                                <span className="badge bg-secondary rounded-0">ไม่มีข้อมูล</span>
                              )}
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-info rounded-0"
                                onClick={() => handleViewAssessment(student)}
                              >
                                {student.sdq_score || 0} (
                                <span className={`text-${getAssessmentLevel(student.sdq_score || 0, "sdq").color}`}>
                                  {getAssessmentLevel(student.sdq_score || 0, "sdq").text}
                                </span>
                                )
                              </button>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-info rounded-0"
                                onClick={() => handleViewAssessment(student)}
                              >
                                {student.dass2_score || 0} (
                                <span className={`text-${getAssessmentLevel(student.dass2_score || 0, "dass2").color}`}>
                                  {getAssessmentLevel(student.dass2_score || 0, "dass2").text}
                                </span>
                                )
                              </button>
                            </td>
                            <td>{student.lastInterview || "-"}</td>
                            <td>
                              <div className="btn-group" role="group">
                                <Link
                                  href={`/student_detail/${student.id}`}
                                  className="btn btn-sm btn-outline-primary rounded-0"
                                  title="ดูข้อมูล"
                                >
                                  <i className="bi bi-person"></i>
                                </Link>
                                <Link
                                  href={`/student_detail/${student.id}/interview`}
                                  className="btn btn-sm btn-outline-success rounded-0"
                                  title="ดูสัมภาษณ์"
                                >
                                  <i className="bi bi-chat"></i>
                                </Link>
                                <button 
                                  className="btn btn-sm btn-outline-warning rounded-0"
                                  title="แบบประเมิน"
                                  onClick={() => handleViewAssessment(student)}
                                >
                                  <i className="bi bi-clipboard-check"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="text-center py-4">
                            <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                            <p className="mb-0">ไม่พบข้อมูลนักเรียน</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {/* END: Student List with Assessments */}

          {/* START: Assessment Info */}
          <div className="row mt-4">
            <div className="col-md-6">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-info-circle me-2 text-warning"></i>
                    เกี่ยวกับแบบประเมิน SDQ
                  </h5>
                </div>
                <div className="p-3">
                  <p><strong>SDQ (Strength and Difficulties Questionnaire)</strong> - แบบประเมินจุดแข็งและจุดอ่อน</p>
                  <ul className="mb-0">
                    <li>คะแนน 0-13: ปกติ</li>
                    <li>คะแนน 14-16: กลุ่มเสี่ยง</li>
                    <li>คะแนน 17-40: กลุ่มมีปัญหา</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-info-circle me-2 text-warning"></i>
                    เกี่ยวกับแบบประเมิน DASS-2
                  </h5>
                </div>
                <div className="p-3">
                  <p><strong>DASS-2 (Depression Anxiety Stress Scales)</strong> - แบบประเมินความเครียด วิตกกังวล ซึมเศร้า</p>
                  <ul className="mb-0">
                    <li>คะแนน 0-20: ปกติ</li>
                    <li>คะแนน 21-30: ปานกลาง</li>
                    <li>คะแนน 31-42: รุนแรง</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {/* END: Assessment Info */}
        </div>
      </div>
      {/* END: Main Content */}

      {/* START: Assessment Modal */}
      {showAssessmentModal && assessmentData && selectedStudent && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content rounded-0">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title text-uppercase fw-semibold">
                  <i className="bi bi-clipboard-check me-2 text-warning"></i>
                  ผลการประเมิน: {selectedStudent.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowAssessmentModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="border p-3">
                      <h6 className="text-uppercase fw-bold mb-3">SDQ (Strength and Difficulties)</h6>
                      <div className="mb-2">
                        <span className="fw-semibold">คะแนนรวม:</span> {assessmentData.sdq.total} 
                        <span className={`badge bg-${getAssessmentLevel(assessmentData.sdq.total, "sdq").color} ms-2 rounded-0`}>
                          {assessmentData.sdq.level}
                        </span>
                      </div>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td>ด้านอารมณ์ (Emotional)</td>
                            <td className="text-end">{assessmentData.sdq.emotional}</td>
                          </tr>
                          <tr>
                            <td>ด้านพฤติกรรม (Conduct)</td>
                            <td className="text-end">{assessmentData.sdq.conduct}</td>
                          </tr>
                          <tr>
                            <td>ด้านสมาธิ (Hyperactivity)</td>
                            <td className="text-end">{assessmentData.sdq.hyperactivity}</td>
                          </tr>
                          <tr>
                            <td>ด้านความสัมพันธ์กับเพื่อน (Peer)</td>
                            <td className="text-end">{assessmentData.sdq.peer}</td>
                          </tr>
                          <tr>
                            <td>ด้านความเอื้อเฟื้อ (Prosocial)</td>
                            <td className="text-end">{assessmentData.sdq.prosocial}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="border p-3">
                      <h6 className="text-uppercase fw-bold mb-3">DASS-2 (Depression Anxiety Stress)</h6>
                      <div className="mb-2">
                        <span className="fw-semibold">คะแนนรวม:</span> {assessmentData.dass2.total}
                        <span className={`badge bg-${getAssessmentLevel(assessmentData.dass2.total, "dass2").color} ms-2 rounded-0`}>
                          {assessmentData.dass2.level}
                        </span>
                      </div>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td>ด้านซึมเศร้า (Depression)</td>
                            <td className="text-end">{assessmentData.dass2.depression}</td>
                          </tr>
                          <tr>
                            <td>ด้านวิตกกังวล (Anxiety)</td>
                            <td className="text-end">{assessmentData.dass2.anxiety}</td>
                          </tr>
                          <tr>
                            <td>ด้านความเครียด (Stress)</td>
                            <td className="text-end">{assessmentData.dass2.stress}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-12">
                    <div className="border p-3 bg-light">
                      <h6 className="text-uppercase fw-bold mb-3">ข้อเสนอแนะ</h6>
                      <p>
                        {assessmentData.sdq.level === "มีปัญหา" || assessmentData.dass2.level === "รุนแรง" 
                          ? "ควรส่งต่อพบนักจิตวิทยาหรือผู้เชี่ยวชาญเพื่อประเมินและช่วยเหลือเพิ่มเติม"
                          : assessmentData.sdq.level === "เสี่ยง" || assessmentData.dass2.level === "ปานกลาง"
                          ? "ควรติดตามและดูแลอย่างใกล้ชิด พูดคุยกับผู้ปกครองเพื่อหาแนวทางช่วยเหลือ"
                          : "นักเรียนอยู่ในเกณฑ์ปกติ ควรดูแลและให้กำลังใจอย่างต่อเนื่อง"}
                      </p>
                      <div className="mt-3">
                        <Link
                          href={`/student_detail/${selectedStudent.id}/interview`}
                          className="btn btn-outline-primary rounded-0 text-uppercase fw-semibold me-2"
                        >
                          <i className="bi bi-chat me-2"></i>ดูประวัติการสัมภาษณ์
                        </Link>
                        <button 
                          className="btn btn-outline-success rounded-0 text-uppercase fw-semibold"
                          onClick={() => window.print()}
                        >
                          <i className="bi bi-printer me-2"></i>พิมพ์ผลประเมิน
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary rounded-0 text-uppercase fw-semibold"
                  onClick={() => setShowAssessmentModal(false)}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* END: Assessment Modal */}

      {/* START: Footer */}
      <footer className="bg-dark text-white py-3 border-top border-warning flex-shrink-0">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 text-uppercase small">
              <i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล
            </div>
            <div className="col-md-6 text-end text-uppercase small">
              <span className="me-3">เวอร์ชัน 2.0.0</span>
              <span>ครูที่ปรึกษา: {teacher_name}</span>
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