export type GradeLevel = 
  | 'الروضة الأولى'
  | 'الروضة الثانية'
  | 'الصف الأول الابتدائي'
  | 'الصف الثاني الابتدائي'
  | 'الصف الثالث الابتدائي'
  | 'الصف الرابع الابتدائي'
  | 'الصف الخامس الابتدائي'
  | 'الصف السادس الابتدائي'
  | 'الصف السابع الإعدادي'
  | 'الصف الثامن الإعدادي'
  | 'الصف التاسع الإعدادي'
  | 'الصف العاشر الثانوي'
  | 'الصف الحادي عشر الثانوي'
  | 'الصف الثاني عشر (البكالوريا)';

export interface Student {
  id: string; // كود الطالب مثل 10425
  idcard: string; // الرقم الوطني / بطاقة الهوية
  firstName: string; // الاسم
  fatherName: string; // الأب
  grandFatherName: string; // الجد
  motherName: string; // الأم
  lastName: string; // النسبة / الكنية
  gender: 'ذكر' | 'أنثى';
  birthDate: string;
  birthPlace: string;
  residencePlace: string;
  detailedAddress: string;
  previousGrade: string;
  currentGrade: GradeLevel;
  section: string; // الشعبة (أ، ب، ج، د)
  regiment: string; // الفوج (1، 2، ...)
  previousSchool: string;
  gpa: number; // المعدل السابق
  healthStatus: string;
  talent: string;
  notes: string;
  photoUrl?: string;

  // ولي الأمر
  guardianName: string;
  guardianNickname: string;
  guardianRelation: string; // أب، أم، عم...
  guardianJob: string;
  guardianPhone: string;

  // شخص آخر للتواصل
  emergencyName: string;
  emergencyNickname: string;
  emergencyRelation: string;
  emergencyJob: string;
  emergencyPhone: string;

  // تسليم اللوازم
  receivedBooks: boolean;
  receivedUniform: boolean;
  hasBus: boolean;
  syobis: boolean;

  // خدمة المواصلات وتتبع الحافلة / السيارة
  busId?: string; // معرف الحافلة أو السيارة المخصصة
  busRouteName?: string; // اسم خط السير
  busNumber?: string; // رقم الحافلة / لوحة السيارة
  busDriverName?: string; // اسم السائق
  busDriverPhone?: string; // رقم هاتف السائق
  busSupervisorName?: string; // اسم المشرفة المرافقة
  busSupervisorPhone?: string; // هاتف المشرفة
  busStopName?: string; // نقطة التوقف أو عنوان الركوب
  busTripStatus?: 'في انتظار الحافلة' | 'صعد إلى السيارة' | 'وصل إلى المدرسة' | 'في طريق العودة للمنزل' | 'وصل للمنزل بأمان' | 'غائب';
  busPickupTime?: string; // موعد ركوب الصباح
  busDropoffTime?: string; // موعد نزول المساء

  // المالية
  booksFee: number; // رسوم الكتب $
  uniformFee: number; // رسوم اللباس $
  tuitionFee: number; // القسط الدراسي $
  totalAmount: number; // المبلغ الإجمالي $
  firstPayment: number; // الدفعة الأولى $
  firstPaymentDate: string;
  secondPayment: number; // الدفعة الثانية $
  secondPaymentDate: string;
  secondPaymentDueDate: string; // تاريخ استحقاق الدفعة الثانية
  remainingAmount: number; // المبلغ المتبقي $
  
  enrollmentDate: string;
}

export interface Teacher {
  id: string;
  nationalId: string;
  gender: 'ذكر' | 'أنثى';
  fullName: string;
  fatherName: string;
  motherName: string;
  specialization: string; // التخصص
  birthDate: string;
  birthPlace: string;
  residencePlace: string;
  detailedAddress: string;
  maritalStatus: 'أعزب' | 'متزوج' | 'أخرى';
  spouseName?: string;
  spouseJob?: string;
  childrenCount: number;
  childrenDetails?: string; // تفاصيل الأولاد والصفوف
  highestDegree: string; // آخر شهادة
  graduationDate: string;
  phone: string;
  previousSchools: string; // المدارس السابقة
  experienceYears: number;
  skills: string; // المهارات والخبرات
  hireDate: string; // تاريخ التعيين
  teachingGrades: string; // الصفوف الموكلة
  email: string;
  salary?: number;
  photoUrl?: string;
}

export interface SubjectGrade {
  subjectName: string;
  maxScore: number;
  activityScore: number; // أعمال ونشاط (20)
  test1Score: number; // مذاكرة أولى (20)
  midtermScore: number; // امتحان نصفي (40)
  test2Score: number; // مذاكرة ثانية (20)
  finalExamScore: number; // امتحان نهائي (60)
  totalScore: number; // المجموع
  gradeNote?: string;
}

export interface StudentReportCard {
  id: string;
  studentId: string;
  studentName: string;
  gradeLevel: GradeLevel;
  section: string;
  academicYear: string;
  term: 'الفصل الدراسي الأول' | 'الفصل الدراسي الثاني';
  grades: SubjectGrade[];
  totalScore: number;
  maxTotalScore: number;
  percentage: number;
  appreciation: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'يحتاج إلى متابعة مكثفة';
  rank?: number;
  behaviorScore: number; // سلوك
  attendanceDays: number;
  absenceDays: number;
  teacherRemarks: string;
  principalRemarks: string;
  issuedDate: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'حاضر' | 'غائب' | 'متأخر' | 'غياب مبرر';
  notes?: string;
}

export interface PeriodicFollowUp {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  period: 'أسبوعي' | 'شهري';
  academicLevel: 'متميز' | 'جيد جداً' | 'متوسط' | 'بحاجة لدعم';
  homeworkCommitment: 'ملتزم دائماً' | 'ملتزم غالباً' | 'غير ملتزم أحياناً';
  classParticipation: 'نشط وفعال' | 'مشارك جيد' | 'قليل المشاركة';
  behaviorNotes: string;
  teacherRecommendations: string;
  notifiedParent: boolean;
}

export interface SmsMessageLog {
  id: string;
  studentId: string;
  studentName: string;
  parentPhone: string;
  messageType: 'غياب/تأخر' | 'كشف علامات' | 'مطالبة قسط مالي' | 'تقرير متابعة' | 'إشعار عام';
  content: string;
  sentAt: string;
  status: 'تم الإرسال' | 'قيد الإرسال' | 'فشل';
  channel: 'SMS' | 'WhatsApp';
}

export interface LessonAssignment {
  id: string;
  gradeLevel: GradeLevel;
  section: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  teacherName: string;
  status: 'متاح' | 'منتهي';
}

export interface WeeklyScheduleItem {
  id: string;
  day: 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس';
  periodNumber: number; // 1 to 6
  timeSlot: string; // '08:00 - 08:45'
  subject: string; // 'اللغة العربية'
  grade: string; // 'الأول المتوسط' or 'الصف الخامس الابتدائي'
  section: string; // 'أ', 'ب'
  teacherName: string; // 'أ. علي الحسيني'
  room?: string; // 'قاعة 101'
}

export interface Announcement {
  id: string;
  title: string;
  category: 'امتحانات' | 'إداري' | 'اجتماعات' | 'كادر' | 'مالي';
  date: string;
  iconColor: 'blue' | 'emerald' | 'red' | 'purple' | 'amber';
  priority?: 'عالي' | 'متوسط' | 'عادي';
  content?: string;
  actionTab?: string;
}

export interface TransportStop {
  id: string;
  name: string;
  studentId?: string;
  studentName?: string;
  lat: number;
  lng: number;
  time: string;
  status: 'passed' | 'current' | 'upcoming';
  type: 'pickup' | 'dropoff' | 'school';
  address?: string;
}

export interface TransportVehicle {
  id: string;
  plateNumber: string;
  vehicleName: string;
  vehicleType: 'باص كبير 30 راكب' | 'حافلة متوسطة 20 راكب' | 'فان مدرسي 12 راكب' | 'سيارة ركاب VIP 6 ركاب';
  driverName: string;
  driverPhone: string;
  supervisorName: string;
  supervisorPhone: string;
  routeName: string;
  capacity: number;
  status: 'في الطريق إلى المدرسة' | 'في طريق العودة للمنازل' | 'في مرآب المدرسة' | 'متوقف للاستراحة' | 'في انتظار انطلاق الرحلة';
  currentSpeedKmH: number;
  currentLocationName: string;
  currentLat: number;
  currentLng: number;
  heading: number; // بالدرجات 0 - 360
  progress: number; // 0 - 100%
  assignedStudentIds: string[];
  stops: TransportStop[];
  tripDirection: 'morning_to_school' | 'afternoon_to_home';
  lastUpdated: string;
  estimatedArrivalToSchool?: string;
}

export interface BusAttendanceLog {
  id: string;
  studentId: string;
  studentName: string;
  vehicleId: string;
  date: string;
  tripType: 'morning' | 'afternoon';
  status: 'boarded' | 'arrived' | 'absent' | 'waiting';
  time: string;
  note?: string;
}

export type TabType = 
  | 'dashboard' 
  | 'students' 
  | 'teachers' 
  | 'schedule' 
  | 'finances' 
  | 'grades' 
  | 'followup' 
  | 'transport'
  | 'sms' 
  | 'portal' 
  | 'settings';


