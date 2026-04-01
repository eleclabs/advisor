'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormResponse {
  _id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  userGender?: string;
  userAgeRange?: string;
  userBirthDate?: string;
  answers: {
    questionId: number;
    questionText: string;
    questionType?: string;
    answer: any;
    sectionId?: string;
    sectionTitle?: string;
    sectionOrder?: number;
  }[];
  submittedAt: string;
}

interface AnalysisData {
  response: FormResponse;
  answersBySection: {
    [sectionTitle: string]: {
      order: number;
      questions: any[];
    };
  };
  scoreAnalysis: {
    totalScore: number;
    averageScore: string;
    scoreDistribution: {
      excellent: number;
      good: number;
      average: number;
      poor: number;
    };
    sectionScores: {
      [sectionTitle: string]: {
        average: string;
        count: number;
      };
    };
  };
  metadata: {
    totalQuestions: number;
    scaleQuestions: number;
    completionRate: number;
  };
}

export default function FormResponseAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id && params.responseId) {
      fetchAnalysisData(params.id as string, params.responseId as string);
    }
  }, [params.id, params.responseId]);

  const fetchAnalysisData = async (formId: string, responseId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/forms/${formId}/responses/${responseId}`);
      const data = await response.json();

      if (data.success) {
        setAnalysisData(data.data);
      } else {
        setError(data.message || 'Failed to fetch analysis data');
      }
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลวิเคราะห์');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleLabel = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'ผู้ดูแลระบบ',
      'TEACHER': 'อาจารย์',
      'EXECUTIVE': 'ผู้บริหาร',
      'COMMITTEE': 'คณะกรรมการ'
    };
    return roleMap[role] || role;
  };

  const getGenderLabel = (gender: string) => {
    const genderMap: { [key: string]: string } = {
      'male': 'ชาย',
      'female': 'หญิง',
      'other': 'อื่นๆ'
    };
    return genderMap[gender] || gender || 'ไม่ระบุ';
  };

  const getAgeRangeLabel = (ageRange: string) => {
    const ageMap: { [key: string]: string } = {
      'under-20': 'ต่ำกว่า 20 ปี',
      '20-30': '20 - 30 ปี',
      '31-40': '31 - 40 ปี',
      '41-50': '41 - 50 ปี',
      'over-50': 'มากกว่า 50 ปี'
    };
    return ageMap[ageRange] || ageRange || 'ไม่ระบุ';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#28a745';
    if (rating >= 3.5) return '#ffc107';
    if (rating >= 2.5) return '#fd7e14';
    return '#dc3545';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'ดีเยี่ยม';
    if (rating >= 3.5) return 'ดี';
    if (rating >= 2.5) return 'ปานกลาง';
    return 'ต้องปรับปรุง';
  };

  const renderAnswer = (answer: any) => {
    const { questionType, answer: userAnswer } = answer;
    
    switch (questionType) {
      case 'scale':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '120px',
              height: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(userAnswer / 5) * 100}%`,
                height: '100%',
                backgroundColor: getRatingColor(userAnswer)
              }} />
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: 500,
              color: getRatingColor(userAnswer)
            }}>
              {userAnswer}/5 - {getRatingLabel(userAnswer)}
            </span>
          </div>
        );
      
      case 'radio':
        return (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#495057'
          }}>
            {userAnswer}
          </div>
        );
      
      case 'checkbox':
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(Array.isArray(userAnswer) ? userAnswer : []).map((item: string, index: number) => (
              <span key={index} style={{
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 500
              }}>
                {item}
              </span>
            ))}
          </div>
        );
      
      case 'text':
        return (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#495057',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}>
            {userAnswer}
          </div>
        );
      
      default:
        return (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#495057'
          }}>
            {String(userAnswer)}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#6c757d' }}>กำลังโหลดข้อมูลวิเคราะห์...</p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div style={{
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
          <div style={{ fontSize: '48px', marginBottom: '20px', color: '#dc3545' }}>⚠</div>
          <h2 style={{
            color: '#212529',
            marginBottom: '8px',
            fontWeight: 500,
            fontSize: '24px'
          }}>
            {error || 'ไม่พบข้อมูลการวิเคราะห์'}
          </h2>
          <button
            onClick={() => router.back()}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            กลับไปหน้าก่อนหน้า
          </button>
        </div>
      </div>
    );
  }

  const { response, answersBySection, scoreAnalysis, metadata } = analysisData;

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '40px 20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button
              onClick={() => router.back()}
              style={{
                backgroundColor: 'transparent',
                color: '#6c757d',
                border: '1px solid #dee2e6',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ← กลับ
            </button>
            <Link
              href={`/forms/${params.id as string}`}
              style={{
                backgroundColor: 'transparent',
                color: '#6c757d',
                border: '1px solid #dee2e6',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📝 แบบฟอร์ม
            </Link>
          </div>
          
          <div style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#6c757d',
            letterSpacing: '0.5px',
            marginBottom: '8px',
            textTransform: 'uppercase'
          }}>
            รายงานวิเคราะห์การตอบแบบฟอร์ม
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#212529',
            margin: '0 0 12px 0',
            letterSpacing: '-0.3px'
          }}>
            📊 วิเคราะห์คำตอบแบบฟอร์ม
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6c757d',
            lineHeight: 1.6,
            margin: 0
          }}>
            โดย {response.userName} • {formatDate(response.submittedAt)}
          </p>
        </div>

        {/* User Info Card */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#212529', marginBottom: '20px' }}>
            ข้อมูลผู้ตอบแบบฟอร์ม
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>ชื่อ-นามสกุล</div>
              <div style={{ fontSize: '14px', color: '#212529', fontWeight: 500 }}>{response.userName}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>อีเมล</div>
              <div style={{ fontSize: '14px', color: '#212529', fontWeight: 500 }}>{response.userEmail}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>บทบาท</div>
              <div style={{ fontSize: '14px', color: '#212529', fontWeight: 500 }}>{getRoleLabel(response.userRole)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>เพศ</div>
              <div style={{ fontSize: '14px', color: '#212529', fontWeight: 500 }}>{getGenderLabel(response.userGender || '')}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>ช่วงอายุ</div>
              <div style={{ fontSize: '14px', color: '#212529', fontWeight: 500 }}>{getAgeRangeLabel(response.userAgeRange || '')}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>วันที่ตอบ</div>
              <div style={{ fontSize: '14px', color: '#212529', fontWeight: 500 }}>{formatDate(response.submittedAt)}</div>
            </div>
          </div>
        </div>

        {/* Score Analysis (if available) */}
        {metadata.scaleQuestions > 0 && (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#212529', marginBottom: '20px' }}>
              สรุปคะแนนการประเมิน
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>คะแนนรวมเฉลี่ย</div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: getRatingColor(parseFloat(scoreAnalysis.averageScore)),
                  marginBottom: '8px'
                }}>
                  {scoreAnalysis.averageScore}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: getRatingColor(parseFloat(scoreAnalysis.averageScore)),
                  fontWeight: 500
                }}>
                  {getRatingLabel(parseFloat(scoreAnalysis.averageScore))}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>จำนวนคำถาม</div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#212529' }}>
                  {metadata.totalQuestions}
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  คำถามแบบมีคะแนน: {metadata.scaleQuestions}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>อัตราการทำแบบฟอร์ม</div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#28a745' }}>
                  {metadata.completionRate}%
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  เสร็จสมบูรณ์
                </div>
              </div>
            </div>

            {/* Section Scores */}
            {Object.keys(scoreAnalysis.sectionScores).length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#212529', marginBottom: '16px' }}>
                  คะแนนตามส่วน
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  {Object.entries(scoreAnalysis.sectionScores).map(([sectionTitle, scoreData]: any) => (
                    <div key={sectionTitle} style={{
                      backgroundColor: '#f8f9fa',
                      padding: '16px',
                      borderRadius: '6px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#495057', marginBottom: '8px' }}>
                        {sectionTitle}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 600,
                          color: getRatingColor(parseFloat(scoreData.average))
                        }}>
                          {scoreData.average}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          ({scoreData.count} ข้อ)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Answers by Section */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#212529', marginBottom: '24px' }}>
            คำตอบรายละเอียด
          </h2>
          
          {Object.entries(answersBySection).map(([sectionTitle, sectionData], sectionIndex) => (
            <div key={sectionTitle} style={{ marginBottom: sectionIndex < Object.keys(answersBySection).length - 1 ? '32px' : '0' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#212529',
                marginBottom: '20px',
                paddingBottom: '8px',
                borderBottom: '2px solid #e9ecef'
              }}>
                {Object.keys(answersBySection).length > 1 && `ส่วนที่ ${sectionIndex + 1}: `}{sectionTitle}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {sectionData.questions.map((question: any, qIndex: number) => (
                  <div key={question.questionId} style={{
                    backgroundColor: '#fafafa',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    padding: '20px'
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#212529',
                        marginBottom: '8px',
                        lineHeight: 1.5
                      }}>
                        {qIndex + 1}. {question.questionText}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6c757d',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {question.questionType || 'text'}
                      </div>
                    </div>
                    
                    <div>
                      {renderAnswer(question)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
