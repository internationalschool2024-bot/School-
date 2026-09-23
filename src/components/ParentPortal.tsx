import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Calendar, 
  BookOpen, 
  Award, 
  Bell, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  Printer, 
  LogOut, 
  User, 
  Sparkles, 
  ChevronRight, 
  Phone, 
  Clock, 
  Download,
  AlertCircle,
  CheckCircle,
  Delete,
  Copy,
  Check,
  Send,
  Share2,
  RefreshCw,
  X,
  Bus,
  Navigation,
  MapPin,
  Gauge
} from 'lucide-react';
import { Student, StudentReportCard, AttendanceRecord, PeriodicFollowUp, LessonAssignment, SmsMessageLog, TransportVehicle } from '../types';
import { formatCurrency, formatArabicDate, createWhatsAppUrl } from '../utils/helpers';
import { SCHOOL_INFO, INITIAL_LESSONS, INITIAL_VEHICLES } from '../data/mockData';
import { SchoolLogo } from './SchoolLogo';
import { buildPortalUrl, copyToClipboard, syncUrlWithTab } from '../utils/urlHelper';
import { TransportMap } from './TransportMap';

interface ParentPortalProps {
  students: Student[];
  reportCards: StudentReportCard[];
  attendanceRecords: AttendanceRecord[];
  followUpReports: PeriodicFollowUp[];
  smsLogs: SmsMessageLog[];
  vehicles?: TransportVehicle[];
  onPrintReportCard: (student: Student) => void;
  onPrintCheck: (student: Student) => void;
  initialStudentId?: string;
  onStudentIdChange?: (studentId?: string) => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  students,
  reportCards,
  attendanceRecords,
  followUpReports,
  smsLogs,
  vehicles,
  onPrintReportCard,
  onPrintCheck,
  initialStudentId,
  onStudentIdChange,
}) => {
  const [pinCode, setPinCode] = useState<string>(initialStudentId || '');
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'attendance' | 'lessons' | 'grades' | 'notices' | 'finances' | 'transport'>('attendance');
  const [copiedLink, setCopiedLink] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Auto-login from initialStudentId or sessionStorage
  useEffect(() => {
    const targetId = initialStudentId || sessionStorage.getItem('parent_portal_student_id');
    if (targetId) {
      const found = students.find((s) => s.id.toLowerCase() === targetId.trim().toLowerCase());
      if (found) {
        setActiveStudent(found);
        setPinCode(found.id);
        sessionStorage.setItem('parent_portal_student_id', found.id);
      }
    }
  }, [initialStudentId, students]);

  const handleKeypadPress = (digit: string) => {
    setLoginError(null);
    if (pinCode.length < 10) {
      setPinCode((prev) => prev + digit);
    }
  };

  const handleKeypadDelete = () => {
    setLoginError(null);
    setPinCode((prev) => prev.slice(0, -1));
  };

  const handleLogin = (codeToTest?: string) => {
    const targetCode = (codeToTest || pinCode).trim();
    if (!targetCode) {
      setLoginError('يرجى كتابة رقم الطالب للدخول');
      return;
    }

    const found = students.find((s) => s.id.toLowerCase() === targetCode.toLowerCase());
    if (found) {
      setActiveStudent(found);
      setLoginError(null);
      sessionStorage.setItem('parent_portal_student_id', found.id);
      syncUrlWithTab('portal', found.id);
      if (onStudentIdChange) onStudentIdChange(found.id);
    } else {
      setLoginError(`رقم الطالب (${targetCode}) غير مسجل بالنظام. يرجى التأكد من الرقم المسلم من الإدارة.`);
    }
  };

  const handleQuickDemoSelect = (student: Student) => {
    setPinCode(student.id);
    setLoginError(null);
    setActiveStudent(student);
    sessionStorage.setItem('parent_portal_student_id', student.id);
    syncUrlWithTab('portal', student.id);
    if (onStudentIdChange) onStudentIdChange(student.id);
  };

  const handleLogout = () => {
    setActiveStudent(null);
    sessionStorage.removeItem('parent_portal_student_id');
    syncUrlWithTab('portal', undefined);
    if (onStudentIdChange) onStudentIdChange(undefined);
  };

  const handleCopyDirectLink = async () => {
    if (!activeStudent) return;
    const url = buildPortalUrl('portal', activeStudent.id);
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Check if current input matches any student in real time
  const matchedStudentPreview = pinCode.trim() 
    ? students.find((s) => s.id.toLowerCase() === pinCode.trim().toLowerCase()) 
    : null;

  // Student specific data
  const studentReportCard = activeStudent ? reportCards.find((r) => r.studentId === activeStudent.id) : null;
  const studentAttendance = activeStudent ? attendanceRecords.filter((a) => a.studentId === activeStudent.id) : [];
  const studentFollowUp = activeStudent ? followUpReports.find((f) => f.studentId === activeStudent.id) : null;
  const studentNotices = activeStudent ? smsLogs.filter((s) => s.studentId === activeStudent.id) : [];

  // WhatsApp link for the parent
  const activeStudentUrl = activeStudent ? buildPortalUrl('portal', activeStudent.id) : '';
  const whatsAppShareText = activeStudent
    ? `رابط بوابة ولي الأمر لمتابعة الطالب/ـة ${activeStudent.firstName} ${activeStudent.lastName} (رقم الطالب: ${activeStudent.id}):\n${activeStudentUrl}`
    : '';
  const whatsAppShareUrl = activeStudent 
    ? createWhatsAppUrl(activeStudent.guardianPhone, whatsAppShareText)
    : '#';

  return (
    <div className="max-w-4xl mx-auto py-4 px-2 sm:px-4">
      
      {/* If Not Logged In -> Show Mobile Auth Interface matching Screenshots 6 & 7 */}
      {!activeStudent ? (
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-[#0f3d6c] via-[#124b83] to-[#0a2949] text-white p-6 sm:p-10 border border-sky-800 max-w-md mx-auto">
          
          {/* Header section with tree/school icon */}
          <div className="text-center space-y-4">
            
            {/* Official School Logo */}
            <div className="inline-flex flex-col items-center justify-center bg-white rounded-2xl shadow-xl mx-auto p-4 border border-white/20">
              <SchoolLogo variant="full" size="md" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">بوابة أولياء الأمور</h2>
              <p className="text-xs text-sky-200 mt-1 font-medium">
                نافذتك اليومية لمتابعة التحصيل الأكاديمي والحضور في المدرسة الدولية
              </p>
            </div>

            {/* 4 Navigation Icons Preview */}
            <div className="grid grid-cols-4 gap-2 pt-2 max-w-xs mx-auto text-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-sky-100 font-medium">حضوره</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-sky-100 font-medium">دروسه</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-sky-100 font-medium">نتائجه</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
                  <Bell className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-sky-100 font-medium">إشعارات</span>
              </div>
            </div>

          </div>

          {/* White Bottom Card for Student Number Input */}
          <div className="mt-8 bg-white rounded-3xl p-6 text-slate-900 shadow-2xl text-center space-y-4">
            
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto"></div>
            
            <div>
              <h3 className="text-base font-black text-slate-900">تسجيل الدخول برقم الطالب</h3>
              <p className="text-xs text-slate-500 mt-1">
                اكتب رقم الطالب المخصص لابنك في السجلات المدرسية
              </p>
            </div>

            {/* Direct Input Form supporting Keyboard + Enter key */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-3"
            >
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={pinCode}
                  onChange={(e) => {
                    setLoginError(null);
                    setPinCode(e.target.value);
                  }}
                  placeholder="اكتب رقم الطالب هنا (مثال: 10425)..."
                  className="w-full text-center text-xl font-mono font-bold tracking-widest py-3.5 px-4 rounded-2xl bg-sky-50/80 border-2 border-sky-200 focus:border-blue-600 focus:bg-white focus:outline-hidden text-slate-900 shadow-inner"
                  autoFocus
                />
                {pinCode && (
                  <button
                    type="button"
                    onClick={() => {
                      setPinCode('');
                      setLoginError(null);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Real-time Student Match Detection */}
              {matchedStudentPreview && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-right text-xs text-emerald-900 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">{matchedStudentPreview.firstName} {matchedStudentPreview.lastName}</span>
                      <span className="text-emerald-700 block text-[11px]">{matchedStudentPreview.currentGrade} • شعبة {matchedStudentPreview.section}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-200/70 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    رقم معتمد ✓
                  </span>
                </div>
              )}

              {/* Error Message */}
              {loginError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-center gap-2 text-right text-xs text-rose-800 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Login Action Button */}
              <button
                type="submit"
                disabled={pinCode.trim().length === 0}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>دخول لمتابعة ابني</span>
              </button>
            </form>

            <div className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>دخول فوري مباشر برقم الطالب — دون الحاجة لكلمة مرور</span>
            </div>

            {/* Quick Demo Students Picker */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 block mb-2 font-medium">
                أرقام طلاب تجريبية للاختبار السريع:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {students.slice(0, 4).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleQuickDemoSelect(st)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-blue-950 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                  >
                    {st.firstName} ({st.id})
                  </button>
                ))}
              </div>
            </div>

            {/* On-Screen Touch Keypad */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 block mb-2">لوحة أرقام اللمس السريع:</span>
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num.toString())}
                    className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleKeypadDelete}
                  className="py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Delete className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-lg shadow-2xs transition-colors cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleLogin()}
                  className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                >
                  دخول
                </button>
              </div>
            </div>

          </div>

        </div>
      ) : (
        
        /* ========================================================================= */
        /* LOGGED IN PARENT DASHBOARD */
        /* ========================================================================= */
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden space-y-6 pb-8">
          
          {/* Top Hero Banner */}
          <div className="bg-[#1E293B] text-white p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                  {activeStudent.firstName[0]}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[11px] font-black">
                      <span>رقم الطالب: {activeStudent.id}</span>
                    </span>
                    <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                      بوابة ولي الأمر الرسمية
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black">
                    {activeStudent.firstName} {activeStudent.fatherName} {activeStudent.lastName}
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {activeStudent.currentGrade} • شعبة ({activeStudent.section}) • الفوج {activeStudent.regiment}
                  </p>
                </div>
              </div>

              {/* Share & Actions Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Copy Direct Parent Link */}
                <button
                  onClick={handleCopyDirectLink}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    copiedLink 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تم نسخ الرابط المباشر!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ رابط ولي الأمر</span>
                    </>
                  )}
                </button>

                {/* WhatsApp Share Button */}
                <a
                  href={whatsAppShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">واتساب</span>
                </a>

                {/* Logout / Switch Student */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تبديل الطالب</span>
                </button>
              </div>

            </div>

            {/* 6 Main Sub-Tabs with Circular Icons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-6 pt-4 border-t border-white/15 text-center">
              {[
                { id: 'attendance' as const, label: 'حضوره', icon: Calendar },
                { id: 'lessons' as const, label: 'دروسه', icon: BookOpen },
                { id: 'grades' as const, label: 'نتائجه', icon: Award },
                { id: 'finances' as const, label: 'الأقساط', icon: DollarSign },
                { id: 'transport' as const, label: 'السيارة GPS', icon: Bus },
                { id: 'notices' as const, label: 'إشعارات', icon: Bell },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer ${
                      isActive ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'bg-white/10 text-amber-300'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-5 sm:px-8 space-y-6">
            
            {/* 1. ATTENDANCE VIEW */}
            {activeTab === 'attendance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">سجل الحضور والغياب اليومي</h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    نسبة الحضور: 98% (ممتاز)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <span className="text-xs text-slate-500 font-semibold">أيام الحضور</span>
                    <div className="text-2xl font-black text-emerald-600 mt-1">88 يوماً</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <span className="text-xs text-slate-500 font-semibold">أيام الغياب</span>
                    <div className="text-2xl font-black text-rose-600 mt-1">0 أيام</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <span className="text-xs text-slate-500 font-semibold">مرات التأخر</span>
                    <div className="text-2xl font-black text-amber-600 mt-1">0</div>
                  </div>
                </div>

                {/* Follow-up evaluation card */}
                {studentFollowUp && (
                  <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-blue-950 text-sm flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>تقرير المتابعة الأسبوعي من المعلم</span>
                      </h4>
                      <span className="text-xs font-semibold text-blue-700">{studentFollowUp.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-blue-100">
                      {studentFollowUp.behaviorNotes}
                    </p>
                    <div className="text-xs text-blue-950 font-semibold">
                      📌 توصية المربي: {studentFollowUp.teacherRecommendations}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. LESSONS & HOMEWORK VIEW */}
            {activeTab === 'lessons' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">الدروس والواجبات المدرسية المقررة</h3>
                  <span className="text-xs text-slate-500 font-semibold">جدول الأسبوع الحالي</span>
                </div>

                <div className="space-y-3">
                  {INITIAL_LESSONS.map((lesson) => (
                    <div key={lesson.id} className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="inline-block text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full mb-1">
                            {lesson.subject}
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm">{lesson.title}</h4>
                          <p className="text-xs text-slate-600 mt-1">{lesson.description}</p>
                        </div>
                        <div className="text-left text-xs font-semibold text-slate-500 shrink-0">
                          <div className="flex items-center gap-1 text-blue-700 font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>التسليم: {lesson.dueDate}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{lesson.teacherName}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. GRADES & REPORT CARD VIEW */}
            {activeTab === 'grades' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">كشف الدرجات والجلاء المدرسي</h3>
                    <p className="text-xs text-slate-500">الفصل الدراسي الأول • العام {SCHOOL_INFO.academicYear}</p>
                  </div>

                  <button
                    onClick={() => onPrintReportCard(activeStudent)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة الجلاء المدرسي الرسمي</span>
                  </button>
                </div>

                {studentReportCard ? (
                  <div className="space-y-4">
                    
                    {/* Top Result Banner */}
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-4 rounded-xl font-bold flex items-center justify-between shadow-xs">
                      <div>
                        <div className="text-xs uppercase tracking-wide">التقدير العام للنتيجة</div>
                        <div className="text-xl font-black">{studentReportCard.appreciation} • المرتبة ({studentReportCard.rank || 1})</div>
                      </div>
                      <div className="text-left">
                        <div className="text-xs">المعدل العام</div>
                        <div className="text-2xl font-black">{studentReportCard.percentage}%</div>
                      </div>
                    </div>

                    {/* Subjects Grades Breakdown Table */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-100 font-bold text-slate-700">
                          <tr>
                            <th className="py-2.5 px-3">المادة</th>
                            <th className="py-2.5 px-2 text-center">أعمال ونشاط</th>
                            <th className="py-2.5 px-2 text-center">مذاكرات</th>
                            <th className="py-2.5 px-2 text-center">امتحان نهائي</th>
                            <th className="py-2.5 px-2 text-center font-black">المحصلة (100)</th>
                            <th className="py-2.5 px-3">ملاحظة المربي</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {studentReportCard.grades.map((g, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-bold text-slate-900">{g.subjectName}</td>
                              <td className="py-2.5 px-2 text-center">{g.activityScore}</td>
                              <td className="py-2.5 px-2 text-center">{g.test1Score + g.test2Score}</td>
                              <td className="py-2.5 px-2 text-center">{g.finalExamScore}</td>
                              <td className="py-2.5 px-2 text-center font-mono font-black text-blue-900 bg-blue-50/40">
                                {g.totalScore}
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 text-[11px]">{g.gradeNote || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="font-bold text-slate-700">كلمة إدارة المدرسة:</div>
                      <p className="text-slate-600 leading-relaxed italic">
                        "{studentReportCard.teacherRemarks}"
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500">جاري إعداد ورصد كشف الدرجات الرسمي لهذا الفصل</p>
                  </div>
                )}
              </div>
            )}

            {/* 4. FINANCIAL STATUS & VOUCHER VIEW */}
            {activeTab === 'finances' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">البيان المالي والأقساط الدراسية</h3>
                    <p className="text-xs text-slate-500">تفاصيل الدفعات والأقساط المستحقة</p>
                  </div>

                  <button
                    onClick={() => onPrintCheck(activeStudent)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة الشيك المالي / سند القبض</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold">المبلغ الإجمالي للرسوم</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                      {formatCurrency(activeStudent.totalAmount)}
                    </div>
                    <span className="text-[10px] text-slate-400">قسط + كتب + لباس</span>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                    <span className="text-xs text-emerald-800 font-bold">المبلغ المسدد حتى الآن</span>
                    <div className="text-2xl font-black text-emerald-700 mt-1">
                      {formatCurrency(activeStudent.firstPayment + activeStudent.secondPayment)}
                    </div>
                    <span className="text-[10px] text-emerald-600">دفعة 1: {formatCurrency(activeStudent.firstPayment)}</span>
                  </div>

                  <div className={`p-4 rounded-2xl border ${
                    activeStudent.remainingAmount === 0 ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-200'
                  }`}>
                    <span className="text-xs font-bold text-slate-700">المبلغ المتبقي</span>
                    <div className={`text-2xl font-black mt-1 ${
                      activeStudent.remainingAmount === 0 ? 'text-emerald-600' : 'text-amber-700'
                    }`}>
                      {formatCurrency(activeStudent.remainingAmount)}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {activeStudent.remainingAmount === 0 ? 'مسدد بالكامل' : `استحقاق الدفعة 2: ${activeStudent.secondPaymentDueDate}`}
                    </span>
                  </div>
                </div>

                {/* Delivery checks */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 mb-3">حالة استلام اللوازم المدرسية:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${activeStudent.receivedBooks ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span className={activeStudent.receivedBooks ? 'font-bold text-slate-800' : 'text-slate-400'}>
                        الكتب المدرسية
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${activeStudent.receivedUniform ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span className={activeStudent.receivedUniform ? 'font-bold text-slate-800' : 'text-slate-400'}>
                        اللباس المدرسي
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${activeStudent.hasBus ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span className={activeStudent.hasBus ? 'font-bold text-slate-800' : 'text-slate-400'}>
                        المواصلات (الباص)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${activeStudent.syobis ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span className={activeStudent.syobis ? 'font-bold text-slate-800' : 'text-slate-400'}>
                        نظام syobis
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 5. NOTICES & ALERTS VIEW */}
            {activeTab === 'notices' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">التنبيهات والإشعارات الفورية المرسلة لولي الأمر</h3>
                  <span className="text-xs text-slate-500 font-semibold">{studentNotices.length} إشعارات</span>
                </div>

                <div className="space-y-3">
                  {studentNotices.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                      <p className="text-xs text-slate-400">لا توجد إشعارات جديدة مرسلة حتى الآن</p>
                    </div>
                  ) : (
                    studentNotices.map((notice) => (
                      <div key={notice.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-purple-900 px-2 py-0.5 rounded bg-purple-100">
                            {notice.messageType}
                          </span>
                          <span className="text-slate-400 font-mono">{notice.sentAt}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {notice.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 6. LIVE STUDENT TRANSPORTATION & CAR GPS VIEW */}
            {activeTab === 'transport' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Bus className="w-5 h-5 text-blue-600" />
                      <span>متابعة موقع سيارة وباص الطالب لحظياً (GPS)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      تتبع الحافلة مباشرة على الخريطة ومعرفة موعد الوصول ونقطة الركوب
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>اتصال حي بنظام التتبع الملاحي</span>
                  </span>
                </div>

                {activeStudent.hasBus ? (
                  (() => {
                    const pool = (vehicles && vehicles.length > 0 ? vehicles : INITIAL_VEHICLES);
                    const studentVehicle = pool.find(v => v.id === activeStudent.busId) || pool[0];

                    return (
                      <div className="space-y-4">
                        
                        {/* Status Alert Banner */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                              <Navigation className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">حالة ركوب الطالب بالسيارة اليوم:</div>
                              <div className="text-sm font-black text-blue-950 mt-0.5">
                                {activeStudent.busTripStatus || 'في انتظار الحافلة'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            <div className="bg-white/80 px-3 py-1.5 rounded-xl border border-blue-100">
                              <span className="text-slate-400 block text-[10px]">موعد الصباح</span>
                              <span className="font-bold text-slate-800 font-mono">{activeStudent.busPickupTime || '07:15 ص'}</span>
                            </div>
                            <div className="bg-white/80 px-3 py-1.5 rounded-xl border border-blue-100">
                              <span className="text-slate-400 block text-[10px]">موعد المساء</span>
                              <span className="font-bold text-slate-800 font-mono">{activeStudent.busDropoffTime || '02:30 م'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Live Map */}
                        {studentVehicle && (
                          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                            <TransportMap
                              vehicle={studentVehicle}
                              selectedStudent={activeStudent}
                              className="h-[380px]"
                              isSimulating={true}
                            />
                          </div>
                        )}

                        {/* Vehicle & Contacts Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          
                          {/* Driver Info */}
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block">سائق الحافلة</span>
                              <div className="font-bold text-slate-900 mt-0.5">
                                {activeStudent.busDriverName || studentVehicle?.driverName || 'أ. سائق الحافلة'}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5" dir="ltr">
                                {activeStudent.busDriverPhone || studentVehicle?.driverPhone || '—'}
                              </div>
                            </div>

                            {(activeStudent.busDriverPhone || studentVehicle?.driverPhone) && (
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`tel:${activeStudent.busDriverPhone || studentVehicle?.driverPhone}`}
                                  className="p-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                                  title="اتصال هاتفي بالسائق"
                                >
                                  <Phone className="w-4 h-4" />
                                </a>
                                <a
                                  href={`https://wa.me/${(activeStudent.busDriverPhone || studentVehicle?.driverPhone || '').replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                                  title="مراسلة عبر واتساب"
                                >
                                  <Send className="w-4 h-4" />
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Supervisor Info */}
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block">المشرفة المرافقة بالسيارة</span>
                              <div className="font-bold text-slate-900 mt-0.5">
                                {activeStudent.busSupervisorName || studentVehicle?.supervisorName || 'المشرفة'}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5" dir="ltr">
                                {activeStudent.busSupervisorPhone || studentVehicle?.supervisorPhone || '—'}
                              </div>
                            </div>

                            {(activeStudent.busSupervisorPhone || studentVehicle?.supervisorPhone) && (
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`tel:${activeStudent.busSupervisorPhone || studentVehicle?.supervisorPhone}`}
                                  className="p-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                                  title="اتصال هاتفي بالمشرفة"
                                >
                                  <Phone className="w-4 h-4" />
                                </a>
                                <a
                                  href={`https://wa.me/${(activeStudent.busSupervisorPhone || studentVehicle?.supervisorPhone || '').replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                                  title="مراسلة عبر واتساب"
                                >
                                  <Send className="w-4 h-4" />
                                </a>
                              </div>
                            )}
                          </div>

                        </div>

                        {/* Location Details */}
                        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">نقطة تجمع ومحطة الطالب: </span>
                            <span>{activeStudent.busStopName || activeStudent.detailedAddress || activeStudent.residencePlace}</span>
                            <div className="text-[11px] text-amber-700 mt-1">
                              * يرجى التواجد عند نقطة التجمع قبل 5 دقائق من موعد وصول الحافلة المحدد حرصاً على عدم التأخر.
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })()
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Bus className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">خدمة النقل والمواصلات غير مفعلة لهذا الطالب</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      هذا الطالب غير مسجل حالياً في خدمة الحافلات المدرسية اليومية. إذا كنتم ترغبون في الاشتراك بالخدمة وتخصيص حافلة ومتابعة رحلات الطالب المباشرة، يرجى مراجعة إدارة النقل في المدرسة.
                    </p>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
