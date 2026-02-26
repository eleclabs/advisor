"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function EditActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const student_id = searchParams.get("student_id");
  const index = searchParams.get("index");
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    duration: 60,
    materials: "",
    step1: "",
    step2: "",
    step3: "",
    ice_breaking: "",
    group_task: "",
    debrief: "",
    joined: false
  });

  useEffect(() => {
    if (student_id && index) {
      fetchActivity();
    }
  }, [student_id, index]);

  const fetchActivity = async () => {
    try {
      const res = await fetch(`/api/problem/activity?student_id=${student_id}&index=${index}`);
      const data = await res.json();
      if (data.data) {
        setFormData({
          name: data.data.name || "",
          duration: data.data.duration || 60,
          materials: data.data.materials || "",
          step1: data.data.step1 || "",
          step2: data.data.step2 || "",
          step3: data.data.step3 || "",
          ice_breaking: data.data.ice_breaking || "",
          group_task: data.data.group_task || "",
          debrief: data.data.debrief || "",
          joined: data.data.joined || false
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/problem/activity?student_id=${student_id}&index=${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert("แก้ไขกิจกรรมเรียบร้อย");
        router.push("/problem/activity");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="text-center py-5">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h4 className="mb-0">
                <i className="bi bi-pencil me-2"></i>
                แก้ไขกิจกรรม
              </h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">ชื่อกิจกรรม</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">เวลา (นาที)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">อุปกรณ์</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.materials}
                      onChange={(e) => setFormData({...formData, materials: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">ขั้นตอน</label>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="ขั้นตอนที่ 1"
                    value={formData.step1}
                    onChange={(e) => setFormData({...formData, step1: e.target.value})}
                  />
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="ขั้นตอนที่ 2"
                    value={formData.step2}
                    onChange={(e) => setFormData({...formData, step2: e.target.value})}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ขั้นตอนที่ 3"
                    value={formData.step3}
                    onChange={(e) => setFormData({...formData, step3: e.target.value})}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">ละลายพฤติกรรม</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.ice_breaking}
                    onChange={(e) => setFormData({...formData, ice_breaking: e.target.value})}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">โจทย์กลุ่ม</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.group_task}
                    onChange={(e) => setFormData({...formData, group_task: e.target.value})}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">ถอดบทเรียน (AAR)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formData.debrief}
                    onChange={(e) => setFormData({...formData, debrief: e.target.value})}
                  />
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={formData.joined}
                      onChange={(e) => setFormData({...formData, joined: e.target.checked})}
                    />
                    <label className="form-check-label fw-bold">
                      นักเรียนเข้าร่วมกิจกรรมนี้แล้ว
                    </label>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Link href="/problem/activity" className="btn btn-secondary">
                    ยกเลิก
                  </Link>
                  <button type="submit" className="btn btn-warning" disabled={loading}>
                    {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}