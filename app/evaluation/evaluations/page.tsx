'use client';
import { useState, useEffect, useMemo } from 'react';

// ========== Interfaces ==========
interface Evaluation {
  _id: string;
  studentName: string;
  role: string;
  gender: string;
  ageRange: string;
  evaluationDate: string;
  overallRating: number;
  functionRequirement: {
    dataAccess: number; dataAdd: number; dataUpdate: number;
    dataPresentation: number; dataAccuracy: number;
  };
  functionality: {
    overallAccuracy: number; dataClassification: number;
    addDataAccuracy: number; updateDataAccuracy: number;
    presentationAccuracy: number;
  };
  usability: {
    easeOfUse: number; screenDesign: number; textClarity: number;
    accessibility: number; overallUsability: number;
  };
  performance: {
    pageLoadSpeed: number; databaseSpeed: number;
    saveUpdateSpeed: number; overallPerformance: number;
  };
  additionalSuggestions: string;
}

interface FilterState {
  role: string[];
  dateFrom: string;
  dateTo: string;
  ratingMin: number;
  ratingMax: number;
}

// ========== Helper Functions ==========
const getRoleText = (role: string) => ({
  'ADMIN': 'ผู้ดูแลระบบ', 'TEACHER': 'อาจารย์', 
  'EXECUTIVE': 'ผู้บริหาร', 'COMMITTEE': 'คณะกรรมการ'
}[role] || 'ไม่ระบุ');

const getGenderText = (g: string) => ({ 
  'male': 'ชาย', 'female': 'หญิง', 'other': 'อื่นๆ' 
}[g] || 'ไม่ระบุ');

const getAgeText = (a: string) => ({ 
  'under-20': 'ต่ำกว่า 20 ปี', '20-30': '20-30 ปี', 
  '31-40': '31-40 ปี', '41-50': '41-50 ปี', 'over-50': 'มากกว่า 50 ปี' 
}[a] || 'ไม่ระบุ');

const formatDate = (date: string) => 
  new Date(date).toLocaleDateString('th-TH', { 
    year: 'numeric', month: 'short', day: 'numeric' 
  });

// ========== Main Component ==========
export default function AdminEvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewLevel, setViewLevel] = useState<'overall' | 'dimension' | 'item'>('overall');
  const [filters, setFilters] = useState<FilterState>({
    role: [], dateFrom: '', dateTo: '', ratingMin: 1, ratingMax: 5
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ dimension: string; item: string; data: number[] } | null>(null);
  const [evaluatorPage, setEvaluatorPage] = useState(1);
  const evaluatorsPerPage = 10;

  // Fetch Data
  useEffect(() => { fetchEvaluations(); }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/evaluation');
      const data = await response.json();
      if (data.success) setEvaluations(data.evaluations);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Data
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(e => {
      if (filters.role.length && !filters.role.includes(e.role)) return false;
      if (filters.dateFrom && new Date(e.evaluationDate) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(e.evaluationDate) > new Date(filters.dateTo)) return false;
      if (e.overallRating < filters.ratingMin || e.overallRating > filters.ratingMax) return false;
      return true;
    });
  }, [evaluations, filters]);

  // Calculate Averages
  const calculateAverage = (values: number[]) => {
    if (!values.length) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  };

  // Dimension Data
  const dimensionData = useMemo(() => {
    if (!filteredEvaluations.length) return null;
    
    const fr = filteredEvaluations.map(e => [
      e.functionRequirement.dataAccess, e.functionRequirement.dataAdd,
      e.functionRequirement.dataUpdate, e.functionRequirement.dataPresentation,
      e.functionRequirement.dataAccuracy
    ]).flat();
    
    const fn = filteredEvaluations.map(e => [
      e.functionality.overallAccuracy, e.functionality.dataClassification,
      e.functionality.addDataAccuracy, e.functionality.updateDataAccuracy,
      e.functionality.presentationAccuracy
    ]).flat();
    
    const ub = filteredEvaluations.map(e => [
      e.usability.easeOfUse, e.usability.screenDesign, e.usability.textClarity,
      e.usability.accessibility, e.usability.overallUsability
    ]).flat();
    
    const pf = filteredEvaluations.map(e => [
      e.performance.pageLoadSpeed, e.performance.databaseSpeed,
      e.performance.saveUpdateSpeed, e.performance.overallPerformance
    ]).flat();

    return {
      overall: calculateAverage(filteredEvaluations.map(e => e.overallRating)),
      dimensions: {
        functionRequirement: {
          label: 'ด้านตรงตามความต้องการ (Function Requirement)',
          average: calculateAverage(fr),
          items: [
            { label: '1.1 ความสามารถในการเรียกใช้งานในระบบฐานข้อมูล', value: calculateAverage(filteredEvaluations.map(e => e.functionRequirement.dataAccess)) },
            { label: '1.2 ความสามารถของระบบในการเพิ่มข้อมูล', value: calculateAverage(filteredEvaluations.map(e => e.functionRequirement.dataAdd)) },
            { label: '1.3 ความสามารถของระบบในการปรับปรุงข้อมูล', value: calculateAverage(filteredEvaluations.map(e => e.functionRequirement.dataUpdate)) },
            { label: '1.4 ความสามารถของระบบในการนำเสนอข้อมูล', value: calculateAverage(filteredEvaluations.map(e => e.functionRequirement.dataPresentation)) },
            { label: '1.5 ระบบฐานข้อมูลมีความถูกต้องครบถ้วน', value: calculateAverage(filteredEvaluations.map(e => e.functionRequirement.dataAccuracy)) }
          ]
        },
        functionality: {
          label: 'ด้านสามารถทำงานได้ตามหน้าที่ (Function)',
          average: calculateAverage(fn),
          items: [
            { label: '2.1 ความถูกต้องของการทำงานระบบในภาพรวม', value: calculateAverage(filteredEvaluations.map(e => e.functionality.overallAccuracy)) },
            { label: '2.2 ความถูกต้องของระบบในการจัดประเภทของข้อมูล', value: calculateAverage(filteredEvaluations.map(e => e.functionality.dataClassification)) },
            { label: '2.3 ความถูกต้องของระบบในการเพิ่มข้อมูล', value: calculateAverage(filteredEvaluations.map(e => e.functionality.addDataAccuracy)) },
            { label: '2.4 ความถูกต้องของระบบในการปรับปรุงข้อมูล', value: calculateAverage(filteredEvaluations.map(e => e.functionality.updateDataAccuracy)) },
            { label: '2.5 ความถูกต้องของระบบในการนำเสนอข้อมูล', value: calculateAverage(filteredEvaluations.map(e => e.functionality.presentationAccuracy)) }
          ]
        },
        usability: {
          label: 'ด้านความง่ายต่อการใช้งาน (Usability)',
          average: calculateAverage(ub),
          items: [
            { label: '3.1 ความง่ายในการเรียกใช้ระบบ', value: calculateAverage(filteredEvaluations.map(e => e.usability.easeOfUse)) },
            { label: '3.2 ความเหมาะสมในการออกแบบหน้าจอโดยภาพรวม', value: calculateAverage(filteredEvaluations.map(e => e.usability.screenDesign)) },
            { label: '3.3 ความชัดเจนของข้อความที่แสดงบนจอภาพ', value: calculateAverage(filteredEvaluations.map(e => e.usability.textClarity)) },
            { label: '3.4 ความสะดวกในการเข้าใช้ระบบ', value: calculateAverage(filteredEvaluations.map(e => e.usability.accessibility)) },
            { label: '3.5 ความน่าใช้ของระบบในภาพรวม', value: calculateAverage(filteredEvaluations.map(e => e.usability.overallUsability)) }
          ]
        },
        performance: {
          label: 'ด้านประสิทธิภาพ (Performance)',
          average: calculateAverage(pf),
          items: [
            { label: '4.1 ความเร็วในการแสดงผลจากการเชื่อมโยงเพจ', value: calculateAverage(filteredEvaluations.map(e => e.performance.pageLoadSpeed)) },
            { label: '4.2 ความเร็วในการติดต่อกับฐานข้อมูล', value: calculateAverage(filteredEvaluations.map(e => e.performance.databaseSpeed)) },
            { label: '4.3 ความเร็วในการบันทึกปรับปรุงข้อมูล', value: calculateAverage(filteredEvaluations.map(e => e.performance.saveUpdateSpeed)) },
            { label: '4.4 ความเร็วในการทำงานของระบบในภาพรวม', value: calculateAverage(filteredEvaluations.map(e => e.performance.overallPerformance)) }
          ]
        }
      }
    };
  }, [filteredEvaluations]);

  // Evaluator Statistics
  const evaluatorStats = useMemo(() => {
    if (!filteredEvaluations.length) return null;
    
    const byRole = filteredEvaluations.reduce((acc, e) => {
      acc[e.role] = (acc[e.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byGender = filteredEvaluations.reduce((acc, e) => {
      acc[e.gender] = (acc[e.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byAge = filteredEvaluations.reduce((acc, e) => {
      acc[e.ageRange] = (acc[e.ageRange] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Paginated evaluator list
    const sortedEvaluators = [...filteredEvaluations].sort((a, b) => 
      new Date(b.evaluationDate).getTime() - new Date(a.evaluationDate).getTime()
    );
    const totalPages = Math.ceil(sortedEvaluators.length / evaluatorsPerPage);
    const paginatedEvaluators = sortedEvaluators.slice(
      (evaluatorPage - 1) * evaluatorsPerPage,
      evaluatorPage * evaluatorsPerPage
    );

    return { byRole, byGender, byAge, evaluators: paginatedEvaluators, totalEvaluators: sortedEvaluators.length, totalPages };
  }, [filteredEvaluations, evaluatorPage]);

  // Suggestions with content
  const suggestionsList = useMemo(() => {
    return filteredEvaluations
      .filter(e => e.additionalSuggestions?.trim())
      .sort((a, b) => new Date(b.evaluationDate).getTime() - new Date(a.evaluationDate).getTime())
      .slice(0, 10);
  }, [filteredEvaluations]);

  // Simple Bar Chart Component
  const BarChart = ({ value, max = 5, height = 40 }: { value: number; max?: number; height?: number }) => (
    <div style={{ height, backgroundColor: '#e9ecef', borderRadius: '2px', overflow: 'hidden' }}>
      <div style={{ width: `${(value/max)*100}%`, height: '100%', backgroundColor: '#0066cc', transition: 'width 0.2s' }} />
    </div>
  );

  // Loading State
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
        <div style={{ color: '#6c757d' }}>กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '24px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 4px', color: '#212529' }}>
            รายงานผลการประเมินประสิทธิภาพระบบการดูแลช่วยเหลือผู้เรียน
          </h1>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
            จำนวนข้อมูล: {filteredEvaluations.length} รายการ
          </p>
        </div>

        {/* Filter Toggle */}
        <div style={{ marginBottom: '16px' }}>
          <button onClick={() => setShowFilters(!showFilters)} style={{
            padding: '8px 16px', backgroundColor: showFilters ? '#0066cc' : 'white',
            color: showFilters ? 'white' : '#495057', border: `1px solid ${showFilters ? '#0066cc' : '#dee2e6'}`,
            borderRadius: '4px', cursor: 'pointer', fontSize: '14px'
          }}>
            {showFilters ? '▲ ซ่อนตัวกรอง' : '▼ ตัวกรอง'}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div style={{ backgroundColor: 'white', borderRadius: '4px', padding: '16px', marginBottom: '20px', border: '1px solid #dee2e6', fontSize: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: '8px', color: '#495057' }}>บทบาท</div>
                {['ADMIN','TEACHER','EXECUTIVE','COMMITTEE'].map(role => (
                  <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <input type="checkbox" checked={filters.role.includes(role)} onChange={() => setFilters(f => ({ 
                      ...f, role: f.role.includes(role) ? f.role.filter(r => r !== role) : [...f.role, role] }))} />
                    <span style={{ color: '#495057' }}>{getRoleText(role)}</span>
                  </label>
                ))}
              </div>
              <div>
                <div style={{ fontWeight: 500, marginBottom: '8px', color: '#495057' }}>ช่วงวันที่</div>
                <input type="date" value={filters.dateFrom} onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ced4da', marginBottom: '8px' }} />
                <input type="date" value={filters.dateTo} onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ced4da' }} />
              </div>
              <div>
                <div style={{ fontWeight: 500, marginBottom: '8px', color: '#495057' }}>คะแนน: {filters.ratingMin} - {filters.ratingMax}</div>
                <input type="range" min="1" max="5" step="0.5" value={filters.ratingMin} onChange={(e) => setFilters(f => ({ ...f, ratingMin: parseFloat(e.target.value) }))} style={{ width: '100%', marginBottom: '8px' }} />
                <input type="range" min="1" max="5" step="0.5" value={filters.ratingMax} onChange={(e) => setFilters(f => ({ ...f, ratingMax: parseFloat(e.target.value) }))} style={{ width: '100%' }} />
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <button onClick={() => setFilters({ role: [], dateFrom: '', dateTo: '', ratingMin: 1, ratingMax: 5 })}
                style={{ padding: '6px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        )}

        {/* View Level Toggle */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid #dee2e6', paddingBottom: '12px' }}>
          {[{ id: 'overall', label: 'ภาพรวม' }, { id: 'dimension', label: 'ตามหัวข้อ' }, { id: 'item', label: 'ตามรายข้อ' }].map(level => (
            <button key={level.id} onClick={() => setViewLevel(level.id as any)} style={{
              padding: '8px 16px', backgroundColor: viewLevel === level.id ? '#0066cc' : 'white',
              color: viewLevel === level.id ? 'white' : '#495057', border: `1px solid ${viewLevel === level.id ? '#0066cc' : '#dee2e6'}`,
              borderRadius: '4px 4px 0 0', cursor: 'pointer', fontSize: '14px',
              borderBottom: viewLevel === level.id ? '2px solid white' : 'none', marginBottom: '-1px'
            }}>
              {level.label}
            </button>
          ))}
        </div>

        {/* ========== VIEW: OVERALL ========== */}
        {viewLevel === 'overall' && dimensionData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Overall Score */}
            <div style={{ backgroundColor: 'white', borderRadius: '4px', padding: '20px', border: '1px solid #dee2e6' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px', color: '#212529' }}>คะแนนเฉลี่ยภาพรวม</h2>
              <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e9ecef' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#495057' }}>คะแนนรวมเฉลี่ย</span>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: '#212529' }}>{dimensionData.overall.toFixed(2)} / 5.00</span>
                </div>
                <BarChart value={dimensionData.overall} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: '#495057' }}>คะแนนเฉลี่ยตามด้าน</div>
                {Object.entries(dimensionData.dimensions).map(([key, dim]: [string, any]) => (
                  <div key={key} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#495057' }}>{dim.label}</span>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#212529' }}>{dim.average.toFixed(2)}</span>
                    </div>
                    <BarChart value={dim.average} />
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluator Statistics */}
            {evaluatorStats && (
              <div style={{ backgroundColor: 'white', borderRadius: '4px', padding: '20px', border: '1px solid #dee2e6' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px', color: '#212529' }}>สถิติผู้ประเมิน</h2>
                
                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: '#212529' }}>{evaluatorStats.totalEvaluators}</div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>จำนวนคน</div>
                  </div>
                  <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: '#212529' }}>
                      {Object.entries(evaluatorStats.byRole).sort(([,a],[,b]) => b-a)[0]?.[1] || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>กลุ่มมากที่สุด</div>
                  </div>
                  <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: '#212529' }}>
                      {Object.entries(evaluatorStats.byGender).sort(([,a],[,b]) => b-a)[0]?.[0] ? getGenderText(Object.entries(evaluatorStats.byGender).sort(([,a],[,b]) => b-a)[0][0]) : '-'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>เพศส่วนใหญ่</div>
                  </div>
                </div>

                {/* Distribution by Category */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#495057' }}>ตามบทบาท</div>
                    {Object.entries(evaluatorStats.byRole).map(([role, count]) => {
                      const percentage = ((count / evaluatorStats.totalEvaluators) * 100).toFixed(1);
                      return (
                        <div key={role} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#495057', marginBottom: '4px' }}>
                          <span>{getRoleText(role)}</span>
                          <span style={{ fontWeight: 500 }}>{count} คน ({percentage}%)</span>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#495057' }}>ตามเพศ</div>
                    {Object.entries(evaluatorStats.byGender).map(([gender, count]) => {
                      const percentage = ((count / evaluatorStats.totalEvaluators) * 100).toFixed(1);
                      return (
                        <div key={gender} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#495057', marginBottom: '4px' }}>
                          <span>{getGenderText(gender)}</span>
                          <span style={{ fontWeight: 500 }}>{count} คน ({percentage}%)</span>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#495057' }}>ตามช่วงอายุ</div>
                    {Object.entries(evaluatorStats.byAge).map(([age, count]) => {
                      const percentage = ((count / evaluatorStats.totalEvaluators) * 100).toFixed(1);
                      return (
                        <div key={age} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#495057', marginBottom: '4px' }}>
                          <span>{getAgeText(age)}</span>
                          <span style={{ fontWeight: 500 }}>{count} คน ({percentage}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Evaluator List Table */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: '#495057' }}>รายชื่อผู้ประเมิน</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#6c757d', borderBottom: '1px solid #dee2e6' }}>ชื่อ-นามสกุล</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#6c757d', borderBottom: '1px solid #dee2e6' }}>เพศ</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#6c757d', borderBottom: '1px solid #dee2e6' }}>อายุ</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#6c757d', borderBottom: '1px solid #dee2e6' }}>บทบาท</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 500, color: '#6c757d', borderBottom: '1px solid #dee2e6' }}>คะแนน</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#6c757d', borderBottom: '1px solid #dee2e6' }}>วันที่</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluatorStats.evaluators.map((e, i) => (
                          <tr key={e._id} style={{ borderBottom: i < evaluatorStats.evaluators.length - 1 ? '1px solid #e9ecef' : 'none' }}>
                            <td style={{ padding: '10px 12px', color: '#212529' }}>{e.studentName}</td>
                            <td style={{ padding: '10px 12px', color: '#495057' }}>{getGenderText(e.gender)}</td>
                            <td style={{ padding: '10px 12px', color: '#495057' }}>{getAgeText(e.ageRange)}</td>
                            <td style={{ padding: '10px 12px', color: '#495057' }}>{getRoleText(e.role)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 500, color: '#212529' }}>{e.overallRating.toFixed(1)}</td>
                            <td style={{ padding: '10px 12px', color: '#6c757d', fontSize: '12px' }}>{formatDate(e.evaluationDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {evaluatorStats.totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '16px' }}>
                      <button onClick={() => setEvaluatorPage(p => Math.max(1, p - 1))} disabled={evaluatorPage === 1}
                        style={{ padding: '6px 12px', backgroundColor: evaluatorPage === 1 ? '#e9ecef' : 'white', border: '1px solid #dee2e6', borderRadius: '4px', cursor: evaluatorPage === 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>
                        ก่อนหน้า
                      </button>
                      <span style={{ padding: '6px 12px', fontSize: '12px', color: '#495057' }}>
                        หน้า {evaluatorPage} / {evaluatorStats.totalPages}
                      </span>
                      <button onClick={() => setEvaluatorPage(p => Math.min(evaluatorStats.totalPages, p + 1))} disabled={evaluatorPage === evaluatorStats.totalPages}
                        style={{ padding: '6px 12px', backgroundColor: evaluatorPage === evaluatorStats.totalPages ? '#e9ecef' : 'white', border: '1px solid #dee2e6', borderRadius: '4px', cursor: evaluatorPage === evaluatorStats.totalPages ? 'not-allowed' : 'pointer', fontSize: '12px' }}>
                        ถัดไป
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Suggestions */}
            <div style={{ backgroundColor: 'white', borderRadius: '4px', padding: '20px', border: '1px solid #dee2e6' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px', color: '#212529' }}>ข้อเสนอแนะเพิ่มเติม</h2>
              {suggestionsList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {suggestionsList.map((e, i) => (
                    <div key={e._id} style={{ padding: '12px 16px', backgroundColor: '#f8f9fa', borderRadius: '4px', borderLeft: '3px solid #0066cc' }}>
                      <div style={{ fontSize: '14px', color: '#212529', marginBottom: '8px', lineHeight: 1.5 }}>
                        {e.additionalSuggestions}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        {e.studentName} • {getRoleText(e.role)} • {formatDate(e.evaluationDate)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6c757d', fontSize: '14px' }}>ไม่มีข้อเสนอแนะเพิ่มเติมในระบบ</p>
              )}
            </div>

          </div>
        )}

        {/* ========== VIEW: BY DIMENSION ========== */}
        {viewLevel === 'dimension' && dimensionData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.entries(dimensionData.dimensions).map(([key, dim]: [string, any]) => (
              <div key={key} style={{ backgroundColor: 'white', borderRadius: '4px', padding: '20px', border: '1px solid #dee2e6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#212529' }}>{dim.label}</h3>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#0066cc' }}>เฉลี่ย {dim.average.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dim.items.map((item: any, idx: number) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', color: '#495057' }}>{item.label}</span>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#212529' }}>{item.value.toFixed(2)}</span>
                      </div>
                      <BarChart value={item.value} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== VIEW: BY ITEM ========== */}
        {viewLevel === 'item' && dimensionData && (
          <div style={{ backgroundColor: 'white', borderRadius: '4px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e9ecef', fontWeight: 500, fontSize: '14px', color: '#495057' }}>
              รายละเอียดคะแนนรายข้อ ({filteredEvaluations.length} การประเมิน)
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#6c757d', borderBottom: '1px solid #dee2e6', width: '60%' }}>รายการประเมิน</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 500, color: '#6c757d', borderBottom: '1px solid #dee2e6', width: '20%' }}>คะแนนเฉลี่ย</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 500, color: '#6c757d', borderBottom: '1px solid #dee2e6', width: '20%' }}>ดูรายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(dimensionData.dimensions).flatMap((dim: any) => 
                    dim.items.map((item: any, idx: number) => {
                      const itemData = filteredEvaluations.map((e: Evaluation) => {
                        const fieldMap: { [key: string]: string } = {
                          '1.1': 'functionRequirement.dataAccess', '1.2': 'functionRequirement.dataAdd',
                          '1.3': 'functionRequirement.dataUpdate', '1.4': 'functionRequirement.dataPresentation',
                          '1.5': 'functionRequirement.dataAccuracy',
                          '2.1': 'functionality.overallAccuracy', '2.2': 'functionality.dataClassification',
                          '2.3': 'functionality.addDataAccuracy', '2.4': 'functionality.updateDataAccuracy',
                          '2.5': 'functionality.presentationAccuracy',
                          '3.1': 'usability.easeOfUse', '3.2': 'usability.screenDesign',
                          '3.3': 'usability.textClarity', '3.4': 'usability.accessibility',
                          '3.5': 'usability.overallUsability',
                          '4.1': 'performance.pageLoadSpeed', '4.2': 'performance.databaseSpeed',
                          '4.3': 'performance.saveUpdateSpeed', '4.4': 'performance.overallPerformance'
                        };
                        const code = item.label.split(' ')[0];
                        const path = fieldMap[code]?.split('.');
                        if (!path) return 0;
                        let val: any = e;
                        for (const p of path) val = val?.[p];
                        return val || 0;
                      });
                      return (
                        <tr key={`${dim.label}-${idx}`} style={{ borderBottom: '1px solid #e9ecef' }}>
                          <td style={{ padding: '10px 12px', color: '#212529' }}>{item.label}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 500, color: '#212529' }}>{item.value.toFixed(2)}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <button onClick={() => setSelectedItem({ dimension: dim.label, item: item.label, data: itemData })}
                              style={{ padding: '4px 8px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                              ดู
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Item Detail Modal */}
        {selectedItem && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setSelectedItem(null)}>
            <div style={{ backgroundColor: 'white', borderRadius: '4px', maxWidth: '500px', width: '100%', border: '1px solid #dee2e6' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#212529' }}>รายละเอียด: {selectedItem.item}</h3>
                <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6c757d' }}>&times;</button>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '4px' }}>หัวข้อ</div>
                  <div style={{ fontSize: '14px', color: '#212529' }}>{selectedItem.dimension}</div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '4px' }}>คะแนนเฉลี่ย</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#0066cc' }}>
                    {(selectedItem.data.reduce((a,b) => a+b, 0) / selectedItem.data.length).toFixed(2)} / 5.00
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '8px' }}>การกระจายคะแนน</div>
                  <div style={{ height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '80px' }}>
                      {[1,2,3,4,5].map(rating => {
                        const count = selectedItem.data.filter(v => Math.round(v) === rating).length;
                        const percentage = selectedItem.data.length > 0 ? ((count / selectedItem.data.length) * 100).toFixed(1) : '0.0';
                        const max = Math.max(...[1,2,3,4,5].map(r => selectedItem.data.filter(v => Math.round(v) === r).length));
                        const height = max > 0 ? (count / max) * 70 : 0;
                        return (
                          <div key={rating} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '100%', height: `${height}px`, backgroundColor: '#0066cc', borderRadius: '2px 2px 0 0', marginBottom: '8px' }} />
                            <div style={{ fontSize: '10px', color: '#6c757d' }}>{rating}</div>
                            <div style={{ fontSize: '9px', color: '#495057', marginTop: '2px' }}>{count} ({percentage}%)</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#adb5bd', fontSize: '12px' }}>
          ระบบรายงานผลการประเมิน • {new Date().toLocaleDateString('th-TH')}
        </div>

      </div>
    </div>
  );
}