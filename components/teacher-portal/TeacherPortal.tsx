import React, { useState } from 'react';
import {
  Fingerprint,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Plus,
  ShieldCheck,
  Building,
  User,
  ArrowRight,
  Mail,
  Phone,
  CalendarCheck,
  FileText,
  UserCheck,
  Layers,
  MapPin,
  Check,
  Search,
  Filter,
  QrCode,
  TrendingUp,
  Sparkles,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Teacher, AttendanceRecord, LeaveRequest, Schedule } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import { Modal } from '../common/Modal.tsx';
import { GrabScrollContainer } from '../common/GrabScrollContainer.tsx';
import { useToast } from '../common/Toast.tsx';
import { api } from '../../services/api.ts';

interface TeacherPortalProps {
  teacher: Teacher;
  todayRecord?: AttendanceRecord;
  historyRecords: AttendanceRecord[];
  leaves: LeaveRequest[];
  schedule?: Schedule;
  currentView?: string;
  onSelectView?: (view: string) => void;
  onOpenLiveScanner: () => void;
  onRefreshData: () => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  teacher,
  todayRecord,
  historyRecords = [],
  leaves = [],
  schedule,
  currentView = 'teacher-portal',
  onSelectView,
  onOpenLiveScanner,
  onRefreshData,
}) => {
  const safeHistory = Array.isArray(historyRecords) ? historyRecords : [];
  const safeLeaves = Array.isArray(leaves) ? leaves : [];
  const { showToast } = useToast();

  const [isAddLeaveOpen, setIsAddLeaveOpen] = useState<boolean>(false);
  const [leaveType, setLeaveType] = useState<any>('Sick Leave');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filters for Attendance Tab
  const [filterPeriod, setFilterPeriod] = useState<string>('current'); // 'current', 'last', 'all'
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // 'ALL', 'Present', 'Late', 'Absent', 'On Leave'
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filters for Leaves Tab
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<string>('ALL');

  // Filter history based on selected period
  const getFilteredHistory = () => {
    let result = safeHistory;

    // Period filter
    if (filterPeriod !== 'all') {
      const now = new Date();
      let targetMonth = now.getMonth();
      let targetYear = now.getFullYear();

      if (filterPeriod === 'last') {
        targetMonth -= 1;
        if (targetMonth < 0) {
          targetMonth = 11;
          targetYear -= 1;
        }
      }

      result = result.filter((r) => {
        if (!r.date) return true;
        const dateParts = r.date.split('-');
        if (dateParts.length >= 2) {
          const rYear = parseInt(dateParts[0], 10);
          const rMonth = parseInt(dateParts[1], 10) - 1;
          return rYear === targetYear && rMonth === targetMonth;
        }
        return true;
      });
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.date?.toLowerCase().includes(q) ||
          r.status?.toLowerCase().includes(q) ||
          r.deviceName?.toLowerCase().includes(q)
      );
    }

    return result;
  };

  const filteredHistory = getFilteredHistory();

  // Stats calculation
  const totalDays = filteredHistory.length || 1;
  const presentDays = filteredHistory.filter((r) => r.status === 'Present').length;
  const lateDays = filteredHistory.filter((r) => r.status === 'Late' || r.status === 'Very Late').length;
  const absentDays = filteredHistory.filter((r) => r.status === 'Absent').length;
  const leaveDays = filteredHistory.filter((r) => r.status === 'On Leave').length;
  const rate =
    filteredHistory.length === 0
      ? 0
      : +(((presentDays + lateDays) / filteredHistory.length) * 100).toFixed(1);

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      await api.submitLeave({
        teacherId: teacher.id,
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });
      setIsAddLeaveOpen(false);
      showToast('Leave request submitted successfully', 'success');
      setReason('');
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit leave request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine subview
  const isOverview = currentView === 'teacher-portal' || currentView === 'teacher_portal';
  const isAttendanceView = currentView === 'teacher-attendance';
  const isScheduleView = currentView === 'teacher-schedule';
  const isLeavesView = currentView === 'teacher-leaves';
  const isProfileView = currentView === 'teacher-profile';

  // Sample timetable schedule
  const sampleTimetable = [
    { day: 'Sunday', time: '08:00 AM - 10:00 AM', subject: 'Artificial Intelligence Basics', room: 'Lab 301 (Block A)', status: 'On Schedule' },
    { day: 'Sunday', time: '10:30 AM - 12:30 PM', subject: 'Machine Learning Algorithms', room: 'Hall 102', status: 'On Schedule' },
    { day: 'Monday', time: '08:00 AM - 11:00 AM', subject: 'Python Data Structures', room: 'Lab 302 (Block A)', status: 'On Schedule' },
    { day: 'Tuesday', time: '09:00 AM - 11:30 AM', subject: 'Deep Learning Workshop', room: 'AI Research Center', status: 'On Schedule' },
    { day: 'Wednesday', time: '08:00 AM - 10:00 AM', subject: 'Embedded Systems & IoT', room: 'Electronics Lab B', status: 'On Schedule' },
    { day: 'Thursday', time: '11:00 AM - 02:00 PM', subject: 'Faculty Office Hours & Projects', room: 'Office 204', status: 'Consultation' },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Header Bar */}
      <div className="bg-white dark:bg-[#0C101C] rounded-2xl border border-gray-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden">
        <GrabScrollContainer className="p-2 flex items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => onSelectView && onSelectView('teacher-portal')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              isOverview
                ? 'bg-[#E5252A] text-white shadow-xs font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Personal Overview</span>
          </button>

          <button
            onClick={() => onSelectView && onSelectView('teacher-attendance')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              isAttendanceView
                ? 'bg-[#E5252A] text-white shadow-xs font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>My Attendance Log ({safeHistory.length})</span>
          </button>

          <button
            onClick={() => onSelectView && onSelectView('teacher-schedule')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              isScheduleView
                ? 'bg-[#E5252A] text-white shadow-xs font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Teaching Schedule</span>
          </button>

          <button
            onClick={() => onSelectView && onSelectView('teacher-leaves')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              isLeavesView
                ? 'bg-[#E5252A] text-white shadow-xs font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Leave Requests ({safeLeaves.length})</span>
          </button>

          <button
            onClick={() => onSelectView && onSelectView('teacher-profile')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              isProfileView
                ? 'bg-[#E5252A] text-white shadow-xs font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Biometric Profile</span>
          </button>
        </GrabScrollContainer>
      </div>

      {/* ========================================================= */}
      {/* 1. VIEW: OVERVIEW DASHBOARD                               */}
      {/* ========================================================= */}
      {isOverview && (
        <div className="space-y-6">
          {/* Today's Status Banner */}
          <div className="bg-white dark:bg-[#0C101C] text-[#263238] dark:text-white rounded-2xl p-6 border border-gray-200/80 dark:border-slate-800/80 shadow-2xs relative overflow-hidden transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-[#E5252A] dark:text-red-400 flex items-center justify-center font-bold text-2xl shadow-2xs shrink-0">
                  <Fingerprint className="w-7 h-7 text-[#E5252A] dark:text-red-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg font-extrabold text-[#263238] dark:text-white">Today's Biometric Status</h2>
                    {todayRecord ? (
                      <Badge status={todayRecord.status} size="md" />
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                        Pending Arrival Scan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span>Shift: <strong className="text-[#263238] dark:text-white">{schedule?.name || 'Technical Faculty Shift'}</strong> ({schedule?.startTime || '07:30 AM'} - {schedule?.endTime || '03:30 PM'})</span>
                    <span>•</span>
                    <span>Grace Period: {schedule?.gracePeriodMinutes || 15} min</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenLiveScanner}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B30F13] to-[#E5252A] hover:brightness-110 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Simulate Gate Scan</span>
                </button>
              </div>
            </div>

            {/* Check-In / Check-Out Quick Glance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100 dark:border-slate-800 text-xs">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-1">Check-In Time</span>
                <p className="text-lg font-mono font-extrabold text-[#263238] dark:text-white">
                  {todayRecord?.checkInTime || '--:-- --'}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{todayRecord?.deviceName || 'Main Campus Turnstile'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-1">Check-Out Time</span>
                <p className="text-lg font-mono font-extrabold text-[#263238] dark:text-white">
                  {todayRecord?.checkOutTime || '--:-- --'}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {todayRecord?.checkOutTime ? 'Logged' : 'Expected: ' + (schedule?.endTime || '03:30 PM')}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 block mb-1">Punctuality Score</span>
                {todayRecord?.status === 'Present' && (
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> On Time Arrival
                  </p>
                )}
                {todayRecord?.status === 'Late' && (
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Late (+{todayRecord.lateDurationMinutes}m)
                  </p>
                )}
                {!todayRecord && (
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Scan turnstile to check in</p>
                )}
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Elswedy Biometric Gate #01</span>
              </div>
            </div>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-white dark:bg-[#0C101C] rounded-2xl border border-gray-200/80 dark:border-slate-800/80 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Attendance Rate</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-[#263238] dark:text-white">{rate}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(rate, 100)}%` }} />
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-[#0C101C] rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Present Days</span>
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">{presentDays}</p>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">On-time arrivals</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#0C101C] rounded-2xl border border-amber-200/80 dark:border-amber-900/40 shadow-2xs">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Late Arrivals</span>
              <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">{lateDays}</p>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">Exceeded grace period</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#0C101C] rounded-2xl border border-rose-200/80 dark:border-rose-900/40 shadow-2xs">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">Absent Days</span>
              <p className="text-2xl font-extrabold text-rose-700 dark:text-rose-400 mt-1">{absentDays}</p>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">Unexcused missed days</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#0C101C] rounded-2xl border border-blue-200/80 dark:border-blue-900/40 shadow-2xs col-span-2 lg:col-span-1">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">Approved Leaves</span>
              <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 mt-1">{leaveDays}</p>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">Official leave / mission</span>
            </div>
          </div>

          {/* Grid: Recent Log + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent 5 Scans */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0C101C] rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-[#E5252A]" />
                  <h3 className="font-bold text-sm text-[#263238] dark:text-white">Recent Attendance Scans</h3>
                </div>
                <button
                  onClick={() => onSelectView && onSelectView('teacher-attendance')}
                  className="text-xs text-[#E5252A] hover:underline font-bold flex items-center gap-1"
                >
                  View Full Ledger <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {safeHistory.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono font-bold text-[#263238] dark:text-gray-200 text-xs w-24">
                        {r.date}
                      </div>
                      <div className="font-mono text-gray-600 dark:text-gray-300">
                        In: <strong className="text-gray-900 dark:text-white">{r.checkInTime || '--:--'}</strong>
                      </div>
                      <div className="font-mono text-gray-500 dark:text-gray-400 hidden sm:block">
                        Out: {r.checkOutTime || '--:--'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge status={r.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Next Class Widget */}
            <div className="bg-white dark:bg-[#0C101C] rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-5 space-y-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-slate-800">
                  <Clock className="w-4 h-4 text-[#E5252A]" />
                  <h3 className="font-bold text-sm text-[#263238] dark:text-white">Upcoming Class / Shift</h3>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5252A] dark:text-red-400">
                    Next Session Today
                  </span>
                  <p className="font-extrabold text-sm text-[#263238] dark:text-white">
                    Machine Learning Algorithms Lab
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500" /> Room 301 - Engineering Block A
                  </p>
                  <p className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-200">
                    10:30 AM – 12:30 PM
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => setIsAddLeaveOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#263238] hover:bg-[#1E293B] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Leave / Mission Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. VIEW: MY ATTENDANCE LOG                                */}
      {/* ========================================================= */}
      {isAttendanceView && (
        <div className="space-y-5">
          {/* Header & Filter Toolbar */}
          <div className="bg-white dark:bg-[#0C101C] rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-extrabold text-[#263238] dark:text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-[#E5252A]" />
                  <span>My Attendance Ledger & Logs</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Complete record of your biometric entrance and exit logs
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500 font-medium">Total Records:</span>
                <span className="px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-[#E5252A] dark:text-red-400 rounded-lg text-xs font-mono font-bold border border-red-200/60 dark:border-red-900/40">
                  {filteredHistory.length} Days
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search date, status, or gate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-[#E5252A] text-[#263238] dark:text-white"
                />
              </div>

              {/* Period Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-bold uppercase shrink-0">Month:</span>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="w-full text-xs font-semibold bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-[#263238] dark:text-white rounded-xl px-3 py-2 focus:outline-hidden focus:border-[#E5252A] cursor-pointer"
                >
                  <option value="current">Current Month</option>
                  <option value="last">Last Month</option>
                  <option value="all">All Time History</option>
                </select>
              </div>

              {/* Status Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-bold uppercase shrink-0">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full text-xs font-semibold bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-[#263238] dark:text-white rounded-xl px-3 py-2 focus:outline-hidden focus:border-[#E5252A] cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Present">Present (On Time)</option>
                  <option value="Late">Late Arrivals</option>
                  <option value="Absent">Absent</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white dark:bg-[#0C101C] rounded-2xl border border-gray-200/80 dark:border-slate-800/80 overflow-hidden shadow-2xs">
            <GrabScrollContainer>
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-900/80 text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] border-b border-gray-200 dark:border-slate-800">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4">Check-Out</th>
                    <th className="py-3 px-4">Compliance Status</th>
                    <th className="py-3 px-4">Turnstile Gate</th>
                    <th className="py-3 px-4">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        <p className="font-semibold">No attendance logs found matching your filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-900/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#263238] dark:text-white whitespace-nowrap">
                          {r.date}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {r.checkInTime || '--:--'}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {r.checkOutTime || '--:--'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Badge status={r.status} size="sm" />
                            {r.lateDurationMinutes > 0 && (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/40">
                                +{r.lateDurationMinutes}m late
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                          {r.deviceName ? r.deviceName.replace('Gate Fingerprint Device ', 'Gate ') : 'Gate 01 Main Turnstile'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 font-mono text-[11px] whitespace-nowrap">
                          {r.verificationMethod || 'Biometric Optical'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </GrabScrollContainer>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. VIEW: MY TEACHING SCHEDULE                             */}
      {/* ========================================================= */}
      {isScheduleView && (
        <div className="space-y-6">
          {/* Shift Details Banner */}
          <div className="bg-white dark:bg-[#0C101C] rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-extrabold text-[#263238] dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#E5252A]" />
                  <span>Assigned Teaching Shift & Rules</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Official work hours and biometric turnstile tolerance
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#E5252A] dark:text-red-400 font-bold text-xs border border-red-200/60 dark:border-red-900/40">
                {schedule?.name || 'Standard Faculty Shift'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Shift Timings</span>
                <p className="text-lg font-extrabold text-[#263238] dark:text-white font-mono">
                  {schedule?.startTime || '07:30 AM'} – {schedule?.endTime || '03:30 PM'}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">8 Hours per day</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Grace Period</span>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {schedule?.gracePeriodMinutes || 15} Minutes
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Arrivals before 07:45 AM marked Present</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Turnstiles</span>
                <p className="text-lg font-extrabold text-[#263238] dark:text-white">
                  All Gate Turnstiles
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Gate 01, Gate 02, Gate 03 synced</p>
              </div>
            </div>
          </div>

          {/* Weekly Timetable Table */}
          <div className="bg-white dark:bg-[#0C101C] rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-[#263238] dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#E5252A]" />
                <span>Weekly Academic Timetable (Sun - Thu)</span>
              </h3>
            </div>

            <GrabScrollContainer>
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-900/80 text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] border-b border-gray-200 dark:border-slate-800">
                    <th className="py-3 px-4">Day</th>
                    <th className="py-3 px-4">Time Slot</th>
                    <th className="py-3 px-4">Subject / Module</th>
                    <th className="py-3 px-4">Hall / Lab Room</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
                  {sampleTimetable.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 dark:hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#263238] dark:text-white">{item.day}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-gray-700 dark:text-gray-300">{item.time}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">{item.subject}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{item.room}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-900/40">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GrabScrollContainer>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. VIEW: MY LEAVE REQUESTS                                */}
      {/* ========================================================= */}
      {isLeavesView && (
        <div className="space-y-6">
          {/* Balances & Action Bar */}
          <div className="bg-white dark:bg-[#0C101C] rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-extrabold text-[#263238] dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#E5252A]" />
                  <span>My Leave & Mission Requests</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Apply for sick leaves, official missions, or casual leaves
                </p>
              </div>

              <button
                onClick={() => setIsAddLeaveOpen(true)}
                className="px-4 py-2 bg-[#E5252A] hover:bg-[#D01B20] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Apply for New Leave</span>
              </button>
            </div>

            {/* Leave Balance Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Annual Balance</span>
                <p className="text-xl font-extrabold text-[#263238] dark:text-white mt-0.5">18 / 21 Days</p>
                <span className="text-[10px] text-emerald-600 font-semibold">Remaining</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Sick Leaves Used</span>
                <p className="text-xl font-extrabold text-[#263238] dark:text-white mt-0.5">2 Days</p>
                <span className="text-[10px] text-gray-400">Medical cert.</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Official Missions</span>
                <p className="text-xl font-extrabold text-[#263238] dark:text-white mt-0.5">3 Missions</p>
                <span className="text-[10px] text-blue-600 font-semibold">Excused</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Pending Reviews</span>
                <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                  {safeLeaves.filter((l) => l.status === 'Pending').length}
                </p>
                <span className="text-[10px] text-amber-600 font-semibold">Awaiting HR</span>
              </div>
            </div>
          </div>

          {/* List of Leave Applications */}
          <div className="bg-white dark:bg-[#0C101C] rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-5 space-y-3 shadow-2xs">
            <h3 className="font-bold text-sm text-[#263238] dark:text-white pb-2 border-b border-gray-100 dark:border-slate-800">
              Submitted Leave Applications History
            </h3>

            {safeLeaves.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="font-semibold">No leave requests recorded yet.</p>
              </div>
            ) : (
              safeLeaves.map((l) => (
                <div
                  key={l.id}
                  className="p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#263238] dark:text-white">{l.leaveType}</span>
                      <Badge status={l.status} size="sm" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-mono">
                      Period: <strong>{l.startDate}</strong> to <strong>{l.endDate}</strong> ({l.totalDays} Days)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{l.reason}"</p>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="text-[10px] text-gray-400 block">Applied On</span>
                    <span className="font-mono text-gray-600 dark:text-gray-300 font-semibold">
                      {l.appliedAt ? l.appliedAt.split('T')[0] : 'Recent'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. VIEW: BIOMETRIC PROFILE                                */}
      {/* ========================================================= */}
      {isProfileView && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0C101C] rounded-2xl border border-gray-200/80 dark:border-slate-800/80 p-6 space-y-6 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/60 text-[#E5252A] dark:text-red-400 border border-red-200 dark:border-red-900/60 flex items-center justify-center font-bold text-xl shrink-0 shadow-2xs">
                  {teacher.fullName.split(' ').slice(-2).map((n) => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#263238] dark:text-white">{teacher.fullName}</h2>
                  <p className="text-xs text-gray-500 font-mono font-semibold">{teacher.employeeId} • {teacher.departmentName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge status={teacher.fingerprintStatus} size="sm" />
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ Biometrics Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 flex items-center gap-3">
                <QrCode className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Template Token</span>
                  <span className="font-mono text-xs font-bold text-[#263238] dark:text-white">FP-8842-ENROLLED</span>
                </div>
              </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#263238] dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#E5252A]" />
                  <span>Institutional Employment Details</span>
                </h3>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 space-y-2">
                  <p className="flex justify-between">
                    <span className="text-gray-500">Academic Department:</span>
                    <strong className="text-[#263238] dark:text-white">{teacher.departmentName}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Position / Title:</span>
                    <strong className="text-[#263238] dark:text-white">{teacher.position}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Account Status:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{teacher.accountStatus}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Gate Access Clearance:</span>
                    <strong className="text-[#263238] dark:text-white">Full Gate Access (Gates 01, 02, 03)</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#263238] dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#E5252A]" />
                  <span>Contact Information</span>
                </h3>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 space-y-2">
                  <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Mail className="w-4 h-4 text-gray-400" /> {teacher.email}
                  </p>
                  <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Phone className="w-4 h-4 text-gray-400" /> {teacher.phone}
                  </p>
                  <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-400" /> Elswedy Technical Academy - Block A
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Leave Modal */}
      <Modal
        isOpen={isAddLeaveOpen}
        onClose={() => setIsAddLeaveOpen(false)}
        title="Submit Leave / Mission Request"
        subtitle={`Application for ${teacher.fullName}`}
        maxWidth="md"
      >
        <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
              Leave Classification *
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A] cursor-pointer"
            >
              <option value="Sick Leave">Sick / Medical Leave</option>
              <option value="Casual Leave">Casual / Personal Leave</option>
              <option value="Official Mission">Official Mission (Workshops & Competitions)</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-2 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-2 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
              Reason / Mission Details *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the reason or mission objective clearly..."
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddLeaveOpen(false)}
              className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#E5252A] hover:bg-[#D01B20] text-white font-bold cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
