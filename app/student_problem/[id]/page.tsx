"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react"; // เพิ่ม import use

// เปลี่ยนการรับ params เป็น Promise แล้วใช้ React.use()
export default function ViewProblemPage({ params }: { params: Promise<{ id: string }> }) {
  // แก้ตรงนี้: ใช้ use() เพื่อunwrap params
  const { id } = use(params);
  
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]); // เปลี่ยนจาก params.id เป็น id

  const fetchData = async () => {
    try {
      // ใช้ id ที่unwrapแล้ว
      const res = await fetch(`/api/problem/${id}`);
      const data = await res.json();
      setProblem(data.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div className="text-center py-5">กำลังโหลด...</div>;

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-10 mx-auto">
          <div className="card">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="bi bi-person me-2"></i>
                รายละเอียดนักเรียน
              </h4>
              <div>
                {/* แก้ตรงนี้: ใช้ id แทน params.id */}
                <Link href={`/problem/${id}/edit`} className="btn btn-warning btn-sm me-2">
                  <i className="bi bi-pencil"></i> แก้ไขแผน
                </Link>
                <Link href={`/problem/${id}/result`} className="btn btn-info btn-sm">
                  <i className="bi bi-bar-chart"></i> ผลประเมิน
                </Link>
              </div>
            </div>
            <div className="card-body">
              {problem ? (
                <>
                  {/* ข้อมูลพื้นฐาน */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <p><strong>รหัสนักเรียน:</strong> {problem.student_id}</p>
                      <p><strong>ชื่อ-สกุล:</strong> {problem.student_name}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>สถานะแผน:</strong> 
                        <span className={`badge bg-${
                          problem.isp_status === 'กำลังดำเนินการ' ? 'warning' : 
                          problem.isp_status === 'สำเร็จ' ? 'success' : 'danger'
                        } ms-2`}>
                          {problem.isp_status}
                        </span>
                      </p>
                      <p><strong>ความคืบหน้า:</strong> {problem.progress}%</p>
                    </div>
                  </div>

                  {/* แผน ISP */}
                  <div className="mb-4">
                    <h5 className="border-bottom pb-2">📋 แผน ISP</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>ปัญหา:</strong> {problem.problem}</p>
                        <p><strong>เป้าหมาย:</strong> {problem.goal}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>ระยะเวลา:</strong> {problem.duration}</p>
                        <p><strong>ผู้รับผิดชอบ:</strong> {problem.responsible}</p>
                      </div>
                    </div>
                    
                    <p><strong>วิธีการแก้ไข:</strong></p>
                    <ul>
                      {problem.counseling && <li>✅ การให้คำปรึกษาเบื้องต้น</li>}
                      {problem.behavioral_contract && <li>✅ กิจกรรมปรับเปลี่ยนพฤติกรรม</li>}
                      {problem.home_visit && <li>✅ การเยี่ยมบ้าน/ปรึกษาผู้ปกครอง</li>}
                      {problem.referral && <li>✅ การส่งต่อ</li>}
                      {!problem.counseling && !problem.behavioral_contract && !problem.home_visit && !problem.referral && 
                        <li className="text-muted">ยังไม่ได้เลือกวิธีการ</li>
                      }
                    </ul>
                  </div>

                  {/* กิจกรรมที่เข้าร่วม */}
                  <div className="mb-4">
                    <h5 className="border-bottom pb-2">🎯 กิจกรรมที่เข้าร่วม</h5>
                    {problem.activities?.filter((a: any) => a.joined).length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>ชื่อกิจกรรม</th>
                              <th>วันที่</th>
                              <th>ระยะเวลา</th>
                            </tr>
                          </thead>
                          <tbody>
                            {problem.activities.filter((a: any) => a.joined).map((act: any, idx: number) => (
                              <tr key={idx}>
                                <td>{act.name}</td>
                                <td>{act.activity_date ? new Date(act.activity_date).toLocaleDateString('th-TH') : '-'}</td>
                                <td>{act.duration} นาที</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted">ยังไม่มีกิจกรรมที่เข้าร่วม</p>
                    )}
                  </div>

                  {/* การประเมิน */}
                  <div>
                    <h5 className="border-bottom pb-2">📊 การประเมินผล</h5>
                    {problem.evaluations && problem.evaluations.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th>ครั้งที่</th>
                              <th>ระดับการเปลี่ยนแปลง</th>
                              <th>ผลสรุป</th>
                              <th>วันที่ประเมิน</th>
                              <th>หมายเหตุ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {problem.evaluations.map((e: any, idx: number) => (
                              <tr key={idx}>
                                <td>{e.evaluation_number}</td>
                                <td>
                                  <span className={`badge bg-${
                                    e.improvement_level === 'ดีขึ้นชัดเจน' ? 'success' :
                                    e.improvement_level === 'เริ่มเห็นการเปลี่ยนแปลง' ? 'warning' : 'danger'
                                  }`}>
                                    {e.improvement_level}
                                  </span>
                                </td>
                                <td>{e.result}</td>
                                <td>{new Date(e.evaluation_date).toLocaleDateString('th-TH')}</td>
                                <td>{e.notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted">ยังไม่มีการประเมิน</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-center text-muted py-4">ไม่พบข้อมูลนักเรียน</p>
              )}
            </div>
            <div className="card-footer">
              {/* แก้ตรงนี้: ใช้ id แทน params.id และเปลี่ยนจาก /problem เป็น /student_problem */}
              <Link href="/student_problem" className="btn btn-secondary">
                <i className="bi bi-arrow-left me-2"></i>กลับ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}