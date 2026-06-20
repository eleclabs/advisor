'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ==================== CONSTANTS ====================
const SDQ_RISK_THRESHOLDS = {
  HIGH: 20,
  MEDIUM: 16
} as const;

type RiskLevelType = 'low' | 'medium' | 'high' | 'critical';
type StatusType = 'ปกติ' | 'เสี่ยง' | 'มีปัญหา';

// ==================== INTERFACES ====================
interface Student {
  _id: string;
  id: string;
  name: string;
  level: string;
  department: string;
  room: string;
  status: StatusType;
  advisorName: string;
  sdq_score?: number;
  sdq_status?: string;
  sdq_status_text?: string;
  sdq_risk?: RiskLevelType;
  sdq_date?: string;
  sdq_emotional?: number;
  sdq_conduct?: number;
  sdq_hyperactivity?: number;
  sdq_peer?: number;
  dass21_score?: number;
  dass21_depression?: number;
  dass21_anxiety?: number;
  dass21_stress?: number;
  dass21_depression_status?: string;
  dass21_anxiety_status?: string;
  dass21_stress_status?: string;
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
function getSDQStatusFromScore(score: number): { status: string; color: string; text: string } {
  if (score === undefined || score === null) {
    return { status: 'ยังไม่ประเมิน', color: '#6c757d', text: 'ยังไม่ประเมิน' };
  }
  if (score >= 20) {
    return { status: 'high', color: '#dc3545', text: 'มีปัญหา' };
  }
  if (score >= 16) {
    return { status: 'medium', color: '#fd7e14', text: 'คาบเกี่ยว' };
  }
  return { status: 'normal', color: '#28a745', text: 'ปกติ' };
}

function getDASS21StatusFromScore(score: number, type: string): { status: string; color: string; text: string } {
  if (score === undefined || score === null) {
    return { status: 'unknown', color: '#6c757d', text: 'ยังไม่ประเมิน' };
  }
  
  // Depression thresholds (multiplied score from API) - Matches API thresholds
  if (type === 'depression') {
    if (score <= 9) return { status: 'normal', color: '#28a745', text: 'ปกติ' };
    if (score <= 13) return { status: 'mild', color: '#ffc107', text: 'เบา' };
    if (score <= 20) return { status: 'moderate', color: '#fd7e14', text: 'ปานกลาง' };
    if (score <= 27) return { status: 'severe', color: '#6f42c1', text: 'รุนแรง' };
    return { status: 'extremely_severe', color: '#dc3545', text: 'รุนแรงมาก' };
  }
  
  // Anxiety thresholds (multiplied score from API) - Matches API thresholds
  if (type === 'anxiety') {
    if (score <= 7) return { status: 'normal', color: '#28a745', text: 'ปกติ' };
    if (score <= 9) return { status: 'mild', color: '#ffc107', text: 'เบา' };
    if (score <= 14) return { status: 'moderate', color: '#fd7e14', text: 'ปานกลาง' };
    if (score <= 19) return { status: 'severe', color: '#6f42c1', text: 'รุนแรง' };
    return { status: 'extremely_severe', color: '#dc3545', text: 'รุนแรงมาก' };
  }
  
  // Stress thresholds (multiplied score from API) - Matches API thresholds
  if (type === 'stress') {
    if (score <= 14) return { status: 'normal', color: '#28a745', text: 'ปกติ' };
    if (score <= 18) return { status: 'mild', color: '#ffc107', text: 'เบา' };
    if (score <= 25) return { status: 'moderate', color: '#fd7e14', text: 'ปานกลาง' };
    if (score <= 33) return { status: 'severe', color: '#6f42c1', text: 'รุนแรง' };
    return { status: 'extremely_severe', color: '#dc3545', text: 'รุนแรงมาก' };
  }
  
  return { status: 'unknown', color: '#6c757d', text: 'ไม่ทราบ' };
}

function getSDQAspectStatus(score: number, aspect: string): { status: string; color: string; text: string } {
  if (score === undefined || score === null || score === 0) {
    return { status: 'unknown', color: '#6c757d', text: '-' };
  }
  
  // Emotional: 0-5 normal, 6 risk, 7-10 problem
  if (aspect === 'emotional') {
    if (score <= 5) return { status: 'normal', color: '#28a745', text: 'ปกติ' };
    if (score === 6) return { status: 'risk', color: '#ffc107', text: 'เสี่ยง' };
    return { status: 'problem', color: '#dc3545', text: 'มีปัญหา' };
  }
  
  // Conduct: 0-4 normal, 5 risk, 6-10 problem
  if (aspect === 'conduct') {
    if (score <= 4) return { status: 'normal', color: '#28a745', text: 'ปกติ' };
    if (score === 5) return { status: 'risk', color: '#ffc107', text: 'เสี่ยง' };
    return { status: 'problem', color: '#dc3545', text: 'มีปัญหา' };
  }
  
  // Hyperactivity: 0-5 normal, 6 risk, 7-10 problem
  if (aspect === 'hyperactivity') {
    if (score <= 5) return { status: 'normal', color: '#28a745', text: 'ปกติ' };
    if (score === 6) return { status: 'risk', color: '#ffc107', text: 'เสี่ยง' };
    return { status: 'problem', color: '#dc3545', text: 'มีปัญหา' };
  }
  
  // Peer: 0-3 normal, 4 risk, 5-10 problem
  if (aspect === 'peer') {
    if (score <= 3) return { status: 'normal', color: '#28a745', text: 'ปกติ' };
    if (score === 4) return { status: 'risk', color: '#ffc107', text: 'เสี่ยง' };
    return { status: 'problem', color: '#dc3545', text: 'มีปัญหา' };
  }
  
  return { status: 'unknown', color: '#6c757d', text: '-' };
}

// SDQ Aspect Calculation Functions
function calculateSDQEmotional(answers: any): number {
  const emotionalQuestions = ['sdq3', 'sdq8', 'sdq13', 'sdq16', 'sdq24'];
  return emotionalQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculateSDQConduct(answers: any): number {
  const conductQuestions = ['sdq5', 'sdq7', 'sdq12', 'sdq18', 'sdq22'];
  return conductQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculateSDQHyperactivity(answers: any): number {
  const hyperactivityQuestions = ['sdq2', 'sdq10', 'sdq15', 'sdq21', 'sdq25'];
  return hyperactivityQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculateSDQPeer(answers: any): number {
  const peerQuestions = ['sdq6', 'sdq11', 'sdq14', 'sdq19', 'sdq23'];
  return peerQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function parseClassGroup(classGroup: string): { department: string; room: string } {
  if (!classGroup) return { department: '-', room: '-' };
  const parts = classGroup.split('/');
  if (parts.length >= 2) {
    return { department: parts[0], room: parts[1] };
  }
  return { department: classGroup, room: '-' };
}

function getSDQTotalInterpretation(totalScore: number): { interpretation: string; color: string } {
  if (!totalScore || totalScore === 0) {
    return { interpretation: 'ยังไม่ประเมิน', color: '#6c757d' };
  }
  if (totalScore <= 15) return { interpretation: 'ปกติ', color: '#28a745' };
  if (totalScore <= 19) return { interpretation: 'คาบเกี่ยว', color: '#fd7e14' };
  return { interpretation: 'มีปัญหา', color: '#dc3545' };
}

function getRiskLevelFromSDQ(score: number): RiskLevelType {
  if (!score || score === 0) return 'low';
  if (score >= 20) return 'high';
  if (score >= 16) return 'medium';
  return 'low';
}

function getRiskLevelFromDASS21(dass21Data: any): RiskLevelType {
  if (!dass21Data) return 'low';
  
  // API returns data directly with depressionLevel, anxietyLevel, stressLevel
  const levels = [
    dass21Data.depressionLevel,
    dass21Data.anxietyLevel,
    dass21Data.stressLevel
  ];
  
  const validLevels = levels.filter(l => l);
  
  // Handle both Thai and English level strings
  if (validLevels.some(l => l === 'รุนแรงมาก' || l === 'รุนแรง' || l === 'Extremely Severe' || l === 'Severe')) return 'high';
  if (validLevels.some(l => l === 'ปานกลาง' || l === 'Moderate')) return 'medium';
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

  const teacher_name = "";

  // Fetch all student data
  const fetchAllStudentData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Starting fetchAllStudentData...');
      
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      
      console.log('📊 Session data:', sessionData);
      
      if (!sessionData?.user?.id) {
        console.error('❌ No user session found');
        setLoading(false);
        return;
      }
      
      const assignedRes = await fetch(`/api/user/${sessionData.user.id}/assign-students`);
      const assignedData = await assignedRes.json();
      
      console.log('📊 Assigned students data:', assignedData);
      
      if (!assignedData.success || assignedData.data.length === 0) {
        console.log('⚠️ No assigned students found or API failed');
        setStudents([]);
        setFilteredStudents([]);
        setLoading(false);
        if (sessionData.user.role === 'TEACHER') {
          alert('คุณยังไม่มีผู้เรียนที่ถูกมอบหมาย กรุณาติดต่อ Admin');
          router.push('/dashboard');
        }
        return;
      }
      
      const assignedStudentIds = assignedData.data.map((a: any) => 
        a.student_id?._id || a.student_id
      );
      
      console.log('📊 Assigned student IDs:', assignedStudentIds);
      
      const studentRes = await fetch('/api/student');
      const studentData = await studentRes.json();
      
      console.log('📊 All students data:', studentData);
      
      if (!studentData.success) {
        console.error('❌ Failed to fetch students');
        setLoading(false);
        return;
      }
      
      const assignedStudents = studentData.data.filter((student: any) => 
        assignedStudentIds.includes(student._id)
      );
      
      // Remove duplicates based on _id
      const uniqueStudents = assignedStudents.filter((student: any, index: number, self: any[]) => 
        index === self.findIndex((s: any) => s._id === student._id)
      );
      
      console.log('📊 Filtered assigned students:', uniqueStudents);
      
      const studentsWithData: Student[] = await Promise.all(
        uniqueStudents.map(async (student: any) => {
          let sdqScore = 0;
          let sdqStatus = '';
          let sdqStatusText = '';
          let sdqRisk: RiskLevelType = 'low';
          let sdqDate = '';
          let sdqEmotional = 0;
          let sdqConduct = 0;
          let sdqHyperactivity = 0;
          let sdqPeer = 0;
          let dass21Depression = 0;
          let dass21Anxiety = 0;
          let dass21Stress = 0;
          let dass21DepressionStatus = '';
          let dass21AnxietyStatus = '';
          let dass21StressStatus = '';
          let dass21TotalScore = 0;
          let dass21Risk: RiskLevelType = 'low';
          let dass21Date = '';
          
          console.log(`🔍 Processing student: ${student._id}`);
          
          // Fetch SDQ
          try {
            const sdqRes = await fetch(`/api/assessment/sdq/student/${student.id || student._id}`);
            const sdqResult = await sdqRes.json();
            console.log(`📊 SDQ data for ${student._id}:`, sdqResult);
            if (sdqResult.success && sdqResult.data && sdqResult.data.length > 0) {
              const latestSDQ = sdqResult.data[0];
              sdqScore = latestSDQ.totalScore || 0;
              const sdqStatusObj = getSDQStatusFromScore(sdqScore);
              sdqStatus = sdqStatusObj.status;
              sdqStatusText = sdqStatusObj.text;
              sdqRisk = getRiskLevelFromSDQ(sdqScore);
              sdqDate = latestSDQ.submittedAt;
              
              // Calculate SDQ 4 aspects
              if (latestSDQ.answers) {
                sdqEmotional = calculateSDQEmotional(latestSDQ.answers);
                sdqConduct = calculateSDQConduct(latestSDQ.answers);
                sdqHyperactivity = calculateSDQHyperactivity(latestSDQ.answers);
                sdqPeer = calculateSDQPeer(latestSDQ.answers);
              }
            } else {
              sdqStatusText = 'ยังไม่ประเมิน';
            }
          } catch (error) {
            console.error(`❌ Error fetching SDQ for ${student._id}:`, error);
            sdqStatusText = 'ยังไม่ประเมิน';
          }
          
          // Fetch DASS-21
          try {
            const dass21Res = await fetch(`/api/assessment/dass21/student/${student._id}`);
            const dass21Result = await dass21Res.json();
            console.log(`📊 DASS-21 data for ${student._id}:`, dass21Result);
            if (dass21Result.success && dass21Result.data && dass21Result.data.length > 0) {
              const latestDASS21 = dass21Result.data[0];
              
              // API returns data directly with depressionScore, anxietyScore, stressScore
              dass21Depression = latestDASS21.depressionScore || 0;
              dass21Anxiety = latestDASS21.anxietyScore || 0;
              dass21Stress = latestDASS21.stressScore || 0;
              dass21DepressionStatus = latestDASS21.depressionLevel || '';
              dass21AnxietyStatus = latestDASS21.anxietyLevel || '';
              dass21StressStatus = latestDASS21.stressLevel || '';
              
              dass21TotalScore = dass21Depression + dass21Anxiety + dass21Stress;
              dass21Risk = getRiskLevelFromDASS21(latestDASS21);
              dass21Date = latestDASS21.submittedAt;
              
              console.log(`✅ Parsed DASS-21 for ${student._id}:`, { 
                depression: dass21Depression, 
                anxiety: dass21Anxiety, 
                stress: dass21Stress,
                depressionLevel: dass21DepressionStatus,
                anxietyLevel: dass21AnxietyStatus,
                stressLevel: dass21StressStatus
              });
            }
          } catch (error) {
            console.error(`❌ Error fetching DASS-21 for ${student._id}:`, error);
          }
          
          // Calculate final risk level
          const riskPriority: Record<RiskLevelType, number> = { critical: 4, high: 3, medium: 2, low: 1 };
          let finalRiskLevel: RiskLevelType = riskPriority[sdqRisk] >= riskPriority[dass21Risk] ? sdqRisk : dass21Risk;
          
          if (student.student_group === 'สาขามีปัญหา') finalRiskLevel = 'high';
          else if (student.student_group === 'สาขาเสี่ยง') finalRiskLevel = 'medium';
          
          const hasHomeVisit = !!(student.home_visit_files && student.home_visit_files.length > 0);
          const economic_risk = student.family_income && parseInt(student.family_income) < 10000;
          const family_instability = student.family_status && (
            student.family_status.includes('แยกกันอยู่') || 
            student.family_status.includes('เสียชีวิต') ||
            student.family_status.includes('หย่าร้าง')
          );
          const behavior_risk = student.risk_behaviors && student.risk_behaviors.length > 0;
          const status = getStatusFromRiskLevel(finalRiskLevel);
          
          // Parse class_group into department and room
          const department = student.class_group || '-';
          const room = student.class_number || '-';
          return {
            _id: student._id,
            id: student.id || student._id,
            name: `${student.prefix || ''}${student.first_name || ''} ${student.last_name || ''}`.trim(),
            level: student.level || '-',
            department: department,
            room: room,
            status: status,
            advisorName: student.advisor_name || teacher_name,
            sdq_score: sdqScore,
            sdq_status: sdqStatus,
            sdq_status_text: sdqStatusText,
            sdq_risk: sdqRisk,
            sdq_date: sdqDate,
            sdq_emotional: sdqEmotional,
            sdq_conduct: sdqConduct,
            sdq_hyperactivity: sdqHyperactivity,
            sdq_peer: sdqPeer,
            dass21_score: dass21TotalScore,
            dass21_depression: dass21Depression,
            dass21_anxiety: dass21Anxiety,
            dass21_stress: dass21Stress,
            dass21_depression_status: dass21DepressionStatus,
            dass21_anxiety_status: dass21AnxietyStatus,
            dass21_stress_status: dass21StressStatus,
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
      
      console.log('✅ Final students with data:', studentsWithData);
      
      setStudents(studentsWithData);
      setFilteredStudents(studentsWithData);
      
    } catch (error) {
      console.error("❌ Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const showStudentDetail = (student: Student) => {
    setModal({ show: true, student: student, loading: false });
  };

  const closeModal = () => {
    setModal({ show: false, student: null, loading: false });
  };

  useEffect(() => {
    let filtered = [...students];
    
    if (selectedStatusFilter !== "ทั้งหมด") {
      filtered = filtered.filter(student => student.status === selectedStatusFilter);
    }
    
    if (selectedRiskFilter !== "ทั้งหมด") {
      filtered = filtered.filter(student => student.riskLevel === selectedRiskFilter);
    }
    
    if (selectedRiskBehaviorFilter !== "ทั้งหมด") {
      const hasBehavior = selectedRiskBehaviorFilter === "มีพฤติกรรมเสี่ยง";
      filtered = filtered.filter(student => {
        const hasRiskBehaviors = student.studentData?.risk_behaviors && student.studentData.risk_behaviors.length > 0;
        return hasBehavior ? hasRiskBehaviors : !hasRiskBehaviors;
      });
    }
    
    if (selectedFamilyFilter !== "ทั้งหมด") {
      const hasIssue = selectedFamilyFilter === "มีปัญหาครอบครัว";
      filtered = filtered.filter(student => {
        return hasIssue ? student.studentData?.family_instability : !student.studentData?.family_instability;
      });
    }
    
    if (selectedEconomicFilter !== "ทั้งหมด") {
      const isLowIncome = selectedEconomicFilter === "รายได้น้อย";
      filtered = filtered.filter(student => {
        return isLowIncome ? student.studentData?.economic_risk : !student.studentData?.economic_risk;
      });
    }
    
    if (selectedHomeVisitFilter !== "ทั้งหมด") {
      const hasVisited = selectedHomeVisitFilter === "เยี่ยมบ้านแล้ว";
      filtered = filtered.filter(student => {
        return hasVisited ? student.hasHomeVisit : !student.hasHomeVisit;
      });
    }
    
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
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-3 text-muted">กำลังดึงข้อมูลผู้เรียนจากระบบ...</p>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-info">
          <h5><i className="bi bi-info-circle-fill me-2"></i>ไม่พบผู้เรียนในความดูแล</h5>
          <p>คุณยังไม่มีผู้เรียนที่ถูกมอบหมายให้ดูแล</p>
          <Link href="/student/student_filter" className="btn btn-primary">
            <i className="bi bi-person-plus me-1"></i>เลือกผู้เรียนในความดูแล
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
            ผู้เรียนในความดูแล (การคัดกรองผู้เรียน)
          </h2>
        </div>
        <Link href="/student" className="btn btn-outline-secondary">
          <i className="bi bi-people me-1"></i>จัดการผู้เรียน
        </Link>
      </div>

      {/* Filter Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label fw-semibold small text-uppercase">ค้นหา</label>
              <input
                type="text"
                className="form-control"
                placeholder="ชื่อหรือรหัส..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold small text-uppercase">สถานะ</label>
              <select className="form-select" value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value)}>
                <option value="ทั้งหมด">ทั้งหมด ({stats.total})</option>
                <option value="ปกติ">ปกติ ({stats.normal})</option>
                <option value="เสี่ยง">เสี่ยง ({stats.risk})</option>
                <option value="มีปัญหา">มีปัญหา ({stats.problem})</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h6 className="mb-0 fw-semibold">
            <i className="bi bi-people-fill me-2 text-warning"></i>
            รายชื่อผู้เรียน ({filteredStudents.length} คน)
          </h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>รหัส</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>ระดับชั้น</th>
                  <th>สาขา</th>
                  <th>ห้อง</th>
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
                {filteredStudents.map((student) => {
                  const sdqStatusColor = student.sdq_score && student.sdq_score > 0 ? 
                    (student.sdq_score >= 20 ? '#dc3545' : student.sdq_score >= 16 ? '#fd7e14' : '#28a745') : '#6c757d';
                  const sdqStatusText = student.sdq_score && student.sdq_score > 0 ?
                    (student.sdq_score >= 20 ? 'มีปัญหา' : student.sdq_score >= 16 ? 'คาบเกี่ยว' : 'ปกติ') : 'ยังไม่ประเมิน';
                  
                  return (
                    <tr key={student._id}>
                      <td className="align-middle">{student.id}</td>
                      <td className="align-middle">
                        <div className="fw-semibold">{student.name}</div>
                      </td>
                      <td className="align-middle">
                        {student.level}
                      </td>
                      <td className="align-middle">
                        {student.department}
                      </td>
                      <td className="align-middle">
                        {student.room}
                      </td>
                      
                      {/* SDQ Column - Show total score with interpretation only */}
                      <td className="align-middle">
                        {student.sdq_emotional !== undefined && student.sdq_emotional !== null &&
                         student.sdq_conduct !== undefined && student.sdq_conduct !== null &&
                         student.sdq_hyperactivity !== undefined && student.sdq_hyperactivity !== null &&
                         student.sdq_peer !== undefined && student.sdq_peer !== null ? (
                          <div>
                            {/* Total score with interpretation badge */}
                            <div>
                              
                              <span className="badge ms-2" style={{ 
                                backgroundColor: getSDQTotalInterpretation(student.sdq_emotional + student.sdq_conduct + student.sdq_hyperactivity + student.sdq_peer).color,
                                color: 'white',
                                fontSize: '11px'
                              }}>
                                {getSDQTotalInterpretation(student.sdq_emotional + student.sdq_conduct + student.sdq_hyperactivity + student.sdq_peer).interpretation}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">
                            <i className="bi bi-dash-circle me-1"></i>ยังไม่ประเมิน
                          </span>
                        )}
                      </td>
                      
                      {/* DASS-21 Column - Show three separate statuses */}
                      <td className="align-middle">
                        {student.dass21_depression !== undefined && student.dass21_depression !== null && student.dass21_depression > 0 &&
                         student.dass21_anxiety !== undefined && student.dass21_anxiety !== null && student.dass21_anxiety > 0 &&
                         student.dass21_stress !== undefined && student.dass21_stress !== null && student.dass21_stress > 0 ? (
                          <div>
                            <div className="mb-1">
                              <span style={{ fontSize: '12px' }}>D: </span>
                              <span style={{ 
                                color: getDASS21StatusFromScore(student.dass21_depression, 'depression').color,
                                fontWeight: 500,
                                fontSize: '12px'
                              }}>
                                {getDASS21StatusFromScore(student.dass21_depression, 'depression').text}
                              </span>
                            </div>
                            <div className="mb-1">
                              <span style={{ fontSize: '12px' }}>A: </span>
                              <span style={{ 
                                color: getDASS21StatusFromScore(student.dass21_anxiety, 'anxiety').color,
                                fontWeight: 500,
                                fontSize: '12px'
                              }}>
                                {getDASS21StatusFromScore(student.dass21_anxiety, 'anxiety').text}
                              </span>
                            </div>
                            <div>
                              <span style={{ fontSize: '12px' }}>S: </span>
                              <span style={{ 
                                color: getDASS21StatusFromScore(student.dass21_stress, 'stress').color,
                                fontWeight: 500,
                                fontSize: '12px'
                              }}>
                                {getDASS21StatusFromScore(student.dass21_stress, 'stress').text}
                              </span>
                            </div>
                          
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
                          <span className="badge bg-danger" title={student.studentData.risk_behaviors.join(', ')}>
                            {student.studentData.risk_behaviors.slice(0, 1).join(', ')}{student.studentData.risk_behaviors.length > 1 && ` +${student.studentData.risk_behaviors.length - 1}`}
                          </span>
                        ) : (
                          <span className="badge bg-secondary">ไม่พบ</span>
                        )}
                      </td>
                      
                      {/* Family Column */}
                      <td className="align-middle">
                        {student.studentData?.family_instability ? (
                          <span className="badge bg-warning" title={student.studentData.family_status?.join(', ')}>มีปัญหา</span>
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
                  );
                })}
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
                              <tr><td className="fw-semibold">สาขา:</td><td>{modal.student.department}</td></tr>
                              <tr><td className="fw-semibold">ห้อง:</td><td>{modal.student.room}</td></tr>
                              <tr><td className="fw-semibold">ครูที่ปรึกษา:</td><td>{modal.student.advisorName}</td></tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="col-md-6">
                          <table className="table table-sm table-borderless">
                            <tbody>
                              <tr><td className="fw-semibold">สาขาผู้เรียน:</td><td>{modal.student.studentData?.student_group || 'ไม่ระบุ'}</td></tr>
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
                            {modal.student.sdq_emotional !== undefined && modal.student.sdq_emotional !== null &&
                             modal.student.sdq_conduct !== undefined && modal.student.sdq_conduct !== null &&
                             modal.student.sdq_hyperactivity !== undefined && modal.student.sdq_hyperactivity !== null &&
                             modal.student.sdq_peer !== undefined && modal.student.sdq_peer !== null ? (
                              <>
                                {/* Total score with interpretation badge */}
                                <div className="mb-3">
                                  <strong>คะแนนรวม (4 ด้าน):</strong> {modal.student.sdq_emotional + modal.student.sdq_conduct + modal.student.sdq_hyperactivity + modal.student.sdq_peer}/40 
                                 
                                </div>
                                <p className="mb-1 mt-2">ระดับความเสี่ยง:  <span className="badge ms-2" style={{ 
                                    backgroundColor: getSDQTotalInterpretation(modal.student.sdq_emotional + modal.student.sdq_conduct + modal.student.sdq_hyperactivity + modal.student.sdq_peer).color,
                                    color: 'white'
                                  }}>
                                    {getSDQTotalInterpretation(modal.student.sdq_emotional + modal.student.sdq_conduct + modal.student.sdq_hyperactivity + modal.student.sdq_peer).interpretation}
                                  </span></p>
                                <small className="text-muted"><br />ประเมินล่าสุด: {formatDate(modal.student.sdq_date || '')}</small>
                              </>
                            ) : (
                              <p className="text-muted mb-0">ยังไม่มีการประเมิน SDQ</p>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="border rounded p-3">
                            <h6 className="fw-semibold text-warning">DASS-21</h6>
                            {modal.student.dass21_depression !== undefined && modal.student.dass21_depression !== null &&
                             modal.student.dass21_anxiety !== undefined && modal.student.dass21_anxiety !== null &&
                             modal.student.dass21_stress !== undefined && modal.student.dass21_stress !== null ? (
                              <>
                                <div className="mt-2">
                                  <div className="mb-2">
                                    <strong>ภาวะซึมเศร้า:</strong> {modal.student.dass21_depression} คะแนน
                                    <span className={`badge ms-2`} style={{ 
                                      backgroundColor: getDASS21StatusFromScore(modal.student.dass21_depression, 'depression').color
                                    }}>
                                      {getDASS21StatusFromScore(modal.student.dass21_depression, 'depression').text}
                                    </span>
                                  </div>
                                  <div className="mb-2">
                                    <strong>ภาวะวิตกกังวล:</strong> {modal.student.dass21_anxiety} คะแนน
                                    <span className={`badge ms-2`} style={{ 
                                      backgroundColor: getDASS21StatusFromScore(modal.student.dass21_anxiety, 'anxiety').color
                                    }}>
                                      {getDASS21StatusFromScore(modal.student.dass21_anxiety, 'anxiety').text}
                                    </span>
                                  </div>
                                  <div className="mb-2">
                                    <strong>ภาวะความเครียด:</strong> {modal.student.dass21_stress} คะแนน
                                    <span className={`badge ms-2`} style={{ 
                                      backgroundColor: getDASS21StatusFromScore(modal.student.dass21_stress, 'stress').color
                                    }}>
                                      {getDASS21StatusFromScore(modal.student.dass21_stress, 'stress').text}
                                    </span>
                                  </div>
                                </div>
                                
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
                              <tr><td className="fw-semibold">พฤติกรรมเสี่ยง:</td>
                                <td>{modal.student.studentData?.risk_behaviors && modal.student.studentData.risk_behaviors.length > 0 ? 
                                  <span className="badge bg-danger">{modal.student.studentData.risk_behaviors.join(', ')}</span> : 'ไม่พบ'}
                                </td>
                              </tr>
                              <tr><td className="fw-semibold">พฤติกรรมที่บ้าน:</td><td>{modal.student.studentData?.home_behavior || 'ไม่ระบุ'}</td></tr>
                              <tr><td className="fw-semibold">โรคประจำตัว:</td><td>{modal.student.studentData?.chronic_disease || 'ไม่พบ'}</td></tr>
                              <tr><td className="fw-semibold">ความกังวลผู้ปกครอง:</td><td>{modal.student.studentData?.parent_concerns || 'ไม่พบ'}</td></tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="col-md-6">
                          <table className="table table-sm">
                            <tbody>
                              <tr><td className="fw-semibold">สถานภาพครอบครัว:</td>
                                <td>{modal.student.studentData?.family_status && modal.student.studentData.family_status.length > 0 ? 
                                  <span className={`badge ${modal.student.studentData.family_instability ? 'bg-warning' : 'bg-secondary'}`}>
                                    {modal.student.studentData.family_status.join(', ')}
                                  </span> : 'ไม่พบ'}
                                </td>
                              </tr>
                              <tr><td className="fw-semibold">อาศัยอยู่กับ:</td><td>{modal.student.studentData?.living_with || 'ไม่ระบุ'}</td></tr>
                              <tr><td className="fw-semibold">รายได้ครอบครัว:</td>
                                <td>{modal.student.studentData?.family_income || 'ไม่ระบุ'} บาท/เดือน 
                                  {modal.student.studentData?.economic_risk && <span className="badge bg-success ms-2">รายได้น้อย</span>}
                                </td>
                              </tr>
                              <tr><td className="fw-semibold">ความต้องการช่วยเหลือ:</td>
                                <td>{modal.student.studentData?.assistance_needs && modal.student.studentData.assistance_needs.length > 0 ? 
                                  <span className="badge bg-info">{modal.student.studentData.assistance_needs.join(', ')}</span> : 'ไม่พบ'}
                                </td>
                              </tr>
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

