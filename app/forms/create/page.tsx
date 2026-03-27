'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
  order: number;
  questionText: string;
  questionType: 'radio' | 'checkbox' | 'text' | 'scale';
  options: string[];
  required: boolean;
}

export default function CreateCustomFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'custom' as 'psychological' | 'survey' | 'custom',
    targetRoles: [] as string[],
    targetStudents: [] as string[],
    targetAllStudents: false,
    status: 'draft' as 'active' | 'inactive' | 'draft',
    startDate: '',
    endDate: ''
  });

  const [questions, setQuestions] = useState<Question[]>([
    { order: 1, questionText: '', questionType: 'scale', options: ['1', '2', '3', '4', '5'], required: true }
  ]);

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
        setStudents(studentData.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role]
    }));
  };

  // เพิ่มข้อคำถามใหม่
  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { order: prev.length + 1, questionText: '', questionType: 'scale', options: ['1', '2', '3', '4', '5'], required: true }
    ]);
  };

  // ลบข้อคำถาม
  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('ต้องมีอย่างน้อย 1 ข้อคำถาม');
      return;
    }
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // อัปเดตข้อคำถาม
  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  // เพิ่มตัวเลือกสำหรับ radio/checkbox
  const addOption = (questionIndex: number) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex ? { ...q, options: [...q.options, `ตัวเลือก ${q.options.length + 1}`] } : q
    ));
  };

  // ลบตัวเลือก
  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex ? { ...q, options: q.options.filter((_, j) => j !== optionIndex) } : q
    ));
  };

  // อัปเดตตัวเลือก
  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => 
      i === questionIndex ? { ...q, options: q.options.map((opt, j) => j === optionIndex ? value : opt) } : q
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert('ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่');
      return;
    }

    if (!formData.title || !formData.description) {
      alert('กรุณากรอกชื่อและคำอธิบายแบบฟอร์ม');
      return;
    }

    if (questions.some(q => !q.questionText.trim())) {
      alert('กรุณากรอกข้อความทุกข้อคำถาม');
      return;
    }

    if (formData.targetRoles.length === 0 && formData.targetStudents.length === 0 && !formData.targetAllStudents) {
      alert('กรุณาเลือกกลุ่มเป้าหมายอย่างน้อย 1 กลุ่ม');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        type: 'custom',
        createdBy: currentUser._id,
        createdByName: `${currentUser.first_name} ${currentUser.last_name}`,
        questions,
        isVisibleToAdmin: true
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

  const roleOptions = [
    { value: 'STUDENT', label: 'นักเรียน', color: '#007bff' },
    { value: 'TEACHER', label: 'อาจารย์', color: '#28a745' },
    { value: 'ADMIN', label: 'ผู้ดูแลระบบ', color: '#dc3545' },
    { value: 'EXECUTIVE', label: 'ผู้บริหาร', color: '#6f42c1' },
    { value: 'COMMITTEE', label: 'คณะกรรมการ', color: '#17a2b8' }
  ];

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

          {/* ข้อคำถาม */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dee2e6', padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#212529' }}>
                ❓ ข้อคำถาม ({questions.length} ข้อ)
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                ➕ เพิ่มข้อคำถาม
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questions.map((question, qIndex) => (
                <div key={qIndex} style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#fafafa',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#495057' }}>
                      ข้อที่ {question.order}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ ลบข้อ
                    </button>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#495057', marginBottom: '6px' }}>
                      ข้อคำถาม <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={question.questionText}
                      onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                      placeholder="พิมพ์ข้อคำถามที่นี่..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#495057', marginBottom: '6px' }}>
                        ประเภทคำตอบ
                      </label>
                      <select
                        value={question.questionType}
                        onChange={(e) => updateQuestion(qIndex, 'questionType', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '13px', backgroundColor: 'white' }}
                      >
                        <option value="scale">ระดับคะแนน (1-5)</option>
                        <option value="radio">เลือกเดียว (Radio)</option>
                        <option value="checkbox">เลือกหลายข้อ (Checkbox)</option>
                        <option value="text">ข้อความ (Text)</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#495057', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateQuestion(qIndex, 'required', e.target.checked)}
                          style={{ width: '16px', height: '16px' }}
                        />
                        ต้องตอบ
                      </label>
                    </div>
                  </div>

                  {/* ตัวเลือกสำหรับ radio/checkbox */}
                  {(question.questionType === 'radio' || question.questionType === 'checkbox') && (
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#495057', marginBottom: '8px' }}>
                        ตัวเลือก
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              placeholder={`ตัวเลือก ${oIndex + 1}`}
                              style={{ flex: 1, padding: '8px 10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '13px' }}
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, oIndex)}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOption(qIndex)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            alignSelf: 'flex-start'
                          }}
                        >
                          + เพิ่มตัวเลือก
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* กลุ่มเป้าหมาย */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dee2e6', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 20px', color: '#212529' }}>
              🎯 กลุ่มเป้าหมาย
            </h2>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#495057', marginBottom: '12px' }}>
                เลือกตามบทบาท
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {roleOptions.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleToggle(role.value)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: formData.targetRoles.includes(role.value) ? role.color : 'white',
                      color: formData.targetRoles.includes(role.value) ? 'white' : '#495057',
                      border: `1px solid ${formData.targetRoles.includes(role.value) ? role.color : '#dee2e6'}`,
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#dc3545', marginTop: '8px' }}>
                ⚠️ ผู้ดูแลระบบ (Admin) จะเห็นแบบฟอร์มทั้งหมด ไม่สามารถซ่อนได้
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#495057' }}>
                  เลือกนักเรียนเฉพาะ (ถ้ามี)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#495057', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.targetAllStudents}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAllStudents: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  เลือกนักเรียนทั้งหมด ({students.length} คน)
                </label>
              </div>

              {!formData.targetAllStudents && (
                <div style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto', 
                  border: '1px solid #dee2e6', 
                  borderRadius: '4px',
                  padding: '12px'
                }}>
                  {students.length === 0 ? (
                    <p style={{ color: '#6c757d', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                      ไม่พบข้อมูลนักเรียน
                    </p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px' }}>
                      {students.map((student) => (
                        <label
                          key={student._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            backgroundColor: formData.targetStudents.includes(student._id) ? '#e7f3ff' : 'white',
                            border: `1px solid ${formData.targetStudents.includes(student._id) ? '#007bff' : '#dee2e6'}`,
                            borderRadius: '4px',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.targetStudents.includes(student._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, targetStudents: [...prev.targetStudents, student._id] }));
                              } else {
                                setFormData(prev => ({ ...prev, targetStudents: prev.targetStudents.filter(id => id !== student._id) }));
                              }
                            }}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>{student.prefix} {student.first_name} {student.last_name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
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