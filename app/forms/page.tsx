'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Assessment {
  _id: string;
  title: string;
  description: string;
  type: 'sdq' | 'dass21';
  status: 'active' | 'inactive';
  created_at: string;
}

interface Evaluation {
  _id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  created_at: string;
}

interface CustomForm {
  _id: string;
  title: string;
  description: string;
  category: 'psychological' | 'survey' | 'custom';
  isStandard: boolean;
  createdBy?: string;
  createdByName?: string;
  status: 'active' | 'inactive' | 'draft';
  questions?: any[];
  created_at: string;
}

export default function StudentFormsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [customForms, setCustomForms] = useState<CustomForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assessments' | 'evaluations' | 'custom'>('assessments');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // ✅ โหลด currentUser ก่อน
  useEffect(() => {
    const init = async () => {
      await loadCurrentUser();
    };
    init();
  }, []);

  // ✅ โหลดข้อมูลเมื่อ currentUser พร้อมแล้ว
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadCurrentUser = async () => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        console.log('✅ User loaded:', user);
        setCurrentUser(user);
      } else {
        console.log('⚠️ No user in localStorage');
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadData = async () => {
    if (!currentUser) {
      console.log('⚠️ No currentUser, skipping loadData');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Loading data for user:', currentUser._id, currentUser.role);
      
      const assessmentRes = await fetch('/api/assessment');
      const assessmentData = await assessmentRes.json();
      if (assessmentData.success) {
        setAssessments(assessmentData.assessments || []);
        console.log('✅ Assessments:', assessmentData.assessments?.length);
      }

      const evaluationRes = await fetch('/api/evaluation');
      const evaluationData = await evaluationRes.json();
      if (evaluationData.success) {
        setEvaluations(evaluationData.evaluations || []);
        console.log('✅ Evaluations:', evaluationData.evaluations?.length);
      }

      // ✅ โหลดแบบฟอร์มกำหนดเอง
      const formsRes = await fetch(`/api/forms?userId=${currentUser._id}&userRole=${currentUser.role}`);
      const formsData = await formsRes.json();
      console.log('📋 Forms API Response:', formsData);
      
      if (formsData.success) {
        // ✅ แก้ไข filter: แสดงแบบฟอร์มที่ไม่ใช่มาตรฐาน + (active หรือ เป็นของตัวเอง)
        const custom = (formsData.forms || []).filter((f: CustomForm) => {
          const isNotStandard = !f.isStandard;
          const isActive = f.status === 'active';
          const isOwnForm = f.createdBy === currentUser._id;
          
          console.log('🔍 Form:', f.title, 'isStandard:', f.isStandard, 'status:', f.status, 'isOwnForm:', isOwnForm);
          
          return isNotStandard && (isActive || isOwnForm);
        });
        console.log('✅ Custom Forms:', custom.length, custom);
        setCustomForms(custom);
      } else {
        console.error('❌ Forms API Error:', formsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = (type: string) => {
    if (type === 'sdq') {
      router.push('/assessment?type=sdq');
    } else if (type === 'dass21') {
      router.push('/assessment?type=dass21');
    }
  };

  const handleViewResults = (type: string) => {
    if (type === 'sdq') {
      router.push('/assessment/sdq/results');
    } else if (type === 'dass21') {
      router.push('/assessment/dass21/results');
    }
  };

  const handleStartEvaluation = () => {
    router.push('/evaluation');
  };

  const handleStartCustomForm = (form: CustomForm) => {
    if (form.status === 'draft') {
      alert('แบบฟอร์มนี้ยังอยู่ในฉบับร่าง ต้องเผยแพร่ก่อนจึงจะใช้งานได้');
      return;
    }
    router.push(`/forms/${form._id}`);
  };

  // ✅ ฟังก์ชัน refresh ข้อมูล (เรียกหลังสร้างแบบฟอร์ม)
  const refreshData = () => {
    if (currentUser) {
      loadData();
    }
  };

  // ✅ Listen สำหรับ refresh หลังสร้างแบบฟอร์ม
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'formCreated') {
        console.log('🔄 Form created, refreshing...');
        refreshData();
        localStorage.removeItem('formCreated');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser]);

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #dee2e6', padding: '16px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, color: '#212529' }}>
                📝 แบบฟอร์มนักเรียน
              </h1>
              <p style={{ margin: '4px 0 0', color: '#6c757d', fontSize: '14px' }}>
                เลือกแบบประเมินที่ต้องการทำ
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {/* ปุ่มดูแผนภูมิสรุป */}
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
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#138496'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}>
                📊 แผนภูมิสรุป
              </Link>
              {/* ปุ่มดูสรุปการประเมินทั้งหมด */}
              <Link href="/assessment/summary" style={{
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
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}>
                📊 สรุปการประเมิน
              </Link>
              {/* ปุ่มสร้างแบบฟอร์ม (แสดงเฉพาะ Admin และ Teacher) */}
              {(currentUser?.role === 'ADMIN' || currentUser?.role === 'TEACHER') && (
                <Link href="/forms/create" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}>
                  ➕ สร้างแบบฟอร์ม
                </Link>
              )}
              <Link href="/student" style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}>
                ← กลับสู่หน้านักเรียน
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        
        {/* User Info */}
        {currentUser && (
          <div style={{
          
          }}>
            
            
          </div>
        )}

        {/* Tab Navigation (เพิ่มแท็บที่ 3) */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '24px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #dee2e6' }}>
            <button
              onClick={() => setActiveTab('assessments')}
              style={{
                flex: 1,
                padding: '16px 20px',
                backgroundColor: activeTab === 'assessments' ? '#007bff' : 'transparent',
                color: activeTab === 'assessments' ? 'white' : '#6c757d',
                border: 'none',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                borderRadius: '8px 8px 0 0'
              }}
            >
              🧠 แบบประเมินจิตวิทยา ({assessments.length})
            </button>
            <button
              onClick={() => setActiveTab('evaluations')}
              style={{
                flex: 1,
                padding: '16px 20px',
                backgroundColor: activeTab === 'evaluations' ? '#007bff' : 'transparent',
                color: activeTab === 'evaluations' ? 'white' : '#6c757d',
                border: 'none',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                borderRadius: '8px 8px 0 0'
              }}
            >
              📊 แบบประเมินความพึงพอใจ ({evaluations.length})
            </button>
            {/* ✅ แท็บที่ 3: แบบฟอร์มกำหนดเอง (แสดงเฉพาะ Admin/Teacher) */}
            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'TEACHER') && (
              <button
                onClick={() => setActiveTab('custom')}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  backgroundColor: activeTab === 'custom' ? '#17a2b8' : 'transparent',
                  color: activeTab === 'custom' ? 'white' : '#6c757d',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  borderRadius: '8px 8px 0 0'
                }}
              >
                📝 แบบฟอร์มกำหนดเอง({customForms.length})
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dee2e6', padding: '24px' }}>
          
          {/* ========== ASSESSMENTS TAB ========== */}
          {activeTab === 'assessments' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px', color: '#212529' }}>
                  แบบประเมินทางจิตวิทยา
                </h2>
                <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
                  แบบประเมินมาตรฐานสำหรับประเมินสุขภาพจิตและพฤติกรรม
                </p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                
                {/* SDQ Card */}
                <div style={{
                  border: '2px solid #007bff',
                  borderRadius: '8px',
                  padding: '24px',
                  backgroundColor: '#f8fbff',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
                onClick={() => handleStartAssessment('sdq')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e7f3ff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fbff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '40px' }}>📋</div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px', color: '#212529' }}>
                        SDQ
                      </h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6c757d' }}>
                        Strengths and Difficulties Questionnaire
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#495057', lineHeight: 1.6, marginBottom: '16px' }}>
                    แบบประเมินจุดแข็งและปัญหาพฤติกรรมสำหรับเด็กและวัยรุ่น ประเมิน 5 ด้าน ได้แก่ อารมณ์ พฤติกรรม สมาธิ ความสัมพันธ์กับเพื่อน และพฤติกรรมเชิงบวก
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <span style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      25 ข้อ
                    </span>
                    <span style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      ⏱️ 5-10 นาที
                    </span>
                    <span style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      ✅ เปิดใช้งาน
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <button 
                          onClick={() => handleStartAssessment('sdq')}
                          style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}>
                          ทำแบบประเมิน
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewResults('sdq');
                          }}
                          style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}>
                          📊 ดูผลการประเมิน
                        </button>
                      </div>
                </div>

                {/* DASS-21 Card */}
                <div style={{
                  border: '2px solid #28a745',
                  borderRadius: '8px',
                  padding: '24px',
                  backgroundColor: '#f8fff9',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
                onClick={() => handleStartAssessment('dass21')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8f5e9';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fff9';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '40px' }}>🧠</div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px', color: '#212529' }}>
                        DASS-21
                      </h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6c757d' }}>
                        Depression Anxiety Stress Scales
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#495057', lineHeight: 1.6, marginBottom: '16px' }}>
                    แบบประเมินภาวะซึมเศร้า วิตกกังวล และความเครียด ในสัปดาห์ที่ผ่านมา ประเมิน 3 ด้านหลัก
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <span style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      21 ข้อ
                    </span>
                    <span style={{
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      ⏱️ 5-10 นาที
                    </span>
                    <span style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      ✅ เปิดใช้งาน
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <button 
                          onClick={() => handleStartAssessment('dass21')}
                          style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}>
                          ทำแบบประเมิน
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewResults('dass21');
                          }}
                          style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}>
                          📊 ดูผลการประเมิน
                        </button>
                      </div>
                </div>

              </div>
            </div>
          )}

          {/* ========== EVALUATIONS TAB ========== */}
          {activeTab === 'evaluations' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px', color: '#212529' }}>
                  แบบประเมินความพึงพอใจ
                </h2>
                <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
                  แบบประเมินความพึงพอใจและประสิทธิภาพของระบบ
                </p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                
                {/* System Evaluation Card */}
                <div style={{
                  border: '2px solid #6f42c1',
                  borderRadius: '8px',
                  padding: '24px',
                  backgroundColor: '#fbf8ff',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
                onClick={() => handleStartEvaluation()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3e5f5';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fbf8ff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '40px' }}>📊</div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px', color: '#212529' }}>
                        แบบประเมินความพึงพอใจ
                      </h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6c757d' }}>
                        ระบบการดูแลช่วยเหลือผู้เรียน
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#495057', lineHeight: 1.6, marginBottom: '16px' }}>
                    แบบประเมินประสิทธิภาพระบบการดูแลช่วยเหลือผู้เรียน 4 ด้าน ได้แก่ ความต้องการ การทำงาน ความง่ายใช้งาน และประสิทธิภาพ
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <span style={{
                      backgroundColor: '#6f42c1',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      19 ข้อ
                    </span>
                    <span style={{
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      ⏱️ 10-15 นาที
                    </span>
                    <span style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      ✅ เปิดใช้งาน
                    </span>
                  </div>
                  <button style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#6f42c1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a32a3'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6f42c1'}>
                  ทำแบบประเมินความพึงพอใจ
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ✅ ========== CUSTOM FORMS TAB ========== */}
          {activeTab === 'custom' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px', color: '#212529' }}>
                    แบบฟอร์มกำหนดเอง
                  </h2>
                  <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
                    แบบฟอร์มที่สร้างโดยครูและบุคลากร ({customForms.length} แบบฟอร์ม)
                  </p>
                </div>
                <button
                  onClick={() => loadData()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginRight: '12px'
                  }}
                >
                  🔄 รีเฟรช
                </button>
                <Link href="/forms/create" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}>
                  ➕ สร้างแบบฟอร์มใหม่
                </Link>
              </div>
              
              {customForms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px', color: '#212529' }}>
                    ยังไม่มีแบบฟอร์มกำหนดเอง
                  </h3>
                  <p style={{ margin: '0 0 24px', color: '#6c757d', fontSize: '14px' }}>
                    สร้างแบบฟอร์มแรกของคุณเพื่อเริ่มต้น
                  </p>
                  <Link href="/forms/create" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500
                  }}>
                    + สร้างแบบฟอร์มใหม่
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                  {customForms.map((form) => (
                    <div 
                      key={form._id}
                      style={{
                        border: '2px solid #17a2b8',
                        borderRadius: '8px',
                        padding: '24px',
                        backgroundColor: '#f8fdff',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer',
                        opacity: form.status === 'draft' ? 0.7 : 1
                      }}
                      onClick={() => handleStartCustomForm(form)}
                      onMouseEnter={(e) => {
                        if (form.status !== 'draft') {
                          e.currentTarget.style.backgroundColor = '#e8f4f8';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fdff';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ fontSize: '40px' }}>📝</div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px', color: '#212529' }}>
                            {form.title}
                          </h3>
                          <p style={{ margin: 0, fontSize: '13px', color: '#6c757d' }}>
                            แบบฟอร์มกำหนดเอง
                          </p>
                        </div>
                        {/* ✅ เพิ่มป้ายสถานะ */}
                        {form.status === 'draft' && (
                          <span style={{
                            backgroundColor: '#ffc107',
                            color: '#000',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 500
                          }}>
                            📝 ฉบับร่าง
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '14px', color: '#495057', lineHeight: 1.6, marginBottom: '16px' }}>
                        {form.description}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <span style={{
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 500
                        }}>
                          {form.questions?.length || 0} ข้อ
                        </span>
                        <span style={{
                          backgroundColor: form.status === 'active' ? '#28a745' : '#ffc107',
                          color: form.status === 'active' ? 'white' : '#000',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 500
                        }}>
                          {form.status === 'active' ? '✅ เปิดใช้งาน' : '📝 ฉบับร่าง'}
                        </span>
                      </div>
                      {form.createdByName && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6c757d', 
                          marginBottom: '16px',
                          padding: '8px 12px',
                          backgroundColor: 'rgba(0,0,0,0.05)',
                          borderRadius: '4px'
                        }}>
                          👤 สร้างโดย: {form.createdByName}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <button 
                          style={{
                            flex: 1,
                            padding: '10px',
                            backgroundColor: form.status === 'active' ? '#17a2b8' : '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: form.status === 'draft' ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.15s ease'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (form.status === 'draft') {
                              alert('แบบฟอร์มนี้ยังอยู่ในฉบับร่าง ต้องเผยแพร่ก่อนจึงจะใช้งานได้');
                            } else {
                              router.push(`/forms/${form._id}`);
                            }
                          }}
                          onMouseEnter={(e) => {
                            if (form.status === 'active') {
                              e.currentTarget.style.backgroundColor = '#117a8b';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (form.status === 'active') {
                              e.currentTarget.style.backgroundColor = '#17a2b8';
                            }
                          }}>
                          {form.status === 'active' ? 'เริ่มทำแบบฟอร์ม' : '📝 ฉบับร่าง (ยังไม่เปิดใช้งาน)'}
                        </button>
                        {form.status === 'active' && (
                          <button 
                            style={{
                              flex: 1,
                              padding: '10px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'background-color 0.15s ease'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/forms/${form._id}/responses`);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}>
                            📊 ดูผลการประเมิน
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
          ระบบแบบฟอร์มนักเรียน • {new Date().toLocaleDateString('th-TH')}
        </div>

      </div>
    </div>
  );
}