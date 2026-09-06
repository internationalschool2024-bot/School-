import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Printer, 
  Mail, 
  Phone, 
  Briefcase, 
  Award, 
  Edit, 
  Trash2, 
  Download, 
  X, 
  Save, 
  Calendar, 
  UserCheck, 
  Heart
} from 'lucide-react';
import { Teacher } from '../types';
import { exportToCSV } from '../utils/helpers';
import { SCHOOL_INFO } from '../data/mockData';

interface TeacherManagerProps {
  teachers: Teacher[];
  onSaveTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
  onPrintTeacherCard: (teacher: Teacher) => void;
}

export const TeacherManager: React.FC<TeacherManagerProps> = ({
  teachers,
  onSaveTeacher,
  onDeleteTeacher,
  onPrintTeacherCard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const createEmptyTeacher = (): Teacher => {
    return {
      id: `T-${101 + teachers.length}`,
      nationalId: '',
      gender: 'ذكر',
      fullName: '',
      fatherName: '',
      motherName: '',
      specialization: 'لغة عربية',
      birthDate: '1988-01-01',
      birthPlace: 'دمشق',
      residencePlace: 'دمشق',
      detailedAddress: '',
      maritalStatus: 'متزوج',
      spouseName: '',
      spouseJob: '',
      childrenCount: 0,
      childrenDetails: '',
      highestDegree: 'إجازة جامعية + دبلوم تأهيل تربوي',
      graduationDate: '2010-06-30',
      phone: '',
      previousSchools: '',
      experienceYears: 5,
      skills: 'استراتيجيات التدريس الفعال، الإدارة الصفية، استخدام التقنيات التعليمية',
      hireDate: new Date().toISOString().split('T')[0],
      teachingGrades: 'المرحلة الابتدائية',
      email: '',
      salary: 1000,
    };
  };

  const [formData, setFormData] = useState<Teacher>(createEmptyTeacher());

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setFormData(createEmptyTeacher());
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({ ...teacher });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      alert('يرجى إدخال اسم المعلم بالكامل');
      return;
    }
    onSaveTeacher(formData);
    setIsModalOpen(false);
  };

  const specializations = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (t.specialization) set.add(t.specialization);
    });
    return Array.from(set);
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        t.fullName.includes(searchTerm) ||
        t.specialization.includes(searchTerm) ||
        t.phone.includes(searchTerm) ||
        t.nationalId.includes(searchTerm);

      const matchSpec = specializationFilter === 'all' || t.specialization === specializationFilter;
      return matchSearch && matchSpec;
    });
  }, [teachers, searchTerm, specializationFilter]);

  const handleExportCSV = () => {
    const exportData = filteredTeachers.map((t) => ({
      'الرقم': t.id,
      'الرقم الوطني': t.nationalId,
      'الاسم الكامل': t.fullName,
      'الأب': t.fatherName,
      'الأم': t.motherName,
      'الجنس': t.gender,
      'التخصص': t.specialization,
      'آخر شهادة': t.highestDegree,
      'سنوات الخبرة': t.experienceYears,
      'الصفوف الموكلة': t.teachingGrades,
      'الهاتف': t.phone,
      'البريد الإلكتروني': t.email,
    }));
    exportToCSV(`سجل_المعلمين_${new Date().toISOString().split('T')[0]}.csv`, exportData);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">سجل الكادر التعليمي والإداري</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                {filteredTeachers.length} معلماً
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              إدارة بيانات المعلمين، الخبرات والشهادات، الصفوف الموكلة، وبطاقات المعلمين.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-add-new-teacher"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة معلم جديد +</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تصدير Excel/CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالاسم، التخصص، الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كافة الاختصاصات</option>
              {specializations.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shadow-xs">
                    {teacher.fullName.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{teacher.fullName}</h3>
                    <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded mt-0.5 border border-blue-100">
                      {teacher.specialization}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs text-slate-400">{teacher.id}</span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">آخر مؤهل علمي:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[170px]" title={teacher.highestDegree}>
                    {teacher.highestDegree}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">الخبرة التدريسية:</span>
                  <span className="font-semibold text-slate-800">{teacher.experienceYears} سنوات</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">الصفوف الموكلة:</span>
                  <span className="font-semibold text-blue-700">{teacher.teachingGrades}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">الحالة الاجتماعية:</span>
                  <span>{teacher.maritalStatus} {teacher.childrenCount > 0 ? `(${teacher.childrenCount} أولاد)` : ''}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono dir-ltr">{teacher.phone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 truncate max-w-[140px]">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onPrintTeacherCard(teacher)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة بطاقة المعلم</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(teacher)}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`هل ترغب في حذف سجل المعلم ${teacher.fullName}؟`)) {
                      onDeleteTeacher(teacher.id);
                    }
                  }}
                  className="p-1.5 rounded hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TEACHER REGISTRATION & EDIT MODAL (Comprehensive match with Image 3) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {editingTeacher ? `تعديل بيانات المعلم: ${formData.fullName}` : 'إضافة سجل معلم جديد'}
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  بيانات المعلمين • المدرسة الدولية ({SCHOOL_INFO.academicYear})
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* SECTION 1: Teacher Identification */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 text-xs">
                <h4 className="font-bold text-purple-900 border-b border-slate-200 pb-2">
                  أولاً: البيانات الشخصية والتعريفية (مطابقة لصورة بيانات المعلمين)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الرقم (ID):</label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className="w-full p-2 rounded border border-slate-300 bg-white font-mono font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الرقم الوطني:</label>
                    <input
                      type="text"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      placeholder="01020304051"
                      className="w-full p-2 rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الاسم والكنية:</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="محمود العبدالله"
                      className="w-full p-2 rounded border border-slate-300 bg-white font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الجنس:</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full p-2 rounded border border-slate-300 bg-white font-bold"
                    >
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم الأب:</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="أحمد"
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم الأم:</label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      placeholder="مريم"
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الاختصاص:</label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="لغة عربية وتربية إسلامية"
                      className="w-full p-2 rounded border border-slate-300 bg-white font-bold text-purple-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاريخ الولادة:</label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">مكان الولادة:</label>
                    <input
                      type="text"
                      value={formData.birthPlace}
                      onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                      placeholder="دمشق"
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">مكان الإقامة:</label>
                    <input
                      type="text"
                      value={formData.residencePlace}
                      onChange={(e) => setFormData({ ...formData, residencePlace: e.target.value })}
                      placeholder="المزة"
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">العنوان بالتفصيل:</label>
                    <input
                      type="text"
                      value={formData.detailedAddress}
                      onChange={(e) => setFormData({ ...formData, detailedAddress: e.target.value })}
                      placeholder="دمشق - المزة - شارع الفردوس"
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>

                </div>
              </div>

              {/* SECTION 2: Marital & Family Status */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 text-xs">
                <h4 className="font-bold text-purple-900 border-b border-slate-200 pb-2">
                  ثانياً: الحالة الاجتماعية وبيانات الأسرة
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الحالة الاجتماعية:</label>
                    <select
                      value={formData.maritalStatus}
                      onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value as any })}
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                    >
                      <option value="متزوج">متزوج</option>
                      <option value="أعزب">أعزب</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم الزوج/ة:</label>
                    <input
                      type="text"
                      value={formData.spouseName || ''}
                      onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
                      placeholder="فاطمة الكردي"
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">عمل الزوج/ة:</label>
                    <input
                      type="text"
                      value={formData.spouseJob || ''}
                      onChange={(e) => setFormData({ ...formData, spouseJob: e.target.value })}
                      placeholder="معلمة"
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">عدد الأولاد:</label>
                    <input
                      type="number"
                      value={formData.childrenCount}
                      onChange={(e) => setFormData({ ...formData, childrenCount: Number(e.target.value) })}
                      className="w-full p-2 rounded border border-slate-300 bg-white font-bold"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block font-bold text-slate-700 mb-1">
                      تفاصيل الأولاد والصفوف (الولد 1 وصفه، 2، 3، 4...):
                    </label>
                    <input
                      type="text"
                      value={formData.childrenDetails || ''}
                      onChange={(e) => setFormData({ ...formData, childrenDetails: e.target.value })}
                      placeholder="أحمد (الصف الخامس)، ريم (الصف الثالث)، يوسف (الروضة)"
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>

                </div>
              </div>

              {/* SECTION 3: Qualifications, Experience & Work Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 text-xs">
                <h4 className="font-bold text-purple-900 border-b border-slate-200 pb-2">
                  ثالثاً: المؤهلات العلمية والخبرات والصفوف
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">آخر شهادة حاصل عليها:</label>
                    <input
                      type="text"
                      value={formData.highestDegree}
                      onChange={(e) => setFormData({ ...formData, highestDegree: e.target.value })}
                      placeholder="إجازة في الآداب + دبلوم تأهيل تربوي"
                      className="w-full p-2 rounded border border-slate-300 bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاريخ التخرج:</label>
                    <input
                      type="date"
                      value={formData.graduationDate}
                      onChange={(e) => setFormData({ ...formData, graduationDate: e.target.value })}
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">عدد سنوات الخبرة:</label>
                    <input
                      type="number"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                      className="w-full p-2 rounded border border-slate-300 bg-white font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">المدارس التي عمل بها:</label>
                    <input
                      type="text"
                      value={formData.previousSchools}
                      onChange={(e) => setFormData({ ...formData, previousSchools: e.target.value })}
                      placeholder="مدرسة الإيمان، مدرسة الفرح"
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">الصفوف التي يدرسها بالمدرسة:</label>
                    <input
                      type="text"
                      value={formData.teachingGrades}
                      onChange={(e) => setFormData({ ...formData, teachingGrades: e.target.value })}
                      placeholder="الصف الرابع والخامس والسادس"
                      className="w-full p-2 rounded border border-purple-300 bg-purple-50/40 font-bold text-purple-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاريخ بدء العمل الوظيفي:</label>
                    <input
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">رقم الهاتف:</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0994112233"
                      className="w-full p-2 rounded border border-slate-300 bg-white font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني:</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="m.abdullah@school.edu"
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block font-bold text-slate-700 mb-1">المهارات والخبرات:</label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="الخط العربي، الإشراف التربوي، استخدام المنصات الرقمية..."
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                    />
                  </div>

                </div>
              </div>

              {/* Bottom Actions */}
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
                  <span>{editingTeacher ? 'حفظ التعديلات' : 'إضافة المعلم'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
