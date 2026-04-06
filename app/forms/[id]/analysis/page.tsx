'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
  order: number;
  questionText: string;
  questionType: 'radio' | 'checkbox' | 'text' | 'scale';
  options?: string[];
  required: boolean;
  sectionId?: string;
  sectionTitle?: string;
  sectionOrder?: number;
}

interface FormResponse {
  _id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  userGender?: string;
  userAgeRange?: string;
  userBirthDate?: string;
  answers: {
    questionId?: number;
    questionOrder?: number;
    questionText: string;
    questionType?: string;
    answer: any;
    sectionId?: string;
    sectionTitle?: string;
    sectionOrder?: number;
  }[];
  submittedAt: string;
}

interface Form {
  _id: string;
  title: string;
  description: string;
  category: string;
  questions: Question[];
  isStandard: boolean;
  status: string;
  createdByName: string;
  createdAt: string;
}

interface QuestionAnalysis {
  question: Question;
  totalResponses: number;
  answerStats: {
    [key: string]: {
      count: number;
      percentage: number;
      responses: string[];
    };
  };
  textResponses: {
    userName: string;
    answer: string;
    submittedAt: string;
  }[];
}

export default function FormAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [questionAnalyses, setQuestionAnalyses] = useState<QuestionAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionAnalysis | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchFormData(params.id as string);
    }
  }, [params.id]);

  const fetchFormData = async (formId: string) => {
    try {
      setLoading(true);
      
      // Fetch form data
      const formResponse = await fetch(`/api/forms/${formId}`);
      const formData = await formResponse.json();
      
      if (formData.success) {
        setForm(formData.data);
        
        // Fetch responses
        const responsesResponse = await fetch(`/api/forms/${formId}/responses`);
        const responsesData = await responsesResponse.json();
        
        if (responsesData.success) {
          setResponses(responsesData.data.responses);
          analyzeQuestions(formData.data.questions, responsesData.data.responses);
        }
      } else {
        setError(formData.message || 'Failed to fetch form data');
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const analyzeQuestions = (questions: Question[], responseList: FormResponse[]) => {
    const analyses: QuestionAnalysis[] = questions.map(question => {
      const analysis: QuestionAnalysis = {
        question,
        totalResponses: responseList.length,
        answerStats: {},
        textResponses: []
      };

      // Analyze answers for this question
      responseList.forEach(response => {
        const answer = response.answers.find((a: any) => a.questionOrder === question.order || a.questionId === question.order);
        
        if (answer) {
          if (question.questionType === 'text') {
            // For text questions, store individual responses
            analysis.textResponses.push({
              userName: response.userName,
              answer: answer.answer,
              submittedAt: response.submittedAt
            });
          } else if (question.questionType === 'checkbox') {
            // For checkbox questions, handle multiple selections
            const selections = Array.isArray(answer.answer) ? answer.answer : [answer.answer];
            selections.forEach(selection => {
              if (!analysis.answerStats[selection]) {
                analysis.answerStats[selection] = {
                  count: 0,
                  percentage: 0,
                  responses: []
                };
              }
              analysis.answerStats[selection].count++;
              analysis.answerStats[selection].responses.push(response.userName);
            });
          } else {
            // For radio and scale questions
            const answerKey = String(answer.answer);
            if (!analysis.answerStats[answerKey]) {
              analysis.answerStats[answerKey] = {
                count: 0,
                percentage: 0,
                responses: []
              };
            }
            analysis.answerStats[answerKey].count++;
            analysis.answerStats[answerKey].responses.push(response.userName);
          }
        }
      });

      // Calculate percentages
      Object.keys(analysis.answerStats).forEach(key => {
        analysis.answerStats[key].percentage = (analysis.answerStats[key].count / analysis.totalResponses) * 100;
      });

      return analysis;
    });

    setQuestionAnalyses(analyses);
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

  const getQuestionTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'radio': 'เลือกตัวเลือกเดียว',
      'checkbox': 'เลือกได้หลายตัวเลือก',
      'text': 'ข้อความ',
      'scale': 'มาตราส่วน'
    };
    return typeMap[type] || type;
  };

  const getBarColor = (index: number) => {
    const colors = ['#007bff', '#28a745', '#ffc107', '#fd7e14', '#dc3545', '#6f42c1', '#17a2b8', '#343a40'];
    return colors[index % colors.length];
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

  if (error || !form) {
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
            {error || 'ไม่พบข้อมูลแบบฟอร์ม'}
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
            รายงานวิเคราะห์แบบฟอร์ม
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
            {form.title} • {responses.length} คำตอบ • {form.questions.length} คำถาม
          </p>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#007bff', marginBottom: '8px' }}>
              {responses.length}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              คำตอบทั้งหมด
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
              {form.questions.length}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              คำถามทั้งหมด
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
              {form.questions.filter(q => q.questionType === 'text').length}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              คำถามข้อความ
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
              {Math.round((responses.length / Math.max(1, form.questions.length)) * 10) / 10}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              คำตอบเฉลี่ยต่อคำถาม
            </div>
          </div>
        </div>

        {/* Question Analysis */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#212529', marginBottom: '24px' }}>
            วิเคราะห์ต่อคำถาม
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {questionAnalyses.map((analysis, index) => (
              <div key={analysis.question.order} style={{
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '24px',
                backgroundColor: '#fafbfc'
              }}>
                {/* Question Header */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#212529',
                        marginBottom: '8px',
                        lineHeight: 1.4
                      }}>
                        {index + 1}. {analysis.question.questionText}
                      </h3>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '12px',
                          color: '#6c757d',
                          backgroundColor: '#e9ecef',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}>
                          {getQuestionTypeLabel(analysis.question.questionType)}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: '#6c757d'
                        }}>
                          {analysis.question.questionType === 'text' 
                            ? `${analysis.textResponses.length}/${analysis.totalResponses}` 
                            : `${Object.values(analysis.answerStats).reduce((sum, stat) => sum + stat.count, 0)}/${analysis.totalResponses}`
                          } คำตอบ
                        </span>
                        {analysis.question.sectionTitle && (
                          <span style={{
                            fontSize: '12px',
                            color: '#007bff',
                            backgroundColor: '#e7f3ff',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}>
                            {analysis.question.sectionTitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts for non-text questions */}
                {analysis.question.questionType !== 'text' && Object.keys(analysis.answerStats).length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {Object.entries(analysis.answerStats)
                        .sort(([,a], [,b]) => b.count - a.count)
                        .map(([answer, stats], answerIndex) => (
                          <div key={answer} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ minWidth: '120px', fontSize: '14px', color: '#495057' }}>
                              {answer}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                height: '32px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                position: 'relative'
                              }}>
                                <div style={{
                                  width: `${stats.percentage}%`,
                                  height: '100%',
                                  backgroundColor: getBarColor(answerIndex),
                                  transition: 'width 0.3s ease'
                                }} />
                                <div style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '12px',
                                  transform: 'translateY(-50%)',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: '#fff',
                                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                }}>
                                  {stats.count} ({stats.percentage.toFixed(1)}%)
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Text responses preview */}
                {analysis.question.questionType === 'text' && analysis.textResponses.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <button
                        onClick={() => setSelectedQuestion(analysis)}
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        ดูคำตอบข้อความ ({analysis.textResponses.length} คำตอบ)
                      </button>
                    </div>
                    {/* Preview first 3 responses */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {analysis.textResponses.slice(0, 3).map((response, i) => (
                        <div key={i} style={{
                          backgroundColor: '#f8f9fa',
                          padding: '12px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          color: '#495057',
                          border: '1px solid #e9ecef'
                        }}>
                          <div style={{ fontWeight: 500, marginBottom: '4px', color: '#212529' }}>
                            {response.userName}
                          </div>
                          <div style={{ lineHeight: 1.4 }}>
                            {response.answer.length > 100 ? response.answer.substring(0, 100) + '...' : response.answer}
                          </div>
                        </div>
                      ))}
                      {analysis.textResponses.length > 3 && (
                        <div style={{ fontSize: '12px', color: '#6c757d', textAlign: 'center' }}>
                          และอีก {analysis.textResponses.length - 3} คำตอบ...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No responses */}
                {analysis.question.questionType !== 'text' && Object.keys(analysis.answerStats).length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#6c757d',
                    fontSize: '14px'
                  }}>
                    ยังไม่มีคำตอบสำหรับคำถามนี้
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Text Responses Modal */}
      {selectedQuestion && (
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
            padding: '24px',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#212529', margin: 0 }}>
                คำตอบข้อความ: {selectedQuestion.question.questionText}
              </h3>
              <button
                onClick={() => setSelectedQuestion(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedQuestion.textResponses.map((response, index) => (
                <div key={index} style={{
                  backgroundColor: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 500, color: '#212529' }}>
                      {response.userName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      {formatDate(response.submittedAt)}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#495057', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {response.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
