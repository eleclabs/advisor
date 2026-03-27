// app/forms/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
  order: number;
  questionText: string;
  questionType: 'radio' | 'checkbox' | 'text' | 'scale';
  options: string[];
  required: boolean;
}

interface Form {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  questions: Question[];
  createdByName: string;
}

export default function CustomFormPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [formId, setFormId] = useState<string>('');

  useEffect(() => {
    // Handle Next.js 15 params
    const init = async () => {
      const resolvedParams = await params;
      setFormId(resolvedParams.id as string);
    };
    init();
  }, [params]);

  useEffect(() => {
    loadUser();
    if (formId) {
      loadForm();
    }
  }, [formId]);

  const loadUser = async () => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  };

  const loadForm = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading form with ID:', formId);
      const res = await fetch(`/api/forms/${formId}`);
      const data = await res.json();
      
      console.log('📋 API Response:', data);
      
      if (data.success) {
        // ✅ ชั่วคราวปิดการตรวจสอบ status เพื่อ debug
        if (false && data.data.status !== 'active') {
          console.log('⚠️ Form is not active:', data.data.status);
          alert('แบบฟอร์มนี้ยังไม่เปิดใช้งาน');
          router.push('/forms');
          return;
        }
        console.log('✅ Form loaded successfully:', data.data.title, 'Status:', data.data.status);
        setForm(data.data);
      } else {
        console.log('❌ Form not found or error:', data.message);
        alert(data.message || 'ไม่พบแบบฟอร์ม');
        router.push('/forms');
      }
    } catch (error) {
      console.error('Error loading form:', error);
      alert('เกิดข้อผิดพลาดในการโหลดแบบฟอร์ม');
      router.push('/forms');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    // ลบ error เมื่อตอบแล้ว
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<number, string> = {};
    const requiredQuestions = form?.questions.filter(q => q.required) || [];
    
    requiredQuestions.forEach(q => {
      if (!answers[q.order] || (Array.isArray(answers[q.order]) && answers[q.order].length === 0)) {
        newErrors[q.order] = 'ข้อนี้ต้องตอบ';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('กรุณาตอบคำถามให้ครบทุกข้อ');
      // Scroll to first error
      const firstErrorId = Object.keys(errors)[0];
      if (firstErrorId) {
        document.getElementById(`question-${firstErrorId}`)?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (!currentUser) {
      alert('ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่');
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        answers: form?.questions.map(q => ({
          questionId: q.order,
          questionText: q.questionText,
          answer: answers[q.order]
        })) || [],
        userName: `${currentUser.first_name} ${currentUser.last_name}`,
        userEmail: currentUser.email,
        userRole: currentUser.role,
        userId: currentUser._id
      };

      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const data = await res.json();

      if (data.success) {
        alert('ส่งแบบฟอร์มสำเร็จ! ขอบคุณสำหรับคำตอบ');
        router.push('/forms');
      } else {
        alert(data.message || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#6c757d' }}>กำลังโหลดแบบฟอร์ม...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>❌</div>
          <p style={{ color: '#6c757d' }}>ไม่พบแบบฟอร์ม</p>
          <Link href="/forms" style={{ color: '#007bff', textDecoration: 'none' }}>← กลับไปหน้าแบบฟอร์ม</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #dee2e6', padding: '16px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          <Link href="/forms" style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#6c757d',
            textDecoration: 'none',
            fontSize: '14px',
            marginBottom: '8px'
          }}>
            ← กลับไปหน้าแบบฟอร์ม
          </Link>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, color: '#212529' }}>
            📝 {form.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        
        {/* Form Info */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #dee2e6'
        }}>
          <p style={{ fontSize: '14px', color: '#495057', lineHeight: 1.6, margin: '0 0 16px 0' }}>
            {form.description}
          </p>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>
            <div>👤 สร้างโดย: {form.createdByName}</div>
            <div>📊 จำนวนข้อคำถาม: {form.questions.length} ข้อ</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {form.questions.map((question, index) => (
              <div
                key={question.order}
                id={`question-${question.order}`}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '24px',
                  border: `1px solid ${errors[question.order] ? '#dc3545' : '#dee2e6'}`,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#212529', margin: '0 0 4px 0' }}>
                    ข้อที่ {question.order}: {question.questionText}
                    {question.required && <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>}
                  </h3>
                </div>

                {/* Scale (1-5) */}
                {question.questionType === 'scale' && (
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#6c757d',
                      marginBottom: '10px'
                    }}>
                      <span>น้อยที่สุด</span>
                      <span>น้อย</span>
                      <span>ปานกลาง</span>
                      <span>มาก</span>
                      <span>มากที่สุด</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <label
                          key={num}
                          style={{
                            flex: 1,
                            cursor: 'pointer',
                            padding: '12px 4px',
                            borderRadius: '4px',
                            textAlign: 'center',
                            backgroundColor: answers[question.order] === num ? '#007bff' : '#f8f9fa',
                            color: answers[question.order] === num ? 'white' : '#495057',
                            border: `1px solid ${answers[question.order] === num ? '#007bff' : '#dee2e6'}`,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <input
                            type="radio"
                            name={`question-${question.order}`}
                            value={num}
                            checked={answers[question.order] === num}
                            onChange={() => handleAnswerChange(question.order, num)}
                            style={{ display: 'none' }}
                          />
                          <div style={{ fontSize: '16px', fontWeight: 600 }}>{num}</div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Radio */}
                {question.questionType === 'radio' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {question.options.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '4px',
                          backgroundColor: answers[question.order] === option ? '#f8f9fa' : 'white',
                          border: `1px solid ${answers[question.order] === option ? '#007bff' : '#dee2e6'}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="radio"
                          name={`question-${question.order}`}
                          value={option}
                          checked={answers[question.order] === option}
                          onChange={() => handleAnswerChange(question.order, option)}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span style={{ fontSize: '14px', color: '#212529' }}>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Checkbox */}
                {question.questionType === 'checkbox' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {question.options.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '4px',
                          backgroundColor: Array.isArray(answers[question.order]) && answers[question.order].includes(option) ? '#f8f9fa' : 'white',
                          border: `1px solid ${Array.isArray(answers[question.order]) && answers[question.order].includes(option) ? '#007bff' : '#dee2e6'}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          value={option}
                          checked={Array.isArray(answers[question.order]) && answers[question.order].includes(option)}
                          onChange={(e) => {
                            const current = Array.isArray(answers[question.order]) ? answers[question.order] : [];
                            if (e.target.checked) {
                              handleAnswerChange(question.order, [...current, option]);
                            } else {
                              handleAnswerChange(question.order, current.filter((o: string) => o !== option));
                            }
                          }}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span style={{ fontSize: '14px', color: '#212529' }}>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Text */}
                {question.questionType === 'text' && (
                  <textarea
                    value={answers[question.order] || ''}
                    onChange={(e) => handleAnswerChange(question.order, e.target.value)}
                    placeholder="พิมพ์คำตอบของคุณ..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '4px',
                      border: '1px solid #ced4da',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'border-color 0.15s ease'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#007bff'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#ced4da'}
                  />
                )}

                {/* Error Message */}
                {errors[question.order] && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#dc3545',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>⚠️</span> {errors[question.order]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div style={{
            marginTop: '32px',
            padding: '24px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '13px', color: '#6c757d' }}>
              {currentUser && (
                <div>ส่งคำตอบโดย: {currentUser.first_name} {currentUser.last_name}</div>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: submitting ? '#6c757d' : '#28a745',
                color: 'white',
                padding: '12px 32px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease',
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? '⏳ กำลังส่ง...' : '✅ ส่งแบบฟอร์ม'}
            </button>
          </div>
        </form>

      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '24px 0',
        color: '#adb5bd',
        fontSize: '12px',
        borderTop: '1px solid #dee2e6',
        marginTop: '24px'
      }}>
        ระบบแบบฟอร์ม • {new Date().toLocaleDateString('th-TH')}
      </div>
    </div>
  );
}