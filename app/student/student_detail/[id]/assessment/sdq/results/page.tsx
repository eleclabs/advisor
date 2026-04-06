'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

// ==================== CONSTANTS ====================
const SDQ_CONSTANTS = {
  MAX_PER_CATEGORY: 10,
  TOTAL_MAX: 40,
  RISK_THRESHOLDS: {
    HIGH: 80,
    MEDIUM: 60,
    LOW: 40
  }
} as const;

const RISK_CONFIG = {
  high: { color: '#dc3545', label: 'เสี่ยงสูง', bgLight: '#fee' },
  medium: { color: '#ffc107', label: 'เสี่ยงปานกลาง', bgLight: '#fff3cd' },
  low: { color: '#fd7e14', label: 'เสี่ยงต่ำ', bgLight: '#ffe8e0' },
  normal: { color: '#28a745', label: 'ปกติ', bgLight: '#e8f5e9' }
} as const;

type RiskLevel = keyof typeof RISK_CONFIG;

// ==================== INTERFACES ====================
interface Student {
  _id: string;
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  name?: string;
  nickname: string;
  gender: string;
  birth_date: string;
  level: string;
  class_group: string;
  class_number: string;
  advisor_name: string;
  phone_number: string;
  religion: string;
  address: string;
  weight: string;
  height: string;
  bmi: string;
  blood_type: string;
  image?: string;
  email?: string;
}

interface SDQAnswers {
  emotional: number[];
  conduct: number[];
  hyperactivity: number[];
  peer: number[];
  prosocial: number[];
}

interface SDQResponse {
  _id: string;
  studentId: string;
  studentName: string;
  grade: string;
  classroom: string;
  answers: SDQAnswers;
  totalScore: number;
  emotionalScore: number;
  conductScore: number;
  hyperactivityScore: number;
  peerScore: number;
  prosocialScore: number;
  overallRisk: RiskLevel;
  submittedAt: string;
  submittedBy: string;
}

// ==================== UTILITY FUNCTIONS ====================
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'ไม่ระบุวันที่';
  }
};

const getRiskConfig = (risk: string): { color: string; label: string; bgLight: string } => {
  return RISK_CONFIG[risk as RiskLevel] || RISK_CONFIG.normal;
};

const getScoreColor = (score: number, maxScore: number): string => {
  if (maxScore <= 0) return RISK_CONFIG.normal.color;
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= SDQ_CONSTANTS.RISK_THRESHOLDS.HIGH) return RISK_CONFIG.high.color;
  if (percentage >= SDQ_CONSTANTS.RISK_THRESHOLDS.MEDIUM) return RISK_CONFIG.medium.color;
  if (percentage >= SDQ_CONSTANTS.RISK_THRESHOLDS.LOW) return RISK_CONFIG.low.color;
  return RISK_CONFIG.normal.color;
};

const validateSDQResponse = (response: SDQResponse): boolean => {
  return (
    typeof response.totalScore === 'number' &&
    response.totalScore >= 0 &&
    response.totalScore <= SDQ_CONSTANTS.TOTAL_MAX &&
    typeof response.emotionalScore === 'number' &&
    typeof response.conductScore === 'number' &&
    typeof response.hyperactivityScore === 'number' &&
    typeof response.peerScore === 'number' &&
    typeof response.prosocialScore === 'number'
  );
};

// ==================== CUSTOM HOOKS ====================
const useStudentData = (studentId: string) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!studentId) return;

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const fetchStudent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/student/${studentId}`, {
          signal: abortControllerRef.current?.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setStudent(data.data);
        } else {
          setError(data.message || 'ไม่พบข้อมูลนักเรียน');
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error loading student:', err);
          setError('เกิดข้อผิดพลาดในการโหลดข้อมูลนักเรียน');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [studentId]);

  return { student, loading, error };
};

const useSDQResponses = (studentId: string) => {
  const [responses, setResponses] = useState<SDQResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!studentId) return;

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const fetchResponses = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/assessment/sdq/student/${studentId}`, {
          signal: abortControllerRef.current?.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Validate and sort responses (newest first)
          const validResponses = data.data.filter(validateSDQResponse);
          const sortedResponses = validResponses.sort((a: any, b: any): number => 
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          );
          setResponses(sortedResponses);
        } else {
          setResponses([]);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error loading SDQ responses:', err);
          setError('เกิดข้อผิดพลาดในการโหลดข้อมูลการประเมิน');
          setResponses([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [studentId]);

  return { responses, loading, error };
};

// ==================== COMPONENTS ====================
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'กำลังโหลดข้อมูล...' }) => (
  <div className="loading-container" style={{
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  }}>
    <div style={{ textAlign: 'center' }}>
      <div aria-hidden="true" style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
      <p style={{ color: '#6c757d' }}>{message}</p>
    </div>
  </div>
);

interface ErrorDisplayProps {
  message: string;
  returnPath: string;
  returnLabel?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  message, 
  returnPath, 
  returnLabel = 'กลับไปหน้าข้อมูลนักเรียน' 
}) => (
  <div className="error-container" style={{
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '40px',
      textAlign: 'center',
      maxWidth: '480px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #e9ecef'
    }}>
      <div aria-hidden="true" style={{ fontSize: '48px', marginBottom: '20px', color: '#dc3545' }}>⚠️</div>
      <h2 style={{
        color: '#212529',
        marginBottom: '8px',
        fontWeight: 500,
        fontSize: '24px'
      }}>
        {message}
      </h2>
      <Link
        href={returnPath}
        style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
      >
        {returnLabel}
      </Link>
    </div>
  </div>
);

interface EmptyStateProps {
  message: string;
  description: string;
  actionLink: string;
  actionLabel: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  description, 
  actionLink, 
  actionLabel 
}) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '60px 40px',
    textAlign: 'center',
    border: '1px solid #dee2e6'
  }}>
    <div aria-hidden="true" style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
    <h2 style={{
      fontSize: '20px',
      fontWeight: 600,
      color: '#212529',
      marginBottom: '12px'
    }}>
      {message}
    </h2>
    <p style={{
      fontSize: '16px',
      color: '#6c757d',
      marginBottom: '24px'
    }}>
      {description}
    </p>
    <Link
      href={actionLink}
      style={{
        display: 'inline-block',
        padding: '12px 24px',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 500,
        transition: 'background-color 0.2s ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
    >
      {actionLabel}
    </Link>
  </div>
);

interface StatCardProps {
  value: string | number;
  label: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, color = '#007bff' }) => (
  <div style={{
    backgroundColor: 'white',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }}>
    <div style={{ fontSize: '32px', fontWeight: 700, color, marginBottom: '8px' }}>
      {value}
    </div>
    <div style={{ fontSize: '14px', color: '#6c757d' }}>{label}</div>
  </div>
);

interface ScoreCellProps {
  score: number;
  maxScore: number;
}

const ScoreCell: React.FC<ScoreCellProps> = ({ score, maxScore }) => (
  <td style={{
    padding: '12px 16px',
    fontSize: '14px',
    color: getScoreColor(score, maxScore),
    borderBottom: '1px solid #e9ecef',
    textAlign: 'center',
    fontWeight: 500
  }}>
    {score}
  </td>
);

interface RiskBadgeProps {
  risk: RiskLevel;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ risk }) => {
  const config = getRiskConfig(risk);
  return (
    <span style={{
      backgroundColor: config.color,
      color: 'white',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 500,
      display: 'inline-block'
    }}>
      {config.label}
    </span>
  );
};

// ==================== MAIN COMPONENT ====================
export default function StudentSDQResultsPage() {
  const router = useRouter();
  const params = useParams();
  const studentDocId = params?.id as string;
  
  // Custom hooks for data fetching
  const { student, loading: studentLoading, error: studentError } = useStudentData(studentDocId);
  const { responses, loading: responsesLoading, error: responsesError } = useSDQResponses(studentDocId);
  
  // Combined loading state
  const isLoading = studentLoading || responsesLoading;
  
  // Memoized computed values
  const latestResponse = useMemo(() => responses[0], [responses]);
  const totalEvaluations = useMemo(() => responses.length, [responses]);
  const hasResponses = useMemo(() => responses.length > 0, [responses]);
  
  // Combined error
  const displayError = studentError || responsesError;
  
  // Student full name
  const studentFullName = useMemo(() => {
    if (!student) return '';
    return `${student.prefix || ''}${student.first_name} ${student.last_name} (${student.nickname || ''})`.trim();
  }, [student]);
  
  // Handle retry
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);
  
  // Handle new assessment
  const handleNewAssessment = useCallback(() => {
    router.push(`/assessment?type=sdq&studentId=${studentDocId}`);
  }, [router, studentDocId]);
  
  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push(`/student/student_detail/${studentDocId}`);
  }, [router, studentDocId]);
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner message="กำลังโหลดข้อมูลการประเมิน..." />;
  }
  
  // Error state
  if (displayError || !student) {
    return (
      <ErrorDisplay 
        message={displayError || 'ไม่พบข้อมูลนักเรียน'}
        returnPath={`/student/student_detail/${studentDocId}`}
        returnLabel="กลับไปหน้าข้อมูลนักเรียน"
      />
    );
  }
  
  // Empty state
  if (!hasResponses) {
    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <Header 
          studentName={studentFullName}
          studentId={studentDocId}
          onBack={handleBack}
          onNewAssessment={handleNewAssessment}
        />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
          <EmptyState
            message="ยังไม่มีข้อมูลการประเมิน SDQ"
            description="นักเรียนยังไม่เคยได้รับการประเมินด้วยแบบ SDQ"
            actionLink={`/assessment?type=sdq&studentId=${studentDocId}`}
            actionLabel="เริ่มทำแบบประเมิน SDQ"
          />
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <Header 
        studentName={studentFullName}
        studentId={studentDocId}
        onBack={handleBack}
        onNewAssessment={handleNewAssessment}
      />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <StatCard value={totalEvaluations} label="ครั้งที่ประเมิน" color="#007bff" />
          <StatCard 
            value={latestResponse?.totalScore || 0} 
            label="คะแนนล่าสุด" 
            color={getScoreColor(latestResponse?.totalScore || 0, SDQ_CONSTANTS.TOTAL_MAX)}
          />
          <StatCard 
            value={getRiskConfig(latestResponse?.overallRisk || 'normal').label} 
            label="ระดับความเสี่ยงล่าสุด"
            color={getRiskConfig(latestResponse?.overallRisk || 'normal').color}
          />
        </div>
        
        {/* Responses Table */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '16px 20px',
            borderBottom: '1px solid #dee2e6'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#212529',
              margin: 0
            }}>
              ประวัติการประเมิน SDQ
            </h2>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <caption style={{ textAlign: 'left', padding: '8px 16px', fontSize: '12px', color: '#6c757d' }}>
                ตารางแสดงประวัติการประเมินแบบคัดกรองปัญหาอารมณ์และพฤติกรรม (SDQ)
              </caption>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  {tableHeaders.map(header => (
                    <th key={header.key} style={{
                      padding: '12px 16px',
                      textAlign: (header.align as any) || 'left',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#495057',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '1px solid #dee2e6'
                    }}>
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {responses.map((response, index) => (
                  <ResponseRow 
                    key={response._id}
                    response={response}
                    index={index}
                    totalCount={responses.length}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================
interface HeaderProps {
  studentName: string;
  studentId: string;
  onBack: () => void;
  onNewAssessment: () => void;
}

const Header: React.FC<HeaderProps> = ({ studentName, studentId, onBack, onNewAssessment }) => (
  <div style={{
    backgroundColor: 'white',
    borderBottom: '1px solid #dee2e6',
    padding: '20px 0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  }}>
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#6c757d',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '4px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
            e.currentTarget.style.color = '#212529';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#6c757d';
          }}
          aria-label="กลับไปหน้ารายละเอียดนักเรียน"
        >
          ← กลับ
        </button>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#212529',
            margin: '0 0 4px 0'
          }}>
            ผลการประเมิน SDQ
          </h1>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#6c757d'
          }}>
            นักเรียน: {studentName}
          </p>
        </div>
      </div>
      <button
        onClick={onNewAssessment}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
        aria-label="ทำแบบประเมินใหม่"
      >
        + ทำแบบประเมินใหม่
      </button>
    </div>
  </div>
);

interface ResponseRowProps {
  response: SDQResponse;
  index: number;
  totalCount: number;
}

const ResponseRow: React.FC<ResponseRowProps> = ({ response, index, totalCount }) => {
  const rowNumber = totalCount - index;
  
  return (
    <tr style={{
      backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
      transition: 'background-color 0.2s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafafa'}>
      <td style={{
        padding: '12px 16px',
        fontSize: '14px',
        color: '#212529',
        borderBottom: '1px solid #e9ecef',
        fontWeight: 500
      }}>
        #{rowNumber}
      </td>
      <td style={{
        padding: '12px 16px',
        fontSize: '14px',
        color: '#212529',
        borderBottom: '1px solid #e9ecef'
      }}>
        {formatDate(response.submittedAt)}
      </td>
      <ScoreCell score={response.emotionalScore} maxScore={SDQ_CONSTANTS.MAX_PER_CATEGORY} />
      <ScoreCell score={response.conductScore} maxScore={SDQ_CONSTANTS.MAX_PER_CATEGORY} />
      <ScoreCell score={response.hyperactivityScore} maxScore={SDQ_CONSTANTS.MAX_PER_CATEGORY} />
      <ScoreCell score={response.peerScore} maxScore={SDQ_CONSTANTS.MAX_PER_CATEGORY} />
      <ScoreCell score={response.prosocialScore} maxScore={SDQ_CONSTANTS.MAX_PER_CATEGORY} />
      <ScoreCell score={response.totalScore} maxScore={SDQ_CONSTANTS.TOTAL_MAX} />
      <td style={{
        padding: '12px 16px',
        fontSize: '14px',
        borderBottom: '1px solid #e9ecef',
        textAlign: 'center'
      }}>
        <RiskBadge risk={response.overallRisk} />
      </td>
      <td style={{
        padding: '12px 16px',
        fontSize: '14px',
        color: '#212529',
        borderBottom: '1px solid #e9ecef',
        textAlign: 'center'
      }}>
        {response.submittedBy}
      </td>
    </tr>
  );
};

const Footer: React.FC = () => (
  <footer style={{
    textAlign: 'center',
    padding: '24px 20px',
    color: '#adb5bd',
    fontSize: '12px',
    borderTop: '1px solid #dee2e6',
    marginTop: '40px'
  }}>
    ระบบดูแลช่วยเหลือผู้เรียน • ผลการประเมิน SDQ • {new Date().toLocaleDateString('th-TH')}
  </footer>
);

const tableHeaders = [
  { key: 'no', label: 'ครั้งที่', align: 'left' },
  { key: 'date', label: 'วันที่ประเมิน', align: 'left' },
  { key: 'emotional', label: 'อารมณ์', align: 'center' },
  { key: 'conduct', label: 'พฤติกรรม', align: 'center' },
  { key: 'hyperactivity', label: 'ไฮเปอร์', align: 'center' },
  { key: 'peer', label: 'เพื่อน', align: 'center' },
  { key: 'prosocial', label: 'เชิงบวก', align: 'center' },
  { key: 'total', label: 'รวม', align: 'center' },
  { key: 'risk', label: 'ความเสี่ยง', align: 'center' },
  { key: 'evaluator', label: 'ผู้ประเมิน', align: 'center' }
];
