// app/forms/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// --- Component ย่อย (Styled like evaluation page) ---
const InputField = ({
  label,
  name,
  value,
  onChange,
  required = true,
  disabled = false
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  disabled?: boolean;
}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      marginBottom: '16px',
      padding: '20px 24px'
    }}>
      <label style={{
        fontSize: '14px',
        marginBottom: '12px',
        fontWeight: 500,
        color: '#212529',
        display: 'block'
      }}>
        {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '100%',
          maxWidth: '320px',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '14px',
          color: disabled ? '#6c757d' : '#212529',
          outline: 'none',
          transition: 'border-color 0.15s ease',
          backgroundColor: disabled ? '#e9ecef' : '#fff'
        }}
        placeholder="คำตอบของคุณ"
        required={required}
        onFocus={(e) => e.currentTarget.style.borderColor = '#2c3e50'}
        onBlur={(e) => e.currentTarget.style.borderColor = '#ced4da'}
      />
    </div>
  );
};

// Component Dropdown
const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  required = true
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      marginBottom: '16px',
      padding: '20px 24px'
    }}>
      <label style={{
        fontSize: '14px',
        marginBottom: '12px',
        fontWeight: 500,
        color: '#212529',
        display: 'block'
      }}>
        {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: '100%',
          maxWidth: '320px',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '14px',
          color: '#212529',
          outline: 'none',
          transition: 'border-color 0.15s ease',
          backgroundColor: '#fff',
          cursor: 'pointer'
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = '#2c3e50'}
        onBlur={(e) => e.currentTarget.style.borderColor = '#ced4da'}
      >
        <option value="">-- กรุณาเลือก --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const SectionHeader = ({ number, title, subtitle }: { number?: string; title: string; subtitle?: string }) => {
  return (
    <div style={{
      margin: '32px 0 20px 0',
      paddingBottom: '12px',
      borderBottom: '2px solid #e9ecef'
    }}>
      {number && (
        <div style={{
          fontSize: '13px',
          fontWeight: 500,
          color: '#6c757d',
          letterSpacing: '0.5px',
          marginBottom: '4px'
        }}>
          ส่วนที่ {number}
        </div>
      )}
      <div style={{
        fontSize: '20px',
        fontWeight: 600,
        color: '#212529',
        letterSpacing: '-0.2px'
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{
          fontSize: '13px',
          color: '#6c757d',
          marginTop: '6px'
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

// Question Component with styled radio scale
const QuestionScale = ({
  questionNumber,
  title,
  name,
  value,
  onChange,
  required = true
}: {
  questionNumber?: number;
  title: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      marginBottom: '16px',
      padding: '20px 24px'
    }}>
      <div style={{
        fontSize: '14px',
        marginBottom: '16px',
        fontWeight: 500,
        color: '#212529',
        lineHeight: 1.5
      }}>
        {questionNumber && <span style={{ color: '#6c757d', marginRight: '8px' }}>{questionNumber}.</span>}
        {title} {required && <span style={{ color: '#dc3545' }}>*</span>}
      </div>
      <div style={{ marginTop: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#6c757d',
          marginBottom: '10px',
          letterSpacing: '0.3px'
        }}>
          <span>น้อยที่สุด</span>
          <span>น้อย</span>
          <span>ปานกลาง</span>
          <span>มาก</span>
          <span>มากที่สุด</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          textAlign: 'center',
          gap: '8px'
        }}>
          {[1, 2, 3, 4, 5].map((num) => (
            <label
              key={num}
              style={{
                flex: 1,
                cursor: 'pointer',
                padding: '8px 4px',
                borderRadius: '4px',
                transition: 'all 0.15s ease',
                backgroundColor: value === num.toString() ? '#e9ecef' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (value !== num.toString()) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== num.toString()) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <input
                type="radio"
                name={name}
                value={num}
                checked={value === num.toString()}
                onChange={(e) => onChange(name, e.target.value)}
                style={{
                  marginBottom: '6px',
                  cursor: 'pointer',
                  width: '18px',
                  height: '18px',
                  display: 'block',
                  margin: '0 auto 6px auto',
                  accentColor: '#2c3e50'
                }}
              />
              <div style={{
                fontSize: '13px',
                fontWeight: value === num.toString() ? '500' : '400',
                color: '#495057'
              }}>
                {num}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// Radio Field Component
const RadioField = ({
  label,
  name,
  value,
  onChange,
  options,
  required = true
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      marginBottom: '16px',
      padding: '20px 24px'
    }}>
      <div style={{
        fontSize: '14px',
        marginBottom: '16px',
        fontWeight: 500,
        color: '#212529',
        lineHeight: 1.5
      }}>
        {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {options.map((option) => (
          <label
            key={option.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '4px',
              backgroundColor: value === option.value ? '#f8f9fa' : 'white',
              border: `1px solid ${value === option.value ? '#2c3e50' : '#dee2e6'}`,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(name, e.target.value)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: '#2c3e50'
              }}
            />
            <span style={{ fontSize: '14px', color: '#212529' }}>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// Checkbox Field Component
const CheckboxField = ({
  label,
  name,
  value,
  onChange,
  options,
  required = true
}: {
  label: string;
  name: string;
  value: string[];
  onChange: (name: string, value: string[]) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      marginBottom: '16px',
      padding: '20px 24px'
    }}>
      <div style={{
        fontSize: '14px',
        marginBottom: '16px',
        fontWeight: 500,
        color: '#212529',
        lineHeight: 1.5
      }}>
        {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {options.map((option) => (
          <label
            key={option.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '4px',
              backgroundColor: value.includes(option.value) ? '#f8f9fa' : 'white',
              border: `1px solid ${value.includes(option.value) ? '#2c3e50' : '#dee2e6'}`,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={value.includes(option.value)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange(name, [...value, option.value]);
                } else {
                  onChange(name, value.filter(v => v !== option.value));
                }
              }}
              style={{
                width: '18px',
                height: '18px',
                accentColor: '#2c3e50'
              }}
            />
            <span style={{ fontSize: '14px', color: '#212529' }}>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// Text Area Field Component
const TextAreaField = ({
  label,
  name,
  value,
  onChange,
  required = true
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      marginBottom: '16px',
      padding: '20px 24px'
    }}>
      <label style={{
        fontSize: '14px',
        marginBottom: '12px',
        fontWeight: 500,
        color: '#212529',
        display: 'block'
      }}>
        {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={4}
        style={{
          width: '100%',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          padding: '10px 12px',
          fontSize: '14px',
          color: '#212529',
          outline: 'none',
          transition: 'border-color 0.15s ease',
          fontFamily: 'inherit',
          resize: 'vertical',
          backgroundColor: '#fff'
        }}
        placeholder="พิมพ์คำตอบของคุณ..."
        onFocus={(e) => e.currentTarget.style.borderColor = '#2c3e50'}
        onBlur={(e) => e.currentTarget.style.borderColor = '#ced4da'}
      />
    </div>
  );
};

// Interfaces
interface Question {
  order: number;
  questionText: string;
  questionType: 'radio' | 'checkbox' | 'text' | 'scale';
  options: string[];
  required: boolean;
  sectionId?: string;
  sectionTitle?: string;
  sectionOrder?: number;
}

interface Form {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  questions: Question[];
  createdByName: string;
  formStructure?: {
    title: string;
    description: string;
    category: string;
    sections: {
      id: string;
      title: string;
      description: string;
      order: number;
      questions: Question[];
    }[];
  };
}

// Helper to group questions by section
const groupQuestionsBySection = (questions: Question[]) => {
  const sections: { title: string; order: number; questions: Question[] }[] = [];
  const currentSection: { [key: string]: Question[] } = {};

  questions.forEach((q) => {
    const sectionTitle = q.sectionTitle || 'คำถามทั่วไป';
    const sectionOrder = q.sectionOrder || 0;
    
    if (!currentSection[sectionTitle]) {
      currentSection[sectionTitle] = [];
      sections.push({ title: sectionTitle, order: sectionOrder, questions: currentSection[sectionTitle] });
    }
    currentSection[sectionTitle].push(q);
  });

  return sections.sort((a, b) => a.order - b.order);
};

export default function CustomFormPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
    gender?: string;
    birthDate?: string;
    ageRange?: string;
  } | null>(null);

  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [formId, setFormId] = useState<string>('');

  const genderOptions = [
    { value: 'male', label: 'ชาย' },
    { value: 'female', label: 'หญิง' },
    { value: 'other', label: 'อื่นๆ' }
  ];

  const ageRangeOptions = [
    { value: 'under-20', label: 'ต่ำกว่า 20 ปี' },
    { value: '20-30', label: '20 - 30 ปี' },
    { value: '31-40', label: '31 - 40 ปี' },
    { value: '41-50', label: '41 - 50 ปี' },
    { value: 'over-50', label: 'มากกว่า 50 ปี' }
  ];

  const roleOptions = [
    { value: 'ADMIN', label: 'ผู้ดูแลระบบ' },
    { value: 'TEACHER', label: 'อาจารย์' },
    { value: 'EXECUTIVE', label: 'ผู้บริหาร' },
    { value: 'COMMITTEE', label: 'คณะกรรมการ' }
  ];

  useEffect(() => {
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
    try {
      let storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        storedUser = localStorage.getItem('user') || localStorage.getItem('authUser');
      }
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const userData = {
          _id: user._id || user.id,
          firstName: user.firstName || user.first_name || user.name,
          lastName: user.lastName || user.last_name || user.surname,
          role: user.role || 'TEACHER',
          gender: user.gender || '',
          birthDate: user.birthDate || user.dob || user.date_of_birth,
          ageRange: calculateAgeRange(user.birthDate || user.dob || user.date_of_birth)
        };
        
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const calculateAgeRange = (birthDate: string): string => {
    if (!birthDate) return '';
    
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? age - 1 : age;
    
    if (actualAge < 20) return 'under-20';
    if (actualAge <= 30) return '20-30';
    if (actualAge <= 40) return '31-40';
    if (actualAge <= 50) return '41-50';
    return 'over-50';
  };

  const loadForm = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/forms/${formId}`);
      const data = await res.json();
      
      if (data.success) {
        setForm(data.data);
      } else {
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
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const renderQuestion = (question: Question, index: number) => {
    const answer = answers[question.order];

    switch (question.questionType) {
      case 'scale':
        return (
          <QuestionScale
            key={question.order}
            questionNumber={index + 1}
            title={question.questionText}
            name={`q${question.order}`}
            value={answer || ''}
            onChange={(name, value) => handleAnswerChange(question.order, value)}
            required={question.required}
          />
        );

      case 'radio':
        return (
          <RadioField
            key={question.order}
            label={`${index + 1}. ${question.questionText}`}
            name={`q${question.order}`}
            value={answer || ''}
            onChange={(name, value) => handleAnswerChange(question.order, value)}
            options={question.options.map(opt => ({ value: opt, label: opt }))}
            required={question.required}
          />
        );

      case 'checkbox':
        return (
          <CheckboxField
            key={question.order}
            label={`${index + 1}. ${question.questionText}`}
            name={`q${question.order}`}
            value={Array.isArray(answer) ? answer : []}
            onChange={(name, value) => handleAnswerChange(question.order, value)}
            options={question.options.map(opt => ({ value: opt, label: opt }))}
            required={question.required}
          />
        );

      case 'text':
        return (
          <TextAreaField
            key={question.order}
            label={`${index + 1}. ${question.questionText}`}
            name={`q${question.order}`}
            value={answer || ''}
            onChange={(e) => handleAnswerChange(question.order, e.target.value)}
            required={question.required}
          />
        );

      default:
        return null;
    }
  };

  const validateForm = () => {
    const newErrors: Record<number, string> = {};
    
    if (!form) return newErrors;

    form.questions.forEach((question) => {
      const answer = answers[question.order];
      if (question.required) {
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[question.order] = 'กรุณาตอบคำถามนี้';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('กรุณาตอบคำถามให้ครบทุกข้อ');
      return;
    }

    if (!currentUser) {
      alert('ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่');
      return;
    }

    setSubmitting(true);

    try {
      if (!form) {
        alert('ไม่พบข้อมูลแบบฟอร์ม');
        return;
      }

      const submitData = {
        formId: formId,
        userId: currentUser._id,
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        userRole: currentUser.role,
        answers: form.questions.map((question) => ({
          questionOrder: question.order,
          questionText: question.questionText,
          questionType: question.questionType,
          answer: answers[question.order] || '',
          sectionId: question.sectionId,
          sectionTitle: question.sectionTitle,
          sectionOrder: question.sectionOrder
        }))
      };

      const response = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          router.push(`/forms/${formId}/responses`);
        }, 3000);
      } else {
        alert(data.message || 'เกิดข้อผิดพลาดในการส่งแบบฟอร์ม');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('เกิดข้อผิดพลาดในการส่งแบบฟอร์ม');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (confirm('ล้างข้อมูลทั้งหมด?')) {
      setAnswers({});
      setErrors({});
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
          <p style={{ color: '#6c757d' }}>กำลังโหลดแบบฟอร์ม...</p>
        </div>
      </div>
    );
  }

  if (!form) {
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
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>❌</div>
          <p style={{ color: '#6c757d' }}>ไม่พบแบบฟอร์ม</p>
          <Link href="/forms" style={{ color: '#2c3e50', textDecoration: 'none' }}>← กลับไปหน้าแบบฟอร์ม</Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '48px 40px',
          textAlign: 'center',
          maxWidth: '480px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
          <h2 style={{
            color: '#212529',
            marginBottom: '8px',
            fontWeight: 500,
            fontSize: '24px'
          }}>
            ขอบคุณสำหรับการตอบแบบประเมิน
          </h2>
          <p style={{ color: '#6c757d', fontSize: '14px', lineHeight: 1.6 }}>
            คำตอบของท่านถูกบันทึกเรียบร้อยแล้ว
          </p>
          <p style={{ color: '#adb5bd', fontSize: '12px', marginTop: '24px' }}>
            กำลังนำท่านไปยังหน้าข้อมูลการตอบแบบฟอร์ม...
          </p>
        </div>
      </div>
    );
  }

  const sections = groupQuestionsBySection(form.questions);

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '40px 20px',
      display: 'flex',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{ width: '100%', maxWidth: '860px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#6c757d',
                letterSpacing: '0.5px',
                marginBottom: '8px',
                textTransform: 'uppercase'
              }}>
                แบบฟอร์ม
              </div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 600,
                color: '#212529',
                margin: '0 0 12px 0',
                letterSpacing: '-0.3px'
              }}>
                📝 {form.title}
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href="/assessment/charts" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: '#17a2b8',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#138496'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#17a2b8'; }}>
                📊 แผนภูมิสรุป
              </Link>
              <Link href={`/forms/${formId}/responses`} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0056b3'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#007bff'; }}>
                📊 ดูผลการตอบ
              </Link>
            </div>
          </div>
          <div style={{
            marginTop: '16px',
            fontSize: '12px',
            color: '#6c757d',
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <span>👤 สร้างโดย: {form.createdByName}</span>
            <span>📊 จำนวนข้อคำถาม: {form.questions.length} ข้อ</span>
          </div>
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#dc3545'
          }}>
            * ข้อความที่ต้องกรอก
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ข้อมูลผู้ประเมิน (เหมือน evaluation page) */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            marginBottom: '32px'
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e9ecef',
              backgroundColor: '#fefefe'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#495057' }}>ข้อมูลผู้ตอบแบบประเมิน</span>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {/* ชื่อ-นามสกุล */}
              <InputField 
                label="ชื่อ-นามสกุล" 
                name="studentName" 
                value={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : ''} 
                onChange={() => {}} 
                disabled={true}
              />
              
              {/* Role */}
              <SelectField
                label="บทบาท"
                name="role"
                value={currentUser?.role || ''}
                onChange={() => {}}
                options={roleOptions}
                required={false}
              />

              {/* เพศ */}
              <SelectField
                label="เพศ"
                name="gender"
                value={currentUser?.gender || ''}
                onChange={() => {}}
                options={genderOptions}
                required={false}
              />

              {/* ช่วงอายุ */}
              <SelectField
                label="ช่วงอายุ"
                name="ageRange"
                value={currentUser?.ageRange || ''}
                onChange={() => {}}
                options={ageRangeOptions}
                required={false}
              />
            </div>
          </div>

          {/* Render questions by section */}
          {sections.map((section, sectionIndex) => (
            <div key={section.title}>
              <SectionHeader 
                number={sections.length > 1 ? String(sectionIndex + 1) : undefined}
                title={section.title}
              />
              {section.questions.map((question, qIndex) => renderQuestion(question, qIndex))}
            </div>
          ))}

          {/* Error summary */}
          {Object.keys(errors).length > 0 && (
            <div style={{
              backgroundColor: '#fff5f5',
              border: '1px solid #feb2b2',
              borderRadius: '4px',
              padding: '16px 20px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#c53030', marginBottom: '8px' }}>
                ⚠️ กรุณาตอบคำถามให้ครบถ้วน
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#c53030' }}>
                {Object.entries(errors).map(([qId]) => {
                  const question = form?.questions.find(q => q.order === parseInt(qId));
                  return question && (
                    <li key={qId}>ข้อที่ {question.order}: {question.questionText.substring(0, 50)}...</li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginTop: '8px',
            marginBottom: '48px',
            paddingTop: '16px',
            borderTop: '1px solid #e9ecef'
          }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: '#2c3e50',
                color: 'white',
                padding: '10px 28px',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 500,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontFamily: 'inherit',
                transition: 'background-color 0.15s ease',
                opacity: submitting ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!submitting) e.currentTarget.style.backgroundColor = '#1e2a36';
              }}
              onMouseLeave={(e) => {
                if (!submitting) e.currentTarget.style.backgroundColor = '#2c3e50';
              }}
            >
              {submitting ? 'กำลังส่ง...' : 'ส่งแบบฟอร์ม'}
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  backgroundColor: 'transparent',
                  color: '#6c757d',
                  border: '1px solid #dee2e6',
                  padding: '9px 20px',
                  borderRadius: '4px',
                  fontWeight: 400,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#adb5bd';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#dee2e6';
                }}
              >
                ล้างข้อมูล
              </button>
              <Link
                href="/forms"
                style={{
                  backgroundColor: 'transparent',
                  color: '#6c757d',
                  border: '1px solid #dee2e6',
                  padding: '9px 20px',
                  borderRadius: '4px',
                  fontWeight: 400,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#adb5bd';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#dee2e6';
                }}
              >
                กลับ
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}