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
  Sparkles
} from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import { SchoolLogo, DeveloperBadge } from './SchoolLogo';

interface SettingsManagerProps {
  onSaveSchoolInfo?: (newInfo: typeof SCHOOL_INFO) => void;
  onResetAllData?: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  onSaveSchoolInfo,
  onResetAllData,
}) => {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('school_custom_info');
    return saved ? JSON.parse(saved) : { ...SCHOOL_INFO };
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExportData = () => {
    const allData = {
      students: JSON.parse(localStorage.getItem('school_students') || '[]'),
      teachers: JSON.parse(localStorage.getItem('school_teachers') || '[]'),
      reportCards: JSON.parse(localStorage.getItem('school_report_cards') || '[]'),
      attendance: JSON.parse(localStorage.getItem('school_attendance') || '[]'),
      followups: JSON.parse(localStorage.getItem('school_followups') || '[]'),
      smsLogs: JSON.parse(localStorage.getItem('school_sms_logs') || '[]'),
      schedule: JSON.parse(localStorage.getItem('school_schedule') || '[]'),
      announcements: JSON.parse(localStorage.getItem('school_announcements') || '[]'),
      schoolInfo: formData,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      
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

      {/* 4. Backup & Factory Reset */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>النسخ الاحتياطي وإدارة البيانات المدرسية</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-slate-800 text-xs">تصدير نسخة احتياطية كاملة (JSON)</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              تحميل ملف يحتوي على بيانات الطلاب، الكادر، الدرجات، الأقساط، والحضور لحفظها بأمان
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportData}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>تصدير النسخة الاحتياطية</span>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-red-600 text-xs flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>إعادة تعيين البيانات الافتراضية</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              إعادة تهيئة قاعدة البيانات المحلية إلى البيانات النموذجية الأولية
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('هل أنت متأكد من رغبتك في إعادة تعيين البيانات إلى الحالة النموذجية؟')) {
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

    </div>
  );
};
