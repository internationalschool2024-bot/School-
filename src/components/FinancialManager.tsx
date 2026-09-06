import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Search, 
  Filter, 
  Printer, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  CreditCard, 
  Calendar, 
  User, 
  ArrowDownLeft, 
  TrendingUp,
  Receipt,
  FileCheck,
  Link as LinkIcon
} from 'lucide-react';
import { Student } from '../types';
import { formatCurrency, formatArabicDate, exportToCSV } from '../utils/helpers';
import { SCHOOL_INFO } from '../data/mockData';
import { buildPortalUrl, copyToClipboard } from '../utils/urlHelper';

interface FinancialManagerProps {
  students: Student[];
  onUpdateStudentPayment: (studentId: string, firstPayment: number, secondPayment: number, secondPaymentDate?: string) => void;
  onPrintCheck: (student: Student) => void;
  onSendSmsReminder: (student: Student) => void;
  onSendBulkSmsReminders: (overdueStudents: Student[]) => void;
}

export const FinancialManager: React.FC<FinancialManagerProps> = ({
  students,
  onUpdateStudentPayment,
  onPrintCheck,
  onSendSmsReminder,
  onSendBulkSmsReminders,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  
  // Payment Recording Modal
  const [selectedStudentForPay, setSelectedStudentForPay] = useState<Student | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentTarget, setPaymentTarget] = useState<'first' | 'second'>('second');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Overall Financial Calculations
  const totalTuitionExpected = students.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalFirstCollected = students.reduce((sum, s) => sum + s.firstPayment, 0);
  const totalSecondCollected = students.reduce((sum, s) => sum + s.secondPayment, 0);
  const totalCollectedAll = totalFirstCollected + totalSecondCollected;
  const totalRemainingAll = students.reduce((sum, s) => sum + s.remainingAmount, 0);
  const percentCollected = totalTuitionExpected > 0 ? Math.round((totalCollectedAll / totalTuitionExpected) * 100) : 0;

  const overdueList = useMemo(() => {
    return students.filter(s => s.remainingAmount > 0);
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.firstName.includes(searchTerm) ||
        s.lastName.includes(searchTerm) ||
        s.id.includes(searchTerm) ||
        s.guardianPhone.includes(searchTerm);

      const matchGrade = gradeFilter === 'all' || s.currentGrade === gradeFilter;

      let matchStatus = true;
      if (statusFilter === 'paid') matchStatus = s.remainingAmount === 0;
      if (statusFilter === 'unpaid') matchStatus = s.remainingAmount > 0;

      return matchSearch && matchGrade && matchStatus;
    });
  }, [students, searchTerm, statusFilter, gradeFilter]);

  const handleOpenPaymentModal = (student: Student) => {
    setSelectedStudentForPay(student);
    if (student.firstPayment < student.totalAmount / 2) {
      setPaymentTarget('first');
      setPaymentAmount(Math.max(0, student.totalAmount / 2 - student.firstPayment));
    } else {
      setPaymentTarget('second');
      setPaymentAmount(student.remainingAmount);
    }
    setPaymentDate(new Date().toISOString().split('T')[0]);
  };

  const handleSavePayment = () => {
    if (!selectedStudentForPay) return;
    let newFirst = selectedStudentForPay.firstPayment;
    let newSecond = selectedStudentForPay.secondPayment;
    let newSecondDate = selectedStudentForPay.secondPaymentDate;

    if (paymentTarget === 'first') {
      newFirst += paymentAmount;
    } else {
      newSecond += paymentAmount;
      newSecondDate = paymentDate;
    }

    onUpdateStudentPayment(selectedStudentForPay.id, newFirst, newSecond, newSecondDate);
    setSelectedStudentForPay(null);
  };

  const handleExportFinances = () => {
    const rows = filteredStudents.map(s => ({
      'رقم الطالب': s.id,
      'الاسم الكامل': `${s.firstName} ${s.fatherName} ${s.lastName}`,
      'الصف': s.currentGrade,
      'رسوم الكتب ($)': s.booksFee,
      'رسوم اللباس ($)': s.uniformFee,
      'القسط الدراسي ($)': s.tuitionFee,
      'المبلغ الإجمالي ($)': s.totalAmount,
      'الدفعة الأولى ($)': s.firstPayment,
      'تاريخ الدفعة 1': s.firstPaymentDate,
      'الدفعة الثانية ($)': s.secondPayment,
      'تاريخ الدفعة 2': s.secondPaymentDate,
      'المبلغ المتبقي ($)': s.remainingAmount,
      'تاريخ الاستحقاق': s.secondPaymentDueDate,
      'هاتف ولي الأمر': s.guardianPhone,
    }));
    exportToCSV(`التقرير_المالي_والشيكات_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      
      {/* Financial Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>إجمالي الأقساط والرسوم المقدرة</span>
            <Receipt className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {formatCurrency(totalTuitionExpected)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            يشمل القسط + الكتب + اللباس لكافة الطلاب
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
            <span>المبالغ المحصلة فعلياً</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {formatCurrency(totalCollectedAll)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>نسبة التحصيل: {percentCollected}%</span>
            <span className="font-semibold text-emerald-700">{students.filter(s => s.remainingAmount === 0).length} طالب مسدد</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-700 font-bold">
            <span>المتبقي غير المحصل (ذمم)</span>
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {formatCurrency(totalRemainingAll)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            مستحق على {overdueList.length} طالب
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-xl p-5 text-white shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-slate-300">إجراءات التحصيل والتنبيه</span>
            <div className="mt-1 text-sm font-bold">إرسال تنبيهات الأقساط</div>
          </div>
          <button
            onClick={() => onSendBulkSmsReminders(overdueList)}
            className="mt-3 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>مطالبة كافة المتأخرين SMS ({overdueList.length})</span>
          </button>
        </div>

      </div>

      {/* Main Table & Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span>الشيك المالي وسندات القبض للمدرسة الدولية</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة الدفعات وتواريخ الاستحقاق وإصدار وطباعة الشيك المالي للسيد ولي الأمر.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportFinances}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تصدير الكشف المالي</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو رقم الطالب أو الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كافة حالات السداد</option>
              <option value="paid">مسدد بالكامل ($0 متبقي)</option>
              <option value="unpaid">متبقي عليه دفعة مالية</option>
            </select>
          </div>

          <div>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كافة الصفوف الدراسية</option>
              {Array.from(new Set(students.map(s => s.currentGrade))).map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Financial Records Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-3">رقم الطالب</th>
                <th className="py-3.5 px-3">اسم الطالب والصف</th>
                <th className="py-3.5 px-3">تفاصيل الرسوم ($)</th>
                <th className="py-3.5 px-3">المبلغ الإجمالي</th>
                <th className="py-3.5 px-3">الدفعة 1 (المسدد)</th>
                <th className="py-3.5 px-3">الدفعة 2 (المسدد)</th>
                <th className="py-3.5 px-3">المبلغ المتبقي</th>
                <th className="py-3.5 px-3">تاريخ استحقاق الدفعة 2</th>
                <th className="py-3.5 px-3 text-center">العمليات والطباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => {
                const isPaid = s.remainingAmount === 0;
                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="py-3.5 px-3 font-mono font-bold text-blue-700 bg-blue-50/50 rounded">{s.id}</td>
                    
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-800">{s.firstName} {s.fatherName} {s.lastName}</div>
                      <div className="text-[11px] text-slate-400">{s.currentGrade} • شعبة {s.section}</div>
                    </td>

                    <td className="py-3.5 px-3 text-[11px] text-slate-600">
                      <div>قسط: {formatCurrency(s.tuitionFee)}</div>
                      <div>كتب: {formatCurrency(s.booksFee)} • لباس: {formatCurrency(s.uniformFee)}</div>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-slate-800">
                      {formatCurrency(s.totalAmount)}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-emerald-700">{formatCurrency(s.firstPayment)}</div>
                      <div className="text-[10px] text-slate-400">{s.firstPaymentDate || '—'}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-emerald-700">{formatCurrency(s.secondPayment)}</div>
                      <div className="text-[10px] text-slate-400">{s.secondPaymentDate || '—'}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <CheckCircle className="w-3 h-3" />
                          <span>خالص</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                          <span>{formatCurrency(s.remainingAmount)}</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-medium text-slate-600">
                      {s.secondPaymentDueDate || '—'}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Record Payment Button */}
                        {!isPaid && (
                          <button
                            title="تسجيل دفعة جديدة"
                            onClick={() => handleOpenPaymentModal(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] shadow-xs cursor-pointer"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>قبض دفعة</span>
                          </button>
                        )}

                        {/* Print Check / Statement */}
                        <button
                          title="طباعة شيك مالي / بيان مالي للسيد ولي الأمر"
                          onClick={() => onPrintCheck(s)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4 text-blue-600" />
                        </button>

                        {/* Parent Portal Link */}
                        <button
                          title={`نسخ رابط بوابة ولي الأمر للطالب (${s.firstName}) للدخول المباشر برقم الطالب`}
                          onClick={async () => {
                            const url = buildPortalUrl('portal', s.id);
                            const success = await copyToClipboard(url);
                            if (success) {
                              alert(`تم نسخ رابط ولي أمر الطالب (${s.firstName} ${s.lastName}) بنجاح!\nالرابط المباشر: ${url}\nرقم الطالب: ${s.id}`);
                            }
                          }}
                          className="p-1.5 rounded-md hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                        >
                          <LinkIcon className="w-4 h-4 text-amber-600" />
                        </button>

                        {/* SMS Reminder */}
                        <button
                          title="إرسال إشعار SMS لولي الأمر بالمبلغ"
                          onClick={() => onSendSmsReminder(s)}
                          className="p-1.5 rounded-md hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RECORD PAYMENT MODAL */}
      {/* ========================================================================= */}
      {selectedStudentForPay && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">تسجيل دفعة مالية جديدة</h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  الطالب: {selectedStudentForPay.firstName} {selectedStudentForPay.lastName} ({selectedStudentForPay.id})
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForPay(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-medium">المبلغ المتبقي حالياً:</span>
                <span className="text-base font-black text-rose-700">
                  {formatCurrency(selectedStudentForPay.remainingAmount)}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع الدفعة المستلمة:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentTarget('first')}
                    className={`py-2 px-3 rounded-lg border font-bold text-xs ${
                      paymentTarget === 'first' ? 'bg-emerald-100 border-emerald-500 text-emerald-900' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    الدفعة الأولى
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTarget('second')}
                    className={`py-2 px-3 rounded-lg border font-bold text-xs ${
                      paymentTarget === 'second' ? 'bg-emerald-100 border-emerald-500 text-emerald-900' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    الدفعة الثانية
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المبلغ المقبوض ($):</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-mono font-bold text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ القبض:</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForPay(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSavePayment}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors"
                >
                  تأكيد وقبض السند
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
