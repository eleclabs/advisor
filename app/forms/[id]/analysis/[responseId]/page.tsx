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

export default function FormResponseAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const [response, setResponse] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id && params.responseId) {
      fetchResponseData(params.id as string, params.responseId as string);
    }
  }, [params.id, params.responseId]);

  const fetchResponseData = async (formId: string, responseId: string) => {
    try {
      setLoading(true);
      const apiResponse = await fetch(`/api/forms/${formId}/responses/${responseId}`);
      const data = await apiResponse.json();

      if (data.success) {
        setResponse(data.data.response);
      } else {
        setError(data.message || 'Failed to fetch response data');
      }
    } catch (error) {
      console.error('Error fetching response data:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
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
      'COMMITTEE': 'คณะกรรมการ',
      'STUDENT': 'นักเรียน'
    };
    return roleMap[role] || role;
  };

  const renderAnswer = (answer: any) => {
    const { questionType, answer: userAnswer } = answer;
    
    switch (questionType) {
      case 'scale':
        return (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#495057',
            fontWeight: 500
          }}>
            คะแนน: {userAnswer}/5
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
          <p style={{ color: '#6c757d' }}>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error || !response) {
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
            {error || 'ไม่พบข้อมูล'}
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

  // Group answers by section
  const answersBySection: { [key: string]: typeof response.answers } = {};
  response.answers.forEach(answer => {
    const sectionTitle = answer.sectionTitle || 'ทั่วไป';
    if (!answersBySection[sectionTitle]) {
      answersBySection[sectionTitle] = [];
    }
    answersBySection[sectionTitle].push(answer);
  });

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
            <Link
              href={`/forms/${params.id as string}/responses`}
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
              📋 คำตอบทั้งหมด
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
            คำตอบแบบฟอร์ม
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#212529',
            margin: '0 0 12px 0',
            letterSpacing: '-0.3px'
          }}>
            📝 คำตอบของ {response.userName}
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6c757d',
            lineHeight: 1.6,
            margin: 0
          }}>
            {response.userEmail} • {getRoleLabel(response.userRole)} • {formatDate(response.submittedAt)}
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
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>วันที่ตอบ</div>
              <div style={{ fontSize: '14px', color: '#212529', fontWeight: 500 }}>{formatDate(response.submittedAt)}</div>
            </div>
          </div>
        </div>

        {/* Answers by Section */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#212529', marginBottom: '24px' }}>
            คำตอบทั้งหมด
          </h2>
          
          {Object.entries(answersBySection).map(([sectionTitle, answers], sectionIndex) => (
            <div key={sectionTitle} style={{ marginBottom: sectionIndex < Object.keys(answersBySection).length - 1 ? '32px' : '0' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#212529',
                marginBottom: '20px',
                paddingBottom: '8px',
                borderBottom: '2px solid #e9ecef'
              }}>
                {Object.keys(answersBySection).length > 1 && `ส่วน: `}{sectionTitle}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {answers
                  .sort((a, b) => a.questionId - b.questionId)
                  .map((answer, qIndex) => (
                  <div key={answer.questionId} style={{
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
                        {answer.questionId}. {answer.questionText}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6c757d',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {answer.questionType || 'text'}
                      </div>
                    </div>
                    
                    <div>
                      {renderAnswer(answer)}
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
