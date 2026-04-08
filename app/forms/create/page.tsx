'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Option {
  id: string;
  text: string;
}

interface Question {
  order: number;
  questionText: string;
  questionType: 'radio' | 'checkbox' | 'text' | 'scale';
  options: Option[];
  required: boolean;
}

interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  order: number;
}

interface FormStructure {
  title: string;
  description: string;
  category: 'psychological' | 'survey' | 'custom';
  sections: Section[];
}

export default function CreateCustomFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'custom' as 'psychological' | 'survey' | 'custom',
    status: 'draft' as 'active' | 'inactive' | 'draft',
    startDate: '',
    endDate: ''
  });

  const [formStructure, setFormStructure] = useState<FormStructure>({
    title: '',
    description: '',
    category: 'custom',
    sections: [
      {
        id: 'section-1',
        title: 'หัวข้อที่ 1',
        description: '',
        questions: [
          {
            order: 1,
            questionText: '',
            questionType: 'scale',
            options: [
              { id: '1', text: '1' },
              { id: '2', text: '2' },
              { id: '3', text: '3' },
              { id: '4', text: '4' },
              { id: '5', text: '5' }
            ],
            required: true
          }
        ],
        order: 1
      }
    ]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
      }

      const studentRes = await fetch('/api/student');
      const studentData = await studentRes.json();
      if (studentData.success) {
        // Removed students state
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชันสำหรับจัดการหัวข้อ
  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: `หัวข้อที่ ${formStructure.sections.length + 1}`,
      description: '',
      questions: [],
      order: formStructure.sections.length + 1
    };
    setFormStructure(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const removeSection = (sectionId: string) => {
    setFormStructure(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  const updateSection = (sectionId: string, field: string, value: any) => {
    setFormStructure(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    }));
  };

  // ฟังก์ชันสำหรับจัดการคำถาม
  const addQuestion = (sectionId: string) => {
    const section = formStructure.sections.find(s => s.id === sectionId);
    const questionOrder = section ? section.questions.length + 1 : 1;
    
    const newQuestion: Question = {
      order: questionOrder,
      questionText: '',
      questionType: 'scale',
      options: [
        { id: '1', text: '1' },
        { id: '2', text: '2' },
        { id: '3', text: '3' },
        { id: '4', text: '4' },
        { id: '5', text: '5' }
      ],
      required: true
    };

    setFormStructure(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      )
    }));
  };

  const removeQuestion = (sectionId: string, questionOrder: number) => {
    setFormStructure(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          const updatedQuestions = section.questions
            .filter(q => q.order !== questionOrder)
            .map((q, index) => ({ ...q, order: index + 1 }));
          return { ...section, questions: updatedQuestions };
        }
        return section;
      })
    }));
  };

  const updateQuestion = (sectionId: string, questionOrder: number, field: string, value: any) => {
    setFormStructure(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            questions: section.questions.map(question =>
              question.order === questionOrder
                ? { ...question, [field]: value }
                : question
            )
          };
        }
        return section;
      })
    }));
  };

  // ฟังก์ชันสำหรับจัดการตัวเลือก
  const addOption = (sectionId: string, questionOrder: number) => {
    const newOption: Option = {
      id: `option-${Date.now()}`,
      text: ''
    };

    setFormStructure(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            questions: section.questions.map(question => {
              if (question.order === questionOrder) {
                return {
                  ...question,
                  options: [...question.options, newOption]
                };
              }
              return question;
            })
          };
        }
        return section;
      })
    }));
  };

  const removeOption = (sectionId: string, questionOrder: number, optionId: string) => {
    setFormStructure(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            questions: section.questions.map(question => {
              if (question.order === questionOrder) {
                return {
                  ...question,
                  options: question.options.filter(option => option.id !== optionId)
                };
              }
              return question;
            })
          };
        }
        return section;
      })
    }));
  };

  const updateOption = (sectionId: string, questionOrder: number, optionId: string, text: string) => {
    setFormStructure(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            questions: section.questions.map(question => {
              if (question.order === questionOrder) {
                return {
                  ...question,
                  options: question.options.map(option =>
                    option.id === optionId ? { ...option, text } : option
                  )
                };
              }
              return question;
            })
          };
        }
        return section;
      })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่');
      return;
    }

    // ตรวจสอบข้อมูลพื้นฐาน
    if (!formData.title || !formData.description) {
      alert('กรุณากรอกข้อมูลพื้นฐานให้ครบถ้วน');
      return;
    }

    // ตรวจสอบหัวข้อและคำถาม
    const hasValidSections = formStructure.sections.some(section => 
      section.title.trim() && section.questions.some(q => q.questionText.trim())
    );

    if (!hasValidSections) {
      alert('กรุณาเพิมหัวข้อและคำถามอย่างน้อย 1 หัวข้อ');
      return;
    }

    setLoading(true);

    try {
      // แปลงโครงสร้างเป็นรูปแบบเดียวกับเดิม
      const allQuestions: any[] = [];
      
      // สร้าง formStructure ที่ถูกต้องโดยเพิ่ม required fields ให้ questions
      const validFormStructure = {
        ...formStructure,
        sections: formStructure.sections.map((section, sectionIndex) => ({
          ...section,
          questions: section.questions.map((question) => ({
            ...question,
            sectionId: section.id,
            sectionTitle: section.title,
            sectionOrder: sectionIndex + 1
          }))
        }))
      };

      validFormStructure.sections.forEach((section, sectionIndex) => {
        section.questions.forEach((question) => {
          const formattedQuestion = {
            order: allQuestions.length + 1,
            questionText: `[${section.title}] ${question.questionText}`,
            questionType: question.questionType,
            options: question.options.map(opt => opt.text),
            required: question.required,
            sectionId: section.id,
            sectionTitle: section.title,
            sectionOrder: sectionIndex + 1
          };
          allQuestions.push(formattedQuestion);
        });
      });

      const submitData = {
        ...formData,
        type: 'custom',
        createdBy: currentUser._id,
        createdByName: `${currentUser.first_name} ${currentUser.last_name}`,
        questions: allQuestions,
        isVisibleToAdmin: true,
        formStructure: validFormStructure // ใช้ formStructure ที่ถูกต้อง
      };

      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (data.success) {
        alert('สร้างแบบฟอร์มสำเร็จ!');
        // ✅ Trigger refresh
        localStorage.setItem('formCreated', Date.now().toString());
        window.dispatchEvent(new Event('storage'));
        router.push('/forms');
      } else {
        alert(data.message || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
      }
    } catch (error) {
      console.error('Error creating form:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #dee2e6', padding: '16px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, color: '#212529' }}>
                📝 สร้างแบบฟอร์มกำหนดเอง
              </h1>
              <p style={{ margin: '4px 0 0', color: '#6c757d', fontSize: '14px' }}>
                ออกแบบข้อคำถามและกำหนดกลุ่มเป้าหมายเองได้
              </p>
            </div>
            <Link href="/forms" style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500
            }}>
              ← กลับไปรายการแบบฟอร์ม
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        
        <form onSubmit={handleSubmit}>
          
          {/* ข้อมูลพื้นฐาน */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dee2e6', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 20px', color: '#212529' }}>
              📋 ข้อมูลพื้นฐาน
            </h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#495057', marginBottom: '8px' }}>
                  ชื่อแบบฟอร์ม <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="เช่น แบบสำรวจความพึงพอใจกิจกรรม"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#495057', marginBottom: '8px' }}>
                  คำอธิบาย <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="อธิบายรายละเอียดของแบบฟอร์ม..."
                  required
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#495057', marginBottom: '8px' }}>
                    ประเภท
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', backgroundColor: 'white' }}
                  >
                    <option value="custom">แบบกำหนดเอง</option>
                    <option value="psychological">แบบประเมินจิตวิทยา</option>
                    <option value="survey">แบบสำรวจ</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#495057', marginBottom: '8px' }}>
                    สถานะ
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', backgroundColor: 'white' }}
                  >
                    <option value="draft">ฉบับร่าง</option>
                    <option value="active">เปิดใช้งาน</option>
                    <option value="inactive">ปิดใช้งาน</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* หัวข้อและคำถาม */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dee2e6', padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#212529' }}>
                หัวข้อและคำถาม ({formStructure.sections.length} หัวข้อ)
              </h2>
              <button
                type="button"
                onClick={addSection}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                เพิมหัวข้อ
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {formStructure.sections.map((section, sectionIndex) => (
                <div key={section.id} style={{
                  border: '2px solid #e9ecef',
                  borderRadius: '12px',
                  padding: '24px',
                  backgroundColor: '#fafbfc',
                  position: 'relative'
                }}>
                  {/* Header ของหัวข้อ */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: 600, 
                          color: '#007bff',
                          backgroundColor: '#e7f3ff',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}>
                          หัวข้อที่ {section.order}
                        </span>
                        {formStructure.sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSection(section.id)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            ลบหัวข้อ
                          </button>
                        )}
                      </div>
                      
                      <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#495057', marginBottom: '6px' }}>
                            ชื่อหัวข้อ <span style={{ color: '#dc3545' }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                            placeholder="เช่น ข้อมูลส่วนตัว"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }}
                          />
                        </div>
                        
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#495057', marginBottom: '6px' }}>
                            คำอธิบายหัวข้อ (ไม่จำเป็น)
                          </label>
                          <textarea
                            value={section.description}
                            onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                            placeholder="อธิบายรายละเอียดของหัวข้อ..."
                            rows={2}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', resize: 'vertical' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* คำถามในหัวข้อ */}
                  <div style={{ marginLeft: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#6c757d' }}>
                        คำถามในหัวข้อนี้ ({section.questions.length} ข้อ)
                      </span>
                      <button
                        type="button"
                        onClick={() => addQuestion(section.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        เพิมคำถาม
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {section.questions.map((question, qIndex) => (
                        <div key={qIndex} style={{
                          border: '1px solid #dee2e6',
                          borderRadius: '8px',
                          padding: '16px',
                          backgroundColor: 'white',
                          position: 'relative'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#495057' }}>
                              คำถามที่ {question.order}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeQuestion(section.id, question.order)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              ลบ
                            </button>
                          </div>

                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#495057', marginBottom: '6px' }}>
                              คำถาม <span style={{ color: '#dc3545' }}>*</span>
                            </label>
                            <input
                              type="text"
                              value={question.questionText}
                              onChange={(e) => updateQuestion(section.id, question.order, 'questionText', e.target.value)}
                              placeholder="พิมพ์คำถามที่นี่..."
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '13px' }}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#495057', marginBottom: '6px' }}>
                                ประเภทคำตอบ
                              </label>
                              <select
                                value={question.questionType}
                                onChange={(e) => updateQuestion(section.id, question.order, 'questionType', e.target.value)}
                                style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '12px', backgroundColor: 'white' }}
                              >
                                <option value="scale">ระดับคะแนน (1-5)</option>
                                <option value="radio">เลือกเดียว (Radio)</option>
                                <option value="checkbox">เลือกหลายข้อ (Checkbox)</option>
                                <option value="text">ข้อความ (Text)</option>
                              </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#495057', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={question.required}
                                  onChange={(e) => updateQuestion(section.id, question.order, 'required', e.target.checked)}
                                  style={{ width: '14px', height: '14px' }}
                                />
                                ต้องตอบ
                              </label>
                            </div>
                          </div>

                          {/* ตัวเลือกสำหรับ radio/checkbox */}
                          {(question.questionType === 'radio' || question.questionType === 'checkbox') && (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#495057' }}>
                                  ตัวเลือก
                                </label>
                                <button
                                  type="button"
                                  onClick={() => addOption(section.id, question.order)}
                                  style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#17a2b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  เพิมตัวเลือก
                                </button>
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {question.options.map((option, optIndex) => (
                                  <div key={option.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                      type="text"
                                      value={option.text}
                                      onChange={(e) => updateOption(section.id, question.order, option.id, e.target.value)}
                                      placeholder={`ตัวเลือกที่ ${optIndex + 1}`}
                                      style={{ flex: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '12px' }}
                                    />
                                    {question.options.length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => removeOption(section.id, question.order, option.id)}
                                        style={{
                                          padding: '4px 6px',
                                          backgroundColor: '#dc3545',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '4px',
                                          fontSize: '10px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        ลบ
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {section.questions.length === 0 && (
                      <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: '#6c757d',
                        fontSize: '13px',
                        border: '1px dashed #dee2e6',
                        borderRadius: '4px'
                      }}>
                        ยังไม่มีคำถามในหัวข้อนี้ คลิก "เพิมคำถาม" เพื่อเริ่ม
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {formStructure.sections.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6c757d',
                fontSize: '14px',
                border: '2px dashed #dee2e6',
                borderRadius: '8px'
              }}>
                ยังไม่มีหัวข้อ คลิก "เพิมหัวข้อ" เพื่อเริ่มสร้างแบบฟอร์ม
              </div>
            )}
          </div>

          {/* ปุ่มดำเนินการ */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#6c757d' : '#28a745',
                color: 'white',
                padding: '12px 32px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'กำลังสร้าง...' : '✅ สร้างแบบฟอร์ม'}
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/forms')}
              style={{
                backgroundColor: 'white',
                color: '#6c757d',
                padding: '12px 32px',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              ยกเลิก
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}