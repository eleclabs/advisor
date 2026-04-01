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
  submittedAt: string;
  answers: any[];
}

interface Form {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  questions: any[];
  createdByName: string;
}

interface ResponsesData {
  form: Form;
  responses: FormResponse[];
  stats: {
    totalResponses: number;
    averageCompletion: number;
    responsesByRole: any;
    responsesByGender: any;
    responsesByAgeRange: any;
    submissionDates: any[];
  };
  pagination: {
    current: number;
    total: number;
    count: number;
    totalItems: number;
  };
}

export default function FormResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const [responsesData, setResponsesData] = useState<ResponsesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (params.id) {
      fetchResponses(params.id as string, currentPage, sortBy, sortOrder);
    }
  }, [params.id, currentPage, sortBy, sortOrder]);

  const fetchResponses = async (formId: string, page: number, sort: string, order: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/forms/${formId}/responses?page=${page}&sortBy=${sort}&sortOrder=${order}`);
      const data = await response.json();

      if (data.success) {
        setResponsesData(data.data);
      } else {
        setError(data.message || 'Failed to fetch responses');
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
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
      'under-20': 'ต่ำกว่า 20',
      '20-30': '20-30',
      '31-40': '31-40',
      '41-50': '41-50',
      'over-50': 'มากกว่า 50'
    };
    return ageMap[ageRange] || ageRange || 'ไม่ระบุ';
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
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

  if (error || !responsesData) {
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

  const { form, responses, stats, pagination } = responsesData;

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
            ข้อมูลการตอบแบบฟอร์ม
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#212529',
            margin: '0 0 12px 0',
            letterSpacing: '-0.3px'
          }}>
            📋 {form.title}
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6c757d',
            lineHeight: 1.6,
            margin: 0
          }}>
            {form.description}
          </p>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
              {stats.totalResponses}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>การตอบแบบฟอร์มทั้งหมด</div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#28a745', marginBottom: '8px' }}>
              {stats.averageCompletion}%
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>อัตราการทำแบบฟอร์มเสร็จ</div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#212529', marginBottom: '12px' }}>
              ตามบทบาท
            </div>
            {Object.entries(stats.responsesByRole).map(([role, count]: any) => (
              <div key={role} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#6c757d' }}>{getRoleLabel(role)}</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#212529' }}>{count}</span>
              </div>
            ))}
          </div>
          
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#212529', marginBottom: '12px' }}>
              ตามเพศ
            </div>
            {Object.entries(stats.responsesByGender).map(([gender, count]: any) => (
              <div key={gender} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#6c757d' }}>{getGenderLabel(gender)}</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#212529' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Charts and Analysis Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '32px', 
            border: '2px solid #007bff',
            boxShadow: '0 4px 12px rgba(0,123,255,0.15)',
            marginBottom: '24px'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 700, 
              margin: '0 0 24px', 
              color: '#007bff',
              textAlign: 'center'
            }}>
              📊 การวิเคราะห์ข้อมูลการตอบแบบฟอร์ม
            </h2>

            {/* Question Analysis Charts */}
            <div style={{ display: 'grid', gap: '24px' }}>
              {form.questions.map((question, qIndex) => {
                // Calculate answer statistics for this question
                const answerStats = responses.reduce((acc: any, response) => {
                  const answer = response.answers.find((a: any) => a.questionOrder === question.order);
                  if (answer) {
                    const key = answer.answer || 'ไม่ตอบ';
                    acc[key] = (acc[key] || 0) + 1;
                  }
                  return acc;
                }, {});

                const totalAnswers = Object.values(answerStats).reduce((sum: number, count: any) => sum + count, 0);
                const answerPercentages: Record<string, number> = {};
                Object.entries(answerStats).forEach(([key, count]) => {
                  answerPercentages[key] = totalAnswers > 0 ? Math.round((Number(count) / totalAnswers) * 100 * 10) / 10 : 0;
                });

                // Get colors for chart
                const colors = ['#007bff', '#28a745', '#ffc107', '#fd7e14', '#dc3545', '#6f42c1', '#20c997', '#6c757d'];

                return (
                  <div key={question.order} style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '20px',
                    border: '1px solid #dee2e6'
                  }}>
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ 
                        fontSize: '16px', 
                        fontWeight: 600, 
                        margin: '0 0 8px', 
                        color: '#212529' 
                      }}>
                        ข้อที่ {question.order}: {question.questionText}
                      </h3>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        ประเภท: {question.questionType} • ผู้ตอบ: {totalAnswers}/{responses.length}
                      </div>
                    </div>

                    {/* Bar Chart */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: '#495057' }}>
                        📈 กราฟแท่งคำตอบ
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', padding: '8px' }}>
                        {Object.entries(answerPercentages).map(([answer, percentage], index) => (
                          <div key={answer} style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            flex: 1,
                            maxWidth: '80px'
                          }}>
                            <div style={{
                              width: '100%',
                              height: `${Math.max(8, percentage)}%`,
                              backgroundColor: colors[index % colors.length],
                              borderRadius: '4px 4px 0 0',
                              minHeight: '8px',
                              transition: 'all 0.3s ease'
                            }}
                              title={`${answer}: ${percentage}%`}
                            />
                            <div style={{ 
                              fontSize: '10px', 
                              textAlign: 'center', 
                              marginTop: '4px',
                              color: '#495057',
                              fontWeight: 500
                            }}>
                              {String(answer).length > 10 ? String(answer).substring(0, 10) + '...' : String(answer)}
                            </div>
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#6c757d',
                              fontWeight: 600
                            }}>
                              {percentage}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pie Chart */}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: '#495057' }}>
                        🥧 กราฟวงกลมคำตอบ
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ 
                          width: '120px', 
                          height: '120px', 
                          borderRadius: '50%',
                          background: `conic-gradient(${Object.entries(answerPercentages).map(([answer, percentage], index) => 
                            `${colors[index % colors.length]} 0deg ${percentage * 3.6}deg`
                          ).join(', ')}`,
                          position: 'relative',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#495057'
                          }}>
                            {totalAnswers}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          {Object.entries(answerPercentages).map(([answer, percentage], index) => (
                            <div key={answer} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px',
                              marginBottom: '4px'
                            }}>
                              <div style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: colors[index % colors.length],
                                borderRadius: '2px'
                              }} />
                              <span style={{ fontSize: '12px', color: '#495057' }}>
                                {String(answer)}: <strong>{percentage}%</strong> ({answerStats[answer as keyof typeof answerStats] || 0} คน)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Statistics */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            border: '2px solid #28a745',
            boxShadow: '0 4px 12px rgba(40,167,69,0.15)'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 700, 
              margin: '0 0 20px', 
              color: '#28a745',
              textAlign: 'center'
            }}>
              📈 สรุปสถิติการตอบแบบฟอร์ม
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {/* Average completion per question */}
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#007bff', marginBottom: '8px' }}>
                  {((form.questions.length * responses.length) / responses.length).toFixed(0)}
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d', fontWeight: 500 }}>คำถามที่ถูกตอบเฉลี่ย</div>
              </div>

              {/* Most answered question */}
              {(() => {
                const questionAnswerCounts = form.questions.map(question => {
                  const count = responses.filter(response => 
                    response.answers.some(answer => answer.questionOrder === question.order && answer.answer)
                  ).length;
                  return { question: question.questionText.substring(0, 30) + '...', count };
                });
                const mostAnswered = questionAnswerCounts.reduce((max, current) => 
                  current.count > max.count ? current : max, questionAnswerCounts[0]
                );
                return (
                  <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#28a745', marginBottom: '8px' }}>
                      {mostAnswered.count}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d', fontWeight: 500 }}>คำถามที่ตอบมากสุด</div>
                    <div style={{ fontSize: '10px', color: '#495057', marginTop: '4px' }}>
                      {mostAnswered.question}
                    </div>
                  </div>
                );
              })()}

              {/* Response rate */}
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffc107', marginBottom: '8px' }}>
                  {stats.averageCompletion}%
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d', fontWeight: 500 }}>อัตราการทำแบบฟอร์มเสร็จ</div>
              </div>

              {/* Daily average */}
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#fd7e14', marginBottom: '8px' }}>
                  {(() => {
                    if (responses.length === 0) return '0';
                    const oldestDate = new Date(responses[responses.length - 1].submittedAt);
                    const daysDiff = Math.max(1, Math.ceil((new Date().getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)));
                    return (responses.length / daysDiff).toFixed(1);
                  })()}
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d', fontWeight: 500 }}>ค่าเฉลี่ยต่อวัน</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            แสดง {pagination.count} จาก {pagination.totalItems} รายการ
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="submittedAt">วันที่ส่ง</option>
              <option value="userName">ชื่อผู้ตอบ</option>
              <option value="userRole">บทบาท</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '6px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer'
              }}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Responses Table */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#495057',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #dee2e6',
                    cursor: 'pointer'
                  }} onClick={() => handleSort('userName')}>
                    ชื่อผู้ตอบ {getSortIcon('userName')}
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#495057',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #dee2e6',
                    cursor: 'pointer'
                  }} onClick={() => handleSort('userRole')}>
                    บทบาท {getSortIcon('userRole')}
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
                    เพศ
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
                    ช่วงอายุ
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#495057',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #dee2e6',
                    cursor: 'pointer'
                  }} onClick={() => handleSort('submittedAt')}>
                    วันที่ส่ง {getSortIcon('submittedAt')}
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
                    จัดการ
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
                      borderBottom: '1px solid #e9ecef'
                    }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{response.userName}</div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>{response.userEmail}</div>
                      </div>
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: '14px',
                      color: '#212529',
                      borderBottom: '1px solid #e9ecef'
                    }}>
                      {getRoleLabel(response.userRole)}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: '14px',
                      color: '#212529',
                      borderBottom: '1px solid #e9ecef'
                    }}>
                      {getGenderLabel(response.userGender || '')}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: '14px',
                      color: '#212529',
                      borderBottom: '1px solid #e9ecef'
                    }}>
                      {getAgeRangeLabel(response.userAgeRange || '')}
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
                      color: '#212529',
                      borderBottom: '1px solid #e9ecef',
                      textAlign: 'center'
                    }}>
                      <Link
                        href={`/forms/${params.id as string}/analysis/${response._id}`}
                        style={{
                          color: '#007bff',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: 500,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#e3f2fd',
                          display: 'inline-block'
                        }}
                      >
                        📊 วิเคราะห์
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {responses.length === 0 && (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#6c757d'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <p>ยังไม่มีการตอบแบบฟอร์ม</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.total > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '24px'
          }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              style={{
                padding: '8px 12px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                backgroundColor: currentPage === 1 ? '#f8f9fa' : 'white',
                color: currentPage === 1 ? '#6c757d' : '#212529'
              }}
            >
              ก่อนหน้า
            </button>
            
            {Array.from({ length: pagination.total }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  backgroundColor: currentPage === page ? '#007bff' : 'white',
                  color: currentPage === page ? 'white' : '#212529'
                }}
              >
                {page}
              </button>
            ))}
            
            <button
              disabled={currentPage === pagination.total}
              onClick={() => setCurrentPage(currentPage + 1)}
              style={{
                padding: '8px 12px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: currentPage === pagination.total ? 'not-allowed' : 'pointer',
                backgroundColor: currentPage === pagination.total ? '#f8f9fa' : 'white',
                color: currentPage === pagination.total ? '#6c757d' : '#212529'
              }}
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
