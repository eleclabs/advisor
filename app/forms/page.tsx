'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ✅ แก้ไข ShareModal - ลบข้อความแจ้ง และแก้ไข QR Download
function ShareModal({ isOpen, onClose, formUrl, formTitle, isStudentShare = false }: { 
  isOpen: boolean; 
  onClose: () => void; 
  formUrl: string; 
  formTitle: string;
  isStudentShare?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState(false);
  
  if (!isOpen) return null;
  
  // เปลี่ยน URL เป็น /login/student ถ้าเป็น Student Share
  const shareUrl = isStudentShare ? `${window.location.origin}/login/student` : formUrl;
  
  // ใช้ API อื่นสำหรับ QR Code ที่เสถียรกว่า
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownloadQR = async () => {
    try {
      // ใช้ fetch แบบมี timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(qrCodeUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_${formTitle.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setQrError(false);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      setQrError(true);
      alert('ไม่สามารถดาวน์โหลด QR Code ได้ กรุณาลองอีกครั้งหรือใช้ลิงก์แทน');
    }
  };
  
  return (
    <div 
      style={{
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
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
            {isStudentShare ? '👥 แชร์สำหรับนักเรียน' : '🔗 แชร์แบบฟอร์ม'}
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#6c757d'
            }}
          >
            ✕
          </button>
        </div>
        
        <p style={{ fontSize: '14px', color: '#495057', marginBottom: '16px' }}>
          {formTitle}
        </p>
        
        {/* QR Code */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {!qrError ? (
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              style={{ 
                maxWidth: '200px', 
                margin: '0 auto',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '8px',
                backgroundColor: 'white'
              }}
              onError={() => setQrError(true)}
            />
          ) : (
            <div style={{
              width: '200px',
              height: '200px',
 margin: '0 auto',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8f9fa'
            }}>
              <span style={{ fontSize: '12px', color: '#6c757d' }}>ไม่สามารถแสดง QR Code</span>
            </div>
          )}
          <button
            onClick={handleDownloadQR}
            style={{
              display: 'block',
              margin: '12px auto 0',
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            ⬇️ ดาวน์โหลด QR Code (PNG)
          </button>
        </div>
        
        {/* Link */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: '#495057', marginBottom: '6px', display: 'block' }}>
            ลิงก์{isStudentShare ? 'สำหรับนักเรียน' : 'แบบฟอร์ม'}:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={shareUrl}
              readOnly
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                fontSize: '13px',
                backgroundColor: '#f8f9fa'
              }}
            />
            <button
              onClick={handleCopyLink}
              style={{
                padding: '10px 16px',
                backgroundColor: copied ? '#28a745' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                minWidth: '80px'
              }}
            >
              {copied ? '✅ คัดลอกแล้ว' : '📋 คัดลอก'}
            </button>
          </div>
        </div>
        
        {/* ลบข้อความ "💡 นักเรียนสามารถเข้าถึง..." ออกแล้ว */}
      </div>
    </div>
  );
}

// ส่วนประกอบอื่นๆคงเดิม...

// ✅ เพิ่ม StudentShareModal Component แยกสำหรับนักเรียนโดยเฉพาะ
function StudentShareModal({ isOpen, onClose, formTitle }: { 
  isOpen: boolean; 
  onClose: () => void; 
  formTitle: string;
}) {
  const studentLoginUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/login/student`;
  
  return (
    <ShareModal 
      isOpen={isOpen}
      onClose={onClose}
      formUrl={studentLoginUrl}
      formTitle={`${formTitle} (สำหรับนักเรียน)`}
      isStudentShare={true}
    />
  );
}

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
  
  // ✅ State สำหรับ Share Modal
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    formUrl: string;
    formTitle: string;
    isStudentShare: boolean;
  }>({
    isOpen: false,
    formUrl: '',
    formTitle: '',
    isStudentShare: false
  });

  // ✅ State สำหรับ Student Share Modal (เฉพาะ DASS-21 และ SDQ)
  const [studentShareModal, setStudentShareModal] = useState<{
    isOpen: boolean;
    formTitle: string;
  }>({
    isOpen: false,
    formTitle: ''
  });

  // ✅ ฟังก์ชันเปิด Share Modal ปกติ
  const handleShare = (formPath: string, formTitle: string) => {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}${formPath}`;
    setShareModal({
      isOpen: true,
      formUrl: fullUrl,
      formTitle,
      isStudentShare: false
    });
  };

  // ✅ ฟังก์ชันเปิด Student Share Modal (สำหรับ DASS-21 และ SDQ โดยเฉพาะ)
  const handleStudentShare = (formTitle: string) => {
    setStudentShareModal({
      isOpen: true,
      formTitle
    });
  };

  // ✅ ฟังก์ชันปิด Share Modal
  const closeShareModal = () => {
    setShareModal({ isOpen: false, formUrl: '', formTitle: '', isStudentShare: false });
  };

  // ✅ ฟังก์ชันปิด Student Share Modal
  const closeStudentShareModal = () => {
    setStudentShareModal({ isOpen: false, formTitle: '' });
  };

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

      const formsRes = await fetch(`/api/forms?userId=${currentUser._id}&userRole=${currentUser.role}`);
      const formsData = await formsRes.json();
      console.log('📋 Forms API Response:', formsData);
      
      if (formsData.success) {
        const custom = (formsData.forms || []).filter((f: CustomForm) => {
          const isNotStandard = !f.isStandard;
          const isActive = f.status === 'active';
          const isOwnForm = f.createdBy === currentUser._id;
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

  const refreshData = () => {
    if (currentUser) {
      loadData();
    }
  };

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
      
      {/* ✅ Share Modal ปกติ */}
      <ShareModal 
        isOpen={shareModal.isOpen}
        onClose={closeShareModal}
        formUrl={shareModal.formUrl}
        formTitle={shareModal.formTitle}
        isStudentShare={shareModal.isStudentShare}
      />
      
      {/* ✅ Student Share Modal เฉพาะ DASS-21 และ SDQ */}
      <StudentShareModal 
        isOpen={studentShareModal.isOpen}
        onClose={closeStudentShareModal}
        formTitle={studentShareModal.formTitle}
      />
      
      {/* Header - คงเดิม */}
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
              }}>
                📊 แผนภูมิสรุป
              </Link>
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
              }}>
                📊 สรุปการประเมิน
              </Link>
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
                }}>
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
              }}>
                ← กลับสู่หน้านักเรียน
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        
        {/* Tab Navigation */}
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
                borderRadius: '8px 8px 0 0'
              }}
            >
              📊 แบบประเมินความพึงพอใจ ({evaluations.length})
            </button>
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
                  borderRadius: '8px 8px 0 0'
                }}
              >
                📝 แบบฟอร์มกำหนดเอง ({customForms.length})
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
                
                {/* SDQ Card - ✅ เพิ่มปุ่ม "แชร์สำหรับนักเรียน" */}
                <div style={{
                  border: '2px solid #007bff',
                  borderRadius: '8px',
                  padding: '24px',
                  backgroundColor: '#f8fbff',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
                onClick={() => handleStartAssessment('sdq')}>
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
                    <span style={{ backgroundColor: '#007bff', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                      25 ข้อ
                    </span>
                    <span style={{ backgroundColor: '#28a745', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                      ⏱️ 5-10 นาที
                    </span>
                    <span style={{ backgroundColor: '#28a745', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                      ✅ เปิดใช้งาน
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartAssessment('sdq');
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
                        cursor: 'pointer'
                      }}>
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
                        cursor: 'pointer'
                      }}>
                      📊 ดูผล
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare('/assessment?type=sdq', 'SDQ - แบบประเมินจุดแข็งและปัญหา');
                      }}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}>
                      🔗 แชร์
                    </button>
                    {/* ✅ ปุ่ม "แชร์สำหรับนักเรียน" เฉพาะ SDQ - จะไปหน้า /login/student */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStudentShare('SDQ - แบบประเมินจุดแข็งและปัญหา');
                      }}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#fd7e14',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}>
                      👥 แชร์สำหรับนักเรียน
                    </button>
                  </div>
                </div>

                {/* DASS-21 Card - ✅ เพิ่มปุ่ม "แชร์สำหรับนักเรียน" */}
                <div style={{
                  border: '2px solid #28a745',
                  borderRadius: '8px',
                  padding: '24px',
                  backgroundColor: '#f8fff9',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
                onClick={() => handleStartAssessment('dass21')}>
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
                    <span style={{ backgroundColor: '#28a745', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                      21 ข้อ
                    </span>
                    <span style={{ backgroundColor: '#17a2b8', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                      ⏱️ 5-10 นาที
                    </span>
                    <span style={{ backgroundColor: '#28a745', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                      ✅ เปิดใช้งาน
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartAssessment('dass21');
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
                        cursor: 'pointer'
                      }}>
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
                        cursor: 'pointer'
                      }}>
                      📊 ดูผล
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare('/assessment?type=dass21', 'DASS-21 - แบบประเมินภาวะซึมเศร้า วิตกกังวล และความเครียด');
                      }}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}>
                      🔗 แชร์
                    </button>
                    {/* ✅ ปุ่ม "แชร์สำหรับนักเรียน" เฉพาะ DASS-21 - จะไปหน้า /login/student */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStudentShare('DASS-21 - แบบประเมินภาวะซึมเศร้า วิตกกังวล และความเครียด');
                      }}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#fd7e14',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}>
                      👥 แชร์สำหรับนักเรียน
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
                
                <div style={{
                  border: '2px solid #6f42c1',
                  borderRadius: '8px',
                  padding: '24px',
                  backgroundColor: '#fbf8ff',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
                onClick={() => handleStartEvaluation()}>
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
                    <span style={{ backgroundColor: '#6f42c1', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                      19 ข้อ
                    </span>
                    <span style={{ backgroundColor: '#17a2b8', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                      ⏱️ 10-15 นาที
                    </span>
                    <span style={{ backgroundColor: '#28a745', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                      ✅ เปิดใช้งาน
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEvaluation();
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#6f42c1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}>
                      ทำแบบประเมินความพึงพอใจ
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare('/evaluation', 'แบบประเมินความพึงพอใจระบบการดูแลช่วยเหลือผู้เรียน');
                      }}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}>
                      🔗 แชร์
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========== CUSTOM FORMS TAB ========== */}
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
                <div style={{ display: 'flex', gap: '12px' }}>
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
                      cursor: 'pointer'
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
                  }}>
                    ➕ สร้างแบบฟอร์มใหม่
                  </Link>
                </div>
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
                      onClick={() => handleStartCustomForm(form)}>
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
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                            cursor: form.status === 'draft' ? 'not-allowed' : 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (form.status === 'draft') {
                              alert('แบบฟอร์มนี้ยังอยู่ในฉบับร่าง ต้องเผยแพร่ก่อนจึงจะใช้งานได้');
                            } else {
                              router.push(`/forms/${form._id}`);
                            }
                          }}>
                          {form.status === 'active' ? 'เริ่มทำแบบฟอร์ม' : '📝 ฉบับร่าง'}
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
                              cursor: 'pointer'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/forms/${form._id}/responses`);
                            }}>
                            📊 ดูผล
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(`/forms/${form._id}`, form.title);
                          }}
                          style={{
                            padding: '10px 16px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}>
                          🔗 แชร์
                        </button>
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