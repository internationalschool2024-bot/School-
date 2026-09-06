import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Send, 
  Printer, 
  Plus, 
  Search, 
  UserCheck, 
  FileText, 
  Star, 
  BookOpen, 
  Smile, 
  Save, 
  X,
  MessageCircle
} from 'lucide-react';
import { Student, AttendanceRecord, PeriodicFollowUp } from '../types';
import { formatArabicDate } from '../utils/helpers';

interface FollowUpManagerProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  followUpReports: PeriodicFollowUp[];
  onSaveAttendanceBatch: (records: AttendanceRecord[]) => void;
  onSaveFollowUpReport: (report: PeriodicFollowUp) => void;
  onSendFollowUpSms: (student: Student, report: PeriodicFollowUp) => void;
  onPrintFollowUpReport: (student: Student, report: PeriodicFollowUp) => void;
}

export const FollowUpManager: React.FC<FollowUpManagerProps> = ({
  students,
  attendanceRecords,
  followUpReports,
  onSaveAttendanceBatch,
  onSaveFollowUpReport,
  onSendFollowUpSms,
  onPrintFollowUpReport,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'followup'>('attendance');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState<string>('الصف الخامس الابتدائي');
  const [searchTerm, setSearchTerm] = useState('');

  // Daily attendance state mapping studentId -> status
  const [dailyStatusMap, setDailyStatusMap] = useState<Record<string, 'حاضر' | 'غائب' | 'متأخر' | 'غياب مبرر'>>({});
  
  // Follow-up modal
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedStudentForFollowUp, setSelectedStudentForFollowUp] = useState<Student | null>(null);
  const [followUpFormData, setFollowUpFormData] = useState<PeriodicFollowUp>({
    id: `FU-${Date.now()}`,
    studentId: '',
    studentName: '',
    date: new Date().toISOString().split('T')[0],
    period: 'أسبوعي',
    academicLevel: 'متميز',
    homeworkCommitment: 'ملتزم دائماً',
    classParticipation: 'نشط وفعال',
    behaviorNotes: 'طالب مؤدب ومواظب ومتعاون مع زملائه.',
    teacherRecommendations: 'المواظبة على القراءة الإثرائية وحل التمارين اليومية.',
    notifiedParent: false,
  });

  const gradeStudents = useMemo(() => {
    return students.filter(s => {
      const matchGrade = selectedGrade === 'all' || s.currentGrade === selectedGrade;
      const matchSearch = s.firstName.includes(searchTerm) || s.lastName.includes(searchTerm) || s.id.includes(searchTerm);
      return matchGrade && matchSearch;
    });
  }, [students, selectedGrade, searchTerm]);

  const handleSetAllStatus = (status: 'حاضر' | 'غائب' | 'متأخر' | 'غياب مبرر') => {
    const updated: Record<string, any> = { ...dailyStatusMap };
    gradeStudents.forEach(s => {
      updated[s.id] = status;
    });
    setDailyStatusMap(updated);
  };

  const handleSaveAttendance = () => {
    const recordsToSave: AttendanceRecord[] = gradeStudents.map(s => ({
      id: `att-${s.id}-${selectedDate}`,
      studentId: s.id,
      date: selectedDate,
      status: dailyStatusMap[s.id] || 'حاضر',
    }));
    onSaveAttendanceBatch(recordsToSave);
    alert('تم حفظ وتحديث سجل الحضور والغياب بنجاح!');
  };

  const handleOpenNewFollowUp = (student: Student) => {
    setSelectedStudentForFollowUp(student);
    setFollowUpFormData({
      id: `FU-${Date.now()}`,
      studentId: student.id,
      studentName: `${student.firstName} ${student.fatherName} ${student.lastName}`,
      date: new Date().toISOString().split('T')[0],
      period: 'أسبوعي',
      academicLevel: 'متميز',
      homeworkCommitment: 'ملتزم دائماً',
      classParticipation: 'نشط وفعال',
      behaviorNotes: 'سلوك وانضباط ممتاز، مشاركة إيجابية في الأنشطة المدرسية.',
      teacherRecommendations: 'متابعة جدول المذاكرة الأسبوعي مع التركيز على مهارات الاستماع والمحادثة.',
      notifiedParent: false,
    });
    setIsFollowUpModalOpen(true);
  };

  const handleSaveFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveFollowUpReport(followUpFormData);
    setIsFollowUpModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-Tabs */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span>المتابعة الدورية وسجل الحضور والغياب</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              رصد الحضور اليومي الفوري وإعداد تقارير المتابعة السلوكية والأكاديمية لأولياء الأمور.
            </p>
          </div>

          <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 rounded-md transition-all cursor-pointer ${
                activeTab === 'attendance' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              تسجيل الحضور اليومي
            </button>
            <button
              onClick={() => setActiveTab('followup')}
              className={`px-4 py-2 rounded-md transition-all cursor-pointer ${
                activeTab === 'followup' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              تقارير المتابعة الدورية
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY ATTENDANCE TRACKER */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">تاريخ اليوم:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">الصف الدراسي:</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">كافة الصفوف</option>
                  {Array.from(new Set(students.map(s => s.currentGrade))).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bulk set buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSetAllStatus('حاضر')}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 cursor-pointer"
              >
                تحديد الكل حاضر
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs cursor-pointer"
              >
                حفظ سجل الحضور
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">رقم الطالب</th>
                  <th className="py-3.5 px-4">اسم الطالب الكامل</th>
                  <th className="py-3.5 px-4">الصف والشعبة</th>
                  <th className="py-3.5 px-4">هاتف ولي الأمر</th>
                  <th className="py-3.5 px-4 text-center">حالة الحضور والغياب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gradeStudents.map((st) => {
                  const currentStatus = dailyStatusMap[st.id] || 'حاضر';
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 bg-blue-50/50 rounded">{st.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{st.firstName} {st.fatherName} {st.lastName}</td>
                      <td className="py-3 px-4 text-slate-600">{st.currentGrade} • شعبة {st.section}</td>
                      <td className="py-3 px-4 font-mono text-slate-600 dir-ltr text-right">{st.guardianPhone}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {(['حاضر', 'متأخر', 'غائب', 'غياب مبرر'] as const).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setDailyStatusMap({ ...dailyStatusMap, [st.id]: status })}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                                currentStatus === status
                                  ? status === 'حاضر'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : status === 'متأخر'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : status === 'غائب'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PERIODIC FOLLOW-UP REPORTS (تقارير المتابعة الدورية) */}
      {/* ========================================================================= */}
      {activeTab === 'followup' && (
        <div className="space-y-6">
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">تقارير المتابعة الأكاديمية والسلوكية الدورية</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                توليد تقرير شامل عن أداء الطالب وتوصيات المعلمين مع إمكانية الإرسال الفوري لولي الأمر.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="py-2 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">كافة الصفوف</option>
                {Array.from(new Set(students.map(s => s.currentGrade))).map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Follow-up Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gradeStudents.map((st) => {
              const report = followUpReports.find(f => f.studentId === st.id);
              return (
                <div key={st.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                  
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{st.firstName} {st.fatherName} {st.lastName}</h4>
                      <p className="text-xs text-slate-500">{st.currentGrade} • شعبة {st.section}</p>
                    </div>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                      {st.id}
                    </span>
                  </div>

                  {report ? (
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-center">
                        <div>
                          <span className="text-slate-400 block text-[10px]">المستوى</span>
                          <span className="font-bold text-blue-800">{report.academicLevel}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">الواجبات</span>
                          <span className="font-bold text-slate-700">{report.homeworkCommitment}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">المشاركة</span>
                          <span className="font-bold text-emerald-700">{report.classParticipation}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-700 block mb-0.5">ملاحظات المعلم:</span>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{report.behaviorNotes}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[11px] text-slate-400">تاريخ التقرير: {report.date}</span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onPrintFollowUpReport(st, report)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                            title="طباعة التقرير الدوري"
                          >
                            <Printer className="w-4 h-4 text-blue-600" />
                          </button>
                          
                          <button
                            onClick={() => onSendFollowUpSms(st, report)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] cursor-pointer shadow-xs"
                          >
                            <Send className="w-3 h-3" />
                            <span>إرسال لولي الأمر</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-xs text-slate-400 mb-3">لم يتم إنشاء تقرير متابعة دورية لهذا الأسبوع</p>
                      <button
                        onClick={() => handleOpenNewFollowUp(st)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إنشاء تقرير متابعة</span>
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* FOLLOW-UP REPORT MODAL */}
      {/* ========================================================================= */}
      {isFollowUpModalOpen && selectedStudentForFollowUp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-[#1E293B] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">تقرير المتابعة الدورية للطالب</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {selectedStudentForFollowUp.firstName} {selectedStudentForFollowUp.lastName} ({selectedStudentForFollowUp.currentGrade})
                </p>
              </div>
              <button
                onClick={() => setIsFollowUpModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFollowUp} className="p-5 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الفترة الزمنية:</label>
                  <select
                    value={followUpFormData.period}
                    onChange={(e) => setFollowUpFormData({ ...followUpFormData, period: e.target.value as any })}
                    className="w-full p-2 rounded border border-slate-300 bg-white font-bold"
                  >
                    <option value="أسبوعي">تقرير أسبوعي</option>
                    <option value="شهري">تقرير شهري</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المستوى الأكاديمي العام:</label>
                  <select
                    value={followUpFormData.academicLevel}
                    onChange={(e) => setFollowUpFormData({ ...followUpFormData, academicLevel: e.target.value as any })}
                    className="w-full p-2 rounded border border-slate-300 bg-white font-bold text-purple-900"
                  >
                    <option value="متميز">متميز (فوق 90%)</option>
                    <option value="جيد جداً">جيد جداً (80-89%)</option>
                    <option value="متوسط">متوسط (70-79%)</option>
                    <option value="بحاجة لدعم">بحاجة لدعم ومتابعة</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">حل الواجبات المنزلية:</label>
                  <select
                    value={followUpFormData.homeworkCommitment}
                    onChange={(e) => setFollowUpFormData({ ...followUpFormData, homeworkCommitment: e.target.value as any })}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="ملتزم دائماً">ملتزم دائماً</option>
                    <option value="ملتزم غالباً">ملتزم غالباً</option>
                    <option value="غير ملتزم أحياناً">غير ملتزم أحياناً</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المشاركة والتفاعل الصفي:</label>
                  <select
                    value={followUpFormData.classParticipation}
                    onChange={(e) => setFollowUpFormData({ ...followUpFormData, classParticipation: e.target.value as any })}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="نشط وفعال">نشط وفعال ومبادر</option>
                    <option value="مشارك جيد">مشارك جيد</option>
                    <option value="قليل المشاركة">قليل المشاركة والانتباه</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الملاحظات السلوكية والانضباط:</label>
                <textarea
                  rows={2}
                  value={followUpFormData.behaviorNotes}
                  onChange={(e) => setFollowUpFormData({ ...followUpFormData, behaviorNotes: e.target.value })}
                  placeholder="اكتب ملاحظات المعلم عن سلوك الطالب..."
                  className="w-full p-2 rounded border border-slate-300 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">توصيات المعلم لولي الأمر:</label>
                <textarea
                  rows={2}
                  value={followUpFormData.teacherRecommendations}
                  onChange={(e) => setFollowUpFormData({ ...followUpFormData, teacherRecommendations: e.target.value })}
                  placeholder="توصيات تعزيز الأداء والمتابعة المنزلية..."
                  className="w-full p-2 rounded border border-slate-300 text-xs"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFollowUpModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 font-bold text-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-xs transition-colors"
                >
                  حفظ التقرير
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
