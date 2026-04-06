'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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

interface DASS21Response {
  _id: string;
  studentId: string;
  studentName: string;
  grade: string;
  classroom: string;
  answers: any;
  depressionScore: number;
  anxietyScore: number;
  stressScore: number;
  depressionLevel: string;
  anxietyLevel: string;
  stressLevel: string;
  submittedAt: string;
  submittedBy: string;
}

export default function StudentDASS21ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const studentDocId = params?.id as string;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [responses, setResponses] = useState<DASS21Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentDocId) {
      loadStudentData();
      loadDASS21Responses();
    }
  }, [studentDocId]);

  const loadStudentData = async () => {
    try {
      const response = await fetch(`/api/student/${studentDocId}`);
      const data = await response.json();
      
      if (data.success) {
        setStudent(data.data);
      } else {
        setError(data.message || 'ไม่พบข้อมูลนักเรียน');
      }
    } catch (error) {
      console.error('Error loading student:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลนักเรียน');
    }
  };

  const loadDASS21Responses = async () => {
    try {
      const response = await fetch(`/api/assessment/dass21/student/${studentDocId}`);
      const data = await response.json();
      
      if (data.success) {
        setResponses(data.data);
      } else {
        // If no responses found, that's okay
        setResponses([]);
      }
    } catch (error) {
      console.error('Error loading DASS-21 responses:', error);
      // Don't set error for empty responses
      setResponses([]);
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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'รุนแรงมาก': return '#dc3545';
      case 'รุนแรง': return '#fd7e14';
      case 'ปานกลาง': return '#ffc107';
      case 'เบา': return '#17a2b8';
      default: return '#28a745';
    }
  };

  const getScoreColor = (score: number, type: string) => {
    const thresholds: Record<string, { normal: number; mild: number; moderate: number; severe: number }> = {
      depression: { normal: 9, mild: 13, moderate: 20, severe: 27 },
      anxiety: { normal: 7, mild: 9, moderate: 14, severe: 19 },
      stress: { normal: 14, mild: 18, moderate: 25, severe: 33 }
    };
    
    const threshold = thresholds[type];
    if (score <= threshold.normal) return '#28a745';
    if (score <= threshold.mild) return '#17a2b8';
    if (score <= threshold.moderate) return '#ffc107';
    if (score <= threshold.severe) return '#fd7e14';
    return '#dc3545';
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

  if (error || !student) {
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
            {error || 'ไม่พบข้อมูลนักเรียน'}
          </h2>
          <Link
            href={`/student/student_detail/${studentDocId}`}
            style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            กลับไปหน้าข้อมูลนักเรียน
          </Link>
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
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #dee2e6',
        padding: '20px 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              href={`/student/student_detail/${studentDocId}`}
              style={{
                color: '#6c757d',
                textDecoration: 'none',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ← กลับ
            </Link>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#212529',
                margin: '0 0 4px 0'
              }}>
                ผลการประเมิน DASS-21
              </h1>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#6c757d'
              }}>
                นักเรียน: {student.prefix}{student.first_name} {student.last_name} ({student.nickname})
              </p>
            </div>
          </div>
          <Link
            href={`/assessment?type=dass21&studentId=${studentDocId}`}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            + ทำแบบประเมินใหม่
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {responses.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '60px 40px',
            textAlign: 'center',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🧠</div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#212529',
              marginBottom: '12px'
            }}>
              ยังไม่มีข้อมูลการประเมิน DASS-21
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6c757d',
              marginBottom: '24px'
            }}>
              นักเรียนยังไม่เคยได้รับการประเมินด้วยแบบ DASS-21
            </p>
            <Link
              href={`/assessment?type=dass21&studentId=${studentDocId}`}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#28a745',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              เริ่มทำแบบประเมิน DASS-21
            </Link>
          </div>
        ) : (
          <div>
            {/* Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#007bff', marginBottom: '8px' }}>
                  {responses.length}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>ครั้งที่ประเมิน</div>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#28a745', marginBottom: '8px' }}>
                  {responses[0]?.depressionScore || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>ภาวะซึมเศร้า</div>
                <div style={{ fontSize: '12px', color: getLevelColor(responses[0]?.depressionLevel || 'ปกติ'), marginTop: '4px' }}>
                  {responses[0]?.depressionLevel || 'ปกติ'}
                </div>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffc107', marginBottom: '8px' }}>
                  {responses[0]?.anxietyScore || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>วิตกกังวล</div>
                <div style={{ fontSize: '12px', color: getLevelColor(responses[0]?.anxietyLevel || 'ปกติ'), marginTop: '4px' }}>
                  {responses[0]?.anxietyLevel || 'ปกติ'}
                </div>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#dc3545', marginBottom: '8px' }}>
                  {responses[0]?.stressScore || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>ความเครียด</div>
                <div style={{ fontSize: '12px', color: getLevelColor(responses[0]?.stressLevel || 'ปกติ'), marginTop: '4px' }}>
                  {responses[0]?.stressLevel || 'ปกติ'}
                </div>
              </div>
            </div>

            {/* Responses List */}
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              overflow: 'hidden'
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
                  ประวัติการประเมิน DASS-21
                </h2>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#495057',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        ครั้งที่
                      </th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#495057',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        วันที่ประเมิน
                      </th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#495057',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        ภาวะซึมเศร้า
                      </th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#495057',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        วิตกกังวล
                      </th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#495057',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        ความเครียด
                      </th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#495057',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        ผู้ประเมิน
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((response, index) => (
                      <tr key={response._id} style={{
                        backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                      }}>
                        <td style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          color: '#212529',
                          borderBottom: '1px solid #e9ecef',
                          fontWeight: 500
                        }}>
                          #{responses.length - index}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          color: '#212529',
                          borderBottom: '1px solid #e9ecef'
                        }}>
                          {formatDate(response.submittedAt)}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          color: getScoreColor(response.depressionScore, 'depression'),
                          borderBottom: '1px solid #e9ecef',
                          textAlign: 'center',
                          fontWeight: 500
                        }}>
                          {response.depressionScore}
                          <div style={{
                            fontSize: '10px',
                            color: getLevelColor(response.depressionLevel),
                            marginTop: '2px'
                          }}>
                            {response.depressionLevel}
                          </div>
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          color: getScoreColor(response.anxietyScore, 'anxiety'),
                          borderBottom: '1px solid #e9ecef',
                          textAlign: 'center',
                          fontWeight: 500
                        }}>
                          {response.anxietyScore}
                          <div style={{
                            fontSize: '10px',
                            color: getLevelColor(response.anxietyLevel),
                            marginTop: '2px'
                          }}>
                            {response.anxietyLevel}
                          </div>
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          color: getScoreColor(response.stressScore, 'stress'),
                          borderBottom: '1px solid #e9ecef',
                          textAlign: 'center',
                          fontWeight: 500
                        }}>
                          {response.stressScore}
                          <div style={{
                            fontSize: '10px',
                            color: getLevelColor(response.stressLevel),
                            marginTop: '2px'
                          }}>
                            {response.stressLevel}
                          </div>
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
