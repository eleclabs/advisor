"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { withPermission } from "@/app/components/withPermission";

interface Student {
  _id: string;
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  name?: string;
  level: string;
  status: string;
  advisor_name: string;
  class_group: string;
  class_number: string;
  phone_number: string;
  image?: string;
}

interface Major {
  _id: string;
  major_name: string;
}

function StudentListPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [student, setStudent] = useState<Student[]>([]);
  const [filteredStudent, setFilteredStudent] = useState<Student[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedClassGroup, setSelectedClassGroup] = useState("");
  const [selectedClassNumber, setSelectedClassNumber] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedYear, setSelectedYear] = useState("2568");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [majors, setMajors] = useState<Major[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [columnMapping, setColumnMapping] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    nickname: '',
    prefix: '',
    gender: '',
    birthDate: '',
    level: '',
    major: '',
    classRoom: '',
    phone: '',
    address: '',
    religion: '',
    bloodType: '',
    weight: '',
    height: ''
  });
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const itemsPerPage = 50;

  const teacher_name = session?.user?.name || "อาจารย์";
  const academic_year = "2568";
  const userRole = session?.user?.role;

  // ดึงข้อมูล majors
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await fetch('/api/major');
        if (response.ok) {
          const data = await response.json();
          setMajors(data);
        }
      } catch (error) {
        console.error("Error fetching majors:", error);
      }
    };
    
    fetchMajors();
  }, []);

  // Fetch students function for reuse
  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // ✅ ADMIN: เห็นนักเรียนทั้งหมด
      if (userRole === "ADMIN") {
        const response = await fetch("/api/student");
        const result = await response.json();
        
        let studentsData = [];
        if (result.success && Array.isArray(result.data)) {
          studentsData = result.data;
        } else if (Array.isArray(result)) {
          studentsData = result;
        }
        
        const formattedData = studentsData.map((s: any) => ({
          _id: s._id,
          id: s.id || s._id,
          prefix: s.prefix || "",
          first_name: s.first_name || "",
          last_name: s.last_name || "",
          name: s.first_name && s.last_name ? `${s.prefix || ''}${s.first_name} ${s.last_name}` : s.name || "",
          level: s.level || "",
          status: s.status || "ปกติ",
          advisor_name: s.advisor_name || "",
          class_group: s.class_group || "",
          class_number: s.class_number || "",
          phone_number: s.phone_number || "",
          image: s.image || ""
        }));
        
        setStudent(formattedData);
        setFilteredStudent(formattedData);
      }
      
      // TEACHER: เห็นเฉพาะ assigned students
      else if (userRole === "TEACHER" && session?.user?.id) {
        const assignedRes = await fetch(`/api/user/${session.user.id}/assign-students`);
        const assignedData = await assignedRes.json();
        
        if (assignedData.success && assignedData.data.length > 0) {
          const teacherName = session?.user?.name || "อาจารย์";
          const formattedData = assignedData.data.map((item: any) => {
            const s = item.student_id;
            return {
              _id: s._id,
              id: s.id || s._id,
              prefix: s.prefix || "",
              first_name: s.first_name || "",
              last_name: s.last_name || "",
              name: s.first_name && s.last_name ? `${s.prefix || ''}${s.first_name} ${s.last_name}` : s.name || "",
              level: s.level || "",
              status: s.status || "ปกติ",
              advisor_name: teacherName,
              class_group: s.class_group || "",
              class_number: s.class_number || "",
              phone_number: s.phone_number || "",
              image: s.image || ""
            };
          });
          
          setStudent(formattedData);
          setFilteredStudent(formattedData);
        } else {
          setStudent([]);
          setFilteredStudent([]);
        }
      }
      
      // ✅ EXECUTIVE, COMMITTEE: เห็นทั้งหมด
      else {
        const response = await fetch("/api/student");
        const result = await response.json();
        
        let studentsData = [];
        if (result.success && Array.isArray(result.data)) {
          studentsData = result.data;
        } else if (Array.isArray(result)) {
          studentsData = result;
        }
        
        const formattedData = studentsData.map((s: any) => ({
          _id: s._id,
          id: s.id || s._id,
          prefix: s.prefix || "",
          first_name: s.first_name || "",
          last_name: s.last_name || "",
          name: s.first_name && s.last_name ? `${s.prefix || ''}${s.first_name} ${s.last_name}` : s.name || "",
          level: s.level || "",
          status: s.status || "ปกติ",
          advisor_name: s.advisor_name || "",
          class_group: s.class_group || "",
          class_number: s.class_number || "",
          phone_number: s.phone_number || "",
          image: s.image || ""
        }));
        
        setStudent(formattedData);
        setFilteredStudent(formattedData);
      }
      
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchStudents();
    }
  }, [session, userRole]);

  // กรองข้อมูล
  useEffect(() => {
    let filtered = [...student];

    if (searchKeyword) {
      filtered = filtered.filter(
        (s) =>
          (s.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
           s.first_name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
           s.last_name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
           s.id?.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }

    if (selectedLevel) {
      filtered = filtered.filter((s) => s.level === selectedLevel);
    }

    if (selectedClassGroup) {
      filtered = filtered.filter((s) => s.class_group === selectedClassGroup);
    }

    if (selectedClassNumber) {
      filtered = filtered.filter((s) => s.class_number === selectedClassNumber);
    }

    if (selectedStatus) {
      filtered = filtered.filter((s) => s.status === selectedStatus);
    }

    setFilteredStudent(filtered);
    setCurrentPage(1);
  }, [searchKeyword, selectedLevel, selectedClassGroup, selectedClassNumber, selectedStatus, student]);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const response = await fetch(`/api/student/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setStudent(prev => prev.filter(s => s._id !== deleteId));
        setFilteredStudent(prev => prev.filter(s => s._id !== deleteId));
        
        // Force close modal using multiple methods
        const modal = document.getElementById('deleteModal');
        if (modal) {
          // Method 1: Bootstrap instance (with error handling)
          try {
            const bsModal = (window as any).bootstrap?.Modal.getInstance(modal);
            if (bsModal) {
              bsModal.hide();
            }
          } catch (e) {
            console.log('Bootstrap Modal getInstance failed:', e);
          }
          
          // Method 2: Create new instance (with error handling)
          try {
            if ((window as any).bootstrap?.Modal) {
              const newModal = new (window as any).bootstrap.Modal(modal);
              newModal.hide();
            }
          } catch (e) {
            console.log('Bootstrap Modal creation failed:', e);
          }
          
          // Method 3: Direct DOM manipulation
          modal.classList.remove('show');
          modal.style.display = 'none';
          modal.setAttribute('aria-hidden', 'true');
          
          // Method 4: Remove backdrop and restore body
          setTimeout(() => {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
              backdrop.remove();
            }
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
          }, 100);
          
          // Method 5: jQuery-style trigger if available
          try {
            if ((window as any).$ && (window as any).$.fn.modal) {
              (window as any).$('#deleteModal').modal('hide');
            }
          } catch (e) {
            console.log('jQuery modal failed:', e);
          }
        }
        setDeleteId(null);
        alert("ลบข้อมูลนักเรียนเรียบร้อยแล้ว");
      } else {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const totalRecords = filteredStudent.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudent.slice(startIndex, endIndex);

  const getStatusBadgeClass = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'ปกติ': return 'bg-success';
      case 'เสี่ยง': return 'bg-warning text-dark';
      case 'มีปัญหา': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getPageTitle = () => {
    if (userRole === "ADMIN") return "การรู้จักผู้เรียนเป็นรายบุคคล";
    if (userRole === "TEACHER") return "รายชื่อผู้เรียนในความดูแล";
    return "รายชื่อผู้เรียน";
  };

  // ========== Excel Import Functions (FIXED) ==========
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      alert('กรุณาเลือกไฟล์');
      return;
    }
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('ไฟล์ต้องมีนามสกุล .xlsx หรือ .xls เท่านั้น');
      return;
    }
    
    setImportFile(file);
    await readExcelFile(file);
  };

  const readExcelFile = async (file: File) => {
    setPreviewLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/student/import-preview', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        if (result.data && result.data.length > 0) {
          setImportData(result.data);
          
          // Get available columns from first row
          const firstRow = result.data[0];
          const columns = Object.keys(firstRow);
          setAvailableColumns(columns);
          
          // Auto-detect column mapping
          const newMapping = { ...columnMapping };
          
          const columnKeywords = {
            studentId: ['รหัส', 'id', 'รหัสนักศึกษา', 'studentid', 'student_id', 'รหัสประจำตัว'],
            firstName: ['ชื่อ', 'firstname', 'first_name', 'ชื่อจริง', 'ชื่อเล่น'],
            lastName: ['นามสกุล', 'lastname', 'last_name', 'สกุล'],
            nickname: ['เล่น', 'nickname', 'nick', 'ชื่อเล่น'],
            prefix: ['คำนำหน้า', 'prefix', 'คำนำหน้าชื่อ', 'นาย', 'นาง', 'นางสาว'],
            gender: ['เพศ', 'gender', 'sex'],
            birthDate: ['เกิด', 'birth', 'birthdate', 'วันเกิด', 'เกิดวันที่'],
            level: ['ระดับ', 'level', 'ชั้น', 'ระดับชั้น'],
            major: ['สาขา', 'major', 'สาขาวิชา', 'department'],
            classRoom: ['ห้อง', 'class', 'classroom', 'ห้องเรียน', 'หมู่เรียน'],
            phone: ['โทร', 'phone', 'tel', 'โทรศัพท์', 'เบอร์โทร', 'เบอร์มือถือ'],
            address: ['ที่อยู่', 'address', 'บ้านเลขที่'],
            religion: ['ศาสนา', 'religion', 'faith'],
            bloodType: ['กรุ๊ป', 'blood', 'bloodtype', 'กรุ๊ปเลือด'],
            weight: ['น้ำหนัก', 'weight', 'kg', 'กิโลกรัม', 'น้ำหนัก (กก.)'],
            height: ['ส่วนสูง', 'height', 'cm', 'เซนติเมตร', 'ส่วนสูง (ซม.)']
          };
          
          columns.forEach(col => {
            const lowerCol = col.toLowerCase();
            
            for (const [field, keywords] of Object.entries(columnKeywords)) {
              if (keywords.some(keyword => lowerCol.includes(keyword.toLowerCase()))) {
                if (!newMapping[field as keyof typeof columnMapping]) {
                  newMapping[field as keyof typeof columnMapping] = col;
                }
              }
            }
          });
          
          setColumnMapping(newMapping);
          alert(`อ่านไฟล์สำเร็จ พบข้อมูล ${result.data.length} รายการ`);
        } else {
          alert('ไม่พบข้อมูลในไฟล์ Excel');
        }
      } else {
        alert(result.message || 'ไม่สามารถอ่านไฟล์ Excel ได้');
      }
    } catch (error) {
      console.error('Error reading Excel file:', error);
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleMappingChange = (field: string, value: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImportStudents = async () => {
    if (importData.length === 0) {
      alert('ไม่มีข้อมูลที่จะนำเข้า กรุณาเลือกไฟล์ Excel ก่อน');
      return;
    }

    // Check required fields
    if (!columnMapping.studentId) {
      alert('กรุณาเลือกคอลัมน์สำหรับ "รหัสนักศึกษา"');
      return;
    }
    
    if (!columnMapping.firstName) {
      alert('กรุณาเลือกคอลัมน์สำหรับ "ชื่อ"');
      return;
    }
    
    if (!columnMapping.lastName) {
      alert('กรุณาเลือกคอลัมน์สำหรับ "นามสกุล"');
      return;
    }

    setImportLoading(true);
    
    try {
      const response = await fetch('/api/student/batch-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          students: importData,
          mapping: columnMapping
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        let message = `นำเข้าข้อมูลนักเรียนสำเร็จ ${result.insertedCount || result.data?.length || 0} รายการ`;
        if (result.errors && result.errors.length > 0) {
          message += `\nข้อผิดพลาด: ${result.errors.length} รายการ`;
        }
        alert(message);
        
        // Close modal and reset
        setShowImportModal(false);
        setImportFile(null);
        setImportData([]);
        setAvailableColumns([]);
        setColumnMapping({
          studentId: '',
          firstName: '',
          lastName: '',
          nickname: '',
          prefix: '',
          gender: '',
          birthDate: '',
          level: '',
          major: '',
          classRoom: '',
          phone: '',
          address: '',
          religion: '',
          bloodType: '',
          weight: '',
          height: ''
        });
        
        // Refresh data
        await fetchStudents();
        
        // Hide modal using Bootstrap
        const modal = document.getElementById('importModal');
        if (modal) {
          const bsModal = (window as any).bootstrap?.Modal.getInstance(modal);
          if (bsModal) {
            bsModal.hide();
          }
        }
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
      }
    } catch (error) {
      console.error('Error importing students:', error);
      alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="border-bottom border-3 border-warning pb-2 d-flex justify-content-between align-items-center">
            <h2 className="text-uppercase fw-bold m-0">
              <i className="bi bi-people-fill me-2 text-warning"></i>
              {getPageTitle()}
            </h2>
            <div>
              <span className="text-muted me-3">
                {userRole === "TEACHER" ? "ครูที่ปรึกษา: " : ""}{teacher_name}
              </span>
              <span className="badge bg-dark text-white rounded-0">ปีการศึกษา {academic_year}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="input-group">
            <span className="input-group-text bg-white border rounded-0">
              <i className="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              className="form-control rounded-0" 
              placeholder="ค้นหาด้วยชื่อ, รหัสนักศึกษา..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>
        
        <div className="col-md-2">
          <select 
            className="form-select rounded-0"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="">ระดับชั้นทั้งหมด</option>
            <option value="ปวช.1">ปวช.1</option>
            <option value="ปวช.2">ปวช.2</option>
            <option value="ปวช.3">ปวช.3</option>
            <option value="ปวส.1">ปวส.1</option>
            <option value="ปวส.2">ปวส.2</option>
          </select>
        </div>
        
        <div className="col-md-2">
          <select 
            className="form-select rounded-0"
            value={selectedClassGroup}
            onChange={(e) => setSelectedClassGroup(e.target.value)}
          >
            <option value="">สาขาวิชา</option>
            {majors.map((major) => (
              <option key={major._id} value={major.major_name}>
                {major.major_name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="col-md-2">
          <input
            type="text"
            className="form-control rounded-0"
            placeholder="ห้อง เช่น 1, 2, 3"
            value={selectedClassNumber}
            onChange={(e) => setSelectedClassNumber(e.target.value)}
          />
        </div>
        
        <div className="col-md-3">
          {userRole === "TEACHER" && (
            <Link
              href="/student/student_filter"
              className="btn btn-warning rounded-0 w-100 text-uppercase fw-semibold"
            >
              <i className="bi bi-funnel me-2"></i>เลือกนักเรียนในความดูแล
            </Link>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <span className="text-muted">
              แสดง {filteredStudent.length} รายการ 
              {filteredStudent.length > 0 && ` (หน้า ${currentPage} จาก ${totalPages || 1})`}
            </span>
          </div>
          <div>
            {userRole === "TEACHER" && (
              <>
                <Link
                  href="/student/student_add"
                  className="btn btn-success rounded-0 text-uppercase fw-semibold"
                >
                  <i className="bi bi-plus-circle me-2"></i>เพิ่มผู้เรียน
                </Link>
              </>
            )}
            
            {userRole === "ADMIN" && (
              <>
                <button 
                  className="btn btn-outline-dark rounded-0 text-uppercase fw-semibold me-2" 
                  data-bs-toggle="modal" 
                  data-bs-target="#importModal"
                >
                  <i className="bi bi-upload me-2"></i>นำเข้าข้อมูล
                </button>
                <Link
                  href="/student/student_filter"
                  className="btn btn-primary rounded-0 text-uppercase fw-semibold me-2"
                >
                  <i className="bi bi-funnel me-2"></i>เลือกนักเรียน
                </Link>
                <Link
                  href="/student/student_add"
                  className="btn btn-success rounded-0 text-uppercase fw-semibold"
                >
                  <i className="bi bi-plus-circle me-2"></i>เพิ่มผู้เรียน
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="row">
        <div className="col-12">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">กำลังโหลด...</span>
              </div>
            </div>
          ) : student.length === 0 && userRole === "TEACHER" ? (
            <div className="text-center py-5">
              <div className="alert alert-info rounded-0">
                <i className="bi bi-info-circle me-2"></i>
                ยังไม่มีนักเรียนในความดูแล กรุณา{" "}
                <Link href="/student/student_filter" className="alert-link">
                  คลิกที่นี่
                </Link>{" "}
                เพื่อเลือกนักเรียน
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover bg-white">
                <thead className="bg-dark text-white">
                  <tr>
                    <th className="text-center" style={{width: "50px"}}>ลำดับ</th>
                    <th className="text-uppercase fw-semibold">รหัสนักศึกษา</th>
                    <th className="text-uppercase fw-semibold">ชื่อ-นามสกุล</th>
                    <th className="text-uppercase fw-semibold">ระดับชั้น</th>
                    <th className="text-uppercase fw-semibold">สาขาวิชา</th>
                    <th className="text-uppercase fw-semibold">ห้อง</th>
                    <th className="text-uppercase fw-semibold">ครูที่ปรึกษา</th>
                    <th className="text-uppercase fw-semibold text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((student, index) => (
                    <tr key={student._id}>
                      <td className="text-center">{startIndex + index + 1}</td>
                      <td className="fw-semibold">{student.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          {student.image ? (
                            <img
                              src={student.image}
                              alt={student.name}
                              className="rounded-circle me-2"
                              style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2"
                              style={{ width: '30px', height: '30px' }}
                            >
                              <i className="bi bi-person-fill"></i>
                            </div>
                          )}
                          <Link 
                            href={`/student/student_detail/${student._id}`}
                            className="text-decoration-none text-primary"
                          >
                            {student.name}
                          </Link>
                        </div>
                      </td>
                      <td>{student.level}</td>
                      <td>{student.class_group || '-'}</td>
                      <td>{student.class_number || '-'}</td>
                      <td>{student.advisor_name || '-'}</td>
                      <td className="text-center">
                        <div className="btn-group" role="group">
                          <button 
                            className="btn btn-sm btn-outline-primary rounded-0"
                            onClick={() => router.push(`/student/student_detail/${student._id}`)}
                            title="ดูรายละเอียด"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          
                          {(userRole === "ADMIN" || userRole === "TEACHER") && (
                            <button 
                              className="btn btn-sm btn-outline-warning rounded-0"
                              onClick={() => router.push(`/student/student_detail/${student._id}/edit`)}
                              title="แก้ไข"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          )}
                          {(userRole === "ADMIN" || userRole === "TEACHER") && (
                            <button 
                              className="btn btn-sm btn-outline-success rounded-0"
                              onClick={() => router.push(`/student/student_detail/${student._id}/interview`)}
                              title="แบบประเมินผู้ปกครอง"
                            >
                              <i className="bi bi-clipboard-check"></i>
                            </button>
                          )}
                          {userRole === "ADMIN" && (
                            <button 
                              className="btn btn-sm btn-outline-danger rounded-0"
                              title="ลบ"
                              data-bs-toggle="modal"
                              data-bs-target="#deleteModal"
                              onClick={() => setDeleteId(student._id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="row mt-3">
          <div className="col-12 d-flex justify-content-center">
            <nav aria-label="Page navigation">
              <ul className="pagination rounded-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link rounded-0" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    <span aria-hidden="true">&laquo;</span>
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                    <button 
                      className="page-link rounded-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link rounded-0"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    <span aria-hidden="true">&raquo;</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <div className="modal fade" id="deleteModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content rounded-0">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title text-uppercase fw-semibold">
                <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>ยืนยันการลบข้อมูล
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p>คุณต้องการลบข้อมูลผู้เรียนนี้ใช่หรือไม่?</p>
              <p className="text-danger small">การลบข้อมูลนี้จะไม่สามารถกู้คืนได้</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary rounded-0 text-uppercase fw-semibold" data-bs-dismiss="modal">ยกเลิก</button>
              <button type="button" className="btn btn-danger rounded-0 text-uppercase fw-semibold" onClick={handleDelete}>ยืนยันการลบ</button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal - Improved */}
      <div className="modal fade" id="importModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content rounded-0">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title text-uppercase fw-semibold">
                <i className="bi bi-upload text-warning me-2"></i>นำเข้าข้อมูล Excel
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {/* File Upload */}
              <div className="mb-4">
                <label className="form-label text-uppercase fw-semibold small">เลือกไฟล์ Excel</label>
                <input 
                  type="file" 
                  className="form-control rounded-0" 
                  accept=".xlsx,.xls" 
                  onChange={handleFileUpload}
                  disabled={previewLoading}
                />
                <div className="form-text text-muted">
                  ไฟล์ต้องมีนามสกุล .xlsx หรือ .xls
                </div>
              </div>

              {/* Loading Preview */}
              {previewLoading && (
                <div className="text-center py-3">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">กำลังอ่านไฟล์...</span>
                  </div>
                  <p className="mt-2 text-muted">กำลังอ่านไฟล์ Excel...</p>
                </div>
              )}

              {/* Column Mapping */}
              {importData.length > 0 && !previewLoading && (
                <>
                  <div className="alert alert-info rounded-0">
                    <i className="bi bi-info-circle me-2"></i>
                    พบข้อมูลทั้งหมด {importData.length} รายการ
                  </div>
                  
                  <h6 className="fw-semibold mb-3">กำหนดคอลัมน์ข้อมูล</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-danger">รหัสนักศึกษา *</label>
                      <select 
                        className="form-select rounded-0 form-select-sm"
                        value={columnMapping.studentId}
                        onChange={(e) => handleMappingChange('studentId', e.target.value)}
                      >
                        <option value="">-- เลือกคอลัมน์ --</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-danger">ชื่อ *</label>
                      <select 
                        className="form-select rounded-0 form-select-sm"
                        value={columnMapping.firstName}
                        onChange={(e) => handleMappingChange('firstName', e.target.value)}
                      >
                        <option value="">-- เลือกคอลัมน์ --</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-danger">นามสกุล *</label>
                      <select 
                        className="form-select rounded-0 form-select-sm"
                        value={columnMapping.lastName}
                        onChange={(e) => handleMappingChange('lastName', e.target.value)}
                      >
                        <option value="">-- เลือกคอลัมน์ --</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">ชื่อเล่น</label>
                      <select 
                        className="form-select rounded-0 form-select-sm"
                        value={columnMapping.nickname}
                        onChange={(e) => handleMappingChange('nickname', e.target.value)}
                      >
                        <option value="">-- เลือกคอลัมน์ --</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">คำนำหน้า</label>
                      <select 
                        className="form-select rounded-0 form-select-sm"
                        value={columnMapping.prefix}
                        onChange={(e) => handleMappingChange('prefix', e.target.value)}
                      >
                        <option value="">-- เลือกคอลัมน์ --</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">เพศ</label>
                      <select 
                        className="form-select rounded-0 form-select-sm"
                        value={columnMapping.gender}
                        onChange={(e) => handleMappingChange('gender', e.target.value)}
                      >
                        <option value="">-- เลือกคอลัมน์ --</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">วันเกิด</label>
                      <select 
                        className="form-select rounded-0 form-select-sm"
                        value={columnMapping.birthDate}
                        onChange={(e) => handleMappingChange('birthDate', e.target.value)}
                      >
                        <option value="">-- เลือกคอลัมน์ --</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">ระดับชั้น</label>
                      <select 
                        className="form-select rounded-0 form-select-sm"
                        value={columnMapping.level}
                        onChange={(e) => handleMappingChange('level', e.target.value)}
                      >
                        <option value="">-- เลือกคอลัมน์ --</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">ห้องเรียน</label>
                      <select 
                        className="form-select rounded-0 form-select-sm"
                        value={columnMapping.classRoom}
                        onChange={(e) => handleMappingChange('classRoom', e.target.value)}
                      >
                        <option value="">-- เลือกคอลัมน์ --</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">เบอร์โทรศัพท์</label>
                      <select 
                        className="form-select rounded-0 form-select-sm"
                        value={columnMapping.phone}
                        onChange={(e) => handleMappingChange('phone', e.target.value)}
                      >
                        <option value="">-- เลือกคอลัมน์ --</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">ที่อยู่</label>
                      <select 
                        className="form-select rounded-0 form-select-sm"
                        value={columnMapping.address}
                        onChange={(e) => handleMappingChange('address', e.target.value)}
                      >
                        <option value="">-- เลือกคอลัมน์ --</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">ศาสนา</label>
                      <select 
                        className="form-select rounded-0 form-select-sm"
                        value={columnMapping.religion}
                        onChange={(e) => handleMappingChange('religion', e.target.value)}
                      >
                        <option value="">-- เลือกคอลัมน์ --</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">หมู่เลือด</label>
                      <select 
                        className="form-select rounded-0 form-select-sm"
                        value={columnMapping.bloodType}
                        onChange={(e) => handleMappingChange('bloodType', e.target.value)}
                      >
                        <option value="">-- เลือกคอลัมน์ --</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">น้ำหนัก (กก.)</label>
                      <select 
                        className="form-select rounded-0 form-select-sm"
                        value={columnMapping.weight}
                        onChange={(e) => handleMappingChange('weight', e.target.value)}
                      >
                        <option value="">-- เลือกคอลัมน์ --</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">ส่วนสูง (ซม.)</label>
                      <select 
                        className="form-select rounded-0 form-select-sm"
                        value={columnMapping.height}
                        onChange={(e) => handleMappingChange('height', e.target.value)}
                      >
                        <option value="">-- เลือกคอลัมน์ --</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">สาขาวิชา</label>
                      <select 
                        className="form-select rounded-0 form-select-sm"
                        value={columnMapping.major}
                        onChange={(e) => handleMappingChange('major', e.target.value)}
                      >
                        <option value="">-- เลือกคอลัมน์ --</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Preview Data */}
                  <div className="mt-4">
                    <h6 className="fw-semibold mb-2">ตัวอย่างข้อมูล</h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead className="table-light">
                          <tr>
                            {Object.keys(importData[0] || {}).slice(0, 5).map(col => (
                              <th key={col} className="small">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {importData.slice(0, 3).map((row, idx) => (
                            <tr key={idx}>
                              {Object.values(row).slice(0, 5).map((val: any, i) => (
                                <td key={i} className="small">{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary rounded-0 text-uppercase fw-semibold" data-bs-dismiss="modal">ยกเลิก</button>
              <button 
                type="button" 
                className="btn btn-warning rounded-0 text-uppercase fw-semibold"
                onClick={handleImportStudents}
                disabled={importData.length === 0 || importLoading || !columnMapping.studentId || !columnMapping.firstName || !columnMapping.lastName}
              >
                {importLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    กำลังนำเข้า...
                  </>
                ) : (
                  <>
                    <i className="bi bi-upload me-2"></i>
                    นำเข้าข้อมูล ({importData.length} รายการ)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withPermission(StudentListPage, "STUDENT_VIEW");