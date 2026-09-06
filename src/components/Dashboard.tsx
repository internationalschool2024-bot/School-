import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  AlertCircle, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Printer, 
  Send, 
  Smartphone, 
  UserPlus, 
  TrendingUp, 
  ShieldCheck,
  CheckCircle,
  FileDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Student, Teacher, StudentReportCard, SmsMessageLog } from '../types';
import { formatCurrency } from '../utils/helpers';
import { SCHOOL_INFO } from '../data/mockData';

interface DashboardProps {
  students: Student[];
  teachers: Teacher[];
  reportCards: StudentReportCard[];
  smsLogs: SmsMessageLog[];
  onNavigate: (tab: any) => void;
  onPrintStudent: (student: Student) => void;
  onPrintCheck: (student: Student) => void;
  onSendSmsReminder: (student: Student) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  teachers,
  reportCards,
  smsLogs,
  onNavigate,
  onPrintStudent,
  onPrintCheck,
  onSendSmsReminder,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Financial calculations
  const totalTuition = students.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalCollected = students.reduce((sum, s) => sum + (s.firstPayment + s.secondPayment), 0);
  const collectionPercentage = totalTuition > 0 ? Math.round((totalCollected / totalTuition) * 100) : 0;
  const overdueCount = students.filter(s => s.remainingAmount > 0).length;

  const totalPages = Math.ceil(students.length / itemsPerPage);
  const currentStudents = students.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 pb-8">
      
      {/* 4 Professional Polish Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Students */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-sm font-medium">إجمالي الطلاب</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl font-bold text-slate-800">{students.length}</span>
            <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              +3.2% نشط
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span>{teachers.length} معلماً وإدارياً</span>
            <button onClick={() => onNavigate('students')} className="text-blue-600 font-medium hover:underline">
              عرض الكل
            </button>
          </div>
        </div>

        {/* Card 2: Tuition Collection */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-sm font-medium">تحصيل الأقساط</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl font-bold text-slate-800">{collectionPercentage}%</span>
            <span className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
              مستهدف {formatCurrency(totalTuition)}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span>المحصل: {formatCurrency(totalCollected)}</span>
            <button onClick={() => onNavigate('finances')} className="text-blue-600 font-medium hover:underline">
              الشيك المالي
            </button>
          </div>
        </div>

        {/* Card 3: SMS Alerts Today */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-sm font-medium">رسائل SMS والتنبيهات</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl font-bold text-slate-800">{smsLogs.length}</span>
            <span className="text-slate-500 text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-full">
              مرسلة ومسلمة
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span>بوابة أولياء الأمور مفعلة</span>
            <button onClick={() => onNavigate('sms')} className="text-blue-600 font-medium hover:underline">
              سجل التنبيهات
            </button>
          </div>
        </div>

        {/* Card 4: Pending / Overdue Attention */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 text-sm font-medium">أقساط واستحقاقات</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl font-bold text-orange-600">{overdueCount}</span>
            <span className="text-orange-600 text-xs font-bold bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
              دفعة ثانية
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span>استحقاق منتصف كانون 2</span>
            <button onClick={() => onNavigate('finances')} className="text-orange-600 font-medium hover:underline">
              متابعة السداد
            </button>
          </div>
        </div>

      </div>

      {/* Main Table Card (Professional Polish Style) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        
        {/* Table Card Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">إدارة بيانات الطلاب الأخيرة</h2>
            <p className="text-xs text-slate-500 mt-0.5">سجل التسجيل الرسمي، كشوفات العلامات، والشيكات المالية</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onNavigate('students')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-xs transition-colors cursor-pointer"
            >
              إضافة طالب جديد +
            </button>
            <button 
              onClick={() => {
                if (students.length > 0) onPrintStudent(students[0]);
              }}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileDown className="w-4 h-4 text-slate-600" />
              <span>تصدير PDF</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">الاسم الكامل</th>
                <th className="px-6 py-3.5 font-semibold">الصف الدراسي</th>
                <th className="px-6 py-3.5 font-semibold">حالة القسط</th>
                <th className="px-6 py-3.5 font-semibold">المعدل العام</th>
                <th className="px-6 py-3.5 font-semibold">آخر تنبيه لولي الأمر</th>
                <th className="px-6 py-3.5 font-semibold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentStudents.map((student) => {
                const isPaid = student.remainingAmount === 0;
                const isPartial = student.remainingAmount > 0 && student.firstPayment > 0;
                const isUnpaid = student.firstPayment === 0;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Full Name & ID */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">
                          {student.firstName} {student.fatherName} {student.lastName}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">ID: {student.id}</span>
                      </div>
                    </td>

                    {/* Grade & Section */}
                    <td className="px-6 py-4 text-slate-600">
                      <span>{student.currentGrade}</span>
                      <span className="mr-1 text-xs text-slate-400">({student.section})</span>
                    </td>

                    {/* Payment Status */}
                    <td className="px-6 py-4">
                      {isPaid ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-block">
                          مدفوع
                        </span>
                      ) : isPartial ? (
                        <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold inline-block">
                          متأخر ({formatCurrency(student.remainingAmount)})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-bold inline-block">
                          غير مدفوع
                        </span>
                      )}
                    </td>

                    {/* GPA */}
                    <td className="px-6 py-4 font-bold text-blue-600">
                      {student.gpa}%
                    </td>

                    {/* Guardian Alert Note */}
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {isPaid ? 'متابع (تقرير دوري)' : 'تنبيه استحقاق القسط'}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3 text-xs">
                        <button
                          onClick={() => onPrintStudent(student)}
                          className="text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                        >
                          استمارة
                        </button>
                        <span className="text-slate-200">|</span>
                        <button
                          onClick={() => onPrintCheck(student)}
                          className="text-emerald-600 hover:text-emerald-800 font-semibold hover:underline cursor-pointer"
                        >
                          شيك مالي
                        </button>
                        <span className="text-slate-200">|</span>
                        <button
                          onClick={() => onSendSmsReminder(student)}
                          className="text-slate-600 hover:text-slate-900 font-semibold hover:underline cursor-pointer"
                        >
                          SMS
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="border-t border-slate-100 p-4 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            إظهار {Math.min((currentPage - 1) * itemsPerPage + 1, students.length)}-
            {Math.min(currentPage * itemsPerPage, students.length)} من أصل {students.length} طالب
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-white border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold cursor-pointer transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-white border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
