"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function StudentSendPage() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const bootstrapLink = document.createElement("link");
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    bootstrapLink.rel = "stylesheet";
    document.head.appendChild(bootstrapLink);

    const iconLink = document.createElement("link");
    iconLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    iconLink.rel = "stylesheet";
    document.head.appendChild(iconLink);

    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/send');
      const data = await response.json();
      if (data.success) {
        setReferrals(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบข้อมูลการส่งต่อนี้ใช่หรือไม่?')) return;
    
    try {
      await fetch(`/api/send/${id}`, { method: 'DELETE' });
      loadReferrals();
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
                  <i className="bi bi-send me-2 text-warning"></i>
                  ระบบบริหารการส่งต่อ
                </h2>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <button 
                className="btn btn-warning rounded-0 text-uppercase fw-semibold"
                onClick={() => router.push('/student_send/new')}
              >
                <i className="bi bi-plus-circle me-2"></i>
                สร้างการส่งต่อใหม่
              </button>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="border bg-white">
                <div className="p-3 border-bottom bg-dark">
                  <h5 className="text-uppercase fw-semibold m-0 text-white">
                    <i className="bi bi-list me-2 text-warning"></i>
                    รายการส่งต่อทั้งหมด
                  </h5>
                </div>
                <div className="p-3">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : referrals.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-inbox text-muted fs-1"></i>
                      <p className="text-muted mt-3">ไม่พบข้อมูลการส่งต่อ</p>
                      <button 
                        className="btn btn-warning rounded-0"
                        onClick={() => router.push('/student_send/new')}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        สร้างการส่งต่อใหม่
                      </button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>ชื่อนักเรียน</th>
                            <th>ระดับ/ชั้น</th>
                            <th>ประเภท</th>
                            <th>ส่งต่อ</th>
                            <th>สาเหตุ</th>
                            <th>สถานะ</th>
                            <th>วันที่</th>
                            <th>จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referrals.map(ref => (
                            <tr key={ref._id}>
                              <td>{ref.student_name}</td>
                              <td>{ref.student_level}/{ref.student_class} ห้อง {ref.student_number}</td>
                              <td>
                                <span className={`badge bg-${ref.type === 'internal' ? 'info' : 'primary'} rounded-0`}>
                                  {ref.type === 'internal' ? 'ภายใน' : 'ภายนอก'}
                                </span>
                              </td>
                              <td>{ref.target}</td>
                              <td>{ref.reason_category}</td>
                              <td>
                                <span className={`badge bg-${ref.status === 'อยู่ระหว่างดำเนินการ' ? 'warning' : 'success'} rounded-0`}>
                                  {ref.status}
                                </span>
                              </td>
                              <td>{new Date(ref.created_at).toLocaleDateString('th-TH')}</td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-info rounded-0 me-1"
                                  onClick={() => router.push(`/student_send/${ref._id}`)}
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-warning rounded-0 me-1"
                                  onClick={() => router.push(`/student_send/${ref._id}/edit`)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-danger rounded-0"
                                  onClick={() => handleDelete(ref._id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
              <span>ระบบส่งต่อผู้เรียน</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
