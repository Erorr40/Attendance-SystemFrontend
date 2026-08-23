import React from 'react';
import { Users, CheckCircle2, Clock, UserX, Calendar, ShieldCheck } from 'lucide-react';
import { DashboardStats } from '../../types/index.ts';

interface SummaryCardsProps {
  stats: DashboardStats;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Teachers */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200/80 dark:border-gray-700 shadow-xs flex flex-col justify-between hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Teachers
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#263238] dark:text-white tracking-tight">
                {stats.totalTeachers}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                Active Faculty
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 text-[#263238] dark:text-gray-200 border border-gray-100 dark:border-gray-600">
            <Users className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Registered faculty members</span>
          <span className="font-medium text-gray-700 dark:text-gray-200">{stats.registeredFingerprints} Biometric Enrolled</span>
        </div>
      </div>

      {/* 2. Present Today */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200/80 dark:border-gray-700 shadow-xs flex flex-col justify-between hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Present Today
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
                {stats.presentToday}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                {stats.attendancePercentage}%
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>On-time attendance rate</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">On Schedule</span>
        </div>
      </div>

      {/* 3. Late Today */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200/80 dark:border-gray-700 shadow-xs flex flex-col justify-between hover:border-amber-200 dark:hover:border-amber-700 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Late Today
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-400 tracking-tight">
                {stats.lateToday}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800">
                Grace Exceeded
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Teachers arrived late</span>
          <span className="font-medium text-amber-700 dark:text-amber-400">Flagged for review</span>
        </div>
      </div>

      {/* 4. Absent Today */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200/80 dark:border-gray-700 shadow-xs flex flex-col justify-between hover:border-rose-200 dark:hover:border-rose-700 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Absent Today
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-700 dark:text-rose-400 tracking-tight">
                {stats.absentToday}
              </span>
              {stats.onLeaveToday > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                  {stats.onLeaveToday} On Leave
                </span>
              )}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800">
            <UserX className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Not checked in yet</span>
          <span className="font-medium text-rose-600 dark:text-rose-400">Pending Entrance</span>
        </div>
      </div>
    </div>
  );
};
