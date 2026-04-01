'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface EvaluationFormData {
  studentId: string;
  studentName: string;
  studentCode: string;
  studentClass: string;
  
  // 1. ด้านตรงตามความต้องการ (Function Requirement)
  functionRequirement: {
    dataAccess: number;
    dataAdd: number;
    dataUpdate: number;
    dataPresentation: number;
    dataAccuracy: number;
  };
  
  // 2. ด้านสามารถทำงานได้ตามหน้าที่ (Function)
  functionality: {
    overallAccuracy: number;
    dataClassification: number;
    addDataAccuracy: number;
    updateDataAccuracy: number;
    presentationAccuracy: number;
  };
  
  // 3. ด้านความง่ายต่อการใช้งาน (Usability)
  usability: {
    easeOfUse: number;
    screenDesign: number;
    textClarity: number;
    accessibility: number;
    overallUsability: number;
  };
  
  // 4. ด้านประสิทธิภาพ (Performance)
  performance: {
    pageLoadSpeed: number;
    databaseSpeed: number;
    saveUpdateSpeed: number;
    overallPerformance: number;
  };
  
  additionalSuggestions: string;
}

export default function EvaluationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState<EvaluationFormData>({
    studentId: '',
    studentName: '',
    studentCode: '',
    studentClass: '',
    
    functionRequirement: {
      dataAccess: 3,
      dataAdd: 3,
      dataUpdate: 3,
      dataPresentation: 3,
      dataAccuracy: 3
    },
    
    functionality: {
      overallAccuracy: 3,
      dataClassification: 3,
      addDataAccuracy: 3,
      updateDataAccuracy: 3,
      presentationAccuracy: 3
    },
    
    usability: {
      easeOfUse: 3,
      screenDesign: 3,
      textClarity: 3,
      accessibility: 3,
      overallUsability: 3
    },
    
    performance: {
      pageLoadSpeed: 3,
      databaseSpeed: 3,
      saveUpdateSpeed: 3,
      overallPerformance: 3
    },
    
    additionalSuggestions: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        studentId: session.user.id || '',
        studentName: session.user.name || '',
        studentCode: (session.user as any).code || '',
        studentClass: (session.user as any).class || ''
      }));
    }
  }, [session, status, router]);

  const handleScoreChange = (category: string, field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...(prev as any)[category],
        [field]: value
      }
    }));
  };

  const handleTextChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const response = await fetch('/api/evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowSuccess(true);
        // Reset form
        setCurrentStep(1);
        setFormData({
          studentId: session?.user?.id || '',
          studentName: session?.user?.name || '',
          studentCode: (session?.user as any)?.code || '',
          studentClass: (session?.user as any)?.class || '',
          
          functionRequirement: {
            dataAccess: 3,
            dataAdd: 3,
            dataUpdate: 3,
            dataPresentation: 3,
            dataAccuracy: 3
          },
          
          functionality: {
            overallAccuracy: 3,
            dataClassification: 3,
            addDataAccuracy: 3,
            updateDataAccuracy: 3,
            presentationAccuracy: 3
          },
          
          usability: {
            easeOfUse: 3,
            screenDesign: 3,
            textClarity: 3,
            accessibility: 3,
            overallUsability: 3
          },
          
          performance: {
            pageLoadSpeed: 3,
            databaseSpeed: 3,
            saveUpdateSpeed: 3,
            overallPerformance: 3
          },
          
          additionalSuggestions: ''
        });
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreLabel = (score: number) => {
    switch(score) {
      case 1: return 'ดีมาก';
      case 2: return 'ดี';
      case 3: return 'ปานกลาง';
      case 4: return 'พอใช้';
      case 5: return 'ไม่ดี';
      default: return '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 1) return 'text-green-600';
    if (score <= 2) return 'text-blue-600';
    if (score === 3) return 'text-yellow-600';
    if (score === 4) return 'text-orange-600';
    return 'text-red-600';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">📋</div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ขอบคุณสำหรับการประเมิน</h2>
          <p className="text-gray-600 mb-6">ข้อมูลการประเมินของคุณได้รับการบันทึกเรียบร้อยแล้ว</p>
          <button
            onClick={() => {
              setShowSuccess(false);
              router.push('/student/dashboard');
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            กลับไปหน้า Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">แบบประเมินความพึงพอใจ</h1>
          <p className="text-gray-600">ประเมินประสิทธิภาพของระบบการดูแลช่วยเหลือผู้เรียน</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">ขั้นตอน {currentStep} จาก {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          {/* Step 1: Student Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">👤 ข้อมูลผู้ประเมิน</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ-นามสกุล</label>
                    <input
                      type="text"
                      value={formData.studentName}
                      onChange={(e) => handleTextChange('studentName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">รหัสนักศึกษา</label>
                    <input
                      type="text"
                      value={formData.studentCode}
                      onChange={(e) => handleTextChange('studentCode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ชั้นปี</label>
                    <input
                      type="text"
                      value={formData.studentClass}
                      onChange={(e) => handleTextChange('studentClass', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Function Requirement */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">1️⃣ ด้านตรงตามความต้องการ (Function Requirement)</h2>
                <div className="space-y-4">
                  {[
                    { key: 'dataAccess', label: 'ความสามารถในการเรียกใช้งานในระบบฐานข้อมูล' },
                    { key: 'dataAdd', label: 'ความสามารถของระบบในการเพิ่มข้อมูล' },
                    { key: 'dataUpdate', label: 'ความสามารถของระบบในการปรับปรุงข้อมูล' },
                    { key: 'dataPresentation', label: 'ความสามารถของระบบในการนำเสนอข้อมูล' },
                    { key: 'dataAccuracy', label: 'ระบบฐานข้อมูลมีความถูกต้องครบถ้วน' }
                  ].map((item) => (
                    <div key={item.key} className="border border-gray-200 rounded-lg p-4">
                      <p className="font-medium text-gray-800 mb-3">{item.label}</p>
                      <div className="flex flex-wrap gap-3">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <label key={score} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`functionRequirement-${item.key}`}
                              value={score}
                              checked={formData.functionRequirement[item.key as keyof typeof formData.functionRequirement] === score}
                              onChange={(e) => handleScoreChange('functionRequirement', item.key, Number(e.target.value))}
                              className="mr-2"
                            />
                            <span className={`font-medium ${getScoreColor(score)}`}>
                              {score} - {getScoreLabel(score)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Functionality */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">2️⃣ ด้านสามารถทำงานได้ตามหน้าที่ (Function)</h2>
                <div className="space-y-4">
                  {[
                    { key: 'overallAccuracy', label: 'ความถูกต้องของการทำงานระบบในภาพรวม' },
                    { key: 'dataClassification', label: 'ความถูกต้องของระบบในการจัดประเภทของข้อมูล' },
                    { key: 'addDataAccuracy', label: 'ความถูกต้องของระบบในการเพิ่มข้อมูล' },
                    { key: 'updateDataAccuracy', label: 'ความถูกต้องของระบบในการปรับปรุงข้อมูล' },
                    { key: 'presentationAccuracy', label: 'ความถูกต้องของระบบในการนำเสนอข้อมูล' }
                  ].map((item) => (
                    <div key={item.key} className="border border-gray-200 rounded-lg p-4">
                      <p className="font-medium text-gray-800 mb-3">{item.label}</p>
                      <div className="flex flex-wrap gap-3">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <label key={score} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`functionality-${item.key}`}
                              value={score}
                              checked={formData.functionality[item.key as keyof typeof formData.functionality] === score}
                              onChange={(e) => handleScoreChange('functionality', item.key, Number(e.target.value))}
                              className="mr-2"
                            />
                            <span className={`font-medium ${getScoreColor(score)}`}>
                              {score} - {getScoreLabel(score)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Usability & Performance */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">3️⃣ ด้านความง่ายต่อการใช้งาน (Usability)</h2>
                <div className="space-y-4">
                  {[
                    { key: 'easeOfUse', label: 'ความง่ายในการเรียกใช้ระบบ' },
                    { key: 'screenDesign', label: 'ความเหมาะสมในการออกแบบหน้าจอโดยภาพรวม' },
                    { key: 'textClarity', label: 'ความชัดเจนของข้อความที่แสดงบนจอภาพ' },
                    { key: 'accessibility', label: 'ความสะดวกในการเข้าใช้ระบบ' },
                    { key: 'overallUsability', label: 'ความน่าใช้ของระบบในภาพรวม' }
                  ].map((item) => (
                    <div key={item.key} className="border border-gray-200 rounded-lg p-4">
                      <p className="font-medium text-gray-800 mb-3">{item.label}</p>
                      <div className="flex flex-wrap gap-3">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <label key={score} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`usability-${item.key}`}
                              value={score}
                              checked={formData.usability[item.key as keyof typeof formData.usability] === score}
                              onChange={(e) => handleScoreChange('usability', item.key, Number(e.target.value))}
                              className="mr-2"
                            />
                            <span className={`font-medium ${getScoreColor(score)}`}>
                              {score} - {getScoreLabel(score)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">4️⃣ ด้านประสิทธิภาพ (Performance)</h2>
                <div className="space-y-4">
                  {[
                    { key: 'pageLoadSpeed', label: 'ความเร็วในการแสดงผลจากการเชื่อมโยงเพจ' },
                    { key: 'databaseSpeed', label: 'ความเร็วในการติดต่อกับฐานข้อมูล' },
                    { key: 'saveUpdateSpeed', label: 'ความเร็วในการบันทึกปรับปรุงข้อมูล' },
                    { key: 'overallPerformance', label: 'ความเร็วในการทำงานของระบบในภาพรวม' }
                  ].map((item) => (
                    <div key={item.key} className="border border-gray-200 rounded-lg p-4">
                      <p className="font-medium text-gray-800 mb-3">{item.label}</p>
                      <div className="flex flex-wrap gap-3">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <label key={score} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`performance-${item.key}`}
                              value={score}
                              checked={formData.performance[item.key as keyof typeof formData.performance] === score}
                              onChange={(e) => handleScoreChange('performance', item.key, Number(e.target.value))}
                              className="mr-2"
                            />
                            <span className={`font-medium ${getScoreColor(score)}`}>
                              {score} - {getScoreLabel(score)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Additional Suggestions */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">💭 ข้อเสนอแนะเพิ่มเติม</h2>
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    กรุณาระบุข้อเสนอแนะหรือความคิดเห็นเพิ่มเติม (ถ้ามี)
                  </label>
                  <textarea
                    value={formData.additionalSuggestions}
                    onChange={(e) => handleTextChange('additionalSuggestions', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="พิมพ์ข้อเสนอแนะของคุณที่นี่..."
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">📋 สรุปข้อมูลการประเมิน</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ชื่อ-นามสกุล:</span>
                    <span className="ml-2 font-medium">{formData.studentName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">รหัสนักศึกษา:</span>
                    <span className="ml-2 font-medium">{formData.studentCode}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">ชั้นปี:</span>
                    <span className="ml-2 font-medium">{formData.studentClass}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← ก่อนหน้า
                </button>
              )}
            </div>
            
            <div>
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ถัดไป →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      บันทึกการประเมิน ✓
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
