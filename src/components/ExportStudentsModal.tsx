import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Database, 
  CheckCircle2, 
  Users, 
  DollarSign, 
  Phone, 
  GraduationCap, 
  Sparkles,
  Info
} from 'lucide-react';
import { Student } from '../types';
import { SCHOOL_INFO } from '../data/mockData';
import { 
  ExportFieldCategory, 
  ExportFormat, 
  exportStudentsToExcel, 
  exportStudentsToCSV, 
  exportStudentsToJSON 
} from '../utils/exportHelpers';

interface ExportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredStudents: Student[];
  allStudents: Student[];
  currentGradeFilter?: string;
  currentSectionFilter?: string;
  currentSearchTerm?: string;
  schoolInfo?: typeof SCHOOL_INFO;
}

export const ExportStudentsModal: React.FC<ExportStudentsModalProps> = ({
  isOpen,
  onClose,
  filteredStudents,
  allStudents,
  currentGradeFilter,
  currentSectionFilter,
  currentSearchTerm,
  schoolInfo,
}) => {
  const activeSchool = schoolInfo || SCHOOL_INFO;
  
  // Selection states
  const [scope, setScope] = useState<'filtered' | 'all'>('filtered');
  const [category, setCategory] = useState<ExportFieldCategory>('comprehensive');
  const [format, setFormat] = useState<ExportFormat>('excel');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetStudents = scope === 'filtered' ? filteredStudents : allStudents;

  // Calculate quick stats for preview
  const totalStudentsCount = targetStudents.length;
  const totalTuition = targetStudents.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  const totalRemaining = targetStudents.reduce((sum, s) => sum + (Number(s.remainingAmount) || 0), 0);
  const paidCount = targetStudents.filter(s => (Number(s.remainingAmount) || 0) === 0).length;

  const handleExport = () => {
    let result: { success: boolean; filename: string; count: number };

    const dateStr = new Date().toISOString().split('T')[0];
    const prefix = scope === 'filtered' ? 'كشف_مخصص' : 'سجل_عام';

    if (format === 'excel') {
      const filename = `${prefix}_${category}_${dateStr}.xls`;
      result = exportStudentsToExcel(
        targetStudents,
        category,
        activeSchool.name,
        activeSchool.academicYear,
        filename
      );
    } else if (format === 'csv') {
      const filename = `${prefix}_${category}_${dateStr}.csv`;
      result = exportStudentsToCSV(targetStudents, category, filename);
    } else {
      const filename = `نسخة_احتياطية_بيانات_الطلاب_${dateStr}.json`;
      result = exportStudentsToJSON(targetStudents, filename);
    }

    if (result.success) {
      setDownloadSuccess(`تم تحميل الملف بنجاح: ${result.filename} (${result.count} طالب)`);
      setTimeout(() => {
        setDownloadSuccess(null);
      }, 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0">
              <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">تصدير كشوفات الطلاب والنسخ الاحتياطية</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold">
                  Excel & CSV
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1">
                تصدير السجلات بصيغة متوافقة 100% مع Microsoft Excel وجداول البيانات والاحتفاظ بنسخ خارجية.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Notification on success */}
          {downloadSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1">{downloadSuccess}</div>
            </div>
          )}

          {/* Step 1: Select Scope */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">1</span>
              <span>نطاق السجلات المراد تصديرها:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setScope('filtered')}
                className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                  scope === 'filtered'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="font-bold text-xs text-slate-900">الكشف الحالي المصفى</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    scope === 'filtered' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {filteredStudents.length} طالب
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  يقتصر على الطلاب الظاهرين حالياً وفق معايير البحث والفرز المختارة
                  {(currentGradeFilter && currentGradeFilter !== 'all') || currentSearchTerm ? ' (تصفية نشطة)' : ''}.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setScope('all')}
                className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                  scope === 'all'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="font-bold text-xs text-slate-900">كامل السجل المدرسي (الكل)</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    scope === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {allStudents.length} طالب
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  تصدير كافة طلاب المدرسة المسجلين لجميع الصفوف والشُعب لعمل نسخة احتياطية كاملة.
                </p>
              </button>
            </div>
          </div>

          {/* Step 2: Select Category / Template */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">2</span>
              <span>نوع الكشف والحقول المطلوبة:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Comprehensive */}
              <button
                type="button"
                onClick={() => setCategory('comprehensive')}
                className={`p-3 rounded-2xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                  category === 'comprehensive'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${category === 'comprehensive' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1">
                    <span>السجل العام الشامل (كامل)</span>
                    <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">موصى به</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    البيانات الشخصية، العنوان، ولي الأمر، اللوازم، الرسوم، والمدفوعات (37 حقلاً).
                  </p>
                </div>
              </button>

              {/* Financial */}
              <button
                type="button"
                onClick={() => setCategory('financial')}
                className={`p-3 rounded-2xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                  category === 'financial'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${category === 'financial' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">كشف الرسوم والمالية</div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    الكتب، الزي، القسط، الدفعة الأولى والثانية، المتبقي، وحالة السداد.
                  </p>
                </div>
              </button>

              {/* Contacts */}
              <button
                type="button"
                onClick={() => setCategory('contacts')}
                className={`p-3 rounded-2xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                  category === 'contacts'
                    ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${category === 'contacts' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">دليل التواصل وأولياء الأمور</div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    أرقام الهواتف، هاتف الطوارئ، مكان الإقامة، والصفات المهنية.
                  </p>
                </div>
              </button>

              {/* Academic */}
              <button
                type="button"
                onClick={() => setCategory('academic')}
                className={`p-3 rounded-2xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                  category === 'academic'
                    ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${category === 'academic' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">السجل الأكاديمي واللوازم</div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    الصف، الشعبة، الفوج، تسليم الكتب والزي، النقل، والمعدل السابق.
                  </p>
                </div>
              </button>

            </div>
          </div>

          {/* Step 3: Select File Format */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>صيغة الملف المراد تنزيله:</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Excel */}
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  format === 'excel'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <FileSpreadsheet className={`w-6 h-6 ${format === 'excel' ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span className="font-bold text-xs text-slate-900">Microsoft Excel</span>
                <span className="text-[10px] text-emerald-800 font-mono font-medium">(.xls منسق)</span>
              </button>

              {/* CSV */}
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  format === 'csv'
                    ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <FileText className={`w-6 h-6 ${format === 'csv' ? 'text-blue-700' : 'text-slate-400'}`} />
                <span className="font-bold text-xs text-slate-900">ملف نصي CSV</span>
                <span className="text-[10px] text-blue-800 font-mono font-medium">(Excel UTF-8 BOM)</span>
              </button>

              {/* JSON Backup */}
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  format === 'json'
                    ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <Database className={`w-6 h-6 ${format === 'json' ? 'text-purple-700' : 'text-slate-400'}`} />
                <span className="font-bold text-xs text-slate-900">نسخة JSON خام</span>
                <span className="text-[10px] text-purple-800 font-mono font-medium">(أرشفة واستيراد)</span>
              </button>

            </div>
          </div>

          {/* Quick Preview Stats Box */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-slate-700 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                ملخص محتويات الملف المراد تصديره:
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                {activeSchool.name} • {activeSchool.academicYear}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-medium">عدد السجلات</span>
                <span className="text-base font-black text-blue-900">{totalStudentsCount}</span>
                <span className="text-[9px] text-slate-400 block">طالب</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-medium">إجمالي الرسوم</span>
                <span className="text-base font-black text-slate-800">${totalTuition.toLocaleString()}</span>
                <span className="text-[9px] text-slate-400 block">دولار</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-medium">المتبقي ذمة</span>
                <span className={`text-base font-black ${totalRemaining > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  ${totalRemaining.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-400 block">دولار</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-medium">المسددون بالكامل</span>
                <span className="text-base font-black text-emerald-700">{paidCount}</span>
                <span className="text-[9px] text-slate-400 block">طالب</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-white/60 p-2 rounded-lg border border-slate-200/60 flex items-center justify-between">
              <span>ترميز اللغة العربية: <strong>UTF-8 مع BOM قياسي</strong> (عرض صحيح ومباشر في Excel دون رموز غريبة)</span>
              <span className="font-mono text-emerald-700 font-bold">جاهز للتحميل</span>
            </div>
          </div>

          {/* Developer Credit Compact Note */}
          <div className="text-center pt-2 text-[10px] text-slate-400 font-mono">
            نظام إدارة وتصدير السجلات • برمجة المهندس محمود العبدالله (+963 939 841 552)
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            سيتم حفظ الملف مباشرة في مجلد التنزيلات على جهازك.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              إغلاق
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={totalStudentsCount === 0}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل وتصدير الكشف الآن</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
