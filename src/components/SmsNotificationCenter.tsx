import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  Phone, 
  CheckCircle2, 
  Users, 
  FileText, 
  Sparkles, 
  History, 
  AlertCircle, 
  DollarSign, 
  Award, 
  Clock,
  CheckCheck
} from 'lucide-react';
import { Student, SmsMessageLog } from '../types';
import { SCHOOL_INFO, SMS_TEMPLATES } from '../data/mockData';

interface SmsNotificationCenterProps {
  students: Student[];
  smsLogs: SmsMessageLog[];
  onSendSms: (studentId: string, studentName: string, phone: string, type: any, message: string) => void;
}

export const SmsNotificationCenter: React.FC<SmsNotificationCenterProps> = ({
  students,
  smsLogs,
  onSendSms,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedType, setSelectedType] = useState<any>('تنبيه قسط');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState<boolean>(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Template loader
  const handleSelectTemplate = (templateKey: keyof typeof SMS_TEMPLATES) => {
    const template = SMS_TEMPLATES[templateKey];
    if (!selectedStudent) return;
    
    let msg = template
      .replace('{studentName}', `${selectedStudent.firstName} ${selectedStudent.lastName}`)
      .replace('{amount}', selectedStudent.remainingAmount.toString())
      .replace('{dueDate}', selectedStudent.secondPaymentDueDate)
      .replace('{percentage}', '95.5')
      .replace('{appreciation}', 'ممتاز')
      .replace('{rank}', 'الأولى')
      .replace('{date}', new Date().toISOString().split('T')[0])
      .replace('{notes}', 'يرجى مراجعة إدارة المدرسة.');

    setCustomMessage(msg);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !customMessage.trim()) return;

    onSendSms(
      selectedStudent.id,
      `${selectedStudent.firstName} ${selectedStudent.lastName}`,
      selectedStudent.guardianPhone,
      selectedType,
      customMessage
    );

    if (sendViaWhatsApp && selectedStudent.guardianPhone) {
      // Clean phone
      const phoneDigits = selectedStudent.guardianPhone.replace(/\D/g, '');
      const waUrl = `https://api.whatsapp.com/send?phone=${phoneDigits}&text=${encodeURIComponent(customMessage)}`;
      window.open(waUrl, '_blank');
    }

    setSuccessToast(`تم إرسال الإشعار بنجاح إلى ولي أمر الطالب (${selectedStudent.firstName})`);
    setTimeout(() => setSuccessToast(null), 4000);
    setCustomMessage('');
  };

  const handleSendToAllUnpaid = () => {
    const unpaid = students.filter(s => s.remainingAmount > 0);
    if (unpaid.length === 0) {
      alert('لا يوجد طلاب متبقي عليهم أقساط مالية حالياً.');
      return;
    }
    
    unpaid.forEach(s => {
      const msg = `السيد ولي أمر الطالب ${s.firstName} ${s.lastName} المحترم، نود تذكيركم بموعد استحقاق الدفعة الثانية من القسط الدراسي وقدرها ${s.remainingAmount}$ المستحقة بتاريخ ${s.secondPaymentDueDate}. شاكرين حسن تعاونكم - ${SCHOOL_INFO.name}`;
      onSendSms(s.id, `${s.firstName} ${s.lastName}`, s.guardianPhone, 'تنبيه قسط', msg);
    });

    setSuccessToast(`تم إرسال ${unpaid.length} رسالة تذكير مالي دفعة واحدة لأولياء الأمور!`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>مركز التنبيهات الفورية والرسائل القصيرة (SMS / WhatsApp)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تواصل فوري ولحظي مع أولياء الأمور لإشعارهم بالنتائج، متابعة الأداء، الحضور والغياب، ومواعيد الأقساط.
          </p>
        </div>

        <button
          onClick={handleSendToAllUnpaid}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
        >
          <DollarSign className="w-4 h-4" />
          <span>تنبيه جماعي لجميع المتأخرين بالأقساط</span>
        </button>
      </div>

      {successToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
          <CheckCheck className="w-5 h-5 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Compose Message */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Send className="w-4 h-4 text-blue-600" />
            <span>إنشاء رسالة وإشعار فوري</span>
          </h3>

          <form onSubmit={handleSend} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اختر الطالب / ولي الأمر:</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.currentGrade}) - {s.guardianPhone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">نوع الإشعار:</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="تنبيه قسط">تنبيه قسط واستحقاق مالي</option>
                  <option value="كشف علامات">إشعار نتائج وكشف علامات</option>
                  <option value="غياب">تنبيه غياب / تأخر</option>
                  <option value="متابعة دورية">تقرير متابعة وسلوك دوري</option>
                  <option value="إعلان عام">إعلان عام / مناسبة مدرسية</option>
                </select>
              </div>
            </div>

            {/* Quick Templates Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>قوالب جاهزة سريعة:</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectTemplate('feeReminder')}
                  className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-medium cursor-pointer"
                >
                  تذكير بالقسط
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTemplate('gradesReady')}
                  className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-medium cursor-pointer"
                >
                  صدور الشهادة
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTemplate('absenceAlert')}
                  className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-medium cursor-pointer"
                >
                  تنبيه غياب
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTemplate('weeklyReport')}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-medium cursor-pointer"
                >
                  تقرير أسبوعي
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">نص الرسالة المرسلة:</label>
              <textarea
                rows={5}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="اكتب نص الرسالة هنا أو اختر قالباً أعلاه..."
                className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs leading-relaxed"
                required
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>عدد الأحرف: {customMessage.length}</span>
                <span>رقم ولي الأمر: {selectedStudent?.guardianPhone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={sendViaWhatsApp}
                  onChange={(e) => setSendViaWhatsApp(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>فتح محادثة واتساب المباشرة أيضاً</span>
              </label>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الإشعار الآن</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Side: Message History Log */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <History className="w-4 h-4 text-slate-600" />
            <span>سجل الإشعارات المرسلة مؤخراً</span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {smsLogs.map((log) => (
              <div key={log.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{log.studentName}</span>
                  <span className="text-[10px] text-slate-400">{log.sentAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    {log.messageType}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 dir-ltr">{log.parentPhone}</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed pt-1 border-t border-slate-200/60">
                  {log.content}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold pt-0.5">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>تم التسليم بنجاح</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
