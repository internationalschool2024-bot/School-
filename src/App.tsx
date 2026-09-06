import React, { useState, useEffect } from 'react';
import { 
  INITIAL_STUDENTS, 
  INITIAL_TEACHERS, 
  INITIAL_REPORT_CARDS, 
  INITIAL_ATTENDANCE, 
  INITIAL_FOLLOW_UPS, 
  INITIAL_SMS_LOGS,
  SCHOOL_INFO
} from './data/mockData';
import { 
  Student, 
  Teacher, 
  StudentReportCard, 
  AttendanceRecord, 
  PeriodicFollowUp, 
  SmsMessageLog 
} from './types';
import { TabType } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { StudentManager } from './components/StudentManager';
import { TeacherManager } from './components/TeacherManager';
import { FinancialManager } from './components/FinancialManager';
import { GradesManager } from './components/GradesManager';
import { FollowUpManager } from './components/FollowUpManager';
import { SmsNotificationCenter } from './components/SmsNotificationCenter';
import { ParentPortal } from './components/ParentPortal';
import { PrintDocumentsModal, PrintableDocType } from './components/PrintDocumentsModal';
import { PortalLinksModal } from './components/PortalLinksModal';
import { SchoolLogo } from './components/SchoolLogo';
import { getRouteFromUrl, syncUrlWithTab } from './utils/urlHelper';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  MessageSquare, 
  Smartphone, 
  Search, 
  UserPlus, 
  Send, 
  Menu, 
  X,
  Bell,
  GraduationCap,
  Link as LinkIcon
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

  // Persistence State with local storage fallback
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

  // Modal Print State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printDocType, setPrintDocType] = useState<PrintableDocType>('student_form');
  const [selectedStudentForDoc, setSelectedStudentForDoc] = useState<Student | null>(null);
  const [selectedTeacherForDoc, setSelectedTeacherForDoc] = useState<Teacher | null>(null);
  const [selectedReportCardForDoc, setSelectedReportCardForDoc] = useState<StudentReportCard | null>(null);
  const [selectedFollowUpForDoc, setSelectedFollowUpForDoc] = useState<PeriodicFollowUp | null>(null);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  // Student Handlers
  const handleSaveStudent = (savedStudent: Student) => {
    setStudents((prev) => {
      const idx = prev.findIndex((s) => s.id === savedStudent.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedStudent;
        return copy;
      }
      return [savedStudent, ...prev];
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  // Teacher Handlers
  const handleSaveTeacher = (savedTeacher: Teacher) => {
    setTeachers((prev) => {
      const idx = prev.findIndex((t) => t.id === savedTeacher.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedTeacher;
        return copy;
      }
      return [savedTeacher, ...prev];
    });
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
  };

  // Financial Payment update
  const handleUpdateStudentPayment = (
    studentId: string, 
    firstPayment: number, 
    secondPayment: number, 
    secondPaymentDate?: string
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const totalPaid = firstPayment + secondPayment;
          const remainingAmount = Math.max(0, s.totalAmount - totalPaid);
          return {
            ...s,
            firstPayment,
            secondPayment,
            secondPaymentDate: secondPaymentDate || s.secondPaymentDate,
            remainingAmount,
          };
        }
        return s;
      })
    );
  };

  // Report Card Handlers
  const handleSaveReportCard = (savedReportCard: StudentReportCard) => {
    setReportCards((prev) => {
      const idx = prev.findIndex((rc) => rc.id === savedReportCard.id || (rc.studentId === savedReportCard.studentId && rc.term === savedReportCard.term));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedReportCard;
        return copy;
      }
      return [savedReportCard, ...prev];
    });
  };

  // Attendance Handlers
  const handleSaveAttendanceBatch = (records: AttendanceRecord[]) => {
    setAttendanceRecords((prev) => {
      const copy = [...prev];
      records.forEach((newRec) => {
        const idx = copy.findIndex((r) => r.studentId === newRec.studentId && r.date === newRec.date);
        if (idx >= 0) {
          copy[idx] = newRec;
        } else {
          copy.push(newRec);
        }
      });
      return copy;
    });
  };

  // Follow-up Handlers
  const handleSaveFollowUpReport = (report: PeriodicFollowUp) => {
    setFollowUpReports((prev) => {
      const idx = prev.findIndex((f) => f.id === report.id || f.studentId === report.studentId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = report;
        return copy;
      }
      return [report, ...prev];
    });
  };

  // SMS & Messaging Handlers
  const handleSendSms = (
    studentId: string, 
    studentName: string, 
    phone: string, 
    type: any, 
    content: string
  ) => {
    const newLog: SmsMessageLog = {
      id: `SMS-${Date.now()}`,
      studentId,
      studentName,
      parentPhone: phone,
      messageType: type,
      content,
      sentAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      status: 'تم الإرسال',
      channel: 'SMS',
    };
    setSmsLogs((prev) => [newLog, ...prev]);
  };

  // Print Document Launchers
  const handlePrintStudentForm = (student: Student) => {
    setSelectedStudentForDoc(student);
    setPrintDocType('student_form');
    setIsPrintModalOpen(true);
  };

  const handlePrintTeacherCard = (teacher: Teacher) => {
    setSelectedTeacherForDoc(teacher);
    setPrintDocType('teacher_card');
    setIsPrintModalOpen(true);
  };

  const handlePrintCheck = (student: Student) => {
    setSelectedStudentForDoc(student);
    setPrintDocType('financial_check');
    setIsPrintModalOpen(true);
  };

  const handlePrintReportCard = (student: Student) => {
    setSelectedStudentForDoc(student);
    const rc = reportCards.find((r) => r.studentId === student.id) || null;
    setSelectedReportCardForDoc(rc);
    setPrintDocType('report_card');
    setIsPrintModalOpen(true);
  };

  const handlePrintFollowUp = (student: Student, report: PeriodicFollowUp) => {
    setSelectedStudentForDoc(student);
    setSelectedFollowUpForDoc(report);
    setPrintDocType('follow_up');
    setIsPrintModalOpen(true);
  };

  // Quick SMS Actions
  const handleQuickSmsReminder = (student: Student) => {
    const msg = `السيد ولي أمر الطالب ${student.firstName} ${student.lastName} المحترم، نود تذكيركم بموعد استحقاق الدفعة الثانية من القسط وقدرها ${student.remainingAmount}$ المستحقة بتاريخ ${student.secondPaymentDueDate}. - ${SCHOOL_INFO.name}`;
    handleSendSms(student.id, `${student.firstName} ${student.lastName}`, student.guardianPhone, 'تنبيه قسط', msg);
    alert(`تم إرسال رسالة تذكير بالقسط عبر SMS لولي أمر الطالب (${student.firstName})`);
  };

  const handleQuickSmsBulk = (unpaidList: Student[]) => {
    unpaidList.forEach((st) => {
      const msg = `السيد ولي أمر الطالب ${st.firstName} ${st.lastName} المحترم، تذكير بسداد القسط المتبقي وقدره ${st.remainingAmount}$ - ${SCHOOL_INFO.name}`;
      handleSendSms(st.id, `${st.firstName} ${st.lastName}`, st.guardianPhone, 'تنبيه قسط', msg);
    });
    alert(`تم إرسال ${unpaidList.length} رسالة تذكير مالي دفعة واحدة لأولياء الأمور بنجاح!`);
  };

  const handleQuickSmsGrades = (student: Student, report: StudentReportCard) => {
    const msg = `نبارك لولي أمر الطالب ${student.firstName} ${student.lastName} تفوقه في نتائج ${report.term} وحصوله على معدل ${report.percentage}% بتقدير ${report.appreciation}. - ${SCHOOL_INFO.name}`;
    handleSendSms(student.id, `${student.firstName} ${student.lastName}`, student.guardianPhone, 'كشف علامات', msg);
    alert(`تم إرسال إشعار النتيجة لولي أمر الطالب (${student.firstName}) بنجاح!`);
  };

  const handleQuickSmsFollowUp = (student: Student, report: PeriodicFollowUp) => {
    const msg = `السيد ولي أمر الطالب ${student.firstName} المحترم، تقرير المتابعة الأسبوعي: المستوى ${report.academicLevel}، الواجبات: ${report.homeworkCommitment}. التوصية: ${report.teacherRecommendations} - ${SCHOOL_INFO.name}`;
    handleSendSms(student.id, `${student.firstName} ${student.lastName}`, student.guardianPhone, 'متابعة دورية', msg);
    alert(`تم إرسال تقرير المتابعة الأسبوعي لولي أمر الطالب (${student.firstName}) بنجاح!`);
  };

  const navItems = [
    { id: 'dashboard' as TabType, label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'students' as TabType, label: 'شؤون الطلاب', icon: Users },
    { id: 'teachers' as TabType, label: 'الهيئة التدريسية', icon: BookOpen },
    { id: 'finances' as TabType, label: 'الأقساط والمالية', icon: DollarSign },
    { id: 'grades' as TabType, label: 'كشوفات العلامات', icon: FileText },
    { id: 'followup' as TabType, label: 'التقارير الدورية', icon: CheckCircle2 },
    { id: 'sms' as TabType, label: 'إرسال SMS', icon: MessageSquare, badge: smsLogs.length },
    { id: 'portal' as TabType, label: 'بوابة أولياء الأمور', icon: Smartphone, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex overflow-hidden selection:bg-blue-200 selection:text-blue-900" dir="rtl">
      
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Professional Polish Sidebar (Dark Slate #1E293B) */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50 w-64 bg-[#1E293B] flex flex-col h-full shrink-0
        transform transition-transform duration-200 ease-in-out no-print
        ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-700/80 bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-md shrink-0">
              <SchoolLogo variant="icon" size="sm" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-sm font-black text-white tracking-tight">المدرسة الدولية</span>
              <span className="text-[10px] text-amber-400 font-bold tracking-wide">International School</span>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  handleTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full rounded-lg p-3 flex items-center justify-between text-sm font-medium transition-colors cursor-pointer text-right ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                } ${item.highlight && !isActive ? 'text-amber-300 hover:text-amber-200' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {Boolean(item.badge) && !isActive && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 text-[10px] font-bold border border-blue-700/50">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Direct Portal Links Generator Button in Sidebar */}
          <div className="pt-3 border-t border-slate-700/80">
            <button
              onClick={() => {
                setPortalModalStudentId(undefined);
                setIsPortalLinksModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-amber-400" />
                <span>روابط البوابات والمشاركة</span>
              </div>
              <span className="text-[10px] bg-amber-400/20 px-1.5 py-0.5 rounded text-amber-200">
                رابط مباشر
              </span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-700 text-xs text-slate-400 text-center flex flex-col gap-1">
          <div className="font-semibold text-slate-300">إصدار التعليم المطور v2.0</div>
          <div className="text-[10px] text-slate-500">{SCHOOL_INFO.academicYear} • {SCHOOL_INFO.institution}</div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-30 no-print">
          
          <div className="flex items-center gap-3">
            {/* Hamburger on Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar */}
            <div className="relative w-60 sm:w-80 md:w-96">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="بحث عن طالب أو معلم أو رقم..."
                className="w-full bg-slate-100 border-none rounded-full pr-10 pl-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Direct Links Modal Button in Header */}
            <button
              onClick={() => {
                setPortalModalStudentId(undefined);
                setIsPortalLinksModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="توليد ونسخ روابط البوابات ورابط ولي الأمر برقم الطالب"
            >
              <LinkIcon className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden xs:inline sm:inline">روابط البوابات 🔗</span>
            </button>

            <button
              onClick={() => handleTabChange('students')}
              className="hidden sm:inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>إضافة طالب جديد +</span>
            </button>

            <button
              onClick={() => handleTabChange('sms')}
              className="hidden md:inline-flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>إرسال SMS</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col text-left items-end">
                <span className="text-sm font-bold text-slate-800">{SCHOOL_INFO.principal}</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">مدير النظام</span>
              </div>
              <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full border border-blue-200 flex items-center justify-center font-bold text-xs">
                أ.ع
              </div>
            </div>

          </div>

        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          
          {activeTab === 'dashboard' && (
            <Dashboard
              students={students}
              teachers={teachers}
              reportCards={reportCards}
              smsLogs={smsLogs}
              onNavigate={(tab) => setActiveTab(tab as TabType)}
              onPrintStudent={handlePrintStudentForm}
              onPrintCheck={handlePrintCheck}
              onSendSmsReminder={handleQuickSmsReminder}
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
              onOpenSms={(st) => {
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
              onSendFollowUpSms={handleQuickSmsFollowUp}
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

        </main>

        {/* Footer */}
        <footer className="no-print border-t border-slate-200 bg-white py-3.5 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>{SCHOOL_INFO.name} • {SCHOOL_INFO.institution} © {SCHOOL_INFO.academicYear}</span>
            <span className="text-slate-400">نظام ناصح للتعليم المطور • دعم كامل للطباعة الرسمية والتنبيهات المباشرة</span>
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
