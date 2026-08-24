import React, { useState } from 'react';
import {
  Bell,
  Fingerprint,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Wifi,
  Search,
  Play,
  Sparkles,
  Moon,
  Sun,
  Menu,
} from 'lucide-react';
import { NotificationItem, UserRole } from '../../types/index.ts';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  notifications: NotificationItem[];
  onOpenLiveScanner: () => void;
  onMarkNotificationsRead: () => void;
  onSearchGlobal?: (query: string) => void;
  onReplayIntro?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: (enabled: boolean) => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  notifications = [],
  onOpenLiveScanner,
  onMarkNotificationsRead,
  onReplayIntro,
  isDarkMode = false,
  onToggleDarkMode,
  onToggleMobileMenu,
}) => {
  const safeNotifs = Array.isArray(notifications) ? notifications : [];
  const [showNotifications, setShowNotifications] = useState(false);

  const isEmployee = currentRole === 'teacher' || currentRole === 'employee';
  const isBoard = currentRole === 'board';
  const isHR = currentRole === 'hr_admin';

  const userName = isEmployee
    ? 'Eng. Ahmed Hassan'
    : isBoard
    ? 'Eng. Ahmed Raafat'
    : isHR
    ? 'Mariam Soliman (HR)'
    : 'Admin';

  const userTitle = isEmployee
    ? 'Faculty / Employee'
    : isBoard
    ? 'Board Executive'
    : isHR
    ? 'HR Administrator'
    : 'System Admin';

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const unreadCount = safeNotifs.filter((n) => !n.isRead).length;

  return (
    <header className="bg-white dark:bg-[#0C101C] border-b border-gray-200/80 dark:border-slate-800/60 px-3 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-30 shadow-2xs transition-colors">
      {/* Left: Mobile Menu Trigger + Greeting Context */}
      <div className="flex items-center justify-between md:justify-start gap-2.5 sm:gap-3 flex-wrap">
        {/* Hamburger Menu on Mobile */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            title="Toggle Navigation Menu"
            className="md:hidden p-2 rounded-xl border border-gray-200/80 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0"
          >
            <Menu className="w-5 h-5 text-[#E5252A]" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-xl font-extrabold text-[#263238] dark:text-white leading-tight">
              Hi, <span className="text-[#E5252A] dark:text-red-400">{userName}</span>
            </h1>
            <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold bg-red-50 dark:bg-red-950/60 text-[#E5252A] dark:text-red-300 border border-red-200/60 dark:border-red-900/50 shadow-2xs">
              {userTitle}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 flex-wrap">
            <span className="font-medium hidden sm:inline">
              {isEmployee
                ? 'Faculty Biometric Portal'
                : isBoard
                ? 'Departmental Attendance Overview'
                : 'Teacher Attendance System'}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1 font-medium text-gray-600 dark:text-gray-300">
              <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: Role Switcher, Dark/Light Mode, Notifications, Live Scanner Terminal */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap justify-end">
        {/* Dark Mode / Light Mode Direct Toggle Button */}
        {onToggleDarkMode && (
          <button
            onClick={() => onToggleDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200/90 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-[#263238] dark:text-gray-200 transition-colors cursor-pointer shadow-2xs text-xs font-semibold"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        )}

        {/* Role Quick Selector in Header */}
        <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-xl p-1 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1 hidden md:inline">
            Role:
          </span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="text-xs font-bold bg-white dark:bg-slate-900 text-[#263238] dark:text-white border border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1 shadow-2xs focus:outline-hidden focus:border-[#E5252A] cursor-pointer max-w-[140px] sm:max-w-none truncate"
            title="Switch User Role / Viewpoint"
          >
            <option value="hr_admin">📋 HR Admin</option>
            <option value="board">🏛️ Board (Read-Only)</option>
            <option value="employee">👨‍🏫 Faculty Portal</option>
          </select>
        </div>

        {/* Device Status Live Indicator with Pulsing Sonar */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>3 Gates Online</span>
        </div>

        {/* Replay Intro Trigger */}
        {onReplayIntro && (
          <button
            onClick={onReplayIntro}
            title="Replay Elsewedy Laser Intro"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-[#E5252A] border border-gray-200 dark:border-gray-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Play className="w-3.5 h-3.5 fill-current text-[#E5252A]" />
            <span>Intro</span>
          </button>
        )}

        {/* Live Fingerprint Scanner Modal Trigger with Shimmer */}
        <button
          onClick={onOpenLiveScanner}
          className="relative overflow-hidden flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#B30F13] via-[#E5252A] to-[#E5252A] hover:brightness-110 text-white text-xs font-bold shadow-md shadow-red-500/25 transition-all cursor-pointer shrink-0 group"
        >
          <div className="absolute inset-0 bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          <Fingerprint className="w-4 h-4 text-white animate-pulse" />
          <span className="hidden sm:inline">Biometric Terminal</span>
          <span className="sm:hidden">Terminal</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications && unreadCount > 0) {
                onMarkNotificationsRead();
              }
            }}
            className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-[#263238] dark:text-white dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200/80 dark:border-gray-700 cursor-pointer shadow-2xs"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E5252A] text-white text-[10px] font-bold flex items-center justify-center animate-bounce shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs font-bold text-[#263238] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5252A]" />
                  Real-Time Notifications
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono font-medium">
                  {safeNotifs.length} alerts
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
                {safeNotifs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
                    No new notifications
                  </div>
                ) : (
                  safeNotifs.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-gray-50 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 transition-colors flex items-start gap-3 ${
                        !n.isRead ? 'bg-red-50/20 dark:bg-red-950/20' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'SUCCESS' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        )}
                        {n.type === 'WARNING' && (
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        )}
                        {n.type === 'ALERT' && (
                          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        )}
                        {n.type === 'INFO' && <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#263238] dark:text-white">{n.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(n.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
