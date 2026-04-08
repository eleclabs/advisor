'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ==================== CONSTANTS ====================
const SDQ_RISK_THRESHOLDS = {
  HIGH: 20,
  MEDIUM: 16,
  LOW: 11
} as const;

type RiskLevelType = 'low' | 'medium' | 'high' | 'critical';
type StatusType = 'ปกติ' | 'เสี่ยง' | 'มีปัญหา';

// ==================== INTERFACES ====================
interface Student {
  _id: string;
  id: string;
  name: string;
  level: string;
  class: string;
  status: StatusType;
  advisorName: string;
  sdq_score?: number;
  sdq_risk?: RiskLevelType;
  sdq_date?: string;
  dass21_score?: number;
  dass21_risk?: RiskLevelType;
  dass21_date?: string;
  riskLevel: RiskLevelType;
  hasHomeVisit: boolean;
  studentData?: {
    student_group: string;
    risk_behaviors: string[];
    family_status: string[];
    family_income: string;
    parent_concerns: string;
    home_behavior: string;
    chronic_disease: string;
    assistance_needs: string[];
    strengths: string;
    hobbies: string;
    living_with: string;
    housing_type: string;
    transportation: string[];
    parent_name: string;
    parent_phone: string;
    help_guidelines: string;
    economic_risk: boolean;
    family_instability: boolean;
    behavior_risk: boolean;
    health_risk: boolean;
    home_visit_files?: { name: string; url: string }[];
    gender?: string;
    birth_date?: string;
    weak_subjects?: string;
  };
}

interface StudentDetailModal {
  show: boolean;
  student: Student | null;
  loading: boolean;
}

// ==================== UTILITY FUNCTIONS ====================
function getRiskLevelFromSDQ(score: number): RiskLevelType {
  if (!score || score === 0) return 'low';
  if (score >= SDQ_RISK_THRESHOLDS.HIGH) return 'high';
  if (score >= SDQ_RISK_THRESHOLDS.MEDIUM) return 'medium';
  return 'low';
}

function getRiskLevelFromDASS21(dass21Data: any): RiskLevelType {
  if (!dass21Data) return 'low';
  
  const levels = [dass21Data.depressionLevel, dass21Data.anxietyLevel, dass21Data.stressLevel];
  
  if (levels.some(l => l === 'รุนแรงมาก' || l === 'รุนแรง')) return 'high';
  if (levels.some(l => l === 'ปานกลาง')) return 'medium';
  return 'low';
}

function getStatusFromRiskLevel(riskLevel: RiskLevelType): StatusType {
  if (riskLevel === 'high' || riskLevel === 'critical') return 'มีปัญหา';
  if (riskLevel === 'medium') return 'เสี่ยง';
  return 'ปกติ';
}

function getRiskBadgeColor(riskLevel: RiskLevelType): string {
  switch(riskLevel) {
    case 'high': return 'danger';
    case 'critical': return 'dark';
    case 'medium': return 'warning';
    default: return 'success';
  }
}

function getRiskThaiText(riskLevel: RiskLevelType): string {
  switch(riskLevel) {
    case 'high': return 'สูง';
    case 'critical': return 'วิกฤต';
    case 'medium': return 'ปานกลาง';
    default: return 'ต่ำ';
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH');
  } catch {
    return '-';
  }
}

export default function StudentAnalyticsDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ทั้งหมด");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>("ทั้งหมด");
  const [selectedRiskBehaviorFilter, setSelectedRiskBehaviorFilter] = useState<string>("ทั้งหมด");
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<string>("ทั้งหมด");
  const [selectedEconomicFilter, setSelectedEconomicFilter] = useState<string>("ทั้งหมด");
  const [selectedHomeVisitFilter, setSelectedHomeVisitFilter] = useState<string>("ทั้งหมด");
  
  // Modal state
  const [modal, setModal] = useState<StudentDetailModal>({
    show: false,
    student: null,
    loading: false
  });

  const teacher_name = "อาจารย์วิมลรัตน์ ใจดี";
  const academic_year = "2568";

  // Fetch all student data
  const fetchAllStudentData = async () => {
    try {
      setLoading(true);
      
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      
      if (!sessionData?.user?.id) {
        console.error('No user session found');
        setLoading(false);
        return;
      }
      
      const assignedRes = await fetch(`/api/user/${sessionData.user.id}/assign-students`);
      const assignedData = await assignedRes.json();
      
      if (!assignedData.success || assignedData.data.length === 0) {
        setStudents([]);
        setFilteredStudents([]);
        setLoading(false);
        if (sessionData.user.role === 'TEACHER') {
          alert('คุณยังไม่มีนักเรียนที่ถูกมอบหมาย กรุณาติดต่อ Admin');
          router.push('/dashboard');
        }
        return;
      }
      
      const assignedStudentIds = assignedData.data.map((a: any) => 
        a.student_id?._id || a.student_id
      );
      
      const studentRes = await fetch('/api/student');
      const studentData = await studentRes.json();
      
      if (!studentData.success) {
        setLoading(false);
        return;
      }
      
      const assignedStudents = studentData.data.filter((student: any) => 
        assignedStudentIds.includes(student._id)
      );
      
      const studentsWithData: Student[] = await Promise.all(
        assignedStudents.map(async (student: any) => {
          let sdqScore = 0;
          let sdqRisk: RiskLevelType = 'low';
          let sdqDate = '';
          let dass21Score = 0;
          let dass21Risk: RiskLevelType = 'low';
          let dass21Date = '';
          
          // Fetch SDQ
          try {
            const sdqRes = await fetch(`/api/assessment/sdq/student/${student._id}`);
            const sdqResult = await sdqRes.json();
            if (sdqResult.success && sdqResult.data && sdqResult.data.length > 0) {
              const latestSDQ = sdqResult.data[0];
              sdqScore = latestSDQ.totalScore || 0;
              sdqRisk = getRiskLevelFromSDQ(sdqScore);
              sdqDate = latestSDQ.submittedAt;
            }
          } catch (error) {
            console.error(`Error fetching SDQ:`, error);
          }
          
          // Fetch DASS-21
          try {
            const dass21Res = await fetch(`/api/assessment/dass21/student/${student._id}`);
            const dass21Result = await dass21Res.json();
            if (dass21Result.success && dass21Result.data && dass21Result.data.length > 0) {
              const latestDASS21 = dass21Result.data[0];
              dass21Score = latestDASS21.totalScore || 0;
              dass21Risk = getRiskLevelFromDASS21(latestDASS21);
              dass21Date = latestDASS21.submittedAt;
            }
          } catch (error) {
            console.error(`Error fetching DASS-21:`, error);
          }
          
          // Calculate final risk level
          const riskPriority: Record<RiskLevelType, number> = { critical: 4, high: 3, medium: 2, low: 1 };
          let finalRiskLevel: RiskLevelType = riskPriority[sdqRisk] >= riskPriority[dass21Risk] ? sdqRisk : dass21Risk;
          
          // Check from student_group
          if (student.student_group === 'สาขาวิชามีปัญหา') finalRiskLevel = 'high';
          else if (student.student_group === 'สาขาวิชาเสี่ยง') finalRiskLevel = 'medium';
          
          // Check for home visit
          const hasHomeVisit = !!(student.home_visit_files && student.home_visit_files.length > 0);
          
          // Calculate economic risk
          const economic_risk = student.family_income && parseInt(student.family_income) < 10000;
          
          // Calculate family instability
          const family_instability = student.family_status && (
            student.family_status.includes('แยกกันอยู่') || 
            student.family_status.includes('เสียชีวิต') ||
            student.family_status.includes('หย่าร้าง')
          );
          
          // Calculate behavior risk
          const behavior_risk = student.risk_behaviors && student.risk_behaviors.length > 0;
          
          const status = getStatusFromRiskLevel(finalRiskLevel);
          
          return {
            _id: student._id,
            id: student.id || student._id,
            name: `${student.prefix || ''}${student.first_name || ''} ${student.last_name || ''}`.trim(),
            level: student.level || '-',
            class: student.class_group || '-',
            status: status,
            advisorName: student.advisor_name || teacher_name,
            sdq_score: sdqScore,
            sdq_risk: sdqRisk,
            sdq_date: sdqDate,
            dass21_score: dass21Score,
            dass21_risk: dass21Risk,
            dass21_date: dass21Date,
            riskLevel: finalRiskLevel,
            hasHomeVisit: hasHomeVisit,
            studentData: {
              student_group: student.student_group || 'ไม่ระบุ',
              risk_behaviors: student.risk_behaviors || [],
              family_status: student.family_status || [],
              family_income: student.family_income || 'ไม่ระบุ',
              parent_concerns: student.parent_concerns || 'ไม่พบ',
              home_behavior: student.home_behavior || 'ไม่ระบุ',
              chronic_disease: student.chronic_disease || 'ไม่พบ',
              assistance_needs: student.assistance_needs || [],
              strengths: student.strengths || 'ไม่ระบุ',
              hobbies: student.hobbies || 'ไม่ระบุ',
              living_with: student.living_with || 'ไม่ระบุ',
              housing_type: student.housing_type || 'ไม่ระบุ',
              transportation: student.transportation || [],
              parent_name: student.parent_name || 'ไม่ระบุ',
              parent_phone: student.parent_phone || 'ไม่ระบุ',
              help_guidelines: student.help_guidelines || 'ไม่ระบุ',
              home_visit_files: student.home_visit_files || [],
              economic_risk: economic_risk,
              family_instability: family_instability,
              behavior_risk: behavior_risk,
              health_risk: student.chronic_disease && student.chronic_disease !== 'ไม่พบ',
              gender: student.gender || 'ไม่ระบุ',
              birth_date: student.birth_date || 'ไม่ระบุ',
              weak_subjects: student.weak_subjects || 'ไม่ระบุ'
            }
          };
        })
      );
      
      setStudents(studentsWithData);
      setFilteredStudents(studentsWithData);
      
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show student detail modal
  const showStudentDetail = (student: Student) => {
    setModal({ show: true, student: student, loading: false });
  };

  // Close modal
  const closeModal = () => {
    setModal({ show: false, student: null, loading: false });
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...students];
    
    // Filter by status
    if (selectedStatusFilter !== "ทั้งหมด") {
      filtered = filtered.filter(student => student.status === selectedStatusFilter);
    }
    
    // Filter by risk level
    if (selectedRiskFilter !== "ทั้งหมด") {
      filtered = filtered.filter(student => student.riskLevel === selectedRiskFilter);
    }
    
    // Filter by risk behavior
    if (selectedRiskBehaviorFilter !== "ทั้งหมด") {
      const hasBehavior = selectedRiskBehaviorFilter === "มีพฤติกรรมเสี่ยง";
      filtered = filtered.filter(student => {
        const hasRiskBehaviors = student.studentData?.risk_behaviors && student.studentData.risk_behaviors.length > 0;
        return hasBehavior ? hasRiskBehaviors : !hasRiskBehaviors;
      });
    }
    
    // Filter by family issue
    if (selectedFamilyFilter !== "ทั้งหมด") {
      const hasIssue = selectedFamilyFilter === "มีปัญหาครอบครัว";
      filtered = filtered.filter(student => {
        return hasIssue ? student.studentData?.family_instability : !student.studentData?.family_instability;
      });
    }
    
    // Filter by economic issue
    if (selectedEconomicFilter !== "ทั้งหมด") {
      const isLowIncome = selectedEconomicFilter === "รายได้น้อย";
      filtered = filtered.filter(student => {
        return isLowIncome ? student.studentData?.economic_risk : !student.studentData?.economic_risk;
      });
    }
    
    // Filter by home visit
    if (selectedHomeVisitFilter !== "ทั้งหมด") {
      const hasVisited = selectedHomeVisitFilter === "เยี่ยมบ้านแล้ว";
      filtered = filtered.filter(student => {
        return hasVisited ? student.hasHomeVisit : !student.hasHomeVisit;
      });
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(term) ||
        student.id.toLowerCase().includes(term)
      );
    }
    
    setFilteredStudents(filtered);
  }, [students, selectedStatusFilter, selectedRiskFilter, selectedRiskBehaviorFilter, selectedFamilyFilter, selectedEconomicFilter, selectedHomeVisitFilter, searchTerm]);

  useEffect(() => {
    fetchAllStudentData();
  }, []);

  const stats = {
    total: students.length,
    normal: students.filter(s => s.status === "ปกติ").length,
    risk: students.filter(s => s.status === "เสี่ยง").length,
    problem: students.filter(s => s.status === "มีปัญหา").length,
    riskHigh: students.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length,
    riskMedium: students.filter(s => s.riskLevel === 'medium').length,
    riskLow: students.filter(s => s.riskLevel === 'low').length,
    withSDQ: students.filter(s => s.sdq_score && s.sdq_score > 0).length,
    withDASS21: students.filter(s => s.dass21_score && s.dass21_score > 0).length,
    withRiskBehavior: students.filter(s => s.studentData?.risk_behaviors && s.studentData.risk_behaviors.length > 0).length,
    withFamilyIssue: students.filter(s => s.studentData?.family_instability).length,
    withEconomicIssue: students.filter(s => s.studentData?.economic_risk).length,
    withHomeVisit: students.filter(s => s.hasHomeVisit).length,
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3 text-muted">กำลังดึงข้อมูลนักเรียนจากระบบ...</p>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-info">
          <h5><i className="bi bi-info-circle-fill me-2"></i>ไม่พบนักเรียนในความดูแล</h5>
          <p>คุณยังไม่มีนักเรียนที่ถูกมอบหมายให้ดูแล</p>
          <Link href="/student/student_filter" className="btn btn-primary">
            <i className="bi bi-person-plus me-1"></i>เลือกนักเรียนในความดูแล
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="mb-1 fw-bold">
            <i className="bi bi-filter me-2 text-warning"></i>
            นักเรียนในความดูแล
          </h2>
        </div>
        <Link href="/student" className="btn btn-outline-secondary">
          <i className="bi bi-people me-1"></i>จัดการนักเรียน
        </Link>
      </div>

      {/* Main Statistics Cards */}
      <div className="row mb-4 g-3">
        <div className="col-md-3">
          <div className="card bg-primary text-white border-0 shadow-sm">
            <div className="card-body">
              <h6 className="card-title opacity-75">ทั้งหมด</h6>
              <h3 className="mb-0 fw-bold">{stats.total}</h3>
              <small>นักเรียนในความดูแล</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white border-0 shadow-sm">
            <div className="card-body">
              <h6 className="card-title opacity-75">ปกติ</h6>
              <h3 className="mb-0 fw-bold">{stats.normal}</h3>
              <small>นักเรียน</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white border-0 shadow-sm">
            <div className="card-body">
              <h6 className="card-title opacity-75">เสี่ยง</h6>
              <h3 className="mb-0 fw-bold">{stats.risk}</h3>
              <small>นักเรียน</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white border-0 shadow-sm">
            <div className="card-body">
              <h6 className="card-title opacity-75">มีปัญหา</h6>
              <h3 className="mb-0 fw-bold">{stats.problem}</h3>
              <small>นักเรียน</small>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors Statistics */}
      <div className="row mb-4 g-3">
        <div className="col-md-3">
          <div className="card border-danger">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1 text-danger">พฤติกรรมเสี่ยง</h6>
                <span className="h4 mb-0 fw-bold text-danger">{stats.withRiskBehavior}</span>
                <span className="text-muted ms-2">/{stats.total} คน</span>
              </div>
              <i className="bi bi-exclamation-triangle fs-1 text-danger opacity-50"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-warning">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1 text-warning">ปัญหาครอบครัว</h6>
                <span className="h4 mb-0 fw-bold text-warning">{stats.withFamilyIssue}</span>
                <span className="text-muted ms-2">/{stats.total} คน</span>
              </div>
              <i className="bi bi-house-heart fs-1 text-warning opacity-50"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-success">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1 text-success">เศรษฐกิจรายได้น้อย</h6>
                <span className="h4 mb-0 fw-bold text-success">{stats.withEconomicIssue}</span>
                <span className="text-muted ms-2">/{stats.total} คน</span>
              </div>
              <i className="bi bi-cash-stack fs-1 text-success opacity-50"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-info">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1 text-info">เยี่ยมบ้านแล้ว</h6>
                <span className="h4 mb-0 fw-bold text-info">{stats.withHomeVisit}</span>
                <span className="text-muted ms-2">/{stats.total} คน</span>
              </div>
              <i className="bi bi-house-door fs-1 text-info opacity-50"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Summary */}
      <div className="row mb-4 g-3">
        <div className="col-md-6">
          <div className="card border-info">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1 text-info">แบบประเมิน SDQ</h6>
                <span className="h4 mb-0 fw-bold">{stats.withSDQ}</span>
                <span className="text-muted ms-2">/{stats.total} คน</span>
              </div>
              <i className="bi bi-clipboard-data fs-1 text-info opacity-50"></i>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-warning">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1 text-warning">แบบประเมิน DASS-21</h6>
                <span className="h4 mb-0 fw-bold">{stats.withDASS21}</span>
                <span className="text-muted ms-2">/{stats.total} คน</span>
              </div>
              <i className="bi bi-graph-up fs-1 text-warning opacity-50"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold small text-uppercase">ค้นหา</label>
              <input
                type="text"
                className="form-control"
                placeholder="ชื่อหรือรหัสนักเรียน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold small text-uppercase">สถานะ</label>
              <select className="form-select" value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value)}>
                <option value="ทั้งหมด">ทั้งหมด ({stats.total})</option>
                <option value="ปกติ">ปกติ ({stats.normal})</option>
                <option value="เสี่ยง">เสี่ยง ({stats.risk})</option>
                <option value="มีปัญหา">มีปัญหา ({stats.problem})</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold small text-uppercase">ความเสี่ยง</label>
              <select className="form-select" value={selectedRiskFilter} onChange={(e) => setSelectedRiskFilter(e.target.value)}>
                <option value="ทั้งหมด">ทั้งหมด</option>
                <option value="high">สูง ({stats.riskHigh})</option>
                <option value="medium">ปานกลาง ({stats.riskMedium})</option>
                <option value="low">ต่ำ ({stats.riskLow})</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold small text-uppercase">พฤติกรรมเสี่ยง</label>
              <select className="form-select" value={selectedRiskBehaviorFilter} onChange={(e) => setSelectedRiskBehaviorFilter(e.target.value)}>
                <option value="ทั้งหมด">ทั้งหมด</option>
                <option value="มีพฤติกรรมเสี่ยง">มีพฤติกรรมเสี่ยง ({stats.withRiskBehavior})</option>
                <option value="ไม่มีพฤติกรรมเสี่ยง">ไม่มี ({stats.total - stats.withRiskBehavior})</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold small text-uppercase">ตัวกรองด่วน</label>
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-outline-danger btn-sm" onClick={() => {
                  setSelectedRiskFilter("high");
                  setSelectedStatusFilter("ทั้งหมด");
                }}>
                  <i className="bi bi-exclamation-triangle me-1"></i>เสี่ยงสูง
                </button>
                <button className="btn btn-outline-warning btn-sm" onClick={() => {
                  setSelectedRiskBehaviorFilter("มีพฤติกรรมเสี่ยง");
                }}>
                  <i className="bi bi-lightning me-1"></i>พฤติกรรมเสี่ยง
                </button>
                <button className="btn btn-outline-info btn-sm" onClick={() => {
                  setSelectedFamilyFilter("มีปัญหาครอบครัว");
                }}>
                  <i className="bi bi-house-heart me-1"></i>ปัญหาครอบครัว
                </button>
                <button className="btn btn-outline-success btn-sm" onClick={() => {
                  setSelectedEconomicFilter("รายได้น้อย");
                }}>
                  <i className="bi bi-cash-stack me-1"></i>รายได้น้อย
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => {
                  setSelectedStatusFilter("ทั้งหมด");
                  setSelectedRiskFilter("ทั้งหมด");
                  setSelectedRiskBehaviorFilter("ทั้งหมด");
                  setSelectedFamilyFilter("ทั้งหมด");
                  setSelectedEconomicFilter("ทั้งหมด");
                  setSelectedHomeVisitFilter("ทั้งหมด");
                  setSearchTerm("");
                }}>
                  <i className="bi bi-arrow-repeat me-1"></i>รีเซ็ต
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h6 className="mb-0 fw-semibold">
            <i className="bi bi-people-fill me-2 text-warning"></i>
            รายชื่อนักเรียน ({filteredStudents.length} คน)
          </h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>รหัส</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>ชั้น/สาขา</th>
                  <th>สถานะ</th>
                  <th>ความเสี่ยง</th>
                  <th>SDQ</th>
                  <th>DASS-21</th>
                  <th>พฤติกรรมเสี่ยง</th>
                  <th>ครอบครัว</th>
                  <th>เศรษฐกิจ</th>
                  <th>เยี่ยมบ้าน</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td className="align-middle">{student.id}</td>
                    <td className="align-middle">
                      <div className="fw-semibold">{student.name}</div>
                    </td>
                    <td className="align-middle">
                      {student.level}/{student.class}
                    </td>
                    <td className="align-middle">
                      <span className={`badge bg-${student.status === 'มีปัญหา' ? 'danger' : student.status === 'เสี่ยง' ? 'warning' : 'success'} rounded-pill px-3`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="align-middle">
                      <span className={`badge bg-${getRiskBadgeColor(student.riskLevel)} rounded-pill px-3`}>
                        {getRiskThaiText(student.riskLevel)}
                      </span>
                    </td>
                    
                    {/* SDQ Column */}
                    <td className="align-middle">
                      {student.sdq_score && student.sdq_score > 0 ? (
                        <div>
                          <span className={`fw-bold ${student.sdq_score >= 20 ? 'text-danger' : student.sdq_score >= 16 ? 'text-warning' : 'text-success'}`}>
                            {student.sdq_score}/40
                          </span>
                          <br />
                          <small className="text-muted">{formatDate(student.sdq_date || '')}</small>
                        </div>
                      ) : (
                        <span className="text-muted">
                          <i className="bi bi-dash-circle me-1"></i>ยังไม่ประเมิน
                        </span>
                      )}
                    </td>
                    
                    {/* DASS-21 Column */}
                    <td className="align-middle">
                      {student.dass21_score && student.dass21_score > 0 ? (
                        <div>
                          <span className="fw-bold">{student.dass21_score}/126</span>
                          <br />
                          <small className="text-muted">{formatDate(student.dass21_date || '')}</small>
                        </div>
                      ) : (
                        <span className="text-muted">
                          <i className="bi bi-dash-circle me-1"></i>ยังไม่ประเมิน
                        </span>
                      )}
                    </td>
                    
                    {/* Risk Behavior Column */}
                    <td className="align-middle">
                      {student.studentData?.risk_behaviors && student.studentData.risk_behaviors.length > 0 ? (
                        <span className="badge bg-danger" title={student.studentData.risk_behaviors.join(', ')}>{student.studentData.risk_behaviors.slice(0, 1).join(', ')}{student.studentData.risk_behaviors.length > 1 && ` +${student.studentData.risk_behaviors.length - 1}`}</span>
                      ) : (
                        <span className="badge bg-secondary">ไม่พบ</span>
                      )}
                    </td>
                    
                    {/* Family Column */}
                    <td className="align-middle">
                      {student.studentData?.family_instability ? (
                        <span className="badge bg-warning" title={student.studentData.family_status?.join(', ')}>
                          มีปัญหา
                        </span>
                      ) : (
                        <span className="badge bg-secondary">ไม่พบ</span>
                      )}
                    </td>
                    
                    {/* Economic Column */}
                    <td className="align-middle">
                      {student.studentData?.economic_risk ? (
                        <span className="badge bg-success">รายได้น้อย</span>
                      ) : (
                        <span className="badge bg-secondary">ไม่พบ</span>
                      )}
                    </td>
                    
                    {/* Home Visit Column */}
                    <td className="align-middle">
                      {student.hasHomeVisit ? (
                        <span className="badge bg-info">✅ เยี่ยมแล้ว</span>
                      ) : (
                        <span className="badge bg-secondary">⏳ ยังไม่เยี่ยม</span>
                      )}
                    </td>
                    
                    <td className="align-middle">
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => showStudentDetail(student)}
                          title="ดูรายละเอียด"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <Link 
                          href={`/student/student_detail/${student._id}/assessment/sdq/results`}
                          className="btn btn-outline-info"
                          title="ผล SDQ"
                        >
                          <i className="bi bi-clipboard-data"></i>
                        </Link>
                        <Link 
                          href={`/student/student_detail/${student._id}/assessment/dass21/results`}
                          className="btn btn-outline-warning"
                          title="ผล DASS-21"
                        >
                          <i className="bi bi-graph-up"></i>
                        </Link>
                        <Link 
                          href={`/student/student_detail/${student._id}/interview`}
                          className="btn btn-outline-success"
                          title="ข้อมูลสัมภาษณ์"
                        >
                          <i className="bi bi-person-lines-fill"></i>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      {modal.show && modal.student && (
        <>
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-person-badge me-2"></i>
                    ข้อมูลนักเรียน: {modal.student.name}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  {/* Basic Info */}
                  <div className="card mb-3 border-0 shadow-sm">
                    <div className="card-header bg-light">
                      <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-info-circle me-2 text-primary"></i>
                        ข้อมูลทั่วไป
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <table className="table table-sm table-borderless">
                            <tbody>
                              <tr><td className="fw-semibold">รหัสนักเรียน:</td><td>{modal.student.id}</td></tr>
                              <tr><td className="fw-semibold">ชื่อ-นามสกุล:</td><td>{modal.student.name}</td></tr>
                              <tr><td className="fw-semibold">เพศ:</td><td>{modal.student.studentData?.gender || 'ไม่ระบุ'}</td></tr>
                              <tr><td className="fw-semibold">วันเกิด:</td><td>{modal.student.studentData?.birth_date || 'ไม่ระบุ'}</td></tr>
                              <tr><td className="fw-semibold">ระดับชั้น:</td><td>{modal.student.level}</td></tr>
                              <tr><td className="fw-semibold">สาขาวิชา:</td><td>{modal.student.class}</td></tr>
                              <tr><td className="fw-semibold">ครูที่ปรึกษา:</td><td>{modal.student.advisorName}</td></tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="col-md-6">
                          <table className="table table-sm table-borderless">
                            <tbody>
                              <tr><td className="fw-semibold">สาขาวิชานักเรียน:</td><td>{modal.student.studentData?.student_group || 'ไม่ระบุ'}</td></tr>
                              <tr><td className="fw-semibold">สถานะ:</td><td><span className={`badge bg-${modal.student.status === 'มีปัญหา' ? 'danger' : modal.student.status === 'เสี่ยง' ? 'warning' : 'success'}`}>{modal.student.status}</span></td></tr>
                              <tr><td className="fw-semibold">ระดับความเสี่ยง:</td><td><span className={`badge bg-${getRiskBadgeColor(modal.student.riskLevel)}`}>{getRiskThaiText(modal.student.riskLevel)}</span></td></tr>
                              <tr><td className="fw-semibold">การเยี่ยมบ้าน:</td><td>{modal.student.hasHomeVisit ? '✅ เยี่ยมบ้านแล้ว' : '⏳ ยังไม่เยี่ยมบ้าน'}</td></tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assessment Results */}
                  <div className="card mb-3 border-0 shadow-sm">
                    <div className="card-header bg-light">
                      <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-clipboard-data me-2 text-info"></i>
                        ผลการประเมิน
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="border rounded p-3">
                            <h6 className="fw-semibold text-info">SDQ</h6>
                            {modal.student.sdq_score && modal.student.sdq_score > 0 ? (
                              <>
                                <div className="progress mb-2" style={{ height: '25px' }}>
                                  <div className={`progress-bar bg-${modal.student.sdq_score >= 20 ? 'danger' : modal.student.sdq_score >= 16 ? 'warning' : 'success'}`} 
                                       style={{ width: `${(modal.student.sdq_score / 40) * 100}%` }}>
                                    {modal.student.sdq_score}/40
                                  </div>
                                </div>
                                <p className="mb-1">ระดับความเสี่ยง: <span className={`badge bg-${getRiskBadgeColor(modal.student.sdq_risk || 'low')}`}>{getRiskThaiText(modal.student.sdq_risk || 'low')}</span></p>
                                <small className="text-muted">ประเมินล่าสุด: {formatDate(modal.student.sdq_date || '')}</small>
                              </>
                            ) : (
                              <p className="text-muted mb-0">ยังไม่มีการประเมิน SDQ</p>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="border rounded p-3">
                            <h6 className="fw-semibold text-warning">DASS-21</h6>
                            {modal.student.dass21_score && modal.student.dass21_score > 0 ? (
                              <>
                                <div className="progress mb-2" style={{ height: '25px' }}>
                                  <div className={`progress-bar bg-${modal.student.dass21_score >= 60 ? 'danger' : modal.student.dass21_score >= 40 ? 'warning' : 'success'}`} 
                                       style={{ width: `${(modal.student.dass21_score / 126) * 100}%` }}>
                                    {modal.student.dass21_score}/126
                                  </div>
                                </div>
                                <p className="mb-1">ระดับความเสี่ยง: <span className={`badge bg-${getRiskBadgeColor(modal.student.dass21_risk || 'low')}`}>{getRiskThaiText(modal.student.dass21_risk || 'low')}</span></p>
                                <small className="text-muted">ประเมินล่าสุด: {formatDate(modal.student.dass21_date || '')}</small>
                              </>
                            ) : (
                              <p className="text-muted mb-0">ยังไม่มีการประเมิน DASS-21</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors Detail */}
                  <div className="card mb-3 border-0 shadow-sm">
                    <div className="card-header bg-light">
                      <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-exclamation-triangle me-2 text-danger"></i>
                        ปัจจัยเสี่ยง
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <table className="table table-sm">
                            <tbody>
                              <tr><td className="fw-semibold">พฤติกรรมเสี่ยง:</td><td>{modal.student.studentData?.risk_behaviors && modal.student.studentData.risk_behaviors.length > 0 ? <span className="badge bg-danger">{modal.student.studentData.risk_behaviors.join(', ')}</span> : 'ไม่พบ'}</td></tr>
                              <tr><td className="fw-semibold">พฤติกรรมที่บ้าน:</td><td>{modal.student.studentData?.home_behavior || 'ไม่ระบุ'}</td></tr>
                              <tr><td className="fw-semibold">โรคประจำตัว:</td><td>{modal.student.studentData?.chronic_disease || 'ไม่พบ'}</td></tr>
                              <tr><td className="fw-semibold">ความกังวลผู้ปกครอง:</td><td>{modal.student.studentData?.parent_concerns || 'ไม่พบ'}</td></tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="col-md-6">
                          <table className="table table-sm">
                            <tbody>
                              <tr><td className="fw-semibold">สถานภาพครอบครัว:</td><td>{modal.student.studentData?.family_status && modal.student.studentData.family_status.length > 0 ? <span className={`badge ${modal.student.studentData.family_instability ? 'bg-warning' : 'bg-secondary'}`}>{modal.student.studentData.family_status.join(', ')}</span> : 'ไม่พบ'}</td></tr>
                              <tr><td className="fw-semibold">อาศัยอยู่กับ:</td><td>{modal.student.studentData?.living_with || 'ไม่ระบุ'}</td></tr>
                              <tr><td className="fw-semibold">รายได้ครอบครัว:</td><td>{modal.student.studentData?.family_income || 'ไม่ระบุ'} บาท/เดือน {modal.student.studentData?.economic_risk && <span className="badge bg-success ms-2">รายได้น้อย</span>}</td></tr>
                              <tr><td className="fw-semibold">ความต้องการช่วยเหลือ:</td><td>{modal.student.studentData?.assistance_needs && modal.student.studentData.assistance_needs.length > 0 ? <span className="badge bg-info">{modal.student.studentData.assistance_needs.join(', ')}</span> : 'ไม่พบ'}</td></tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strengths and Recommendations */}
                  <div className="card mb-3 border-0 shadow-sm">
                    <div className="card-header bg-light">
                      <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-star me-2 text-warning"></i>
                        จุดแข็งและแนวทางช่วยเหลือ
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <p className="fw-semibold mb-1">จุดแข็ง / วิชาที่ชอบ:</p>
                          <p>{modal.student.studentData?.strengths || 'ไม่ระบุ'}</p>
                          <p className="fw-semibold mb-1">งานอดิเรก:</p>
                          <p>{modal.student.studentData?.hobbies || 'ไม่ระบุ'}</p>
                        </div>
                        <div className="col-md-6">
                          <p className="fw-semibold mb-1">วิชาที่อ่อน / ปัญหาการเรียน:</p>
                          <p>{modal.student.studentData?.weak_subjects || 'ไม่ระบุ'}</p>
                          <p className="fw-semibold mb-1">แนวทางการช่วยเหลือ:</p>
                          <p>{modal.student.studentData?.help_guidelines || 'ไม่ระบุ'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>ปิด</button>
                  <Link href={`/student/student_detail/${modal.student._id}`} className="btn btn-primary">
                    <i className="bi bi-box-arrow-up-right me-1"></i>ดูข้อมูลเต็ม
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}