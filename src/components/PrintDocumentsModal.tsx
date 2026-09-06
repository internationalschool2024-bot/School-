import React from 'react';
import { 
  Printer, 
  X, 
  Download, 
  FileText, 
  CheckCircle, 
  Award, 
  DollarSign, 
  UserCheck 
} from 'lucide-react';
import { Student, Teacher, StudentReportCard, PeriodicFollowUp } from '../types';
import { formatCurrency, formatArabicDate } from '../utils/helpers';
import { SCHOOL_INFO } from '../data/mockData';
import { SchoolLogo } from './SchoolLogo';

export type PrintableDocType = 
  | 'student_form' 
  | 'teacher_card' 
  | 'financial_check' 
  | 'report_card' 
  | 'follow_up';

interface PrintDocumentsModalProps {
  docType: PrintableDocType;
  student?: Student | null;
  teacher?: Teacher | null;
  reportCard?: StudentReportCard | null;
  followUpReport?: PeriodicFollowUp | null;
  onClose: () => void;
}

export const PrintDocumentsModal: React.FC<PrintDocumentsModalProps> = ({
  docType,
  student,
  teacher,
  reportCard,
  followUpReport,
  onClose,
}) => {

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      
      {/* Container - hide actions during print */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden my-4">
        
        {/* Modal Action Bar (Hidden when printing via CSS @media print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">
              معاينة الوثيقة الرسمية للطباعة والتصدير كـ PDF (مقاس A4)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 styled in CSS) */}
        <div className="print-sheet p-6 sm:p-10 max-h-[85vh] overflow-y-auto bg-white text-slate-900 font-sans" dir="rtl">
          
          {/* ========================================================================= */}
          {/* 1. STUDENT REGISTRATION FORM (استمارة تسجيل الطالب - مطابقة للصور 1 و 2) */}
          {/* ========================================================================= */}
          {docType === 'student_form' && student && (
            <div className="space-y-5 text-xs text-slate-900 border-2 border-slate-800 p-6 rounded-lg">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div className="text-right space-y-1">
                  <div className="font-bold text-sm">{SCHOOL_INFO.ministry}</div>
                  <div className="font-bold text-sm">{SCHOOL_INFO.directorate}</div>
                  <div className="font-black text-base text-purple-900">{SCHOOL_INFO.name}</div>
                  <div className="text-[10px] text-slate-500">رياض أطفال - إبتدائي - إعدادي - ثانوي</div>
                </div>

                <div className="text-center flex flex-col items-center">
                  <SchoolLogo variant="icon" size="sm" className="mb-1" />
                  <div className="text-xs font-serif text-slate-600 mb-1">بسم الله الرحمن الرحيم</div>
                  <h1 className="text-lg font-black bg-slate-100 border border-slate-400 px-4 py-1 rounded">
                    استمارة تسجيل طالب جديد
                  </h1>
                  <div className="text-xs font-bold text-slate-600 mt-1">
                    العام الدراسي: {SCHOOL_INFO.academicYear}
                  </div>
                </div>

                <div className="text-left space-y-1">
                  <div className="font-mono font-bold text-sm">الرقم: {student.id}</div>
                  <div className="font-mono text-xs">الشعبة: {student.section}</div>
                  <div className="font-mono text-xs">الفوج: {student.regiment}</div>
                </div>
              </div>

              {/* Personal Data Table */}
              <div className="space-y-3">
                <h3 className="font-black text-sm bg-slate-200 p-1.5 px-3 rounded border border-slate-400">
                  أولاً: البيانات الشخصية للطالب
                </h3>

                <table className="w-full border-collapse border border-slate-400 text-xs">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 font-bold bg-slate-100 w-1/4 border-l border-slate-300">الاسم الأول:</td>
                      <td className="p-2 w-1/4 border-l border-slate-300 font-bold">{student.firstName}</td>
                      <td className="p-2 font-bold bg-slate-100 w-1/4 border-l border-slate-300">اسم الأب والكنية:</td>
                      <td className="p-2 w-1/4 font-bold">{student.fatherName} {student.lastName}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">اسم الأم ونسبتها:</td>
                      <td className="p-2 border-l border-slate-300">{student.motherName}</td>
                      <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">الجنس:</td>
                      <td className="p-2">{student.gender}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">تاريخ ومكان الولادة:</td>
                      <td className="p-2 border-l border-slate-300 font-mono">{student.birthDate} - {student.birthPlace}</td>
                      <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">الرقم الوطني / القيد:</td>
                      <td className="p-2 font-mono">{student.nationalId || student.civilRecord}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">الصف المسجل به:</td>
                      <td className="p-2 border-l border-slate-300 font-black text-purple-900">{student.currentGrade}</td>
                      <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">المدرسة السابقة:</td>
                      <td className="p-2">{student.previousSchool || 'مستجد'}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">عنوان السكن بالتفصيل:</td>
                      <td colSpan={3} className="p-2">{student.residenceAddress}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Guardian Data */}
              <div className="space-y-3">
                <h3 className="font-black text-sm bg-slate-200 p-1.5 px-3 rounded border border-slate-400">
                  ثانياً: بيانات ولي الأمر والاتصال
                </h3>

                <table className="w-full border-collapse border border-slate-400 text-xs">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 font-bold bg-slate-100 w-1/4 border-l border-slate-300">اسم ولي الأمر:</td>
                      <td className="p-2 w-1/4 border-l border-slate-300 font-bold">{student.fatherName} {student.lastName}</td>
                      <td className="p-2 font-bold bg-slate-100 w-1/4 border-l border-slate-300">صلة القرابة:</td>
                      <td className="p-2 w-1/4">الأب (ولي الأمر)</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">مهنة الأب / العمل:</td>
                      <td className="p-2 border-l border-slate-300">{student.fatherJob || 'أعمال حرة'}</td>
                      <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">مهنة الأم / العمل:</td>
                      <td className="p-2">{student.motherJob || 'ربة منزل'}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">رقم الهاتف (SMS/WhatsApp):</td>
                      <td className="p-2 border-l border-slate-300 font-mono font-bold">{student.guardianPhone}</td>
                      <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">هاتف بديل للطوارئ:</td>
                      <td className="p-2 font-mono">{student.emergencyPhone || '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Health & Logistics */}
              <div className="space-y-3">
                <h3 className="font-black text-sm bg-slate-200 p-1.5 px-3 rounded border border-slate-400">
                  ثالثاً: الخدمات واللوازم المدرسية
                </h3>

                <div className="grid grid-cols-4 gap-2 border border-slate-400 p-3 rounded text-center">
                  <div>
                    <span className="font-bold block">الكتب المدرسية:</span>
                    <span className={student.receivedBooks ? 'text-emerald-700 font-black' : 'text-slate-500'}>
                      {student.receivedBooks ? 'تم الاستلام ✓' : 'لم يتم الاستلام'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold block">اللباس المدرسي:</span>
                    <span className={student.receivedUniform ? 'text-emerald-700 font-black' : 'text-slate-500'}>
                      {student.receivedUniform ? 'تم الاستلام ✓' : 'لم يتم الاستلام'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold block">خدمة الباص:</span>
                    <span className={student.hasBus ? 'text-emerald-700 font-black' : 'text-slate-500'}>
                      {student.hasBus ? 'مشترك ✓' : 'غير مشترك'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold block">نظام syobis:</span>
                    <span className={student.syobis ? 'text-emerald-700 font-black' : 'text-slate-500'}>
                      {student.syobis ? 'مفعّل ✓' : 'غير مفعّل'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-slate-800 text-center font-bold">
                <div>
                  <p className="mb-8">توقيع ولي الأمر</p>
                  <p className="text-slate-400">..............................</p>
                </div>
                <div>
                  <p className="mb-8">منظم الاستمارة: {SCHOOL_INFO.documentOrganizedBy}</p>
                  <p className="text-slate-400">..............................</p>
                </div>
                <div>
                  <p className="mb-8">مدير المدرسة: {SCHOOL_INFO.principal}</p>
                  <p className="text-slate-400">..............................</p>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. FINANCIAL CHECK / VOUCHER (الشيك المالي وسند القبض - مطابقة للصورة 4) */}
          {/* ========================================================================= */}
          {docType === 'financial_check' && student && (
            <div className="space-y-6 text-xs text-slate-900 border-2 border-slate-800 p-8 rounded-lg">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="font-black text-sm">{SCHOOL_INFO.institution}</div>
                  <div className="font-bold text-base text-purple-900">{SCHOOL_INFO.name}</div>
                  <div className="text-xs text-slate-500">العام الدراسي {SCHOOL_INFO.academicYear}</div>
                </div>

                <div className="text-center flex flex-col items-center">
                  <SchoolLogo variant="icon" size="sm" className="mb-1" />
                  <div className="text-xs font-serif text-slate-600 mb-1">بسم الله الرحمن الرحيم</div>
                  <h1 className="text-xl font-black bg-slate-100 border-2 border-slate-800 px-6 py-1.5 rounded-md shadow-xs">
                    شيك مالي وبيان رسوم الطالب
                  </h1>
                </div>

                <div className="text-left space-y-1">
                  <div className="font-mono font-bold text-sm">الرقم المالي: CHK-{student.id}</div>
                  <div className="text-xs">تاريخ التحرير: {new Date().toISOString().split('T')[0]}</div>
                </div>
              </div>

              {/* Student Summary */}
              <div className="bg-slate-50 p-3 rounded border border-slate-300 flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold">اسم الطالب: </span>
                  <span className="font-black text-slate-900">{student.firstName} {student.fatherName} {student.lastName}</span>
                </div>
                <div>
                  <span className="font-bold">الصف والشعبة: </span>
                  <span className="font-bold text-purple-900">{student.currentGrade} • شعبة {student.section}</span>
                </div>
                <div>
                  <span className="font-bold">رقم الطالب: </span>
                  <span className="font-mono font-bold">{student.id}</span>
                </div>
              </div>

              {/* Financial Breakdown Table - Exactly as in Image 4 */}
              <table className="w-full border-collapse border-2 border-slate-800 text-xs">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold border-b-2 border-slate-800">
                    <th className="p-2.5 border-l border-slate-400">بيان الرسوم والمستحقات</th>
                    <th className="p-2.5 border-l border-slate-400 text-center">المبلغ المستحق ($)</th>
                    <th className="p-2.5 border-l border-slate-400 text-center">المدفوع الأول ($)</th>
                    <th className="p-2.5 text-center">المدفوع الثاني ($)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-300">
                    <td className="p-2.5 border-l border-slate-300 font-bold">القسط الدراسي السنوي</td>
                    <td className="p-2.5 border-l border-slate-300 text-center font-mono font-bold">{formatCurrency(student.tuitionFee)}</td>
                    <td className="p-2.5 border-l border-slate-300 text-center font-mono" rowSpan={3}>
                      <div className="font-bold text-emerald-800">{formatCurrency(student.firstPayment)}</div>
                      <div className="text-[10px] text-slate-500">{student.firstPaymentDate}</div>
                    </td>
                    <td className="p-2.5 text-center font-mono" rowSpan={3}>
                      <div className="font-bold text-emerald-800">{formatCurrency(student.secondPayment)}</div>
                      <div className="text-[10px] text-slate-500">{student.secondPaymentDate || '—'}</div>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2.5 border-l border-slate-300 font-bold">الكتب والمناهج المدرسية</td>
                    <td className="p-2.5 border-l border-slate-300 text-center font-mono font-bold">{formatCurrency(student.booksFee)}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2.5 border-l border-slate-300 font-bold">اللباس المدرسي الموحد</td>
                    <td className="p-2.5 border-l border-slate-300 text-center font-mono font-bold">{formatCurrency(student.uniformFee)}</td>
                  </tr>
                  <tr className="bg-slate-100 font-black border-t-2 border-slate-800">
                    <td className="p-2.5 border-l border-slate-400 text-sm">المبلغ الإجمالي المستحق:</td>
                    <td className="p-2.5 border-l border-slate-400 text-center text-sm font-mono text-slate-900">
                      {formatCurrency(student.totalAmount)}
                    </td>
                    <td colSpan={2} className="p-2.5 text-center text-sm font-mono text-emerald-800">
                      مجموع المقبوض: {formatCurrency(student.firstPayment + student.secondPayment)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Balance Summary Box */}
              <div className="grid grid-cols-2 gap-4 border-2 border-slate-800 p-4 rounded-lg bg-slate-50">
                <div className="space-y-1">
                  <span className="font-bold text-slate-700">المبلغ المتبقي ذمة بذمة ولي الأمر:</span>
                  <div className="text-xl font-black text-rose-800">
                    {student.remainingAmount === 0 ? 'لا يوجد متبقي (تم السداد بالكامل ✓)' : formatCurrency(student.remainingAmount)}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-700">تاريخ استحقاق الدفعة المتبقية:</span>
                  <div className="text-base font-bold text-slate-900">
                    {student.secondPaymentDueDate}
                  </div>
                </div>
              </div>

              {/* Signatures from Image 4 */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-slate-800 text-center font-bold">
                <div>
                  <p className="mb-8">منظم الوثيقة: {SCHOOL_INFO.documentOrganizedBy}</p>
                  <p className="text-slate-400">..............................</p>
                </div>
                <div>
                  <p className="mb-8">المسؤول المالي: {SCHOOL_INFO.financialOfficer}</p>
                  <p className="text-slate-400">..............................</p>
                </div>
                <div>
                  <p className="mb-8">مدير المدرسة: {SCHOOL_INFO.principal}</p>
                  <p className="text-slate-400">..............................</p>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. OFFICIAL REPORT CARD / JALAA (كشف العلامات والجلاء المدرسي - مطابقة للصورة 5) */}
          {/* ========================================================================= */}
          {docType === 'report_card' && student && (
            <div className="space-y-5 text-xs text-slate-900 border-2 border-purple-900 p-8 rounded-lg bg-white">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-purple-900 pb-4">
                <div className="space-y-1">
                  <div className="font-bold">{SCHOOL_INFO.ministry}</div>
                  <div className="font-bold">{SCHOOL_INFO.directorate}</div>
                  <div className="font-black text-base text-purple-900">{SCHOOL_INFO.name}</div>
                  <div className="text-[10px] text-purple-700 font-medium">International School</div>
                </div>

                <div className="text-center flex flex-col items-center">
                  <SchoolLogo variant="icon" size="sm" className="mb-1" />
                  <div className="text-xs font-serif text-slate-600 mb-1">بسم الله الرحمن الرحيم</div>
                  <h1 className="text-xl font-black bg-purple-100 border border-purple-900 text-purple-950 px-6 py-1.5 rounded shadow-xs">
                    كشف درجات وجلاء مدرسي رسمي
                  </h1>
                  <div className="text-xs font-bold text-slate-700 mt-1">
                    {reportCard?.term || 'الفصل الدراسي الأول'} • العام {SCHOOL_INFO.academicYear}
                  </div>
                </div>

                <div className="text-left space-y-1">
                  <div className="font-mono font-bold">الرقم: {student.id}</div>
                  <div className="font-bold">الصف: {student.currentGrade}</div>
                  <div className="font-bold">الشعبة: {student.section}</div>
                </div>
              </div>

              {/* Student info banner */}
              <div className="bg-purple-50/70 p-3 rounded border border-purple-200 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-700">اسم التلميذ: </span>
                  <span className="font-black text-sm text-purple-950">{student.firstName} {student.fatherName} {student.lastName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">اسم الأم: </span>
                  <span className="font-bold">{student.motherName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">الترتيب العام: </span>
                  <span className="font-bold text-purple-900">المرتبة ({reportCard?.rank || 1})</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">التقدير العام: </span>
                  <span className="font-black text-emerald-800 text-sm">{reportCard?.appreciation || 'ممتاز'}</span>
                </div>
              </div>

              {/* Grades Table */}
              <table className="w-full border-collapse border-2 border-purple-900 text-xs text-center">
                <thead>
                  <tr className="bg-purple-900 text-white font-bold">
                    <th className="p-2 text-right border-l border-purple-800">المادة الدراسية</th>
                    <th className="p-2 border-l border-purple-800">نشاط ومواظبة (20)</th>
                    <th className="p-2 border-l border-purple-800">مذاكرة 1 (20)</th>
                    <th className="p-2 border-l border-purple-800">امتحان نصفي (40)</th>
                    <th className="p-2 border-l border-purple-800">مذاكرة 2 (20)</th>
                    <th className="p-2 border-l border-purple-800">امتحان نهائي (60)</th>
                    <th className="p-2 border-l border-purple-800 font-black">المحصلة (100)</th>
                    <th className="p-2">التقدير</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportCard?.grades || []).map((g, idx) => (
                    <tr key={idx} className="border-b border-slate-300 hover:bg-slate-50">
                      <td className="p-2 text-right font-bold text-slate-900 border-l border-slate-300">{g.subjectName}</td>
                      <td className="p-2 font-mono border-l border-slate-300">{g.activityScore}</td>
                      <td className="p-2 font-mono border-l border-slate-300">{g.test1Score}</td>
                      <td className="p-2 font-mono border-l border-slate-300">{g.midtermScore}</td>
                      <td className="p-2 font-mono border-l border-slate-300">{g.test2Score}</td>
                      <td className="p-2 font-mono border-l border-slate-300">{g.finalExamScore}</td>
                      <td className="p-2 font-mono font-black text-purple-900 bg-purple-50/50 border-l border-slate-300">
                        {g.totalScore}
                      </td>
                      <td className="p-2 font-bold text-emerald-800">{g.gradeNote || 'ممتاز'}</td>
                    </tr>
                  ))}
                  <tr className="bg-purple-100 font-black border-t-2 border-purple-900">
                    <td className="p-2 text-right text-sm">المجموع العام والنسبة:</td>
                    <td colSpan={5} className="p-2 text-center text-sm font-mono">
                      {reportCard?.totalScore || 764} من أصل {reportCard?.maxTotalScore || 800}
                    </td>
                    <td className="p-2 text-center text-sm font-mono text-purple-950 font-black">
                      {reportCard?.percentage || 95.5}%
                    </td>
                    <td className="p-2 text-center text-sm text-emerald-900 font-black">
                      {reportCard?.appreciation || 'ممتاز'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Behavior & Remarks */}
              <div className="grid grid-cols-2 gap-4 border border-purple-200 p-4 rounded-lg bg-slate-50">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">ملاحظة المعلم المربي:</span>
                  <p className="text-slate-600 italic leading-relaxed">
                    {reportCard?.teacherRemarks || 'تلميذ مواظب ومثالي ومتميز في تحصيله العلمي وخلقه الحسن.'}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-1">كلمة وتوصية إدارة المدرسة:</span>
                  <p className="text-slate-600 italic leading-relaxed">
                    {reportCard?.principalRemarks || 'تهانينا الحارة لولي الأمر والتلميذ على هذا التفوق الباهر، ونتمنى له دوام التألق والنجاح.'}
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-purple-900 text-center font-bold">
                <div>
                  <p className="mb-8">معلم الصف المربي</p>
                  <p className="text-slate-400">..............................</p>
                </div>
                <div>
                  <p className="mb-8">الموجه التربوي</p>
                  <p className="text-slate-400">..............................</p>
                </div>
                <div>
                  <p className="mb-8">مدير المدرسة: {SCHOOL_INFO.principal}</p>
                  <p className="text-slate-400">..............................</p>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. TEACHER PROFILE CARD (بطاقة المعلم - مطابقة للصورة 3) */}
          {/* ========================================================================= */}
          {docType === 'teacher_card' && teacher && (
            <div className="space-y-5 text-xs text-slate-900 border-2 border-slate-800 p-8 rounded-lg">
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div>
                  <div className="font-bold">{SCHOOL_INFO.directorate}</div>
                  <div className="font-black text-base text-purple-900">{SCHOOL_INFO.name}</div>
                  <div className="text-[10px] text-slate-500">سجل الكادر التعليمي</div>
                </div>
                <div className="text-center flex flex-col items-center">
                  <SchoolLogo variant="icon" size="sm" className="mb-1" />
                  <h1 className="text-lg font-black bg-slate-100 border border-slate-400 px-6 py-1 rounded">
                    بطاقة وسجل بيانات المعلم
                  </h1>
                </div>
                <div className="text-left font-mono font-bold">
                  <div>الرقم: {teacher.id}</div>
                  <div>تاريخ التعيين: {teacher.hireDate}</div>
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-400 text-xs">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <td className="p-2 font-bold bg-slate-100 border-l border-slate-300 w-1/4">الاسم والكنية:</td>
                    <td className="p-2 font-bold border-l border-slate-300 w-1/4">{teacher.fullName}</td>
                    <td className="p-2 font-bold bg-slate-100 border-l border-slate-300 w-1/4">الاختصاص:</td>
                    <td className="p-2 font-bold text-purple-900 w-1/4">{teacher.specialization}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">اسم الأب والأم:</td>
                    <td className="p-2 border-l border-slate-300">{teacher.fatherName} / {teacher.motherName}</td>
                    <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">الرقم الوطني:</td>
                    <td className="p-2 font-mono">{teacher.nationalId}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">المؤهل العلمي وتاريخه:</td>
                    <td className="p-2 border-l border-slate-300">{teacher.highestDegree} ({teacher.graduationDate})</td>
                    <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">سنوات الخبرة:</td>
                    <td className="p-2 font-bold">{teacher.experienceYears} سنوات</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">الصفوف التي يدرسها:</td>
                    <td className="p-2 border-l border-slate-300 font-bold">{teacher.teachingGrades}</td>
                    <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">الحالة الاجتماعية:</td>
                    <td className="p-2">{teacher.maritalStatus} ({teacher.childrenCount} أولاد)</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">رقم الهاتف:</td>
                    <td className="p-2 border-l border-slate-300 font-mono font-bold">{teacher.phone}</td>
                    <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">البريد الإلكتروني:</td>
                    <td className="p-2 font-mono">{teacher.email}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold bg-slate-100 border-l border-slate-300">المهارات والخبرات:</td>
                    <td colSpan={3} className="p-2">{teacher.skills}</td>
                  </tr>
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-4 pt-8 border-t-2 border-slate-800 text-center font-bold">
                <div>
                  <p className="mb-8">توقيع المعلم</p>
                  <p className="text-slate-400">..............................</p>
                </div>
                <div>
                  <p className="mb-8">مدير المدرسة: {SCHOOL_INFO.principal}</p>
                  <p className="text-slate-400">..............................</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. PERIODIC FOLLOW-UP (تقرير المتابعة الدورية) */}
          {/* ========================================================================= */}
          {docType === 'follow_up' && student && followUpReport && (
            <div className="space-y-6 text-xs text-slate-900 border-2 border-slate-800 p-8 rounded-lg">
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div>
                  <div className="font-bold">{SCHOOL_INFO.directorate}</div>
                  <div className="font-black text-base text-purple-900">{SCHOOL_INFO.name}</div>
                  <div className="text-[10px] text-slate-500">المتابعة الميدانية والتربوية</div>
                </div>
                <div className="text-center flex flex-col items-center">
                  <SchoolLogo variant="icon" size="sm" className="mb-1" />
                  <h1 className="text-lg font-black bg-slate-100 border border-slate-400 px-6 py-1 rounded">
                    تقرير المتابعة الدورية والأداء السلوكي
                  </h1>
                  <div className="text-xs font-bold text-slate-600 mt-1">تاريخ التقرير: {followUpReport.date}</div>
                </div>
                <div className="text-left font-mono font-bold">
                  <div>الرقم: {student.id}</div>
                  <div>الصف: {student.currentGrade}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-300">
                <span className="font-bold">اسم الطالب: </span>
                <span className="font-black text-sm">{student.firstName} {student.fatherName} {student.lastName}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 border border-slate-300 p-4 rounded text-center">
                <div>
                  <span className="font-bold text-slate-500 block mb-1">المستوى الأكاديمي العام:</span>
                  <span className="text-sm font-black text-purple-900">{followUpReport.academicLevel}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block mb-1">الالتزام بالواجبات:</span>
                  <span className="text-sm font-black text-slate-800">{followUpReport.homeworkCommitment}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block mb-1">المشاركة الصفيّة:</span>
                  <span className="text-sm font-black text-emerald-800">{followUpReport.classParticipation}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border border-slate-300 p-3 rounded">
                  <span className="font-bold block mb-1">ملاحظات المعلم حول السلوك والمواظبة:</span>
                  <p className="text-slate-700 leading-relaxed">{followUpReport.behaviorNotes}</p>
                </div>
                <div className="border border-slate-300 p-3 rounded bg-purple-50/40">
                  <span className="font-bold block mb-1 text-purple-900">توصيات المعلم لولي الأمر:</span>
                  <p className="text-slate-700 leading-relaxed">{followUpReport.teacherRecommendations}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-8 border-t-2 border-slate-800 text-center font-bold">
                <div>
                  <p className="mb-8">معلم الصف المربي</p>
                  <p className="text-slate-400">..............................</p>
                </div>
                <div>
                  <p className="mb-8">مدير المدرسة: {SCHOOL_INFO.principal}</p>
                  <p className="text-slate-400">..............................</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
