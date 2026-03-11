// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2 className="mb-3">กรุณาเข้าสู่ระบบ</h2>
          <Link href="/login" className="btn btn-warning rounded-0">
            ไปหน้า Login
          </Link>
        </div>
      </div>
    );
  }

  const userRole = session.user?.role;

  return (
    <div className="container py-4">
      <h1 className="mb-4">Dashboard</h1>
      
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card bg-primary text-white rounded-0">
            <div className="card-body">
              <h5 className="card-title">ยินดีต้อนรับ</h5>
              <p className="card-text display-6">{session.user?.name}</p>
              <p className="card-text">บทบาท: {userRole}</p>
            </div>
          </div>
        </div>

        {userRole === "ADMIN" && (
          <div className="col-md-4 mb-3">
            <div className="card bg-success text-white rounded-0">
              <div className="card-body">
                <h5 className="card-title">ผู้ใช้ทั้งหมด</h5>
                <p className="card-text display-6">จัดการผู้ใช้</p>
                <Link href="/user" className="btn btn-light rounded-0">
                  ไปจัดการ
                </Link>
              </div>
            </div>
          </div>
        )}

        {(userRole === "ADMIN" || userRole === "TEACHER") && (
          <div className="col-md-4 mb-3">
            <div className="card bg-info text-white rounded-0">
              <div className="card-body">
                <h5 className="card-title">นักเรียน</h5>
                <p className="card-text display-6">จัดการนักเรียน</p>
                <Link href="/student" className="btn btn-light rounded-0">
                  ไปจัดการ
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}