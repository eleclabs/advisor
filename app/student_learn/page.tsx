"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HomeroomPlan {
  id: string;
  title: string;
  level: string;
  week: string;
  semester: string;
  academicYear: string;
  createdAt: string;
  status: string;
  date?: string;
}

export default function StudentLearnPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<HomeroomPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<HomeroomPlan[]>([]);
  const [search_keyword, setSearchKeyword] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedYear, setSelectedYear] = useState("2568");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  
  // ปฏิทิน
  const [calendarLevel, setCalendarLevel] = useState<"day" | "month" | "year">("day"); // day=ดูรายวัน, month=ดูทั้งเดือน, year=ดูทั้งปี
  const [selectedDate, setSelectedDate] = useState(new Date()); // วันที่เลือก
  const [calendarEvents, setCalendarEvents] = useState<{[key: string]: HomeroomPlan[]}>({});

  const teacher_name = "อาจารย์วิมลรัตน์";
  const academic_year = "2568";

  // Load Bootstrap CSS and Icons
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

  // Load plans data
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const mockData: HomeroomPlan[] = [
          {
            id: "1",
            title: "การปรับตัวเข้าสู่ชีวิตนักเรียน",
            level: "ปวช.1",
            week: "สัปดาห์ที่ 1",
            semester: "ภาคเรียนที่ 1",
            academicYear: "2568",
            createdAt: "01/05/2568",
            status: "เผยแพร่",
            date: "2024-05-01"
          },
          {
            id: "2",
            title: "การวางแผนการเรียน",
            level: "ปวช.2",
            week: "สัปดาห์ที่ 3",
            semester: "ภาคเรียนที่ 1",
            academicYear: "2568",
            createdAt: "10/05/2568",
            status: "ร่าง",
            date: "2024-05-15"
          },
          {
            id: "3",
            title: "การเตรียมตัวสอบ",
            level: "ปวช.3",
            week: "สัปดาห์ที่ 8",
            semester: "ภาคเรียนที่ 2",
            academicYear: "2568",
            createdAt: "15/08/2568",
            status: "เสร็จสิ้น",
            date: "2024-08-20"
          },
          {
            id: "4",
            title: "ทักษะการสื่อสาร",
            level: "ปวส.1",
            week: "สัปดาห์ที่ 5",
            semester: "ภาคเรียนที่ 1",
            academicYear: "2568",
            createdAt: "10/06/2568",
            status: "เผยแพร่",
            date: "2024-06-12"
          },
          {
            id: "5",
            title: "การเตรียมตัวฝึกงาน",
            level: "ปวส.2",
            week: "สัปดาห์ที่ 10",
            semester: "ภาคเรียนที่ 2",
            academicYear: "2568",
            createdAt: "05/09/2568",
            status: "ร่าง",
            date: "2024-09-18"
          },
          {
            id: "6",
            title: "การพัฒนาบุคลิกภาพ",
            level: "ปวช.1",
            week: "สัปดาห์ที่ 7",
            semester: "ภาคเรียนที่ 1",
            academicYear: "2568",
            createdAt: "20/06/2568",
            status: "เผยแพร่",
            date: "2024-06-25"
          },
          {
            id: "7",
            title: "การทำงานเป็นทีม",
            level: "ปวช.2",
            week: "สัปดาห์ที่ 9",
            semester: "ภาคเรียนที่ 2",
            academicYear: "2568",
            createdAt: "10/10/2568",
            status: "ร่าง",
            date: "2024-10-12"
          }
        ];
        
        setPlans(mockData);
        setFilteredPlans(mockData);
        
        // จัดกลุ่มกิจกรรมตามวันที่
        const events: {[key: string]: HomeroomPlan[]} = {};
        mockData.forEach(plan => {
          if (plan.date) {
            if (!events[plan.date]) {
              events[plan.date] = [];
            }
            events[plan.date].push(plan);
          }
        });
        setCalendarEvents(events);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching plans:", error);
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Search and filter plans
  useEffect(() => {
    let filtered = plans;

    if (search_keyword) {
      filtered = filtered.filter(
        (plan) =>
          plan.title.toLowerCase().includes(search_keyword.toLowerCase()) ||
          plan.level.includes(search_keyword)
      );
    }

    if (selectedSemester) {
      filtered = filtered.filter((plan) => plan.semester === selectedSemester);
    }

    if (selectedYear) {
      filtered = filtered.filter((plan) => plan.academicYear === selectedYear);
    }

    if (selectedStatus) {
      filtered = filtered.filter((plan) => plan.status === selectedStatus);
    }

    setFilteredPlans(filtered);
  }, [search_keyword, selectedSemester, selectedYear, selectedStatus, plans]);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setPlans(plans.filter(p => p.id !== deleteId));
      setFilteredPlans(filteredPlans.filter(p => p.id !== deleteId));
      
      const modal = document.getElementById('deleteModal');
      if (modal) {
        const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
        bsModal.hide();
      }
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ร่าง':
        return <span className="badge bg-secondary rounded-0 text-uppercase fw-semibold">ร่าง</span>;
      case 'เผยแพร่':
        return <span className="badge bg-success rounded-0 text-uppercase fw-semibold">เผยแพร่</span>;
      case 'เสร็จสิ้น':
        return <span className="badge bg-info rounded-0 text-uppercase fw-semibold">เสร็จสิ้น</span>;
      default:
        return <span className="badge bg-secondary rounded-0 text-uppercase fw-semibold">{status}</span>;
    }
  };

  // ฟังก์ชันปฏิทิน
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
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
    if (calendarLevel === "day") {
      setCalendarLevel("month");
    } else if (calendarLevel === "month") {
      setCalendarLevel("year");
    }
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

  const total_records = filteredPlans.length;
  const itemsPerPage = 10;
  const total_pages = Math.ceil(total_records / itemsPerPage);
  const current_page = 1;

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation Bar */}
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
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
              <h2 className="text-uppercase fw-bold m-0">
                <i className="bi bi-calendar-check me-2 text-warning"></i>
                แผนกิจกรรมโฮมรูม
              </h2>
              <div>
                <span className="text-muted me-3">ครูที่ปรึกษา: {teacher_name}</span>
                <span className="badge bg-dark text-white rounded-0">ปีการศึกษา {academic_year}</span>
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
                placeholder="ค้นหาด้วยหัวข้อ, ระดับชั้น..."
                value={search_keyword}
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
              <option value="2568">ปี 2568</option>
              <option value="2567">ปี 2567</option>
              <option value="2566">ปี 2566</option>
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
              <option value="เสร็จสิ้น">เสร็จสิ้น</option>
            </select>
          </div>
          <div className="col-md-3">
            <button className="btn btn-warning rounded-0 w-100 text-uppercase fw-semibold">
              <i className="bi bi-funnel me-2"></i>ค้นหา
            </button>
          </div>
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
              <span className="text-muted me-3">แสดง {total_records} รายการ</span>
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
                        <th className="text-uppercase fw-semibold">ลำดับ</th>
                        <th className="text-uppercase fw-semibold">หัวข้อหลัก</th>
                        <th className="text-uppercase fw-semibold">ระดับชั้น</th>
                        <th className="text-uppercase fw-semibold">สัปดาห์ที่</th>
                        <th className="text-uppercase fw-semibold">วันที่จัดกิจกรรม</th>
                        <th className="text-uppercase fw-semibold">สถานะ</th>
                        <th className="text-uppercase fw-semibold">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlans.length > 0 ? (
                        filteredPlans.map((plan, index) => (
                          <tr key={plan.id}>
                            <td>{index + 1}</td>
                            <td className="fw-semibold">
                              <a 
                                href={`/student_learn/${plan.id}`}
                                className="text-decoration-none"
                                onClick={(e) => {
                                  e.preventDefault();
                                  router.push(`/student_learn/${plan.id}`);
                                }}
                              >
                                {plan.title}
                              </a>
                            </td>
                            <td>{plan.level}</td>
                            <td>{plan.week}</td>
                            <td>{plan.date || '-'}</td>
                            <td>{getStatusBadge(plan.status)}</td>
                            <td>
                              <div className="btn-group" role="group">
                                <button 
                                  className="btn btn-sm btn-outline-primary rounded-0"
                                  onClick={() => router.push(`/student_learn/${plan.id}`)}
                                  title="ดูรายละเอียด"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
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
                                  className="btn btn-sm btn-outline-danger rounded-0"
                                  title="ลบ"
                                  data-bs-toggle="modal"
                                  data-bs-target="#deleteModal"
                                  onClick={() => setDeleteId(plan.id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center text-muted py-3">
                            ไม่พบแผนกิจกรรมโฮมรูม
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

        {/* Calendar View - ซูมเข้า/ออกได้ */}
        {viewMode === 'calendar' && (
          <div className="row">
            <div className="col-12">
              <div className="card rounded-0 border-0 shadow-sm">
                {/* Header ปฏิทิน */}
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

                {/* แสดงสถานะสี */}
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
                      <span className="small">เสร็จสิ้น</span>
                    </div>
                  </div>
                </div>

                {/* มุมมองปี - แสดง 12 เดือน */}
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

                {/* มุมมองเดือน - แสดงปฏิทินทั้งเดือน */}
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

                {/* มุมมองวัน - แสดงกิจกรรมของวันนั้น */}
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
                                  {getStatusBadge(event.status)}
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

        {/* Pagination - แสดงเฉพาะโหมดตาราง */}
        {viewMode === 'table' && (
          <div className="row mt-3">
            <div className="col-12 d-flex justify-content-center">
              <nav aria-label="Page navigation">
                <ul className="pagination rounded-0">
                  <li className={`page-item ${current_page === 1 ? 'disabled' : ''}`}>
                    <a className="page-link rounded-0" href="#" aria-label="Previous">
                      <span aria-hidden="true">&laquo;</span>
                    </a>
                  </li>
                  {Array.from({ length: total_pages }, (_, i) => i + 1).map(page => (
                    <li key={page} className={`page-item ${page === current_page ? 'active' : ''}`}>
                      <a className="page-link rounded-0" href="#">{page}</a>
                    </li>
                  ))}
                  <li className={`page-item ${current_page === total_pages ? 'disabled' : ''}`}>
                    <a className="page-link rounded-0" href="#" aria-label="Next">
                      <span aria-hidden="true">&raquo;</span>
                    </a>
                  </li>
                </ul>
              </nav>
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

      {/* Footer */}
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