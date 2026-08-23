import React, { useState } from 'react';
import { Clock, Plus, Users, Calendar, CheckCircle2, Sliders, Shield } from 'lucide-react';
import { Schedule, UserRole } from '../../types/index.ts';
import { Modal } from '../common/Modal.tsx';
import { api } from '../../services/api.ts';

interface ScheduleManagementProps {
  schedules: Schedule[];
  currentRole: UserRole;
  onRefreshSchedules: () => void;
}

export const ScheduleManagement: React.FC<ScheduleManagementProps> = ({
  schedules = [],
  currentRole,
  onRefreshSchedules,
}) => {
  const safeSchedules = Array.isArray(schedules) ? schedules : [];
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('07:30');
  const [endTime, setEndTime] = useState<string>('15:00');
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState<number>(15);
  const [lateThresholdMinutes, setLateThresholdMinutes] = useState<number>(45);
  const [days, setDays] = useState<string[]>(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const canEdit = currentRole === 'hr_admin';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createSchedule({
        name: name.trim(),
        startTime,
        endTime,
        gracePeriodMinutes,
        lateThresholdMinutes,
        workingDays: days,
        adminName: 'Super Admin',
      });
      setIsAddModalOpen(false);
      onRefreshSchedules();
      setName('');
    } catch (e) {
      // error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: string) => {
    if (days.includes(day)) {
      setDays(days.filter((d) => d !== day));
    } else {
      setDays([...days, day]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263238] dark:text-white">Work Shift & Attendance Schedules</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Configure school instructional shifts, grace periods, and late arrival calculation thresholds.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E5252A] hover:bg-[#D01B20] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Shift Schedule</span>
          </button>
        )}
      </div>

      {/* Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {safeSchedules.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-[#E5252A] flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#263238] dark:text-white">{s.name}</h3>
                    <p className="text-[11px] text-gray-400 font-mono">
                      {s.startTime} - {s.endTime}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700 dark:text-gray-300">
                  {s.assignedTeachersCount} Assigned
                </span>
              </div>

              {/* Rules List */}
              <div className="py-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="text-gray-400">Grace Period:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {s.gracePeriodMinutes} Minutes
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span className="text-gray-400">Late Threshold:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    After {s.lateThresholdMinutes} Min (Very Late)
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-400 block mb-1.5 text-[10px] font-bold uppercase tracking-wider">
                    Working Days:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu'].map((day) => {
                      const fullDay =
                        day === 'Sun'
                          ? 'Sunday'
                          : day === 'Mon'
                          ? 'Monday'
                          : day === 'Tue'
                          ? 'Tuesday'
                          : day === 'Wed'
                          ? 'Wednesday'
                          : 'Thursday';
                      const isActive = s.workingDays.includes(fullDay);

                      return (
                        <span
                          key={day}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isActive
                              ? 'bg-red-50 text-[#E5252A] border border-red-100'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>Automatic fingerprint calculation</span>
              <span className="font-semibold text-emerald-700">Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Schedule Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Work Shift Schedule"
        subtitle="Define attendance shift hours and late calculation policy"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
              Schedule Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Workshop Practical Shift"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
                Start Time (HH:MM)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
                End Time (HH:MM)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
                Grace Period (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={gracePeriodMinutes}
                onChange={(e) => setGracePeriodMinutes(Number(e.target.value))}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
                Late Threshold (Minutes)
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={lateThresholdMinutes}
                onChange={(e) => setLateThresholdMinutes(Number(e.target.value))}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1.5">
              Working Days
            </label>
            <div className="flex flex-wrap gap-2">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
                (day) => {
                  const isChecked = days.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${
                        isChecked
                          ? 'bg-[#E5252A] border-[#E5252A] text-white'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 hover:bg-gray-50 dark:bg-gray-800/50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#E5252A] hover:bg-[#D01B20] text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Shift Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
