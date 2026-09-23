import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Smartphone, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Link as LinkIcon,
  Calendar,
  Settings
} from 'lucide-react';
import { Student } from '../types';
import { TabType } from './Navbar';
import { buildPortalUrl, copyToClipboard } from '../utils/urlHelper';
import { createWhatsAppUrl } from '../utils/helpers';
import { SCHOOL_INFO } from '../data/mockData';

interface PortalLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onNavigateToTab: (tab: TabType, studentId?: string) => void;
  initialSelectedStudentId?: string;
}

export const PortalLinksModal: React.FC<PortalLinksModalProps> = ({
  isOpen,
  onClose,
  students,
  onNavigateToTab,
  initialSelectedStudentId,
}) => {
  const [activeCategory, setActiveCategory] = useState<'parents' | 'admin'>('parents');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialSelectedStudentId || (students.length > 0 ? students[0].id : '')
  );
  const [studentSearch, setStudentSearch] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (key: string, url: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2500);
    }
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Filter students for the selector
  const filteredStudents = students.filter((s) => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.id.includes(q) ||
      s.currentGrade.toLowerCase().includes(q)
    );
  });

  const parentGeneralUrl = buildPortalUrl('portal');
  const parentStudentUrl = selectedStudent ? buildPortalUrl('portal', selectedStudent.id) : '';

  // WhatsApp message for student direct link
  const whatsAppText = selectedStudent
    ? `السلام عليكم ورحمة الله وبركاته،\nحضرة ولي أمر الطالب/ـة ${selectedStudent.firstName} ${selectedStudent.lastName} المحترم،\n\nنرفق لكم الرابط المباشر لبوابة ولي الأمر لمتابعة الدروس، الحضور والغياب، الأقساط، وكشوفات العلامات الرسمية:\n${parentStudentUrl}\n\nرقم الطالب المعتمد: ${selectedStudent.id}\n${SCHOOL_INFO.name}`
    : '';

  const whatsAppUrl = selectedStudent
    ? createWhatsAppUrl(selectedStudent.guardianPhone, whatsAppText)
    : '#';

  const adminPortals = [
    {
      id: 'dashboard' as TabType,
      title: 'لوحة التحكم والمؤشرات الرئيسية',
      desc: 'إحصائيات التسجيل، المؤشرات المالية، وحالة المدرسة اليومية',
      icon: LayoutDashboard,
      color: 'bg-blue-600',
      url: buildPortalUrl('dashboard'),
    },
    {
      id: 'students' as TabType,
      title: 'بوابة شؤون الطلاب والتسجيل',
      desc: 'سجلات الطلاب، بيانات الهوية، والطباعة الرسمية للاستمارات',
      icon: Users,
      color: 'bg-indigo-600',
      url: buildPortalUrl('students'),
    },
    {
      id: 'finances' as TabType,
      title: 'بوابة الأقساط والمالية وسندات القبض',
      desc: 'إدارة الدفعات، إصدار الشيكات وسندات القبض المعتمدة',
      icon: DollarSign,
      color: 'bg-emerald-600',
      url: buildPortalUrl('finances'),
    },
    {
      id: 'grades' as TabType,
      title: 'بوابة كشوفات العلامات والجلاء المدرسي',
      desc: 'رصد الدرجات والمعدلات وطباعة الجلاء المدرسي الفصلي A4',
      icon: FileText,
      color: 'bg-purple-600',
      url: buildPortalUrl('grades'),
    },
    {
      id: 'followup' as TabType,
      title: 'بوابة المتابعة الدورية وسجل الحضور',
      desc: 'تسجيل الحضور اليومي، التقييم السلوكي، والتقارير الدورية',
      icon: CheckCircle2,
      color: 'bg-teal-600',
      url: buildPortalUrl('followup'),
    },
    {
      id: 'sms' as TabType,
      title: 'مركز إرسال الرسائل والتنبيهات SMS',
      desc: 'إشعارات الأقساط، النتائج الفورية، والتواصل عبر الرسائل والواتساب',
      icon: MessageSquare,
      color: 'bg-amber-600',
      url: buildPortalUrl('sms'),
    },
    {
      id: 'teachers' as TabType,
      title: 'بوابة الكادر التعليمي والتدريس',
      desc: 'سجلات المعلمين والأنصبة الأسبوعية والرواتب الشهرية',
      icon: BookOpen,
      color: 'bg-sky-600',
      url: buildPortalUrl('teachers'),
    },
    {
      id: 'schedule' as TabType,
      title: 'الجدول الأسبوعي ومواعيد الدروس',
      desc: 'توزيع الحصص المدرسية، القاعات، وأيام الدوام الأسبوعي',
      icon: Calendar,
      color: 'bg-red-600',
      url: buildPortalUrl('schedule'),
    },
    {
      id: 'settings' as TabType,
      title: 'إعدادات النظام والنسخ الاحتياطي',
      desc: 'تخصيص الهوية والوزارة والمديرية والنسخ الاحتياطي للبيانات',
      icon: Settings,
      color: 'bg-slate-600',
      url: buildPortalUrl('settings'),
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-[#1E293B] text-white p-5 sm:p-6 flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <LinkIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>روابط البوابات الإلكترونية والمشاركة</span>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
                  روابط مباشرة
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                روابط مستقلة لكل بوابة مع دعم الدخول برقم الطالب في بوابة أولياء الأمور
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Parent Links vs Admin Links) */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveCategory('parents')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-b-2 ${
              activeCategory === 'parents'
                ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>بوابة أولياء الأمور (روابط الطلاب)</span>
          </button>

          <button
            onClick={() => setActiveCategory('admin')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-b-2 ${
              activeCategory === 'admin'
                ? 'bg-white text-slate-900 border-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-slate-700" />
            <span>روابط البوابات الإدارية ({adminPortals.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {activeCategory === 'parents' && (
            <div className="space-y-6">
              
              {/* Card 1: General Parent Portal Link */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200/80 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        الرابط العام لبوابة أولياء الأمور
                      </h3>
                      <p className="text-[11px] text-slate-600">
                        صفحة الدخول العامة — يدخل ولي الأمر بكتابة <b>رقم الطالب</b> فقط
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy('parent-general', parentGeneralUrl)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        copiedKey === 'parent-general'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      }`}
                    >
                      {copiedKey === 'parent-general' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>تم نسخ الرابط!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ الرابط العام</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        onNavigateToTab('portal');
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-100/60 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>فتح البوابة</span>
                    </button>
                  </div>
                </div>

                {/* URL preview box */}
                <div className="bg-white/80 border border-blue-200 rounded-xl p-2.5 font-mono text-xs text-blue-900 break-all select-all flex items-center justify-between gap-2">
                  <span className="truncate">{parentGeneralUrl}</span>
                </div>
              </div>

              {/* Card 2: Direct Student Link (Auto-login by Student ID) */}
              <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                      <span>رابط مباشر مخصص لطالب (دخول تلقائي برقم الطالب)</span>
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    ميزة التوليد المباشر
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  اختر طالباً لتوليد رابط مباشر خاص بولي أمره، يحتوي رقم الطالب مشفراً في الرابط، ليفتح حساب ابنه مباشرة دون الحاجة لإدخال الرقم:
                </p>

                {/* Student Selector & Search */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      ابحث أو اختر الطالب:
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="ابحث بالاسم أو رقم الطالب..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pr-8 pl-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      الطالب المحدد ({filteredStudents.length}):
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      {filteredStudents.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.firstName} {st.lastName} (رقم الطالب: {st.id} - {st.currentGrade})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Student Information Banner & Dedicated Link */}
                {selectedStudent && (
                  <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">
                          {selectedStudent.firstName} {selectedStudent.lastName}
                        </span>
                        <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-mono font-bold">
                          رقم الطالب: {selectedStudent.id}
                        </span>
                        <span className="text-slate-600 font-medium">
                          {selectedStudent.currentGrade} • الشعبة {selectedStudent.section}
                        </span>
                      </div>

                      <div className="text-slate-500 font-mono text-[11px]">
                        هاتف ولي الأمر: {selectedStudent.guardianPhone}
                      </div>
                    </div>

                    {/* Dedicated URL */}
                    <div className="bg-white border border-amber-300 rounded-lg p-2.5 font-mono text-xs text-slate-800 break-all select-all flex items-center justify-between gap-2">
                      <span className="truncate">{parentStudentUrl}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => handleCopy(`student-${selectedStudent.id}`, parentStudentUrl)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          copiedKey === `student-${selectedStudent.id}`
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                        }`}
                      >
                        {copiedKey === `student-${selectedStudent.id}` ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>تم نسخ رابط الطالب!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>نسخ رابط ولي أمر {selectedStudent.firstName}</span>
                          </>
                        )}
                      </button>

                      {/* WhatsApp Share Button */}
                      <a
                        href={whatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>مشاركة عبر واتساب لولي الأمر</span>
                      </a>

                      <button
                        onClick={() => {
                          onNavigateToTab('portal', selectedStudent.id);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        <span>تجربة الرابط الآن</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {activeCategory === 'admin' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                انقر على زر "نسخ" لمشاركة رابط أي بوابة إدارية مع المعلمين أو الكادر الإداري المختص:
              </p>

              <div className="grid grid-cols-1 gap-3">
                {adminPortals.map((p) => {
                  const Icon = p.icon;
                  const isCopied = copiedKey === `admin-${p.id}`;

                  return (
                    <div
                      key={p.id}
                      className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${p.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {p.title}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              ?tab={p.id}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {p.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleCopy(`admin-${p.id}`, p.url)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ الرابط</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            onNavigateToTab(p.id);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>دخول</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-blue-600" />
            <span>يمكن حفظ أي رابط في المفضلة أو إرساله مباشرة للمستفيد</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
