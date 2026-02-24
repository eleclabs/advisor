"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditHomeroomPlanPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    level: "",
    semester: "1",
    academicYear: "2568",
    week: "",
    time: "",
    title: "",
    date: "",
    objectives: ["", ""],
    disciplineManagement: "",
    studentDevelopment: "",
    individualCare: "",
    evaluation: {
      observation: false,
      worksheet: false,
      participation: false
    },
    materials: null as File | null
  });

  const teacher_name = "อาจารย์วิมลรัตน์";

  useEffect(() => {
    // Load Bootstrap CSS
    const bootstrapLink = document.createElement("link");
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    bootstrapLink.rel = "stylesheet";
    document.head.appendChild(bootstrapLink);

    const iconLink = document.createElement("link");
    iconLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);
  }, []);

  // โหลดข้อมูลเดิม
  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        // Mock data - ในจริงต้องเรียก API
        const mockData = {
          id: params.id,
          level: "ปวช.1",
          semester: "1",
          academicYear: "2568",
          week: "1",
          time: "20-30 นาที",
          title: "การปรับตัวเข้าสู่ชีวิตนักเรียน",
          date: "2024-05-01",
          objectives: [
            "เพื่อให้นักเรียนปรับตัวเข้ากับเพื่อนและครูได้",
            "เพื่อให้นักเรียนเข้าใจกฎระเบียบของสถานศึกษา"
          ],
          disciplineManagement: "เช็คชื่อ ตรวจระเบียบ แจ้งข่าวสาร",
          studentDevelopment: "กิจกรรมละลายพฤติกรรม แนะนำตัว กิจกรรมกลุ่ม",
          individualCare: "สังเกตนักเรียนที่มีปัญหา เปิดโอกาสให้ปรึกษา",
          evaluation: {
            observation: true,
            worksheet: false,
            participation: true
          }
        };

        setFormData(prev => ({
          ...prev,
          ...mockData
        }));
        setFetchLoading(false);
      } catch (error) {
        console.error("Error fetching plan:", error);
        setFetchLoading(false);
      }
    };

    fetchPlanData();
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData(prev => ({ ...prev, objectives: newObjectives }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      evaluation: {
        ...prev.evaluation,
        [name]: checked
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, materials: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // API call would go here
      console.log("Updating plan:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to detail page
      router.push(`/student_learn/${params.id}`);
    } catch (error) {
      console.error("Error updating plan:", error);
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

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
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/student">รายชื่อผู้เรียน</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/committees">คณะกรรมการ</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3 active" href="/student_learn">ISP</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/referrals">ส่งต่อ</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-pencil-square me-2 text-warning"></i>
                แก้ไขแผนกิจกรรมโฮมรูม
              </h2>
              <div>
                <span className="text-muted me-3">ครูที่ปรึกษา: {teacher_name}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-12">
              {/* Basic Information */}
              <div className="card rounded-0 border-0 shadow-sm mb-4">
                <div className="card-header bg-dark text-white rounded-0">
                  <h5 className="card-title text-uppercase fw-semibold m-0">
                    <i className="bi bi-info-circle me-2 text-warning"></i>
                    ข้อมูลพื้นฐาน
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">ระดับชั้น</label>
                      <select 
                        className="form-select rounded-0"
                        name="level"
                        value={formData.level}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">เลือกระดับชั้น</option>
                        <option value="ปวช.1">ปวช.1</option>
                        <option value="ปวช.2">ปวช.2</option>
                        <option value="ปวช.3">ปวช.3</option>
                        <option value="ปวส.1">ปวส.1</option>
                        <option value="ปวส.2">ปวส.2</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">ภาคเรียนที่</label>
                      <select 
                        className="form-select rounded-0"
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                      >
                        <option value="1">ภาคเรียนที่ 1</option>
                        <option value="2">ภาคเรียนที่ 2</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">ปีการศึกษา</label>
                      <select 
                        className="form-select rounded-0"
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleInputChange}
                      >
                        <option value="2568">2568</option>
                        <option value="2567">2567</option>
                        <option value="2566">2566</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-uppercase fw-semibold small">สัปดาห์ที่</label>
                      <input 
                        type="text" 
                        className="form-control rounded-0" 
                        name="week"
                        value={formData.week}
                        onChange={handleInputChange}
                        placeholder="เช่น 1"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-uppercase fw-semibold small">เวลา</label>
                      <input 
                        type="text" 
                        className="form-control rounded-0" 
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        placeholder="เช่น 20-30 นาที"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-uppercase fw-semibold small">วันที่จัดกิจกรรม</label>
                      <input 
                        type="date" 
                        className="form-control rounded-0" 
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-uppercase fw-semibold small">หัวข้อหลักประจำสัปดาห์</label>
                      <input 
                        type="text" 
                        className="form-control rounded-0" 
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="กรอกหัวข้อหลัก"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Objectives */}
              <div className="card rounded-0 border-0 shadow-sm mb-4">
                <div className="card-header bg-dark text-white rounded-0">
                  <h5 className="card-title text-uppercase fw-semibold m-0">
                    <i className="bi bi-bullseye me-2 text-warning"></i>
                    วัตถุประสงค์
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-uppercase fw-semibold small">วัตถุประสงค์ข้อที่ 1</label>
                      <textarea 
                        className="form-control rounded-0" 
                        rows={2}
                        value={formData.objectives[0]}
                        onChange={(e) => handleObjectiveChange(0, e.target.value)}
                        placeholder="กรอกวัตถุประสงค์ข้อที่ 1"
                        required
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-uppercase fw-semibold small">วัตถุประสงค์ข้อที่ 2</label>
                      <textarea 
                        className="form-control rounded-0" 
                        rows={2}
                        value={formData.objectives[1]}
                        onChange={(e) => handleObjectiveChange(1, e.target.value)}
                        placeholder="กรอกวัตถุประสงค์ข้อที่ 2"
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Steps */}
              <div className="card rounded-0 border-0 shadow-sm mb-4">
                <div className="card-header bg-dark text-white rounded-0">
                  <h5 className="card-title text-uppercase fw-semibold m-0">
                    <i className="bi bi-list-check me-2 text-warning"></i>
                    ขั้นตอนการดำเนินกิจกรรม
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-4">
                    <div className="col-md-12">
                      <label className="form-label text-uppercase fw-semibold small">
                        <span className="bg-warning text-dark px-2 py-1 me-2">ช่วงที่ 1</span>
                        การจัดการระเบียบและวินัย
                      </label>
                      <textarea 
                        className="form-control rounded-0" 
                        rows={3}
                        name="disciplineManagement"
                        value={formData.disciplineManagement}
                        onChange={handleInputChange}
                        placeholder="เช็คชื่อ, ตรวจระเบียบ, แจ้งข่าวสาร"
                        required
                      ></textarea>
                    </div>
                    <div className="col-md-12">
                      <label className="form-label text-uppercase fw-semibold small">
                        <span className="bg-warning text-dark px-2 py-1 me-2">ช่วงที่ 2</span>
                        กิจกรรมพัฒนาผู้เรียน
                      </label>
                      <textarea 
                        className="form-control rounded-0" 
                        rows={4}
                        name="studentDevelopment"
                        value={formData.studentDevelopment}
                        onChange={handleInputChange}
                        placeholder="กิจกรรมนำ, กิจกรรมหลัก, การสรุป"
                        required
                      ></textarea>
                    </div>
                    <div className="col-md-12">
                      <label className="form-label text-uppercase fw-semibold small">
                        <span className="bg-warning text-dark px-2 py-1 me-2">ช่วงที่ 3</span>
                        การดูแลรายบุคคล
                      </label>
                      <textarea 
                        className="form-control rounded-0" 
                        rows={3}
                        name="individualCare"
                        value={formData.individualCare}
                        onChange={handleInputChange}
                        placeholder="ติดตามนักเรียน, เปิดโอกาสปรึกษา"
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evaluation */}
              <div className="card rounded-0 border-0 shadow-sm mb-4">
                <div className="card-header bg-dark text-white rounded-0">
                  <h5 className="card-title text-uppercase fw-semibold m-0">
                    <i className="bi bi-clipboard-check me-2 text-warning"></i>
                    การประเมินผล
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-check mb-2">
                        <input 
                          className="form-check-input rounded-0" 
                          type="checkbox" 
                          name="observation"
                          checked={formData.evaluation.observation}
                          onChange={handleCheckboxChange}
                          id="checkObservation"
                        />
                        <label className="form-check-label" htmlFor="checkObservation">
                          การสังเกตพฤติกรรม
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input 
                          className="form-check-input rounded-0" 
                          type="checkbox" 
                          name="worksheet"
                          checked={formData.evaluation.worksheet}
                          onChange={handleCheckboxChange}
                          id="checkWorksheet"
                        />
                        <label className="form-check-label" htmlFor="checkWorksheet">
                          ทำใบงาน
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input 
                          className="form-check-input rounded-0" 
                          type="checkbox" 
                          name="participation"
                          checked={formData.evaluation.participation}
                          onChange={handleCheckboxChange}
                          id="checkParticipation"
                        />
                        <label className="form-check-label" htmlFor="checkParticipation">
                          การมีส่วนร่วม
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div className="card rounded-0 border-0 shadow-sm mb-4">
                <div className="card-header bg-dark text-white rounded-0">
                  <h5 className="card-title text-uppercase fw-semibold m-0">
                    <i className="bi bi-paperclip me-2 text-warning"></i>
                    สื่อและวัสดุอุปกรณ์
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <input 
                        type="file" 
                        className="form-control rounded-0" 
                        onChange={handleFileChange}
                      />
                      <small className="text-muted">ไฟล์ที่รองรับ: .pdf, .doc, .docx, .ppt, .pptx</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="row mb-4">
                <div className="col-12 d-flex justify-content-center gap-3">
                  <button 
                    type="button"
                    className="btn btn-secondary rounded-0 text-uppercase fw-semibold px-5"
                    onClick={() => router.back()}
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-warning rounded-0 text-uppercase fw-semibold px-5"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        กำลังบันทึก...
                      </>
                    ) : (
                      'บันทึกการแก้ไข'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <footer className="bg-dark text-white mt-5 py-3 border-top border-warning">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 text-uppercase small">
              <i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล
            </div>
            <div className="col-md-6 text-end text-uppercase small">
              <span className="me-3">เวอร์ชัน 2.0.0</span>
              <span>เข้าสู่ระบบ: {teacher_name}</span>
            </div>
          </div>
        </div>
      </footer>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    </div>
  );
}