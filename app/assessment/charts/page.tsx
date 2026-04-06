'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ChartData {
  sdq: {
    total: number;
    averageScore: number;
    riskLevels: { normal: number; low: number; medium: number; high: number };
    recentCount: number;
  };
  dass21: {
    total: number;
    averageDepression: number;
    averageAnxiety: number;
    averageStress: number;
    recentCount: number;
  };
  forms: Array<{
    id: string;
    title: string;
    responseCount: number;
    recentCount: number;
  }>;
}

export default function AssessmentChartsPage() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);

      // Fetch SDQ data
      const sdqRes = await fetch('/api/assessment/sdq');
      const sdqData = await sdqRes.json();
      
      // Fetch DASS-21 data
      const dass21Res = await fetch('/api/assessment/dass21');
      const dass21Data = await dass21Res.json();
      
      // Fetch forms data
      const formsRes = await fetch('/api/forms');
      const formsData = await formsRes.json();
      
      // Fetch form responses
      const responsesRes = await fetch('/api/forms/responses');
      const responsesData = await responsesRes.json();

      // Process SDQ statistics
      const sdqResponses = sdqData.data || [];
      const sdqStats = {
        total: sdqResponses.length,
        averageScore: sdqResponses.length > 0 
          ? sdqResponses.reduce((sum: number, r: any) => sum + r.totalScore, 0) / sdqResponses.length 
          : 0,
        riskLevels: {
          normal: sdqResponses.filter((r: any) => r.overallRisk === 'normal').length,
          low: sdqResponses.filter((r: any) => r.overallRisk === 'low').length,
          medium: sdqResponses.filter((r: any) => r.overallRisk === 'medium').length,
          high: sdqResponses.filter((r: any) => r.overallRisk === 'high').length
        },
        recentCount: sdqResponses.filter((r: any) => {
          const date = new Date(r.submittedAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return date >= thirtyDaysAgo;
        }).length
      };

      // Process DASS-21 statistics
      const dass21Responses = dass21Data.data || [];
      const dass21Stats = {
        total: dass21Responses.length,
        averageDepression: dass21Responses.length > 0 
          ? dass21Responses.reduce((sum: number, r: any) => sum + r.depressionScore, 0) / dass21Responses.length 
          : 0,
        averageAnxiety: dass21Responses.length > 0 
          ? dass21Responses.reduce((sum: number, r: any) => sum + r.anxietyScore, 0) / dass21Responses.length 
          : 0,
        averageStress: dass21Responses.length > 0 
          ? dass21Responses.reduce((sum: number, r: any) => sum + r.stressScore, 0) / dass21Responses.length 
          : 0,
        recentCount: dass21Responses.filter((r: any) => {
          const date = new Date(r.submittedAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return date >= thirtyDaysAgo;
        }).length
      };

      // Process forms statistics
      const forms = formsData.forms || [];
      const responses = responsesData.responses || [];
      
      const formsStats = forms.map((form: any) => {
        const formResponses = responses.filter((r: any) => r.formId === form._id);
        return {
          id: form._id,
          title: form.title,
          responseCount: formResponses.length,
          recentCount: formResponses.filter((r: any) => {
            const date = new Date(r.submittedAt);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return date >= thirtyDaysAgo;
          }).length
        };
      });

      setChartData({
        sdq: sdqStats,
        dass21: dass21Stats,
        forms: formsStats
      });

    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <p style={{ color: '#6c757d' }}>กำลังโหลดข้อมูลสถิติ...</p>
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
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 600, 
              margin: '0 0 8px', 
              color: '#212529' 
            }}>
              📊 แผนภูมิสรุปการประเมิน
            </h1>
            <p style={{ 
              margin: 0, 
              color: '#6c757d', 
              fontSize: '16px' 
            }}>
              สถิติและข้อมูลสรุปของแต่ละประเภทการประเมิน
            </p>
          </div>
          <Link href="/forms" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500
          }}>
            ← กลับ
          </Link>
        </div>

        <div style={{ display: 'grid', gap: '32px' }}>
          
          {/* SDQ Section - Completely Separate */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '32px', 
            border: '2px solid #007bff',
            boxShadow: '0 4px 12px rgba(0,123,255,0.15)'
          }}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#e7f3ff',
              borderRadius: '8px',
              border: '1px solid #007bff'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px', color: '#007bff' }}>
                📋 SDQ - Strengths and Difficulties Questionnaire
              </h2>
              <p style={{ margin: 0, color: '#495057', fontSize: '16px', fontWeight: 500 }}>
                แบบประเมินจุดแข็งและปัญหาพฤติกรรมสำหรับเด็กและวัยรุ่น
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#007bff', marginBottom: '8px' }}>
                  {chartData?.sdq.total || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>ทั้งหมด</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#28a745', marginBottom: '8px' }}>
                  {chartData?.sdq.averageScore.toFixed(1) || '0.0'}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>คะแนนเฉลี่ย</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#ffc107', marginBottom: '8px' }}>
                  {chartData?.sdq.recentCount || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>30 วันล่าสุด</div>
              </div>
            </div>

            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 16px', color: '#495057' }}>
                📊 ระดับความเสี่ยง
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #28a745' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#28a745', marginBottom: '6px' }}>
                    {chartData?.sdq.riskLevels.normal || 0}
                  </div>
                  <div style={{ fontSize: '13px', color: '#28a745', fontWeight: 600 }}>ปกติ</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ffc107' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffc107', marginBottom: '6px' }}>
                    {chartData?.sdq.riskLevels.low || 0}
                  </div>
                  <div style={{ fontSize: '13px', color: '#ffc107', fontWeight: 600 }}>เสี่ยงต่ำ</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #fd7e14' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#fd7e14', marginBottom: '6px' }}>
                    {chartData?.sdq.riskLevels.medium || 0}
                  </div>
                  <div style={{ fontSize: '13px', color: '#fd7e14', fontWeight: 600 }}>เสี่ยงปานกลาง</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dc3545' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#dc3545', marginBottom: '6px' }}>
                    {chartData?.sdq.riskLevels.high || 0}
                  </div>
                  <div style={{ fontSize: '13px', color: '#dc3545', fontWeight: 600 }}>เสี่ยงสูง</div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link 
                href="/assessment?type=sdq"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,123,255,0.3)'
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.backgroundColor = '#0056b3';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.backgroundColor = '#007bff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                📋 ไปทำแบบประเมิน SDQ →
              </Link>
            </div>
          </div>

          {/* DASS-21 Section - Completely Separate */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '32px', 
            border: '2px solid #28a745',
            boxShadow: '0 4px 12px rgba(40,167,69,0.15)'
          }}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#e8f5e9',
              borderRadius: '8px',
              border: '1px solid #28a745'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px', color: '#28a745' }}>
                🧠 DASS-21 - Depression Anxiety Stress Scales
              </h2>
              <p style={{ margin: 0, color: '#495057', fontSize: '16px', fontWeight: 500 }}>
                แบบประเมินภาวะซึมเศร้า วิตกกังวล และความเครียด
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#28a745', marginBottom: '8px' }}>
                  {chartData?.dass21.total || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>ทั้งหมด</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#007bff', marginBottom: '8px' }}>
                  {chartData?.dass21.recentCount || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>30 วันล่าสุด</div>
              </div>
            </div>

            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 16px', color: '#495057' }}>
                📈 คะแนนเฉลี่ยแยกตามด้าน
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dc3545' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#dc3545', marginBottom: '6px' }}>
                    {chartData?.dass21.averageDepression.toFixed(1) || '0.0'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#dc3545', fontWeight: 600 }}>ภาวะซึมเศร้า</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ffc107' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffc107', marginBottom: '6px' }}>
                    {chartData?.dass21.averageAnxiety.toFixed(1) || '0.0'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#ffc107', fontWeight: 600 }}>ภาวะวิตกกังวล</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #fd7e14' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#fd7e14', marginBottom: '6px' }}>
                    {chartData?.dass21.averageStress.toFixed(1) || '0.0'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#fd7e14', fontWeight: 600 }}>ภาวะความเครียด</div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link 
                href="/assessment?type=dass21"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(40,167,69,0.3)'
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.backgroundColor = '#218838';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.backgroundColor = '#28a745';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🧠 ไปทำแบบประเมิน DASS-21 →
              </Link>
            </div>
          </div>

          {/* Custom Forms Section - Completely Separate */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '32px', 
            border: '2px solid #fd7e14',
            boxShadow: '0 4px 12px rgba(253,126,20,0.15)'
          }}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#fff3cd',
              borderRadius: '8px',
              border: '1px solid #fd7e14'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px', color: '#fd7e14' }}>
                📝 แบบฟอร์มกำหนดเอง
              </h2>
              <p style={{ margin: 0, color: '#495057', fontSize: '16px', fontWeight: 500 }}>
                สถิติการตอบแบบฟอร์มแต่ละอัน
              </p>
            </div>

            {chartData?.forms && chartData.forms.length > 0 ? (
              <div style={{ display: 'grid', gap: '20px' }}>
                {chartData.forms.map((form) => (
                  <div key={form.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 12px', color: '#212529' }}>
                        📋 {form.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', color: '#6c757d' }}>การตอบทั้งหมด:</span>
                          <span style={{ fontSize: '20px', fontWeight: 700, color: '#007bff' }}>
                            {form.responseCount}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', color: '#6c757d' }}>30 วันล่าสุด:</span>
                          <span style={{ fontSize: '20px', fontWeight: 700, color: '#28a745' }}>
                            {form.recentCount}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link 
                      href={`/forms/${form.id}/responses`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        backgroundColor: '#fd7e14',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(253,126,20,0.3)'
                      }}
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.backgroundColor = '#e86613';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.backgroundColor = '#fd7e14';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      📊 ดูผลการตอบ →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                padding: '60px', 
                textAlign: 'center', 
                color: '#6c757d',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
                <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 600 }}>ยังไม่มีแบบฟอร์มกำหนดเอง</h3>
                <p style={{ margin: 0, fontSize: '16px' }}>
                  สร้างแบบฟอร์มเพื่อเริ่มเก็บข้อมูลการประเมิน
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
