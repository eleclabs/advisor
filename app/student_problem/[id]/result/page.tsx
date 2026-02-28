"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { use } from "react";

export default function EvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [currentEvaluation, setCurrentEvaluation] = useState(1);
  
  const [formData, setFormData] = useState({
    evaluation_number: 1,
    improvement_level: "",
    improvement_detail: "",
    result: "",
    notes: "",
    evaluation_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      setFetchLoading(true);
      const res = await fetch(`/api/problem/${id}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        setStudent(data.data);
        if (data.data.evaluations && data.data.evaluations.length > 0) {
          setEvaluations(data.data.evaluations);
          setCurrentEvaluation(data.data.evaluations.length + 1);
          setFormData(prev => ({
            ...prev,
            evaluation_number: data.data.evaluations.length + 1
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      alert("ไม่พบข้อมูลนักเรียน");
      router.push("/student_problem");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.improvement_level || !formData.result) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/problem/${id}/evaluation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("บันทึกผลการประเมินเรียบร้อย");
        router.push(`/student_problem/${id}`);
      } else {
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  const getImprovementLevelText = (level: string) => {
    switch(level) {
      case 'ดีขึ้นชัดเจน': 
        return 'พฤติกรรมเป้าหมายหายไปหรือลดลงเกิน 80%';
      case 'เริ่มเห็นการเปลี่ยนแปลง': 
        return 'ดีขึ้นบางส่วนยังต้องกำกับดูแล';
      case 'คงเดิม/ไม่เปลี่ยนแปลง': 
        return 'ต้องปรับแผนการช่วยเหลือใหม่';
      default:
        return '';
    }
  };

  if (fetchLoading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="mt-2 text-muted">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h4 className="mb-0">
                <i className="bi bi-clipboard-check me-2"></i>
                บันทึกผลการประเมินการช่วยเหลือ
              </h4>
            </div>
            <div className="card-body">
              {/* ข้อมูลนักเรียน */}
              {student && (
                <div className="alert alert-info mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold fs-5">{student.student_name}</div>
                      <div className="d-flex gap-3 mt-2">
                        <span className="badge bg-dark rounded-0">
                          <i className="bi bi-person-badge me-1"></i>
                          รหัส {student.student_id}
                        </span>
                        <span className="badge bg-primary rounded-0">
                          <i className="bi bi-chart-line me-1"></i>
                          ความคืบหน้า {student.progress || 0}%
                        </span>
                        <span className="badge bg-warning text-dark rounded-0">
                          <i className="bi bi-flag me-1"></i>
                          {student.isp_status || 'กำลังดำเนินการ'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ประวัติการประเมิน */}
              {evaluations.length > 0 && (
                <div className="card mb-4 border-secondary">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <i className="bi bi-clock-history me-2"></i>
                      ประวัติการประเมิน (ครั้งที่ผ่านมา)
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>ครั้งที่</th>
                            <th>วันที่</th>
                            <th>ระดับการพัฒนา</th>
                            <th>ผลการช่วยเหลือ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {evaluations.map((evaluation, index) => (
                            <tr key={index}>
                              <td>{evaluation.evaluation_number}</td>
                              <td>{new Date(evaluation.evaluation_date).toLocaleDateString('th-TH')}</td>
                              <td>
                                <span className="badge bg-info">{evaluation.improvement_level}</span>
                              </td>
                              <td>
                                <span className={`badge ${
                                  evaluation.result === 'ยุติการช่วยเหลือ' ? 'bg-success' : 
                                  evaluation.result === 'ดำเนินการต่อ' ? 'bg-warning' : 'bg-danger'
                                }`}>
                                  {evaluation.result}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-12">
                    <h5 className="border-bottom pb-2 mb-3">
                      <i className="bi bi-clipboard2-pulse me-2"></i>
                      แบบประเมินผลการช่วยเหลือ (ครั้งที่ {currentEvaluation})
                    </h5>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">วันที่ประเมิน</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.evaluation_date}
                      onChange={(e) => setFormData({...formData, evaluation_date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">ครั้งที่ประเมิน</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.evaluation_number}
                      onChange={(e) => setFormData({...formData, evaluation_number: parseInt(e.target.value) || 1})}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">ระดับการพัฒนา</label>
                  <div className="border p-3 bg-light">
                    {[
                      { value: 'ดีขึ้นชัดเจน', desc: 'พฤติกรรมเป้าหมายหายไปหรือลดลงเกิน 80%' },
                      { value: 'เริ่มเห็นการเปลี่ยนแปลง', desc: 'ดีขึ้นบางส่วนยังต้องกำกับดูแล' },
                      { value: 'คงเดิม/ไม่เปลี่ยนแปลง', desc: 'ต้องปรับแผนการช่วยเหลือใหม่' }
                    ].map((option) => (
                      <div className="form-check mb-2" key={option.value}>
                        <input
                          type="radio"
                          className="form-check-input"
                          id={option.value}
                          name="improvement_level"
                          value={option.value}
                          checked={formData.improvement_level === option.value}
                          onChange={(e) => setFormData({...formData, improvement_level: e.target.value})}
                        />
                        <label className="form-check-label" htmlFor={option.value}>
                          <div className="d-flex">
                            <span className="me-2">[ ]</span>
                            <div>
                              <strong>{option.value}:</strong> {option.desc}
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">รายละเอียดการพัฒนา</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="บรรยายรายละเอียดการเปลี่ยนแปลงที่เกิดขึ้น..."
                    value={formData.improvement_detail}
                    onChange={(e) => setFormData({...formData, improvement_detail: e.target.value})}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">สรุปผลการช่วยเหลือ</label>
                  <div className="border p-3 bg-light">
                    {[
                      { value: 'ยุติการช่วยเหลือ', desc: 'กลับสู่กลุ่มปกติ' },
                      { value: 'ดำเนินการต่อ', desc: 'ยังคงดูแลต่อ' },
                      { value: 'ส่งต่อผู้เชี่ยวชาญ', desc: 'ส่งไปยังผู้เชี่ยวชาญเฉพาะทาง' }
                    ].map((option) => (
                      <div className="form-check mb-2" key={option.value}>
                        <input
                          type="radio"
                          className="form-check-input"
                          id={option.value}
                          name="result"
                          value={option.value}
                          checked={formData.result === option.value}
                          onChange={(e) => setFormData({...formData, result: e.target.value})}
                        />
                        <label className="form-check-label" htmlFor={option.value}>
                          <div className="d-flex">
                            <span className="me-2">[ ]</span>
                            <div>
                              <strong>{option.value}:</strong> {option.desc}
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">หมายเหตุเพิ่มเติม</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="ข้อสังเกตอื่นๆ..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Link href={`/student_problem/${id}`} className="btn btn-secondary">
                    <i className="bi bi-arrow-left me-1"></i>
                    กลับ
                  </Link>
                  <button type="submit" className="btn btn-warning" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>
                        บันทึกผลการประเมิน
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}