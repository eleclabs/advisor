"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProblemPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    problem: "",
    goal: "",
    counseling: false,
    behavioral_contract: false,
    home_visit: false,
    referral: false,
    duration: "",
    responsible: "",
    progress: 0,
    isp_status: "กำลังดำเนินการ"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/problem/${params.id}`);
      const data = await res.json();
      if (data.data) {
        setFormData({
          problem: data.data.problem || "",
          goal: data.data.goal || "",
          counseling: data.data.counseling || false,
          behavioral_contract: data.data.behavioral_contract || false,
          home_visit: data.data.home_visit || false,
          referral: data.data.referral || false,
          duration: data.data.duration || "",
          responsible: data.data.responsible || "",
          progress: data.data.progress || 0,
          isp_status: data.data.isp_status || "กำลังดำเนินการ"
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
      const res = await fetch(`/api/problem/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert("แก้ไขแผนเรียบร้อย");
        router.push(`/problem/${params.id}`);
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
                แก้ไขแผนการช่วยเหลือ
              </h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">ปัญหาที่พบ</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formData.problem}
                    onChange={(e) => setFormData({...formData, problem: e.target.value})}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">เป้าหมาย</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formData.goal}
                    onChange={(e) => setFormData({...formData, goal: e.target.value})}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">วิธีการแก้ไข</label>
                  <div className="border p-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={formData.counseling}
                        onChange={(e) => setFormData({...formData, counseling: e.target.checked})}
                      />
                      <label className="form-check-label">การให้คำปรึกษาเบื้องต้น</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={formData.behavioral_contract}
                        onChange={(e) => setFormData({...formData, behavioral_contract: e.target.checked})}
                      />
                      <label className="form-check-label">กิจกรรมปรับเปลี่ยนพฤติกรรม</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={formData.home_visit}
                        onChange={(e) => setFormData({...formData, home_visit: e.target.checked})}
                      />
                      <label className="form-check-label">การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={formData.referral}
                        onChange={(e) => setFormData({...formData, referral: e.target.checked})}
                      />
                      <label className="form-check-label">การส่งต่อ</label>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">ระยะเวลาดำเนินการ</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">ผู้รับผิดชอบ</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.responsible}
                      onChange={(e) => setFormData({...formData, responsible: e.target.value})}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">ความคืบหน้า (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">สถานะ</label>
                    <select
                      className="form-select"
                      value={formData.isp_status}
                      onChange={(e) => setFormData({...formData, isp_status: e.target.value as any})}
                    >
                      <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                      <option value="สำเร็จ">สำเร็จ</option>
                      <option value="ปรับแผน">ปรับแผน</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Link href={`/problem/${params.id}`} className="btn btn-secondary">
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