// D:\advisor-main\app\student_learn\page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface HomeroomPlan {
  id: string;
  title: string;
  level: string;
  week: string;
  semester: string;
  academicYear: string;
  createdAt: string;
  status: string;
  has_record?: boolean;
  date?: string;
  created_by?: string;
  target_class_group?: string;
  target_class_numbers?: string[];
}

interface Student {
  _id: string;
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  name?: string;
  level: string;
  class_group: string;
  class_number: string;
  status: string;
  image?: string;
}

interface Major {
  _id: string;
  major_id: number;
  major_name: string;
}

export default function StudentLearnPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<HomeroomPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<HomeroomPlan[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedYear, setSelectedYear] = useState("2568");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");

  // Filter states
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedClassGroup, setSelectedClassGroup] = useState("");
  const [selectedClassNumber, setSelectedClassNumber] = useState("");
  const [majors, setMajors] = useState<Major[]>([]);
  
  // Assigned students ของครูปัจจุบัน
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [loadingAssigned, setLoadingAssigned] = useState(true);

  // Calendar state
  const [calendarLevel, setCalendarLevel] = useState<"day" | "month" | "year">("day");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<{[key: string]: HomeroomPlan[]}>({});

  // สำหรับแสดงนักเรียนในแต่ละแผน (ดึงจาก API นักเรียนทั้งหมด)
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [planStudents, setPlanStudents] = useState<{[key: string]: Student[]}>({});
  const [loadingStudents, setLoadingStudents] = useState<{[key: string]: boolean}>({});

  const teacher_name = session?.user?.name || "ไม่พบชื่อผู้ใช้";
  const userRole = session?.user?.role || "";
  const userId = session?.user?.id || "";
  const academic_year = "2568";

  // Calendar helper functions
  const monthNamesFull = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEventsForDate = (year: number, month: number, day: number) => {
    const dateKey = formatDateKey(year, month, day);
    return calendarEvents[dateKey] || [];
  };

  const getEventsForMonth = (year: number, month: number) => {
    return plans.filter(plan => {
      if (!plan.date) return false;
      const [y, m] = plan.date.split('-').map(Number);
      return y === year && m === month + 1;
    });
  };

  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (calendarLevel === "day") {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (calendarLevel === "month") {
      newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (calendarLevel === "year") {
      newDate.setFullYear(selectedDate.getFullYear() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const zoomOut = () => {
    if (calendarLevel === "day") setCalendarLevel("month");
    else if (calendarLevel === "month") setCalendarLevel("year");
  };

  const zoomIn = (date?: Date) => {
    if (calendarLevel === "year" && date) {
      setSelectedDate(date);
      setCalendarLevel("month");
    } else if (calendarLevel === "month" && date) {
      setSelectedDate(date);
      setCalendarLevel("day");
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
    setCalendarLevel("day");
  };

  const buddhistYear = selectedDate.getFullYear() + 543;

  // ดึงข้อมูล majors
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const majorRes = await fetch("/api/major");
        if (majorRes.ok) {
          const majorData = await majorRes.json();
          setMajors(majorData);
        }
      } catch (error) {
        console.error("Error fetching majors:", error);
      }
    };
    fetchMajors();
  }, []);

  // ดึงข้อมูล assigned students ของครูปัจจุบัน
  useEffect(() => {
    const fetchAssignedStudents = async () => {
      if (!userId) {
        setLoadingAssigned(false);
        return;
      }
      
      try {
        console.log("📥 กำลังดึง assigned students สำหรับ user:", userId);
        const assignedRes = await fetch(`/api/user/${userId}/assign-students`);
        if (assignedRes.ok) {
          const assignedData = await assignedRes.json();
          if (assignedData.success) {
            const students = assignedData.data.map((a: any) => {
              const student = a.student_id;
              return {
                _id: student._id,
                id: student.id || "",
                prefix: student.prefix || "",
                first_name: student.first_name || "",
                last_name: student.last_name || "",
                name: `${student.prefix || ''}${student.first_name || ''} ${student.last_name || ''}`.trim(),
                level: student.level || "",
                class_group: student.class_group || "",
                class_number: student.class_number || "",
                status: student.status || "ปกติ",
                image: student.image || ""
              };
            });
            console.log(`✅ พบนักเรียนที่ดูแล ${students.length} คน`);
            setAssignedStudents(students);
          }
        }
      } catch (error) {
        console.error("Error fetching assigned students:", error);
      } finally {
        setLoadingAssigned(false);
      }
    };

    fetchAssignedStudents();
  }, [userId]);

  // ดึงข้อมูลแผนกิจกรรม
 // ใน useEffect สำหรับดึงแผนกิจกรรม ให้รอให้ assignedStudents โหลดเสร็จก่อน
useEffect(() => {
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSemester) params.append('semester', selectedSemester.replace('ภาคเรียนที่ ', ''));
      if (selectedYear) params.append('academicYear', selectedYear);
      
      if (selectedStatus === 'บันทึกผลแล้ว') {
        params.append('hasRecord', 'true');
      } else if (selectedStatus) {
        const statusMap: {[key: string]: string} = {
          'เผยแพร่': 'published',
          'ร่าง': 'draft'
        };
        params.append('status', statusMap[selectedStatus] || selectedStatus);
      }
      
      if (searchKeyword) params.append('search', searchKeyword);
      
      const url = `/api/learn${params.toString() ? `?${params.toString()}` : ''}`;
      console.log("📡 Fetching URL:", url);
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        console.log("📥 ได้รับแผนทั้งหมด:", result.data.length, "แผน");
        setPlans(result.data);
        
        // กรองตามสิทธิ์ที่หน้า UI (เผื่อ API ส่งมาทั้งหมด)
        let filtered = result.data;
        
        if (userRole !== 'ADMIN') {
          filtered = filtered.filter((plan: HomeroomPlan) => {
            // ร่าง: เห็นเฉพาะที่ตัวเองสร้าง
            if (plan.status === 'ร่าง' || plan.status === 'draft') {
              return plan.created_by === teacher_name;
            }
            
            // เผยแพร่: กรองตาม assignedStudents ที่มีอยู่
            if (assignedStudents.length === 0) {
              return false; // ถ้าไม่มีนักเรียนเลย ไม่เห็นแผนเผยแพร่
            }
            
            // เช็คว่ามีนักเรียนในระดับชั้นนี้หรือไม่
            const hasLevel = assignedStudents.some(s => s.level === plan.level);
            if (!hasLevel) return false;
            
            // ถ้าแผนระบุสาขาวิชาเรียน
            if (plan.target_class_group) {
              const hasGroup = assignedStudents.some(s => 
                s.level === plan.level && 
                s.class_group === plan.target_class_group
              );
              if (!hasGroup) return false;
            }
            
            // ถ้าแผนระบุห้อง
            if (plan.target_class_numbers && plan.target_class_numbers.length > 0) {
              const hasNumber = assignedStudents.some(s => 
                s.level === plan.level &&
                (!plan.target_class_group || s.class_group === plan.target_class_group) &&
                plan.target_class_numbers?.includes(s.class_number)
              );
              if (!hasNumber) return false;
            }
            
            return true;
          });
        }
        
        console.log("📊 หลังจากกรองเหลือ:", filtered.length, "แผน");
        setFilteredPlans(filtered);
        
        // Group events for calendar
        const events: {[key: string]: HomeroomPlan[]} = {};
        filtered.forEach((plan: HomeroomPlan) => {
          if (plan.date) {
            if (!events[plan.date]) events[plan.date] = [];
            events[plan.date].push(plan);
          }
        });
        setCalendarEvents(events);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  // รอให้ assignedStudents โหลดเสร็จก่อนค่อย fetch แผน
  if (!loadingAssigned) {
    fetchPlans();
  }
}, [selectedSemester, selectedYear, selectedStatus, searchKeyword, userRole, teacher_name, assignedStudents, loadingAssigned]);
  // ฟังก์ชันดึงนักเรียนที่เข้าร่วมในแผน (จากฐานข้อมูลทั้งหมด)
  const fetchPlanStudents = async (plan: HomeroomPlan) => {
    if (planStudents[plan.id]) {
      setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id);
      return;
    }

    setLoadingStudents(prev => ({ ...prev, [plan.id]: true }));
    
    try {
      // สร้าง query parameters
      const params = new URLSearchParams();
      if (plan.level) params.append('level', plan.level);
      
      // ดึงข้อมูลนักเรียนทั้งหมดตามระดับชั้น
      const response = await fetch(`/api/student?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        let students = result.data;
        
        // กรองตามสาขาวิชาเรียน ถ้ามี
        if (plan.target_class_group) {
          students = students.filter((s: any) => 
            s.class_group === plan.target_class_group
          );
        }
        
        // กรองตามห้อง ถ้ามี
        if (plan.target_class_numbers && plan.target_class_numbers.length > 0) {
          students = students.filter((s: any) => 
            plan.target_class_numbers?.includes(s.class_number)
          );
        }
        
        // จัดรูปแบบข้อมูล
        const formattedStudents = students.map((s: any) => ({
          _id: s._id,
          id: s.id || "",
          prefix: s.prefix || "",
          first_name: s.first_name || "",
          last_name: s.last_name || "",
          name: `${s.prefix || ''}${s.first_name || ''} ${s.last_name || ''}`.trim(),
          level: s.level || "",
          class_group: s.class_group || "",
          class_number: s.class_number || "",
          status: s.status || "ปกติ",
          image: s.image || ""
        }));
        
        setPlanStudents(prev => ({
          ...prev,
          [plan.id]: formattedStudents
        }));
        setExpandedPlanId(plan.id);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoadingStudents(prev => ({ ...prev, [plan.id]: false }));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const response = await fetch(`/api/learn/${deleteId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPlans(plans.filter(p => p.id !== deleteId));
        setFilteredPlans(filteredPlans.filter(p => p.id !== deleteId));
        
        const modal = document.getElementById('deleteModal');
        if (modal) {
          const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
          bsModal.hide();
        }
      } else {
        alert(result.message);
      }
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const getStatusBadge = (status: string, has_record?: boolean) => {
    if (has_record) {
      return <span className="badge bg-info rounded-0 text-uppercase fw-semibold">บันทึกผลแล้ว</span>;
    }
    
    switch(status) {
      case 'ร่าง':
      case 'draft':
        return <span className="badge bg-secondary rounded-0 text-uppercase fw-semibold">ร่าง</span>;
      case 'เผยแพร่':
      case 'published':
        return <span className="badge bg-success rounded-0 text-uppercase fw-semibold">เผยแพร่</span>;
      default:
        return <span className="badge bg-secondary rounded-0 text-uppercase fw-semibold">{status}</span>;
    }
  };

  // ฟังก์ชันตรวจสอบสิทธิ์การแก้ไข/ลบ
  const canEditPlan = (plan: HomeroomPlan) => {
    if (userRole === 'ADMIN') return true;
    if (!plan.created_by || plan.created_by === "-") return true;
    return plan.created_by === teacher_name;
  };

  // สร้างข้อความแสดงเงื่อนไขของแผน
  const getPlanTargetText = (plan: HomeroomPlan) => {
    let text = `ระดับชั้น ${plan.level}`;
    if (plan.target_class_group) {
      text += `, สาขาวิชา ${plan.target_class_group}`;
    }
    if (plan.target_class_numbers && plan.target_class_numbers.length > 0) {
      const numbers = plan.target_class_numbers.length > 5 
        ? `${plan.target_class_numbers[0]} - ${plan.target_class_numbers[plan.target_class_numbers.length-1]}`
        : plan.target_class_numbers.join(', ');
      text += `, ห้อง ${numbers}`;
    }
    return text;
  };

  return (
    <div className="min-vh-100 bg-light">
      <div className="container-fluid py-4">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-calendar-check me-2 text-warning"></i>
                แผนกิจกรรมโฮมรูม
              </h2>
              <div>
                              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-white border rounded-0">
                <i className="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                className="form-control rounded-0" 
                placeholder="ค้นหา"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-2">
            <select 
              className="form-select rounded-0"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="">ภาคเรียน</option>
              <option value="ภาคเรียนที่ 1">ภาคเรียนที่ 1</option>
              <option value="ภาคเรียนที่ 2">ภาคเรียนที่ 2</option>
            </select>
          </div>
          <div className="col-md-2">
            <select 
              className="form-select rounded-0"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2569">2569</option>
              <option value="2570">2570</option>
              <option value="2571">2571</option>
              <option value="2572">2572</option>
              <option value="2573">2573</option>
              <option value="2574">2574</option>
              <option value="2575">2575</option>

            </select>
          </div>
          <div className="col-md-2">
            <select 
              className="form-select rounded-0"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">สถานะ</option>
              <option value="ร่าง">ร่าง</option>
              <option value="เผยแพร่">เผยแพร่</option>
              <option value="บันทึกผลแล้ว">บันทึกผลแล้ว</option>
            </select>
          </div>
{/*           <div className="col-md-3">
            <button className="btn btn-warning rounded-0 w-100 text-uppercase fw-semibold">
              <i className="bi bi-funnel me-2"></i>ค้นหา
            </button>
          </div> */}
        </div>

        {/* View Toggle and Action Bar */}
        <div className="row mb-3">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div className="btn-group" role="group">
              <button 
                className={`btn ${viewMode === 'table' ? 'btn-dark' : 'btn-outline-dark'} rounded-0 text-uppercase fw-semibold`}
                onClick={() => setViewMode('table')}
              >
                <i className="bi bi-table me-2"></i>ตาราง
              </button>
              <button 
                className={`btn ${viewMode === 'calendar' ? 'btn-dark' : 'btn-outline-dark'} rounded-0 text-uppercase fw-semibold`}
                onClick={() => setViewMode('calendar')}
              >
                <i className="bi bi-calendar-week me-2"></i>ปฏิทิน
              </button>
            </div>
            <div>
              <span className="text-muted me-3">แสดง {filteredPlans.length} รายการ</span>
              <Link
                href="/student_learn/create"
                className="btn btn-primary rounded-0 text-uppercase fw-semibold"
              >
                <i className="bi bi-plus-circle me-2"></i>สร้างแผนกิจกรรมโฮมรูม
              </Link>
            </div>
          </div>
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="row">
            <div className="col-12">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">กำลังโหลด...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover bg-white">
                    <thead className="bg-dark text-white">
                      <tr>
                        <th className="text-uppercase fw-semibold" style={{width: '50px'}}>ลำดับ</th>
                        <th className="text-uppercase fw-semibold">หัวข้อหลัก</th>
                        <th className="text-uppercase fw-semibold">ระดับชั้น</th>
                        <th className="text-uppercase fw-semibold">สัปดาห์ที่</th>
                        <th className="text-uppercase fw-semibold">วันที่จัดกิจกรรม</th>
                        <th className="text-uppercase fw-semibold">สถานะ</th>
                        <th className="text-uppercase fw-semibold">สาขาวิชาเป้าหมาย</th>
                        <th className="text-uppercase fw-semibold">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlans.length > 0 ? (
                        filteredPlans.map((plan, index) => (
                          <React.Fragment key={plan.id}>
                            <tr>
                              <td>{index + 1}</td>
                              <td className="fw-semibold">
                                <Link 
                                  href={`/student_learn/${plan.id}`}
                                  className="text-decoration-none text-dark"
                                >
                                  {plan.title}
                                </Link>
                              </td>
                              <td>{plan.level}</td>
                              <td>{plan.week}</td>
                              <td>{plan.date || '-'}</td>
                              <td>{getStatusBadge(plan.status, plan.has_record)}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-info rounded-0 w-100"
                                  onClick={() => fetchPlanStudents(plan)}
                                  disabled={loadingStudents[plan.id]}
                                >
                                  {loadingStudents[plan.id] ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-1"></span>
                                      กำลังโหลด...
                                    </>
                                  ) : (
                                    <>
                                      <i className="bi bi-people me-1"></i>
                                      ดูรายชื่อ
                                      {planStudents[plan.id] && ` (${planStudents[plan.id].length})`}
                                    </>
                                  )}
                                </button>
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  <button 
                                    className="btn btn-sm btn-outline-primary rounded-0"
                                    onClick={() => router.push(`/student_learn/${plan.id}`)}
                                    title="ดูรายละเอียด"
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
                                  {canEditPlan(plan) && (
                                    <>
                                      <button 
                                        className="btn btn-sm btn-outline-warning rounded-0"
                                        onClick={() => router.push(`/student_learn/${plan.id}/edit`)}
                                        title="แก้ไข"
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </button>
                                      <button 
                                        className="btn btn-sm btn-outline-success rounded-0"
                                        onClick={() => router.push(`/student_learn/${plan.id}/record`)}
                                        title="บันทึกผลกิจกรรม"
                                      >
                                        <i className="bi bi-check-circle"></i>
                                      </button>
                                      <button 
                                        className="btn btn-sm btn-outline-info rounded-0"
                                        onClick={() => router.push(`/student_learn/${plan.id}/album`)}
                                        title="อัลบัมรูปภาพ"
                                      >
                                        <i className="bi bi-images"></i>
                                      </button>
                                      <button 
                                        className="btn btn-sm btn-outline-danger rounded-0"
                                        title="ลบ"
                                        data-bs-toggle="modal"
                                        data-bs-target="#deleteModal"
                                        onClick={() => setDeleteId(plan.id)}
                                      >
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {expandedPlanId === plan.id && planStudents[plan.id] && (
                              <tr className="bg-light">
                                <td colSpan={8} className="p-3">
                                  <div className="border-start border-3 border-info ps-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                      <h6 className="fw-bold mb-0">
                                        <i className="bi bi-people-fill me-2 text-info"></i>
                                        รายชื่อนักเรียนที่เข้าร่วม ({planStudents[plan.id].length} คน)
                                      </h6>
                                      <small className="text-muted">
                                        {getPlanTargetText(plan)}
                                      </small>
                                    </div>
                                    
                                    {planStudents[plan.id].length > 0 ? (
                                      <div className="table-responsive">
                                        <table className="table table-sm table-bordered bg-white">
                                          <thead className="table-secondary">
                                            <tr>
                                              <th>#</th>
                                              <th>รหัสนักเรียน</th>
                                              <th>ชื่อ-นามสกุล</th>
                                              <th>ระดับชั้น</th>
                                              <th>สาขาวิชาเรียน</th>
                                              <th>ห้อง</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {planStudents[plan.id].map((student, idx) => (
                                              <tr key={student._id}>
                                                <td>{idx + 1}</td>
                                                <td className="fw-bold">{student.id}</td>
                                                <td>
                                                  <div className="d-flex align-items-center">
                                                    {student.image ? (
                                                      <img 
                                                        src={student.image} 
                                                        alt={student.name}
                                                        className="rounded-circle me-2"
                                                        style={{width: '25px', height: '25px', objectFit: 'cover'}}
                                                      />
                                                    ) : (
                                                      <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2" style={{width: '25px', height: '25px'}}>
                                                        <i className="bi bi-person-fill small"></i>
                                                      </div>
                                                    )}
                                                    {student.name}
                                                  </div>
                                                </td>
                                                <td>{student.level}</td>
                                                <td>{student.class_group}</td>
                                                <td>{student.class_number}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    ) : (
                                      <p className="text-muted">ไม่มีนักเรียนตามเงื่อนไขนี้</p>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="text-center text-muted py-5">
                            <i className="bi bi-calendar-x fs-1 d-block mb-3"></i>
                            <h5>ไม่พบแผนกิจกรรมโฮมรูม</h5>
                            <p className="mb-0">ลองปรับเปลี่ยนตัวกรอง หรือสร้างแผนใหม่</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calendar View (เหมือนเดิม) */}
        {viewMode === 'calendar' && (
          <div className="row">
            <div className="col-12">
              <div className="card rounded-0 border-0 shadow-sm">
                {/* Calendar Header */}
                <div className="card-header bg-dark text-white rounded-0 py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <button 
                        className="btn btn-outline-light btn-sm rounded-0"
                        onClick={() => changeDate('prev')}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                      
                      <h5 className="m-0 mx-2">
                        {calendarLevel === "day" && (
                          <>{selectedDate.getDate()} {monthNamesFull[selectedDate.getMonth()]} {buddhistYear}</>
                        )}
                        {calendarLevel === "month" && (
                          <>{monthNamesFull[selectedDate.getMonth()]} {buddhistYear}</>
                        )}
                        {calendarLevel === "year" && (
                          <>ปี {buddhistYear}</>
                        )}
                      </h5>
                      
                      <button 
                        className="btn btn-outline-light btn-sm rounded-0"
                        onClick={() => changeDate('next')}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>

                    <div className="d-flex gap-2">
                      {calendarLevel !== "year" && (
                        <button 
                          className="btn btn-outline-light btn-sm rounded-0"
                          onClick={zoomOut}
                        >
                          <i className="bi bi-zoom-out me-1"></i> ซูมออก
                        </button>
                      )}
                      <button 
                        className="btn btn-outline-light btn-sm rounded-0"
                        onClick={goToToday}
                      >
                        <i className="bi bi-calendar-today me-1"></i> วันนี้
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Legend */}
                <div className="card-footer bg-white border-bottom">
                  <div className="d-flex gap-3">
                    <div className="d-flex align-items-center">
                      <span className="badge bg-success rounded-0 me-2">&nbsp;</span>
                      <span className="small">เผยแพร่</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="badge bg-secondary rounded-0 me-2">&nbsp;</span>
                      <span className="small">ร่าง</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="badge bg-info rounded-0 me-2">&nbsp;</span>
                      <span className="small">บันทึกผลแล้ว</span>
                    </div>
                  </div>
                </div>

                {/* Year View */}
                {calendarLevel === "year" && (
                  <div className="card-body">
                    <div className="row g-3">
                      {Array.from({ length: 12 }, (_, month) => {
                        const monthEvents = getEventsForMonth(selectedDate.getFullYear(), month);
                        const hasEvents = monthEvents.length > 0;
                        
                        return (
                          <div className="col-md-3 col-6" key={month}>
                            <div 
                              className={`card rounded-0 border text-center h-100 cursor-pointer ${hasEvents ? 'border-warning' : ''}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                const newDate = new Date(selectedDate);
                                newDate.setMonth(month);
                                zoomIn(newDate);
                              }}
                            >
                              <div className="card-header bg-light py-2">
                                <h6 className="m-0 fw-bold">{monthNamesFull[month]}</h6>
                              </div>
                              <div className="card-body p-3">
                                {hasEvents ? (
                                  <>
                                    <span className="badge bg-warning text-dark rounded-0 fs-6">
                                      {monthEvents.length} กิจกรรม
                                    </span>
                                    <div className="mt-2 small text-muted">
                                      {monthEvents.slice(0, 2).map(e => (
                                        <div key={e.id} className="text-truncate">• {e.title}</div>
                                      ))}
                                      {monthEvents.length > 2 && <div>...</div>}
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-muted">ไม่มีกิจกรรม</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Month View */}
                {calendarLevel === "month" && (
                  <div className="card-body p-0">
                    <table className="table table-bordered mb-0">
                      <thead className="bg-light">
                        <tr>
                          {dayNames.map(day => (
                            <th key={day} className="text-center text-uppercase fw-semibold py-2">
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const year = selectedDate.getFullYear();
                          const month = selectedDate.getMonth();
                          const daysInMonth = getDaysInMonth(year, month);
                          const firstDay = getFirstDayOfMonth(year, month);
                          const rows = [];
                          let cells = [];
                          
                          for (let i = 0; i < firstDay; i++) {
                            cells.push(<td key={`empty-${i}`} className="bg-light" style={{ height: '80px' }}></td>);
                          }
                          
                          for (let day = 1; day <= daysInMonth; day++) {
                            const dayEvents = getEventsForDate(year, month, day);
                            const isToday = 
                              year === new Date().getFullYear() &&
                              month === new Date().getMonth() &&
                              day === new Date().getDate();
                            
                            cells.push(
                              <td 
                                key={day} 
                                className={`align-top p-1 ${isToday ? 'bg-warning bg-opacity-10' : ''} cursor-pointer`}
                                style={{ height: '80px', cursor: 'pointer' }}
                                onClick={() => {
                                  const newDate = new Date(year, month, day);
                                  zoomIn(newDate);
                                }}
                              >
                                <div className="d-flex flex-column h-100">
                                  <span className={`fw-bold mb-1 ${isToday ? 'text-warning' : ''}`}>
                                    {day}
                                  </span>
                                  {dayEvents.length > 0 && (
                                    <div className="mt-1">
                                      <span className="badge bg-warning text-dark rounded-0">
                                        {dayEvents.length} กิจกรรม
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                            
                            if ((firstDay + day) % 7 === 0) {
                              rows.push(<tr key={`row-${day}`}>{cells}</tr>);
                              cells = [];
                            }
                          }
                          
                          if (cells.length > 0) {
                            while (cells.length < 7) {
                              cells.push(<td key={`empty-end-${cells.length}`} className="bg-light" style={{ height: '80px' }}></td>);
                            }
                            rows.push(<tr key="last-row">{cells}</tr>);
                          }
                          
                          return rows;
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Day View */}
                {calendarLevel === "day" && (
                  <div className="card-body">
                    <h5 className="mb-3">
                      กิจกรรมประจำวันที่ {selectedDate.getDate()} {monthNamesFull[selectedDate.getMonth()]} {buddhistYear}
                    </h5>
                    
                    {(() => {
                      const dayEvents = getEventsForDate(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate()
                      );
                      
                      if (dayEvents.length === 0) {
                        return (
                          <div className="text-center py-5 text-muted">
                            <i className="bi bi-calendar-x fs-1"></i>
                            <p className="mt-2">ไม่มีกิจกรรมในวันนี้</p>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="list-group">
                          {dayEvents.map(event => (
                            <div 
                              key={event.id}
                              className="list-group-item list-group-item-action cursor-pointer"
                              onClick={() => router.push(`/student_learn/${event.id}`)}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <h6 className="mb-1">{event.title}</h6>
                                  <p className="mb-1 small">
                                    {event.level} | {event.week} | {event.semester}
                                  </p>
                                </div>
                                <div>
                                  {getStatusBadge(event.status, event.has_record)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <div className="modal fade" id="deleteModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content rounded-0">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title text-uppercase fw-semibold">
                <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>ยืนยันการลบข้อมูล
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p>คุณต้องการลบแผนกิจกรรมโฮมรูมนี้ใช่หรือไม่?</p>
              <p className="text-danger small">การลบข้อมูลนี้จะส่งผลต่อประวัติการบันทึกผลกิจกรรมที่เกี่ยวข้องทั้งหมด</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary rounded-0 text-uppercase fw-semibold" data-bs-dismiss="modal">ยกเลิก</button>
              <button type="button" className="btn btn-danger rounded-0 text-uppercase fw-semibold" onClick={handleDelete}>ยืนยันการลบ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}