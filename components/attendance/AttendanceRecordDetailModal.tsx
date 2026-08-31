import React from 'react';
import {
  Calendar,
  Clock,
  Fingerprint,
  Building,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Edit3,
  ExternalLink,
  MapPin,
  FileText,
} from 'lucide-react';
import { Modal } from '../common/Modal.tsx';
import { Badge } from '../common/Badge.tsx';
import { AttendanceRecord, UserRole } from '../../types/index.ts';

interface AttendanceRecordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
  currentRole?: UserRole;
  onViewTeacher?: (teacherId: string) => void;
  onOpenCorrection?: (record: AttendanceRecord) => void;
}

export const AttendanceRecordDetailModal: React.FC<AttendanceRecordDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  currentRole = 'hr_admin',
  onViewTeacher,
  onOpenCorrection,
}) => {
  if (!isOpen || !record) return null;

  const canEdit = currentRole === 'hr_admin';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Attendance Record & Entry Telemetry"
      subtitle="Biometric Turnstile Scan Signature & Schedule Verification"
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Top Faculty Banner */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-[#E5252A] dark:text-red-400 font-black text-base flex items-center justify-center border border-red-200 dark:border-red-900/50 shadow-2xs shrink-0">
              {record.teacherName
                .split(' ')
                .slice(-2)
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-[#263238] dark:text-white">
                  {record.teacherName}
                </h3>
                <Badge status={record.status} size="sm" />
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-0.5 flex items-center gap-2">
                <span>{record.employeeId}</span>
                <span>•</span>
                <span>{record.departmentName}</span>
              </p>
            </div>
          </div>

          {onViewTeacher && (
            <button
              onClick={() => {
                onClose();
                onViewTeacher(record.teacherId);
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-[#263238] dark:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
              title="Open full faculty profile"
            >
              <span>Faculty Profile</span>
              <ExternalLink className="w-3 h-3 text-[#E5252A]" />
            </button>
          )}
        </div>

        {/* 4 Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Date</span>
            </div>
            <p className="text-xs font-bold text-[#263238] dark:text-white">{record.date}</p>
          </div>

          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Check-In</span>
            </div>
            <p className="text-xs font-mono font-bold text-gray-900 dark:text-white">
              {record.checkInTime || 'Not Recorded'}
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Check-Out</span>
            </div>
            <p className="text-xs font-mono font-bold text-gray-900 dark:text-white">
              {record.checkOutTime || 'Active / On-Site'}
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Late Offset</span>
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">
              {record.lateDurationMinutes > 0 ? (
                <span className="text-amber-600 dark:text-amber-400">+{record.lateDurationMinutes} mins late</span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">On Time (0m)</span>
              )}
            </p>
          </div>
        </div>

        {/* Verification & Hardware Details */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-200/80 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200/80 dark:border-gray-700">
            <span className="text-xs font-bold text-[#263238] dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#E5252A]" />
              Entrance Verification Signature
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Score: 99.4% Match
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-400 text-[10px] block">Verification Method</span>
              <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                <Fingerprint className="w-3.5 h-3.5 text-[#E5252A]" />
                <span>{record.verificationMethod || 'Biometric Fingerprint'}</span>
              </div>
            </div>

            <div>
              <span className="text-gray-400 text-[10px] block">Turnstile Gate Device</span>
              <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span className="truncate">{record.deviceName || 'Main Campus Turnstile Gate A'}</span>
              </div>
            </div>

            <div>
              <span className="text-gray-400 text-[10px] block">Assigned Official Shift</span>
              <span className="font-mono font-semibold text-gray-700 dark:text-gray-300 mt-0.5 block">
                {record.scheduledStartTime} — {record.scheduledEndTime}
              </span>
            </div>

            <div>
              <span className="text-gray-400 text-[10px] block">Department Allocation</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300 mt-0.5 block">
                {record.departmentName}
              </span>
            </div>
          </div>

          {record.isManualCorrection && (
            <div className="pt-3 border-t border-gray-200/80 dark:border-gray-700">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 mb-1">
                <Edit3 className="w-3.5 h-3.5" />
                Administrative Manual Correction Details
              </span>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200">
                <p><strong>Reason:</strong> {record.correctionReason || 'Routine supervisor adjustment'}</p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">
                  Adjusted by: {record.correctedBy || 'HR Admin'} • Date: {record.correctedAt || 'Recorded'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-3">
          {canEdit && onOpenCorrection && (
            <button
              onClick={() => {
                onClose();
                onOpenCorrection(record);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Correct Attendance</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-xl bg-[#263238] dark:bg-gray-700 hover:bg-[#1C252A] dark:hover:bg-gray-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
};
