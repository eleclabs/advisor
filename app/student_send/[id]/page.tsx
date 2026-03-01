"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

interface Referral {
  _id: string;
  student_id: string;
  student_name: string;
  student_level: string;
  student_class: string;
  student_number: string;
  type: "internal" | "external";
  target: string;
  reason_category: string;
  reason_detail: string;
  actions_taken: string;
  status: "อยู่ระหว่างดำเนินการ" | "สิ้นสุดการช่วยเหลือ";
  created_at: string;
}

interface Coordination {
  _id: string;
  referral_id: string;
  date: string;
  agency_name: string;
  contact_person: string;
  channel: "โทรศัพท์" | "พบปะโดยตรง" | "หนังสือราชการ" | "ออนไลน์";
  details: string;
  agreement: string;
  created_at: string;
}

interface FollowUp {
  _id: string;
  referral_id: string;
  status: "อยู่ระหว่างดำเนินการ" | "สิ้นสุดการช่วยเหลือ";
  result: "พฤติกรรมดีขึ้น/ปัญหาคลี่คลาย" | "พฤติกรรมคงเดิม" | "มีภาวะวิกฤตเพิ่มเติม";
  follow_up_1: string;
  follow_up_2: string;
  follow_up_3: string;
  continuous_plan: string;
  collaboration: string[];
  report: string;
  created_at: string;
}

export default function ViewReferralPage() {
  const router = useRouter();
  const params = useParams();
  const [referral, setReferral] = useState<Referral | null>(null);
  const [coordinations, setCoordinations] = useState<Coordination[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapLink = document.createElement("link");
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    bootstrapLink.rel = "stylesheet";
    document.head.appendChild(bootstrapLink);

    const iconLink = document.createElement("link");
    iconLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);

    loadReferral();
  }, []);

  const loadReferral = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/send/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setReferral(data.data.referral);
        setCoordinations(data.data.coordinations || []);
        setFollowUps(data.data.followUps || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('คุณต้องการลบข้อมูลการส่งต่อนี้ใช่หรือไม่?')) return;
    
    try {
      await fetch(`/api/send/${params.id}`, { method: 'DELETE' });
      router.push('/student_send');
    } catch (error) {
      console.error('Error:', error);
    }
  };

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

  if (!referral) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <i className="bi bi-exclamation-triangle text-warning fs-1"></i>
            <p className="mt-3">ไม่พบข้อมูลการส่งต่อ</p>
            <button className="btn btn-warning rounded-0" onClick={() => router.push('/student_send')}>
              ย้อนกลับ
            </button>
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
            <a className="nav-link text-white text-uppercase fw-semibold px-3" href="/student_problem">ป้องกันและแก้ไข</a>
            <a className="nav-link text-white text-uppercase fw-semibold px-3 active" href="/student_send">ส่งต่อ</a>
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
                  รายละเอียดการส่งต่อ
                </h2>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <button 
                className="btn btn-secondary rounded-0 text-uppercase fw-semibold me-2"
                onClick={() => router.push('/student_send')}
              >
                <i className="bi bi-arrow-left me-2"></i>ย้อนกลับ
              </button>
              <button 
                className="btn btn-warning rounded-0 text-uppercase fw-semibold me-2"
                onClick={() => router.push(`/student_send/${referral._id}/edit`)}
              >
                <i className="bi bi-pencil me-2"></i>แก้ไข
              </button>
              <button 
                className="btn btn-info rounded-0 text-uppercase fw-semibold me-2"
                onClick={() => router.push(`/student_send/${referral._id}/coordination`)}
              >
                <i className="bi bi-telephone me-2"></i>บันทึกการประสานงาน
              </button>
              <button 
                className="btn btn-success rounded-0 text-uppercase fw-semibold me-2"
                onClick={() => router.push(`/student_send/${referral._id}/followup`)}
              >
                <i className="bi bi-clipboard-check me-2"></i>บันทึกการติดตามผล
              </button>
              <button 
                className="btn btn-danger rounded-0 text-uppercase fw-semibold"
                onClick={handleDelete}
              >
                <i className="bi bi-trash me-2"></i>ลบ
              </button>
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
                  <p className="mb-2"><strong>รหัสนักเรียน:</strong> {referral.student_id}</p>
                  <p className="mb-2"><strong>ชื่อ:</strong> {referral.student_name}</p>
                  <p className="mb-2"><strong>ระดับ:</strong> {referral.student_level}</p>
                  <p className="mb-0"><strong>ชั้น/เลขที่:</strong> {referral.student_class}/{referral.student_number}</p>
                </div>
              </div>

              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h6 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-info-circle me-2 text-warning"></i>
                    ข้อมูลทั่วไป
                  </h6>
                </div>
                <div className="p-3">
                  <p className="mb-2"><strong>วันที่ส่งต่อ:</strong> {new Date(referral.created_at).toLocaleDateString('th-TH')}</p>
                  <p className="mb-0">
                    <strong>สถานะ:</strong>{' '}
                    <span className={`badge bg-${referral.status === 'อยู่ระหว่างดำเนินการ' ? 'warning' : 'success'} rounded-0`}>
                      {referral.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-8">
              <div className="border bg-white mb-3">
                <div className="p-3 border-bottom bg-dark">
                  <h6 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-send me-2 text-warning"></i>
                    1. แบบฟอร์มการส่งต่อผู้เรียน
                  </h6>
                </div>
                <div className="p-3">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p className="mb-2">
                        <strong>ประเภทการส่งต่อ:</strong>{' '}
                        <span className={`badge bg-${referral.type === 'internal' ? 'info' : 'primary'} rounded-0`}>
                          {referral.type === 'internal' ? 'ภายใน' : 'ภายนอก'}
                        </span>
                      </p>
                      <p className="mb-0"><strong>ส่งต่อ:</strong> {referral.target}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-0"><strong>สาเหตุหลัก:</strong> {referral.reason_category}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6 className="text-uppercase fw-semibold small mb-2">สรุปปัญหา/พฤติกรรมที่พบ</h6>
                    <div className="border rounded p-3 bg-light">
                      <p className="mb-0">{referral.reason_detail}</p>
                    </div>
                  </div>

                  <div>
                    <h6 className="text-uppercase fw-semibold small mb-2">สิ่งที่ครูที่ปรึกษาได้ดำเนินการไปแล้ว</h6>
                    <div className="border rounded p-3 bg-light">
                      <p className="mb-0">{referral.actions_taken}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border bg-white mb-3">
                <div className="p-3 border-bottom bg-dark">
                  <h6 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-telephone me-2 text-warning"></i>
                    2. บันทึกการประสานงานเครือข่าย
                  </h6>
                </div>
                <div className="p-3">
                  {coordinations.length === 0 ? (
                    <div className="text-center py-3">
                      <i className="bi bi-inbox text-muted fs-4"></i>
                      <p className="text-muted mt-2 mb-0">ยังไม่มีบันทึกการประสานงาน</p>
                      <button 
                        className="btn btn-info rounded-0 text-uppercase fw-semibold mt-2"
                        onClick={() => router.push(`/student_send/${referral._id}/coordination`)}
                      >
                        <i className="bi bi-plus-circle me-2"></i>เพิ่มบันทึกการประสานงาน
                      </button>
                    </div>
                  ) : (
                    coordinations.map(coord => (
                      <div key={coord._id} className="border rounded p-3 mb-3 bg-light">
                        <div className="row mb-2">
                          <div className="col-md-6">
                            <strong>วัน/เวลา:</strong> {new Date(coord.date).toLocaleDateString('th-TH')}
                          </div>
                          <div className="col-md-6">
                            <strong>ช่องทาง:</strong> {coord.channel}
                          </div>
                        </div>
                        <p className="mb-2"><strong>หน่วยงาน/บุคคลที่ประสาน:</strong> {coord.agency_name} ({coord.contact_person})</p>
                        <div className="mb-2">
                          <strong>สรุปรายละเอียด:</strong>
                          <div className="border rounded p-2 bg-white mt-1">
                            <p className="mb-0 small">{coord.details}</p>
                          </div>
                        </div>
                        <div>
                          <strong>ข้อตกลง/แนวทางปฏิบัติ:</strong>
                          <div className="border rounded p-2 bg-white mt-1">
                            <p className="mb-0 small">{coord.agreement}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h6 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-clipboard-check me-2 text-warning"></i>
                    3. แบบประเมินและติดตามผลหลังการส่งต่อ
                  </h6>
                </div>
                <div className="p-3">
                  {followUps.length === 0 ? (
                    <div className="text-center py-3">
                      <i className="bi bi-inbox text-muted fs-4"></i>
                      <p className="text-muted mt-2 mb-0">ยังไม่มีบันทึกการติดตามผล</p>
                      <button 
                        className="btn btn-success rounded-0 text-uppercase fw-semibold mt-2"
                        onClick={() => router.push(`/student_send/${referral._id}/followup`)}
                      >
                        <i className="bi bi-plus-circle me-2"></i>เพิ่มบันทึกการติดตามผล
                      </button>
                    </div>
                  ) : (
                    followUps.map(follow => (
                      <div key={follow._id} className="border rounded p-3 bg-light">
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <strong>สถานะ:</strong>{' '}
                            <span className={`badge bg-${follow.status === 'อยู่ระหว่างดำเนินการ' ? 'warning' : 'success'} rounded-0`}>
                              {follow.status}
                            </span>
                          </div>
                          <div className="col-md-6">
                            <strong>ผลการช่วยเหลือ:</strong>{' '}
                            <span className={`badge bg-${follow.result === 'พฤติกรรมดีขึ้น/ปัญหาคลี่คลาย' ? 'success' : follow.result === 'พฤติกรรมคงเดิม' ? 'warning' : 'danger'} rounded-0`}>
                              {follow.result}
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h6 className="text-uppercase fw-semibold small mb-2">การติดตามผลในสถานศึกษา</h6>
                          <div className="row">
                            <div className="col-md-4 mb-2">
                              <strong>ครั้งที่ 1 (7 วัน):</strong>
                              <div className="border rounded p-2 bg-white mt-1">
                                <p className="mb-0 small">{follow.follow_up_1 || '-'}</p>
                              </div>
                            </div>
                            <div className="col-md-4 mb-2">
                              <strong>ครั้งที่ 2 (30 วัน):</strong>
                              <div className="border rounded p-2 bg-white mt-1">
                                <p className="mb-0 small">{follow.follow_up_2 || '-'}</p>
                              </div>
                            </div>
                            <div className="col-md-4 mb-2">
                              <strong>ครั้งที่ 3 (90 วัน):</strong>
                              <div className="border rounded p-2 bg-white mt-1">
                                <p className="mb-0 small">{follow.follow_up_3 || '-'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <strong>แผนการดูแลต่อเนื่อง:</strong>
                          <div className="border rounded p-2 bg-white mt-1">
                            <p className="mb-0 small">{follow.continuous_plan || '-'}</p>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-2">
                            <strong>การมีส่วนร่วม:</strong>
                            <div className="mt-1">
                              {follow.collaboration.length > 0 ? (
                                follow.collaboration.map((item, index) => (
                                  <span key={index} className="badge bg-info rounded-0 me-1">{item}</span>
                                ))
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6 mb-2">
                            <strong>รายงานเพื่อปรับปรุงงาน:</strong>
                            <div className="border rounded p-2 bg-white mt-1">
                              <p className="mb-0 small">{follow.report || '-'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
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
              <span>ระบบส่งต่อผู้เรียน</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
