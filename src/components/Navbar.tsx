import React from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  MessageSquare, 
  Smartphone, 
  LayoutDashboard,
  UserPlus,
  Send,
  Building2,
  Bell
} from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import { SchoolLogo } from './SchoolLogo';

import { TabType } from '../types';
export type { TabType };
export type NavTab = TabType;

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadNoticesCount?: number;
  onOpenNewStudent?: () => void;
  onOpenSmsCenter?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  unreadNoticesCount = 0,
  onOpenNewStudent,
  onOpenSmsCenter,
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'students' as TabType, label: 'بيانات الطلاب', icon: Users },
    { id: 'teachers' as TabType, label: 'بيانات المعلمين', icon: BookOpen },
    { id: 'finances' as TabType, label: 'شيك مالي والأقساط', icon: DollarSign },
    { id: 'grades' as TabType, label: 'كشوفات العلامات', icon: FileText },
    { id: 'followup' as TabType, label: 'المتابعة والحضور', icon: CheckCircle2 },
    { id: 'sms' as TabType, label: 'مركز التنبيهات SMS', icon: MessageSquare, badge: unreadNoticesCount },
    { id: 'portal' as TabType, label: 'بوابة أولياء الأمور', icon: Smartphone, highlight: true },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
      {/* Top Bar with School Header & Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 border-b border-slate-100">
          
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <SchoolLogo variant="horizontal" size="md" />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              id="btn-quick-new-student"
              onClick={() => {
                if (onOpenNewStudent) onOpenNewStudent();
                else onTabChange('students');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">إضافة طالب</span>
            </button>

            <button
              id="btn-quick-sms-broadcast"
              onClick={() => {
                if (onOpenSmsCenter) onOpenSmsCenter();
                else onTabChange('sms');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">إرسال تنبيه SMS</span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            <button
              id="btn-nav-parent-portal-top"
              onClick={() => onTabChange('portal')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'portal'
                  ? 'bg-amber-500 text-slate-900 ring-2 ring-amber-400 shadow-sm'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Smartphone className="w-4 h-4 text-amber-700" />
              <span>بوابة ولي الأمر</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1 space-x-reverse overflow-x-auto py-2.5 scrollbar-none">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                } ${tab.highlight && !isActive ? 'text-amber-900 font-bold bg-amber-50/70 border border-amber-200/60' : ''}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.highlight ? 'text-amber-600' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {Boolean(tab.badge) && !isActive && (
                  <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
