import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit3,
  Calendar,
  Fingerprint,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building,
} from 'lucide-react';
import { AttendanceRecord, Department, UserRole } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import { GrabScrollContainer } from '../common/GrabScrollContainer.tsx';
import { UserAvatar } from '../common/UserAvatar.tsx';

interface TodayAttendanceTableProps {
  records: AttendanceRecord[];
  departments: Department[];
  currentRole: UserRole;
  onViewTeacher: (teacherId: string) => void;
  onOpenCorrectionModal: (record: AttendanceRecord) => void;
  onInspectRecord?: (record: AttendanceRecord) => void;
}

export const TodayAttendanceTable: React.FC<TodayAttendanceTableProps> = ({
  records = [],
  departments = [],
  currentRole,
  onViewTeacher,
  onOpenCorrectionModal,
  onInspectRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Filter records
  const safeRecords = Array.isArray(records) ? records : [];
  const safeDepts = Array.isArray(departments) ? departments : [];

  const filtered = safeRecords.filter((r) => {
    const matchesSearch =
      (r.teacherName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.departmentName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || r.departmentId === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const canEditAttendance = currentRole === 'hr_admin';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-xs p-5 space-y-4 transition-colors">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h3 className="font-bold text-sm text-[#263238] dark:text-white">Today's Faculty Attendance</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time check-in records captured via entrance gate biometric devices
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-hidden focus:border-[#E5252A] bg-gray-50/50 dark:bg-gray-700/50 text-[#263238] dark:text-white"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-gray-50/50 dark:bg-gray-700/50 text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
          >
            <option value="ALL">All Departments</option>
            {safeDepts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-gray-50/50 dark:bg-gray-700/50 text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Very Late">Very Late</option>
            <option value="Absent">Absent</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Compact Table */}
      <GrabScrollContainer>
        <table className="w-full text-left text-xs border-collapse min-w-[880px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              <th className="py-3 px-3 min-w-[210px]">Teacher</th>
              <th className="py-3 px-3 min-w-[200px]">Department</th>
              <th className="py-3 px-3 min-w-[125px]">Scheduled</th>
              <th className="py-3 px-3 min-w-[105px]">Check-In</th>
              <th className="py-3 px-3 min-w-[105px]">Check-Out</th>
              <th className="py-3 px-3 min-w-[110px]">Status</th>
              <th className="py-3 px-3 min-w-[135px]">Device / Method</th>
              <th className="py-3 px-3 text-right min-w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400 dark:text-gray-500 dark:text-gray-400">
                  No attendance records found matching current criteria.
                </td>
              </tr>
            ) : (
              paginated.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors group"
                  >
                    {/* Teacher */}
                    <td className="py-3 px-3 min-w-[210px]">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={r.teacherName} size="sm" />
                        <div className="min-w-0">
                          <p className="font-bold text-[#263238] dark:text-white group-hover:text-[#E5252A] dark:group-hover:text-red-400 transition-colors leading-snug">
                            {r.teacherName}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{r.employeeId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3 min-w-[200px]">
                      <span className="font-medium text-gray-700 dark:text-gray-300 leading-snug block">
                        {r.departmentName}
                      </span>
                    </td>

                    {/* Scheduled Time */}
                    <td className="py-3 px-3 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {r.scheduledStartTime} - {r.scheduledEndTime}
                    </td>

                    {/* Check-In */}
                    <td className="py-3 px-3 font-mono font-semibold text-[#263238] dark:text-white whitespace-nowrap">
                      {r.checkInTime || (
                        <span className="text-gray-400 dark:text-gray-600 font-normal">--:-- --</span>
                      )}
                    </td>

                    {/* Check-Out */}
                    <td className="py-3 px-3 font-mono text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {r.checkOutTime || (
                        <span className="text-gray-400 dark:text-gray-600 font-normal">--:-- --</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <Badge status={r.status} size="sm" />
                      {r.lateDurationMinutes > 0 && (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 block mt-0.5 whitespace-nowrap">
                          +{r.lateDurationMinutes}m late
                        </span>
                      )}
                    </td>

                    {/* Device */}
                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {r.verificationMethod === 'Fingerprint' ? (
                          <Fingerprint className="w-3.5 h-3.5 text-[#E5252A] dark:text-red-400 shrink-0" />
                        ) : (
                          <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        )}
                        <span className="truncate max-w-[140px]">
                          {r.deviceName ? r.deviceName.replace('Gate Fingerprint Device ', 'Gate ') : r.verificationMethod}
                        </span>
                      </div>
                      {r.isManualCorrection && (
                        <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 block mt-0.5">
                          Manual Override
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            if (onInspectRecord) onInspectRecord(r);
                            else onViewTeacher(r.teacherId);
                          }}
                          title="Inspect Attendance Entry Telemetry"
                          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEditAttendance && (
                          <button
                            onClick={() => onOpenCorrectionModal(r)}
                            title="Manual Attendance Correction"
                            className="p-1.5 rounded-md text-gray-400 hover:text-[#E5252A] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </GrabScrollContainer>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div>
          Showing{' '}
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {Math.min(currentPage * pageSize, filtered.length)}
          </span>{' '}
          of <span className="font-semibold text-gray-700 dark:text-gray-200">{filtered.length}</span> faculty records
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800/50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-2 text-gray-700 dark:text-gray-300">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800/50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
