import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertCircle, CheckCircle2, History } from 'lucide-react';
import { Modal } from '../common/Modal.tsx';
import { AttendanceRecord, AttendanceStatus, UserRole } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AttendanceCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
  currentRole: UserRole;
  onCorrectionSuccess: (updatedRecord: AttendanceRecord) => void;
}

export const AttendanceCorrectionModal: React.FC<AttendanceCorrectionModalProps> = ({
  isOpen,
  onClose,
  record,
  currentRole,
  onCorrectionSuccess,
}) => {
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('Present');
  const [newCheckIn, setNewCheckIn] = useState<string>('');
  const [newCheckOut, setNewCheckOut] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (record) {
      setNewStatus(record.status);
      setNewCheckIn(record.checkInTime || '07:30 AM');
      setNewCheckOut(record.checkOutTime || '03:00 PM');
      setReason('');
      setErrorMsg('');
    }
  }, [record]);

  if (!record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Audit Compliance: A specific justification reason is mandatory.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.correctAttendance({
        recordId: record.id,
        newStatus,
        newCheckIn,
        newCheckOut,
        reason: reason.trim(),
        adminName: currentRole === 'hr_admin' ? 'Super Administrator' : 'HR Attendance Desk',
        adminRole: currentRole,
      });

      onCorrectionSuccess(res.record);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to apply manual attendance correction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manual Attendance Correction"
      subtitle="Audit-Logged Institutional Override"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Compliance notice */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Administrative Audit Requirement</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Every manual change is permanently written to the School Audit Trail with your user ID and IP address.
            </p>
          </div>
        </div>

        {/* Teacher Info */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg space-y-1">
          <p className="font-bold text-[#263238] dark:text-white">{record.teacherName}</p>
          <p className="text-gray-500 dark:text-gray-400">
            ID: {record.employeeId} • Dept: {record.departmentName} • Date: {record.date}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Current Status: <span className="font-semibold text-gray-700 dark:text-gray-300">{record.status}</span> (
            {record.checkInTime || 'No Check-in'} - {record.checkOutTime || 'No Check-out'})
          </p>
        </div>

        {/* New Status */}
        <div>
          <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
            New Attendance Status *
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as AttendanceStatus)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
          >
            <option value="Present">Present (On Time)</option>
            <option value="Late">Late Arrival</option>
            <option value="Very Late">Very Late</option>
            <option value="Absent">Absent</option>
            <option value="On Leave">On Approved Leave</option>
            <option value="Early Leave">Early Leave</option>
          </select>
        </div>

        {/* Adjusted Times */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
              Check-In Time
            </label>
            <input
              type="text"
              value={newCheckIn}
              onChange={(e) => setNewCheckIn(e.target.value)}
              placeholder="e.g. 07:28 AM"
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
          </div>
          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
              Check-Out Time
            </label>
            <input
              type="text"
              value={newCheckOut}
              onChange={(e) => setNewCheckOut(e.target.value)}
              placeholder="e.g. 03:15 PM"
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
          </div>
        </div>

        {/* Reason Mandatory */}
        <div>
          <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
            Correction Justification (Mandatory for Audit) *
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Turnstile scanner optical recalibration at Main Entrance, verified in-person by HR."
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-normal text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
          />
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 hover:bg-gray-50 dark:bg-gray-800/50 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#E5252A] hover:bg-[#D01B20] text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? 'Writing Audit Log...' : 'Apply & Save Correction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
