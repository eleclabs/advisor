'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

interface Evaluation {
  _id: string;
  studentName: string;
  role: string;
  gender: string;
  ageRange: string;
  evaluationDate: string;
  overallRating: number;
  functionRequirement: {
    dataAccess: number;
    dataAdd: number;
    dataUpdate: number;
    dataPresentation: number;
    dataAccuracy: number;
  };
  functionality: {
    overallAccuracy: number;
    dataClassification: number;
    addDataAccuracy: number;
    updateDataAccuracy: number;
    presentationAccuracy: number;
  };
  usability: {
    easeOfUse: number;
    screenDesign: number;
    textClarity: number;
    accessibility: number;
    overallUsability: number;
  };
  performance: {
    pageLoadSpeed: number;
    databaseSpeed: number;
    saveUpdateSpeed: number;
    overallPerformance: number;
  };
  additionalSuggestions: string;
}

export default function EvaluationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchEvaluation(params.id as string);
    }
  }, [params.id]);

  const fetchEvaluation = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/evaluation/${id}`);
      const data = await response.json();

      if (data.success) {
        setEvaluation(data.evaluation);
      } else {
        setError(data.error || 'Failed to fetch evaluation');
      }
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
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
    return genderMap[gender] || gender;
  };

  const getAgeRangeLabel = (ageRange: string) => {
    const ageMap: { [key: string]: string } = {
      'under-20': 'ต่ำกว่า 20 ปี',
      '20-30': '20 - 30 ปี',
      '31-40': '31 - 40 ปี',
      '41-50': '41 - 50 ปี',
      'over-50': 'มากกว่า 50 ปี'
    };
    return ageMap[ageRange] || ageRange;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#28a745';
    if (rating >= 3.5) return '#ffc107';
    if (rating >= 2.5) return '#fd7e14';
    return '#dc3545';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'ดีเยี่ยม';
    if (rating >= 3.5) return 'ดี';
    if (rating >= 2.5) return 'ปานกลาง';
    return 'ต้องปรับปรุง';
  };

  const calculateSectionAverage = (section: any) => {
    const values = Object.values(section);
    return values.reduce((sum: number, val: any) => sum + val, 0) / values.length;
  };

  const renderRatingBar = (rating: number, max: number = 5) => {
    const percentage = (rating / max) * 100;
    return (
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e9ecef',
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '4px'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: getRatingColor(rating),
          transition: 'width 0.3s ease'
        }} />
      </div>
    );
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
          <div style={{ fontSize: '16px', color: '#6c757d' }}>กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  if (error || !evaluation) {
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
            {error || 'ไม่พบข้อมูลการประเมิน'}
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

  const frAvg = calculateSectionAverage(evaluation.functionRequirement);
  const fnAvg = calculateSectionAverage(evaluation.functionality);
  const ubAvg = calculateSectionAverage(evaluation.usability);
  const pfAvg = calculateSectionAverage(evaluation.performance);

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '40px 20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
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
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← กลับ
          </button>
          
          <div style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#6c757d',
            letterSpacing: '0.5px',
            marginBottom: '8px',
            textTransform: 'uppercase'
          }}>
            รายงานสถิติการประเมิน
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#212529',
            margin: '0 0 12px 0',
            letterSpacing: '-0.3px'
          }}>
            สถิติการประเมินระบบ
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6c757d',
            lineHeight: 1.6,
            margin: 0
          }}>
            ผลการประเมินโดย {evaluation.studentName}
          </p>
        </div>

        {/* User Info Card */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#212529', marginBottom: '20px' }}>
            ข้อมูลผู้ประเมิน
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>ชื่อ-นามสกุล</div>
              <div style={{ fontSize: '14px', color: '#212529', fontWeight: 500 }}>{evaluation.studentName}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>บทบาท</div>
              <div style={{ fontSize: '14px', color: '#212529', fontWeight: 500 }}>{getRoleLabel(evaluation.role)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>เพศ</div>
              <div style={{ fontSize: '14px', color: '#212529', fontWeight: 500 }}>{getGenderLabel(evaluation.gender)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>ช่วงอายุ</div>
              <div style={{ fontSize: '14px', color: '#212529', fontWeight: 500 }}>{getAgeRangeLabel(evaluation.ageRange)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>วันที่ประเมิน</div>
              <div style={{ fontSize: '14px', color: '#212529', fontWeight: 500 }}>{formatDate(evaluation.evaluationDate)}</div>
            </div>
          </div>
        </div>

        {/* Overall Rating */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#212529', marginBottom: '20px' }}>
            คะแนนการประเมินรวม
          </h2>
          <div style={{
            fontSize: '48px',
            fontWeight: 700,
            color: getRatingColor(evaluation.overallRating),
            marginBottom: '8px'
          }}>
            {evaluation.overallRating.toFixed(1)}
          </div>
          <div style={{
            fontSize: '16px',
            color: getRatingColor(evaluation.overallRating),
            fontWeight: 500,
            marginBottom: '16px'
          }}>
            {getRatingLabel(evaluation.overallRating)}
          </div>
          {renderRatingBar(evaluation.overallRating)}
        </div>

        {/* Section Scores */}
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
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#212529', marginBottom: '16px' }}>
              ด้านความต้องการ
            </h3>
            <div style={{
              fontSize: '24px',
              fontWeight: 600,
              color: getRatingColor(frAvg),
              marginBottom: '8px'
            }}>
              {frAvg.toFixed(1)}
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '12px' }}>
              {getRatingLabel(frAvg)}
            </div>
            {renderRatingBar(frAvg)}
          </div>

          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#212529', marginBottom: '16px' }}>
              ด้านการทำงาน
            </h3>
            <div style={{
              fontSize: '24px',
              fontWeight: 600,
              color: getRatingColor(fnAvg),
              marginBottom: '8px'
            }}>
              {fnAvg.toFixed(1)}
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '12px' }}>
              {getRatingLabel(fnAvg)}
            </div>
            {renderRatingBar(fnAvg)}
          </div>

          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#212529', marginBottom: '16px' }}>
              ด้านความง่ายใช้
            </h3>
            <div style={{
              fontSize: '24px',
              fontWeight: 600,
              color: getRatingColor(ubAvg),
              marginBottom: '8px'
            }}>
              {ubAvg.toFixed(1)}
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '12px' }}>
              {getRatingLabel(ubAvg)}
            </div>
            {renderRatingBar(ubAvg)}
          </div>

          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#212529', marginBottom: '16px' }}>
              ด้านประสิทธิภาพ
            </h3>
            <div style={{
              fontSize: '24px',
              fontWeight: 600,
              color: getRatingColor(pfAvg),
              marginBottom: '8px'
            }}>
              {pfAvg.toFixed(1)}
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '12px' }}>
              {getRatingLabel(pfAvg)}
            </div>
            {renderRatingBar(pfAvg)}
          </div>
        </div>

        {/* Detailed Scores */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#212529', marginBottom: '24px' }}>
            คะแนนรายละเอียด
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Function Requirement */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#495057', marginBottom: '12px', textTransform: 'uppercase' }}>
                ด้านความต้องการ (Function Requirement)
              </h3>
              <div>
                {[
                  { label: 'การเรียกใช้งานในระบบฐานข้อมูล', value: evaluation.functionRequirement.dataAccess },
                  { label: 'ความสามารถของระบบในการเพิ่มข้อมูล', value: evaluation.functionRequirement.dataAdd },
                  { label: 'ความสามารถของระบบในการปรับปรุงข้อมูล', value: evaluation.functionRequirement.dataUpdate },
                  { label: 'ความสามารถของระบบในการนำเสนอข้อมูล', value: evaluation.functionRequirement.dataPresentation },
                  { label: 'ระบบฐานข้อมูลมีความถูกต้องครบถ้วน', value: evaluation.functionRequirement.dataAccuracy }
                ].map((item, index) => (
                  <div key={index} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', color: '#495057' }}>{item.label}</span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: getRatingColor(item.value),
                        minWidth: '20px',
                        textAlign: 'right'
                      }}>
                        {item.value}
                      </span>
                    </div>
                    {renderRatingBar(item.value)}
                  </div>
                ))}
              </div>
            </div>

            {/* Functionality */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#495057', marginBottom: '12px', textTransform: 'uppercase' }}>
                ด้านสามารถทำงานได้ตามหน้าที่ (Function)
              </h3>
              <div>
                {[
                  { label: 'ความถูกต้องของการทำงานระบบในภาพรวม', value: evaluation.functionality.overallAccuracy },
                  { label: 'ความถูกต้องของระบบในการจัดประเภทของข้อมูล', value: evaluation.functionality.dataClassification },
                  { label: 'ความถูกต้องของระบบในการเพิ่มข้อมูล', value: evaluation.functionality.addDataAccuracy },
                  { label: 'ความถูกต้องของระบบในการปรับปรุงข้อมูล', value: evaluation.functionality.updateDataAccuracy },
                  { label: 'ความถูกต้องของระบบในการนำเสนอข้อมูล', value: evaluation.functionality.presentationAccuracy }
                ].map((item, index) => (
                  <div key={index} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', color: '#495057' }}>{item.label}</span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: getRatingColor(item.value),
                        minWidth: '20px',
                        textAlign: 'right'
                      }}>
                        {item.value}
                      </span>
                    </div>
                    {renderRatingBar(item.value)}
                  </div>
                ))}
              </div>
            </div>

            {/* Usability */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#495057', marginBottom: '12px', textTransform: 'uppercase' }}>
                ด้านความง่ายต่อการใช้งาน (Usability)
              </h3>
              <div>
                {[
                  { label: 'ความง่ายในการเรียกใช้ระบบ', value: evaluation.usability.easeOfUse },
                  { label: 'ความเหมาะสมในการออกแบบหน้าจอโดยภาพรวม', value: evaluation.usability.screenDesign },
                  { label: 'ความชัดเจนของข้อความที่แสดงบนจอภาพ', value: evaluation.usability.textClarity },
                  { label: 'ความสะดวกในการเข้าใช้ระบบ', value: evaluation.usability.accessibility },
                  { label: 'ความน่าใช้ของระบบในภาพรวม', value: evaluation.usability.overallUsability }
                ].map((item, index) => (
                  <div key={index} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', color: '#495057' }}>{item.label}</span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: getRatingColor(item.value),
                        minWidth: '20px',
                        textAlign: 'right'
                      }}>
                        {item.value}
                      </span>
                    </div>
                    {renderRatingBar(item.value)}
                  </div>
                ))}
              </div>
            </div>

            {/* Performance */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#495057', marginBottom: '12px', textTransform: 'uppercase' }}>
                ด้านประสิทธิภาพ (Performance)
              </h3>
              <div>
                {[
                  { label: 'ความเร็วในการแสดงผลจากการเชื่อมโยงเพจ', value: evaluation.performance.pageLoadSpeed },
                  { label: 'ความเร็วในการติดต่อกับฐานข้อมูล', value: evaluation.performance.databaseSpeed },
                  { label: 'ความเร็วในการบันทึกปรับปรุงข้อมูล', value: evaluation.performance.saveUpdateSpeed },
                  { label: 'ความเร็วในการทำงานของระบบในภาพรวม', value: evaluation.performance.overallPerformance }
                ].map((item, index) => (
                  <div key={index} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', color: '#495057' }}>{item.label}</span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: getRatingColor(item.value),
                        minWidth: '20px',
                        textAlign: 'right'
                      }}>
                        {item.value}
                      </span>
                    </div>
                    {renderRatingBar(item.value)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {evaluation.additionalSuggestions && (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#212529', marginBottom: '16px' }}>
              ข้อเสนอแนะเพิ่มเติม
            </h2>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '16px',
              borderRadius: '4px',
              fontSize: '14px',
              color: '#495057',
              lineHeight: 1.6,
              borderLeft: '4px solid #007bff'
            }}>
              {evaluation.additionalSuggestions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
