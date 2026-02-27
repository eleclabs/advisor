"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

/* ================= TYPES ================= */
interface StudentData {
  _id: string;              // Mongo ObjectId
  student_id: string;       // รหัสนักเรียนจริง
  student_name: string;
  activities?: Array<{
    activity_id: string;
    status: string;
    joined_at?: string;
    completed_at?: string;
    notes?: string;
  }>;
}

interface ActivityData {
  _id: string;
  name: string;
  activity_date: string;
}

/* ================= PAGE ================= */
export default function ActivityStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ⚠️ student_id จาก URL = Mongo _id เท่านั้น
  const activity_id = searchParams.get("activity_id");
  const student_object_id = searchParams.get("student_id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);

  const [formData, setFormData] = useState({
    status: "ยังไม่เข้าร่วม",
    joined_at: "",
    completed_at: "",
    notes: ""
  });

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (!activity_id || !student_object_id) {
      router.push("/student_problem?tab=activities");
      return;
    }
    fetchData();
  }, [activity_id, student_object_id]);

  /* ================= FETCH ================= */
  const fetchData = async () => {
    try {
      setLoading(true);

      const [activityRes, studentRes] = await Promise.all([
        fetch(`/api/problem/activity?id=${activity_id}`),
        fetch(`/api/problem/${student_object_id}`) // ✅ ใช้ Mongo _id
      ]);

      const activityJson = await activityRes.json();
      const studentJson = await studentRes.json();

      if (!activityJson.success || !studentJson.success) {
        alert("ไม่พบข้อมูล");
        router.push("/student_problem?tab=activities");
        return;
      }

      setActivity(activityJson.data);
      setStudent(studentJson.data);
      loadExistingStatus(studentJson.data, activityJson.data);

    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD STATUS ================= */
  const loadExistingStatus = (studentData: StudentData, activityData: ActivityData) => {
    const found = studentData.activities?.find(
      (a) => String(a.activity_id) === String(activityData._id)
    );

    if (!found) return;

    setFormData({
      status: found.status || "ยังไม่เข้าร่วม",
      joined_at: found.joined_at
        ? new Date(found.joined_at).toISOString().split("T")[0]
        : "",
      completed_at: found.completed_at
        ? new Date(found.completed_at).toISOString().split("T")[0]
        : "",
      notes: found.notes || ""
    });
  };

  /* ================= SUBMIT ================= */
 /* ================= SUBMIT (แก้ไขให้ส่ง ID ครบ) ================= */
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // 🔍 Check ก่อนส่งว่ามีข้อมูลครบไหม
  if (!student || !activity) {
    alert("ข้อมูลนักเรียนหรือกิจกรรมไม่โหลด");
    return;
  }

  setSaving(true);
  try {
    const payload = {
      // 🚩 ต้องส่งค่าเหล่านี้ให้ตรงกับที่ API (route.ts) รอรับ
      student_id: student.student_id, // รหัส "ก" หรือ "55"
      activity_id: activity._id,      // Mongo _id ของกิจกรรม
      status: formData.status,
      notes: formData.notes,
      joined_at: formData.joined_at || undefined,
      completed_at: formData.completed_at || undefined
    };

    console.log("📤 กำลังส่ง Payload:", payload); // เอาไว้ดูใน Console ว่า ID มาไหม

    const res = await fetch("/api/problem/update-activity-status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึก");
    }

    alert("บันทึกสถานะเรียบร้อย");
    router.refresh(); 
    router.push(`/student_problem/activity/view?id=${activity._id}`);

  } catch (err: any) {
    console.error("❌ Submit Error:", err);
    alert(`บันทึกไม่สำเร็จ: ${err.message}`);
  } finally {
    setSaving(false);
  }
};


  /* ================= RENDER ================= */
  if (loading) {
    return <div className="container py-5 text-center">กำลังโหลด...</div>;
  }

  if (!student || !activity) {
    return (
      <div className="container py-5 text-center">
        <h4>ไม่พบข้อมูล</h4>
        <Link href="/student_problem?tab=activities" className="btn btn-warning mt-3">
          กลับ
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header bg-dark text-white">
          <h4 className="mb-0">จัดการสถานะกิจกรรม</h4>
        </div>

        <div className="card-body">
          <p><b>กิจกรรม:</b> {activity.name}</p>
          <p><b>นักเรียน:</b> {student.student_name} ({student.student_id})</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">สถานะ</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                
                <option value="ยังไม่เข้าร่วม">ยังไม่เข้าร่วม</option>
                <option value="เข้าร่วมแล้ว">เข้าร่วมแล้ว</option>
                <option value="เสร็จสิ้น">เสร็จสิ้น</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">วันที่เข้าร่วม</label>
              <input
                type="date"
                className="form-control"
                value={formData.joined_at}
                onChange={(e) => setFormData({ ...formData, joined_at: e.target.value })}
              />
            </div>

            {formData.status === "เสร็จสิ้น" && (
              <div className="mb-3">
                <label className="form-label">วันที่เสร็จสิ้น</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.completed_at}
                  onChange={(e) => setFormData({ ...formData, completed_at: e.target.value })}
                />
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">หมายเหตุ</label>
              <textarea
                className="form-control"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Link
                href={`/student_problem/activity/view?id=${activity._id}`}
                className="btn btn-secondary"
              >
                ยกเลิก
              </Link>
              <button type="submit" className="btn btn-warning" disabled={saving}>
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}