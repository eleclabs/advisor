// D:\advisor-main\app\student_problem\activity\view\page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Activity {
  _id: string;
  name: string;
  objective?: string;
  duration: number;
  duration_period?: string;
  materials: string;
  steps: string;
  ice_breaking: string;
  group_task: string;
  debrief: string;
  activity_date: string;
  participants: Array<{
    student_id: string;
    student_name: string;
    joined: boolean;
    joined_at?: string;
  }>;
  total_participants: number;
  joined_count: number;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Interface สำหรับข้อมูลจาก Problem
interface StudentProblemData {
  student_id: string;
  activities_status?: Record<string, string>;
  activity_join_dates?: Record<string, string>;
  activities?: Array<{
    activity_id: string;
    status: string;
    joined_at?: string;
    completed_at?: string;
    notes?: string;
  }>;
}

export default function ViewActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [studentsData, setStudentsData] = useState<Map<string, StudentProblemData>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchActivity();
    } else {
      router.push("/student_problem?tab=activities");
    }
  }, [id]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/problem/activity?id=${id}`);
      const data = await res.json();
      
      if (data.success) {
        console.log("📥 Activity data:", data.data);
        setActivity(data.data);
        
        // ✅ ดึงข้อมูล Problem ของนักเรียนทุกคนในกิจกรรม
        if (data.data.participants && data.data.participants.length > 0) {
          await fetchStudentsData(data.data.participants);
        }
      } else {
        alert("ไม่พบกิจกรรม");
        router.push("/student_problem?tab=activities");
      }
    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ฟังก์ชันดึงข้อมูล Problem ของนักเรียนแต่ละคน
  const fetchStudentsData = async (participants: any[]) => {
    try {
      const promises = participants.map(async (p) => {
        const res = await fetch(`/api/problem/${p.student_id}`);
        if (res.ok) {
          const data = await res.json();
          console.log(`📥 Data for student ${p.student_id}:`, data.data);
          return { student_id: p.student_id, data: data.data };
        }
        return null;
      });

      const results = await Promise.all(promises);
      const map = new Map();
      
      results.forEach(result => {
        if (result) {
          map.set(result.student_id, result.data);
        }
      });
      
      console.log("📊 Students data map:", map);
      setStudentsData(map);
    } catch (error) {
      console.error("Error fetching students data:", error);
    }
  };

  // ✅ ดึงสถานะกิจกรรมจาก Problem
  const getActivityStatus = (studentId: string) => {
    const studentData = studentsData.get(studentId);
    
    // ลองหาจาก activities_status Map
    if (studentData?.activities_status && activity) {
      const status = studentData.activities_status[activity._id];
      if (status) return status;
    }
    
    // ลองหาจาก activities array
    if (studentData?.activities && activity) {
      const activityData = studentData.activities.find(
        (a: any) => a.activity_id === activity._id || a.activity_id?.toString() === activity._id
      );
      if (activityData?.status) return activityData.status;
    }
    
    // ถ้าไม่มีใน Problem ให้ใช้ข้อมูลจาก participants
    const participant = activity?.participants?.find(p => p.student_id === studentId);
    return participant?.joined ? 'เข้าร่วมแล้ว' : 'ยังไม่เข้าร่วม';
  };

  // ✅ ดึงวันที่เข้าร่วมจาก Problem
  const getJoinDate = (studentId: string) => {
    const studentData = studentsData.get(studentId);
    
    // ลองหาจาก activity_join_dates Map
    if (studentData?.activity_join_dates && activity) {
      const joinDate = studentData.activity_join_dates[activity._id];
      if (joinDate) return joinDate;
    }
    
    // ลองหาจาก activities array
    if (studentData?.activities && activity) {
      const activityData = studentData.activities.find(
        (a: any) => a.activity_id === activity._id || a.activity_id?.toString() === activity._id
      );
      if (activityData?.joined_at) return activityData.joined_at;
    }
    
    // ถ้าไม่มีใน Problem ให้ใช้ข้อมูลจาก participants
    const participant = activity?.participants?.find(p => p.student_id === studentId);
    return participant?.joined_at;
  };

  // ✅ ดึงคำอธิบายจาก Problem
  const getNotes = (studentId: string) => {
    const studentData = studentsData.get(studentId);
    
    if (studentData?.activities && activity) {
      const activityData = studentData.activities.find(
        (a: any) => a.activity_id === activity._id || a.activity_id?.toString() === activity._id
      );
      return activityData?.notes;
    }
    
    return null;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const formatShortDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  // ✅ ฟังก์ชันหา badge class ตามสถานะ
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'เสร็จสิ้น': return 'bg-success';
      case 'เข้าร่วมแล้ว': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  if (loading) {
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

  if (!activity) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle fs-1 text-warning d-block mb-3"></i>
          <h4>ไม่พบกิจกรรม</h4>
          <p className="text-muted">อาจถูกลบหรือไม่มีอยู่ในระบบ</p>
          <Link href="/student_problem?tab=activities" className="btn btn-warning mt-3">
            <i className="bi bi-arrow-left me-2"></i>กลับ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-3 border-warning">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="bi bi-activity text-warning me-2"></i>
            {activity.name}
          </h2>
          <div className="d-flex gap-3 mt-1">
            <span className="badge bg-light text-dark">
              <i className="bi bi-calendar me-1"></i>
              {formatShortDate(activity.activity_date)}
            </span>
            {activity.duration_period && (
              <span className="badge bg-light text-dark">
                <i className="bi bi-clock-history me-1"></i>
                {activity.duration_period}
              </span>
            )}
          </div>
        </div>
        <div>
          <Link 
            href={`/student_problem/activity/edit?id=${id}`} 
            className="btn btn-warning btn-sm me-2"
          >
            <i className="bi bi-pencil me-1"></i>แก้ไข
          </Link>
          <Link 
            href="/student_problem?tab=activities" 
            className="btn btn-outline-secondary btn-sm"
          >
            <i className="bi bi-arrow-left me-1"></i>กลับ
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-md-6">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="small text-uppercase opacity-75">เวลา</div>
                  <div className="h3 mb-0">{activity.duration}</div>
                  <small>นาที</small>
                </div>
                <i className="bi bi-clock fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-6">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="small text-uppercase opacity-75">ผู้เข้าร่วม</div>
                  <div className="h3 mb-0">{activity.total_participants}</div>
                  <small>คน</small>
                </div>
                <i className="bi bi-people fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* วัตถุประสงค์ / เป้าหมายกิจกรรม */}
      <div className="card mb-4">
        <div className="card-header bg-warning">
          <h6 className="mb-0 fw-bold text-dark">
            <i className="bi bi-bullseye me-2"></i>
            วัตถุประสงค์ / เป้าหมายกิจกรรม
          </h6>
        </div>
        <div className="card-body">
          {activity.objective && activity.objective.trim() !== "" ? (
            <div>
              <p className="mb-2 fw-bold text-muted small">เพื่อแก้ปัญหาอะไร:</p>
              <p className="mb-0">{activity.objective}</p>
            </div>
          ) : (
            <p className="text-muted fst-italic mb-0">
              <i className="bi bi-dash-circle me-2"></i>
              ไม่ได้ระบุวัตถุประสงค์
            </p>
          )}
        </div>
      </div>

      {/* รายละเอียดกิจกรรม */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0 fw-bold">📋 รายละเอียดกิจกรรม</h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="fw-bold text-muted small">ชื่อกิจกรรม</label>
                <p className="mb-0">{activity.name}</p>
              </div>
              <div className="mb-3">
                <label className="fw-bold text-muted small">เวลา</label>
                <p className="mb-0">{activity.duration} นาที</p>
              </div>
              <div className="mb-3">
                <label className="fw-bold text-muted small">อุปกรณ์</label>
                <p className="mb-0">{activity.materials || '-'}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="fw-bold text-muted small">วันที่จัด</label>
                <p className="mb-0">{formatDate(activity.activity_date)}</p>
              </div>
              
              {/* ส่วนแสดงระยะเวลาดำเนินการ / ครั้งที่จัด */}
              <div className="mb-3">
                <label className="fw-bold text-muted small">
                  <i className="bi bi-calendar-range me-1"></i>
                  ระยะเวลาดำเนินการ / ครั้งที่จัด
                </label>
                <p className="mb-0">
                  {activity.duration_period && activity.duration_period.trim() !== "" 
                    ? activity.duration_period 
                    : <span className="text-muted fst-italic">- ไม่ได้ระบุ -</span>
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ขั้นตอน */}
      {activity.steps ? (
        <div className="card mb-4">
          <div className="card-header bg-success text-white">
            <h6 className="mb-0 fw-bold">
              <i className="bi bi-list-ol me-2"></i>
              ขั้นตอน
            </h6>
          </div>
          <div className="card-body">
            <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{activity.steps}</p>
          </div>
        </div>
      ) : (
        <div className="alert alert-light border mb-4">
          <i className="bi bi-info-circle me-2"></i>
          ไม่มีขั้นตอน
        </div>
      )}

      {/* ละลายพฤติกรรม / โจทย์กลุ่ม / ถอดบทเรียน */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">
                <i className="bi bi-emoji-smile me-2"></i>
                ละลายพฤติกรรม
              </h6>
            </div>
            <div className="card-body">
              {activity.ice_breaking ? (
                <p className="mb-0">{activity.ice_breaking}</p>
              ) : (
                <p className="text-muted fst-italic mb-0">- ไม่มี -</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0">
                <i className="bi bi-people me-2"></i>
                โจทย์กลุ่ม
              </h6>
            </div>
            <div className="card-body">
              {activity.group_task ? (
                <p className="mb-0">{activity.group_task}</p>
              ) : (
                <p className="text-muted fst-italic mb-0">- ไม่มี -</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header bg-warning">
              <h6 className="mb-0 fw-bold text-dark">
                <i className="bi bi-chat-quote me-2"></i>
                ถอดบทเรียน (AAR)
              </h6>
            </div>
            <div className="card-body">
              {activity.debrief ? (
                <div>
                  <p className="mb-2 fw-bold text-muted small">สิ่งที่ได้เรียนรู้จากการทำงานร่วมกับเพื่อน:</p>
                  <p className="mb-0">{activity.debrief}</p>
                </div>
              ) : (
                <p className="text-muted fst-italic mb-0">- ไม่มี -</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ รายชื่อนักเรียนทั้งหมด - ดึงข้อมูลจาก Problem */}
      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <h6 className="mb-0">
            <i className="bi bi-people-fill me-2 text-warning"></i>
            รายชื่อนักเรียนที่เข้าร่วม ({activity.participants?.length || 0} คน)
          </h6>
        </div>
        <div className="card-body">
          {!activity.participants || activity.participants.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-people fs-1 text-muted d-block mb-3"></i>
              <p className="text-muted mb-0">ไม่มีนักเรียนในกิจกรรมนี้</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>รหัสนักเรียน</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>วันที่เข้าร่วม</th>
                    <th>สถานะ</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.participants.map((p, index) => {
                    // ✅ ดึงข้อมูลจาก Problem
                    const status = getActivityStatus(p.student_id);
                    const joinDate = getJoinDate(p.student_id);
                    const notes = getNotes(p.student_id);
                    
                    return (
                      <tr key={p.student_id}>
                        <td>{index + 1}</td>
                        <td>
                          <span className="fw-bold">{p.student_id}</span>
                        </td>
                        <td>
                          {p.student_name}
                          {notes && (
                            <i 
                              className="bi bi-chat-dots-fill ms-2 text-info" 
                              style={{ cursor: 'pointer' }}
                              title={notes}
                            ></i>
                          )}
                        </td>
                        <td>
                          {joinDate 
                            ? formatShortDate(joinDate)
                            : p.joined_at 
                              ? formatShortDate(p.joined_at) 
                              : '-'
                          }
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(status)} text-white px-3 py-2`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            {/* ปุ่มดูโปรไฟล์ */}
                            <button 
                              className="btn btn-sm btn-outline-info"
                              onClick={() => router.push(`/student_problem/${p.student_id}`)}
                              title="ดูโปรไฟล์นักเรียน"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            
                            {/* ปุ่มแก้ไขสถานะ */}
                            <button 
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => router.push(
                                `/student_problem/activity/status?activity_id=${activity._id}&student_id=${p.student_id}&student_name=${encodeURIComponent(p.student_name)}`
                              )}
                              title="จัดการสถานะกิจกรรม"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ข้อมูลระบบ */}
      {(activity.createdAt || activity.updatedAt) && (
        <div className="mt-3 text-muted small text-end">
          {activity.createdAt && <span>สร้าง: {formatDate(activity.createdAt)}</span>}
          {activity.updatedAt && activity.updatedAt !== activity.createdAt && (
            <span className="ms-3">แก้ไขล่าสุด: {formatDate(activity.updatedAt)}</span>
          )}
        </div>
      )}
    </div>
  );
}