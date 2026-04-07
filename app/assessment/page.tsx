'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';

// ========== Component ย่อย ==========
const InputField = ({
  label,
  name,
  value,
  onChange,
  required = true,
  disabled = false
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      marginBottom: '16px',
      padding: '20px 24px'
    }}>
      <label style={{
        fontSize: '14px',
        marginBottom: '12px',
        fontWeight: 500,
        color: '#212529',
        display: 'block'
      }}>
        {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
      </label>
      <input
        type={name === 'age' || name === 'studentId' ? 'text' : 'text'}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '100%',
          maxWidth: '320px',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '14px',
          color: disabled ? '#6c757d' : '#212529',
          outline: 'none',
          transition: 'border-color 0.15s ease',
          backgroundColor: disabled ? '#e9ecef' : '#fff'
        }}
        placeholder="กรอกข้อมูล"
        required={required}
        onFocus={(e) => e.currentTarget.style.borderColor = '#2c3e50'}
        onBlur={(e) => e.currentTarget.style.borderColor = '#ced4da'}
      />
    </div>
  );
};

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  required = true
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      marginBottom: '16px',
      padding: '20px 24px'
    }}>
      <label style={{
        fontSize: '14px',
        marginBottom: '12px',
        fontWeight: 500,
        color: '#212529',
        display: 'block'
      }}>
        {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: '100%',
          maxWidth: '320px',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '14px',
          color: '#212529',
          outline: 'none',
          transition: 'border-color 0.15s ease',
          backgroundColor: '#fff',
          cursor: 'pointer'
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = '#2c3e50'}
        onBlur={(e) => e.currentTarget.style.borderColor = '#ced4da'}
      >
        <option value="">-- กรุณาเลือก --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const RadioScale3 = ({ name, value, onChange, labels }: { 
  name: string; 
  value: string; 
  onChange: (name: string, value: string) => void;
  labels: string[];
}) => {
  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#6c757d',
        marginBottom: '10px',
        letterSpacing: '0.3px'
      }}>
        {labels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        textAlign: 'center',
        gap: '8px'
      }}>
        {[0, 1, 2].map((num) => (
          <label
            key={num}
            style={{
              flex: 1,
              cursor: 'pointer',
              padding: '8px 4px',
              borderRadius: '4px',
              transition: 'all 0.15s ease',
              backgroundColor: value === num.toString() ? '#e9ecef' : 'transparent'
            }}
            onMouseEnter={(e) => {
              if (value !== num.toString()) {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }
            }}
            onMouseLeave={(e) => {
              if (value !== num.toString()) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <input
              type="radio"
              name={name}
              value={num}
              checked={value === num.toString()}
              onChange={(e) => onChange(name, e.target.value)}
              style={{
                marginBottom: '6px',
                cursor: 'pointer',
                width: '18px',
                height: '18px',
                display: 'block',
                margin: '0 auto 6px auto',
                accentColor: '#2c3e50'
              }}
            />
            <div style={{
              fontSize: '13px',
              fontWeight: value === num.toString() ? '500' : '400',
              color: '#495057'
            }}>
              {labels[num]}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

const RadioScale4 = ({ name, value, onChange, labels }: { 
  name: string; 
  value: string; 
  onChange: (name: string, value: string) => void;
  labels: string[];
}) => {
  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#6c757d',
        marginBottom: '10px',
        letterSpacing: '0.3px'
      }}>
        {labels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        textAlign: 'center',
        gap: '8px'
      }}>
        {[0, 1, 2, 3].map((num) => (
          <label
            key={num}
            style={{
              flex: 1,
              cursor: 'pointer',
              padding: '8px 4px',
              borderRadius: '4px',
              transition: 'all 0.15s ease',
              backgroundColor: value === num.toString() ? '#e9ecef' : 'transparent'
            }}
            onMouseEnter={(e) => {
              if (value !== num.toString()) {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }
            }}
            onMouseLeave={(e) => {
              if (value !== num.toString()) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <input
              type="radio"
              name={name}
              value={num}
              checked={value === num.toString()}
              onChange={(e) => onChange(name, e.target.value)}
              style={{
                marginBottom: '6px',
                cursor: 'pointer',
                width: '18px',
                height: '18px',
                display: 'block',
                margin: '0 auto 6px auto',
                accentColor: '#2c3e50'
              }}
            />
            <div style={{
              fontSize: '13px',
              fontWeight: value === num.toString() ? '500' : '400',
              color: '#495057'
            }}>
              {labels[num]}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

const QuestionCard = ({
  title,
  name,
  value,
  onChange,
  scaleType = '3',
  scaleLabels
}: {
  title: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  scaleType?: '3' | '4';
  scaleLabels: string[];
}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      marginBottom: '12px',
      padding: '16px 20px'
    }}>
      <div style={{
        fontSize: '14px',
        marginBottom: '12px',
        fontWeight: 400,
        color: '#212529',
        lineHeight: 1.5
      }}>
        {title}
      </div>
      {scaleType === '3' ? (
        <RadioScale3 name={name} value={value} onChange={onChange} labels={scaleLabels} />
      ) : (
        <RadioScale4 name={name} value={value} onChange={onChange} labels={scaleLabels} />
      )}
    </div>
  );
};

const SectionHeader = ({ number, title, subtitle, description }: { 
  number: string; 
  title: string; 
  subtitle?: string;
  description?: string;
}) => {
  return (
    <div style={{
      margin: '32px 0 20px 0',
      paddingBottom: '12px',
      borderBottom: '2px solid #e9ecef'
    }}>
      <div style={{
        fontSize: '13px',
        fontWeight: 500,
        color: '#6c757d',
        letterSpacing: '0.5px',
        marginBottom: '4px'
      }}>
        ส่วนที่ {number}
      </div>
      <div style={{
        fontSize: '20px',
        fontWeight: 600,
        color: '#212529',
        letterSpacing: '-0.2px'
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{
          fontSize: '13px',
          color: '#6c757d',
          marginTop: '6px'
        }}>
          {subtitle}
        </div>
      )}
      {description && (
        <div style={{
          fontSize: '13px',
          color: '#007bff',
          marginTop: '8px',
          backgroundColor: '#e7f3ff',
          padding: '12px',
          borderRadius: '4px',
          borderLeft: '3px solid #007bff'
        }}>
          {description}
        </div>
      )}
    </div>
  );
};

// ========== ข้อมูลแบบประเมิน ==========
const SDQ_QUESTIONS = [
  { id: 'sdq1', text: '1. มักปวดศีรษะหรือปวดท้องหรือเจ็บป่วยบ่อย' },
  { id: 'sdq2', text: '2. อารมณ์เสียง่าย หงุดหงิดง่าย' },
  { id: 'sdq3', text: '3. มักเศร้าสร้อย ท้อแท้ หรือหมดหวัง' },
  { id: 'sdq4', text: '4. มักกังวลหรือกลัวสิ่งต่างๆ มากเกินไป' },
  { id: 'sdq5', text: '5. มักเงียบขรึม ไม่ค่อยพูดกับคนอื่น' },
  { id: 'sdq6', text: '6. มักทะเลาะวิวาทหรือกลั่นแกล้งผู้อื่น' },
  { id: 'sdq7', text: '7. เชื่อฟังผู้ใหญ่ มักไม่เถียง' },
  { id: 'sdq8', text: '8. มักอยู่ไม่นิ่ง ซน หรือขาดสมาธิ' },
  { id: 'sdq9', text: '9. มักมีพฤติกรรมก้าวร้าว ทำร้ายผู้อื่น' },
  { id: 'sdq10', text: '10. มักขโมยของหรือโกหก' },
  { id: 'sdq11', text: '11. มักมีเพื่อนสนิทอย่างน้อย 1 คน' },
  { id: 'sdq12', text: '12. มักเป็นที่ชื่นชอบของเพื่อนฝูง' },
  { id: 'sdq13', text: '13. มักถูกเพื่อนแกล้งหรือรังแก' },
  { id: 'sdq14', text: '14. มักช่วยเหลือผู้อื่นเมื่อเห็นคนอื่นเจ็บป่วยหรือไม่สบาย' },
  { id: 'sdq15', text: '15. มักอาสาช่วยเหลือครูหรือผู้ใหญ่' },
  { id: 'sdq16', text: '16. มักคิดก่อนทำ ไม่หุนหันพลันแล่น' },
  { id: 'sdq17', text: '17. มักเสร็จสิ้นงานที่ได้รับมอบหมาย' },
  { id: 'sdq18', text: '18. มักมีพฤติกรรมเด็กกว่าวัย' },
  { id: 'sdq19', text: '19. มักกังวลเมื่อต้องแยกจากผู้ปกครอง' },
  { id: 'sdq20', text: '20. มักมีความมั่นใจในตนเอง' },
  { id: 'sdq21', text: '21. มักชอบอยู่คนเดียวมากกว่าอยู่ร่วมกับผู้อื่น' },
  { id: 'sdq22', text: '22. มักมีอารมณ์ร้อนวู่วาม' },
  { id: 'sdq23', text: '23. มักแสดงความเห็นอกเห็นใจผู้อื่น' },
  { id: 'sdq24', text: '24. มักมีสมาธิจดจ่อได้นาน' },
  { id: 'sdq25', text: '25. มักเป็นที่ไว้วางใจของเพื่อน' }
];

const DASS21_QUESTIONS = [
  // Depression (1-7)
  { id: 'd1', text: '1. ฉันรู้สึกว่าชีวิตนี้ช่างว่างเปล่า ไร้ความหมาย', category: 'depression' },
  { id: 'd2', text: '2. ฉันไม่สามารถรู้สึกถึงอารมณ์ดีๆ ได้เลย', category: 'depression' },
  { id: 'd3', text: '3. ฉันรู้สึกว่าไม่มีอะไรในชีวิตที่น่าตื่นเต้นหรือทำให้ฉันมีความสุข', category: 'depression' },
  { id: 'd4', text: '4. ฉันรู้สึกท้อแท้และหมดหวังกับอนาคต', category: 'depression' },
  { id: 'd5', text: '5. ฉันรู้สึกว่าฉันไม่มีค่าอะไรเลย', category: 'depression' },
  { id: 'd6', text: '6. ฉันรู้สึกว่าชีวิตนี้ไม่คุ้มค่าที่จะมีชีวิตอยู่', category: 'depression' },
  { id: 'd7', text: '7. ฉันไม่สามารถรู้สึกถึงความสนุกสนานหรือเพลิดเพลินกับสิ่งใดๆ', category: 'depression' },
  // Anxiety (8-14)
  { id: 'a1', text: '8. ฉันรู้สึกปากแห้งหรือหายใจไม่สะดวก', category: 'anxiety' },
  { id: 'a2', text: '9. ฉันรู้สึกหวาดกลัวโดยไม่มีเหตุผล', category: 'anxiety' },
  { id: 'a3', text: '10. ฉันรู้สึกกลัวจนตัวสั่น', category: 'anxiety' },
  { id: 'a4', text: '11. ฉันรู้สึกว่าฉันใกล้จะแตกสลาย', category: 'anxiety' },
  { id: 'a5', text: '12. ฉันรู้สึกว่าฉันควบคุมตัวเองไม่ได้', category: 'anxiety' },
  { id: 'a6', text: '13. ฉันรู้สึกกังวลจนไม่สามารถผ่อนคลายได้', category: 'anxiety' },
  { id: 'a7', text: '14. ฉันรู้สึกหวาดกลัวต่อสถานการณ์บางอย่าง', category: 'anxiety' },
  // Stress (15-21)
  { id: 's1', text: '15. ฉันรู้สึกว่าฉันใช้พลังงานไปมากกับความเครียดเล็กๆ น้อยๆ', category: 'stress' },
  { id: 's2', text: '16. ฉันรู้สึกว่าฉันหงุดหงิดง่ายกับสิ่งต่างๆ', category: 'stress' },
  { id: 's3', text: '17. ฉันรู้สึกว่าฉันแทบจะทนไม่ไหวกับสิ่งที่เกิดขึ้น', category: 'stress' },
  { id: 's4', text: '18. ฉันรู้สึกว่าฉันกังวลกับเรื่องต่างๆ มากเกินไป', category: 'stress' },
  { id: 's5', text: '19. ฉันรู้สึกว่าฉันไม่สามารถหยุดกังวลได้', category: 'stress' },
  { id: 's6', text: '20. ฉันรู้สึกว่าสถานการณ์ต่างๆ ทำให้ฉันเครียดมาก', category: 'stress' },
  { id: 's7', text: '21. ฉันรู้สึกว่าฉันต้องใช้ความพยายามมากในการทำสิ่งต่างๆ', category: 'stress' }
];

// ========== Main Component ==========

function AssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [activeForm, setActiveForm] = useState<'sdq' | 'dass21' | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Role-based redirection: If user is student, redirect to student assessment page
  useEffect(() => {
    const isStudent = localStorage.getItem('isStudent') === 'true';
    const type = searchParams.get('type');
    
    // Redirect students to student assessment page if they're on the main assessment page
    if (isStudent && (pathname === '/assessment' || (type && (type === 'sdq' || type === 'dass21')))) {
      const redirectUrl = type ? `/assessment/student?type=${type}` : '/assessment/student';
      router.replace(redirectUrl);
      return;
    }
  }, [router, searchParams, pathname]);

  const [studentInfo, setStudentInfo] = useState({
    studentId: '',
    studentName: '',
    grade: '',
    classroom: '',
    gender: '',
    age: ''
  });

  const [sdqAnswers, setSdqAnswers] = useState<Record<string, string>>({});
  const [dass21Answers, setDass21Answers] = useState<Record<string, string>>({});

  // Handle URL parameters
  useEffect(() => {
    const type = searchParams.get('type');
    const studentId = searchParams.get('studentId');
    
    console.log('URL parameters:', { type, studentId }); // Debug log
    
    if (type && (type === 'sdq' || type === 'dass21')) {
      console.log('Setting active form to:', type); // Debug log
      setActiveForm(type);
      
      // If studentId is provided, fetch student data
      if (studentId) {
        fetchStudentData(studentId);
      }
    }
  }, [searchParams]);

  const fetchStudentData = async (studentId: string) => {
    try {
      const response = await fetch(`/api/student/${studentId}`);
      const data = await response.json();
      
      if (data.success) {
        const student = data.data;
        setStudentInfo(prev => ({
          ...prev,
          studentId: student._id, // Always use MongoDB _id
          studentName: `${student.prefix} ${student.first_name} ${student.last_name}`,
          grade: student.level,
          classroom: `${student.class_group}/${student.class_number}`,
          gender: student.gender,
          age: student.birth_date ? calculateAge(student.birth_date).toString() : ''
        }));
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? age - 1 : age;
  };

  const genderOptions = [
    { value: 'male', label: 'ชาย' },
    { value: 'female', label: 'หญิง' },
    { value: 'other', label: 'อื่นๆ' }
  ];

  const gradeOptions = [
    { value: 'ม.1', label: 'มัธยมศึกษาปีที่ 1' },
    { value: 'ม.2', label: 'มัธยมศึกษาปีที่ 2' },
    { value: 'ม.3', label: 'มัธยมศึกษาปีที่ 3' },
    { value: 'ม.4', label: 'มัธยมศึกษาปีที่ 4' },
    { value: 'ม.5', label: 'มัธยมศึกษาปีที่ 5' },
    { value: 'ม.6', label: 'มัธยมศึกษาปีที่ 6' },
    { value: 'ปวช.1', label: 'ประกาศนียบัตรวิชาชีพ ชั้นปี 1' },
    { value: 'ปวช.2', label: 'ประกาศนียบัตรวิชาชีพ ชั้นปี 2' },
    { value: 'ปวช.3', label: 'ประกาศนียบัตรวิชาชีพ ชั้นปี 3' }
  ];

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      setStudentInfo(prev => ({
        ...prev,
        studentName: `${user.first_name || ''} ${user.last_name || ''}`.trim()
      }));
    }
  }, []);

  const handleStudentInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudentInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSdqChange = (name: string, value: string) => {
    setSdqAnswers(prev => ({ ...prev, [name]: value }));
  };

  const handleDass21Change = (name: string, value: string) => {
    setDass21Answers(prev => ({ ...prev, [name]: value }));
  };

  const calculateSDQScore = () => {
    // SDQ Scoring: Some items are reversed
    const reversedItems = ['sdq7', 'sdq11', 'sdq12', 'sdq14', 'sdq15', 'sdq16', 'sdq17', 'sdq20', 'sdq23', 'sdq24', 'sdq25'];
    let totalScore = 0;
    
    SDQ_QUESTIONS.forEach(q => {
      const answer = parseInt(sdqAnswers[q.id] || '0');
      if (reversedItems.includes(q.id)) {
        totalScore += (2 - answer); // Reverse scoring
      } else {
        totalScore += answer;
      }
    });

    // Interpretation
    let interpretation = '';
    if (totalScore <= 15) interpretation = 'ปกติ';
    else if (totalScore <= 19) interpretation = 'คาบเกี่ยว';
    else interpretation = 'มีปัญหา';

    return { totalScore, interpretation };
  };

  const calculateDASS21Score = () => {
    const depression = DASS21_QUESTIONS.filter(q => q.category === 'depression')
      .reduce((sum, q) => sum + parseInt(dass21Answers[q.id] || '0'), 0) * 2;
    
    const anxiety = DASS21_QUESTIONS.filter(q => q.category === 'anxiety')
      .reduce((sum, q) => sum + parseInt(dass21Answers[q.id] || '0'), 0) * 2;
    
    const stress = DASS21_QUESTIONS.filter(q => q.category === 'stress')
      .reduce((sum, q) => sum + parseInt(dass21Answers[q.id] || '0'), 0) * 2;

    const getLevel = (score: number, type: string) => {
      const levels: Record<string, { normal: number; mild: number; moderate: number; severe: number }> = {
        depression: { normal: 9, mild: 13, moderate: 20, severe: 27 },
        anxiety: { normal: 7, mild: 9, moderate: 14, severe: 19 },
        stress: { normal: 14, mild: 18, moderate: 25, severe: 33 }
      };
      
      const l = levels[type];
      if (score <= l.normal) return 'ปกติ';
      if (score <= l.mild) return 'เบา';
      if (score <= l.moderate) return 'ปานกลาง';
      if (score <= l.severe) return 'รุนแรง';
      return 'รุนแรงมาก';
    };

    return {
      depression,
      depressionLevel: getLevel(depression, 'depression'),
      anxiety,
      anxietyLevel: getLevel(anxiety, 'anxiety'),
      stress,
      stressLevel: getLevel(stress, 'stress')
    };
  };

  const handleReset = () => {
    if (confirm('ล้างข้อมูลทั้งหมด?')) {
      setSdqAnswers({});
      setDass21Answers({});
      setStudentInfo({
        studentId: '',
        studentName: '',
        grade: '',
        classroom: '',
        gender: '',
        age: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentInfo.studentName || !studentInfo.grade) {
      alert('กรุณากรอกข้อมูลนักเรียนให้ครบถ้วน');
      return;
    }

    if (activeForm === 'sdq' && Object.keys(sdqAnswers).length < 25) {
      alert('กรุณาตอบแบบประเมิน SDQ ให้ครบทุกข้อ');
      return;
    }

    if (activeForm === 'dass21' && Object.keys(dass21Answers).length < 21) {
      alert('กรุณาตอบแบบประเมิน DASS-21 ให้ครบทุกข้อ');
      return;
    }

    setLoading(true);

    try {
      const assessmentData = {
        studentId: studentInfo.studentId,
        studentName: studentInfo.studentName,
        grade: studentInfo.grade,
        classroom: studentInfo.classroom,
        gender: studentInfo.gender,
        age: studentInfo.age,
        assessmentType: activeForm,
        sdqScore: activeForm === 'sdq' ? calculateSDQScore() : null,
        dass21Score: activeForm === 'dass21' ? calculateDASS21Score() : null,
        answers: activeForm === 'sdq' ? sdqAnswers : dass21Answers,
        assessmentDate: new Date()
      };

      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          router.push('/assessment');
        }, 3000);
      } else {
        alert(data.error || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '48px 40px',
          textAlign: 'center',
          maxWidth: '480px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
          <h2 style={{
            color: '#212529',
            marginBottom: '8px',
            fontWeight: 500,
            fontSize: '24px'
          }}>
            บันทึกข้อมูลสำเร็จ
          </h2>
          <p style={{ color: '#6c757d', fontSize: '14px', lineHeight: 1.6 }}>
            ผลการประเมินจะถูกบันทึกและวิเคราะห์ต่อไป
          </p>
          <p style={{ color: '#adb5bd', fontSize: '12px', marginTop: '24px' }}>
            กำลังนำท่านกลับ...
          </p>
        </div>
      </div>
    );
  }

  if (!activeForm) {
    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        padding: '40px 20px',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link href="/assessment/charts" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: '#17a2b8',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#138496'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}>
                📊 ดูแผนภูมิสรุป
              </Link>
              <Link href="/assessment/summary" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}>
                📊 ดูสรุปการประเมินทั้งหมด
              </Link>
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 600,
              color: '#212529',
              margin: '0 0 12px 0'
            }}>
              แบบประเมินทางจิตวิทยา
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6c757d',
              lineHeight: 1.6
            }}>
              กรุณาเลือกแบบประเมินที่ต้องการทำ
            </p>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            <div
              onClick={() => setActiveForm('sdq')}
              style={{
                backgroundColor: 'white',
                border: '2px solid #007bff',
                borderRadius: '8px',
                padding: '32px 24px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e7f3ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#212529',
                margin: '0 0 8px 0'
              }}>
                SDQ (Strengths and Difficulties Questionnaire)
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6c757d',
                margin: 0,
                lineHeight: 1.6
              }}>
                แบบประเมินจุดแข็งและปัญหาพฤติกรรมสำหรับเด็กและวัยรุ่น (25 ข้อ)
                <br />
                ⏱️ ใช้เวลาประมาณ 5-10 นาที
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveForm('sdq');
                    router.push('/assessment?type=sdq');
                  }}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  ดูแบบประเมิน
                </button>
                <Link
                  href="/assessment/sdq/results"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#007bff',
                    border: '1px solid #007bff',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  ดูผลการประเมิน
                </Link>
              </div>
            </div>

            <div
              onClick={() => setActiveForm('dass21')}
              style={{
                backgroundColor: 'white',
                border: '2px solid #28a745',
                borderRadius: '8px',
                padding: '32px 24px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e8f5e9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧠</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#212529',
                margin: '0 0 8px 0'
              }}>
                DASS-21 (Depression Anxiety Stress Scales)
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6c757d',
                margin: 0,
                lineHeight: 1.6
              }}>
                แบบประเมินภาวะซึมเศร้า วิตกกังวล และความเครียด (21 ข้อ)
                <br />
                ⏱️ ใช้เวลาประมาณ 5-10 นาที
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveForm('dass21');
                    router.push('/assessment?type=dass21');
                  }}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  ดูแบบประเมิน
                </button>
                <Link
                  href="/assessment/dass21/results"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#007bff',
                    border: '1px solid #007bff',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  ดูผลการประเมิน
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '40px 20px',
      display: 'flex',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{ width: '100%', maxWidth: '860px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => setActiveForm(null)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#007bff',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '16px',
              padding: '0'
            }}
          >
            ← กลับไปเลือกแบบประเมิน
          </button>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#212529',
            margin: '0 0 12px 0'
          }}>
            {activeForm === 'sdq' ? 'แบบประเมิน SDQ' : 'แบระเมิน DASS-21'}
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6c757d',
            lineHeight: 1.6,
            margin: 0
          }}>
            {activeForm === 'sdq' 
              ? 'แบบประเมินจุดแข็งและปัญหาพฤติกรรมสำหรับเด็กและวัยรุ่น' 
              : 'แบบประเมินภาวะซึมเศร้า วิตกกังวล และความเครียด'}
          </p>
          <div style={{
            marginTop: '16px',
            fontSize: '12px',
            color: '#dc3545'
          }}>
            * ข้อความที่ต้องตอบ
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ข้อมูลนักเรียน */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            marginBottom: '32px'
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e9ecef',
              backgroundColor: '#fefefe'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#495057' }}>ข้อมูลนักเรียน</span>
            </div>
            <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <InputField 
                label="รหัสนักเรียน" 
                name="studentId" 
                value={studentInfo.studentId} 
                onChange={handleStudentInfoChange}
                required={false}
              />
              <InputField 
                label="ชื่อ-นามสกุล" 
                name="studentName" 
                value={studentInfo.studentName} 
                onChange={handleStudentInfoChange}
              />
              <SelectField
                label="ระดับชั้น"
                name="grade"
                value={studentInfo.grade}
                onChange={handleStudentInfoChange}
                options={gradeOptions}
              />
              <InputField 
                label="ห้อง" 
                name="classroom" 
                value={studentInfo.classroom} 
                onChange={handleStudentInfoChange}
                required={false}
              />
              <SelectField
                label="เพศ"
                name="gender"
                value={studentInfo.gender}
                onChange={handleStudentInfoChange}
                options={genderOptions}
                required={false}
              />
              <InputField 
                label="อายุ" 
                name="age" 
                value={studentInfo.age} 
                onChange={handleStudentInfoChange}
                required={false}
              />
            </div>
          </div>

          {/* SDQ Form */}
          {activeForm === 'sdq' && (
            <>
              <SectionHeader 
                number="1" 
                title="แบบประเมิน SDQ (Strengths and Difficulties Questionnaire)"
                subtitle="คำชี้แจง: โปรดทำเครื่องหมาย ✓ ในช่องที่ตรงกับพฤติกรรมของนักเรียนมากที่สุด"
                description="⏱️ คำถาม 25 ข้อ • ใช้เวลาประมาณ 5-10 นาที • คะแนน 0-2 (ไม่ตรง=0, ค่อนข้างตรง=1, ตรงมาก=2)"
              />

              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '4px',
                padding: '16px 20px',
                marginBottom: '24px'
              }}>
                <strong>คำชี้แจง:</strong> แบบประเมินนี้ประกอบด้วย 5 ด้าน ได้แก่
                <ul style={{ margin: '8px 0 0 20px', fontSize: '14px', color: '#6c757d' }}>
                  <li>อาการทางอารมณ์ (ข้อ 1-5)</li>
                  <li>ปัญหาด้านพฤติกรรม (ข้อ 6-10)</li>
                  <li>ภาวะอยู่ไม่นิ่ง/ขาดสมาธิ (ข้อ 11-15)</li>
                  <li>ปัญหาด้านความสัมพันธ์กับเพื่อน (ข้อ 16-20)</li>
                  <li>พฤติกรรมเชิงบวก (ข้อ 21-25)</li>
                </ul>
              </div>

              {SDQ_QUESTIONS.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  title={q.text}
                  name={q.id}
                  value={sdqAnswers[q.id] || ''}
                  onChange={handleSdqChange}
                  scaleType="3"
                  scaleLabels={['ไม่ตรง', 'ค่อนข้างตรง', 'ตรงมาก']}
                />
              ))}
            </>
          )}

          {/* DASS-21 Form */}
          {activeForm === 'dass21' && (
            <>
              <SectionHeader 
                number="1" 
                title="แบบประเมิน DASS-21 (Depression Anxiety Stress Scales)"
                subtitle="คำชี้แจง: โปรดทำเครื่องหมาย ✓ ในช่องที่ตรงกับความรู้สึกของท่านในช่วง 1 สัปดาห์ที่ผ่านมา"
                description="⏱️ คำถาม 21 ข้อ • ใช้เวลาประมาณ 5-10 นาที • คะแนน 0-3 (ไม่เลย=0, นิดหน่อย=1, ปานกลาง=2, มากมาก=3)"
              />

              <div style={{
                backgroundColor: '#d1ecf1',
                border: '1px solid #17a2b8',
                borderRadius: '4px',
                padding: '16px 20px',
                marginBottom: '24px'
              }}>
                <strong>คำชี้แจง:</strong> แบบประเมินนี้ประกอบด้วย 3 ด้าน ได้แก่
                <ul style={{ margin: '8px 0 0 20px', fontSize: '14px', color: '#6c757d' }}>
                  <li>ภาวะซึมเศร้า (ข้อ 1-7)</li>
                  <li>ภาวะวิตกกังวล (ข้อ 8-14)</li>
                  <li>ภาวะความเครียด (ข้อ 15-21)</li>
                </ul>
              </div>

              {DASS21_QUESTIONS.map((q) => (
                <QuestionCard
                  key={q.id}
                  title={q.text}
                  name={q.id}
                  value={dass21Answers[q.id] || ''}
                  onChange={handleDass21Change}
                  scaleType="4"
                  scaleLabels={['ไม่เลย', 'นิดหน่อย', 'ปานกลาง', 'มากมาก']}
                />
              ))}
            </>
          )}

          {/* ปุ่มดำเนินการ */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginTop: '32px',
            marginBottom: '48px',
            paddingTop: '16px',
            borderTop: '1px solid #e9ecef'
          }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#6c757d' : '#2c3e50',
                color: 'white',
                padding: '10px 28px',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontFamily: 'inherit',
                transition: 'background-color 0.15s ease',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'กำลังบันทึก...' : '💾 ส่งแบบประเมิน'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{
                backgroundColor: 'transparent',
                color: '#6c757d',
                border: '1px solid #dee2e6',
                padding: '9px 20px',
                borderRadius: '4px',
                fontWeight: 400,
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'inherit',
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
              🗑️ ล้างข้อมูล
            </button>
          </div>
        </form>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: '11px',
          color: '#adb5bd',
          padding: '20px 0 40px 0',
          borderTop: '1px solid #e9ecef'
        }}>
          แบบประเมินทางจิตวิทยา • ข้อมูลทั้งหมดถูกเก็บเป็นความลับ
        </div>

      </div>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #007bff', 
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '16px', color: '#6c757d' }}>กำลังโหลด...</p>
        </div>
      </div>
    }>
      <AssessmentContent />
    </Suspense>
  );
}