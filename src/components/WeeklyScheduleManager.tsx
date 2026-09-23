import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  User, 
  Plus, 
  Printer, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { WeeklyScheduleItem } from '../types';
import { SCHOOL_INFO } from '../data/mockData';

interface WeeklyScheduleManagerProps {
  schedule: WeeklyScheduleItem[];
  onSaveScheduleItem: (item: WeeklyScheduleItem) => void;
  onDeleteScheduleItem: (id: string) => void;
}

const DAYS: Array<'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'> = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
];

const GRADES = [
  'الكل',
  'الأول المتوسط',
  'الثاني المتوسط',
  'الثالث المتوسط',
  'الصف الخامس الابتدائي',
  'الصف السادس الابتدائي',
];

export const WeeklyScheduleManager: React.FC<WeeklyScheduleManagerProps> = ({
  schedule,
  onSaveScheduleItem,
  onDeleteScheduleItem,
}) => {
  const [selectedDay, setSelectedDay] = useState<'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'>('الأحد');
  const [selectedGrade, setSelectedGrade] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WeeklyScheduleItem | null>(null);

  // Filtered items
  const filteredSchedule = schedule.filter((item) => {
    const matchDay = item.day === selectedDay;
    const matchGrade = selectedGrade === 'الكل' || item.grade === selectedGrade;
    const matchSearch = 
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.room && item.room.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchDay && matchGrade && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingItem({
      id: `sch-${Date.now()}`,
      day: selectedDay,
      periodNumber: filteredSchedule.length + 1,
      timeSlot: '08:00 - 08:45',
      subject: '',
      grade: selectedGrade === 'الكل' ? 'الأول المتوسط' : selectedGrade,
      section: 'أ',
      teacherName: '',
      room: 'قاعة 101',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: WeeklyScheduleItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.subject.trim() || !editingItem.teacherName.trim()) {
      alert('يرجى كتابة اسم المادة واسم المعلم');
      return;
    }
    onSaveScheduleItem(editingItem);
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">الجدول الأسبوعي ومواعيد الدروس</h1>
              <span className="text-xs bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full font-bold border border-red-200">
                {schedule.length} حصة مسجلة
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              تنظيم أنصبة الحصص اليومية، القاعات الدراسية، وتوزيع الكادر التدريسي
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>طباعة الجدول</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حصة +</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Day Selection & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        
        {/* Days Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-500 ml-2">اختر اليوم:</span>
          {DAYS.map((day) => {
            const isSelected = selectedDay === day;
            const countForDay = schedule.filter((s) => s.day === day).length;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <span>{day}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
                }`}>
                  {countForDay}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 shrink-0">المرحلة / الصف:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث عن مادة أو معلم أو قاعة..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

      </div>

      {/* Schedule Table (Matching Image Look) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-sky-50/50 border-b border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600" />
            <span className="font-bold text-slate-800 text-sm">
              حصص يوم {selectedDay} ({filteredSchedule.length} حصة)
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {SCHOOL_INFO.academicYear} • دوام رسمي
          </span>
        </div>

        {filteredSchedule.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-700 text-sm">لا توجد حصص مسجلة لهذا اليوم بالمعايير الحالية</h3>
            <p className="text-xs text-slate-400 mt-1">اضغط على زر "إضافة حصة +" لبدء جدولة الدروس</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/70">
                <tr>
                  <th className="py-3 px-4 text-center w-16">الحصة</th>
                  <th className="py-3 px-4">الوقت</th>
                  <th className="py-3 px-4">الدرس / المادة</th>
                  <th className="py-3 px-4">الصف والشعبة</th>
                  <th className="py-3 px-4">المعلم / المدرس</th>
                  <th className="py-3 px-4">القاعة</th>
                  <th className="py-3 px-4 text-center w-24">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchedule
                  .sort((a, b) => a.periodNumber - b.periodNumber)
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold">
                        <span className="w-7 h-7 bg-blue-50 text-blue-700 rounded-lg inline-flex items-center justify-center font-bold">
                          {item.periodNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">
                        {item.timeSlot}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="font-bold text-slate-800 text-sm">{item.subject}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        <span>{item.grade}</span>
                        <span className="mr-1 text-slate-400">({item.section})</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {item.teacherName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {item.room || 'قاعة الصف'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="تعديل الحصة"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف حصة ${item.subject}؟`)) {
                                onDeleteScheduleItem(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف الحصة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">
                {editingItem.id ? 'تعديل بيانات الحصة' : 'إضافة حصة دراسية جديدة'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">اليوم</label>
                  <select
                    value={editingItem.day}
                    onChange={(e) => setEditingItem({ ...editingItem, day: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">رقم الحصة</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={editingItem.periodNumber}
                    onChange={(e) => setEditingItem({ ...editingItem, periodNumber: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">وقت الحصة</label>
                  <input
                    type="text"
                    value={editingItem.timeSlot}
                    onChange={(e) => setEditingItem({ ...editingItem, timeSlot: e.target.value })}
                    placeholder="مثال: 08:00 - 08:45"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الدرس / المادة</label>
                  <input
                    type="text"
                    value={editingItem.subject}
                    onChange={(e) => setEditingItem({ ...editingItem, subject: e.target.value })}
                    placeholder="مثال: الرياضيات"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الصف الدراسي</label>
                  <input
                    type="text"
                    value={editingItem.grade}
                    onChange={(e) => setEditingItem({ ...editingItem, grade: e.target.value })}
                    placeholder="مثال: الأول المتوسط"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الشعبة</label>
                  <input
                    type="text"
                    value={editingItem.section}
                    onChange={(e) => setEditingItem({ ...editingItem, section: e.target.value })}
                    placeholder="مثال: أ"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">المعلم المسؤول</label>
                  <input
                    type="text"
                    value={editingItem.teacherName}
                    onChange={(e) => setEditingItem({ ...editingItem, teacherName: e.target.value })}
                    placeholder="مثال: أ. علي الحسيني"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">القاعة / المختبر</label>
                  <input
                    type="text"
                    value={editingItem.room || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, room: e.target.value })}
                    placeholder="مثال: مختبر العلوم 1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  حفظ الحصة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
