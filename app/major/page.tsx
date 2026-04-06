"use client";

import { useState, useEffect } from "react";

interface Major {
  _id: string;
  major_id: number;
  major_name: string;
}

export default function MajorPage() {
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState<Major | null>(null);
  const [formData, setFormData] = useState({
    major_name: ""
  });

  useEffect(() => {
    fetchMajors();
  }, []);

  const fetchMajors = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/major");
      if (response.ok) {
        const data = await response.json();
        setMajors(data);
      }
    } catch (err) {
      console.error("Error fetching majors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.major_name.trim()) return;
    
    try {
      const response = await fetch("/api/major", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          major_name: formData.major_name
        })
      });
      
      if (response.ok) {
        await fetchMajors();
        setFormData({ major_name: "" });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error("Error adding major:", err);
    }
  };

  const handleEdit = async () => {
    if (!editData || !formData.major_name.trim()) return;
    
    try {
      const response = await fetch("/api/major", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editData._id,
          major_name: formData.major_name
        })
      });
      
      if (response.ok) {
        await fetchMajors();
        setFormData({ major_name: "" });
        setShowEditForm(false);
        setEditData(null);
      }
    } catch (err) {
      console.error("Error updating major:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบสาขาวิชานี้ใช่หรือไม่?")) return;
    
    try {
      const response = await fetch(`/api/major?id=${id}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        await fetchMajors();
      }
    } catch (err) {
      console.error("Error deleting major:", err);
    }
  };

  const openEditForm = (major: Major) => {
    setEditData(major);
    setFormData({ major_name: major.major_name });
    setShowEditForm(true);
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="fw-bold">สาขา ({majors.length})</span> 
        <button 
          className="btn btn-sm btn-outline-success"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <i className="bi bi-plus-circle me-1"></i>
          เพิ่ม
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="card mb-3">
          <div className="card-body p-3">
            <div className="row g-2">
              <div className="col-md-10">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="ชื่อสาขา"    
                  value={formData.major_name}
                  onChange={(e) => setFormData({...formData, major_name: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                />
              </div>
              <div className="col-md-2">
                <div className="btn-group w-100" role="group">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={handleAdd}
                  >
                    บันทึก
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({ major_name: "" });
                    }}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Major list with ID column */}
      <div className="card">
        <div className="card-body p-0">
          {majors.length === 0 ? (
            <div className="text-center p-4 text-muted">
              <small>ยังไม่มีข้อมูลสาขาวิชา</small>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {majors.map((major) => (
                <div key={major._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-primary me-3" style={{ minWidth: '40px', textAlign: 'center' }}>
                      {major.major_id}
                    </span>
                    <span>{major.major_name}</span>
                  </div>
                  <div className="btn-group btn-group-sm" role="group">
                    <button 
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => openEditForm(major)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(major._id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit form */}
      {showEditForm && (
        <div className="card mt-3">
          <div className="card-body p-3">
            <div className="row g-2">
              <div className="col-md-10">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="ชื่อสาขา"
                  value={formData.major_name}
                  onChange={(e) => setFormData({...formData, major_name: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
                />
              </div>
              <div className="col-md-2">
                <div className="btn-group w-100" role="group">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={handleEdit}
                  >
                    บันทึก
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditData(null);
                      setFormData({ major_name: "" });
                    }}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}