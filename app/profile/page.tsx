'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';

interface UserData {
  _id: string;
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  image: string;
  role: string;
  is_active: boolean;
  homeroom_level: string;
  homeroom_class: string;
  department: string;
  teacher_id: string;
  nickname: string;
  line_id: string;
  last_login: string;
  createdAt: string;
  updatedAt: string;
}

interface AssignedStudent {
  _id: string;
  student_id: {
    _id: string;
    id: string;
    prefix: string;
    first_name: string;
    last_name: string;
    level: string;
    class_group: string;
    class_number: string;
  };
  student_name: string;
  class_number: string;
  assigned_date: string;
  is_active: boolean;
}

interface AssignmentSummary {
  levels: string[];
  class_groups: string[];
  class_numbers: string[];
  total_students: number;
}

// Component ย่อย: แสดงข้อมูลคู่
function InfoItem({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div>
      <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '14px', color: valueColor || '#212529', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [assignedStudents, setAssignedStudents] = useState<AssignedStudent[]>([]);
  const [assignmentSummary, setAssignmentSummary] = useState<AssignmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // โหลดจาก localStorage ก่อน
      const stored = localStorage.getItem('currentUser');
      let currentUser = null;
      
      if (stored) {
        currentUser = JSON.parse(stored);
        setUser(currentUser);
      } else {
        // ถ้าไม่มี ลองดึงจาก API
        const res = await fetch('/api/user/me');
        const data = await res.json();
        if (data.success) {
          currentUser = data.data;
          setUser(currentUser);
          localStorage.setItem('currentUser', JSON.stringify(data.data));
        }
      }

      // ถ้ามีผู้ใช้ ให้ redirect ไปที่หน้า user detail
      if (currentUser && currentUser._id) {
        router.push(`/user/${currentUser._id}`);
        return;
      }

      // ถ้ามีผู้ใช้ ให้ดึงข้อมูลนักเรียนที่รับผิดชอบ
      if (currentUser && currentUser.role === 'TEACHER') {
        try {
          const assignedRes = await fetch(`/api/user/${currentUser._id}/assign-students`);
          
          if (assignedRes.ok) {
            const assignedData = await assignedRes.json();
            if (assignedData.success && assignedData.data) {
              setAssignedStudents(assignedData.data);
              
              // Calculate assignment summary
              const levels = [...new Set(assignedData.data.map((item: AssignedStudent) => item.student_id?.level).filter((level: any) => level) as string[])];
              const classGroups = [...new Set(assignedData.data.map((item: AssignedStudent) => item.student_id?.class_group).filter((group: any) => group) as string[])];
              const classNumbers = [...new Set(assignedData.data.map((item: AssignedStudent) => item.student_id?.class_number).filter((number: any) => number) as string[])];
              
              setAssignmentSummary({
                levels,
                class_groups: classGroups,
                class_numbers: classNumbers,
                total_students: assignedData.data.length
              });
            }
          }
        } catch (error) {
          console.log("No assigned students or error fetching:", error);
        }
      }
      
    } catch (error: any) {
      console.error('Error loading user:', error);
      setError(error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const getRoleBadge = (role: string) => {
    const map: Record<string, { label: string; color: string }> = {
      ADMIN: { label: 'ผู้ดูแลระบบ', color: '#dc3545' },
      TEACHER: { label: 'อาจารย์', color: '#007bff' },
      EXECUTIVE: { label: 'ผู้บริหาร', color: '#6f42c1' },
      COMMITTEE: { label: 'คณะกรรมการ', color: '#28a745' }
    };
    return map[role] || { label: role, color: '#6c757d' };
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return '-';
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
        <div style={{ color: '#6c757d' }}>กำลังโหลด...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
        <div style={{ color: '#dc3545' }}>{error || 'ไม่พบข้อมูลผู้ใช้'}</div>
      </div>
    );
  }
}

