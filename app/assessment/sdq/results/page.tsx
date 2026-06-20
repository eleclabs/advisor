'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SDQResponse {
  _id: string;
  studentId: string;
  studentName: string;
  grade: string;
  classroom?: string;
  gender?: string;
  age?: string;
  assessmentType: 'sdq';
  totalScore: number;
  sdqScore: {
    totalScore: number;
    interpretation: string;
  };
  answers: Record<string, string>;
  assessmentDate?: string;
  submittedAt?: string;
}

// ========== ฟังก์ชันคำนวณคะแนน SDQ แยกตามด้าน ==========
function calculateEmotionalScore(answers: any): number {
  const emotionalQuestions = ['sdq3', 'sdq8', 'sdq13', 'sdq16', 'sdq24'];
  return emotionalQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculateConductScore(answers: any): number {
  const conductQuestions = ['sdq5', 'sdq7', 'sdq12', 'sdq18', 'sdq22'];
  return conductQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculateHyperactivityScore(answers: any): number {
  const hyperactivityQuestions = ['sdq2', 'sdq10', 'sdq15', 'sdq21', 'sdq25'];
  return hyperactivityQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculatePeerScore(answers: any): number {
  const peerQuestions = ['sdq6', 'sdq11', 'sdq14', 'sdq19', 'sdq23'];
  return peerQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

function calculateProsocialScore(answers: any): number {
  const prosocialQuestions = ['sdq1', 'sdq4', 'sdq9', 'sdq17', 'sdq20'];
  return prosocialQuestions.reduce((sum, q) => sum + parseInt(answers[q] || '0'), 0);
}

export default function SDQResultsPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<SDQResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<SDQResponse | null>(null);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/assessment/sdq');
      const data = await response.json();

      if (data.success) {
        setResponses(data.data);
      } else {
        setError(data.message || 'Failed to fetch SDQ responses');
      }
    } catch (error) {
      console.error('Error fetching SDQ responses:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'ไม่ระบุ';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';

      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getInterpretationColor = (interpretation: string) => {
    switch (interpretation) {
      case 'ปกติ': return '#28a745';
      case 'เสี่ยง': return '#ffc107';
      case 'คาบเกี่ยว': return '#fd7e14';
      case 'มีปัญหา': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const calculateStatistics = () => {
    if (responses.length === 0) return null;

    const validResponses = responses.filter(r => r.sdqScore);

    if (validResponses.length === 0) return null;

    const totalScore = validResponses.reduce((sum, r) => sum + (r.sdqScore?.totalScore || 0), 0);
    const averageScore = (totalScore / validResponses.length).toFixed(1);

    const interpretationCounts = validResponses.reduce((acc, r) => {
      const interpretation = r.sdqScore?.interpretation || 'unknown';
      acc[interpretation] = (acc[interpretation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalResponses: responses.length,
      averageScore,
      interpretationCounts,
      highestScore: Math.max(...validResponses.map(r => r.sdqScore?.totalScore || 0)),
      lowestScore: Math.min(...validResponses.map(r => r.sdqScore?.totalScore || 0))
    };
  };

  const stats = calculateStatistics();

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Kanit', 'Prompt', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>กำลังโหลด...</div>
          <p style={{ color: '#6c757d' }}>กำลังโหลดข้อมูลผลการประเมิน SDQ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Kanit', 'Prompt', sans-serif"
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
          <div style={{ fontSize: '48px', marginBottom: '20px', color: '#dc3545' }}>ข้อผิดพลาด</div>
          <h2 style={{
            color: '#212529',
            marginBottom: '8px',
            fontWeight: 500,
            fontSize: '24px'
          }}>
            {error}
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

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '40px 20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Kanit', 'Prompt', sans-serif"
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
              href="/assessment"
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
              แบบประเมิน
            </Link>
            <Link
              href="/assessment/summary"
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
              สรุปทั้งหมด
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
            รายงานผลการประเมิน SDQ
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#212529',
            margin: '0 0 12px 0',
            letterSpacing: '-0.3px'
          }}>
            ผลการประเมิน SDQ (Strengths and Difficulties Questionnaire)
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6c757d',
            lineHeight: 1.6,
            margin: 0
          }}>
            แบบประเมินจุดแข็งและปัญหาพฤติกรรมสำหรับเด็กและวัยรุ่น
          </p>
        </div>

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#007bff', marginBottom: '8px' }}>
                {stats.totalResponses}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                ผลการประเมินทั้งหมด
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#28a745', marginBottom: '8px' }}>
                {stats.averageScore}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                คะแนนเฉลี่ย
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffc107', marginBottom: '8px' }}>
                {stats.highestScore}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                คะแนนสูงสุด
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#fd7e14', marginBottom: '8px' }}>
                {stats.lowestScore}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                คะแนนต่ำสุด
              </div>
            </div>
          </div>
        )}

        {stats && (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#212529', marginBottom: '20px' }}>
              การกระจายของผลการประเมิน
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {Object.entries(stats.interpretationCounts).map(([interpretation, count]) => (
                <div key={interpretation} style={{
                  backgroundColor: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: getInterpretationColor(interpretation), marginBottom: '8px' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '14px', color: '#495057', fontWeight: 500 }}>
                    {interpretation}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                    {((count / stats.totalResponses) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Responses Table */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#212529', marginBottom: '20px' }}>
            รายการผลการประเมิน ({responses.length} รายการ)
          </h2>

          {responses.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6c757d'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <p>ยังไม่มีข้อมูลผลการประเมิน SDQ</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#495057', textTransform: 'uppercase', borderBottom: '1px solid #dee2e6' }}>ชื่อนักเรียน</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#495057', textTransform: 'uppercase', borderBottom: '1px solid #dee2e6' }}>ระดับชั้น</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#495057', textTransform: 'uppercase', borderBottom: '1px solid #dee2e6' }}>คะแนนรวม</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#495057', textTransform: 'uppercase', borderBottom: '1px solid #dee2e6' }}>วันที่ประเมิน</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#495057', textTransform: 'uppercase', borderBottom: '1px solid #dee2e6' }}>ผลการประเมิน</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#495057', textTransform: 'uppercase', borderBottom: '1px solid #dee2e6' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((response, index) => (
                    <tr key={response._id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#212529', borderBottom: '1px solid #e9ecef' }}>
                        <div>
                          <div style={{ fontWeight: 500 }}>{response.studentName}</div>
                          {response.studentId && <div style={{ fontSize: '12px', color: '#6c757d' }}>รหัส: {response.studentId}</div>}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#212529', borderBottom: '1px solid #e9ecef' }}>
                        {response.grade}{response.classroom && ` / ${response.classroom}`}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#212529', borderBottom: '1px solid #e9ecef', textAlign: 'center', fontWeight: 600 }}>
                        {response.sdqScore?.totalScore || 0}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#212529', borderBottom: '1px solid #e9ecef' }}>
                        {formatDate(response.submittedAt || response.assessmentDate)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#212529', borderBottom: '1px solid #e9ecef', textAlign: 'center' }}>
                        <span style={{ backgroundColor: getInterpretationColor(response.sdqScore?.interpretation || 'unknown'), color: 'white', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>
                          {response.sdqScore?.interpretation || 'unknown'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#212529', borderBottom: '1px solid #e9ecef', textAlign: 'center' }}>
                        <button onClick={() => setSelectedResponse(response)} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Response Detail Modal - เวอร์ชันปรับปรุงใหม่ */}
      {selectedResponse && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            {/* Header - Fixed ที่ด้านบน */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid #e9ecef',
              backgroundColor: 'white',
              borderRadius: '8px 8px 0 0',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#212529', margin: 0 }}>
                รายละเอียดผลการประเมิน SDQ
              </h3>
              <button
                onClick={() => setSelectedResponse(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>

            {/* Content - Scrollable */}
            <div style={{
              padding: '20px 24px',
              overflowY: 'auto',
              flex: 1
            }}>
              {/* ข้อมูลนักเรียน */}
              <div style={{ marginBottom: '24px', backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>ชื่อนักเรียน</div>
                    <div style={{ fontSize: '14px', color: '#212529', fontWeight: 500 }}>{selectedResponse.studentName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>ระดับชั้น</div>
                    <div style={{ fontSize: '14px', color: '#212529', fontWeight: 500 }}>{selectedResponse.grade} {selectedResponse.classroom && `/ ${selectedResponse.classroom}`}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>คะแนนรวม (4 ด้าน)</div>
                    <div style={{ fontSize: '16px', color: '#212529', fontWeight: 600 }}>
                      {(() => {
                        const emotional = calculateEmotionalScore(selectedResponse.answers);
                        const conduct = calculateConductScore(selectedResponse.answers);
                        const hyperactivity = calculateHyperactivityScore(selectedResponse.answers);
                        const peer = calculatePeerScore(selectedResponse.answers);
                        return emotional + conduct + hyperactivity + peer;
                      })()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>ผลการประเมิน</div>
                    <span style={{
                      backgroundColor: getInterpretationColor(selectedResponse.sdqScore?.interpretation || 'unknown'),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 500,
                      display: 'inline-block'
                    }}>
                      {selectedResponse.sdqScore?.interpretation || 'unknown'}
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>วันที่ประเมิน</div>
                  <div style={{ fontSize: '14px', color: '#212529' }}>{formatDate(selectedResponse.assessmentDate)}</div>
                </div>
              </div>

              {/* คะแนนแยกตามด้าน */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#212529', marginBottom: '16px', borderBottom: '2px solid #e9ecef', paddingBottom: '8px' }}>
                  คะแนนแยกตามด้าน
                </h4>

                {/* Emotional Score */}
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#212529' }}>พฤติกรรมด้านอารมณ์</strong>
                      <div style={{ fontSize: '11px', color: '#6c757d' }}>ข้อ: sdq3, sdq8, sdq13, sdq16, sdq24</div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#007bff' }}>
                      {calculateEmotionalScore(selectedResponse.answers)}
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', marginTop: '8px' }}>
                    {calculateEmotionalScore(selectedResponse.answers) <= 5 && <span style={{ color: '#28a745' }}>✅ ปกติ (0-5 คะแนน)</span>}
                    {calculateEmotionalScore(selectedResponse.answers) === 6 && <span style={{ color: '#ffc107' }}>⚠️ เสี่ยง (6 คะแนน)</span>}
                    {calculateEmotionalScore(selectedResponse.answers) >= 7 && <span style={{ color: '#dc3545' }}>🔴 มีปัญหา (7-10 คะแนน)</span>}
                  </div>
                </div>

                {/* Conduct Score */}
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#212529' }}>พฤติกรรมอยู่ไม่นิ่ง / สมาธิสั้น</strong>
                      <div style={{ fontSize: '11px', color: '#6c757d' }}>ข้อ: sdq5, sdq7, sdq12, sdq18, sdq22</div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#28a745' }}>
                      {calculateConductScore(selectedResponse.answers)}
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', marginTop: '8px' }}>
                    {calculateConductScore(selectedResponse.answers) <= 4 && <span style={{ color: '#28a745' }}>✅ ปกติ (0-4 คะแนน)</span>}
                    {calculateConductScore(selectedResponse.answers) === 5 && <span style={{ color: '#ffc107' }}>⚠️ เสี่ยง (5 คะแนน)</span>}
                    {calculateConductScore(selectedResponse.answers) >= 6 && <span style={{ color: '#dc3545' }}>🔴 มีปัญหา (6-10 คะแนน)</span>}
                  </div>
                </div>

                {/* Hyperactivity Score */}
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#212529' }}>พฤติกรรมเกเร / ความประพฤติ</strong>
                      <div style={{ fontSize: '11px', color: '#6c757d' }}>ข้อ: sdq2, sdq10, sdq15, sdq21, sdq25</div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#fd7e14' }}>
                      {calculateHyperactivityScore(selectedResponse.answers)}
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', marginTop: '8px' }}>
                    {calculateHyperactivityScore(selectedResponse.answers) <= 5 && <span style={{ color: '#28a745' }}>✅ ปกติ (0-5 คะแนน)</span>}
                    {calculateHyperactivityScore(selectedResponse.answers) === 6 && <span style={{ color: '#ffc107' }}>⚠️ เสี่ยง (6 คะแนน)</span>}
                    {calculateHyperactivityScore(selectedResponse.answers) >= 7 && <span style={{ color: '#dc3545' }}>🔴 มีปัญหา (7-10 คะแนน)</span>}
                  </div>
                </div>

                {/* Peer Score */}
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#212529' }}>พฤติกรรมด้านความสัมพันธ์กับเพื่อน</strong>
                      <div style={{ fontSize: '11px', color: '#6c757d' }}>ข้อ: sdq6, sdq11, sdq14, sdq19, sdq23</div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#6f42c1' }}>
                      {calculatePeerScore(selectedResponse.answers)}
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', marginTop: '8px' }}>
                    {calculatePeerScore(selectedResponse.answers) <= 3 && <span style={{ color: '#28a745' }}>✅ ปกติ (0-3 คะแนน)</span>}
                    {calculatePeerScore(selectedResponse.answers) === 4 && <span style={{ color: '#ffc107' }}>⚠️ เสี่ยง (4 คะแนน)</span>}
                    {calculatePeerScore(selectedResponse.answers) >= 5 && <span style={{ color: '#dc3545' }}>🔴 มีปัญหา (5-10 คะแนน)</span>}
                  </div>
                </div>

                {/* Prosocial Score */}
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#212529' }}>พฤติกรรมด้านสัมพันธภาพทางสังคม</strong>
                      <div style={{ fontSize: '11px', color: '#6c757d' }}>ข้อ: sdq1, sdq4, sdq9, sdq17, sdq20</div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#20c997' }}>
                      {calculateProsocialScore(selectedResponse.answers)}
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', marginTop: '8px' }}>
                    {calculateProsocialScore(selectedResponse.answers) >= 4 && <span style={{ color: '#28a745' }}>✅ มีจุดแข็ง (4-10 คะแนน)</span>}
                    {calculateProsocialScore(selectedResponse.answers) <= 3 && <span style={{ color: '#dc3545' }}>⚠️ ต่ำกว่าเกณฑ์ ไม่มีจุดแข็ง (0-3 คะแนน)</span>}
                  </div>
                </div>
              </div>

              {/* คำตอบแบบประเมิน */}
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#212529', marginBottom: '16px' }}>
                  คำตอบแบบประเมินรายข้อ
                </h4>
                {Object.entries(selectedResponse.answers).map(([questionId, answer]) => {
                  const answerText = answer === '0' ? 'ไม่จริง' : answer === '1' ? 'ค่อนข้างจริง' : answer === '2' ? 'จริงมาก' : answer;
                  return (
                    <div key={questionId} style={{ marginBottom: '12px', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <strong style={{ fontSize: '14px', color: '#495057' }}>{questionId.toUpperCase()}:</strong>{' '}
                      <span style={{ fontSize: '14px', color: '#212529' }}>{answerText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}