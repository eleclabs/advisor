// D:\advisor-main\app\student_problem\activity\view\page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
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

interface StudentProblemData {
  student_id: string;
  activities_status?: Record<string, string>;
  activity_join_dates?: Record<string, string>;
  activity_completed_dates?: Record<string, string>;
  activities?: Array<{
    activity_id: string;
    status: string;
    joined_at?: string;
    completed_at?: string;
    notes?: string;
  }>;
}

function ActivityViewContent() {
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

  const getActivityStatus = (studentId: string) => {
    const studentData = studentsData.get(studentId);
    
    if (studentData?.activities && activity) {
      const activityData = studentData.activities.find(
        (a: any) => String(a.activity_id) === String(activity._id)
      );
      if (activityData?.status) return activityData.status;
    }
    
    const studentDataFull = studentsData.get(studentId);
    if (studentDataFull?.activities_status && activity) {
      const statusFromMap = studentDataFull.activities_status[activity._id];
      if (statusFromMap) return statusFromMap;
    }
    
    const participant = activity?.participants?.find(p => p.student_id === studentId);
    return participant?.joined ? 'เข้าร่วมแล้ว' : 'ยังไม่เข้าร่วม';
  };

  const getJoinDate = (studentId: string) => {
    const studentData = studentsData.get(studentId);
    
    if (studentData?.activities && activity) {
      const activityData = studentData.activities.find(
        (a: any) => String(a.activity_id) === String(activity._id)
      );
      if (activityData?.joined_at) return activityData.joined_at;
    }
    
    const studentDataFull = studentsData.get(studentId);
    if (studentDataFull?.activity_join_dates && activity) {
      const joinDateFromMap = studentDataFull.activity_join_dates[activity._id];
      if (joinDateFromMap) return joinDateFromMap;
    }
    
    const participant = activity?.participants?.find(p => p.student_id === studentId);
    return participant?.joined_at || null;
  };

  const getCompletedDate = (studentId: string) => {
    const studentData = studentsData.get(studentId);
    
    if (studentData?.activities && activity) {
      const activityData = studentData.activities.find(
        (a: any) => String(a.activity_id) === String(activity._id)
      );
      if (activityData?.completed_at) return activityData.completed_at;
    }
    
    const studentDataFull = studentsData.get(studentId);
    if (studentDataFull?.activity_completed_dates && activity) {
      const completedDateFromMap = studentDataFull.activity_completed_dates[activity._id];
      if (completedDateFromMap) return completedDateFromMap;
    }
    
    return null;
  };

  const getNotes = (studentId: string) => {
    const studentData = studentsData.get(studentId);
    
    if (studentData?.activities && activity) {
      const activityData = studentData.activities.find(
        (a: any) => String(a.activity_id) === String(activity._id)
      );
      return activityData?.notes || null;
    }
    
    return null;
  };

  const handleRemoveParticipant = async (studentId: string) => {
    if (!confirm('คุณต้องการลบนักเรียนคนนี้ออกจากกิจกรรมใช่หรือไม่?')) return;
    
    if (!activity) return;
    
    try {
      const response = await fetch(`/api/problem/activity/${activity._id}/remove-participant`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId })
      });
      
      if (response.ok) {
        // Refresh activity data
        window.location.reload();
      } else {
        alert('ลบนักเรียนไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      alert('เกิดข้อผิดพลาดในการลบนักเรียน');
    }
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
          <i className="bi bi-exclamation-triangle text-warning fs-1"></i>
          <p className="mt-3">ไม่พบข้อมูล</p>
          <Link href="/student_problem?tab=activities" className="btn btn-warning rounded-0">
            กลับ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="border-bottom border-3 border-warning pb-2">
                <h2 className="text-uppercase fw-bold m-0">
                  <i className="bi bi-eye me-2 text-warning"></i>
                  ดูรายละเอียดกิจกรรม
                </h2>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <Link href={`/student_problem/activity/edit?id=${activity._id}`} className="btn btn-secondary rounded-0 text-uppercase fw-semibold me-2">
            <i className="bi bi-pencil me-2"></i>แก้ไขกิจกรรม
          </Link>
          <Link href={`/student_problem/activity/status?activity_id=${activity._id}`} className="btn btn-warning rounded-0 text-uppercase fw-semibold me-2">
            <i className="bi bi-clipboard-check me-2"></i>จัดการสถานะ
          </Link>
          <Link href="/student_problem?tab=activities" className="btn btn-dark rounded-0 text-uppercase fw-semibold">
            <i className="bi bi-arrow-left me-2"></i>กลับรายการ
          </Link>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="border bg-white">
            <div className="p-3 border-bottom bg-dark">
              <h5 className="text-uppercase fw-semibold m-0 text-white">
                <i className="bi bi-info-circle me-2 text-warning"></i>
                รายละเอียดกิจกรรม
              </h5>
            </div>
            <div className="p-3">
              <div className="row mb-3">
                <div className="col-md-6">
                  <span className="text-uppercase fw-semibold small text-muted">ชื่อกิจกรรม:</span>
                  <p className="fw-bold mb-0">{activity.name}</p>
                </div>
                <div className="col-md-6">
                  <span className="text-uppercase fw-semibold small text-muted">วันที่จัด:</span>
                  <p className="mb-0">{formatShortDate(activity.activity_date)}</p>
                </div>
              </div>

              {activity.objective && (
                <div className="mb-3">
                  <span className="text-uppercase fw-semibold small text-muted">วัตถุประสงค์:</span>
                  <p>{activity.objective}</p>
                </div>
              )}

              <div className="row mb-3">
                <div className="col-md-6">
                  <span className="text-uppercase fw-semibold small text-muted">ระยะเวลา:</span>
                  <p className="mb-0">{activity.duration} นาที</p>
                </div>
                <div className="col-md-6">
                  <span className="text-uppercase fw-semibold small text-muted">อุปกรณ์:</span>
                  <p className="mb-0">{activity.materials}</p>
                </div>
              </div>

              {activity.duration_period && (
                <div className="mb-3">
                  <span className="text-uppercase fw-semibold small text-muted">ระยะเวลาดำเนินการ / ครั้งที่จัด:</span>
                  <p>{activity.duration_period}</p>
                </div>
              )}

              <div className="mb-3">
                <span className="text-uppercase fw-semibold small text-muted">ขั้นตอน:</span>
                <p>{activity.steps}</p>
              </div>

              <div className="mb-3">
                <span className="text-uppercase fw-semibold small text-muted">ละลายพฤติกรรม:</span>
                <p>{activity.ice_breaking}</p>
              </div>

              <div className="mb-3">
                <span className="text-uppercase fw-semibold small text-muted">โจทย์สาขาวิชา:</span>
                <p>{activity.group_task}</p>
              </div>

              <div className="mb-3">
                <span className="text-uppercase fw-semibold small text-muted">ถอดบทเรียน (AAR):</span>
                <p>{activity.debrief}</p>
              </div>

              <div className="text-muted small">
                <hr className="my-2" />
                <div>
                  {activity.createdAt && <span>สร้าง: {formatDate(activity.createdAt)}</span>}
                  {activity.updatedAt && activity.updatedAt !== activity.createdAt && (
                    <span className="ms-3">แก้ไขล่าสุด: {formatDate(activity.updatedAt)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="border bg-white">
            <div className="p-3 border-bottom bg-dark">
              <h5 className="text-uppercase fw-semibold m-0 text-white">
                <i className="bi bi-people me-2 text-warning"></i>
                ผู้เข้าร่วม ({activity.participants?.length || 0}/{activity.total_participants || 0})
              </h5>
            </div>
            <div className="p-3">
              {activity.participants && activity.participants.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th className="text-uppercase small">รหัส</th>
                        <th className="text-uppercase small">ชื่อ</th>
                        <th className="text-uppercase small">สถานะ</th>
                        <th className="text-uppercase small">วันที่เข้าร่วม</th>
                        <th className="text-uppercase small">วันที่เสร็จสิ้น</th>
                        <th className="text-uppercase small">หมายเหตุ</th>
                        <th className="text-uppercase small">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activity.participants.map((participant) => (
                        <tr key={participant.student_id}>
                          <td>{participant.student_id}</td>
                          <td>{participant.student_name}</td>
                          <td>
                            <span className={`badge bg-${
                              getActivityStatus(participant.student_id) === 'เสร็จสิ้น' ? 'success' : 
                              getActivityStatus(participant.student_id) === 'เข้าร่วมแล้ว' ? 'info' : 
                              'secondary'
                            } rounded-0`}>
                              {getActivityStatus(participant.student_id)}
                            </span>
                          </td>
                          <td>{getJoinDate(participant.student_id) ?? '-'}</td>
                          <td>{getCompletedDate(participant.student_id) ?? '-'}</td>
                          <td>{getNotes(participant.student_id) ?? '-'}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger rounded-0"
                              onClick={() => handleRemoveParticipant(participant.student_id)}
                              title="ลบนักเรียน"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-person-x text-muted fs-1"></i>
                  <p className="text-muted mt-2">ยังไม่มีผู้เข้าร่วม</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewActivityPage() {
  return (
    <Suspense fallback={
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <ActivityViewContent />
    </Suspense>
  );
}
