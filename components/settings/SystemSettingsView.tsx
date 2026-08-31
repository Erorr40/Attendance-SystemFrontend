import React, { useState } from 'react';
import {
  Sliders,
  Building,
  Clock,
  ShieldCheck,
  Bell,
  HardDrive,
  Save,
  CheckCircle2,
  Moon,
  Sun,
} from 'lucide-react';
import { UserRole } from '../../types/index.ts';

interface SystemSettingsViewProps {
  currentRole: UserRole;
  isDarkMode: boolean;
  onToggleDarkMode: (enabled: boolean) => void;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({
  currentRole,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [schoolName, setSchoolName] = useState('Elswedy International Applied Technology Schools');
  const [campus, setCampus] = useState('VWM4+4QF, October Gardens, Giza Governorate 3252130');
  const [academicYear, setAcademicYear] = useState('2025 / 2026');

  const [gracePeriod, setGracePeriod] = useState(15);
  const [lateThreshold, setLateThreshold] = useState(45);
  const [earlyDepartureThreshold, setEarlyDepartureThreshold] = useState(30);
  const [dailyCutoff, setDailyCutoff] = useState('17:00');

  const [offlineSyncInterval, setOfflineSyncInterval] = useState(15);
  const [autoDeduplicate, setAutoDeduplicate] = useState(true);

  const [notifyLateArrivals, setNotifyLateArrivals] = useState(true);
  const [notifyDailySummary, setNotifyDailySummary] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 text-xs max-w-4xl">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200/80 dark:border-gray-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263238] dark:text-white">System Configuration & Policies</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Institutional attendance calculation parameters, hardware device protocols, appearance, and notification triggers.
          </p>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-[#E5252A] hover:bg-[#D01B20] text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>System configuration updated successfully and broadcast to all turnstiles.</span>
        </div>
      )}

      {/* Appearance / Dark Mode */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-[#263238] dark:text-white pb-2 border-b border-gray-100 dark:border-gray-700">
          {isDarkMode ? <Moon className="w-4 h-4 text-[#E5252A]" /> : <Sun className="w-4 h-4 text-[#E5252A]" />}
          <span>Appearance & Theme (Dark Mode)</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700">
          <div>
            <h4 className="font-bold text-gray-800 dark:text-white">Enable Dark Mode Theme</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Switch the administrative portal layout to a high-contrast dark palette designed for low-light campus control rooms.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onToggleDarkMode(!isDarkMode)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              isDarkMode ? 'bg-[#E5252A]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-800 shadow-lg ring-0 transition duration-200 ease-in-out ${
                isDarkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 1. School Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-[#263238] dark:text-white pb-2 border-b border-gray-100 dark:border-gray-700">
          <Building className="w-4 h-4 text-[#E5252A]" />
          <span>School Institutional Profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-[#263238] dark:text-gray-200 uppercase tracking-wider mb-1">
              Institution Name <span className="text-[10px] text-gray-400 font-normal">(Locked)</span>
            </label>
            <input
              type="text"
              value={schoolName}
              disabled
              readOnly
              className="w-full bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-medium text-gray-600 dark:text-gray-400 cursor-not-allowed select-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#263238] dark:text-gray-200 uppercase tracking-wider mb-1">
              Campus Location <span className="text-[10px] text-gray-400 font-normal">(Locked)</span>
            </label>
            <input
              type="text"
              value={campus}
              disabled
              readOnly
              className="w-full bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-medium text-gray-600 dark:text-gray-400 cursor-not-allowed select-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#263238] dark:text-gray-200 uppercase tracking-wider mb-1">
              Academic Year
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
          </div>
        </div>
      </div>

      {/* 2. Attendance Rules */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-[#263238] dark:text-white pb-2 border-b border-gray-100 dark:border-gray-700">
          <Clock className="w-4 h-4 text-[#E5252A]" />
          <span>Biometric Calculation Engine Rules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block font-bold text-[#263238] dark:text-gray-200 uppercase tracking-wider mb-1">
              Grace Period (Minutes)
            </label>
            <input
              type="number"
              value={gracePeriod}
              onChange={(e) => setGracePeriod(Number(e.target.value))}
              className="w-full bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-mono font-bold text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
            <p className="text-[10px] text-gray-400 mt-1">Arrival within grace is marked Present</p>
          </div>

          <div>
            <label className="block font-bold text-[#263238] dark:text-gray-200 uppercase tracking-wider mb-1">
              Late Threshold (Minutes)
            </label>
            <input
              type="number"
              value={lateThreshold}
              onChange={(e) => setLateThreshold(Number(e.target.value))}
              className="w-full bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-mono font-bold text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
            <p className="text-[10px] text-gray-400 mt-1">Arrival past threshold is marked Very Late</p>
          </div>

          <div>
            <label className="block font-bold text-[#263238] dark:text-gray-200 uppercase tracking-wider mb-1">
              Early Departure Threshold
            </label>
            <input
              type="number"
              value={earlyDepartureThreshold}
              onChange={(e) => setEarlyDepartureThreshold(Number(e.target.value))}
              className="w-full bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-mono font-bold text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
            <p className="text-[10px] text-gray-400 mt-1">Checkout before scheduled end</p>
          </div>

          <div>
            <label className="block font-bold text-[#263238] dark:text-gray-200 uppercase tracking-wider mb-1">
              Daily Auto Cut-off Time
            </label>
            <input
              type="time"
              value={dailyCutoff}
              onChange={(e) => setDailyCutoff(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
            <p className="text-[10px] text-gray-400 mt-1">Unscanned faculty marked Absent</p>
          </div>
        </div>
      </div>

      {/* 3. Hardware & Offline Integration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-[#263238] dark:text-white pb-2 border-b border-gray-100 dark:border-gray-700">
          <HardDrive className="w-4 h-4 text-[#E5252A]" />
          <span>Biometric Hardware Protocol & Offline Flash Memory</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block font-bold text-[#263238] dark:text-gray-200">
              Automatic Hardware Sync Interval (Seconds)
            </label>
            <input
              type="number"
              value={offlineSyncInterval}
              onChange={(e) => setOfflineSyncInterval(Number(e.target.value))}
              className="w-full bg-gray-50/50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Frequency of device heartbeat and event polling over TCP/IP LAN.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-[#263238] dark:text-gray-200">
              Offline De-duplication Policy
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <input
                type="checkbox"
                checked={autoDeduplicate}
                onChange={(e) => setAutoDeduplicate(e.target.checked)}
                className="w-4 h-4 text-[#E5252A] rounded border-gray-300 focus:ring-[#E5252A]"
              />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Auto-filter duplicate scans within 60-second window
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 4. Notifications Policy */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-[#263238] dark:text-white pb-2 border-b border-gray-100 dark:border-gray-700">
          <Bell className="w-4 h-4 text-[#E5252A]" />
          <span>Automated Notifications & Escalation</span>
        </div>

        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyLateArrivals}
              onChange={(e) => setNotifyLateArrivals(e.target.checked)}
              className="w-4 h-4 text-[#E5252A] rounded border-gray-300 focus:ring-[#E5252A]"
            />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Send instant alert to Department Head when a teacher exceeds grace period
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyDailySummary}
              onChange={(e) => setNotifyDailySummary(e.target.checked)}
              className="w-4 h-4 text-[#E5252A] rounded border-gray-300 focus:ring-[#E5252A]"
            />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Deliver daily end-of-day attendance compliance report to HR at 17:00
            </span>
          </label>
        </div>
      </div>
    </form>
  );
};
