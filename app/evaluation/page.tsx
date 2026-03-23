'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EvaluationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    fr1: '', fr2: '', fr3: '', fr4: '', fr5: '',
    fn1: '', fn2: '', fn3: '', fn4: '', fn5: '',
    ub1: '', ub2: '', ub3: '', ub4: '', ub5: '',
    pf1: '', pf2: '', pf3: '', pf4: '',
    suggestion: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    const requiredFields = [
      formData.fr1, formData.fr2, formData.fr3, formData.fr4, formData.fr5,
      formData.fn1, formData.fn2, formData.fn3, formData.fn4, formData.fn5,
      formData.ub1, formData.ub2, formData.ub3, formData.ub4, formData.ub5,
      formData.pf1, formData.pf2, formData.pf3, formData.pf4
    ];
    
    if (requiredFields.some(field => !field)) {
      alert('กรุณาประเมินทุกข้อให้ครบถ้วน');
      return;
    }
    
    setLoading(true);
    
    try {
      const evaluationData = {
        name: formData.name,
        age: parseInt(formData.age),
        functionRequirement: {
          dataAccess: parseInt(formData.fr1),
          dataAdd: parseInt(formData.fr2),
          dataUpdate: parseInt(formData.fr3),
          dataPresentation: parseInt(formData.fr4),
          dataAccuracy: parseInt(formData.fr5),
        },
        functionality: {
          overallAccuracy: parseInt(formData.fn1),
          dataClassification: parseInt(formData.fn2),
          addDataAccuracy: parseInt(formData.fn3),
          updateDataAccuracy: parseInt(formData.fn4),
          presentationAccuracy: parseInt(formData.fn5),
        },
        usability: {
          easeOfUse: parseInt(formData.ub1),
          screenDesign: parseInt(formData.ub2),
          textClarity: parseInt(formData.ub3),
          accessibility: parseInt(formData.ub4),
          overallUsability: parseInt(formData.ub5),
        },
        performance: {
          pageLoadSpeed: parseInt(formData.pf1),
          databaseSpeed: parseInt(formData.pf2),
          saveUpdateSpeed: parseInt(formData.pf3),
          overallPerformance: parseInt(formData.pf4),
        },
        additionalSuggestions: formData.suggestion,
      };
      
      const response = await fetch('/api/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluationData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        alert('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('ล้างข้อมูลทั้งหมด?')) {
      setFormData({
        name: '', age: '',
        fr1: '', fr2: '', fr3: '', fr4: '', fr5: '',
        fn1: '', fn2: '', fn3: '', fn4: '', fn5: '',
        ub1: '', ub2: '', ub3: '', ub4: '', ub5: '',
        pf1: '', pf2: '', pf3: '', pf4: '',
        suggestion: '',
      });
    }
  };

  const RadioScale = ({ name, value, onChange }: { name: string; value: string; onChange: (name: string, value: string) => void }) => {
    return (
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
    );
  };

  const InputField = ({ label, name, value, required = true }: any) => {
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
          type={name === 'age' ? 'number' : 'text'}
          name={name}
          value={value}
          onChange={handleInputChange}
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
            backgroundColor: '#fff'
          }}
          placeholder="คำตอบของคุณ"
          required={required}
          onFocus={(e) => e.currentTarget.style.borderColor = '#2c3e50'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#ced4da'}
        />
      </div>
    );
  };

  const QuestionCard = ({ title, name }: { title: string; name: string }) => {
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
          marginBottom: '8px',
          fontWeight: 500,
          color: '#212529',
          lineHeight: 1.5
        }}>
          {title} <span style={{ color: '#dc3545' }}>*</span>
        </div>
        <RadioScale
          name={name}
          value={formData[name as keyof typeof formData] as string}
          onChange={handleRadioChange}
        />
      </div>
    );
  };

  const SectionHeader = ({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) => {
    return (
      <div style={{
        margin: '32px 0 20px 0',
        paddingBottom: '12px',
        borderBottom: '2px solid #e9ecef'
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 500,
          color: '#6c757d',
          letterSpacing: '0.5px',
          marginBottom: '4px'
        }}>
          ส่วนที่ {number}
        </div>
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
            ขอบคุณสำหรับการประเมิน
          </h2>
          <p style={{ color: '#6c757d', fontSize: '14px', lineHeight: 1.6 }}>
            ความคิดเห็นของท่านมีค่าต่อการพัฒนาระบบ
          </p>
          <p style={{ color: '#adb5bd', fontSize: '12px', marginTop: '24px' }}>
            กำลังนำท่านกลับสู่หน้าแรก...
          </p>
        </div>
      </div>
    );
  }

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
        <div style={{
          marginBottom: '32px'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#6c757d',
            letterSpacing: '0.5px',
            marginBottom: '8px',
            textTransform: 'uppercase'
          }}>
            แบบประเมินระบบ
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#212529',
            margin: '0 0 12px 0',
            letterSpacing: '-0.3px'
          }}>
            ประสิทธิภาพระบบการดูแลช่วยเหลือผู้เรียน
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6c757d',
            lineHeight: 1.6,
            margin: 0
          }}>
            โปรดประเมินตามความเป็นจริงเพื่อการพัฒนาระบบ ข้อมูลของท่านจะถูกเก็บเป็นความลับ
          </p>
          <div style={{
            marginTop: '16px',
            fontSize: '12px',
            color: '#dc3545'
          }}>
            * ข้อความที่ต้องกรอก
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ข้อมูลผู้ประเมิน */}
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
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#495057' }}>ข้อมูลผู้ประเมิน</span>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <InputField label="ชื่อ-นามสกุล" name="name" value={formData.name} />
              <InputField label="อายุ" name="age" value={formData.age} />
            </div>
          </div>

          {/* ส่วนที่ 1 */}
          <SectionHeader 
            number="1" 
            title="ด้านตรงตามความต้องการ (Function Requirement)" 
            subtitle="ประเมินความสามารถของระบบในการจัดการข้อมูล"
          />
          <QuestionCard title="1.1 ความสามารถในการเรียกใช้งานในระบบฐานข้อมูล" name="fr1" />
          <QuestionCard title="1.2 ความสามารถของระบบในการเพิ่มข้อมูล" name="fr2" />
          <QuestionCard title="1.3 ความสามารถของระบบในการปรับปรุงข้อมูล" name="fr3" />
          <QuestionCard title="1.4 ความสามารถของระบบในการนำเสนอข้อมูล" name="fr4" />
          <QuestionCard title="1.5 ระบบฐานข้อมูลมีความถูกต้องครบถ้วน" name="fr5" />

          {/* ส่วนที่ 2 */}
          <SectionHeader 
            number="2" 
            title="ด้านสามารถทำงานได้ตามหน้าที่ (Function)" 
            subtitle="ประเมินความถูกต้องและความน่าเชื่อถือของระบบ"
          />
          <QuestionCard title="2.1 ความถูกต้องของการทำงานระบบในภาพรวม" name="fn1" />
          <QuestionCard title="2.2 ความถูกต้องของระบบในการจัดประเภทของข้อมูล" name="fn2" />
          <QuestionCard title="2.3 ความถูกต้องของระบบในการเพิ่มข้อมูล" name="fn3" />
          <QuestionCard title="2.4 ความถูกต้องของระบบในการปรับปรุงข้อมูล" name="fn4" />
          <QuestionCard title="2.5 ความถูกต้องของระบบในการนำเสนอข้อมูล" name="fn5" />

          {/* ส่วนที่ 3 */}
          <SectionHeader 
            number="3" 
            title="ด้านความง่ายต่อการใช้งาน (Usability)" 
            subtitle="ประเมินประสบการณ์ผู้ใช้และการออกแบบส่วนติดต่อ"
          />
          <QuestionCard title="3.1 ความง่ายในการเรียกใช้ระบบ" name="ub1" />
          <QuestionCard title="3.2 ความเหมาะสมในการออกแบบหน้าจอโดยภาพรวม" name="ub2" />
          <QuestionCard title="3.3 ความชัดเจนของข้อความที่แสดงบนจอภาพ" name="ub3" />
          <QuestionCard title="3.4 ความสะดวกในการเข้าใช้ระบบ" name="ub4" />
          <QuestionCard title="3.5 ความน่าใช้ของระบบในภาพรวม" name="ub5" />

          {/* ส่วนที่ 4 */}
          <SectionHeader 
            number="4" 
            title="ด้านประสิทธิภาพ (Performance)" 
            subtitle="ประเมินความเร็วและประสิทธิภาพการทำงานของระบบ"
          />
          <QuestionCard title="4.1 ความเร็วในการแสดงผลจากการเชื่อมโยงเพจ" name="pf1" />
          <QuestionCard title="4.2 ความเร็วในการติดต่อกับฐานข้อมูล" name="pf2" />
          <QuestionCard title="4.3 ความเร็วในการบันทึกปรับปรุงข้อมูล" name="pf3" />
          <QuestionCard title="4.4 ความเร็วในการทำงานของระบบในภาพรวม" name="pf4" />

          {/* ส่วนที่ 5 */}
          <SectionHeader number="5" title="ข้อเสนอแนะเพิ่มเติม" />
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            marginBottom: '32px',
            padding: '20px 24px'
          }}>
            <label style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#212529',
              display: 'block',
              marginBottom: '12px'
            }}>
              ข้อเสนอแนะในการปรับปรุงระบบ
            </label>
            <textarea
              name="suggestion"
              value={formData.suggestion}
              onChange={handleInputChange}
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
              placeholder="โปรดระบุด้านที่ต้องการให้มีการปรับปรุง..."
              onFocus={(e) => e.currentTarget.style.borderColor = '#2c3e50'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#ced4da'}
            />
          </div>

          {/* ปุ่มดำเนินการ */}
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
              disabled={loading}
              style={{
                backgroundColor: '#2c3e50',
                color: 'white',
                padding: '10px 28px',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontFamily: 'inherit',
                transition: 'background-color 0.15s ease',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#1e2a36';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#2c3e50';
              }}
            >
              {loading ? 'กำลังบันทึก...' : 'ส่งแบบประเมิน'}
            </button>
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
              ล้างแบบฟอร์ม
            </button>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            fontSize: '11px',
            color: '#adb5bd',
            padding: '20px 0 40px 0',
            borderTop: '1px solid #e9ecef',
            letterSpacing: '0.3px'
          }}>
            แบบประเมินประสิทธิภาพระบบการดูแลช่วยเหลือผู้เรียน • ข้อมูลทั้งหมดถูกเก็บเป็นความลับ
          </div>
        </form>
      </div>
    </div>
  );
}