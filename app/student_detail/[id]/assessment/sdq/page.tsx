"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface SdqFormData {
  // ด้านอารมณ์ (Emotional) - 5 ข้อ
  emotional_somatic: string; // ปวดหัว ปวดท้อง
  emotional_worries: string; // กังวลหลายเรื่อง
  emotional_unhappy: string; // ไม่มีความสุข
  emotional_clingy: string; // กลัว ติดผู้ใหญ่
  emotional_fears: string; // กลัวหลายอย่าง
  
  // ด้านพฤติกรรม (Conduct) - 5 ข้อ
  conduct_angry: string; // อาละวาด โมโห
  conduct_obedient: string; // เชื่อฟัง (คะแนนกลับ)
  conduct_fights: string; // ทะเลาะวิวาท
  conduct_lies: string; // โกหก
  conduct_steals: string; // ขโมย
  
  // ด้านสมาธิ (Hyperactivity) - 5 ข้อ
  hyper_restless: string; // อยู่ไม่สุข
  hyper_fidgety: string; // อยู่ไม่นิ่ง
  hyper_distracted: string; // วอกแวกง่าย
  hyper_reflect: string; // คิดก่อนทำ (คะแนนกลับ)
  hyper_attentive: string; // มีสมาธิ (คะแนนกลับ)
  
  // ด้านความสัมพันธ์กับเพื่อน (Peer) - 5 ข้อ
  peer_loner: string; // อยู่คนเดียว
  peer_friends: string; // มีเพื่อน (คะแนนกลับ)
  peer_popular: string; // เพื่อนชอบ (คะแนนกลับ)
  peer_bullied: string; // ถูกรังแก
  peer_adult: string; // คบผู้ใหญ่
  
  // ด้านความเอื้อเฟื้อ (Prosocial) - 5 ข้อ
  prosocial_considerate: string; // เห็นใจผู้อื่น
  prosocial_shares: string; // แบ่งปัน
  prosocial_caring: string; // ใส่ใจ
  prosocial_kind: string; // ใจดีกับเด็กเล็ก
  prosocial_helps: string; // ช่วยเหลือ
}

export default function SdqAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studentName, setStudentName] = useState("");
  
  const [formData, setFormData] = useState<SdqFormData>({
    emotional_somatic: "0",
    emotional_worries: "0",
    emotional_unhappy: "0",
    emotional_clingy: "0",
    emotional_fears: "0",
    
    conduct_angry: "0",
    conduct_obedient: "0",
    conduct_fights: "0",
    conduct_lies: "0",
    conduct_steals: "0",
    
    hyper_restless: "0",
    hyper_fidgety: "0",
    hyper_distracted: "0",
    hyper_reflect: "0",
    hyper_attentive: "0",
    
    peer_loner: "0",
    peer_friends: "0",
    peer_popular: "0",
    peer_bullied: "0",
    peer_adult: "0",
    
    prosocial_considerate: "0",
    prosocial_shares: "0",
    prosocial_caring: "0",
    prosocial_kind: "0",
    prosocial_helps: "0",
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

  // คำนวณคะแนน
  const calculateScores = () => {
    // ด้านอารมณ์ (คะแนนปกติ)
    const emotional = 
      parseInt(formData.emotional_somatic) +
      parseInt(formData.emotional_worries) +
      parseInt(formData.emotional_unhappy) +
      parseInt(formData.emotional_clingy) +
      parseInt(formData.emotional_fears);
    
    // ด้านพฤติกรรม (conduct_obedient เป็นคะแนนกลับ)
    const conduct = 
      parseInt(formData.conduct_angry) +
      (2 - parseInt(formData.conduct_obedient)) + // คะแนนกลับ: 0->2, 1->1, 2->0
      parseInt(formData.conduct_fights) +
      parseInt(formData.conduct_lies) +
      parseInt(formData.conduct_steals);
    
    // ด้านสมาธิ (hyper_reflect, hyper_attentive เป็นคะแนนกลับ)
    const hyperactivity = 
      parseInt(formData.hyper_restless) +
      parseInt(formData.hyper_fidgety) +
      parseInt(formData.hyper_distracted) +
      (2 - parseInt(formData.hyper_reflect)) + // คะแนนกลับ
      (2 - parseInt(formData.hyper_attentive)); // คะแนนกลับ
    
    // ด้านความสัมพันธ์กับเพื่อน (peer_friends, peer_popular เป็นคะแนนกลับ)
    const peer = 
      parseInt(formData.peer_loner) +
      (2 - parseInt(formData.peer_friends)) + // คะแนนกลับ
      (2 - parseInt(formData.peer_popular)) + // คะแนนกลับ
      parseInt(formData.peer_bullied) +
      parseInt(formData.peer_adult);
    
    // ด้านความเอื้อเฟื้อ (คะแนนปกติ)
    const prosocial = 
      parseInt(formData.prosocial_considerate) +
      parseInt(formData.prosocial_shares) +
      parseInt(formData.prosocial_caring) +
      parseInt(formData.prosocial_kind) +
      parseInt(formData.prosocial_helps);
    
    const total = emotional + conduct + hyperactivity + peer;
    
    let level = "ปกติ";
    let levelColor = "success";
    if (total >= 17) {
      level = "มีปัญหา";
      levelColor = "danger";
    } else if (total >= 14) {
      level = "เสี่ยง";
      levelColor = "warning";
    }

    return {
      emotional,
      conduct,
      hyperactivity,
      peer,
      prosocial,
      total,
      level,
      levelColor
    };
  };

  const scores = calculateScores();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      console.log("Saving SDQ assessment:", {
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
                  <i className="bi bi-clipboard-data me-2 text-warning"></i>
                  แบบประเมิน SDQ
                </h2>
                <p className="text-muted mb-0 mt-1">นักเรียน: {studentName}</p>
              </div>
              <div>
                <span className="badge bg-info rounded-0 p-2 me-2">
                  คะแนนรวม: {scores.total}
                </span>
                <span className={`badge bg-${scores.levelColor} rounded-0 p-2`}>
                  {scores.level}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* END: Page Header */}

        <form onSubmit={handleSubmit}>
          {/* START: ด้านอารมณ์ */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-emoji-frown me-2 text-warning"></i>
                    1. ด้านอารมณ์ (Emotional Problems) - คะแนน {scores.emotional}
                  </h5>
                </div>
                <div className="p-3">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold">ข้อความ</th>
                        <th className="fw-semibold text-center" width="15%">ไม่จริง</th>
                        <th className="fw-semibold text-center" width="15%">ค่อนข้างจริง</th>
                        <th className="fw-semibold text-center" width="15%">จริง</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>มักปวดหัว ปวดท้อง หรือคลื่นไส้</td>
                        <td className="text-center"><input type="radio" name="emotional_somatic" value="0" checked={formData.emotional_somatic === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="emotional_somatic" value="1" checked={formData.emotional_somatic === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="emotional_somatic" value="2" checked={formData.emotional_somatic === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>มักกังวลหลายเรื่อง</td>
                        <td className="text-center"><input type="radio" name="emotional_worries" value="0" checked={formData.emotional_worries === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="emotional_worries" value="1" checked={formData.emotional_worries === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="emotional_worries" value="2" checked={formData.emotional_worries === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>มักไม่มีความสุข ซึม หรือร้องไห้</td>
                        <td className="text-center"><input type="radio" name="emotional_unhappy" value="0" checked={formData.emotional_unhappy === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="emotional_unhappy" value="1" checked={formData.emotional_unhappy === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="emotional_unhappy" value="2" checked={formData.emotional_unhappy === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>มักกลัว ติดผู้ใหญ่ งอแงเมื่อต้องอยู่คนเดียว</td>
                        <td className="text-center"><input type="radio" name="emotional_clingy" value="0" checked={formData.emotional_clingy === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="emotional_clingy" value="1" checked={formData.emotional_clingy === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="emotional_clingy" value="2" checked={formData.emotional_clingy === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>กลัวสิ่งต่างๆ หลายอย่าง กลัวง่าย</td>
                        <td className="text-center"><input type="radio" name="emotional_fears" value="0" checked={formData.emotional_fears === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="emotional_fears" value="1" checked={formData.emotional_fears === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="emotional_fears" value="2" checked={formData.emotional_fears === "2"} onChange={handleInputChange} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {/* END: ด้านอารมณ์ */}

          {/* START: ด้านพฤติกรรม */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-exclamation-triangle me-2 text-warning"></i>
                    2. ด้านพฤติกรรม (Conduct Problems) - คะแนน {scores.conduct}
                  </h5>
                </div>
                <div className="p-3">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold">ข้อความ</th>
                        <th className="fw-semibold text-center" width="15%">ไม่จริง</th>
                        <th className="fw-semibold text-center" width="15%">ค่อนข้างจริง</th>
                        <th className="fw-semibold text-center" width="15%">จริง</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>มักอาละวาด โมโห อารมณ์เสียง่าย</td>
                        <td className="text-center"><input type="radio" name="conduct_angry" value="0" checked={formData.conduct_angry === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="conduct_angry" value="1" checked={formData.conduct_angry === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="conduct_angry" value="2" checked={formData.conduct_angry === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>เชื่อฟัง ทำตามที่ผู้ใหญ่บอก * (คะแนนกลับ)</td>
                        <td className="text-center"><input type="radio" name="conduct_obedient" value="0" checked={formData.conduct_obedient === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="conduct_obedient" value="1" checked={formData.conduct_obedient === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="conduct_obedient" value="2" checked={formData.conduct_obedient === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>มักทะเลาะวิวาท หรือรังแกผู้อื่น</td>
                        <td className="text-center"><input type="radio" name="conduct_fights" value="0" checked={formData.conduct_fights === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="conduct_fights" value="1" checked={formData.conduct_fights === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="conduct_fights" value="2" checked={formData.conduct_fights === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>มักโกหก หรือ หลอกลวง</td>
                        <td className="text-center"><input type="radio" name="conduct_lies" value="0" checked={formData.conduct_lies === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="conduct_lies" value="1" checked={formData.conduct_lies === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="conduct_lies" value="2" checked={formData.conduct_lies === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>ขโมยของ</td>
                        <td className="text-center"><input type="radio" name="conduct_steals" value="0" checked={formData.conduct_steals === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="conduct_steals" value="1" checked={formData.conduct_steals === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="conduct_steals" value="2" checked={formData.conduct_steals === "2"} onChange={handleInputChange} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {/* END: ด้านพฤติกรรม */}

          {/* START: ด้านสมาธิ */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-lightning me-2 text-warning"></i>
                    3. ด้านสมาธิ (Hyperactivity) - คะแนน {scores.hyperactivity}
                  </h5>
                </div>
                <div className="p-3">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold">ข้อความ</th>
                        <th className="fw-semibold text-center" width="15%">ไม่จริง</th>
                        <th className="fw-semibold text-center" width="15%">ค่อนข้างจริง</th>
                        <th className="fw-semibold text-center" width="15%">จริง</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>อยู่ไม่สุข อยู่ไม่นิ่ง ชอบเล่นกับมือ เท้า</td>
                        <td className="text-center"><input type="radio" name="hyper_restless" value="0" checked={formData.hyper_restless === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="hyper_restless" value="1" checked={formData.hyper_restless === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="hyper_restless" value="2" checked={formData.hyper_restless === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>อยู่ไม่นิ่ง ต้องขยับตลอดเวลา</td>
                        <td className="text-center"><input type="radio" name="hyper_fidgety" value="0" checked={formData.hyper_fidgety === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="hyper_fidgety" value="1" checked={formData.hyper_fidgety === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="hyper_fidgety" value="2" checked={formData.hyper_fidgety === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>วอกแวกง่าย เหม่อลอย</td>
                        <td className="text-center"><input type="radio" name="hyper_distracted" value="0" checked={formData.hyper_distracted === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="hyper_distracted" value="1" checked={formData.hyper_distracted === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="hyper_distracted" value="2" checked={formData.hyper_distracted === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>คิดก่อนทำ * (คะแนนกลับ)</td>
                        <td className="text-center"><input type="radio" name="hyper_reflect" value="0" checked={formData.hyper_reflect === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="hyper_reflect" value="1" checked={formData.hyper_reflect === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="hyper_reflect" value="2" checked={formData.hyper_reflect === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>มีสมาธิ จดจ่อกับงานที่ทำ * (คะแนนกลับ)</td>
                        <td className="text-center"><input type="radio" name="hyper_attentive" value="0" checked={formData.hyper_attentive === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="hyper_attentive" value="1" checked={formData.hyper_attentive === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="hyper_attentive" value="2" checked={formData.hyper_attentive === "2"} onChange={handleInputChange} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {/* END: ด้านสมาธิ */}

          {/* START: ด้านความสัมพันธ์กับเพื่อน */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-people me-2 text-warning"></i>
                    4. ด้านความสัมพันธ์กับเพื่อน (Peer Problems) - คะแนน {scores.peer}
                  </h5>
                </div>
                <div className="p-3">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold">ข้อความ</th>
                        <th className="fw-semibold text-center" width="15%">ไม่จริง</th>
                        <th className="fw-semibold text-center" width="15%">ค่อนข้างจริง</th>
                        <th className="fw-semibold text-center" width="15%">จริง</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>ชอบอยู่คนเดียว เล่นคนเดียว</td>
                        <td className="text-center"><input type="radio" name="peer_loner" value="0" checked={formData.peer_loner === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="peer_loner" value="1" checked={formData.peer_loner === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="peer_loner" value="2" checked={formData.peer_loner === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>มีเพื่อนสนิทอย่างน้อย 1 คน * (คะแนนกลับ)</td>
                        <td className="text-center"><input type="radio" name="peer_friends" value="0" checked={formData.peer_friends === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="peer_friends" value="1" checked={formData.peer_friends === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="peer_friends" value="2" checked={formData.peer_friends === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>เพื่อนๆ มักชอบและคบหากับเขา * (คะแนนกลับ)</td>
                        <td className="text-center"><input type="radio" name="peer_popular" value="0" checked={formData.peer_popular === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="peer_popular" value="1" checked={formData.peer_popular === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="peer_popular" value="2" checked={formData.peer_popular === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>มักถูกรังแกหรือแกล้งโดยเพื่อน</td>
                        <td className="text-center"><input type="radio" name="peer_bullied" value="0" checked={formData.peer_bullied === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="peer_bullied" value="1" checked={formData.peer_bullied === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="peer_bullied" value="2" checked={formData.peer_bullied === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>ชอบคบเพื่อนที่โตกว่า หรือเด็กกว่า</td>
                        <td className="text-center"><input type="radio" name="peer_adult" value="0" checked={formData.peer_adult === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="peer_adult" value="1" checked={formData.peer_adult === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="peer_adult" value="2" checked={formData.peer_adult === "2"} onChange={handleInputChange} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {/* END: ด้านความสัมพันธ์กับเพื่อน */}

          {/* START: ด้านความเอื้อเฟื้อ */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-heart me-2 text-warning"></i>
                    5. ด้านความเอื้อเฟื้อ (Prosocial) - คะแนน {scores.prosocial}
                  </h5>
                </div>
                <div className="p-3">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-semibold">ข้อความ</th>
                        <th className="fw-semibold text-center" width="15%">ไม่จริง</th>
                        <th className="fw-semibold text-center" width="15%">ค่อนข้างจริง</th>
                        <th className="fw-semibold text-center" width="15%">จริง</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>เห็นใจความรู้สึกผู้อื่น</td>
                        <td className="text-center"><input type="radio" name="prosocial_considerate" value="0" checked={formData.prosocial_considerate === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="prosocial_considerate" value="1" checked={formData.prosocial_considerate === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="prosocial_considerate" value="2" checked={formData.prosocial_considerate === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>แบ่งปันสิ่งของกับผู้อื่น</td>
                        <td className="text-center"><input type="radio" name="prosocial_shares" value="0" checked={formData.prosocial_shares === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="prosocial_shares" value="1" checked={formData.prosocial_shares === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="prosocial_shares" value="2" checked={formData.prosocial_shares === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>ใส่ใจ ดูแลเมื่อผู้อื่นเสียใจ</td>
                        <td className="text-center"><input type="radio" name="prosocial_caring" value="0" checked={formData.prosocial_caring === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="prosocial_caring" value="1" checked={formData.prosocial_caring === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="prosocial_caring" value="2" checked={formData.prosocial_caring === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>ใจดีกับเด็กเล็ก</td>
                        <td className="text-center"><input type="radio" name="prosocial_kind" value="0" checked={formData.prosocial_kind === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="prosocial_kind" value="1" checked={formData.prosocial_kind === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="prosocial_kind" value="2" checked={formData.prosocial_kind === "2"} onChange={handleInputChange} /></td>
                      </tr>
                      <tr>
                        <td>ชอบช่วยเหลือผู้อื่น</td>
                        <td className="text-center"><input type="radio" name="prosocial_helps" value="0" checked={formData.prosocial_helps === "0"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="prosocial_helps" value="1" checked={formData.prosocial_helps === "1"} onChange={handleInputChange} /></td>
                        <td className="text-center"><input type="radio" name="prosocial_helps" value="2" checked={formData.prosocial_helps === "2"} onChange={handleInputChange} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {/* END: ด้านความเอื้อเฟื้อ */}

          {/* START: สรุปผล */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border bg-white p-4">
                <div className="row">
                  <div className="col-md-8">
                    <h5 className="fw-bold mb-3">สรุปผลการประเมิน SDQ</h5>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td>ด้านอารมณ์</td>
                          <td className="fw-bold">{scores.emotional}</td>
                        </tr>
                        <tr>
                          <td>ด้านพฤติกรรม</td>
                          <td className="fw-bold">{scores.conduct}</td>
                        </tr>
                        <tr>
                          <td>ด้านสมาธิ</td>
                          <td className="fw-bold">{scores.hyperactivity}</td>
                        </tr>
                        <tr>
                          <td>ด้านความสัมพันธ์กับเพื่อน</td>
                          <td className="fw-bold">{scores.peer}</td>
                        </tr>
                        <tr className="table-active">
                          <td className="fw-bold">คะแนนรวม (Total Difficulties)</td>
                          <td className="fw-bold">{scores.total}</td>
                        </tr>
                        <tr>
                          <td>ด้านความเอื้อเฟื้อ</td>
                          <td className="fw-bold">{scores.prosocial}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-4">
                    <div className={`p-3 bg-${scores.levelColor} text-${scores.levelColor === 'warning' ? 'dark' : 'white'} rounded-0`}>
                      <h6 className="fw-bold mb-2">ผลการประเมิน</h6>
                      <h4 className="fw-bold mb-2">{scores.level}</h4>
                      <p className="small mb-0">
                        {scores.level === "ปกติ" && "นักเรียนอยู่ในเกณฑ์ปกติ ไม่มีปัญหา"}
                        {scores.level === "เสี่ยง" && "นักเรียนมีแนวโน้มที่จะมีปัญหา ควรติดตามดูแล"}
                        {scores.level === "มีปัญหา" && "นักเรียนมีปัญหาชัดเจน ควรได้รับความช่วยเหลือ"}
                      </p>
                    </div>
                  </div>
                </div>
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
              <span>แบบประเมิน SDQ</span>
            </div>
          </div>
        </div>
      </footer>
      {/* END: Footer */}
    </div>
  );
}