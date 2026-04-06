"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function ActivityStatusViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activity_id = searchParams.get("activity_id");
  const student_id = searchParams.get("student_id");
  const student_name = searchParams.get("student_name");

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [activityData, setActivityData] = useState<any>(null);

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

  // ฟังก์ชัน fetch ข้อมูล
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Starting fetch for:", { activity_id, student_id });

      const [activityRes, studentRes] = await Promise.all([
        fetch(`/api/problem/activity?id=${activity_id}`),
        fetch(`/api/problem/${student_id}`)
      ]);

      const activityJson = await activityRes.json();
      const studentJson = await studentRes.json();

      console.log("📥 API Responses:", { activityJson, studentJson });

      if (!activityJson.success || !studentJson.success) {
        console.error("❌ API Error:", { activityJson, studentJson });
        alert("ไม่พบข้อมูล");
        router.push("/student_problem?tab=activities");
        return;
      }

      setActivity(activityJson.data);
      setStudent(studentJson.data);

      // ค้นหาข้อมูลกิจกรรมในนักเรียน
      const studentActivities = studentJson.data.activities || [];
      console.log("🔍 Student activities:", studentActivities);

      // ค้นหาทั้งแบบ activity_id เป็น object และ string
      const matchingActivities = studentActivities.filter((a: any) => {
        // ถ้า activity_id เป็น object (มี _id)
        if (a.activity_id && typeof a.activity_id === 'object' && a.activity_id._id) {
          return String(a.activity_id._id) === String(activityJson.data._id);
        }
        // ถ้า activity_id เป็น string
        return String(a.activity_id) === String(activityJson.data._id);
      });

      console.log("🔍 Matching activities:", matchingActivities);

      // เลือกอันที่มีข้อมูลครบที่สุด
      let found = null;
      if (matchingActivities.length > 0) {
        found = matchingActivities.find((a: any) => a.joined_at && a.completed_at) || 
                matchingActivities.find((a: any) => a.joined_at) ||
                matchingActivities[0];
      }

      console.log("🎯 Selected activity data:", found);

      if (found) {
        setActivityData(found);
      } else {
        // ถ้าไม่เจอใน activities array ให้ลองค้นจาก activities_status map
        const statusFromMap = studentJson.data.activities_status?.[activityJson.data._id];
        const joinDateFromMap = studentJson.data.activity_join_dates?.[activityJson.data._id];
        const notesFromMap = studentJson.data.activity_notes?.[activityJson.data._id];
        
        const activityFromArray = matchingActivities[0];
        
        if (statusFromMap) {
          setActivityData({
            status: statusFromMap,
            joined_at: joinDateFromMap,
            completed_at: activityFromArray?.completed_at || null,
            notes: activityFromArray?.notes || notesFromMap || ""
          });
        } else {
          setActivityData({
            status: "ยังไม่เข้าร่วม",
            joined_at: null,
            completed_at: null,
            notes: ""
          });
        }
      }

    } catch (err) {
      console.error("❌ Fetch Error:", err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activity_id || !student_id) {
      console.log("❌ Missing IDs, redirecting...");
      router.push("/student_problem?tab=activities");
      return;
    }
    fetchData();
  }, [activity_id, student_id]);

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!student || !activity) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <i className="bi bi-exclamation-triangle text-warning fs-1"></i>
            <p className="mt-3">ไม่พบข้อมูล</p>
            <Link href="/student_problem?tab=activities" className="btn btn-warning rounded-0">
              กลับ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-2 border-warning">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-uppercase" href="#">
            <i className="bi bi-mortarboard-fill me-2 text-warning"></i>
            <span className="text-warning">ระบบดูแลผู้เรียนรายบุคคล</span>
          </a>
          <div className="navbar-nav ms-auto">
            <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/student">รายชื่อผู้เรียน</a>
            <a className="nav-link text-white text-uppercase fw-semibold px-3 active" href="/student_problem">ป้องกันและแก้ไข</a>
            <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/student_send">ส่งต่อ</a>
          </div>
        </div>
      </nav>

      <div className="flex-grow-1">
        <div className="container-fluid py-4">
          <div className="row mb-4">
            <div className="col-12">
              <div className="border-bottom border-3 border-warning pb-2">
                <h2 className="text-uppercase fw-bold m-0">
                  <i className="bi bi-eye me-2 text-warning"></i>
                  ดูสถานะกิจกรรม
                </h2>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <Link href={`/student_problem/activity/view?id=${activity._id}`} className="btn btn-secondary rounded-0 text-uppercase fw-semibold me-2">
                <i className="bi bi-arrow-left me-2"></i>ย้อนกลับ
              </Link>
              <Link href={`/student_problem/activity/status?activity_id=${activity._id}&student_id=${student.student_id}&student_name=${student.student_name}`} className="btn btn-warning rounded-0 text-uppercase fw-semibold me-2">
                <i className="bi bi-pencil me-2"></i>แก้ไขสถานะ
              </Link>
              <Link href={`/student_problem/${student.student_id}`} className="btn btn-info rounded-0 text-uppercase fw-semibold">
                <i className="bi bi-person-circle me-2"></i>โปรไฟล์นักเรียน
              </Link>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="border bg-white mb-3">
                <div className="p-3 border-bottom bg-dark">
                  <h6 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-person me-2 text-warning"></i>
                    ข้อมูลนักเรียน
                  </h6>
                </div>
                <div className="p-3">
                  <p className="mb-2"><strong>รหัสนักเรียน:</strong> {student.student_id}</p>
                  <p className="mb-2"><strong>ชื่อ:</strong> {student.student_name}</p>
                  <p className="mb-2"><strong>ระดับ:</strong> {student.level}</p>
                  <p className="mb-0"><strong>ชั้น/ห้อง:</strong> {student.class_group}/{student.class_number}</p>
                </div>
              </div>

              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h6 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-info-circle me-2 text-warning"></i>
                    ข้อมูลกิจกรรม
                  </h6>
                </div>
                <div className="p-3">
                  <p className="mb-2"><strong>ชื่อกิจกรรม:</strong> {activity.name}</p>
                  <p className="mb-2"><strong>ประเภท:</strong> {activity.type}</p>
                  <p className="mb-0"><strong>วันที่จัด:</strong> {new Date(activity.date).toLocaleDateString('th-TH')}</p>
                </div>
              </div>
            </div>

            <div className="col-md-8">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h6 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-clipboard-check me-2 text-warning"></i>
                    สถานะการเข้าร่วมกิจกรรม
                  </h6>
                </div>
                <div className="p-3">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p className="mb-2">
                        <strong>สถานะ:</strong>{' '}
                        <span className={`badge bg-${
                          activityData?.status === 'เสร็จสิ้น' ? 'success' : 
                          activityData?.status === 'เข้าร่วมแล้ว' ? 'info' : 
                          'secondary'
                        } rounded-0`}>
                          {activityData?.status || 'ยังไม่เข้าร่วม'}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-2">
                        <strong>วันที่เข้าร่วม:</strong>{' '}
                        {activityData?.joined_at ? new Date(activityData.joined_at).toLocaleDateString('th-TH') : '-'}
                      </p>
                    </div>
                  </div>

                  {activityData?.status === 'เสร็จสิ้น' && (
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <p className="mb-2">
                          <strong>วันที่เสร็จสิ้น:</strong>{' '}
                          {activityData?.completed_at ? new Date(activityData.completed_at).toLocaleDateString('th-TH') : '-'}
                        </p>
                      </div>
                    </div>
                  )}

                  {activityData?.notes && (
                    <div className="mb-3">
                      <h6 className="text-uppercase fw-semibold small mb-2">หมายเหตุ</h6>
                      <div className="border rounded p-3 bg-light">
                        <p className="mb-0">{activityData.notes}</p>
                      </div>
                    </div>
                  )}

                  {!activityData || activityData.status === 'ยังไม่เข้าร่วม' ? (
                    <div className="alert alert-warning rounded-0" role="alert">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      นักเรียนยังไม่ได้เข้าร่วมกิจกรรมนี้
                    </div>
                  ) : (
                    <div className="alert alert-success rounded-0" role="alert">
                      <i className="bi bi-check-circle me-2"></i>
                      นักเรียน{activityData.status === 'เสร็จสิ้น' ? 'ได้เข้าร่วมและเสร็จสิ้นกิจกรรมนี้แล้ว' : 'ได้เข้าร่วมกิจกรรมนี้แล้ว'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-dark text-white py-3 border-top border-warning">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 text-uppercase small">
              <i className="bi bi-c-circle me-1"></i> 2568 ระบบดูแลผู้เรียนรายบุคคล
            </div>
            <div className="col-md-6 text-end text-uppercase small">
              <span className="me-3">เวอร์ชัน 2.0.0</span>
              <span>ระบบป้องกันและแก้ไขปัญหาผู้เรียน</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
