"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Task {
  id: string;
  phase: "P" | "D" | "C" | "A";
  task: string;
  responsible: string;
  startDate: string;
  endDate: string;
  status: "pending" | "in_progress" | "completed";
  notes: string;
}

interface TimelineEvent {
  date: string;
  title: string;
  phase: "P" | "D" | "C" | "A";
}

export default function PDCAProjectPlanPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"checklist" | "timeline">("checklist");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    phase: "P",
    task: "",
    responsible: "",
    startDate: "",
    endDate: "",
    status: "pending",
    notes: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

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

    // Mock data
    const mockTasks: Task[] = [
      { id: "1", phase: "P", task: "วิเคราะห์สภาพปัจจุบันและปัญหาของผู้เรียน", responsible: "คณะกรรมการบริหาร", startDate: "2024-05-01", endDate: "2024-05-15", status: "completed", notes: "ดำเนินการสำรวจข้อมูลเบื้องต้น" },
      { id: "2", phase: "P", task: "กำหนดเป้าหมายและตัวชี้วัด", responsible: "คณะกรรมการบริหาร", startDate: "2024-05-16", endDate: "2024-05-30", status: "completed", notes: "กำหนด KPIs ร่วมกับที่ปรึกษา" },
      { id: "3", phase: "P", task: "วางแผนกิจกรรมโฮมรูมรายสัปดาห์", responsible: "คณะกรรมการดำเนินงาน", startDate: "2024-06-01", endDate: "2024-06-15", status: "in_progress", notes: "อยู่ระหว่างออกแบบกิจกรรม" },
      { id: "4", phase: "D", task: "ดำเนินกิจกรรมโฮมรูมตามแผน", responsible: "ครูที่ปรึกษาทุกคน", startDate: "2024-06-16", endDate: "2024-09-30", status: "pending", notes: "" },
      { id: "5", phase: "D", task: "บันทึกผลกิจกรรมหลังดำเนินการ", responsible: "ครูที่ปรึกษา", startDate: "2024-06-16", endDate: "2024-09-30", status: "pending", notes: "" },
      { id: "6", phase: "C", task: "ติดตามและประเมินผลรายเดือน", responsible: "คณะกรรมการติดตาม", startDate: "2024-07-01", endDate: "2024-10-15", status: "pending", notes: "" },
      { id: "7", phase: "C", task: "สรุปผลการดำเนินงานรายภาคเรียน", responsible: "คณะกรรมการประเมินผล", startDate: "2024-10-01", endDate: "2024-10-30", status: "pending", notes: "" },
      { id: "8", phase: "A", task: "ประชุมทบทวนและปรับปรุงแผน", responsible: "คณะกรรมการบริหาร", startDate: "2024-11-01", endDate: "2024-11-15", status: "pending", notes: "" },
      { id: "9", phase: "A", task: "จัดทำแผนพัฒนาในภาคเรียนถัดไป", responsible: "คณะกรรมการทั้งหมด", startDate: "2024-11-16", endDate: "2024-11-30", status: "pending", notes: "" },
    ];
    setTasks(mockTasks);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const saveTask = () => {
    if (!newTask.task || !newTask.responsible || !newTask.startDate || !newTask.endDate) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (editingId) {
      // Update existing task
      setTasks(tasks.map(t => t.id === editingId ? { ...t, ...newTask, id: editingId } as Task : t));
    } else {
      // Add new task
      const newId = (tasks.length + 1).toString();
      setTasks([...tasks, { ...newTask, id: newId } as Task]);
    }

    // Reset form
    setNewTask({ phase: "P", task: "", responsible: "", startDate: "", endDate: "", status: "pending", notes: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const editTask = (task: Task) => {
    setNewTask(task);
    setEditingId(task.id);
    setShowForm(true);
  };

  const deleteTask = (id: string) => {
    if (confirm("ต้องการลบงานนี้?")) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const getPhaseBadge = (phase: string) => {
    const colors = {
      P: "primary", D: "success", C: "warning", A: "info"
    };
    const names = { P: "วางแผน (Plan)", D: "ปฏิบัติ (Do)", C: "ตรวจสอบ (Check)", A: "ปรับปรุง (Act)" };
    return <span className={`badge bg-${colors[phase as keyof typeof colors]} rounded-0`}>{names[phase as keyof typeof names]}</span>;
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="badge bg-secondary rounded-0">รอดำเนินการ</span>;
      case 'in_progress': return <span className="badge bg-warning text-dark rounded-0">กำลังดำเนินการ</span>;
      case 'completed': return <span className="badge bg-success rounded-0">เสร็จสิ้น</span>;
      default: return null;
    }
  };

  // Generate timeline data
  const timelineEvents: TimelineEvent[] = tasks.map(t => ({
    date: t.startDate,
    title: t.task,
    phase: t.phase
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const phaseCounts = {
    P: tasks.filter(t => t.phase === "P").length,
    D: tasks.filter(t => t.phase === "D").length,
    C: tasks.filter(t => t.phase === "C").length,
    A: tasks.filter(t => t.phase === "A").length,
  };

  const completedCount = tasks.filter(t => t.status === "completed").length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-2 border-warning">
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
              <li className="nav-item"><a className="nav-link text-white px-3" href="/student">รายชื่อผู้เรียน</a></li>
              <li className="nav-item"><a className="nav-link text-white px-3 active" href="/committees">คณะกรรมการ</a></li>
              <li className="nav-item"><a className="nav-link text-white px-3" href="/student_learn">โฮมรูม</a></li>
              <li className="nav-item"><a className="nav-link text-white px-3" href="/referrals">ส่งต่อ</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-diagram-3 me-2 text-warning"></i>
                วางแผนการดำเนินงาน PDCA
              </h2>
              <div>
                <span className="text-muted me-3">ผู้ดูแลระบบ: {teacher_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card rounded-0 border-0 shadow-sm bg-primary text-white">
              <div className="card-body">
                <h6 className="text-uppercase small">แผนงานทั้งหมด</h6>
                <h2 className="mb-0">{tasks.length}</h2>
                <small>รายการ</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card rounded-0 border-0 shadow-sm bg-success text-white">
              <div className="card-body">
                <h6 className="text-uppercase small">เสร็จสิ้นแล้ว</h6>
                <h2 className="mb-0">{completedCount}</h2>
                <small>รายการ</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card rounded-0 border-0 shadow-sm bg-warning text-dark">
              <div className="card-body">
                <h6 className="text-uppercase small">ความคืบหน้า</h6>
                <h2 className="mb-0">{progressPercent}%</h2>
                <div className="progress mt-2 rounded-0" style={{height: "5px"}}>
                  <div className="progress-bar bg-dark" style={{width: `${progressPercent}%`}}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card rounded-0 border-0 shadow-sm bg-info text-white">
              <div className="card-body">
                <h6 className="text-uppercase small">สัดส่วน PDCA</h6>
                <div className="d-flex justify-content-between small">
                  <span>P:{phaseCounts.P}</span>
                  <span>D:{phaseCounts.D}</span>
                  <span>C:{phaseCounts.C}</span>
                  <span>A:{phaseCounts.A}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs border-bottom-0 mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link rounded-0 ${activeTab === 'checklist' ? 'active bg-dark text-white' : 'bg-light'}`}
              onClick={() => setActiveTab('checklist')}
            >
              <i className="bi bi-check2-square me-2"></i>Checklist รายการงาน
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link rounded-0 ${activeTab === 'timeline' ? 'active bg-dark text-white' : 'bg-light'}`}
              onClick={() => setActiveTab('timeline')}
            >
              <i className="bi bi-calendar-range me-2"></i>Timeline การดำเนินงาน
            </button>
          </li>
        </ul>

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div>
            <div className="d-flex justify-content-between mb-3">
              <h5 className="fw-bold">รายการงานตามวงจร PDCA</h5>
              <button 
                className="btn btn-primary rounded-0"
                onClick={() => {
                  setNewTask({ phase: "P", task: "", responsible: "", startDate: "", endDate: "", status: "pending", notes: "" });
                  setEditingId(null);
                  setShowForm(!showForm);
                }}
              >
                <i className="bi bi-plus-circle me-2"></i>เพิ่มงานใหม่
              </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
              <div className="card rounded-0 border-0 shadow-sm mb-4">
                <div className="card-header bg-dark text-white">
                  <h5 className="m-0">{editingId ? 'แก้ไขงาน' : 'เพิ่มงานใหม่'}</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label">ระยะ PDCA</label>
                      <select className="form-select rounded-0" name="phase" value={newTask.phase} onChange={handleInputChange}>
                        <option value="P">วางแผน (Plan)</option>
                        <option value="D">ปฏิบัติ (Do)</option>
                        <option value="C">ตรวจสอบ (Check)</option>
                        <option value="A">ปรับปรุง (Act)</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">รายการงาน</label>
                      <input type="text" className="form-control rounded-0" name="task" value={newTask.task} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">ผู้รับผิดชอบ</label>
                      <input type="text" className="form-control rounded-0" name="responsible" value={newTask.responsible} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">วันที่เริ่ม</label>
                      <input type="date" className="form-control rounded-0" name="startDate" value={newTask.startDate} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">วันที่สิ้นสุด</label>
                      <input type="date" className="form-control rounded-0" name="endDate" value={newTask.endDate} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">สถานะ</label>
                      <select className="form-select rounded-0" name="status" value={newTask.status} onChange={handleInputChange}>
                        <option value="pending">รอดำเนินการ</option>
                        <option value="in_progress">กำลังดำเนินการ</option>
                        <option value="completed">เสร็จสิ้น</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">หมายเหตุ</label>
                      <input type="text" className="form-control rounded-0" name="notes" value={newTask.notes} onChange={handleInputChange} />
                    </div>
                    <div className="col-12">
                      <button className="btn btn-warning rounded-0 me-2" onClick={saveTask}>บันทึก</button>
                      <button className="btn btn-secondary rounded-0" onClick={() => setShowForm(false)}>ยกเลิก</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Task List by Phase */}
            {["P", "D", "C", "A"].map(phase => {
              const phaseTasks = tasks.filter(t => t.phase === phase);
              if (phaseTasks.length === 0) return null;

              return (
                <div className="card rounded-0 border-0 shadow-sm mb-4" key={phase}>
                  <div className={`card-header bg-${phase === 'P' ? 'primary' : phase === 'D' ? 'success' : phase === 'C' ? 'warning' : 'info'} text-white`}>
                    <h5 className="m-0">
                      {phase === 'P' && 'วางแผน (Plan)'}
                      {phase === 'D' && 'ปฏิบัติ (Do)'}
                      {phase === 'C' && 'ตรวจสอบ (Check)'}
                      {phase === 'A' && 'ปรับปรุง (Act)'}
                      <span className="badge bg-dark text-white ms-2 rounded-0">{phaseTasks.length}</span>
                    </h5>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>รายการงาน</th>
                          <th>ผู้รับผิดชอบ</th>
                          <th>วันที่เริ่ม</th>
                          <th>วันที่สิ้นสุด</th>
                          <th>สถานะ</th>
                          <th>หมายเหตุ</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {phaseTasks.map(t => (
                          <tr key={t.id}>
                            <td>{t.task}</td>
                            <td>{t.responsible}</td>
                            <td>{t.startDate}</td>
                            <td>{t.endDate}</td>
                            <td>{getStatusBadge(t.status)}</td>
                            <td>{t.notes}</td>
                            <td>
                              <button className="btn btn-sm btn-outline-warning rounded-0 me-1" onClick={() => editTask(t)}>
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger rounded-0" onClick={() => deleteTask(t.id)}>
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="card rounded-0 border-0 shadow-sm">
            <div className="card-header bg-dark text-white">
              <h5 className="m-0"><i className="bi bi-calendar-week me-2 text-warning"></i>ไทม์ไลน์การดำเนินงาน</h5>
            </div>
            <div className="card-body">
              <div className="timeline">
                {timelineEvents.map((event, index) => (
                  <div className="d-flex mb-3" key={index}>
                    <div className="me-3 text-end" style={{minWidth: "100px"}}>
                      <span className="badge bg-dark rounded-0 p-2">{event.date}</span>
                    </div>
                    <div className="flex-grow-1">
                      <div className={`p-3 bg-${event.phase === 'P' ? 'primary' : event.phase === 'D' ? 'success' : event.phase === 'C' ? 'warning' : 'info'} bg-opacity-10 border-start border-3 border-${event.phase === 'P' ? 'primary' : event.phase === 'D' ? 'success' : event.phase === 'C' ? 'warning' : 'info'}`}>
                        <span className="badge bg-dark rounded-0 mb-2">{getPhaseBadge(event.phase)}</span>
                        <h6 className="mb-0">{event.title}</h6>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-dark text-white mt-5 py-3 border-top border-warning">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 small"><i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล</div>
            <div className="col-md-6 text-end small"><span className="me-3">เวอร์ชัน 2.0.0</span><span>เข้าสู่ระบบ: {teacher_name}</span></div>
          </div>
        </div>
      </footer>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    </div>
  );
}