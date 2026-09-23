import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  DollarSign, 
  FileText, 
  Send, 
  Edit, 
  Trash2, 
  Download, 
  CheckSquare, 
  Square, 
  CheckCircle, 
  AlertCircle,
  X,
  Save,
  GraduationCap,
  Eye,
  Bus,
  BookOpen,
  Shirt,
  Link as LinkIcon,
  ExternalLink,
  FileSpreadsheet,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { Student, GradeLevel } from '../types';
import { GRADE_LEVELS, SCHOOL_INFO } from '../data/mockData';
import { formatCurrency, formatArabicDate, exportToCSV, calculateStudentBalance } from '../utils/helpers';
import { buildPortalUrl, copyToClipboard } from '../utils/urlHelper';
import { ExportStudentsModal } from './ExportStudentsModal';
import { exportStudentsToExcel } from '../utils/exportHelpers';

interface StudentManagerProps {
  students: Student[];
  schoolInfo?: typeof SCHOOL_INFO;
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onPrintDocument: (student: Student, docType: 'registration' | 'check' | 'reportCard' | 'followup') => void;
  onOpenSms: (student: Student) => void;
  initialOpenNewModal?: boolean;
  onOpenPortalLinks?: () => void;
  onOpenShareParentLink?: (student: Student) => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  onSaveStudent,
  onDeleteStudent,
  onPrintDocument,
  onOpenSms,
  initialOpenNewModal = false,
  onOpenPortalLinks,
  onOpenShareParentLink,
  schoolInfo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(initialOpenNewModal);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const activeSchool = schoolInfo || SCHOOL_INFO;

  // New Student default state
  const createEmptyStudent = (): Student => {
    const nextId = (10425 + students.length + Math.floor(Math.random() * 10)).toString();
    return {
      id: nextId,
      idcard: '',
      firstName: '',
      fatherName: '',
      grandFatherName: '',
      motherName: '',
      lastName: '',
      gender: 'ذكر',
      birthDate: '2015-01-01',
      birthPlace: 'دمشق',
      residencePlace: 'دمشق',
      detailedAddress: '',
      previousGrade: 'الصف الرابع الابتدائي',
      currentGrade: 'الصف الخامس الابتدائي',
      section: 'أ',
      regiment: '1',
      previousSchool: '',
      gpa: 90,
      healthStatus: 'سليم',
      talent: '',
      notes: '',
      guardianName: '',
      guardianNickname: '',
      guardianRelation: 'أب',
      guardianJob: '',
      guardianPhone: '',
      emergencyName: '',
      emergencyNickname: '',
      emergencyRelation: 'أم',
      emergencyJob: '',
      emergencyPhone: '',
      receivedBooks: true,
      receivedUniform: true,
      hasBus: false,
      syobis: true,
      booksFee: 80,
      uniformFee: 60,
      tuitionFee: 900,
      totalAmount: 1040,
      firstPayment: 520,
      firstPaymentDate: new Date().toISOString().split('T')[0],
      secondPayment: 0,
      secondPaymentDate: '',
      secondPaymentDueDate: '2026-01-15',
      remainingAmount: 520,
      enrollmentDate: new Date().toISOString().split('T')[0],
    };
  };

  const [formData, setFormData] = useState<Student>(createEmptyStudent());

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData(createEmptyStudent());
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({ ...student });
    setIsModalOpen(true);
  };

  // Recompute financials when fees change
  const handleFinancialFieldChange = (field: keyof Student, value: any) => {
    const updated = { ...formData, [field]: value };
    const { total, remaining } = calculateStudentBalance(updated);
    setFormData({
      ...updated,
      totalAmount: total,
      remainingAmount: remaining,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('يرجى إدخال اسم الطالب ونسبته بشكل صحيح');
      return;
    }
    const { total, remaining } = calculateStudentBalance(formData);
    const studentToSave: Student = {
      ...formData,
      totalAmount: total,
      remainingAmount: remaining,
    };
    onSaveStudent(studentToSave);
    setIsModalOpen(false);
  };

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.firstName.includes(searchTerm) ||
        s.fatherName.includes(searchTerm) ||
        s.lastName.includes(searchTerm) ||
        s.id.includes(searchTerm) ||
        s.idcard.includes(searchTerm) ||
        s.guardianPhone.includes(searchTerm);

      const matchGrade = selectedGrade === 'all' || s.currentGrade === selectedGrade;
      const matchSection = selectedSection === 'all' || s.section === selectedSection;

      let matchPayment = true;
      if (paymentFilter === 'paid') matchPayment = s.remainingAmount === 0;
      if (paymentFilter === 'unpaid') matchPayment = s.remainingAmount > 0;

      return matchSearch && matchGrade && matchSection && matchPayment;
    });
  }, [students, searchTerm, selectedGrade, selectedSection, paymentFilter]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() !== '' ||
    selectedGrade !== 'all' ||
    selectedSection !== 'all' ||
    paymentFilter !== 'all'
  );

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGrade('all');
    setSelectedSection('all');
    setPaymentFilter('all');
  };

  const handleQuickExportCurrentExcel = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const gradePart = selectedGrade !== 'all' ? `_${selectedGrade.replace(/\s+/g, '_')}` : '';
    const filename = `كشف_الطلاب${gradePart}_${dateStr}.xls`;
    
    const res = exportStudentsToExcel(
      filteredStudents,
      'comprehensive',
      activeSchool.name,
      activeSchool.academicYear,
      filename
    );

    if (res.success) {
      setExportToast(`تم تصدير كشف الطلاب بنجاح إلى ملف Excel: ${filename} (${res.count} طالب)`);
      setTimeout(() => setExportToast(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {exportToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>{exportToast}</span>
          </div>
          <button 
            onClick={() => setExportToast(null)}
            className="p-1 rounded-lg hover:bg-emerald-700 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Controls Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">سجل بيانات الطلاب</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                {filteredStudents.length} طالب
              </span>
              {hasActiveFilters && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                  (تصفية نشطة)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              إدخال وتعديل استمارات التسجيل، تصدير الكشوفات لـ Excel/CSV، وإدارة شؤون الطلاب.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-add-new-student"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة طالب جديد +</span>
            </button>

            {onOpenPortalLinks && (
              <button
                onClick={onOpenPortalLinks}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-colors cursor-pointer"
                title="إدارة ونسخ روابط البوابات"
              >
                <LinkIcon className="w-4 h-4 text-amber-700" />
                <span>روابط البوابات 🔗</span>
              </button>
            )}

            {/* Comprehensive Export Modal Trigger */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="تصدير كشوفات مخصصة أو نسخة احتياطية شاملة إلى Excel أو CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>تصدير كشوفات الطلاب (Excel / CSV)</span>
            </button>

            {/* Quick 1-Click Excel Export for current view */}
            <button
              onClick={handleQuickExportCurrentExcel}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="تحميل سريع ومباشر للكشف المعروض حالياً كملف Excel"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">تحميل سريع</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالاسم، رقم الطالب، الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Grade Filter */}
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كافة الصفوف الدراسية</option>
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كافة الشُعب</option>
              <option value="أ">شعبة أ</option>
              <option value="ب">شعبة ب</option>
              <option value="ج">شعبة ج</option>
              <option value="د">شعبة د</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كافة حالات الأقساط</option>
              <option value="paid">مسدد بالكامل ($0 متبقي)</option>
              <option value="unpaid">مترتب عليه قسط مالي</option>
            </select>
          </div>

        </div>
      </div>

      {/* Active Filter Banner with Direct Export Action */}
      {hasActiveFilters && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-950">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="font-bold">
              تصفية نشطة: تم العثور على {filteredStudents.length} طالب من إجمالي {students.length} طالب مسجل.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickExportCurrentExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>تصدير هذا الكشف المصفى ({filteredStudents.length})</span>
            </button>
            <button
              onClick={resetFilters}
              className="text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              إلغاء التصفية
            </button>
          </div>
        </div>
      )}

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">رقم الطالب (ID)</th>
                <th className="py-3.5 px-4">اسم الطالب ونسبته</th>
                <th className="py-3.5 px-4">الصف والشعبة والفوج</th>
                <th className="py-3.5 px-4">ولي الأمر والهاتف</th>
                <th className="py-3.5 px-4">الخدمات المستلمة</th>
                <th className="py-3.5 px-4">الوضع المالي</th>
                <th className="py-3.5 px-4 text-center">الإجراءات والطباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    لا توجد بيانات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* ID */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {st.id}
                      </span>
                    </td>

                    {/* Full Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 text-sm">
                        {st.firstName} {st.fatherName} {st.grandFatherName} {st.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        الأم: {st.motherName || '—'} • {st.gender}
                      </div>
                    </td>

                    {/* Grade & Section */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">{st.currentGrade}</div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        شعبة <span className="text-blue-700 font-bold">{st.section}</span> • الفوج {st.regiment}
                      </div>
                    </td>

                    {/* Guardian */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{st.guardianName} ({st.guardianRelation})</div>
                      <div className="text-[11px] text-slate-400 font-mono dir-ltr text-right">{st.guardianPhone}</div>
                    </td>

                    {/* Deliverables Badges */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {st.receivedBooks && (
                          <span title="استلم الكتب المدرسية" className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200/50">
                            <BookOpen className="w-3 h-3" />
                            <span>كتب</span>
                          </span>
                        )}
                        {st.receivedUniform && (
                          <span title="استلم اللباس المدرسي" className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                            <Shirt className="w-3 h-3" />
                            <span>لباس</span>
                          </span>
                        )}
                        {st.hasBus && (
                          <span 
                            title={`مشترك بالمواصلات: ${st.busNumber || 'حافلة المدرسة'} | محطة: ${st.busStopName || st.residencePlace} | الحالة: ${st.busTripStatus || 'في الانتظار'}`} 
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200"
                          >
                            <Bus className="w-3 h-3 text-amber-600" />
                            <span>باص {st.busTripStatus ? `(${st.busTripStatus})` : ''}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Financial status */}
                    <td className="py-3.5 px-4">
                      {st.remainingAmount === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          <CheckCircle className="w-3 h-3" />
                          <span>خالص ({formatCurrency(st.totalAmount)})</span>
                        </span>
                      ) : (
                        <div>
                          <div className="font-bold text-orange-700">متبقي: {formatCurrency(st.remainingAmount)}</div>
                          <div className="text-[10px] text-slate-400">مسدد: {formatCurrency(st.firstPayment + st.secondPayment)}</div>
                        </div>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1">
                        
                        {/* Print Registration Form (استمارة التسجيل) */}
                        <button
                          title="طباعة استمارة التسجيل الرسمية"
                          onClick={() => onPrintDocument(st, 'registration')}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                        </button>

                        {/* Print Financial Voucher (شيك مالي) */}
                        <button
                          title="طباعة شيك مالي / سند قبض"
                          onClick={() => onPrintDocument(st, 'check')}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                        >
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                        </button>

                        {/* Print Report Card (الجلاء المدرسي) */}
                        <button
                          title="طباعة كشف العلامات والجلاء المدرسي"
                          onClick={() => onPrintDocument(st, 'reportCard')}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4 text-slate-600" />
                        </button>

                        {/* Direct Parent Portal Link */}
                        <button
                          title={`نسخ رابط ولي أمر الطالب (${st.firstName}) للدخول المباشر برقم الطالب`}
                          onClick={async () => {
                            if (onOpenShareParentLink) {
                              onOpenShareParentLink(st);
                            } else {
                              const url = buildPortalUrl('portal', st.id);
                              const success = await copyToClipboard(url);
                              if (success) {
                                alert(`تم نسخ رابط ولي أمر الطالب (${st.firstName} ${st.lastName}) بنجاح!\nالرابط: ${url}\nرقم الطالب: ${st.id}`);
                              }
                            }
                          }}
                          className="p-1.5 rounded-md hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>

                        {/* SMS / WhatsApp */}
                        <button
                          title="إرسال تنبيه SMS / واتساب فوري"
                          onClick={() => onOpenSms(st)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                        >
                          <Send className="w-4 h-4 text-blue-500" />
                        </button>

                        {/* Edit */}
                        <button
                          title="تعديل بيانات الطالب"
                          onClick={() => handleOpenEditModal(st)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          title="حذف السجل"
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف سجل الطالب ${st.firstName} ${st.lastName}؟`)) {
                              onDeleteStudent(st.id);
                            }
                          }}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STUDENT REGISTRATION & EDIT MODAL (Comprehensive match with Images 2 & 5) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {editingStudent ? `تعديل استمارة الطالب: ${formData.firstName} ${formData.lastName}` : 'استمارة تسجيل طالب جديد (العام الدراسي 2025/2026)'}
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  المدرسة الدولية • مؤسسة إعمار التعليمية
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* SECTION 1: Personal & Academic Data (بيانات الطالب) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-purple-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <GraduationCap className="w-4 h-4 text-purple-700" />
                  <span>أولاً: بيانات الطالب الأكاديمية والشخصية</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">رقم الطالب (ID):</label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الرقم الوطني (idcard):</label>
                    <input
                      type="text"
                      value={formData.idcard}
                      onChange={(e) => setFormData({ ...formData, idcard: e.target.value })}
                      placeholder="01090384921"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الاسم:</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="مثال: كريم"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم الأب:</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="مثال: أحمد"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم الجد:</label>
                    <input
                      type="text"
                      value={formData.grandFatherName}
                      onChange={(e) => setFormData({ ...formData, grandFatherName: e.target.value })}
                      placeholder="مثال: محمد"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم الأم:</label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      placeholder="مثال: سارة"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">النسبة / الكنية:</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="مثال: العبدالله"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الجنس:</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-bold"
                    >
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاريخ الولادة:</label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">مكان الولادة:</label>
                    <input
                      type="text"
                      value={formData.birthPlace}
                      onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                      placeholder="دمشق"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">مكان الإقامة:</label>
                    <input
                      type="text"
                      value={formData.residencePlace}
                      onChange={(e) => setFormData({ ...formData, residencePlace: e.target.value })}
                      placeholder="المزة"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">العنوان بالتفصيل:</label>
                    <input
                      type="text"
                      value={formData.detailedAddress}
                      onChange={(e) => setFormData({ ...formData, detailedAddress: e.target.value })}
                      placeholder="دمشق - المزة - شارع الهدى"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الصف الحالي:</label>
                    <select
                      value={formData.currentGrade}
                      onChange={(e) => setFormData({ ...formData, currentGrade: e.target.value as GradeLevel })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-bold text-purple-900"
                    >
                      {GRADE_LEVELS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الصف السابق:</label>
                    <input
                      type="text"
                      value={formData.previousGrade}
                      onChange={(e) => setFormData({ ...formData, previousGrade: e.target.value })}
                      placeholder="الصف الرابع الابتدائي"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الشعبة:</label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-bold"
                    >
                      <option value="أ">أ</option>
                      <option value="ب">ب</option>
                      <option value="ج">ج</option>
                      <option value="د">د</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الفوج:</label>
                    <input
                      type="text"
                      value={formData.regiment}
                      onChange={(e) => setFormData({ ...formData, regiment: e.target.value })}
                      placeholder="1"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم المدرسة السابقة:</label>
                    <input
                      type="text"
                      value={formData.previousSchool}
                      onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                      placeholder="مدرسة الأمل"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">المعدل السابق:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.gpa}
                      onChange={(e) => setFormData({ ...formData, gpa: Number(e.target.value) })}
                      placeholder="95.5"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الحالة الصحية:</label>
                    <input
                      type="text"
                      value={formData.healthStatus}
                      onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                      placeholder="سليم"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الموهبة:</label>
                    <input
                      type="text"
                      value={formData.talent}
                      onChange={(e) => setFormData({ ...formData, talent: e.target.value })}
                      placeholder="الخط، الرسم، الذكاء الاصطناعي..."
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">ملاحظات عامة:</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="أي ملاحظات خاصة بالطالب..."
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>

              </div>

              {/* SECTION 2: Guardian & Emergency Contacts (بيانات ولي الأمر وشخص آخر للتواصل) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* ولي الأمر */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <h4 className="font-bold text-purple-900 border-b border-slate-200 pb-1.5">
                    ثانياً: بيانات ولي الأمر
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">اسم ولي الأمر:</label>
                      <input
                        type="text"
                        value={formData.guardianName}
                        onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                        placeholder="أحمد"
                        className="w-full p-2 rounded border border-slate-300 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">الكنية:</label>
                      <input
                        type="text"
                        value={formData.guardianNickname}
                        onChange={(e) => setFormData({ ...formData, guardianNickname: e.target.value })}
                        placeholder="العبدالله"
                        className="w-full p-2 rounded border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">صلته بالطالب:</label>
                      <input
                        type="text"
                        value={formData.guardianRelation}
                        onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                        placeholder="أب"
                        className="w-full p-2 rounded border border-slate-300 bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">العمل:</label>
                      <input
                        type="text"
                        value={formData.guardianJob}
                        onChange={(e) => setFormData({ ...formData, guardianJob: e.target.value })}
                        placeholder="مهندس"
                        className="w-full p-2 rounded border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-emerald-800">
                      رقم الهاتف (للتنبيهات ورسائل SMS):
                    </label>
                    <input
                      type="text"
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      placeholder="0994112233"
                      className="w-full p-2 rounded border border-emerald-300 bg-emerald-50/40 font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                {/* شخص آخر للتواصل */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <h4 className="font-bold text-purple-900 border-b border-slate-200 pb-1.5">
                    ثالثاً: شخص آخر للتواصل في حالات الطوارئ
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">اسم شخص آخر:</label>
                      <input
                        type="text"
                        value={formData.emergencyName}
                        onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                        placeholder="سارة"
                        className="w-full p-2 rounded border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">الكنية:</label>
                      <input
                        type="text"
                        value={formData.emergencyNickname}
                        onChange={(e) => setFormData({ ...formData, emergencyNickname: e.target.value })}
                        placeholder="خليل"
                        className="w-full p-2 rounded border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">صلته بالطالب:</label>
                      <input
                        type="text"
                        value={formData.emergencyRelation}
                        onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                        placeholder="أم"
                        className="w-full p-2 rounded border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">العمل:</label>
                      <input
                        type="text"
                        value={formData.emergencyJob}
                        onChange={(e) => setFormData({ ...formData, emergencyJob: e.target.value })}
                        placeholder="طبيبة"
                        className="w-full p-2 rounded border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">رقم الهاتف للطوارئ:</label>
                    <input
                      type="text"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      placeholder="0994556677"
                      className="w-full p-2 rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>

              </div>

              {/* SECTION 3: Deliverables & Checkboxes (استلام اللوازم) */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-2">
                <h4 className="text-xs font-bold text-amber-900 mb-2">رابعاً: تسليم اللوازم والاشتراكات</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.receivedBooks}
                      onChange={(e) => setFormData({ ...formData, receivedBooks: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span>تسليم كتب مدرسية</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.receivedUniform}
                      onChange={(e) => setFormData({ ...formData, receivedUniform: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span>تسليم لباس مدرسي</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasBus}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({ 
                          ...formData, 
                          hasBus: checked,
                          busId: checked ? (formData.busId || 'bus-1') : undefined,
                          busNumber: checked ? (formData.busNumber || 'حافلة رقم 1 (لوحة 492180)') : undefined,
                          busTripStatus: checked ? (formData.busTripStatus || 'في انتظار الحافلة') : undefined,
                          busPickupTime: checked ? (formData.busPickupTime || '07:15 ص') : undefined,
                          busDropoffTime: checked ? (formData.busDropoffTime || '02:30 م') : undefined
                        });
                      }}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span>خدمة المواصلات</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.syobis}
                      onChange={(e) => setFormData({ ...formData, syobis: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span>تسجيل في syobis</span>
                  </label>
                </div>

                {formData.hasBus && (
                  <div className="col-span-full bg-orange-50/80 p-3.5 rounded-xl border border-orange-200 mt-2 space-y-3">
                    <div className="font-bold text-orange-950 text-xs flex items-center gap-1.5">
                      <Bus className="w-4 h-4 text-orange-600" />
                      <span>تفاصيل النقل والمواصلات ومتابعة سيارة الطالب:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">الحافلة المخصصة</label>
                        <select
                          value={formData.busId || 'bus-1'}
                          onChange={(e) => {
                            const bId = e.target.value;
                            let routeName = 'خط المزة - الفيلات الغربية - كفرسوسة';
                            let busNum = 'حافلة رقم 1 (لوحة 492180)';
                            let drvName = 'أ. أبو أحمد الحمصي';
                            let drvPhone = '+963 944 321 654';
                            let supName = 'المشرفة هبة العلي';
                            let supPhone = '+963 933 789 123';
                            if (bId === 'bus-2') {
                              routeName = 'خط المالكي - أبو رمانة - الشعلان';
                              busNum = 'حافلة رقم 2 (لوحة 815342)';
                              drvName = 'أ. ياسر الديراني';
                              drvPhone = '+963 955 432 987';
                              supName = 'المشرفة سناء النجار';
                              supPhone = '+963 988 654 321';
                            } else if (bId === 'car-3') {
                              routeName = 'خط مشروع دمر - توسع المشروع - الربوة';
                              busNum = 'سيارة فان VIP رقم 3 (لوحة 932415)';
                              drvName = 'أ. طارق الشامي';
                              drvPhone = '+963 999 123 456';
                              supName = 'المشرف عمر الخالد';
                              supPhone = '+963 966 789 456';
                            }
                            setFormData({
                              ...formData,
                              busId: bId,
                              busRouteName: routeName,
                              busNumber: busNum,
                              busDriverName: drvName,
                              busDriverPhone: drvPhone,
                              busSupervisorName: supName,
                              busSupervisorPhone: supPhone,
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                        >
                          <option value="bus-1">حافلة رقم 1 (المزة - كفرسوسة)</option>
                          <option value="bus-2">حافلة رقم 2 (المالكي - الشعلان)</option>
                          <option value="car-3">سيارة فان VIP رقم 3 (مشروع دمر - الربوة)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">نقطة ومحطة التوقف</label>
                        <input
                          type="text"
                          placeholder="مثلاً: أمام جامع الشافعي"
                          value={formData.busStopName || ''}
                          onChange={(e) => setFormData({ ...formData, busStopName: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">حالة ركوب الطالب</label>
                        <select
                          value={formData.busTripStatus || 'في انتظار الحافلة'}
                          onChange={(e) => setFormData({ ...formData, busTripStatus: e.target.value as any })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                        >
                          <option value="في انتظار الحافلة">في انتظار الحافلة</option>
                          <option value="صعد إلى السيارة">صعد إلى السيارة</option>
                          <option value="وصل إلى المدرسة">وصل إلى المدرسة</option>
                          <option value="في طريق العودة للمنزل">في طريق العودة للمنزل</option>
                          <option value="وصل للمنزل بأمان">وصل للمنزل بأمان</option>
                          <option value="غائب">غائب اليوم</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">موعد الركوب الصباحي</label>
                        <input
                          type="text"
                          placeholder="07:15 ص"
                          value={formData.busPickupTime || '07:15 ص'}
                          onChange={(e) => setFormData({ ...formData, busPickupTime: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">موعد النزول المسائي</label>
                        <input
                          type="text"
                          placeholder="02:30 م"
                          value={formData.busDropoffTime || '02:30 م'}
                          onChange={(e) => setFormData({ ...formData, busDropoffTime: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: Financial Data & Installments (المالية الخاصة بالطالب والشيك المالي) */}
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                    <span>خامساً: المالية الخاصة بالطالب (حساب الأقساط والدفعات)</span>
                  </h4>
                  <span className="text-xs font-bold text-emerald-800">
                    الإجمالي: {formatCurrency(formData.totalAmount)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الكتب المدرسية ($):</label>
                    <input
                      type="number"
                      value={formData.booksFee}
                      onChange={(e) => handleFinancialFieldChange('booksFee', Number(e.target.value))}
                      className="w-full p-2 rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اللباس المدرسي ($):</label>
                    <input
                      type="number"
                      value={formData.uniformFee}
                      onChange={(e) => handleFinancialFieldChange('uniformFee', Number(e.target.value))}
                      className="w-full p-2 rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">القسط الدراسي ($):</label>
                    <input
                      type="number"
                      value={formData.tuitionFee}
                      onChange={(e) => handleFinancialFieldChange('tuitionFee', Number(e.target.value))}
                      className="w-full p-2 rounded border border-slate-300 bg-white font-mono font-bold text-purple-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">المبلغ الإجمالي ($):</label>
                    <div className="w-full p-2 rounded border border-slate-200 bg-slate-100 font-mono font-black text-slate-900">
                      {formatCurrency(formData.totalAmount)}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الدفعة الأولى ($):</label>
                    <input
                      type="number"
                      value={formData.firstPayment}
                      onChange={(e) => handleFinancialFieldChange('firstPayment', Number(e.target.value))}
                      className="w-full p-2 rounded border border-slate-300 bg-white font-mono font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاريخ الدفعة 1:</label>
                    <input
                      type="date"
                      value={formData.firstPaymentDate}
                      onChange={(e) => setFormData({ ...formData, firstPaymentDate: e.target.value })}
                      className="w-full p-2 rounded border border-slate-300 bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الدفعة الثانية ($):</label>
                    <input
                      type="number"
                      value={formData.secondPayment}
                      onChange={(e) => handleFinancialFieldChange('secondPayment', Number(e.target.value))}
                      className="w-full p-2 rounded border border-slate-300 bg-white font-mono font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاريخ الدفعة 2:</label>
                    <input
                      type="date"
                      value={formData.secondPaymentDate}
                      onChange={(e) => setFormData({ ...formData, secondPaymentDate: e.target.value })}
                      className="w-full p-2 rounded border border-slate-300 bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاريخ استحقاق الدفعة الثانية:</label>
                    <input
                      type="date"
                      value={formData.secondPaymentDueDate}
                      onChange={(e) => setFormData({ ...formData, secondPaymentDueDate: e.target.value })}
                      className="w-full p-2 rounded border border-amber-300 bg-amber-50/50 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-rose-800">المبلغ المتبقي ($):</label>
                    <div className="w-full p-2 rounded border border-rose-200 bg-rose-50 font-mono font-black text-rose-700 text-sm">
                      {formatCurrency(formData.remainingAmount)}
                    </div>
                  </div>

                </div>
              </div>

              {/* Form Bottom Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingStudent ? 'حفظ التعديلات' : 'إضافة وحفظ السجل'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Export Students Modal */}
      <ExportStudentsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filteredStudents={filteredStudents}
        allStudents={students}
        currentGradeFilter={selectedGrade}
        currentSectionFilter={selectedSection}
        currentSearchTerm={searchTerm}
        schoolInfo={activeSchool}
      />

    </div>
  );
};
