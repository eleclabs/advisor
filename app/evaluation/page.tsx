'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EvaluationLandingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        let storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
          storedUser = localStorage.getItem('user') || localStorage.getItem('authUser');
        }
        
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
        } else {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          if (token) {
            try {
              const response = await fetch('/api/auth/me');
              if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                  setCurrentUser(data.user);
                  localStorage.setItem('currentUser', JSON.stringify(data.user));
                }
              }
            } catch (error) {
              console.error('Error fetching user:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading current user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCurrentUser();
  }, []);

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', color: '#6c757d' }}>กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#6c757d',
            letterSpacing: '0.5px',
            marginBottom: '8px',
            textTransform: 'uppercase'
          }}>
            ระบบประเมินความพึงพอใจ
          </div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 600,
            color: '#212529',
            margin: '0 0 16px 0',
            letterSpacing: '-0.3px'
          }}>
            ประเมินประสิทธิภาพระบบ
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6c757d',
            lineHeight: 1.6,
            margin: '0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            ร่วมประเมินความพึงพอใจต่อระบบการดูแลช่วยเหลือผู้เรียน
            <br />
            เพื่อการพัฒนาและปรับปรุงระบบให้ดียิ่งขึ้น
          </p>
        </div>

        {/* Action Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Evaluation Form Card */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '12px',
            padding: '32px 24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
          }}
          >
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
              color: '#007bff'
            }}>
              📝
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#212529',
              margin: '0 0 12px 0'
            }}>
              ทำแบบประเมิน
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6c757d',
              lineHeight: 1.5,
              margin: '0 0 24px 0'
            }}>
              แสดงความคิดเห็นและประเมินประสิทธิภาพของระบบ
              <br />
              เพื่อช่วยให้เราพัฒนาระบบให้ดียิ่งขึ้น
            </p>
            <button
              onClick={() => router.push('/evaluation/form')}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                width: '100%'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
              เริ่มทำแบบประเมิน
            </button>
          </div>

          {/* Admin Report Card - Only show for ADMIN */}
          {isAdmin && (
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '12px',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
            }}
            >
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                color: '#28a745'
              }}>
                📊
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#212529',
                margin: '0 0 12px 0'
              }}>
                ดูรายงานผลการประเมิน
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6c757d',
                lineHeight: 1.5,
                margin: '0 0 24px 0'
              }}>
                ดูสถิติและรายงานผลการประเมินทั้งหมด
                <br />
                วิเคราะห์ข้อมูลเพื่อการตัดสินใจ
              </p>
              <button
                onClick={() => router.push('/evaluation/evaluations')}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e7e34'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
              >
                ดูรายงาน
              </button>
            </div>
          )}
        </div>

        {/* User Info */}
        {currentUser && (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '16px 24px',
            fontSize: '14px',
            color: '#6c757d'
          }}>
            แบบประเมินประสิทธิภาพระบบการดูแลช่วยเหลือผู้เรียน • ข้อมูลทั้งหมดถูกเก็บเป็นความลับ
          </div>
        )}

        {/* Back to Home */}
        <div style={{ marginTop: '32px' }}>
          <button
            onClick={() => router.push('/forms')}
            style={{
              backgroundColor: 'transparent',
              color: '#6c757d',
              border: '1px solid #dee2e6',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.borderColor = '#adb5bd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#dee2e6';
            }}
          >
            ← กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
}