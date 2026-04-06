"use client";

import { useEffect, useState } from "react";

interface StudentData {
  _id: string;
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  level: string;
  class_group: string;
  class_number: string;
  status: string;
  image: string;
}

export default function AccessPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>("");
  const [selectedClassNumber, setSelectedClassNumber] = useState<string>("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🚀 Fetching students from API...");
      
      const response = await fetch('/api/student');
      console.log("📡 API Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("📊 API Response:", result);

      if (result.success) {
        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("ข้อมูลที่ได้รับไม่ถูกต้อง");
        }
        
        console.log(`📈 Processing ${result.data.length} students...`);
        setStudents(result.data);
        console.log("✅ Data processed successfully");
      } else {
        throw new Error(result.message || "เกิดข้อผิดพลาดจาก API");
      }
    } catch (error: any) {
      console.error("❌ Error in fetchStudents:", error);
      setError(error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Get unique levels
  const getLevels = () => {
    return [...new Set(students.map(s => s.level).filter(Boolean))].sort();
  };

  // Get class groups for selected level
  const getClassGroups = () => {
    return [...new Set(students
      .filter(s => s.level === selectedLevel)
      .map(s => s.class_group)
      .filter(Boolean)
    )].sort();
  };

  // Get class numbers for selected level and class group
  const getClassNumbers = () => {
    return [...new Set(students
      .filter(s => s.level === selectedLevel && s.class_group === selectedClassGroup)
      .map(s => s.class_number)
      .filter(Boolean)
    )].sort();
  };

  // Get students for selected level, class group, and class number
  const getStudentsForSelection = () => {
    return students.filter(s => 
      s.level === selectedLevel && 
      s.class_group === selectedClassGroup && 
      s.class_number === selectedClassNumber
    ).sort((a: StudentData, b: StudentData) => a.id.localeCompare(b.id));
  };

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    setSelectedClassGroup("");
    setSelectedClassNumber("");
    setActiveTab(2);
  };

  const handleClassGroupSelect = (classGroup: string) => {
    setSelectedClassGroup(classGroup);
    setSelectedClassNumber("");
    setActiveTab(3);
  };

  const handleClassNumberSelect = (classNumber: string) => {
    setSelectedClassNumber(classNumber);
    setActiveTab(4);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'นักเรียนปกติ': 'success',
      'นักเรียนเสี่ยง': 'warning',
      'นักเรียนพิเศษ': 'info'
    };
    return colors[status as keyof typeof colors] || 'secondary';
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

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="alert alert-danger" style={{ maxWidth: '600px' }}>
          <h5 className="alert-heading">
            <i className="bi bi-exclamation-triangle me-2"></i>
            เกิดข้อผิดพลาดในการดึงข้อมูล
          </h5>
          <p className="mb-2">{error}</p>
          <hr />
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              โปรดตรวจสอบว่า:
              <ul className="mb-0 mt-1">
                <li>ฐานข้อมูล MongoDB ทำงานปกติ</li>
                <li>มีข้อมูลนักเรียนในฐานข้อมูล</li>
                <li>เซิร์ฟเวอร์ทำงานบนพอร์ตที่ถูกต้อง</li>
              </ul>
            </small>
            <button onClick={fetchStudents} className="btn btn-dark">
              <i className="bi bi-arrow-clockwise me-2"></i>ลองใหม่
            </button>
          </div>
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
            <div className="border-bottom border-3 border-warning pb-2">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-door-open me-2 text-warning"></i>
                ข้อมูลการเข้าถึงนักเรียน
              </h2>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-tabs nav-fill">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 1 ? 'active' : ''}`}
                  onClick={() => setActiveTab(1)}
                >
                  <i className="bi bi-layers me-2"></i>
                  Tab 1: ระดับชั้น
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 2 ? 'active' : ''} ${!selectedLevel ? 'disabled' : ''}`}
                  onClick={() => selectedLevel && setActiveTab(2)}
                  disabled={!selectedLevel}
                >
                  <i className="bi bi-collection me-2"></i>
                  Tab 2: สาขาวิชา
                  {selectedLevel && <span className="badge bg-primary ms-2">{selectedLevel}</span>}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 3 ? 'active' : ''} ${!selectedClassGroup ? 'disabled' : ''}`}
                  onClick={() => selectedClassGroup && setActiveTab(3)}
                  disabled={!selectedClassGroup}
                >
                  <i className="bi bi-list-ol me-2"></i>
                  Tab 3: ห้อง
                  {selectedClassGroup && <span className="badge bg-info ms-2">{selectedClassGroup}</span>}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 4 ? 'active' : ''} ${!selectedClassNumber ? 'disabled' : ''}`}
                  onClick={() => selectedClassNumber && setActiveTab(4)}
                  disabled={!selectedClassNumber}
                >
                  <i className="bi bi-person-badge me-2"></i>
                  Tab 4: รหัสนักเรียน
                  {selectedClassNumber && <span className="badge bg-success ms-2">{selectedClassNumber}</span>}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tab Content */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                {/* Tab 1: Levels */}
                {activeTab === 1 && (
                  <div>
                    <h4 className="mb-3">
                      <i className="bi bi-layers me-2 text-primary"></i>
                      เลือกระดับชั้น
                    </h4>
                    <div className="row">
                      {getLevels().map((level) => (
                        <div key={level} className="col-md-3 col-sm-6 mb-3">
                          <button
                            className="btn btn-outline-primary w-100 p-3 text-center"
                            onClick={() => handleLevelSelect(level)}
                          >
                            <div className="fs-4 fw-bold">{level}</div>
                            <small className="text-muted">
                              {students.filter(s => s.level === level).length} คน
                            </small>
                          </button>
                        </div>
                      ))}
                      {getLevels().length === 0 && (
                        <div className="col-12 text-center py-5">
                          <i className="bi bi-inbox display-1 text-muted"></i>
                          <h4 className="mt-3">ไม่พบข้อมูลระดับชั้น</h4>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 2: Class Groups */}
                {activeTab === 2 && (
                  <div>
                    <h4 className="mb-3">
                      <i className="bi bi-collection me-2 text-info"></i>
                      สาขาวิชาในระดับชั้น {selectedLevel}
                    </h4>
                    <div className="row">
                      {getClassGroups().map((classGroup) => (
                        <div key={classGroup} className="col-md-3 col-sm-6 mb-3">
                          <button
                            className="btn btn-outline-info w-100 p-3 text-center"
                            onClick={() => handleClassGroupSelect(classGroup)}
                          >
                            <div className="fs-4 fw-bold">{classGroup}</div>
                            <small className="text-muted">
                              {students.filter(s => s.level === selectedLevel && s.class_group === classGroup).length} คน
                            </small>
                          </button>
                        </div>
                      ))}
                      {getClassGroups().length === 0 && (
                        <div className="col-12 text-center py-5">
                          <i className="bi bi-inbox display-1 text-muted"></i>
                          <h4 className="mt-3">ไม่พบข้อมูลสาขาวิชาในระดับชั้น {selectedLevel}</h4>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 3: Class Numbers */}
                {activeTab === 3 && (
                  <div>
                    <h4 className="mb-3">
                      <i className="bi bi-list-ol me-2 text-warning"></i>
                      ห้องในสาขาวิชา {selectedClassGroup} ระดับชั้น {selectedLevel}
                    </h4>
                    <div className="row">
                      {getClassNumbers().map((classNumber) => (
                        <div key={classNumber} className="col-md-2 col-sm-4 col-6 mb-3">
                          <button
                            className="btn btn-outline-warning w-100 p-3 text-center"
                            onClick={() => handleClassNumberSelect(classNumber)}
                          >
                            <div className="fs-4 fw-bold">{classNumber}</div>
                            <small className="text-muted">
                              {students.filter(s => 
                                s.level === selectedLevel && 
                                s.class_group === selectedClassGroup && 
                                s.class_number === classNumber
                              ).length} คน
                            </small>
                          </button>
                        </div>
                      ))}
                      {getClassNumbers().length === 0 && (
                        <div className="col-12 text-center py-5">
                          <i className="bi bi-inbox display-1 text-muted"></i>
                          <h4 className="mt-3">ไม่พบข้อมูลห้องในสาขาวิชา {selectedClassGroup}</h4>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 4: Students */}
                {activeTab === 4 && (
                  <div>
                    <h4 className="mb-3">
                      <i className="bi bi-person-badge me-2 text-success"></i>
                      รหัสนักเรียนในห้อง {selectedClassNumber} สาขาวิชา {selectedClassGroup} ระดับชั้น {selectedLevel}
                    </h4>
                    <div className="row">
                      {getStudentsForSelection().map((student) => (
                        <div key={student._id} className="col-md-4 col-sm-6 mb-3">
                          <div className="card border-success">
                            <div className="card-body">
                              <div className="d-flex align-items-center mb-2">
                                {student.image ? (
                                  <img
                                    src={student.image}
                                    alt={`${student.prefix} ${student.first_name} ${student.last_name}`}
                                    className="rounded-circle me-2"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div
                                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white me-2"
                                    style={{ width: '40px', height: '40px' }}
                                  >
                                    <i className="bi bi-person-fill"></i>
                                  </div>
                                )}
                                <div className="flex-grow-1">
                                  <div className="fw-bold">{student.id}</div>
                                  <div className="small text-muted">{student.prefix} {student.first_name} {student.last_name}</div>
                                </div>
                                <span className={`badge bg-${getStatusBadge(student.status)}`}>
                                  {student.status || '-'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {getStudentsForSelection().length === 0 && (
                        <div className="col-12 text-center py-5">
                          <i className="bi bi-inbox display-1 text-muted"></i>
                          <h4 className="mt-3">ไม่พบข้อมูลนักเรียนในห้อง {selectedClassNumber}</h4>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
