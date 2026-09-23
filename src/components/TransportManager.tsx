import React, { useState, useEffect, useMemo } from 'react';
import { 
  TransportVehicle, 
  TransportStop, 
  Student, 
  GradeLevel, 
  BusAttendanceLog 
} from '../types';
import { TransportMap } from './TransportMap';
import { 
  Bus, 
  Car, 
  Navigation, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Printer, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  Send, 
  ChevronRight, 
  Compass, 
  Gauge, 
  Maximize2, 
  Edit3, 
  Trash2, 
  Calendar, 
  ArrowRight,
  ExternalLink,
  Info,
  X,
  FileText
} from 'lucide-react';

interface TransportManagerProps {
  students: Student[];
  vehicles: TransportVehicle[];
  onUpdateVehicles: (vehicles: TransportVehicle[]) => void;
  onUpdateStudent: (student: Student) => void;
  onSendSms?: (studentId: string, studentName: string, phone: string, type: any, content: string) => void;
  schoolInfo: any;
}

export const TransportManager: React.FC<TransportManagerProps> = ({
  students,
  vehicles,
  onUpdateVehicles,
  onUpdateStudent,
  onSendSms,
  schoolInfo,
}) => {
  // Active selected vehicle for live map
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || 'bus-1');
  
  // Active selected student for focused tracking
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBusId, setFilterBusId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(true);

  // Modals
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isPrintManifestModalOpen, setIsPrintManifestModalOpen] = useState(false);
  const [manifestVehicleId, setManifestVehicleId] = useState<string>(vehicles[0]?.id || 'bus-1');

  // Notification Toast
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // New Vehicle Form State
  const [newVehicleData, setNewVehicleData] = useState<Partial<TransportVehicle>>({
    vehicleName: '',
    plateNumber: '',
    vehicleType: 'باص كبير 30 راكب',
    driverName: '',
    driverPhone: '',
    supervisorName: '',
    supervisorPhone: '',
    routeName: '',
    capacity: 24,
    status: 'في انتظار انطلاق الرحلة',
  });

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Find active vehicle
  const activeVehicle = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
  }, [vehicles, selectedVehicleId]);

  // Students with transportation enabled
  const transportStudents = useMemo(() => {
    return students.filter(s => s.hasBus);
  }, [students]);

  // Active selected student object
  const activeStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find(s => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Filtered students list for search
  const filteredStudents = useMemo(() => {
    return transportStudents.filter(student => {
      const fullName = `${student.firstName} ${student.fatherName} ${student.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                            student.id.includes(searchQuery) ||
                            (student.detailedAddress && student.detailedAddress.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesBus = filterBusId === 'all' || student.busId === filterBusId;
      const matchesStatus = filterStatus === 'all' || student.busTripStatus === filterStatus;

      return matchesSearch && matchesBus && matchesStatus;
    });
  }, [transportStudents, searchQuery, filterBusId, filterStatus]);

  // Real-Time GPS Simulation Loop
  useEffect(() => {
    if (!isSimulating || vehicles.length === 0) return;

    const interval = setInterval(() => {
      onUpdateVehicles(prevVehicles => {
        return prevVehicles.map(veh => {
          if (veh.status === 'في مرآب المدرسة') return veh;

          // Increment progress slightly
          const nextProgress = veh.progress >= 100 ? 10 : veh.progress + 1;
          
          // Subtle GPS coordinate shift along realistic path
          const latDelta = (Math.random() - 0.48) * 0.0003;
          const lngDelta = (Math.random() - 0.48) * 0.0003;

          const newLat = veh.currentLat + latDelta;
          const newLng = veh.currentLng + lngDelta;

          // Dynamic speed variation (30-45 km/h)
          const newSpeed = Math.floor(32 + Math.random() * 12);

          return {
            ...veh,
            currentLat: newLat,
            currentLng: newLng,
            currentSpeedKmH: newSpeed,
            progress: nextProgress,
            heading: (veh.heading + 2) % 360,
            lastUpdated: 'الآن (مباشر GPS)',
          };
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating, vehicles.length]);

  // When a student is selected, auto-switch to their vehicle
  const handleSelectStudent = (student: Student) => {
    setSelectedStudentId(student.id);
    if (student.busId) {
      setSelectedVehicleId(student.busId);
    }
  };

  // Quick SMS to Parent: "الحافلة تقترب"
  const handleSendProximityAlert = (student: Student) => {
    const parentPhone = student.guardianPhone;
    const studentName = `${student.firstName} ${student.lastName}`;
    const busName = student.busNumber || activeVehicle?.vehicleName || 'حافلة المدرسة';
    const message = `عزيزي ولي أمر الطالب ${studentName}، نود إعلامكم أن ${busName} تقترب من نقطة تجمعكم (${student.busStopName || student.residencePlace}) وستصل خلال حوالي 5 إلى 7 دقائق. يرجى تجهيز الطالب. - ${schoolInfo.name}`;

    if (onSendSms) {
      onSendSms(student.id, studentName, parentPhone, 'تنبيه مواصلات', message);
    }
    showToast(`تم إرسال رسالة تنبيه لولي أمر الطالب (${studentName}) بنجاح!`, 'success');
  };

  // Change Student Bus Trip Status
  const handleUpdateStudentTripStatus = (
    student: Student, 
    newStatus: 'في انتظار الحافلة' | 'صعد إلى السيارة' | 'وصل إلى المدرسة' | 'في طريق العودة للمنزل' | 'وصل للمنزل بأمان' | 'غائب'
  ) => {
    const updated = {
      ...student,
      busTripStatus: newStatus,
    };
    onUpdateStudent(updated);
    showToast(`تم تحديث حالة ركوب الطالب (${student.firstName}) إلى: [${newStatus}]`, 'info');
  };

  // Add New Vehicle Form Submission
  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleData.vehicleName || !newVehicleData.plateNumber) {
      alert('يرجى كتابة اسم الحافلة ورقم اللوحة');
      return;
    }

    const newVehicle: TransportVehicle = {
      id: `veh-${Date.now()}`,
      plateNumber: newVehicleData.plateNumber || 'دمشق 000000',
      vehicleName: newVehicleData.vehicleName || 'حافلة جديدة',
      vehicleType: newVehicleData.vehicleType as any || 'حافلة متوسطة 20 راكب',
      driverName: newVehicleData.driverName || 'أ. سائق جديد',
      driverPhone: newVehicleData.driverPhone || '',
      supervisorName: newVehicleData.supervisorName || 'المشرفة',
      supervisorPhone: newVehicleData.supervisorPhone || '',
      routeName: newVehicleData.routeName || 'خط سير جديد',
      capacity: Number(newVehicleData.capacity) || 20,
      status: 'في انتظار انطلاق الرحلة',
      currentSpeedKmH: 0,
      currentLocationName: 'مرآب المدرسة الدولية',
      currentLat: 33.5138,
      currentLng: 36.2765,
      heading: 0,
      progress: 0,
      tripDirection: 'morning_to_school',
      assignedStudentIds: [],
      lastUpdated: 'الآن',
      stops: [
        {
          id: `stop-${Date.now()}-1`,
          name: 'المدرسة الدولية',
          lat: 33.5138,
          lng: 36.2765,
          time: '08:00 ص',
          status: 'upcoming',
          type: 'school',
          address: 'المزة - مجمع المدارس الدولية',
        }
      ],
    };

    onUpdateVehicles([...vehicles, newVehicle]);
    setSelectedVehicleId(newVehicle.id);
    setIsAddVehicleModalOpen(false);
    showToast(`تمت إضافة المركبة (${newVehicle.vehicleName}) إلى أسطول النقل بنجاح!`, 'success');
  };

  // Print Manifest Vehicle Object
  const manifestVehicle = useMemo(() => {
    return vehicles.find(v => v.id === manifestVehicleId) || activeVehicle;
  }, [vehicles, manifestVehicleId, activeVehicle]);

  const manifestStudents = useMemo(() => {
    if (!manifestVehicle) return [];
    return transportStudents.filter(s => s.busId === manifestVehicle.id || manifestVehicle.assignedStudentIds.includes(s.id));
  }, [transportStudents, manifestVehicle]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* 1. Header & Live Fleet Statistics */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Bus className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-800">إدارة المواصلات ومتابعة سيارات الطلاب</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>تتبع GPS حي ومباشر</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              متابعة الموقع الجغرافي اللحظي لحافلات وسيارات المدرسة، محطات صعود ونزول الطلاب، والتواصل الفوري مع السائق والمشرفة
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setManifestVehicleId(activeVehicle?.id || vehicles[0]?.id);
              setIsPrintManifestModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>طباعة كشف الحافلة</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddVehicleModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs hover:shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حافلة / سيارة جديدة</span>
          </button>
        </div>
      </div>

      {/* 2. Telemetry Key Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800">{transportStudents.length}</div>
            <div className="text-[11px] font-bold text-slate-500">طالب مشترك بالمواصلات</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800">{vehicles.length}</div>
            <div className="text-[11px] font-bold text-slate-500">حافلات وسيارات الأسطول</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-600">
              {vehicles.filter(v => v.status.includes('في الطريق')).length}
            </div>
            <div className="text-[11px] font-bold text-slate-500">حافلات على الطريق حالياً</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-amber-700">
              {activeVehicle?.currentSpeedKmH || 0} <span className="text-xs font-normal text-slate-400">كم/س</span>
            </div>
            <div className="text-[11px] font-bold text-slate-500">سرعة الحافلة المختارة</div>
          </div>
        </div>

      </div>

      {/* 3. Main Split View: Map + Focused Student Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RIGHT / MAIN COLUMN (7 Cols): Interactive GPS Map View */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Vehicle Switcher Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold text-slate-600 px-2">اختر الحافلة:</span>
              {vehicles.map(veh => {
                const isSelected = veh.id === selectedVehicleId;
                return (
                  <button
                    key={veh.id}
                    type="button"
                    onClick={() => {
                      setSelectedVehicleId(veh.id);
                      setSelectedStudentId(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Bus className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    <span>{veh.vehicleName}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {veh.plateNumber}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-bold px-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>تحديث حي</span>
            </div>
          </div>

          {/* Interactive Map Component */}
          {activeVehicle && (
            <TransportMap
              vehicle={activeVehicle}
              selectedStudent={activeStudent}
              onSelectStudentStop={(studentId) => setSelectedStudentId(studentId)}
              className="h-[480px]"
              isSimulating={isSimulating}
              onToggleSimulation={() => setIsSimulating(!isSimulating)}
            />
          )}

          {/* Active Vehicle Detailed Specs Card */}
          {activeVehicle && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{activeVehicle.vehicleName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{activeVehicle.routeName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
                    {activeVehicle.vehicleType}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded-lg">
                    {activeVehicle.plateNumber}
                  </span>
                </div>
              </div>

              {/* Driver and Supervisor Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* Driver */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold">
                      👨‍✈️
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">السائق: {activeVehicle.driverName}</div>
                      <div className="text-[11px] text-slate-500 font-mono" dir="ltr">{activeVehicle.driverPhone}</div>
                    </div>
                  </div>
                  {activeVehicle.driverPhone && (
                    <div className="flex items-center gap-1">
                      <a
                        href={`tel:${activeVehicle.driverPhone}`}
                        className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                        title="اتصال مباشر بالسائق"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://wa.me/${activeVehicle.driverPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                        title="مراسلة عبر واتساب"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Supervisor */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold">
                      👩‍💼
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">المشرفة: {activeVehicle.supervisorName}</div>
                      <div className="text-[11px] text-slate-500 font-mono" dir="ltr">{activeVehicle.supervisorPhone}</div>
                    </div>
                  </div>
                  {activeVehicle.supervisorPhone && (
                    <div className="flex items-center gap-1">
                      <a
                        href={`tel:${activeVehicle.supervisorPhone}`}
                        className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                        title="اتصال مباشر بالمشرفة"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://wa.me/${activeVehicle.supervisorPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                        title="مراسلة عبر واتساب"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

              </div>

              {/* Stops Timeline on this vehicle */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>محطات خط السير ونقاط التجمع:</span>
                </h4>

                <div className="space-y-2">
                  {activeVehicle.stops.map((stop, idx) => {
                    const isPassed = stop.status === 'passed';
                    const isCurrent = stop.status === 'current';
                    const isSelected = activeStudent && stop.studentId === activeStudent.id;

                    return (
                      <div 
                        key={stop.id}
                        className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 transition-all ${
                          isSelected 
                            ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-200'
                            : isCurrent
                            ? 'bg-amber-50/80 border-amber-300'
                            : isPassed
                            ? 'bg-slate-50/80 border-slate-200 opacity-80'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            isPassed ? 'bg-slate-700 text-white' : isCurrent ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                          }`}>
                            {stop.type === 'school' ? '🏫' : isPassed ? '✓' : idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-2">
                              <span>{stop.name}</span>
                              {stop.studentName && (
                                <span className="text-[11px] text-blue-700 font-semibold">
                                  ({stop.studentName})
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{stop.address || ''}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-right">
                          <span className="font-mono text-slate-600 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                            {stop.time}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPassed ? 'bg-slate-200 text-slate-700' : isCurrent ? 'bg-amber-200 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isPassed ? 'تم المرور' : isCurrent ? 'الآن' : 'قادم'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* LEFT COLUMN (5 Cols): Student Specific Live Tracking Card & Search */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Search & Filter Header */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-blue-600" />
                <span>متابعة موقع طالب بالسيارة (بحث مباشر)</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                {filteredStudents.length} طلاب
              </span>
            </div>

            {/* Input Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم الطالب أو رقم الهوية أو الحي..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 text-xs">
              <select
                value={filterBusId}
                onChange={(e) => setFilterBusId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white outline-hidden font-medium flex-1 cursor-pointer"
              >
                <option value="all">جميع الحافلات والخطوط</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.vehicleName}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white outline-hidden font-medium flex-1 cursor-pointer"
              >
                <option value="all">كافة الحالات</option>
                <option value="صعد إلى السيارة">صعد إلى السيارة</option>
                <option value="في انتظار الحافلة">في انتظار الحافلة</option>
                <option value="وصل إلى المدرسة">وصل إلى المدرسة</option>
                <option value="غائب">غائب اليوم</option>
              </select>
            </div>
          </div>

          {/* ACTIVE STUDENT FOCUSED TRACKING PANEL */}
          {activeStudent ? (
            <div className="bg-gradient-to-b from-white to-blue-50/40 rounded-3xl border-2 border-blue-500/40 shadow-lg p-5 space-y-4 animate-in zoom-in-95 duration-200">
              
              {/* Header with Close */}
              <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-blue-600 animate-spin" />
                  <span>تتبع مباشر لموقع الطالب بالسيارة</span>
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedStudentId(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="إغلاق التتبع المخصص"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Student Profile Identity */}
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg overflow-hidden shrink-0 shadow-xs">
                  {activeStudent.photoUrl ? (
                    <img src={activeStudent.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{activeStudent.firstName[0]}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-base truncate">
                    {activeStudent.firstName} {activeStudent.fatherName} {activeStudent.lastName}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {activeStudent.currentGrade} • الشعبة ({activeStudent.section}) • كود ({activeStudent.id})
                  </div>
                  <div className="text-[11px] text-blue-700 font-medium flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{activeStudent.detailedAddress || activeStudent.residencePlace}</span>
                  </div>
                </div>
              </div>

              {/* Real-time Status Alert Box */}
              <div className="p-3.5 rounded-2xl bg-white border border-blue-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">حالة ركوب الطالب بالسيارة:</span>
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                    activeStudent.busTripStatus === 'صعد إلى السيارة'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : activeStudent.busTripStatus === 'وصل إلى المدرسة'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : activeStudent.busTripStatus === 'غائب'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                  }`}>
                    {activeStudent.busTripStatus || 'في انتظار الحافلة'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">موعد الركوب الصباحي</span>
                    <span className="font-bold font-mono text-slate-700">{activeStudent.busPickupTime || '07:15 ص'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">موعد النزول المسائي</span>
                    <span className="font-bold font-mono text-slate-700">{activeStudent.busDropoffTime || '02:30 م'}</span>
                  </div>
                </div>
              </div>

              {/* Assigned Vehicle Details */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Bus className="w-4 h-4 text-blue-600" />
                    <span>الحافلة المخصصة:</span>
                  </span>
                  <span className="font-bold text-blue-700">
                    {activeStudent.busNumber || activeVehicle?.vehicleName}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 flex items-center justify-between">
                  <span>اسم السائق: {activeStudent.busDriverName || activeVehicle?.driverName}</span>
                  <span className="font-mono" dir="ltr">{activeStudent.busDriverPhone || activeVehicle?.driverPhone}</span>
                </div>

                <div className="text-[11px] text-slate-600 flex items-center justify-between">
                  <span>المشرفة المرافقة: {activeStudent.busSupervisorName || activeVehicle?.supervisorName}</span>
                  <span className="font-mono" dir="ltr">{activeStudent.busSupervisorPhone || activeVehicle?.supervisorPhone}</span>
                </div>
              </div>

              {/* Status Update Quick Buttons */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5">تحديث حالة ركوب الطالب الآن:</span>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => handleUpdateStudentTripStatus(activeStudent, 'صعد إلى السيارة')}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition-all cursor-pointer"
                  >
                    ✓ صعد للسيارة
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStudentTripStatus(activeStudent, 'وصل إلى المدرسة')}
                    className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold transition-all cursor-pointer"
                  >
                    🏫 وصل للمدرسة
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStudentTripStatus(activeStudent, 'غائب')}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-[11px] font-bold transition-all cursor-pointer"
                  >
                    ✕ غائب اليوم
                  </button>
                </div>
              </div>

              {/* Direct Proximity Notification SMS Alert to Parent */}
              <div className="pt-2 border-t border-blue-100">
                <button
                  type="button"
                  onClick={() => handleSendProximityAlert(activeStudent)}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال تنبيه فوري لولي الأمر (السيارة تقترب من المنزل)</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="p-4 rounded-3xl bg-blue-50/50 border border-blue-200/60 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                <Navigation className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">حدد طالباً لمتابعة موقعه بالسيارة</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                اختر طالباً من القائمة أدناه لمشاهدة تفاصيل ركوبه وحالة وصوله والتواصل الفوري مع ولي أمره
              </p>
            </div>
          )}

          {/* Student List View */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center justify-between pb-2 border-b border-slate-100">
              <span>قائمة الطلاب المشتركين بالنقل:</span>
              <span className="text-[11px] text-blue-600 font-bold">{filteredStudents.length} طلاب</span>
            </h4>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  لا يوجد طلاب يطابقون خيارات البحث المحددة
                </div>
              ) : (
                filteredStudents.map(student => {
                  const isSelected = selectedStudentId === student.id;
                  return (
                    <div
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-blue-50/90 border-blue-300 ring-2 ring-blue-200 shadow-xs' 
                          : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-blue-600 text-xs shrink-0 shadow-2xs">
                          {student.firstName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {student.currentGrade} • {student.residencePlace}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          student.busTripStatus === 'صعد إلى السيارة'
                            ? 'bg-emerald-100 text-emerald-800'
                            : student.busTripStatus === 'وصل إلى المدرسة'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {student.busTripStatus || 'في الانتظار'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 rotate-180" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>

      {/* 4. FLEET VEHICLES OVERVIEW TABLE & ACTIONS */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Bus className="w-4 h-4 text-blue-600" />
              <span>جدول أسطول سيارات وحافلات المدرسة والمسارات</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              بيانات السائقين، المشرفين، السعة الاستيعابية، والطلاب المسجلين بكل خط
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddVehicleModalOpen(true)}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مركبة للأسطول</span>
          </button>
        </div>

        {/* Fleet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehicles.map(veh => {
            const assignedCount = transportStudents.filter(s => s.busId === veh.id).length;
            const isSelected = veh.id === selectedVehicleId;

            return (
              <div
                key={veh.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isSelected 
                    ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-200 shadow-sm' 
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Bus className="w-4 h-4 text-blue-600" />
                    <span>{veh.vehicleName}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    {veh.plateNumber}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                  <div className="text-[11px]"><strong>المسار:</strong> {veh.routeName}</div>
                  <div className="text-[11px]"><strong>السائق:</strong> {veh.driverName} ({veh.driverPhone})</div>
                  <div className="text-[11px]"><strong>المشرفة:</strong> {veh.supervisorName}</div>
                  <div className="text-[11px] flex items-center justify-between">
                    <span><strong>الركاب:</strong> {assignedCount} من {veh.capacity} طالب</span>
                    <span className="text-emerald-700 font-bold">{veh.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVehicleId(veh.id);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold text-center transition-colors cursor-pointer"
                  >
                    تتبع هذه الحافلة الآن
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setManifestVehicleId(veh.id);
                      setIsPrintManifestModalOpen(true);
                    }}
                    className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="طباعة كشف الحافلة"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* 5. MODAL: Add New Vehicle */}
      {isAddVehicleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bus className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold text-base">إضافة حافلة / سيارة جديدة لأسطول النقل</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddVehicleModalOpen(false)}
                className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddVehicleSubmit} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الحافلة أو السيارة</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: حافلة الأمل 4"
                    value={newVehicleData.vehicleName || ''}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, vehicleName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم اللوحة</label>
                  <input
                    type="text"
                    required
                    placeholder="دمشق 492180"
                    value={newVehicleData.plateNumber || ''}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, plateNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع المركبة</label>
                  <select
                    value={newVehicleData.vehicleType || 'باص كبير 30 راكب'}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, vehicleType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold"
                  >
                    <option value="باص كبير 30 راكب">باص كبير 30 راكب</option>
                    <option value="حافلة متوسطة 20 راكب">حافلة متوسطة 20 راكب</option>
                    <option value="فان مدرسي 12 راكب">فان مدرسي 12 راكب</option>
                    <option value="سيارة ركاب VIP 6 ركاب">سيارة ركاب VIP 6 ركاب</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">السعة الاستيعابية (مقعد)</label>
                  <input
                    type="number"
                    value={newVehicleData.capacity || 24}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مسار الخط والأحياء</label>
                <input
                  type="text"
                  placeholder="مثلاً: خط المزة - الفيلات - ساحة الأمويين"
                  value={newVehicleData.routeName || ''}
                  onChange={(e) => setNewVehicleData({ ...newVehicleData, routeName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم السائق</label>
                  <input
                    type="text"
                    placeholder="أ. هيثم المرعي"
                    value={newVehicleData.driverName || ''}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, driverName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">هاتف السائق</label>
                  <input
                    type="text"
                    placeholder="+963 944 112 233"
                    value={newVehicleData.driverPhone || ''}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, driverPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم المشرفة المرافقة</label>
                  <input
                    type="text"
                    placeholder="المشرفة نسرين الحلبي"
                    value={newVehicleData.supervisorName || ''}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, supervisorName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">هاتف المشرفة</label>
                  <input
                    type="text"
                    placeholder="+963 933 556 677"
                    value={newVehicleData.supervisorPhone || ''}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, supervisorPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  حفظ وإضافة المركبة
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 6. MODAL: Print Manifest (كشف ركاب الحافلة للطباعة) */}
      {isPrintManifestModalOpen && manifestVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">معاينة وطباعة كشف ركاب الحافلة</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  طباعة فورية
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintManifestModalOpen(false)}
                  className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Manifest Sheet */}
            <div className="p-8 text-right space-y-5 print:p-0">
              
              {/* Official Header */}
              <div className="border-b-2 border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800">{schoolInfo.ministry}</div>
                  <div className="text-xs text-slate-600">{schoolInfo.directorate}</div>
                  <div className="text-base font-black text-slate-900 mt-1">{schoolInfo.name}</div>
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-black text-slate-900 border-2 border-slate-800 px-4 py-1 rounded-lg">
                    كشف ركاب حافلة النقل المدرسي
                  </h2>
                  <div className="text-xs text-slate-600 mt-1">العام الدراسي: {schoolInfo.academicYear}</div>
                </div>
                <div className="text-left text-xs font-mono text-slate-600">
                  <div>التاريخ: {new Date().toLocaleDateString('ar-SY')}</div>
                  <div>رقم الكشف: TR-{manifestVehicle.plateNumber.replace(/[^0-9]/g, '')}</div>
                </div>
              </div>

              {/* Vehicle Specifications */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div><strong>الحافلة:</strong> {manifestVehicle.vehicleName}</div>
                <div><strong>رقم اللوحة:</strong> {manifestVehicle.plateNumber}</div>
                <div><strong>السائق:</strong> {manifestVehicle.driverName}</div>
                <div><strong>المشرفة:</strong> {manifestVehicle.supervisorName}</div>
              </div>

              {/* Students Table */}
              <table className="w-full text-right text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-800">
                    <th className="border border-slate-300 p-2 text-center w-8">#</th>
                    <th className="border border-slate-300 p-2">اسم الطالب</th>
                    <th className="border border-slate-300 p-2">الصف والشعبة</th>
                    <th className="border border-slate-300 p-2">عنوان التوقف / الحي</th>
                    <th className="border border-slate-300 p-2">هاتف ولي الأمر</th>
                    <th className="border border-slate-300 p-2 text-center">التوقيع</th>
                  </tr>
                </thead>
                <tbody>
                  {manifestStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border border-slate-300 p-4 text-center text-slate-400">
                        لا يوجد طلاب مخصصين لهذه الحافلة حالياً
                      </td>
                    </tr>
                  ) : (
                    manifestStudents.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-2 text-center font-bold">{idx + 1}</td>
                        <td className="border border-slate-300 p-2 font-bold">{s.firstName} {s.fatherName} {s.lastName}</td>
                        <td className="border border-slate-300 p-2">{s.currentGrade} ({s.section})</td>
                        <td className="border border-slate-300 p-2">{s.busStopName || s.residencePlace}</td>
                        <td className="border border-slate-300 p-2 font-mono" dir="ltr">{s.guardianPhone}</td>
                        <td className="border border-slate-300 p-2 text-center text-slate-300">__________</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-3 text-center text-xs font-bold text-slate-800">
                <div>توقيع سائق الحافلة</div>
                <div>توقيع المشرفة المرافقة</div>
                <div>إدارة شؤون الطلاب والنقل</div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
