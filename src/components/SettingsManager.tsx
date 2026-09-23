import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Building, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Save, 
  RotateCcw, 
  ShieldAlert, 
  Check, 
  Sliders,
  Database,
  Download,
  Upload,
  Image,
  Trash2,
  Code,
  Smartphone,
  Sparkles,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
  Layers,
  Info,
  RefreshCw
} from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import { SchoolLogo, DeveloperBadge } from './SchoolLogo';

interface SettingsManagerProps {
  onSaveSchoolInfo?: (newInfo: typeof SCHOOL_INFO) => void;
  onResetAllData?: () => void;
  onRestoreAllData?: (backupData: any) => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  onSaveSchoolInfo,
  onResetAllData,
  onRestoreAllData,
}) => {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('school_custom_info');
    return saved ? JSON.parse(saved) : { ...SCHOOL_INFO };
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backupFeedback, setBackupFeedback] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pendingBackupData, setPendingBackupData] = useState<any | null>(null);
  const [importStats, setImportStats] = useState<{
    fileName: string;
    fileSize: string;
    studentsCount: number;
    teachersCount: number;
    reportCardsCount: number;
    attendanceCount: number;
    followupsCount: number;
    smsLogsCount: number;
    scheduleCount: number;
    schoolName: string;
    academicYear: string;
    exportDate: string;
    totalKeys: number;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح (PNG, JPG, SVG, WebP)');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const updated = { ...formData, logoUrl: base64 };
        setFormData(updated);
        localStorage.setItem('school_custom_info', JSON.stringify(updated));
        if (onSaveSchoolInfo) onSaveSchoolInfo(updated);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    const updated = { ...formData, logoUrl: '' };
    setFormData(updated);
    localStorage.setItem('school_custom_info', JSON.stringify(updated));
    if (onSaveSchoolInfo) onSaveSchoolInfo(updated);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('school_custom_info', JSON.stringify(formData));
    if (onSaveSchoolInfo) onSaveSchoolInfo(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // 1. Export entire system data including all localStorage entries
  const handleExportFullSystemData = () => {
    try {
      // Collect all raw localStorage keys
      const localStorageDump: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          localStorageDump[key] = localStorage.getItem(key) || '';
        }
      }

      const students = JSON.parse(localStorage.getItem('school_students') || '[]');
      const teachers = JSON.parse(localStorage.getItem('school_teachers') || '[]');
      const reportCards = JSON.parse(localStorage.getItem('school_report_cards') || '[]');
      const attendance = JSON.parse(localStorage.getItem('school_attendance') || '[]');
      const followups = JSON.parse(localStorage.getItem('school_followups') || '[]');
      const smsLogs = JSON.parse(localStorage.getItem('school_sms_logs') || '[]');
      const schedule = JSON.parse(localStorage.getItem('school_schedule') || '[]');
      const announcements = JSON.parse(localStorage.getItem('school_announcements') || '[]');
      const schoolCustom = JSON.parse(localStorage.getItem('school_custom_info') || JSON.stringify(formData));

      const backupPayload = {
        metadata: {
          system: 'منظومة الإدارة المدرسية المتطورة',
          version: '2.5.0',
          backupType: 'FULL_SYSTEM_BACKUP',
          exportTimestamp: new Date().toISOString(),
          exportDateFormatted: new Date().toLocaleString('ar-SY', { dateStyle: 'full', timeStyle: 'short' }),
          developer: 'برمجة وتطوير المهندس محمود العبدالله (أبو أنس الحكيم) • هاتف: 963939841552+',
        },
        schoolInfo: schoolCustom,
        counts: {
          students: students.length,
          teachers: teachers.length,
          reportCards: reportCards.length,
          attendance: attendance.length,
          followups: followups.length,
          smsLogs: smsLogs.length,
          schedule: schedule.length,
          announcements: announcements.length,
          totalLocalStorageKeys: Object.keys(localStorageDump).length,
        },
        data: {
          students,
          teachers,
          reportCards,
          attendance,
          followups,
          smsLogs,
          schedule,
          announcements,
          schoolInfo: schoolCustom,
        },
        // Complete mirror of every single key in localStorage
        localStorageDump,
      };

      const jsonStr = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      const schoolSlug = (schoolCustom.name || 'المدرسة').replace(/[\s/\\?%*:|"<>]/g, '_');
      const filename = `نسخة_احتياطية_شاملة_للنظام_${schoolSlug}_${dateStr}.json`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupFeedback({
        type: 'success',
        title: 'تم تصدير كامل بيانات النظام بنجاح',
        message: `تم إنشاء وتحميل ملف النسخة الاحتياطية (${filename}) شاملاً ${students.length} طالب، ${teachers.length} معلم، وكافة إعدادات المنظومة وسجلات localStorage (${Object.keys(localStorageDump).length} مفتاح تخزين).`,
      });
      setTimeout(() => setBackupFeedback(null), 8000);
    } catch (err: any) {
      setBackupFeedback({
        type: 'error',
        title: 'تعذر تصدير البيانات',
        message: err?.message || 'حدث خطأ غير متوقع أثناء تجميع بيانات النظام للتصدير.',
      });
    }
  };

  // 2. Handle file selection for import
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setBackupFeedback({
        type: 'error',
        title: 'صيغة ملف غير صالحة',
        message: 'يرجى اختيار ملف بصيغة JSON (.json) يحتوي على بيانات النسخة الاحتياطية للنظام.',
      });
      if (jsonFileInputRef.current) jsonFileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Extract collections
        let students: any[] = [];
        let teachers: any[] = [];
        let reportCards: any[] = [];
        let attendance: any[] = [];
        let followups: any[] = [];
        let smsLogs: any[] = [];
        let schedule: any[] = [];
        let schoolInfoObj: any = null;

        // Check if full backup format
        if (parsed.data) {
          students = parsed.data.students || [];
          teachers = parsed.data.teachers || [];
          reportCards = parsed.data.reportCards || [];
          attendance = parsed.data.attendance || [];
          followups = parsed.data.followups || [];
          smsLogs = parsed.data.smsLogs || [];
          schedule = parsed.data.schedule || [];
          schoolInfoObj = parsed.data.schoolInfo || parsed.schoolInfo;
        } else if (parsed.localStorageDump) {
          // Parse from localStorageDump
          try { students = JSON.parse(parsed.localStorageDump['school_students'] || '[]'); } catch {}
          try { teachers = JSON.parse(parsed.localStorageDump['school_teachers'] || '[]'); } catch {}
          try { reportCards = JSON.parse(parsed.localStorageDump['school_report_cards'] || '[]'); } catch {}
          try { attendance = JSON.parse(parsed.localStorageDump['school_attendance'] || '[]'); } catch {}
          try { followups = JSON.parse(parsed.localStorageDump['school_followups'] || '[]'); } catch {}
          try { smsLogs = JSON.parse(parsed.localStorageDump['school_sms_logs'] || '[]'); } catch {}
          try { schedule = JSON.parse(parsed.localStorageDump['school_schedule'] || '[]'); } catch {}
          try { schoolInfoObj = JSON.parse(parsed.localStorageDump['school_custom_info'] || '{}'); } catch {}
        } else {
          // Direct keys
          students = parsed.students || [];
          teachers = parsed.teachers || [];
          reportCards = parsed.reportCards || [];
          attendance = parsed.attendance || [];
          followups = parsed.followups || [];
          smsLogs = parsed.smsLogs || [];
          schedule = parsed.schedule || [];
          schoolInfoObj = parsed.schoolInfo || null;
        }

        // Validate that this is actually our school system data
        const totalRecognizedItems = students.length + teachers.length + reportCards.length + attendance.length + (parsed.localStorageDump ? Object.keys(parsed.localStorageDump).length : 0);
        
        if (totalRecognizedItems === 0 && !schoolInfoObj) {
          setBackupFeedback({
            type: 'error',
            title: 'ملف غير معتمد',
            message: 'الملف المختار لا يحتوي على أي سجلات أو بيانات صالحة خاصة بمنظومة الإدارة المدرسية.',
          });
          if (jsonFileInputRef.current) jsonFileInputRef.current.value = '';
          return;
        }

        // Format file size
        const sizeInKb = (file.size / 1024).toFixed(1) + ' كيلوبايت';

        setImportStats({
          fileName: file.name,
          fileSize: sizeInKb,
          studentsCount: students.length,
          teachersCount: teachers.length,
          reportCardsCount: reportCards.length,
          attendanceCount: attendance.length,
          followupsCount: followups.length,
          smsLogsCount: smsLogs.length,
          scheduleCount: schedule.length,
          schoolName: schoolInfoObj?.name || parsed.metadata?.schoolName || 'المدرسة',
          academicYear: schoolInfoObj?.academicYear || 'الحالي',
          exportDate: parsed.metadata?.exportDateFormatted || parsed.metadata?.exportTimestamp || 'تاريخ غير محدد',
          totalKeys: parsed.localStorageDump ? Object.keys(parsed.localStorageDump).length : 8,
        });

        setPendingBackupData({
          parsed,
          normalized: {
            students,
            teachers,
            reportCards,
            attendance,
            followups,
            smsLogs,
            schedule,
            announcements: parsed.data?.announcements || parsed.announcements || [],
            schoolInfo: schoolInfoObj || formData,
            localStorageDump: parsed.localStorageDump || null,
          }
        });

        setIsImportModalOpen(true);
      } catch (err: any) {
        setBackupFeedback({
          type: 'error',
          title: 'خطأ في قراءة ملف JSON',
          message: 'تعذر قراءة أو فك ترميز ملف JSON. يرجى التأكد من سلامة الملف وعدم تلفه.',
        });
      } finally {
        if (jsonFileInputRef.current) jsonFileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // 3. Confirm and execute system restore
  const handleConfirmRestore = () => {
    if (!pendingBackupData) return;

    try {
      const { normalized, parsed } = pendingBackupData;

      // 1. If raw localStorageDump exists, restore all keys first
      if (parsed.localStorageDump && typeof parsed.localStorageDump === 'object') {
        Object.entries(parsed.localStorageDump).forEach(([k, v]) => {
          if (typeof v === 'string') {
            localStorage.setItem(k, v);
          } else if (v !== null && v !== undefined) {
            localStorage.setItem(k, JSON.stringify(v));
          }
        });
      }

      // 2. Ensure each primary entity is saved explicitly
      if (normalized.students && normalized.students.length > 0) {
        localStorage.setItem('school_students', JSON.stringify(normalized.students));
      }
      if (normalized.teachers && normalized.teachers.length > 0) {
        localStorage.setItem('school_teachers', JSON.stringify(normalized.teachers));
      }
      if (normalized.reportCards && normalized.reportCards.length > 0) {
        localStorage.setItem('school_report_cards', JSON.stringify(normalized.reportCards));
      }
      if (normalized.attendance && normalized.attendance.length > 0) {
        localStorage.setItem('school_attendance', JSON.stringify(normalized.attendance));
      }
      if (normalized.followups && normalized.followups.length > 0) {
        localStorage.setItem('school_followups', JSON.stringify(normalized.followups));
      }
      if (normalized.smsLogs && normalized.smsLogs.length > 0) {
        localStorage.setItem('school_sms_logs', JSON.stringify(normalized.smsLogs));
      }
      if (normalized.schedule && normalized.schedule.length > 0) {
        localStorage.setItem('school_schedule', JSON.stringify(normalized.schedule));
      }
      if (normalized.announcements && normalized.announcements.length > 0) {
        localStorage.setItem('school_announcements', JSON.stringify(normalized.announcements));
      }
      if (normalized.schoolInfo) {
        localStorage.setItem('school_custom_info', JSON.stringify(normalized.schoolInfo));
        setFormData(normalized.schoolInfo);
        if (onSaveSchoolInfo) onSaveSchoolInfo(normalized.schoolInfo);
      }

      // 3. Call parent onRestoreAllData to live-update all React states
      if (onRestoreAllData) {
        onRestoreAllData({
          students: normalized.students,
          teachers: normalized.teachers,
          reportCards: normalized.reportCards,
          attendance: normalized.attendance,
          followups: normalized.followups,
          smsLogs: normalized.smsLogs,
          schedule: normalized.schedule,
          announcements: normalized.announcements,
          schoolInfo: normalized.schoolInfo,
          localStorageDump: parsed.localStorageDump,
        });
      }

      setIsImportModalOpen(false);
      setPendingBackupData(null);
      setImportStats(null);

      setBackupFeedback({
        type: 'success',
        title: 'تمت استعادة كامل بيانات النظام بنجاح',
        message: `تم تحديث كافة السجلات بنجاح (${normalized.students.length} طالب، ${normalized.teachers.length} معلم، والبيانات المالية والأكاديمية). تم تطبيق التغييرات فوراً.`,
      });
      setTimeout(() => setBackupFeedback(null), 8000);
    } catch (err: any) {
      setBackupFeedback({
        type: 'error',
        title: 'فشل في استعادة البيانات',
        message: err?.message || 'حدث خطأ أثناء كتابة البيانات المستوردة إلى قاعدة البيانات المحلية.',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Toast Notification for Backup / Restore */}
      {backupFeedback && (
        <div className={`p-4 rounded-2xl shadow-md border flex items-start justify-between gap-3 animate-in slide-in-from-top duration-200 ${
          backupFeedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
            : 'bg-red-50 border-red-200 text-red-950'
        }`}>
          <div className="flex items-start gap-3">
            {backupFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-xs font-bold">{backupFeedback.title}</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{backupFeedback.message}</p>
            </div>
          </div>
          <button 
            onClick={() => setBackupFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">إعدادات النظام والمنشأة والشعار</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              تغيير اسم المدرسة، رفع اللوغو الخاص، وضبط بيانات المطور والتوقيعات الرسمية
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in duration-200 shadow-2xs">
            <Check className="w-4 h-4" />
            <span>تم حفظ التغييرات بنجاح</span>
          </div>
        )}
      </div>

      {/* 2. Developer Attribution Card (برمجة المهندس محمود العبدالله) */}
      <DeveloperBadge variant="card" />

      {/* 3. Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-6">
        
        {/* Section A: Logo & Brand Customization */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <Image className="w-4 h-4 text-blue-600" />
            <span>شعار المدرسة واللوغو (Logo Customization)</span>
          </h3>

          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 flex flex-col sm:flex-row items-center gap-6">
            
            {/* Live Logo Preview Box */}
            <div className="flex flex-col items-center text-center shrink-0">
              <span className="text-[11px] font-bold text-slate-500 mb-2">المعاينة الحالية</span>
              <div className="w-24 h-24 bg-white rounded-2xl border-2 border-dashed border-slate-300 p-2 flex items-center justify-center shadow-xs overflow-hidden">
                <SchoolLogo 
                  variant="icon" 
                  size="xl" 
                  customLogoUrl={formData.logoUrl} 
                  schoolName={formData.name}
                />
              </div>
              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="mt-2 text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>إزالة الشعار</span>
                </button>
              )}
            </div>

            {/* Upload & Link Controls */}
            <div className="flex-1 space-y-3 w-full">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رفع صورة الشعار من الجهاز (PNG, JPG, SVG)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="logo-file-input"
                  />
                  <label
                    htmlFor="logo-file-input"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-4 h-4" />
                    <span>اختيار ملف لوغو من الكمبيوتر</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    أو ضع رابط صورة مباشر بالأسفل
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  أو رابط صورة اللوغو عبر الإنترنت (URL)
                </label>
                <input
                  type="url"
                  value={formData.logoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/school-logo.png"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="text-[11px] text-slate-500">
                * يظهر الشعار في الشريط العلوي، القائمة الجانبية، كشوفات العلامات، الشيكات المالية، واستمارات التسجيل الرسمية فوراً.
              </div>
            </div>

          </div>
        </div>

        {/* Section B: School Name & Official Ministry Data */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <Building className="w-4 h-4 text-blue-600" />
            <span>اسم المدرسة والهوية الرسمية</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم المدرسة (قابل للتغيير بالكامل) *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="مثال: المدرسة الدولية أو متوسطة الرافدين للبنين"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">العام الدراسي</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الجهة المشرفة / المؤسسة</label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الوزارة الرسمية</label>
              <input
                type="text"
                value={formData.ministry}
                onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المديرية العامة للتربية</label>
              <input
                type="text"
                value={formData.directorate}
                onChange={(e) => setFormData({ ...formData, directorate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">شعار المدرسة التعبيري</label>
              <input
                type="text"
                value={formData.motto}
                onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Section C: Administrative Signatures */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-blue-600" />
            <span>المسؤولون والموقعون الرسميون (للوثائق والشهادات)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مدير المدرسة</label>
              <input
                type="text"
                value={formData.principal}
                onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">منظم الوثائق وسجلات القيد</label>
              <input
                type="text"
                value={formData.documentOrganizedBy}
                onChange={(e) => setFormData({ ...formData, documentOrganizedBy: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المحاسب المالي</label>
              <input
                type="text"
                value={formData.financialOfficer}
                onChange={(e) => setFormData({ ...formData, financialOfficer: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مشرف المرحلة</label>
              <input
                type="text"
                value={formData.sectionSupervisor}
                onChange={(e) => setFormData({ ...formData, sectionSupervisor: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Section D: Contact & Address */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <Phone className="w-4 h-4 text-blue-600" />
            <span>بيانات الاتصال والتواصل المدرسي</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">هاتف المدرسة</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">العنوان والموقع</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات والشعار واسم المدرسة</span>
          </button>
        </div>

      </form>

      {/* 4. Comprehensive Backup & Restore */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>النسخ الاحتياطي وإدارة بيانات النظام الكاملة</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            تخزين مشفر ومحلي لجميع مفاتيح localStorage
          </span>
        </div>

        {/* Action 1: Export Full System Data */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-200 transition-colors">
          <div className="space-y-1">
            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <FileJson className="w-4 h-4 text-emerald-600" />
              <span>تصدير كامل بيانات النظام (ملف JSON شامل)</span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-xl leading-relaxed">
              حفظ وتصدير كافة بيانات المنظومة وجميع سجلات localStorage (الطلاب، الكادر التعليمي، الدرجات، الحضور والغياب، الرسائل، الجدول الأسبوعي، الشعار، والإعدادات) في ملف JSON واحد للنسخ الاحتياطي والأرشفة الخارجية.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportFullSystemData}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer shrink-0"
            title="تصدير ملف JSON يحتوي على كافة بيانات localStorage"
          >
            <Download className="w-4 h-4" />
            <span>تصدير كامل بيانات النظام</span>
          </button>
        </div>

        {/* Action 2: Import & Restore System Data */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-200 transition-colors">
          <div className="space-y-1">
            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>استيراد واستعادة بيانات النظام من ملف JSON</span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-xl leading-relaxed">
              استعادة كافة بيانات النظام من ملف نسخة احتياطية JSON تم تصديره سابقاً، مع فحص سلامة الملف ومعاينة السجلات قبل التأكيد وتحديث المنظومة فورياً.
            </p>
          </div>

          <input
            type="file"
            ref={jsonFileInputRef}
            onChange={handleImportFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => jsonFileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer shrink-0"
            title="استيراد ملف JSON واستعادة السجلات"
          >
            <Upload className="w-4 h-4" />
            <span>استيراد واستعادة البيانات</span>
          </button>
        </div>

        {/* Action 3: Reset Default Sample Data */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-red-600 text-xs flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>إعادة تعيين البيانات الافتراضية (إعادة ضبط المصنع)</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              مسح البيانات المحلية من المتصفح وإعادة تهيئة قاعدة البيانات إلى البيانات النموذجية الأولية
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('هل أنت متأكد تماماً من رغبتك في مسح كافة البيانات وإعادة تعيين النظام إلى الحالة النموذجية؟ يوصى بتصدير نسخة احتياطية أولاً.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-4 h-4 text-red-600" />
            <span>إعادة ضبط المصنع</span>
          </button>
        </div>
      </div>

      {/* 5. Import Confirmation & Preview Modal */}
      {isImportModalOpen && importStats && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5 text-blue-100" />
                </div>
                <div>
                  <h3 className="text-base font-bold">معاينة وتأكيد استعادة بيانات النظام</h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    تم فحص ملف النسخة الاحتياطية والتحقق من سلامة بنيته
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setPendingBackupData(null);
                  setImportStats(null);
                }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              
              {/* File Info Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileJson className="w-4 h-4 text-blue-600" />
                    <span>اسم الملف: {importStats.fileName}</span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    الحجم: {importStats.fileSize} • تاريخ التصدير: {importStats.exportDate}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg font-bold text-[11px]">
                    المدرسة: {importStats.schoolName}
                  </span>
                </div>
              </div>

              {/* Data Breakdown Statistics */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>محتويات وسجلات النسخة الاحتياطية المكتشفة:</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2.5">
                    <div className="text-base font-black text-blue-700">{importStats.studentsCount}</div>
                    <div className="text-[11px] font-bold text-slate-600">سجل طالب</div>
                  </div>

                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-2.5">
                    <div className="text-base font-black text-indigo-700">{importStats.teachersCount}</div>
                    <div className="text-[11px] font-bold text-slate-600">سجل معلم وكادر</div>
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5">
                    <div className="text-base font-black text-emerald-700">{importStats.reportCardsCount}</div>
                    <div className="text-[11px] font-bold text-slate-600">كشف درجات</div>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-2.5">
                    <div className="text-base font-black text-amber-700">{importStats.attendanceCount}</div>
                    <div className="text-[11px] font-bold text-slate-600">سجل حضور</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center mt-2.5">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2">
                    <div className="text-xs font-bold text-slate-800">{importStats.followupsCount}</div>
                    <div className="text-[10px] text-slate-500">متابعة دورية</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2">
                    <div className="text-xs font-bold text-slate-800">{importStats.smsLogsCount}</div>
                    <div className="text-[10px] text-slate-500">رسالة SMS</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2">
                    <div className="text-xs font-bold text-slate-800">{importStats.totalKeys} مفاتيح</div>
                    <div className="text-[10px] text-slate-500">سجلات localStorage</div>
                  </div>
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">تنبيه هام قبل الاستعادة:</div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    سيؤدي تأكيد الاستعادة إلى استبدال كافة البيانات الحالية المخزنة في النظام بالبيانات الواردة في هذا الملف وتحديث جميع الصفحات تلقائياً دون فقدان بياناتك الجديدة.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setPendingBackupData(null);
                    setImportStats(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء الأمر
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestore}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs hover:shadow cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد واستعادة البيانات الآن</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
