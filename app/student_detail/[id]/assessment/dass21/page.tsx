"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Dass21FormData {
  q1: string;  // ผม/ฉัน รู้สึกเครียด
  q2: string;  // ผม/ฉัน รู้สึกปากแห้ง คอแห้ง
  q3: string;  // ผม/ฉัน ไม่รู้สึกมีความสุขเลย
  q4: string;  // ผม/ฉัน หายใจลำบาก
  q5: string;  // ผม/ฉัน ไม่รู้สึกกระตือรือร้น
  q6: string;  // ผม/ฉัน รู้สึกโกรธ
  q7: string;  // ผม/ฉัน รู้สึกตื่นตระหนก
  q8: string;  // ผม/ฉัน รู้สึกชีวิตไม่มีคุณค่า
  q9: string;  // ผม/ฉัน รู้สึกกังวล
  q10: string; // ผม/ฉัน รู้สึกสั่น
  q11: string; // ผม/ฉัน รู้สึกเศร้า
  q12: string; // ผม/ฉัน รู้สึกหงุดหงิด
  q13: string; // ผม/ฉัน หัวใจเต้นแรง
  q14: string; // ผม/ฉัน รู้สึกกลัว
  q15: string; // ผม/ฉัน รู้สึกหมดหวัง
  q16: string; // ผม/ฉัน รู้สึกกระสับกระส่าย
  q17: string; // ผม/ฉัน รู้สึกอ่อนเพลีย
  q18: string; // ผม/ฉัน รู้สึกโกรธง่าย
  q19: string; // ผม/ฉัน รู้สึกวิตกกังวล
  q20: string; // ผม/ฉัน รู้สึกเวียนหัว
  q21: string; // ผม/ฉัน รู้สึกว่าชีวิตไม่มีความหมาย
}

export default function Dass21AssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studentName, setStudentName] = useState("");
  
  const [formData, setFormData] = useState<Dass21FormData>({
    q1: "0", q2: "0", q3: "0", q4: "0", q5: "0", q6: "0", q7: "0",
    q8: "0", q9: "0", q10: "0", q11: "0", q12: "0", q13: "0", q14: "0",
    q15: "0", q16: "0", q17: "0", q18: "0", q19: "0", q20: "0", q21: "0"
  });

  useEffect(() => {
    // Load Bootstrap CSS
    const bootstrapLink = document.createElement("link");
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    bootstrapLink.rel = "stylesheet";
    document.head.appendChild(bootstrapLink);

    // Load Bootstrap Icons
    const iconLink = document.createElement("link");
    iconLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);

    // Mock student name
    const mockNames: { [key: string]: string } = {
      "66001": "นายสมชาย ใจดี",
      "66002": "นางสาวจิรา สวยใจ",
      "66003": "นายสมเด็จ วิจิตร",
    };
    setStudentName(mockNames[studentId] || "นักเรียน");
    setLoading(false);
  }, [studentId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // คำนวณคะแนน DASS-21
  const calculateScores = () => {
    // คะแนนความเครียด (Stress) - ข้อ 1, 6, 8, 11, 12, 14, 18
    const stress = 
      parseInt(formData.q1) + parseInt(formData.q6) + parseInt(formData.q8) +
      parseInt(formData.q11) + parseInt(formData.q12) + parseInt(formData.q14) +
      parseInt(formData.q18);
    
    // คะแนนวิตกกังวล (Anxiety) - ข้อ 2, 4, 7, 9, 13, 16, 19
    const anxiety = 
      parseInt(formData.q2) + parseInt(formData.q4) + parseInt(formData.q7) +
      parseInt(formData.q9) + parseInt(formData.q13) + parseInt(formData.q16) +
      parseInt(formData.q19);
    
    // คะแนนซึมเศร้า (Depression) - ข้อ 3, 5, 10, 15, 17, 20, 21
    const depression = 
      parseInt(formData.q3) + parseInt(formData.q5) + parseInt(formData.q10) +
      parseInt(formData.q15) + parseInt(formData.q17) + parseInt(formData.q20) +
      parseInt(formData.q21);
    
    const total = stress + anxiety + depression;

    const getLevel = (score: number, type: string) => {
      if (type === "depression") {
        if (score <= 9) return { text: "ปกติ", color: "success" };
        if (score <= 13) return { text: "ปานกลาง", color: "warning" };
        if (score <= 20) return { text: "รุนแรง", color: "danger" };
        return { text: "รุนแรงมาก", color: "dark" };
      } else if (type === "anxiety") {
        if (score <= 7) return { text: "ปกติ", color: "success" };
        if (score <= 9) return { text: "ปานกลาง", color: "warning" };
        if (score <= 14) return { text: "รุนแรง", color: "danger" };
        return { text: "รุนแรงมาก", color: "dark" };
      } else {
        if (score <= 10) return { text: "ปกติ", color: "success" };
        if (score <= 14) return { text: "ปานกลาง", color: "warning" };
        if (score <= 19) return { text: "รุนแรง", color: "danger" };
        return { text: "รุนแรงมาก", color: "dark" };
      }
    };

    return {
      stress,
      anxiety,
      depression,
      total,
      stressLevel: getLevel(stress, "stress"),
      anxietyLevel: getLevel(anxiety, "anxiety"),
      depressionLevel: getLevel(depression, "depression"),
    };
  };

  const scores = calculateScores();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      console.log("Saving DASS-21 assessment:", {
        studentId,
        ...formData,
        scores: calculateScores()
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push(`/student_detail/${studentId}`);
    } catch (error) {
      console.error("Error saving assessment:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  const questions = [
    "ผม/ฉัน รู้สึกเครียด",
    "ผม/ฉัน รู้สึกปากแห้ง คอแห้ง",
    "ผม/ฉัน ไม่รู้สึกมีความสุขเลย",
    "ผม/ฉัน หายใจลำบาก (เช่น หายใจเร็ว หายใจไม่ทั่ว)",
    "ผม/ฉัน ไม่รู้สึกกระตือรือร้นที่จะทำอะไร",
    "ผม/ฉัน รู้สึกโกรธ โมโห",
    "ผม/ฉัน รู้สึกตื่นตระหนก",
    "ผม/ฉัน รู้สึกว่าชีวิตไม่มีคุณค่า",
    "ผม/ฉัน รู้สึกกังวล",
    "ผม/ฉัน รู้สึกสั่น",
    "ผม/ฉัน รู้สึกเศร้า",
    "ผม/ฉัน รู้สึกหงุดหงิด",
    "ผม/ฉัน รู้สึกหัวใจเต้นแรงโดยไม่ทราบสาเหตุ",
    "ผม/ฉัน รู้สึกกลัวโดยไม่มีเหตุผล",
    "ผม/ฉัน รู้สึกหมดหวัง",
    "ผม/ฉัน รู้สึกกระสับกระส่าย",
    "ผม/ฉัน รู้สึกอ่อนเพลีย",
    "ผม/ฉัน รู้สึกโกรธง่าย",
    "ผม/ฉัน รู้สึกวิตกกังวล",
    "ผม/ฉัน รู้สึกเวียนหัว",
    "ผม/ฉัน รู้สึกว่าชีวิตไม่มีความหมาย"
  ];

  return (
    <div className="min-vh-100 bg-light">
      {/* START: Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-2 border-warning">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-uppercase" href="/student">
            <i className="bi bi-mortarboard-fill me-2 text-warning"></i>
            <span className="text-warning">ระบบดูแลผู้เรียนรายบุคคล</span>
          </a>
          <div className="ms-3">
            <span className="badge bg-warning text-dark rounded-0 p-2">รหัสนักศึกษา: {studentId}</span>
          </div>
        </div>
      </nav>
      {/* END: Navigation Bar */}

      <div className="container-fluid py-4">
        {/* START: Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <div>
                <h2 className="text-uppercase fw-bold m-0">
                  <i className="bi bi-clipboard-heart me-2 text-warning"></i>
                  แบบประเมิน DASS-21
                </h2>
                <p className="text-muted mb-0 mt-1">นักเรียน: {studentName}</p>
              </div>
              <div>
                <span className="badge bg-info rounded-0 p-2">
                  คะแนนรวม: {scores.total}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* END: Page Header */}

        <form onSubmit={handleSubmit}>
          {/* START: คำชี้แจง */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white p-3">
                <p className="mb-0">
                  <i className="bi bi-info-circle me-2 text-warning"></i>
                  กรุณาอ่านแต่ละข้อความและเลือกคำตอบที่ตรงกับความรู้สึกของนักเรียนในช่วง 1 สัปดาห์ที่ผ่านมา
                </p>
              </div>
            </div>
          </div>
          {/* END: คำชี้แจง */}

          {/* START: แบบประเมิน */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-question-circle me-2 text-warning"></i>
                    คำถามทั้ง 21 ข้อ
                  </h5>
                </div>
                <div className="p-3">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold">ข้อ</th>
                        <th className="fw-semibold">ข้อความ</th>
                        <th className="fw-semibold text-center" width="15%">ไม่เลย</th>
                        <th className="fw-semibold text-center" width="15%">บ้าง</th>
                        <th className="fw-semibold text-center" width="15%">ค่อนข้างมาก</th>
                        <th className="fw-semibold text-center" width="15%">มากที่สุด</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map((q, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{q}</td>
                          <td className="text-center">
                            <input 
                              type="radio" 
                              name={`q${index + 1}`} 
                              value="0" 
                              checked={formData[`q${index + 1}` as keyof Dass21FormData] === "0"} 
                              onChange={handleInputChange}
                            />
                          </td>
                          <td className="text-center">
                            <input 
                              type="radio" 
                              name={`q${index + 1}`} 
                              value="1" 
                              checked={formData[`q${index + 1}` as keyof Dass21FormData] === "1"} 
                              onChange={handleInputChange}
                            />
                          </td>
                          <td className="text-center">
                            <input 
                              type="radio" 
                              name={`q${index + 1}`} 
                              value="2" 
                              checked={formData[`q${index + 1}` as keyof Dass21FormData] === "2"} 
                              onChange={handleInputChange}
                            />
                          </td>
                          <td className="text-center">
                            <input 
                              type="radio" 
                              name={`q${index + 1}`} 
                              value="3" 
                              checked={formData[`q${index + 1}` as keyof Dass21FormData] === "3"} 
                              onChange={handleInputChange}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {/* END: แบบประเมิน */}

          {/* START: สรุปผล */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white p-4">
                <h5 className="fw-bold mb-4">สรุปผลการประเมิน DASS-21</h5>
                <div className="row">
                  <div className="col-md-4">
                    <div className={`p-3 border text-center mb-3`}>
                      <h6 className="fw-bold">ด้านซึมเศร้า</h6>
                      <h3 className="fw-bold">{scores.depression}</h3>
                      <span className={`badge bg-${scores.depressionLevel.color} rounded-0 p-2`}>
                        {scores.depressionLevel.text}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className={`p-3 border text-center mb-3`}>
                      <h6 className="fw-bold">ด้านวิตกกังวล</h6>
                      <h3 className="fw-bold">{scores.anxiety}</h3>
                      <span className={`badge bg-${scores.anxietyLevel.color} rounded-0 p-2`}>
                        {scores.anxietyLevel.text}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className={`p-3 border text-center mb-3`}>
                      <h6 className="fw-bold">ด้านความเครียด</h6>
                      <h3 className="fw-bold">{scores.stress}</h3>
                      <span className={`badge bg-${scores.stressLevel.color} rounded-0 p-2`}>
                        {scores.stressLevel.text}
                      </span>
                    </div>
                  </div>
                </div>

                {(scores.depressionLevel.color === "danger" || scores.anxietyLevel.color === "danger" || scores.stressLevel.color === "danger") && (
                  <div className="alert alert-danger rounded-0 mt-3">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    พบระดับความรุนแรง ควรได้รับการดูแลและส่งต่อพบผู้เชี่ยวชาญ
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* END: สรุปผล */}

          {/* START: Form Actions */}
          <div className="row mb-4">
            <div className="col-12 text-center">
              <Link
                href={`/student_detail/${studentId}`}
                className="btn btn-secondary rounded-0 text-uppercase fw-semibold me-3 px-5"
              >
                <i className="bi bi-x-circle me-2"></i>ยกเลิก
              </Link>
              <button 
                type="submit" 
                className="btn btn-warning rounded-0 text-uppercase fw-semibold px-5"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>บันทึกผลประเมิน
                  </>
                )}
              </button>
            </div>
          </div>
          {/* END: Form Actions */}
        </form>
      </div>

      {/* START: Footer */}
      <footer className="bg-dark text-white mt-5 py-3 border-top border-warning">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 text-uppercase small">
              <i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล
            </div>
            <div className="col-md-6 text-end text-uppercase small">
              <span className="me-3">เวอร์ชัน 2.0.0</span>
              <span>แบบประเมิน DASS-21</span>
            </div>
          </div>
        </div>
      </footer>
      {/* END: Footer */}
    </div>
  );
}