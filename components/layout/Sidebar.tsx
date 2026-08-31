import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Clock,
  FileText,
  BarChart3,
  Building2,
  Fingerprint,
  History,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  UserCheck,
  Sparkles,
  Play,
  Terminal,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../../types/index.ts';
import { ElsewedyLogo } from '../common/ElsewedyLogo.tsx';

interface SidebarProps {
  currentView: string;
  setCurrentView?: (view: string) => void;
  onSelectView?: (view: string) => void;
  currentRole: UserRole;
  setCurrentRole?: (role: UserRole) => void;
  onRoleChange?: (role: UserRole) => void;
  onOpenLiveScanner?: () => void;
  onReplayIntro?: () => void;
  isDarkMode?: boolean;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  onSelectView,
  currentRole,
  setCurrentRole,
  onRoleChange,
  onOpenLiveScanner = () => {},
  onReplayIntro,
  isDarkMode = false,
  onLogout,
  isMobileOpen = false,
  onCloseMobile = () => {},
}) => {
  const setView = (view: string) => {
    if (typeof setCurrentView === 'function') setCurrentView(view);
    else if (typeof onSelectView === 'function') onSelectView(view);
    if (onCloseMobile) onCloseMobile();
  };

  const setRole = (role: UserRole) => {
    if (typeof setCurrentRole === 'function') setCurrentRole(role);
    else if (typeof onRoleChange === 'function') onRoleChange(role);
  };

  // Navigation lists tailored per role (3 primary roles: HR, Board, Employee)
  const isEmployee = currentRole === 'employee' || currentRole === 'teacher';
  const isBoard = currentRole === 'board';
  const isHR = currentRole === 'hr_admin';

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'teachers', label: 'Teachers', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'schedules', label: 'Schedules', icon: Clock },
    { id: 'leaves', label: 'Leave Requests', icon: FileText, badge: '2 Pending' },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'devices', label: 'Fingerprint Devices', icon: Fingerprint, isLive: true },
  ];

  const adminExtraItems = [
    { id: 'audit-logs', label: 'Audit Logs', icon: History },
    { id: 'system-logs', label: 'System Logs', icon: Terminal, badge: 'Live DB' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const employeeNavItems = [
    { id: 'teacher-portal', label: 'Personal Dashboard', icon: LayoutDashboard },
    { id: 'teacher-attendance', label: 'My Attendance', icon: CalendarCheck },
    { id: 'teacher-schedule', label: 'My Schedule', icon: Clock },
    { id: 'teacher-leaves', label: 'My Leave Requests', icon: FileText },
    { id: 'teacher-profile', label: 'My Profile', icon: UserCheck },
  ];

  const navItems = isEmployee ? employeeNavItems : adminNavItems;

  const sidebarContent = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full justify-between select-none">
      {/* 1. Top Header Section */}
      <div className="shrink-0">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 dark:border-slate-800/60 flex items-center justify-between group">
          <div
            onClick={() => {
              if (onReplayIntro) onReplayIntro();
              if (isMobile && onCloseMobile) onCloseMobile();
            }}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
            title="Click to replay Elsewedy animated intro"
          >
            <ElsewedyLogo
              variant="auto"
              size="md"
              showSubtitle={true}
              subtitleText="ATTENDANCE SYSTEM"
              withShine={true}
            />
          </div>

          <div className="flex items-center gap-1">
            {onReplayIntro && (
              <button
                onClick={onReplayIntro}
                title="Replay Elsewedy Intro Animation"
                className="p-1.5 rounded-lg text-gray-400 hover:text-[#E5252A] hover:bg-red-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            )}

            {isMobile && (
              <button
                onClick={onCloseMobile}
                title="Close Navigation Menu"
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Middle Scrollable Nav Menu */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2 space-y-1">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {isEmployee ? 'Employee Portal' : 'Main Menu'}
        </div>

        {navItems.map((item: any) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-950/40 dark:to-red-950/20 text-[#E5252A] dark:text-red-400 font-bold border border-red-200/80 dark:border-red-900/50 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-slate-800/60 hover:text-[#263238] dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#E5252A] dark:text-red-400' : 'text-gray-400 dark:text-gray-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                    {item.badge}
                  </span>
                )}
                {item.isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#E5252A] dark:text-red-400" />}
              </div>
            </button>
          );
        })}

        {!isEmployee && adminExtraItems.length > 0 && (
          <>
            <div className="pt-3 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              System Administration
            </div>
            {adminExtraItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-950/40 dark:to-red-950/20 text-[#E5252A] dark:text-red-400 font-bold border border-red-200/80 dark:border-red-900/50 shadow-2xs'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-slate-800/60 hover:text-[#263238] dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${isActive ? 'text-[#E5252A] dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#E5252A] dark:text-red-400" />}
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* 3. Pinned Bottom Footer Section */}
      <div className="shrink-0 p-3 border-t border-gray-100 dark:border-slate-800/60 bg-gray-50/80 dark:bg-[#080B14]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/60 text-[#E5252A] dark:text-red-400 flex items-center justify-center font-bold text-xs shrink-0 border border-red-200 dark:border-red-900/60 shadow-2xs">
              {isEmployee ? 'AH' : isBoard ? 'BD' : 'HR'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-[#263238] dark:text-white truncate">
                {isEmployee
                  ? 'Eng. Ahmed Hassan'
                  : isBoard
                  ? 'Eng. Ahmed Raafat (Board)'
                  : 'Mariam Soliman (HR)'}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize truncate">
                {currentRole === 'hr_admin' ? 'HR Administrator' : currentRole === 'board' ? 'Board (Read-Only)' : 'Faculty Member'}
              </p>
            </div>
          </div>

          <button
            title="Logout"
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                setRole('hr_admin');
                setView('dashboard');
              }
              if (isMobile && onCloseMobile) onCloseMobile();
            }}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-white dark:bg-[#0C101C] border-r border-gray-200/80 dark:border-slate-800/60 flex-col shrink-0 h-full z-20 transition-colors overflow-hidden">
        {sidebarContent(false)}
      </aside>

      {/* Mobile Off-Canvas Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden"
            />

            {/* Sliding Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-[#0C101C] border-r border-gray-200 dark:border-slate-800 flex flex-col h-full shadow-2xl md:hidden overflow-hidden"
            >
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
