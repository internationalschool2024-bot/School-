import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Printer, 
  Send, 
  Award, 
  TrendingUp, 
  Save, 
  CheckCircle, 
  Star, 
  Plus, 
  Edit3, 
  Download,
  GraduationCap
} from 'lucide-react';
import { Student, StudentReportCard, SubjectGrade } from '../types';
import { GRADE_LEVELS, SCHOOL_INFO } from '../data/mockData';
import { exportToCSV } from '../utils/helpers';

interface GradesManagerProps {
  students: Student[];
  reportCards: StudentReportCard[];
  onSaveReportCard: (reportCard: StudentReportCard) => void;
  onPrintReportCard: (student: Student) => void;
  onSendSmsGrades: (student: Student, reportCard: StudentReportCard) => void;
}

export const GradesManager: React.FC<GradesManagerProps> = ({
  students,
  reportCards,
  onSaveReportCard,
  onPrintReportCard,
  onSendSmsGrades,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('الصف الخامس الابتدائي');
  const [selectedTerm, setSelectedTerm] = useState<'الفصل الدراسي الأول' | 'الفصل الدراسي الثاني'>('الفصل الدراسي الأول');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Gradebook editing modal / state
  const [selectedStudentForGrading, setSelectedStudentForGrading] = useState<Student | null>(null);
  const [activeReportCard, setActiveReportCard] = useState<StudentReportCard | null>(null);

  const defaultSubjects: SubjectGrade[] = [
    { subjectName: 'القرآن الكريم والتربية الإسلامية', maxScore: 100, activityScore: 20, test1Score: 20, midtermScore: 38, test2Score: 20, finalExamScore: 58, totalScore: 98, gradeNote: 'ممتاز' },
    { subjectName: 'اللغة العربية وقواعدها', maxScore: 100, activityScore: 19, test1Score: 19, midtermScore: 37, test2Score: 19, finalExamScore: 56, totalScore: 94, gradeNote: 'جيد جداً مرتفع' },
    { subjectName: 'الرياضيات والهندسة', maxScore: 100, activityScore: 20, test1Score: 20, midtermScore: 39, test2Score: 20, finalExamScore: 58, totalScore: 98, gradeNote: 'ممتاز' },
    { subjectName: 'العلوم العامة والصحة', maxScore: 100, activityScore: 18, test1Score: 19, midtermScore: 36, test2Score: 18, finalExamScore: 54, totalScore: 91, gradeNote: 'ممتاز' },
    { subjectName: 'اللغة الإنجليزية (English)', maxScore: 100, activityScore: 19, test1Score: 19, midtermScore: 38, test2Score: 19, finalExamScore: 57, totalScore: 95, gradeNote: 'Excellent' },
    { subjectName: 'الاجتماعيات والتربية الوطنية', maxScore: 100, activityScore: 19, test1Score: 18, midtermScore: 36, test2Score: 19, finalExamScore: 55, totalScore: 93, gradeNote: 'ممتاز' },
    { subjectName: 'المعلوماتية والحاسوب', maxScore: 100, activityScore: 20, test1Score: 20, midtermScore: 39, test2Score: 20, finalExamScore: 59, totalScore: 99, gradeNote: 'إتقان عالي' },
    { subjectName: 'التربية الفنية والنشاط', maxScore: 100, activityScore: 20, test1Score: 20, midtermScore: 38, test2Score: 20, finalExamScore: 58, totalScore: 96, gradeNote: 'إبداع فني' },
  ];

  const handleOpenGrading = (student: Student) => {
    setSelectedStudentForGrading(student);
    const existing = reportCards.find(rc => rc.studentId === student.id && rc.term === selectedTerm);
    if (existing) {
      setActiveReportCard({ ...existing });
    } else {
      // Create new report card template
      const newCard: StudentReportCard = {
        id: `RC-${student.id}`,
        studentId: student.id,
        studentName: `${student.firstName} ${student.fatherName} ${student.lastName}`,
        gradeLevel: student.currentGrade,
        section: student.section,
        academicYear: SCHOOL_INFO.academicYear,
        term: selectedTerm,
        grades: [...defaultSubjects],
        totalScore: 764,
        maxTotalScore: 800,
        percentage: 95.5,
        appreciation: 'ممتاز',
        rank: 1,
        behaviorScore: 100,
        attendanceDays: 88,
        absenceDays: 0,
        teacherRemarks: `طالب متميز وخلوق، يظهر مواظبة عالية وتفوقاً دراسياً في كافة المواد.`,
        principalRemarks: `إلى مزيد من التقدم والنجاح الباهر بإذن الله.`,
        issuedDate: new Date().toISOString().split('T')[0],
      };
      setActiveReportCard(newCard);
    }
  };

  const handleSubjectScoreChange = (index: number, field: keyof SubjectGrade, val: number | string) => {
    if (!activeReportCard) return;
    const updatedGrades = [...activeReportCard.grades];
    const item = { ...updatedGrades[index], [field]: val };
    
    // Auto calculate total for this subject (activity + test1 + midterm + test2 + finalExam) / scaled to maxScore
    const total = 
      Number(item.activityScore || 0) + 
      Number(item.test1Score || 0) + 
      Number(item.midtermScore || 0) + 
      Number(item.test2Score || 0) + 
      Number(item.finalExamScore || 0);

    item.totalScore = Math.min(100, Math.round(total / 1.6)); // scaled to 100
    
    if (item.totalScore >= 90) item.gradeNote = 'ممتاز';
    else if (item.totalScore >= 80) item.gradeNote = 'جيد جداً';
    else if (item.totalScore >= 70) item.gradeNote = 'جيد';
    else if (item.totalScore >= 60) item.gradeNote = 'مقبول';
    else item.gradeNote = 'بحاجة لمتابعة';

    updatedGrades[index] = item;

    const totalSum = updatedGrades.reduce((sum, g) => sum + g.totalScore, 0);
    const maxTotal = updatedGrades.length * 100;
    const percentage = Number(((totalSum / maxTotal) * 100).toFixed(2));

    let appreciation: any = 'ممتاز';
    if (percentage < 60) appreciation = 'يحتاج إلى متابعة مكثفة';
    else if (percentage < 70) appreciation = 'مقبول';
    else if (percentage < 80) appreciation = 'جيد';
    else if (percentage < 90) appreciation = 'جيد جداً';

    setActiveReportCard({
      ...activeReportCard,
      grades: updatedGrades,
      totalScore: totalSum,
      maxTotalScore: maxTotal,
      percentage,
      appreciation,
    });
  };

  const handleSaveCard = () => {
    if (!activeReportCard) return;
    onSaveReportCard(activeReportCard);
    setSelectedStudentForGrading(null);
  };

  const gradeStudents = useMemo(() => {
    return students.filter(s => {
      const matchGrade = selectedGrade === 'all' || s.currentGrade === selectedGrade;
      const matchSearch = s.firstName.includes(searchTerm) || s.lastName.includes(searchTerm) || s.id.includes(searchTerm);
      return matchGrade && matchSearch;
    });
  }, [students, selectedGrade, searchTerm]);

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>نظام كشوفات العلامات والجلاء المدرسي</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              رصد الدرجات التفصيلية، حساب المعدلات والتقديرات، وإصدار شهادات الجلاء المدرسي الرسمية للعام {SCHOOL_INFO.academicYear}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setSelectedTerm('الفصل الدراسي الأول')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  selectedTerm === 'الفصل الدراسي الأول' ? 'bg-white text-blue-900 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                الفصل الدراسي الأول
              </button>
              <button
                onClick={() => setSelectedTerm('الفصل الدراسي الثاني')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  selectedTerm === 'الفصل الدراسي الثاني' ? 'bg-white text-blue-900 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                الفصل الدراسي الثاني
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كافة الصفوف</option>
              {GRADE_LEVELS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو رقم الطالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Gradebook List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            قائمة درجات طلاب ({selectedGrade}) - {selectedTerm}
          </span>
          <span className="text-xs text-slate-500 font-medium">{gradeStudents.length} طلاب</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">رقم الطالب</th>
                <th className="py-3.5 px-4">اسم الطالب الكامل</th>
                <th className="py-3.5 px-4">الشعبة</th>
                <th className="py-3.5 px-4">المجموع الكلي</th>
                <th className="py-3.5 px-4">النسبة المئوية %</th>
                <th className="py-3.5 px-4">التقدير العام</th>
                <th className="py-3.5 px-4 text-center">العمليات والشهادة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gradeStudents.map((st) => {
                const report = reportCards.find(r => r.studentId === st.id && r.term === selectedTerm);
                return (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 bg-blue-50/50 rounded">{st.id}</td>
                    
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {st.firstName} {st.fatherName} {st.lastName}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                        شعبة {st.section}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {report ? `${report.totalScore} / ${report.maxTotalScore}` : 'لم يُرصد بعد'}
                    </td>

                    <td className="py-3.5 px-4">
                      {report ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-700">{report.percentage}%</span>
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${report.percentage}%` }}></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {report ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          report.percentage >= 90 ? 'bg-emerald-100 text-emerald-800' :
                          report.percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                          report.percentage >= 70 ? 'bg-orange-100 text-orange-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          <Star className="w-3 h-3 fill-current" />
                          <span>{report.appreciation}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">قيد الرصد</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Edit / Enter Scores */}
                        <button
                          onClick={() => handleOpenGrading(st)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>رصد الدرجات</span>
                        </button>

                        {/* Print Report Card */}
                        <button
                          title="طباعة الجلاء المدرسي وكشف العلامات الرسمي"
                          onClick={() => onPrintReportCard(st)}
                          className="p-1.5 rounded-md hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Send SMS with Grades */}
                        {report && (
                          <button
                            title="إرسال كشف الدرجات لولي الأمر عبر SMS/واتساب"
                            onClick={() => onSendSmsGrades(st, report)}
                            className="p-1.5 rounded-md hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

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
      {/* GRADEBOOK ENTRY MODAL */}
      {/* ========================================================================= */}
      {selectedStudentForGrading && activeReportCard && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                  <span>رصد كشف علامات الطالب: {activeReportCard.studentName}</span>
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  {activeReportCard.gradeLevel} • شعبة {activeReportCard.section} • {activeReportCard.term}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForGrading(null)}
                className="text-white/80 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                <div>
                  <span className="text-slate-500 font-medium">المجموع الكلي:</span>
                  <div className="text-xl font-black text-slate-900 mt-0.5">
                    {activeReportCard.totalScore} <span className="text-xs text-slate-400 font-normal">/ {activeReportCard.maxTotalScore}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">النسبة المئوية:</span>
                  <div className="text-xl font-black text-purple-700 mt-0.5">
                    {activeReportCard.percentage}%
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">التقدير العام:</span>
                  <div className="text-sm font-bold text-emerald-700 mt-1">
                    {activeReportCard.appreciation}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">علامة السلوك والمواظبة:</span>
                  <div className="text-lg font-bold text-indigo-700 mt-0.5">
                    100 / 100
                  </div>
                </div>
              </div>

              {/* Subjects Grading Sheet */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">المادة الدراسية</th>
                      <th className="py-2.5 px-2 text-center">أعمال ونشاط (20)</th>
                      <th className="py-2.5 px-2 text-center">مذاكرة 1 (20)</th>
                      <th className="py-2.5 px-2 text-center">امتحان نصفي (40)</th>
                      <th className="py-2.5 px-2 text-center">مذاكرة 2 (20)</th>
                      <th className="py-2.5 px-2 text-center">امتحان نهائي (60)</th>
                      <th className="py-2.5 px-2 text-center">المحصلة (100)</th>
                      <th className="py-2.5 px-3">التقدير والملاحظة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeReportCard.grades.map((g, idx) => (
                      <tr key={idx} className="hover:bg-purple-50/20">
                        <td className="py-2 px-3 font-bold text-slate-900">{g.subjectName}</td>
                        
                        <td className="py-1 px-1 text-center">
                          <input
                            type="number"
                            max={20}
                            min={0}
                            value={g.activityScore}
                            onChange={(e) => handleSubjectScoreChange(idx, 'activityScore', Number(e.target.value))}
                            className="w-14 p-1 rounded border border-slate-300 text-center font-mono font-bold"
                          />
                        </td>

                        <td className="py-1 px-1 text-center">
                          <input
                            type="number"
                            max={20}
                            min={0}
                            value={g.test1Score}
                            onChange={(e) => handleSubjectScoreChange(idx, 'test1Score', Number(e.target.value))}
                            className="w-14 p-1 rounded border border-slate-300 text-center font-mono font-bold"
                          />
                        </td>

                        <td className="py-1 px-1 text-center">
                          <input
                            type="number"
                            max={40}
                            min={0}
                            value={g.midtermScore}
                            onChange={(e) => handleSubjectScoreChange(idx, 'midtermScore', Number(e.target.value))}
                            className="w-14 p-1 rounded border border-slate-300 text-center font-mono font-bold"
                          />
                        </td>

                        <td className="py-1 px-1 text-center">
                          <input
                            type="number"
                            max={20}
                            min={0}
                            value={g.test2Score}
                            onChange={(e) => handleSubjectScoreChange(idx, 'test2Score', Number(e.target.value))}
                            className="w-14 p-1 rounded border border-slate-300 text-center font-mono font-bold"
                          />
                        </td>

                        <td className="py-1 px-1 text-center">
                          <input
                            type="number"
                            max={60}
                            min={0}
                            value={g.finalExamScore}
                            onChange={(e) => handleSubjectScoreChange(idx, 'finalExamScore', Number(e.target.value))}
                            className="w-14 p-1 rounded border border-slate-300 text-center font-mono font-bold"
                          />
                        </td>

                        <td className="py-2 px-2 text-center font-mono font-black text-purple-900 bg-purple-50/50">
                          {g.totalScore}
                        </td>

                        <td className="py-1 px-2">
                          <input
                            type="text"
                            value={g.gradeNote || ''}
                            onChange={(e) => handleSubjectScoreChange(idx, 'gradeNote', e.target.value)}
                            placeholder="ملاحظة المعلم"
                            className="w-full p-1 rounded border border-slate-200 text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ملاحظة المعلم المربي:</label>
                  <textarea
                    rows={2}
                    value={activeReportCard.teacherRemarks}
                    onChange={(e) => setActiveReportCard({ ...activeReportCard, teacherRemarks: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">كلمة وتوقيع إدارة المدرسة:</label>
                  <textarea
                    rows={2}
                    value={activeReportCard.principalRemarks}
                    onChange={(e) => setActiveReportCard({ ...activeReportCard, principalRemarks: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForGrading(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 font-bold text-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveCard}
                  className="inline-flex items-center gap-1.5 px-6 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ واعتماد كشف الدرجات</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
