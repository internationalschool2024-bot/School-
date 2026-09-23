import React, { useState, useEffect } from 'react';
import { 
  INITIAL_STUDENTS, 
  INITIAL_TEACHERS, 
  INITIAL_REPORT_CARDS, 
  INITIAL_ATTENDANCE, 
  INITIAL_FOLLOW_UPS, 
  INITIAL_SMS_LOGS,
  INITIAL_SCHEDULE,
  INITIAL_ANNOUNCEMENTS,
  SCHOOL_INFO
} from './data/mockData';
import { 
  Student, 
  Teacher, 
  StudentReportCard, 
  AttendanceRecord, 
  PeriodicFollowUp, 
  SmsMessageLog,
  WeeklyScheduleItem,
  Announcement,
  TabType 
} from './types';
import { Dashboard } from './components/Dashboard';
import { StudentManager } from './components/StudentManager';
import { TeacherManager } from './components/TeacherManager';
import { FinancialManager } from './components/FinancialManager';
import { GradesManager } from './components/GradesManager';
import { FollowUpManager } from './components/FollowUpManager';
import { SmsNotificationCenter } from './components/SmsNotificationCenter';
import { ParentPortal } from './components/ParentPortal';
import { WeeklyScheduleManager } from './components/WeeklyScheduleManager';
import { SettingsManager } from './components/SettingsManager';
import { PrintDocumentsModal, PrintableDocType } from './components/PrintDocumentsModal';
import { PortalLinksModal } from './components/PortalLinksModal';
import { SchoolLogo, DeveloperBadge } from './components/SchoolLogo';
import { IraqEmblem } from './components/IraqEmblem';
import { getRouteFromUrl, syncUrlWithTab } from './utils/urlHelper';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  DollarSign, 
  FileText, 
  CheckSquare, 
  MessageSquare, 
  Smartphone, 
  Search, 
  UserPlus, 
  Send, 
  Menu, 
  X,
  Bell,
  GraduationCap,
  Link as LinkIcon,
  Calendar,
  Settings,
  BarChart3,
  Check,
  Clock,
  Sparkles,
  ChevronLeft
} from 'lucide-react';

export default function App() {
  // Navigation State with URL parsing for direct portal links
  const initialRoute = getRouteFromUrl();
  const [activeTab, setActiveTab] = useState<TabType>(initialRoute.tab);
  const [urlStudentId, setUrlStudentId] = useState<string | undefined>(initialRoute.studentId);
  const [isPortalLinksModalOpen, setIsPortalLinksModalOpen] = useState(false);
  const [portalModalStudentId, setPortalModalStudentId] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Live real-time clock
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const dayName = days[now.getDay()];
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'م' : 'ص';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      const formattedHours = String(hours).padStart(2, '0');

      setCurrentTime(`${formattedHours}:${minutes} ${ampm} | ${dayName} ${year}/${month}/${day}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle browser back/forward and external URL parameter changes
  useEffect(() => {
    const handleUrlChange = () => {
      const currentRoute = getRouteFromUrl();
      setActiveTab(currentRoute.tab);
      if (currentRoute.studentId) {
        setUrlStudentId(currentRoute.studentId);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleTabChange = (tab: TabType, studentId?: string) => {
    setActiveTab(tab);
    if (studentId !== undefined) {
      setUrlStudentId(studentId);
    }
    syncUrlWithTab(tab, tab === 'portal' ? (studentId ?? urlStudentId) : undefined);
  };

  // State with local storage fallback
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('school_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('school_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [reportCards, setReportCards] = useState<StudentReportCard[]>(() => {
    const saved = localStorage.getItem('school_report_cards');
    return saved ? JSON.parse(saved) : INITIAL_REPORT_CARDS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('school_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [followUpReports, setFollowUpReports] = useState<PeriodicFollowUp[]>(() => {
    const saved = localStorage.getItem('school_followups');
    return saved ? JSON.parse(saved) : INITIAL_FOLLOW_UPS;
  });

  const [smsLogs, setSmsLogs] = useState<SmsMessageLog[]>(() => {
    const saved = localStorage.getItem('school_sms_logs');
    return saved ? JSON.parse(saved) : INITIAL_SMS_LOGS;
  });

  const [schedule, setSchedule] = useState<WeeklyScheduleItem[]>(() => {
    const saved = localStorage.getItem('school_schedule');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('school_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [customSchoolInfo, setCustomSchoolInfo] = useState(() => {
    const saved = localStorage.getItem('school_custom_info');
    return saved ? JSON.parse(saved) : { ...SCHOOL_INFO };
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('school_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('school_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('school_report_cards', JSON.stringify(reportCards));
  }, [reportCards]);

  useEffect(() => {
    localStorage.setItem('school_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('school_followups', JSON.stringify(followUpReports));
  }, [followUpReports]);

  useEffect(() => {
    localStorage.setItem('school_sms_logs', JSON.stringify(smsLogs));
  }, [smsLogs]);

  useEffect(() => {
    localStorage.setItem('school_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('school_announcements', JSON.stringify(announcements));
  }, [announcements]);

  // Modal Print state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printDocType, setPrintDocType] = useState<PrintableDocType>('registration');
  const [selectedStudentForDoc, setSelectedStudentForDoc] = useState<Student | null>(null);
  const [selectedTeacherForDoc, setSelectedTeacherForDoc] = useState<Teacher | null>(null);
  const [selectedReportCardForDoc, setSelectedReportCardForDoc] = useState<StudentReportCard | null>(null);
  const [selectedFollowUpForDoc, setSelectedFollowUpForDoc] = useState<PeriodicFollowUp | null>(null);

  // Student CRUD
  const handleSaveStudent = (student: Student) => {
    setStudents((prev) => {
      const index = prev.findIndex((s) => s.id === student.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = student;
        return updated;
      }
      return [student, ...prev];
    });
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // Teacher CRUD
  const handleSaveTeacher = (teacher: Teacher) => {
    setTeachers((prev) => {
      const index = prev.findIndex((t) => t.id === teacher.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = teacher;
        return updated;
      }
      return [teacher, ...prev];
    });
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  // Schedule CRUD
  const handleSaveScheduleItem = (item: WeeklyScheduleItem) => {
    setSchedule((prev) => {
      const index = prev.findIndex((s) => s.id === item.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = item;
        return updated;
      }
      return [...prev, item];
    });
  };

  const handleDeleteScheduleItem = (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
  };

  // Financial Update
  const handleUpdateStudentPayment = (
    studentId: string, 
    firstPayment: number, 
    firstPaymentDate: string, 
    secondPayment: number, 
    secondPaymentDate: string
  ) => {
    setStudents((prev) => prev.map((s) => {
      if (s.id === studentId) {
        const remaining = Math.max(0, s.totalAmount - (firstPayment + secondPayment));
        return {
          ...s,
          firstPayment,
          firstPaymentDate,
          secondPayment,
          secondPaymentDate,
          remainingAmount: remaining,
        };
      }
      return s;
    }));
  };

  // Report Card CRUD
  const handleSaveReportCard = (card: StudentReportCard) => {
    setReportCards((prev) => {
      const index = prev.findIndex((r) => r.id === card.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = card;
        return updated;
      }
      return [card, ...prev];
    });
  };

  // Attendance Batch Save
  const handleSaveAttendanceBatch = (records: AttendanceRecord[]) => {
    setAttendanceRecords((prev) => {
      const updated = [...prev];
      records.forEach((rec) => {
        const idx = updated.findIndex((r) => r.studentId === rec.studentId && r.date === rec.date);
        if (idx >= 0) {
          updated[idx] = rec;
        } else {
          updated.push(rec);
        }
      });
      return updated;
    });
  };

  // Follow Up CRUD
  const handleSaveFollowUpReport = (report: PeriodicFollowUp) => {
    setFollowUpReports((prev) => {
      const idx = prev.findIndex((f) => f.id === report.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = report;
        return updated;
      }
      return [report, ...prev];
    });
  };

  // SMS Handler
  const handleSendSms = (studentId: string, studentName: string, phone: string, type: any, content: string) => {
    const newLog: SmsMessageLog = {
      id: `sms-${Date.now()}`,
      studentId,
      studentName,
      parentPhone: phone,
      messageType: type,
      content,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'تم الإرسال',
      channel: 'SMS',
    };
    setSmsLogs((prev) => [newLog, ...prev]);
  };

  // Document Print Triggers
  const handlePrintStudentForm = (student: Student) => {
    setSelectedStudentForDoc(student);
    setPrintDocType('registration');
    setIsPrintModalOpen(true);
  };

  const handlePrintCheck = (student: Student) => {
    setSelectedStudentForDoc(student);
    setPrintDocType('check');
    setIsPrintModalOpen(true);
  };

  const handlePrintReportCard = (student: Student) => {
    const rc = reportCards.find((r) => r.studentId === student.id) || null;
    setSelectedStudentForDoc(student);
    setSelectedReportCardForDoc(rc);
    setPrintDocType('reportCard');
    setIsPrintModalOpen(true);
  };

  const handlePrintFollowUp = (student: Student, followUp: PeriodicFollowUp) => {
    setSelectedStudentForDoc(student);
    setSelectedFollowUpForDoc(followUp);
    setPrintDocType('followup');
    setIsPrintModalOpen(true);
  };

  const handlePrintTeacherCard = (teacher: Teacher) => {
    setSelectedTeacherForDoc(teacher);
    setPrintDocType('teacherCard');
    setIsPrintModalOpen(true);
  };

  // Quick SMS Actions
  const handleQuickSmsReminder = (student: Student) => {
    const msg = `السيد ولي أمر الطالب ${student.firstName} ${student.lastName} المحترم، نود تذكيركم بموعد استحقاق الدفعة الثانية من القسط المدرسي وقدرها (${student.remainingAmount}$) المستحقة بتاريخ ${student.secondPaymentDueDate}. شاكرين حسن تعاونكم - ${customSchoolInfo.name}.`;
    handleSendSms(student.id, `${student.firstName} ${student.lastName}`, student.guardianPhone, 'مطالبة قسط مالي', msg);
    alert(`تم إرسال رسالة تذكير بالقسط لولي أمر الطالب (${student.firstName}) بنجاح!`);
  };

  const handleQuickSmsBulk = (unpaidStudents: Student[]) => {
    unpaidStudents.forEach((student) => {
      const msg = `تذكير هام: نرجو من ولي أمر الطالب ${student.firstName} مراجعة الإدارة المالية لتسوية القسط المتبقي (${student.remainingAmount}$). شاكرين تعاونكم - ${customSchoolInfo.name}`;
      handleSendSms(student.id, `${student.firstName} ${student.lastName}`, student.guardianPhone, 'مطالبة قسط مالي', msg);
    });
    alert(`تم إرسال رسائل تذكير لـ (${unpaidStudents.length}) ولي أمر بنجاح!`);
  };

  const handleQuickSmsGrades = (student: Student, rc: StudentReportCard) => {
    const msg = `نبارك لولي أمر الطالب ${student.firstName} صدور كشف الدرجات وحصوله على معدل ${rc.percentage}% وتقدير ${rc.appreciation}. نتمنى له دوام التوفيق والنجاح - ${customSchoolInfo.name}`;
    handleSendSms(student.id, `${student.firstName} ${student.lastName}`, student.guardianPhone, 'كشف علامات', msg);
    alert(`تم إرسال إشعار النتيجة لولي أمر الطالب (${student.firstName}) بنجاح!`);
  };

  // Navigation Items (Exact Match to Reference Screenshot Order & Titles)
  const navItems = [
    { id: 'dashboard' as TabType, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'grades' as TabType, label: 'الدرجات', icon: FileText },
    { id: 'students' as TabType, label: 'الطلاب', icon: Users },
    { id: 'teachers' as TabType, label: 'الكادر التدريسي', icon: GraduationCap },
    { id: 'schedule' as TabType, label: 'الجدول الأسبوعي', icon: Calendar },
    { id: 'followup' as TabType, label: 'الغياب والحضور', icon: CheckSquare },
    { id: 'finances' as TabType, label: 'الأقساط والمالية', icon: DollarSign },
    { id: 'portal' as TabType, label: 'التقارير والإحصائيات', icon: BarChart3 },
    { id: 'sms' as TabType, label: 'الإعلانات والرسائل', icon: MessageSquare, badge: announcements.length },
    { id: 'portal' as TabType, label: 'بوابة أولياء الأمور', icon: Smartphone, highlight: true },
    { id: 'settings' as TabType, label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans flex overflow-hidden selection:bg-blue-200 selection:text-blue-900" dir="rtl">
      
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 1. Sidebar (Deep Royal Navy #0B2038 Matching Reference Image) */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50 w-64 bg-[#0B2038] text-white flex flex-col h-full shrink-0
        transform transition-transform duration-200 ease-in-out no-print shadow-xl
        ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-[#071627]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-md shrink-0 overflow-hidden">
              <SchoolLogo 
                variant="icon" 
                size="sm" 
                customLogoUrl={customSchoolInfo.logoUrl} 
                schoolName={customSchoolInfo.name} 
              />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-sm font-black text-white tracking-tight">{customSchoolInfo.name}</span>
              <span className="text-[10px] text-amber-400 font-bold tracking-wide">International School</span>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Highlighted with Sky-Blue rounded container matching screenshot) */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            // Notice: portal appears as reports and portal, match correctly
            const isActive = activeTab === item.id;
            return (
              <button
                key={`${item.id}-${idx}`}
                id={`nav-${item.id}`}
                onClick={() => {
                  handleTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full rounded-xl p-3 flex items-center justify-between text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer text-right ${
                  isActive
                    ? 'bg-[#1E62B8] text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                } ${item.highlight && !isActive ? 'text-amber-300 hover:text-amber-200' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {Boolean(item.badge) && !isActive && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-sky-200 text-[10px] font-bold border border-sky-400/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Direct Portal Links Generator Button in Sidebar */}
          <div className="pt-3 border-t border-white/10 mt-2">
            <button
              onClick={() => {
                setPortalModalStudentId(undefined);
                setIsPortalLinksModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-amber-400" />
                <span>روابط البوابات والمشاركة</span>
              </div>
              <span className="text-[10px] bg-amber-400/25 px-1.5 py-0.5 rounded text-amber-200">
                رابط مباشر
              </span>
            </button>
          </div>
        </nav>

        {/* Sidebar Official Iraqi Footer Banner (Matching Screenshot Footer) */}
        <div className="p-3.5 border-t border-white/10 bg-[#071627]/90 text-center flex flex-col gap-2 text-slate-300">
          <div className="flex flex-col gap-0.5">
            <div className="text-xs font-black text-white flex items-center justify-center gap-1.5">
              <span>بالعلم نبني المستقبل</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-[10px] text-slate-400">
              {customSchoolInfo.directorate} • {customSchoolInfo.academicYear}
            </div>
          </div>

          {/* Developer Attribution in Sidebar */}
          <div className="pt-2 border-t border-white/10 flex flex-col items-center gap-1">
            <span className="text-[11px] font-bold text-amber-300">برمجة المهندس محمود العبدالله</span>
            <a 
              href="tel:+963939841552" 
              dir="ltr"
              className="text-[10px] text-slate-400 hover:text-white font-mono flex items-center gap-1 transition-colors"
            >
              <span>+963 939 841 552</span>
              <span className="text-amber-400 font-bold">• أبو أنس الحكيم</span>
            </a>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Header Bar (Matching Reference Image Header: Coat of Arms + Clock + Bell + Profile) */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 shrink-0 sticky top-0 z-30 no-print shadow-xs flex items-center justify-between">
          
          {/* Right Section: Iraqi Ministry & General Directorate Emblem & Titles */}
          <div className="flex items-center gap-3">
            {/* Hamburger on Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Official Emblem & Institutional Hierarchy */}
            <div className="flex items-center gap-2.5">
              <IraqEmblem size="md" />
              <div className="hidden sm:flex flex-col text-right leading-tight">
                <span className="text-[11px] font-black text-slate-800">جمهورية العراق - وزارة التربية</span>
                <span className="text-[10px] text-slate-500 font-bold">{customSchoolInfo.directorate}</span>
              </div>
            </div>
          </div>

          {/* Center Section: Live Clock & Real-time Date (Arabian Formatted) */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-mono font-bold text-slate-700 dir-rtl">
              {currentTime || '10:24 ص | الأحد 2025/09/21'}
            </span>
          </div>

          {/* Left Section: Notifications Bell + User Profile + Quick Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Direct Settings / Logo Change Trigger Button */}
            <button
              onClick={() => handleTabChange('settings')}
              className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="تغيير الشعار، اسم المدرسة، والبيانات الرسمية"
            >
              <Settings className="w-3.5 h-3.5 text-blue-700" />
              <span className="hidden md:inline">تعديل الشعار والاسم ⚙️</span>
            </button>

            {/* Portal Links Modal Trigger */}
            <button
              onClick={() => {
                setPortalModalStudentId(undefined);
                setIsPortalLinksModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="توليد ونسخ روابط البوابات ورابط ولي الأمر برقم الطالب"
            >
              <LinkIcon className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">روابط البوابات 🔗</span>
            </button>

            {/* Notifications Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative cursor-pointer"
                title="الإعلانات والتنبيهات المدرسية"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {announcements.length}
                </span>
              </button>

              {/* Quick Notifications Popover */}
              {isNotificationsOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-800">التنبيهات المدرسية الحديثة</span>
                    <button 
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      إغلاق
                    </button>
                  </div>
                  <div className="space-y-1.5 mt-2 max-h-64 overflow-y-auto">
                    {announcements.map((ann) => (
                      <div 
                        key={ann.id}
                        onClick={() => {
                          if (ann.actionTab) handleTabChange(ann.actionTab as TabType);
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors text-right"
                      >
                        <div className="text-xs font-bold text-slate-800 line-clamp-1">{ann.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{ann.date} • {ann.category}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      handleTabChange('sms');
                      setIsNotificationsOpen(false);
                    }}
                    className="w-full mt-2 py-1.5 text-center text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    عرض كل التنبيهات في مركز الرسائل
                  </button>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* School Principal User Profile Badge (Matching Reference Screenshot) */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col text-left items-end leading-tight">
                <span className="text-xs font-bold text-slate-800">{customSchoolInfo.principal}</span>
                <span className="text-[10px] text-blue-600 font-bold">مدير المدرسة</span>
              </div>
              <div className="w-9 h-9 bg-blue-600 text-white rounded-xl shadow-xs flex items-center justify-center font-bold text-xs">
                {customSchoolInfo.principal ? customSchoolInfo.principal.split(' ')[0]?.[0] : 'م'}
              </div>
            </div>

          </div>

        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7">
          
          {activeTab === 'dashboard' && (
            <Dashboard
              students={students}
              teachers={teachers}
              reportCards={reportCards}
              smsLogs={smsLogs}
              schedule={schedule}
              announcements={announcements}
              schoolInfo={customSchoolInfo}
              onNavigate={(tab) => handleTabChange(tab)}
              onPrintStudent={handlePrintStudentForm}
              onPrintCheck={handlePrintCheck}
              onSendSmsReminder={handleQuickSmsReminder}
              onOpenPortalLinks={(id) => {
                setPortalModalStudentId(id);
                setIsPortalLinksModalOpen(true);
              }}
            />
          )}

          {activeTab === 'students' && (
            <StudentManager
              students={students}
              onSaveStudent={handleSaveStudent}
              onDeleteStudent={handleDeleteStudent}
              onPrintDocument={(st, docType) => {
                if (docType === 'registration') handlePrintStudentForm(st);
                else if (docType === 'check') handlePrintCheck(st);
                else if (docType === 'reportCard') handlePrintReportCard(st);
                else {
                  const fu = followUpReports.find((f) => f.studentId === st.id) || null;
                  if (fu) handlePrintFollowUp(st, fu);
                  else alert('لا يوجد تقرير متابعة مسجل لهذا الطالب بعد');
                }
              }}
              onOpenSms={() => {
                handleTabChange('sms');
              }}
              onOpenPortalLinks={() => {
                setPortalModalStudentId(undefined);
                setIsPortalLinksModalOpen(true);
              }}
              onOpenShareParentLink={(st) => {
                setPortalModalStudentId(st.id);
                setIsPortalLinksModalOpen(true);
              }}
            />
          )}

          {activeTab === 'teachers' && (
            <TeacherManager
              teachers={teachers}
              onSaveTeacher={handleSaveTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              onPrintTeacherCard={handlePrintTeacherCard}
            />
          )}

          {activeTab === 'schedule' && (
            <WeeklyScheduleManager
              schedule={schedule}
              onSaveScheduleItem={handleSaveScheduleItem}
              onDeleteScheduleItem={handleDeleteScheduleItem}
            />
          )}

          {activeTab === 'finances' && (
            <FinancialManager
              students={students}
              onUpdateStudentPayment={handleUpdateStudentPayment}
              onPrintCheck={handlePrintCheck}
              onSendSmsReminder={handleQuickSmsReminder}
              onSendBulkSmsReminders={handleQuickSmsBulk}
            />
          )}

          {activeTab === 'grades' && (
            <GradesManager
              students={students}
              reportCards={reportCards}
              onSaveReportCard={handleSaveReportCard}
              onPrintReportCard={handlePrintReportCard}
              onSendSmsGrades={handleQuickSmsGrades}
            />
          )}

          {activeTab === 'followup' && (
            <FollowUpManager
              students={students}
              attendanceRecords={attendanceRecords}
              followUpReports={followUpReports}
              onSaveAttendanceBatch={handleSaveAttendanceBatch}
              onSaveFollowUpReport={handleSaveFollowUpReport}
              onSendFollowUpSms={(st, rep) => {
                const msg = `السيد ولي أمر الطالب ${st.firstName} المحترم، تقرير المتابعة الأسبوعي: المستوى ${rep.academicLevel}، الواجبات: ${rep.homeworkCommitment}. التوصية: ${rep.teacherRecommendations} - ${customSchoolInfo.name}`;
                handleSendSms(st.id, `${st.firstName} ${st.lastName}`, st.guardianPhone, 'متابعة دورية', msg);
                alert(`تم إرسال تقرير المتابعة الأسبوعي لولي أمر الطالب (${st.firstName}) بنجاح!`);
              }}
              onPrintFollowUpReport={handlePrintFollowUp}
            />
          )}

          {activeTab === 'sms' && (
            <SmsNotificationCenter
              students={students}
              smsLogs={smsLogs}
              onSendSms={handleSendSms}
            />
          )}

          {activeTab === 'portal' && (
            <ParentPortal
              students={students}
              reportCards={reportCards}
              attendanceRecords={attendanceRecords}
              followUpReports={followUpReports}
              smsLogs={smsLogs}
              onPrintReportCard={handlePrintReportCard}
              onPrintCheck={handlePrintCheck}
              initialStudentId={urlStudentId}
              onStudentIdChange={(id) => {
                setUrlStudentId(id);
                syncUrlWithTab('portal', id);
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsManager
              onSaveSchoolInfo={(newInfo) => setCustomSchoolInfo(newInfo)}
            />
          )}

        </main>

        {/* Footer */}
        <footer className="no-print border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-slate-600 font-medium">
              <span className="font-bold text-slate-800">{customSchoolInfo.name}</span>
              <span>•</span>
              <span>{customSchoolInfo.directorate}</span>
              <span>•</span>
              <span>العام الدراسي {customSchoolInfo.academicYear}</span>
            </div>

            {/* Developer Attribution in Footer */}
            <DeveloperBadge variant="footer" />
          </div>
        </footer>

      </div>

      {/* Official Document Print / Export Modal */}
      {isPrintModalOpen && (
        <PrintDocumentsModal
          docType={printDocType}
          student={selectedStudentForDoc}
          teacher={selectedTeacherForDoc}
          reportCard={selectedReportCardForDoc}
          followUpReport={selectedFollowUpForDoc}
          schoolInfo={customSchoolInfo}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* Direct Portal & Parent Links Modal */}
      <PortalLinksModal
        isOpen={isPortalLinksModalOpen}
        onClose={() => setIsPortalLinksModalOpen(false)}
        students={students}
        onNavigateToTab={(tab, studentId) => {
          handleTabChange(tab, studentId);
        }}
        initialSelectedStudentId={portalModalStudentId}
      />

    </div>
  );
}
