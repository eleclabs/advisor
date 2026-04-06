'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// ========== INTERFACES ==========
interface SDQResponse {
  _id: string;
  studentId: string;
  studentName: string;
  grade: string;
  classroom: string;
  totalScore: number;
  emotionalScore: number;
  conductScore: number;
  hyperactivityScore: number;
  peerScore: number;
  prosocialScore: number;
  overallRisk: string;
  submittedAt: string;
  submittedBy: string;
}

interface DASS21Response {
  _id: string;
  studentId: string;
  studentName: string;
  grade: string;
  classroom: string;
  depressionScore: number;
  anxietyScore: number;
  stressScore: number;
  depressionLevel: string;
  anxietyLevel: string;
  stressLevel: string;
  submittedAt: string;
  submittedBy: string;
}

interface CustomFormResponse {
  _id: string;
  formId: string;
  formTitle: string;
  userName: string;
  userEmail: string;
  userRole: string;
  submittedAt: string;
  answers: any[];
}

type AssessmentType = 'sdq' | 'dass21' | 'form' | 'all';

interface FilterState {
  assessmentType: AssessmentType;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
}

// ========== Helper Functions ==========
const formatDate = (date: string) => 
  new Date(date).toLocaleDateString('th-TH', { 
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

const getTypeLabel = (type: string) => {
  switch(type) {
    case 'sdq': return 'SDQ';
    case 'dass21': return 'DASS-21';
    case 'form': return 'แบบฟอร์ม';
    default: return 'ทั้งหมด';
  }
};

const getTypeColor = (type: string) => {
  switch(type) {
    case 'sdq': return '#007bff';
    case 'dass21': return '#28a745';
    case 'form': return '#fd7e14';
    default: return '#6c757d';
  }
};

const getRiskColor = (risk: string) => {
  switch(risk) {
    case 'มีปัญหา': return '#dc3545';
    case 'คาบเกี่ยว': return '#ffc107';
    case 'ปกติ': return '#28a745';
    default: return '#6c757d';
  }
};

const getLevelColor = (level: string) => {
  if (level === 'รุนแรงมาก' || level === 'รุนแรง') return '#dc3545';
  if (level === 'ปานกลาง') return '#ffc107';
  if (level === 'เบา') return '#fd7e14';
  return '#28a745';
};

const getRoleLabel = (role: string) => {
  const roleMap: { [key: string]: string } = {
    'ADMIN': 'ผู้ดูแลระบบ',
    'TEACHER': 'อาจารย์',
    'EXECUTIVE': 'ผู้บริหาร',
    'COMMITTEE': 'คณะกรรมการ',
    'STUDENT': 'นักเรียน'
  };
  return roleMap[role] || role || 'ไม่ระบุ';
};

// ========== MAIN COMPONENT ==========
export default function AssessmentSummaryPage() {
  const [sdqResponses, setSdqResponses] = useState<SDQResponse[]>([]);
  const [dass21Responses, setDass21Responses] = useState<DASS21Response[]>([]);
  const [formResponses, setFormResponses] = useState<CustomFormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    assessmentType: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<{
    type: string;
    data: any;
  } | null>(null);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch SDQ
      const sdqRes = await fetch('/api/assessment/sdq');
      const sdqData = await sdqRes.json();
      if (sdqData.success) setSdqResponses(sdqData.data || []);
      
      // Fetch DASS-21
      const dass21Res = await fetch('/api/assessment/dass21');
      const dass21Data = await dass21Res.json();
      if (dass21Data.success) setDass21Responses(dass21Data.data || []);
      
      // Fetch custom form responses
      const formRes = await fetch('/api/forms/responses');
      const formData = await formRes.json();
      if (formData.success) setFormResponses(formData.responses || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Combine all data
  const allData = useMemo(() => {
    const items: Array<{
      type: 'sdq' | 'dass21' | 'form';
      id: string;
      studentName: string;
      date: string;
      score?: number;
      status?: string;
      details: any;
    }> = [];

    // Add SDQ
    sdqResponses.forEach(sdq => {
      items.push({
        type: 'sdq',
        id: sdq._id,
        studentName: sdq.studentName,
        date: sdq.submittedAt,
        score: sdq.totalScore,
        status: sdq.overallRisk,
        details: sdq
      });
    });

    // Add DASS-21
    dass21Responses.forEach(dass21 => {
      const totalScore = dass21.depressionScore + dass21.anxietyScore + dass21.stressScore;
      items.push({
        type: 'dass21',
        id: dass21._id,
        studentName: dass21.studentName,
        date: dass21.submittedAt,
        score: totalScore,
        status: `${dass21.depressionLevel}/${dass21.anxietyLevel}/${dass21.stressLevel}`,
        details: dass21
      });
    });

    // Add Custom Forms
    formResponses.forEach(form => {
      items.push({
        type: 'form',
        id: form._id,
        studentName: form.userName,
        date: form.submittedAt,
        details: form
      });
    });

    // Sort by date (newest first)
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sdqResponses, dass21Responses, formResponses]);

  // Filter data
  const filteredData = useMemo(() => {
    return allData.filter(item => {
      // Type filter
      if (filters.assessmentType !== 'all' && item.type !== filters.assessmentType) return false;
      
      // Date filter
      if (filters.dateFrom && new Date(item.date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(item.date) > new Date(filters.dateTo)) return false;
      
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          item.studentName.toLowerCase().includes(searchLower) ||
          (item.status && item.status.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  }, [allData, filters]);

  // Statistics
  const statistics = useMemo(() => {
    return {
      total: filteredData.length,
      sdq: sdqResponses.length,
      dass21: dass21Responses.length,
      form: formResponses.length,
      recentCount: filteredData.filter(item => {
        const itemDate = new Date(item.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return itemDate >= thirtyDaysAgo;
      }).length
    };
  }, [filteredData, sdqResponses.length, dass21Responses.length, formResponses.length]);

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#f8f9fa',
        fontFamily: "'Inter', system-ui, sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#6c757d' }}>กำลังโหลดข้อมูลการประเมินทั้งหมด...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh', 
      padding: '24px',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 600, 
              margin: '0 0 8px', 
              color: '#212529' 
            }}>
              สรุปข้อมูลการประเมินทั้งหมด
            </h1>
            <p style={{ 
              margin: 0, 
              color: '#6c757d', 
              fontSize: '14px' 
            }}>
              จำนวนข้อมูลทั้งหมด: {statistics.total} รายการ (30 วันล่าสุด: {statistics.recentCount} รายการ)
            </p>
          </div>
          <Link href="/forms" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 500
          }}>
            ← กลับ
          </Link>
        </div>

        {/* Statistics Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          marginBottom: '24px' 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '20px', 
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#6c757d', marginBottom: '8px' }}>
              {statistics.total}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>ทั้งหมด</div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '20px', 
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#007bff', marginBottom: '8px' }}>
              {statistics.sdq}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>SDQ</div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '20px', 
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#28a745', marginBottom: '8px' }}>
              {statistics.dass21}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>DASS-21</div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '20px', 
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#fd7e14', marginBottom: '8px' }}>
              {statistics.form}
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>แบบฟอร์มกำหนดเอง</div>
          </div>
        </div>

        {/* Filter Toggle */}
        <div style={{ marginBottom: '16px' }}>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            style={{
              padding: '8px 16px', 
              backgroundColor: showFilters ? '#007bff' : 'white',
              color: showFilters ? 'white' : '#495057', 
              border: `1px solid ${showFilters ? '#007bff' : '#dee2e6'}`,
              borderRadius: '4px', 
              cursor: 'pointer', 
              fontSize: '14px'
            }}
          >
            {showFilters ? '▲ ซ่อนตัวกรอง' : '▼ ตัวกรอง'}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '20px', 
            marginBottom: '20px', 
            border: '1px solid #dee2e6'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px' 
            }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: '8px', color: '#495057' }}>
                  ประเภทการประเมิน
                </div>
                <select 
                  value={filters.assessmentType}
                  onChange={(e) => setFilters(f => ({ ...f, assessmentType: e.target.value as AssessmentType }))}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ced4da'
                  }}
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="sdq">SDQ</option>
                  <option value="dass21">DASS-21</option>
                  <option value="form">แบบฟอร์มกำหนดเอง</option>
                </select>
              </div>
              
              <div>
                <div style={{ fontWeight: 500, marginBottom: '8px', color: '#495057' }}>
                  ช่วงวันที่
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="date" 
                    value={filters.dateFrom} 
                    onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }} 
                  />
                  <input 
                    type="date" 
                    value={filters.dateTo} 
                    onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }} 
                  />
                </div>
              </div>
              
              <div>
                <div style={{ fontWeight: 500, marginBottom: '8px', color: '#495057' }}>
                  ค้นหา
                </div>
                <input 
                  type="text"
                  placeholder="ค้นหาตามชื่อ..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(f => ({ ...f, searchTerm: e.target.value }))}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                />
              </div>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <button 
                onClick={() => setFilters({ assessmentType: 'all', dateFrom: '', dateTo: '', searchTerm: '' })}
                style={{ padding: '6px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          overflow: 'hidden', 
          border: '1px solid #dee2e6' 
        }}>
          <div style={{ 
            padding: '16px 20px', 
            borderBottom: '1px solid #dee2e6', 
            fontWeight: 500, 
            fontSize: '16px', 
            color: '#212529',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>รายการการประเมินทั้งหมด</span>
            <span style={{ fontSize: '14px', color: '#6c757d' }}>
              {filteredData.length} รายการ
            </span>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#6c757d', borderBottom: '1px solid #dee2e6' }}>
                    ประเภท
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#6c757d', borderBottom: '1px solid #dee2e6' }}>
                    ชื่อผู้ประเมิน
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500, color: '#6c757d', borderBottom: '1px solid #dee2e6' }}>
                    คะแนน/ผล
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500, color: '#6c757d', borderBottom: '1px solid #dee2e6' }}>
                    วันที่
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 500, color: '#6c757d', borderBottom: '1px solid #dee2e6' }}>
                    รายละเอียด
                  </th>
                 </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr 
                    key={`${item.type}-${item.id}`} 
                    style={{ 
                      borderBottom: index < filteredData.length - 1 ? '1px solid #e9ecef' : 'none',
                      backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: getTypeColor(item.type),
                        color: 'white'
                      }}>
                        {getTypeLabel(item.type)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#212529' }}>
                      {item.studentName}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {item.type === 'sdq' && (
                        <span style={{ color: getRiskColor(item.status || ''), fontWeight: 500 }}>
                          {item.score} คะแนน ({item.status})
                        </span>
                      )}
                      {item.type === 'dass21' && item.details && (
                        <div>
                          <span style={{ color: getLevelColor(item.details.depressionLevel) }}>
                            D:{item.details.depressionScore}
                          </span>
                          {' / '}
                          <span style={{ color: getLevelColor(item.details.anxietyLevel) }}>
                            A:{item.details.anxietyScore}
                          </span>
                          {' / '}
                          <span style={{ color: getLevelColor(item.details.stressLevel) }}>
                            S:{item.details.stressScore}
                          </span>
                        </div>
                      )}
                      {item.type === 'form' && (
                        <span style={{ color: '#fd7e14' }}>
                          {item.details.formTitle || 'แบบฟอร์ม'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#6c757d', fontSize: '13px' }}>
                      {formatDate(item.date)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedDetail({ type: item.type, data: item.details })}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredData.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                ไม่พบข้อมูลการประเมินที่ตรงกับเงื่อนไข
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {selectedDetail && (
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
            zIndex: 1000,
            padding: '20px'
          }} onClick={() => setSelectedDetail(null)}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#212529' }}>
                  รายละเอียด {getTypeLabel(selectedDetail.type)}
                </h3>
                <button onClick={() => setSelectedDetail(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
              </div>
              
              {selectedDetail.type === 'sdq' && (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>ชื่อ:</strong> {selectedDetail.data.studentName}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>ชั้นเรียน:</strong> {selectedDetail.data.grade} / {selectedDetail.data.classroom}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>คะแนนรวม:</strong> {selectedDetail.data.totalScore} คะแนน
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>ระดับความเสี่ยง:</strong> {selectedDetail.data.overallRisk}
                  </div>
                  <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>คะแนนแยกตามด้าน:</strong>
                    <div>อารมณ์: {selectedDetail.data.emotionalScore}</div>
                    <div>พฤติกรรม: {selectedDetail.data.conductScore}</div>
                    <div>สมาธิ: {selectedDetail.data.hyperactivityScore}</div>
                    <div>สัมพันธ์เพื่อน: {selectedDetail.data.peerScore}</div>
                    <div>พฤติกรรมบวก: {selectedDetail.data.prosocialScore}</div>
                  </div>
                </div>
              )}
              
              {selectedDetail.type === 'dass21' && (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>ชื่อ:</strong> {selectedDetail.data.studentName}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>ชั้นเรียน:</strong> {selectedDetail.data.grade} / {selectedDetail.data.classroom}
                  </div>
                  <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>คะแนนและระดับ:</strong>
                    <div style={{ color: getLevelColor(selectedDetail.data.depressionLevel) }}>
                      ภาวะซึมเศร้า: {selectedDetail.data.depressionScore} คะแนน ({selectedDetail.data.depressionLevel})
                    </div>
                    <div style={{ color: getLevelColor(selectedDetail.data.anxietyLevel) }}>
                      ภาวะวิตกกังวล: {selectedDetail.data.anxietyScore} คะแนน ({selectedDetail.data.anxietyLevel})
                    </div>
                    <div style={{ color: getLevelColor(selectedDetail.data.stressLevel) }}>
                      ภาวะความเครียด: {selectedDetail.data.stressScore} คะแนน ({selectedDetail.data.stressLevel})
                    </div>
                  </div>
                </div>
              )}
              
              {selectedDetail.type === 'form' && (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>ชื่อผู้ตอบ:</strong> {selectedDetail.data.userName}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>อีเมล:</strong> {selectedDetail.data.userEmail}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>บทบาท:</strong> {getRoleLabel(selectedDetail.data.userRole)}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>แบบฟอร์ม:</strong> {selectedDetail.data.formTitle}
                  </div>
                  <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>จำนวนคำตอบ:</strong> {selectedDetail.data.answers?.length || 0} ข้อ
                  </div>
                </div>
              )}
              
              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button
                  onClick={() => setSelectedDetail(null)}
                  style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}