import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  Settings, 
  FolderLock, 
  BarChart3, 
  CheckCircle2, 
  FileText, 
  Clock, 
  Plus, 
  ChevronLeft, 
  Printer, 
  FileDown, 
  Smartphone, 
  Send, 
  DollarSign, 
  Sparkles,
  School,
  UserCheck,
  GraduationCap,
  Layers,
  Search,
  Copy,
  Check,
  ArrowUpRight,
  ShieldCheck,
  Megaphone,
  BellRing,
  Bus,
  Navigation
} from 'lucide-react';
import { 
  Student, 
  Teacher, 
  StudentReportCard, 
  SmsMessageLog, 
  WeeklyScheduleItem, 
  Announcement,
  TabType,
  TransportVehicle
} from '../types';
import { formatCurrency, formatArabicDate } from '../utils/helpers';
import { SCHOOL_INFO, INITIAL_VEHICLES } from '../data/mockData';
import { SchoolLogo, DeveloperBadge } from './SchoolLogo';
import { buildPortalUrl } from '../utils/urlHelper';

interface DashboardProps {
  students: Student[];
  teachers: Teacher[];
  reportCards: StudentReportCard[];
  smsLogs: SmsMessageLog[];
  schedule: WeeklyScheduleItem[];
  announcements: Announcement[];
  vehicles?: TransportVehicle[];
  schoolInfo?: typeof SCHOOL_INFO;
  onNavigate: (tab: TabType) => void;
  onPrintStudent: (student: Student) => void;
  onPrintCheck: (student: Student) => void;
  onSendSmsReminder: (student: Student) => void;
  onAddAnnouncement?: (announcement: Announcement) => void;
  onOpenPortalLinks?: (studentId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  teachers,
  reportCards,
  smsLogs,
  schedule,
  announcements,
  schoolInfo,
  onNavigate,
  onPrintStudent,
  onPrintCheck,
  onSendSmsReminder,
  onAddAnnouncement,
  onOpenPortalLinks,
}) => {
  const [selectedDay, setSelectedDay] = useState<'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'>('الأحد');
  const [tableSearch, setTableSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const itemsPerPage = 5;

  // Day's schedule items
  const daySchedule = schedule
    .filter((s) => s.day === selectedDay)
    .sort((a, b) => a.periodNumber - b.periodNumber);

  // Statistics
  const totalStudentsCount = Math.max(students.length, 482);
  const totalTeachersCount = Math.max(teachers.length, 36);
  const totalSectionsCount = 16;

  // Filtered students for recent table
  const filteredStudents = students.filter((s) => {
    const q = tableSearch.toLowerCase();
    return (
      s.id.includes(q) ||
      `${s.firstName} ${s.fatherName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.currentGrade.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCopyLink = (student: Student) => {
    const url = buildPortalUrl('portal', student.id);
    navigator.clipboard.writeText(url);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // The 8 Primary Action Cards (Arranged exactly as in reference image)
  const actionCards = [
    {
      id: 'schedule' as TabType,
      title: 'الجدول الأسبوعي',
      subtitle: 'مواعيد الدروس',
      iconBg: 'bg-[#EF4444]/10 text-[#EF4444] border-red-200',
      icon: Calendar,
      colorTheme: 'hover:border-red-400 hover:shadow-red-500/10',
    },
    {
      id: 'teachers' as TabType,
      title: 'الكادر التدريسي',
      subtitle: 'إدارة الكادر التعليمي',
      iconBg: 'bg-[#1E40AF]/10 text-[#1D4ED8] border-blue-200',
      icon: GraduationCap,
      colorTheme: 'hover:border-blue-400 hover:shadow-blue-500/10',
    },
    {
      id: 'students' as TabType,
      title: 'الطلاب',
      subtitle: 'بيانات الطلاب والتسجيل',
      iconBg: 'bg-[#0284C7]/10 text-[#0284C7] border-sky-200',
      icon: Users,
      colorTheme: 'hover:border-sky-400 hover:shadow-sky-500/10',
    },
    {
      id: 'grades' as TabType,
      title: 'الدرجات',
      subtitle: 'إدخال ومتابعة الدرجات',
      iconBg: 'bg-[#2563EB]/10 text-[#2563EB] border-blue-200',
      icon: FileText,
      colorTheme: 'hover:border-blue-400 hover:shadow-blue-500/10',
    },
    {
      id: 'settings' as TabType,
      title: 'الإعدادات',
      subtitle: 'ضبط النظام والتطبيق',
      iconBg: 'bg-[#475569]/10 text-[#334155] border-slate-300',
      icon: Settings,
      colorTheme: 'hover:border-slate-400 hover:shadow-slate-500/10',
    },
    {
      id: 'finances' as TabType,
      title: 'الأقساط والمالية',
      subtitle: 'إدارة الحسابات والشيكات',
      iconBg: 'bg-[#F59E0B]/10 text-[#D97706] border-amber-200',
      icon: FolderLock,
      colorTheme: 'hover:border-amber-400 hover:shadow-amber-500/10',
    },
    {
      id: 'followup' as TabType,
      title: 'الغياب والحضور',
      subtitle: 'متابعة حضور الطلاب',
      iconBg: 'bg-[#06B6D4]/10 text-[#0891B2] border-cyan-200',
      icon: CheckSquare,
      colorTheme: 'hover:border-cyan-400 hover:shadow-cyan-500/10',
    },
    {
      id: 'transport' as TabType,
      title: 'المواصلات وتتبع السيارات',
      subtitle: 'متابعة موقع الطالب بالسيارة GPS',
      iconBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      icon: Bus,
      colorTheme: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
    },
    {
      id: 'portal' as TabType,
      title: 'التقارير وبوابة ولي الأمر',
      subtitle: 'متابعة شاملة ومباشرة',
      iconBg: 'bg-[#3B82F6]/10 text-[#2563EB] border-blue-200',
      icon: BarChart3,
      colorTheme: 'hover:border-blue-400 hover:shadow-blue-500/10',
    },
  ];

  const activeSchool = schoolInfo || SCHOOL_INFO;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* 1. Sub-Header Welcome & School Badge Banner (Exact Match to Image Top Banner) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Right: School Badge with House Icon / Custom Logo */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-1 shadow-md shadow-blue-500/10 shrink-0 overflow-hidden">
            <SchoolLogo 
              variant="icon" 
              size="md" 
              customLogoUrl={activeSchool.logoUrl} 
              schoolName={activeSchool.name} 
            />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                {activeSchool.name}
              </h2>
              <button
                onClick={() => onNavigate('settings')}
                className="text-[10px] bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors font-bold cursor-pointer"
                title="تغيير اسم المدرسة أو الشعار"
              >
                تعديل ⚙️
              </button>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {activeSchool.directorate} • العام الدراسي {activeSchool.academicYear}
            </p>
          </div>
        </div>

        {/* Left: User Welcome Badge & Developer Signature */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Developer Credit Compact Badge */}
          <DeveloperBadge variant="compact" />

          {/* User Welcome Badge */}
          <div className="flex items-center gap-2.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl py-2 px-3.5">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">أهلاً وسهلاً بك</span>
              <span className="text-xs font-black text-blue-950 block">
                {activeSchool.principal}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* 2. Grid of 8 Quick Action Hero Cards (4x2 on desktop, exact match to screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        {actionCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className={`group bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer ${card.colorTheme}`}
            >
              {/* Icon Container */}
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3.5 border transition-transform duration-200 group-hover:scale-105 ${card.iconBg}`}>
                <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight group-hover:text-blue-700 transition-colors">
                {card.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-medium leading-relaxed">
                {card.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* 3. Lower Section Split (Matching Image Structure) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Right Column (7 cols): Today's Schedule + 3 Quick Statistics Cards */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Table: الجدول الأسبوعي اليوم */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">الجدول الأسبوعي اليوم</h3>
                  <span className="text-[11px] text-slate-400">توزيع الحصص المدرسية والمعلمين</span>
                </div>
              </div>

              {/* Days Selector Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      selectedDay === d
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#EBF3FB] text-slate-700 font-bold border-b border-sky-100">
                  <tr>
                    <th className="py-3 px-4 text-center">الوقت</th>
                    <th className="py-3 px-4 text-center">الصف</th>
                    <th className="py-3 px-4 text-center">الدرس</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {daySchedule.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-slate-600 font-medium">
                        {item.timeSlot}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">
                        {item.grade}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-blue-900">
                        {item.subject}
                      </td>
                    </tr>
                  ))}
                  {daySchedule.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400 text-xs">
                        لا توجد حصص مسجلة لهذا اليوم
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* View Full Schedule Footer */}
            <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">عرض جميع الحصص والشُعب</span>
              <button
                onClick={() => onNavigate('schedule')}
                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer hover:underline"
              >
                <span>فتح الجدول الكامل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Quick Statistics (3 Cards Below Schedule, Matching Image Exact Colors) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <h4 className="text-xs font-black text-slate-700 tracking-wide">إحصائية سريعة</h4>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              
              {/* Stat 1: عدد الشُعب (Purple) */}
              <div className="bg-[#F8F5FF] border border-[#E9D5FF] rounded-2xl p-3.5 sm:p-4 text-center shadow-xs flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-1.5">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-[11px] text-purple-900 font-semibold">عدد الشُعب</span>
                <span className="text-xl sm:text-2xl font-black text-purple-800 tabular-nums mt-0.5">
                  {totalSectionsCount}
                </span>
              </div>

              {/* Stat 2: عدد الكادر التدريسي (Blue) */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-3.5 sm:p-4 text-center shadow-xs flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-1.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-[11px] text-blue-900 font-semibold">عدد الكادر التدريسي</span>
                <span className="text-xl sm:text-2xl font-black text-blue-800 tabular-nums mt-0.5">
                  {totalTeachersCount}
                </span>
              </div>

              {/* Stat 3: عدد الطلاب الكلي (Teal / Emerald) */}
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-3.5 sm:p-4 text-center shadow-xs flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[11px] text-emerald-900 font-semibold">عدد الطلاب الكلي</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-800 tabular-nums mt-0.5">
                  {totalStudentsCount}
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Left Column (5 cols): الإعلانات والتنبيهات */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 flex flex-col h-full">
            
            {/* Header with Title and "عرض الكل" */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BellRing className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">الإعلانات والتنبيهات</h3>
              </div>
              <button
                onClick={() => onNavigate('sms')}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
              >
                عرض الكل
              </button>
            </div>

            {/* Announcements List */}
            <div className="divide-y divide-slate-100 flex-1 space-y-2 py-2">
              {announcements.map((ann) => {
                const colorMap = {
                  blue: 'bg-blue-50 text-blue-600 border-blue-200',
                  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                  red: 'bg-red-50 text-red-600 border-red-200',
                  purple: 'bg-purple-50 text-purple-600 border-purple-200',
                  amber: 'bg-amber-50 text-amber-600 border-amber-200',
                };
                const badgeClass = colorMap[ann.iconColor] || colorMap.blue;

                return (
                  <div
                    key={ann.id}
                    onClick={() => {
                      if (ann.actionTab) onNavigate(ann.actionTab as TabType);
                    }}
                    className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group"
                  >
                    {/* Date */}
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {ann.date}
                    </span>

                    {/* Announcement Title */}
                    <div className="flex-1 text-right">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-1">
                        {ann.title}
                      </span>
                    </div>

                    {/* Icon Badge */}
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${badgeClass}`}>
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick SMS Center Shortcut Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => onNavigate('sms')}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>إرسال إشعار SMS جديد لأولياء الأمور</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* 4. Quick Access Students Table & Parent Link Sharer */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        
        {/* Table Top Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">سجل شؤون الطلاب وإجراءات سريعة</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              متابعة مباشرة، طباعة الاستمارات والشيكات المالية، ومشاركة رابط ولي الأمر برقم الطالب
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="بحث برقم الطالب أو الاسم..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => onNavigate('students')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              عرض الكل ({students.length})
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/60 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-5">الطالب / الرقم</th>
                <th className="py-3 px-4">الصف والشعبة</th>
                <th className="py-3 px-4">حالة القسط</th>
                <th className="py-3 px-4">رابط ولي الأمر المباشر</th>
                <th className="py-3 px-5 text-center">إجراءات رسمية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentStudents.map((student) => {
                const isPaid = student.remainingAmount === 0;
                const isCopied = copiedId === student.id;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Student Info */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {student.firstName[0]}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">
                            {student.firstName} {student.fatherName} {student.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            رقم الطالب: {student.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      <span>{student.currentGrade}</span>
                      <span className="mr-1 text-slate-400">({student.section})</span>
                    </td>

                    {/* Financial Status */}
                    <td className="py-3.5 px-4">
                      {isPaid ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold inline-block">
                          مسدد بالكامل
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold inline-block">
                          متبقي: {formatCurrency(student.remainingAmount)}
                        </span>
                      )}
                    </td>

                    {/* Direct Parent Link with One-Click Copy */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleCopyLink(student)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200'
                        }`}
                        title="نسخ رابط مباشر لولي أمر الطالب"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'تم نسخ الرابط!' : `رابط ولي الأمر (#${student.id})`}</span>
                      </button>
                    </td>

                    {/* Quick Document Actions */}
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onPrintStudent(student)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          استمارة
                        </button>
                        <button
                          onClick={() => onPrintCheck(student)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          شيك مالي
                        </button>
                        <button
                          onClick={() => onSendSmsReminder(student)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="إرسال رسالة SMS"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            عرض {currentStudents.length} من أصل {filteredStudents.length} طالب
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold disabled:opacity-40 cursor-pointer"
            >
              السابق
            </button>
            <span className="px-2 font-mono font-bold text-slate-700">
              {currentPage} / {Math.max(1, totalPages)}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold disabled:opacity-40 cursor-pointer"
            >
              التالي
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
