"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface HomeroomPlan {
  id: string;
  level: string;
  semester: string;
  academicYear: string;
  week: number;
  time: string;
  topic: string;
  objectives: string[];
  
  // ช่วงที่ 1
  checkAttendance: string;
  checkUniform: string;
  announceNews: string;
  
  // ช่วงที่ 2
  warmup: string;
  mainActivity: string;
  summary: string;
  
  // ช่วงที่ 3
  trackProblems: string;
  individualCounsel: string;
  
  // การประเมิน
  evalObservation: boolean;
  evalWorksheet: boolean;
  evalParticipation: boolean;
  
  // บันทึกหลังกิจกรรม
  teacherNote: string;
  problems: string;
  specialTrack: string;
  sessionNote: string;
  
  // สื่อ
  materials: string;
  materialsNote: string;
  
  // ข้อเสนอแนะ
  suggestions: string;
  
  // ติดตามผล
  individualFollowup: string;
  
  status: string;
  createdAt: string;
}

export default function HomeroomPlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [plan, setPlan] = useState<HomeroomPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const teacher_name = "อาจารย์วิมลรัตน์";

  useEffect(() => {
    const bootstrapLink = document.createElement("link");
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    bootstrapLink.rel = "stylesheet";
    document.head.appendChild(bootstrapLink);

    const iconLink = document.createElement("link");
    iconLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);
  }, []);

  useEffect(() => {
    // Mock data
    const mockPlan: HomeroomPlan = {
      id: params.id as string,
      level: "ปวช.1",
      semester: "1",
      academicYear: "2568",
      week: 1,
      time: "20-30",
      topic: "การจัดการความเครียด",
      objectives: [
        "เพื่อให้ผู้เรียนเข้าใจสาเหตุของความเครียด",
        "เพื่อให้ผู้เรียนมีวิธีการจัดการความเครียดที่เหมาะสม"
      ],
      checkAttendance: "เช็คชื่อผ่านแอปพลิเคชัน นักเรียนมาเรียน 32/35 คน",
      checkUniform: "นักเรียนส่วนใหญ่แต่งกายเรียบร้อย มี 2 คนที่ต้องตักเตือนเรื่องการแต่งกาย",
      announceNews: "แจ้งกำหนดการสอบกลางภาคและกิจกรรมวันพ่อ",
      warmup: "เกมละลายพฤติกรรม 'จับคู่เล่าเรื่อง'",
      mainActivity: "แบ่งกลุ่มระดมสมองเรื่องความเครียดที่เจอในชีวิตประจำวัน และนำเสนอวิธีการจัดการ",
      summary: "สรุปวิธีการจัดการความเครียด 5 วิธี ได้แก่ การพูดคุย การออกกำลังกาย การทำกิจกรรมที่ชอบ การหายใจ และการขอคำปรึกษา",
      trackProblems: "นักเรียน 3 คนที่ขาดเรียนบ่อยต้องติดตาม",
      individualCounsel: "มีนักเรียน 2 คนขอปรึกษาหลังเลิกเรียนเรื่องความเครียดในครอบครัว",
      evalObservation: true,
      evalWorksheet: true,
      evalParticipation: true,
      teacherNote: "นักเรียนให้ความร่วมมือดี มีส่วนร่วมในกิจกรรมอย่างสนุกสนาน",
      problems: "นักเรียนบางคนไม่กล้าแสดงออกในกลุ่มใหญ่",
      specialTrack: "นายสมชาย ใจดี (ขาดเรียน 3 ครั้ง), น.ส.สมหญิง รักเรียน (ผลการเรียนตกต่ำ)",
      sessionNote: "ครั้งที่ 1/2568: จัดกิจกรรมเมื่อวันที่ 1 พ.ค. 2568",
      materials: "ใบงาน, สื่อวิดีโอ, แอปพลิเคชันเช็คชื่อ",
      materialsNote: "ใช้คู่มือประเมิน SDQ ประกอบการสังเกต",
      suggestions: "ควรจัดกิจกรรมกลุ่มย่อยเพื่อเปิดโอกาสให้นักเรียนที่ขี้อายได้แสดงออกมากขึ้น",
      individualFollowup: "นัดหมายพูดคุยกับนายสมชายและน.ส.สมหญิงในสัปดาห์หน้า",
      status: "published",
      createdAt: "01/05/2568"
    };
    setPlan(mockPlan);
    setLoading(false);
  }, [params.id]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'draft': return <span className="badge bg-secondary rounded-0 px-3 py-2">ร่าง</span>;
      case 'published': return <span className="badge bg-success rounded-0 px-3 py-2">เผยแพร่</span>;
      case 'completed': return <span className="badge bg-info rounded-0 px-3 py-2">เสร็จสิ้น</span>;
      default: return null;
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-warning"></div></div>;
  if (!plan) return <div className="text-center py-5">ไม่พบข้อมูล</div>;

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-2 border-warning">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-uppercase" href="#">
            <i className="bi bi-mortarboard-fill me-2 text-warning"></i>
            <span className="text-warning">ระบบดูแลผู้เรียนรายบุคคล</span>
          </a>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between">
              <h2 className="fw-bold m-0"><i className="bi bi-file-text me-2 text-warning"></i>รายละเอียดแผนกิจกรรมโฮมรูม</h2>
              <div><span className="text-muted me-3">ครูที่ปรึกษา: {teacher_name}</span>{getStatusBadge(plan.status)}</div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <button className="btn btn-outline-dark rounded-0" onClick={()=>router.back()}><i className="bi bi-arrow-left me-2"></i>กลับ</button>
          </div>
        </div>

        <div className="bg-white p-4 border">
          {/* Header Info */}
          <div className="row mb-4">
            <div className="col-md-8">
              <h3 className="fw-bold mb-3">{plan.topic}</h3>
              <div className="d-flex gap-2 mb-2">
                <span className="badge bg-dark rounded-0 p-2">ระดับชั้น: {plan.level}</span>
                <span className="badge bg-dark rounded-0 p-2">สัปดาห์ที่ {plan.week}</span>
                <span className="badge bg-dark rounded-0 p-2">ภาคเรียนที่ {plan.semester}/{plan.academicYear}</span>
                <span className="badge bg-dark rounded-0 p-2">เวลา: {plan.time} นาที</span>
              </div>
            </div>
          </div>

          {/* Objectives */}
          <div className="mb-4">
            <h5 className="fw-bold text-warning border-bottom border-warning pb-2"><i className="bi bi-bullseye me-2"></i>วัตถุประสงค์</h5>
            <ol className="mt-2">
              {plan.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
            </ol>
          </div>

          {/* Activities */}
          <div className="mb-4">
            <h5 className="fw-bold text-warning border-bottom border-warning pb-2"><i className="bi bi-list-check me-2"></i>ขั้นตอนการดำเนินกิจกรรม</h5>
            
            <h6 className="fw-bold mt-3">ช่วงที่ 1: การจัดการระเบียบและวินัย (5-10 นาที)</h6>
            <div className="bg-light p-3 mb-3">
              <p><span className="fw-bold">เช็คชื่อ:</span> {plan.checkAttendance}</p>
              <p><span className="fw-bold">ตรวจระเบียบ:</span> {plan.checkUniform}</p>
              <p><span className="fw-bold">แจ้งข่าวสาร:</span> {plan.announceNews}</p>
            </div>

            <h6 className="fw-bold">ช่วงที่ 2: กิจกรรมพัฒนาผู้เรียน (15 นาที)</h6>
            <div className="bg-light p-3 mb-3">
              <p><span className="fw-bold">กิจกรรมนำ:</span> {plan.warmup}</p>
              <p><span className="fw-bold">กิจกรรมหลัก:</span> {plan.mainActivity}</p>
              <p><span className="fw-bold">การสรุป:</span> {plan.summary}</p>
            </div>

            <h6 className="fw-bold">ช่วงที่ 3: การดูแลรายบุคคล (5 นาที)</h6>
            <div className="bg-light p-3">
              <p><span className="fw-bold">ติดตามนักเรียนที่มีปัญหา:</span> {plan.trackProblems}</p>
              <p><span className="fw-bold">เปิดโอกาสให้นักเรียนปรึกษา:</span> {plan.individualCounsel}</p>
            </div>
          </div>

          {/* Evaluation */}
          <div className="row mb-4">
            <div className="col-md-6">
              <h5 className="fw-bold text-warning border-bottom border-warning pb-2"><i className="bi bi-clipboard-check me-2"></i>การประเมินผล</h5>
              <ul className="list-unstyled mt-2">
                <li><i className={`bi ${plan.evalObservation ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i>การสังเกตพฤติกรรม</li>
                <li><i className={`bi ${plan.evalWorksheet ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i>การทำใบงาน/แบบทดสอบ</li>
                <li><i className={`bi ${plan.evalParticipation ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i>การมีส่วนร่วมในกิจกรรม</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h5 className="fw-bold text-warning border-bottom border-warning pb-2"><i className="bi bi-paperclip me-2"></i>สื่อและวัสดุอุปกรณ์</h5>
              <p className="mt-2 mb-1">{plan.materials}</p>
              {plan.materialsNote && <small className="text-muted">หมายเหตุ: {plan.materialsNote}</small>}
            </div>
          </div>

          {/* Teacher's Note */}
          <div className="mb-4">
            <h5 className="fw-bold text-warning border-bottom border-warning pb-2"><i className="bi bi-journal-text me-2"></i>บันทึกหลังกิจกรรม</h5>
            <div className="row">
              <div className="col-md-6">
                <p><span className="fw-bold">ผลการจัดกิจกรรม:</span> {plan.teacherNote}</p>
                <p><span className="fw-bold">ปัญหา/อุปสรรค:</span> {plan.problems}</p>
              </div>
              <div className="col-md-6">
                <p><span className="fw-bold">นักเรียนที่ต้องติดตามเป็นพิเศษ:</span> {plan.specialTrack}</p>
                <p><span className="fw-bold">บันทึกการจัดกิจกรรม:</span> {plan.sessionNote}</p>
              </div>
            </div>
          </div>

          {/* Suggestions & Follow-up */}
          <div className="row">
            <div className="col-md-6">
              <h5 className="fw-bold text-warning border-bottom border-warning pb-2"><i className="bi bi-chat-dots me-2"></i>ข้อเสนอแนะ</h5>
              <p className="mt-2">{plan.suggestions || '-'}</p>
            </div>
            <div className="col-md-6">
              <h5 className="fw-bold text-warning border-bottom border-warning pb-2"><i className="bi bi-person-badge me-2"></i>ติดตามผลรายบุคคล</h5>
              <p className="mt-2">{plan.individualFollowup || '-'}</p>
            </div>
          </div>

          <div className="text-end text-muted small mt-3">สร้างเมื่อ: {plan.createdAt}</div>
        </div>
      </div>

      <footer className="bg-dark text-white mt-5 py-3 border-top border-warning">
        <div className="container-fluid"><div className="row"><div className="col-md-6 small"><i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล</div>
        <div className="col-md-6 text-end small"><span className="me-3">เวอร์ชัน 2.0.0</span><span>เข้าสู่ระบบ: {teacher_name}</span></div></div></div>
      </footer>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    </div>
  );
}