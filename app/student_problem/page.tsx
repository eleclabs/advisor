"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  level: string;
  class: string;
  problem: string;
  status: string;
}

interface IspPlan {
  id: string;
  student_id: string;
  student_name: string;
  problem: string;
  goal: string;
  methods: string[];
  duration: string;
  responsible: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: "กำลังดำเนินการ" | "สำเร็จ" | "ปรับแผน";
}

interface GroupActivity {
  id: string;
  name: string;
  duration: number;
  materials: string;
  steps: string[];
  objectives: string;
  debrief: string;
  date: string;
}

interface Evaluation {
  id: string;
  student_id: string;
  evaluation_date: string;
  improvement_level: "ดีขึ้นชัดเจน" | "เริ่มเห็นการเปลี่ยนแปลง" | "คงเดิม/ไม่เปลี่ยนแปลง";
  result: "ยุติการช่วยเหลือ" | "ดำเนินการต่อ" | "ส่งต่อผู้เชี่ยวชาญ";
  notes: string;
}

export default function StudentProblemPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("isp");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([
    { id: "66002", name: "นางสาวจิรา สวยใจ", level: "ปวช.3", class: "ชฟ.2", problem: "ขาดเรียนบ่อย, ซึมเศร้า", status: "เสี่ยง" },
    { id: "66003", name: "นายสมเด็จ วิจิตร", level: "ปวช.2", class: "ชฟ.1", problem: "ติดเกม, ก้าวร้าว", status: "มีปัญหา" },
    { id: "66006", name: "นางสาวพิมพ์ ใจดี", level: "ปวช.1", class: "ชฟ.1", problem: "ครอบครัวหย่าร้าง, เครียด", status: "เสี่ยง" },
    { id: "66008", name: "นางสาวกัญญา เก่งกล้า", level: "ปวส.1", class: "ชฟ.1", problem: "ใช้ความรุนแรง, ทำร้ายร่างกาย", status: "มีปัญหา" },
  ]);

  const [ispPlans, setIspPlans] = useState<IspPlan[]>([
    {
      id: "ISP001",
      student_id: "66002",
      student_name: "นางสาวจิรา สวยใจ",
      problem: "ขาดเรียนบ่อย, ซึมเศร้า",
      goal: "ลดสถิติการขาดเรียน ลดอาการซึมเศร้า",
      methods: ["การให้คำปรึกษาเบื้องต้น", "การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง"],
      duration: "3 เดือน",
      responsible: "อาจารย์วิมลรัตน์",
      start_date: "2024-02-01",
      end_date: "2024-04-30",
      progress: 60,
      status: "กำลังดำเนินการ",
    },
    {
      id: "ISP002",
      student_id: "66003",
      student_name: "นายสมเด็จ วิจิตร",
      problem: "ติดเกม, ก้าวร้าว",
      goal: "ลดพฤติกรรมก้าวร้าว ควบคุมอารมณ์ได้ดีขึ้น",
      methods: ["กิจกรรมปรับเปลี่ยนพฤติกรรม", "การให้คำปรึกษาเบื้องต้น"],
      duration: "2 เดือน",
      responsible: "อาจารย์วิมลรัตน์",
      start_date: "2024-02-15",
      end_date: "2024-04-15",
      progress: 40,
      status: "กำลังดำเนินการ",
    },
  ]);

  const [groupActivities, setGroupActivities] = useState<GroupActivity[]>([
    {
      id: "GA001",
      name: "ละลายพฤติกรรม สร้างทีม",
      duration: 60,
      materials: "กระดาษ flip chart, ปากกา, บอลล์",
      steps: [
        "แนะนำตัวผ่านเกมจับคู่",
        "กิจกรรมสร้างความไว้วางใจ",
        "ระดมสมองแก้โจทย์ปัญหา",
      ],
      objectives: "สร้างความสามัคคีในห้องเรียน",
      debrief: "นักเรียนได้เรียนรู้การทำงานร่วมกัน เข้าใจเพื่อนมากขึ้น",
      date: "2024-02-20",
    },
  ]);

  const [evaluations, setEvaluations] = useState<Evaluation[]>([
    {
      id: "EV001",
      student_id: "66002",
      evaluation_date: "2024-03-01",
      improvement_level: "เริ่มเห็นการเปลี่ยนแปลง",
      result: "ดำเนินการต่อ",
      notes: "เริ่มมาเรียนสม่ำเสมอขึ้น อาการซึมเศร้าลดลง",
    },
  ]);

  const [formData, setFormData] = useState({
    student_id: "",
    problem: "",
    goal: "",
    methods: [] as string[],
    duration: "",
    responsible: "อาจารย์วิมลรัตน์",
  });

  const [activityForm, setActivityForm] = useState({
    name: "",
    duration: 60,
    materials: "",
    steps: ["", "", ""],
    objectives: "",
    debrief: "",
  });

  const [evaluationForm, setEvaluationForm] = useState({
    student_id: "",
    improvement_level: "เริ่มเห็นการเปลี่ยนแปลง" as "ดีขึ้นชัดเจน" | "เริ่มเห็นการเปลี่ยนแปลง" | "คงเดิม/ไม่เปลี่ยนแปลง",
    result: "ดำเนินการต่อ" as "ยุติการช่วยเหลือ" | "ดำเนินการต่อ" | "ส่งต่อผู้เชี่ยวชาญ",
    notes: "",
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
  }, []);

  const handleMethodChange = (method: string) => {
    setFormData(prev => ({
      ...prev,
      methods: prev.methods.includes(method)
        ? prev.methods.filter(m => m !== method)
        : [...prev.methods, method]
    }));
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...activityForm.steps];
    newSteps[index] = value;
    setActivityForm(prev => ({ ...prev, steps: newSteps }));
  };

  const stats = {
    risk: students.filter(s => s.status === "เสี่ยง").length,
    problem: students.filter(s => s.status === "มีปัญหา").length,
    active: ispPlans.filter(p => p.status === "กำลังดำเนินการ").length,
    completed: ispPlans.filter(p => p.status === "สำเร็จ").length,
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* START: Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-2 border-warning flex-shrink-0">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-uppercase" href="#">
            <i className="bi bi-mortarboard-fill me-2 text-warning"></i>
            <span className="text-warning">ระบบดูแลผู้เรียนรายบุคคล</span>
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/student">รายชื่อผู้เรียน</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3 active" href="/student_problem">ป้องกันและแก้ไข</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/student_send">ส่งต่อ</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* END: Navigation Bar */}

      {/* START: Main Content */}
      <div className="flex-grow-1">
        <div className="container-fluid py-4">
          {/* START: Page Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
                <h2 className="text-uppercase fw-bold m-0">
                  <i className="bi bi-shield-check me-2 text-warning"></i>
                  ป้องกันและแก้ไขปัญหาผู้เรียน
                </h2>
                <div>
                  <span className="badge bg-warning text-dark rounded-0 p-2 me-2">กลุ่มเสี่ยง: {stats.risk}</span>
                  <span className="badge bg-danger rounded-0 p-2">กลุ่มมีปัญหา: {stats.problem}</span>
                </div>
              </div>
            </div>
          </div>
          {/* END: Page Header */}

          {/* START: Stats Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-uppercase fw-semibold small text-muted">แผน ISP ที่ดำเนินการ</div>
                    <div className="display-6 fw-bold text-primary">{stats.active}</div>
                  </div>
                  <i className="bi bi-clipboard-check fs-1 text-primary"></i>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-uppercase fw-semibold small text-muted">แผนสำเร็จแล้ว</div>
                    <div className="display-6 fw-bold text-success">{stats.completed}</div>
                  </div>
                  <i className="bi bi-check-circle-fill fs-1 text-success"></i>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-uppercase fw-semibold small text-muted">กิจกรรมกลุ่ม</div>
                    <div className="display-6 fw-bold text-info">{groupActivities.length}</div>
                  </div>
                  <i className="bi bi-people-fill fs-1 text-info"></i>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="border bg-white p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-uppercase fw-semibold small text-muted">การประเมินล่าสุด</div>
                    <div className="display-6 fw-bold text-warning">{evaluations.length}</div>
                  </div>
                  <i className="bi bi-bar-chart-fill fs-1 text-warning"></i>
                </div>
              </div>
            </div>
          </div>
          {/* END: Stats Cards */}

          {/* START: Tabs */}
          <div className="row mb-4">
            <div className="col-12">
              <ul className="nav nav-tabs border-0">
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-0 text-uppercase fw-semibold ${activeTab === 'isp' ? 'active bg-dark text-white' : 'bg-light'}`}
                    onClick={() => setActiveTab('isp')}
                  >
                    <i className="bi bi-clipboard-check me-2"></i>แผน ISP
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-0 text-uppercase fw-semibold ${activeTab === 'activity' ? 'active bg-dark text-white' : 'bg-light'}`}
                    onClick={() => setActiveTab('activity')}
                  >
                    <i className="bi bi-people me-2"></i>กิจกรรมกลุ่มสัมพันธ์
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-0 text-uppercase fw-semibold ${activeTab === 'evaluation' ? 'active bg-dark text-white' : 'bg-light'}`}
                    onClick={() => setActiveTab('evaluation')}
                  >
                    <i className="bi bi-bar-chart me-2"></i>ประเมินผลการช่วยเหลือ
                  </button>
                </li>
              </ul>
            </div>
          </div>
          {/* END: Tabs */}

          {/* START: Tab Content - ISP */}
          {activeTab === 'isp' && (
            <div className="row">
              <div className="col-md-5">
                <div className="border bg-white">
                  <div className="p-3 border-bottom bg-dark">
                    <h5 className="text-uppercase fw-semibold m-0 text-white">
                      <i className="bi bi-plus-circle me-2 text-warning"></i>
                      สร้างแผน ISP ใหม่
                    </h5>
                  </div>
                  <div className="p-3">
                    <form>
                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">เลือกนักเรียน</label>
                        <select 
                          className="form-select rounded-0"
                          value={formData.student_id}
                          onChange={(e) => {
                            const student = students.find(s => s.id === e.target.value);
                            setFormData({
                              ...formData,
                              student_id: e.target.value,
                              problem: student?.problem || ""
                            });
                          }}
                        >
                          <option value="">เลือกนักเรียนกลุ่มเสี่ยง/มีปัญหา</option>
                          {students.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.status}) - {s.problem}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ปัญหาที่พบ</label>
                        <input 
                          type="text" 
                          className="form-control rounded-0"
                          value={formData.problem}
                          readOnly
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">เป้าหมาย</label>
                        <textarea 
                          className="form-control rounded-0" 
                          rows={2}
                          placeholder="เช่น ลดสถิติการขาดเรียน, พัฒนาทักษะการควบคุมอารมณ์"
                          value={formData.goal}
                          onChange={(e) => setFormData({...formData, goal: e.target.value})}
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small d-block">วิธีการแก้ไข</label>
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="การให้คำปรึกษาเบื้องต้น"
                            checked={formData.methods.includes("การให้คำปรึกษาเบื้องต้น")}
                            onChange={(e) => handleMethodChange(e.target.value)}
                          />
                          <label className="form-check-label">การให้คำปรึกษาเบื้องต้น (Counseling)</label>
                        </div>
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="กิจกรรมปรับเปลี่ยนพฤติกรรม"
                            checked={formData.methods.includes("กิจกรรมปรับเปลี่ยนพฤติกรรม")}
                            onChange={(e) => handleMethodChange(e.target.value)}
                          />
                          <label className="form-check-label">กิจกรรมปรับเปลี่ยนพฤติกรรม (Behavioral Contract)</label>
                        </div>
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง"
                            checked={formData.methods.includes("การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง")}
                            onChange={(e) => handleMethodChange(e.target.value)}
                          />
                          <label className="form-check-label">การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง</label>
                        </div>
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input rounded-0" 
                            value="การส่งต่อ"
                            checked={formData.methods.includes("การส่งต่อ")}
                            onChange={(e) => handleMethodChange(e.target.value)}
                          />
                          <label className="form-check-label">การส่งต่อ (Internal/External Referral)</label>
                        </div>
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-md-6">
                          <label className="form-label text-uppercase fw-semibold small">ระยะเวลาดำเนินการ</label>
                          <input 
                            type="text" 
                            className="form-control rounded-0"
                            placeholder="เช่น 3 เดือน"
                            value={formData.duration}
                            onChange={(e) => setFormData({...formData, duration: e.target.value})}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-uppercase fw-semibold small">ผู้รับผิดชอบ</label>
                          <input 
                            type="text" 
                            className="form-control rounded-0"
                            value={formData.responsible}
                            onChange={(e) => setFormData({...formData, responsible: e.target.value})}
                          />
                        </div>
                      </div>
                      <button className="btn btn-warning rounded-0 text-uppercase fw-semibold w-100">
                        <i className="bi bi-save me-2"></i>บันทึกแผน ISP
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-md-7">
                <div className="border bg-white">
                  <div className="p-3 border-bottom bg-dark">
                    <h5 className="text-uppercase fw-semibold m-0 text-white">
                      <i className="bi bi-list-check me-2 text-warning"></i>
                      แผน ISP ที่ดำเนินการอยู่
                    </h5>
                  </div>
                  <div className="p-3">
                    {ispPlans.map(plan => (
                      <div key={plan.id} className="border mb-3 p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold">{plan.student_name}</h6>
                          <span className={`badge bg-${plan.status === 'กำลังดำเนินการ' ? 'warning' : 'success'} rounded-0 text-uppercase`}>
                            {plan.status}
                          </span>
                        </div>
                        <p className="small mb-1"><span className="fw-semibold">ปัญหา:</span> {plan.problem}</p>
                        <p className="small mb-1"><span className="fw-semibold">เป้าหมาย:</span> {plan.goal}</p>
                        <p className="small mb-1"><span className="fw-semibold">วิธีการ:</span> {plan.methods.join(", ")}</p>
                        <p className="small mb-1"><span className="fw-semibold">ระยะเวลา:</span> {plan.duration} | ผู้รับผิดชอบ: {plan.responsible}</p>
                        <div className="progress rounded-0 mt-2" style={{ height: "10px" }}>
                          <div className="progress-bar bg-warning" style={{ width: `${plan.progress}%` }}>
                            {plan.progress}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* END: Tab Content - ISP */}

          {/* START: Tab Content - Activity */}
          {activeTab === 'activity' && (
            <div className="row">
              <div className="col-md-5">
                <div className="border bg-white">
                  <div className="p-3 border-bottom bg-dark">
                    <h5 className="text-uppercase fw-semibold m-0 text-white">
                      <i className="bi bi-plus-circle me-2 text-warning"></i>
                      เพิ่มกิจกรรมกลุ่มสัมพันธ์
                    </h5>
                  </div>
                  <div className="p-3">
                    <form>
                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ชื่อกิจกรรม</label>
                        <input 
                          type="text" 
                          className="form-control rounded-0"
                          placeholder="เช่น ละลายพฤติกรรม สร้างทีม"
                          value={activityForm.name}
                          onChange={(e) => setActivityForm({...activityForm, name: e.target.value})}
                        />
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-md-6">
                          <label className="form-label text-uppercase fw-semibold small">เวลา (นาที)</label>
                          <input 
                            type="number" 
                            className="form-control rounded-0"
                            value={activityForm.duration}
                            onChange={(e) => setActivityForm({...activityForm, duration: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-uppercase fw-semibold small">วัตถุประสงค์</label>
                          <input 
                            type="text" 
                            className="form-control rounded-0"
                            value={activityForm.objectives}
                            onChange={(e) => setActivityForm({...activityForm, objectives: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">อุปกรณ์</label>
                        <textarea 
                          className="form-control rounded-0" 
                          rows={2}
                          placeholder="ระบุอุปกรณ์ที่ต้องใช้"
                          value={activityForm.materials}
                          onChange={(e) => setActivityForm({...activityForm, materials: e.target.value})}
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small d-block">ขั้นตอน</label>
                        {[0, 1, 2].map(i => (
                          <input 
                            key={i}
                            type="text" 
                            className="form-control rounded-0 mb-2" 
                            placeholder={`ขั้นตอนที่ ${i + 1}`}
                            value={activityForm.steps[i]}
                            onChange={(e) => handleStepChange(i, e.target.value)}
                          />
                        ))}
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ถอดบทเรียน (AAR)</label>
                        <textarea 
                          className="form-control rounded-0" 
                          rows={3}
                          placeholder="สิ่งที่ได้เรียนรู้จากการทำงานร่วมกับเพื่อน"
                          value={activityForm.debrief}
                          onChange={(e) => setActivityForm({...activityForm, debrief: e.target.value})}
                        ></textarea>
                      </div>
                      <button className="btn btn-warning rounded-0 text-uppercase fw-semibold w-100">
                        <i className="bi bi-save me-2"></i>บันทึกกิจกรรม
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-md-7">
                <div className="border bg-white">
                  <div className="p-3 border-bottom bg-dark">
                    <h5 className="text-uppercase fw-semibold m-0 text-white">
                      <i className="bi bi-people me-2 text-warning"></i>
                      กิจกรรมกลุ่มสัมพันธ์
                    </h5>
                  </div>
                  <div className="p-3">
                    {groupActivities.map(activity => (
                      <div key={activity.id} className="border mb-3 p-3">
                        <h6 className="fw-bold mb-2">{activity.name}</h6>
                        <p className="small mb-1"><span className="fw-semibold">เวลา:</span> {activity.duration} นาที</p>
                        <p className="small mb-1"><span className="fw-semibold">อุปกรณ์:</span> {activity.materials}</p>
                        <p className="small mb-1"><span className="fw-semibold">วัตถุประสงค์:</span> {activity.objectives}</p>
                        <p className="small mb-1"><span className="fw-semibold">ขั้นตอน:</span></p>
                        <ol className="small">
                          {activity.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                        <p className="small mb-0"><span className="fw-semibold">ถอดบทเรียน:</span> {activity.debrief}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* END: Tab Content - Activity */}

          {/* START: Tab Content - Evaluation */}
          {activeTab === 'evaluation' && (
            <div className="row">
              <div className="col-md-5">
                <div className="border bg-white">
                  <div className="p-3 border-bottom bg-dark">
                    <h5 className="text-uppercase fw-semibold m-0 text-white">
                      <i className="bi bi-plus-circle me-2 text-warning"></i>
                      ประเมินผลการช่วยเหลือ
                    </h5>
                  </div>
                  <div className="p-3">
                    <form>
                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">เลือกนักเรียน</label>
                        <select 
                          className="form-select rounded-0"
                          value={evaluationForm.student_id}
                          onChange={(e) => setEvaluationForm({...evaluationForm, student_id: e.target.value})}
                        >
                          <option value="">เลือกนักเรียน</option>
                          {ispPlans.map(p => (
                            <option key={p.student_id} value={p.student_id}>
                              {p.student_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">ระดับการเปลี่ยนแปลง</label>
                        <select 
                          className="form-select rounded-0"
                          value={evaluationForm.improvement_level}
                          onChange={(e) => setEvaluationForm({...evaluationForm, improvement_level: e.target.value as any})}
                        >
                          <option value="ดีขึ้นชัดเจน">ดีขึ้นชัดเจน</option>
                          <option value="เริ่มเห็นการเปลี่ยนแปลง">เริ่มเห็นการเปลี่ยนแปลง</option>
                          <option value="คงเดิม/ไม่เปลี่ยนแปลง">คงเดิม/ไม่เปลี่ยนแปลง</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">สรุปผล</label>
                        <select 
                          className="form-select rounded-0"
                          value={evaluationForm.result}
                          onChange={(e) => setEvaluationForm({...evaluationForm, result: e.target.value as any})}
                        >
                          <option value="ยุติการช่วยเหลือ">ยุติการช่วยเหลือ (กลับสู่กลุ่มปกติ)</option>
                          <option value="ดำเนินการต่อ">ดำเนินการต่อ</option>
                          <option value="ส่งต่อผู้เชี่ยวชาญ">ส่งต่อผู้เชี่ยวชาญ</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-uppercase fw-semibold small">บันทึกเพิ่มเติม</label>
                        <textarea 
                          className="form-control rounded-0" 
                          rows={3}
                          value={evaluationForm.notes}
                          onChange={(e) => setEvaluationForm({...evaluationForm, notes: e.target.value})}
                        ></textarea>
                      </div>
                      <button className="btn btn-warning rounded-0 text-uppercase fw-semibold w-100">
                        <i className="bi bi-save me-2"></i>บันทึกการประเมิน
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-md-7">
                <div className="border bg-white">
                  <div className="p-3 border-bottom bg-dark">
                    <h5 className="text-uppercase fw-semibold m-0 text-white">
                      <i className="bi bi-bar-chart me-2 text-warning"></i>
                      ผลการประเมินล่าสุด
                    </h5>
                  </div>
                  <div className="p-3">
                    {evaluations.map(evaluation => {
                      const student = students.find(s => s.id === evaluation.student_id);
                      return (
                        <div key={evaluation.id} className="border mb-3 p-3">
                          <h6 className="fw-bold mb-2">{student?.name}</h6>
                          <p className="small mb-1"><span className="fw-semibold">วันที่ประเมิน:</span> {evaluation.evaluation_date}</p>
                          <p className="small mb-1">
                            <span className="fw-semibold">ระดับการเปลี่ยนแปลง:</span>{' '}
                            <span className={`badge bg-${
                              evaluation.improvement_level === 'ดีขึ้นชัดเจน' ? 'success' :
                              evaluation.improvement_level === 'เริ่มเห็นการเปลี่ยนแปลง' ? 'warning' : 'danger'
                            } rounded-0`}>
                              {evaluation.improvement_level}
                            </span>
                          </p>
                          <p className="small mb-1">
                            <span className="fw-semibold">สรุปผล:</span>{' '}
                            <span className={`badge bg-${
                              evaluation.result === 'ยุติการช่วยเหลือ' ? 'success' :
                              evaluation.result === 'ดำเนินการต่อ' ? 'warning' : 'danger'
                            } rounded-0`}>
                              {evaluation.result}
                            </span>
                          </p>
                          <p className="small mb-0"><span className="fw-semibold">บันทึก:</span> {evaluation.notes}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* END: Tab Content - Evaluation */}

          {/* START: Progress Tracking */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-graph-up me-2 text-warning"></i>
                    ระบบติดตามความก้าวหน้า (Progress Tracking)
                  </h5>
                </div>
                <div className="p-3">
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th className="fw-semibold">นักเรียน</th>
                          <th className="fw-semibold">ปัญหา</th>
                          <th className="fw-semibold">แผน ISP</th>
                          <th className="fw-semibold">ความคืบหน้า</th>
                          <th className="fw-semibold">สถานะ</th>
                          <th className="fw-semibold">การประเมินล่าสุด</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ispPlans.map(plan => {
                          const evaluation = evaluations.find(e => e.student_id === plan.student_id);
                          return (
                            <tr key={plan.id}>
                              <td className="fw-semibold">{plan.student_name}</td>
                              <td>{plan.problem}</td>
                              <td>{plan.goal}</td>
                              <td>
                                <div className="progress rounded-0" style={{ height: "10px" }}>
                                  <div className="progress-bar bg-warning" style={{ width: `${plan.progress}%` }}></div>
                                </div>
                                <small>{plan.progress}%</small>
                              </td>
                              <td>
                                <span className={`badge bg-${
                                  plan.status === 'กำลังดำเนินการ' ? 'warning' : 'success'
                                } rounded-0`}>
                                  {plan.status}
                                </span>
                              </td>
                              <td>
                                {evaluation ? (
                                  <span className={`badge bg-${
                                    evaluation.improvement_level === 'ดีขึ้นชัดเจน' ? 'success' :
                                    evaluation.improvement_level === 'เริ่มเห็นการเปลี่ยนแปลง' ? 'warning' : 'danger'
                                  } rounded-0`}>
                                    {evaluation.improvement_level}
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary rounded-0">รอประเมิน</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* END: Progress Tracking */}
        </div>
      </div>
      {/* END: Main Content */}

      {/* START: Footer */}
      <footer className="bg-dark text-white py-3 border-top border-warning flex-shrink-0">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 text-uppercase small">
              <i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล
            </div>
            <div className="col-md-6 text-end text-uppercase small">
              <span className="me-3">เวอร์ชัน 2.0.0</span>
              <span>ป้องกันและแก้ไขปัญหา</span>
            </div>
          </div>
        </div>
      </footer>
      {/* END: Footer */}
    </div>
  );
}