"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function ActivityStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activity_id = searchParams.get("activity_id");
  const student_id = searchParams.get("student_id");
  const student_name = searchParams.get("student_name");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);

  const [formData, setFormData] = useState({
    status: "ยังไม่เข้าร่วม",
    joined_at: "",
    completed_at: "",
    notes: ""
  });

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
      console.log("🔍 studentJson.data keys:", Object.keys(studentJson.data));
      console.log("🔍 activities_status:", studentJson.data.activities_status);
      console.log("🔍 activity_join_dates:", studentJson.data.activity_join_dates);
      console.log("🔍 activity_notes:", studentJson.data.activity_notes);

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
      console.log("🔍 Looking for activity_id:", activityJson.data._id);

      // 🔥 แก้ไข: ค้นหาทั้งแบบ activity_id เป็น object และ string
      const matchingActivities = studentActivities.filter((a: any) => {
        // ถ้า activity_id เป็น object (มี _id)
        if (a.activity_id && typeof a.activity_id === 'object' && a.activity_id._id) {
          return String(a.activity_id._id) === String(activityJson.data._id);
        }
        // ถ้า activity_id เป็น string
        return String(a.activity_id) === String(activityJson.data._id);
      });

      console.log("🔍 Matching activities:", matchingActivities);

      // 🔥 แก้ไข: เลือกอันที่มีข้อมูลครบที่สุด (joined_at และ completed_at)
      let found = null;
      if (matchingActivities.length > 0) {
        // ลองหาอันที่มี joined_at และ completed_at ก่อน
        found = matchingActivities.find((a: any) => a.joined_at && a.completed_at) || 
                matchingActivities.find((a: any) => a.joined_at) ||
                matchingActivities[0];
      }

      console.log("🎯 Selected activity data:", found);

      if (found) {
        // กรณีเจอใน activities array
        setFormData({
          status: found.status || "ยังไม่เข้าร่วม",
          joined_at: found.joined_at ? new Date(found.joined_at).toISOString().split("T")[0] : "",
          // ถ้าสถานะเป็น "เสร็จสิ้น" แต่ไม่มี completed_at ให้ใช้วันที่เดียวกับ joined_at
          completed_at: found.completed_at 
            ? new Date(found.completed_at).toISOString().split("T")[0] 
            : (found.status === "เสร็จสิ้น" && found.joined_at 
                ? new Date(found.joined_at).toISOString().split("T")[0] 
                : ""),
          notes: found.notes || ""
        });
      } else {
        // ถ้าไม่เจอใน activities array ให้ลองค้นจาก activities_status map
        const statusFromMap = studentJson.data.activities_status?.[activityJson.data._id];
        const joinDateFromMap = studentJson.data.activity_join_dates?.[activityJson.data._id];
        const notesFromMap = studentJson.data.activity_notes?.[activityJson.data._id];
        
        // ค้นหาใน activities array อีกครั้งเผื่อมีข้อมูลบางส่วน (โดยเฉพาะ completed_at)
        const activityFromArray = matchingActivities[0]; // ใช้อันแรกที่เจอ
        
        if (statusFromMap) {
          console.log("📝 Notes from map:", notesFromMap);
          console.log("📝 Notes from array:", activityFromArray?.notes);
          
          setFormData({
            status: statusFromMap,
            joined_at: joinDateFromMap ? new Date(joinDateFromMap).toISOString().split("T")[0] : "",
            // ถ้ามี completed_at ใน activities array ให้ดึงมาใช้
            // หรือถ้าสถานะเป็น "เสร็จสิ้น" และมี joined_at ให้ใช้วันที่เดียวกัน
            completed_at: activityFromArray?.completed_at 
              ? new Date(activityFromArray.completed_at).toISOString().split("T")[0] 
              : (statusFromMap === "เสร็จสิ้น" && joinDateFromMap
                  ? new Date(joinDateFromMap).toISOString().split("T")[0]
                  : ""),
            notes: activityFromArray?.notes || notesFromMap || ""
          });
        } else {
          setFormData({
            status: "ยังไม่เข้าร่วม",
            joined_at: "",
            completed_at: "",
            notes: ""
          });
        }
      }

      // เพิ่ม debug log เพื่อดูค่าที่ตั้ง
      console.log("📝 FormData ที่ตั้งค่า:", {
        status: formData.status,
        joined_at: formData.joined_at,
        completed_at: formData.completed_at,
        notes: formData.notes
      });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!student || !activity) {
      alert("ข้อมูลนักเรียนหรือกิจกรรมไม่โหลด");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        student_id: student.student_id,
        activity_id: activity._id,
        status: formData.status,
        notes: formData.notes,
        joined_at: formData.joined_at || undefined,
        // ถ้า status เป็น "เสร็จสิ้น" แต่ไม่มี completed_at ให้ใช้ joined_at แทน
        completed_at: formData.status === "เสร็จสิ้น" 
          ? (formData.completed_at || formData.joined_at || undefined)
          : undefined
      };

      console.log("📤 Submitting payload:", payload);

      const res = await fetch("/api/problem/update-activity-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("📥 Submit response:", data);
      
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึก");
      }

      alert("บันทึกสถานะเรียบร้อย");
      
      router.push(`/student_problem/activity/view?id=${activity._id}`);
      router.refresh();

    } catch (err: any) {
      console.error("❌ Submit Error:", err);
      alert(`บันทึกไม่สำเร็จ: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

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
          <p><b>นักเรียน:</b> {student_name || student.student_name} ({student.student_id})</p>

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