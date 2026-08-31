import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  Download,
  Filter,
  Eye,
  Edit3,
  Fingerprint,
  FileSpreadsheet,
} from 'lucide-react';
import { AttendanceRecord, Department, UserRole } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import { Pagination } from '../common/Pagination.tsx';
import { GrabScrollContainer } from '../common/GrabScrollContainer.tsx';
import { UserAvatar } from '../common/UserAvatar.tsx';

interface AttendanceHistoryViewProps {
  records: AttendanceRecord[];
  departments: Department[];
  currentRole: UserRole;
  onViewTeacher: (teacherId: string) => void;
  onOpenCorrectionModal: (record: AttendanceRecord) => void;
  onInspectRecord?: (record: AttendanceRecord) => void;
}

export const AttendanceHistoryView: React.FC<AttendanceHistoryViewProps> = ({
  records = [],
  departments = [],
  currentRole,
  onViewTeacher,
  onOpenCorrectionModal,
  onInspectRecord,
}) => {
  const safeRecords = Array.isArray(records) ? records : [];
  const safeDepts = Array.isArray(departments) ? departments : [];

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  const filtered = safeRecords.filter((r) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (r.teacherName || '').toLowerCase().includes(q) ||
      (r.employeeId || '').toLowerCase().includes(q) ||
      (r.departmentName || '').toLowerCase().includes(q);

    const matchesDate = !selectedDate || r.date === selectedDate;
    const matchesDept = selectedDept === 'ALL' || r.departmentId === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

    return matchesSearch && matchesDate && matchesDept && matchesStatus;
  });

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const canEdit = currentRole === 'hr_admin';

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    let csv = 'Teacher Name,Employee ID,Department,Date,Scheduled Start,Check-In,Check-Out,Status,Late (Mins),Device,Verification\n';
    filtered.forEach((r) => {
      csv += `"${r.teacherName}","${r.employeeId}","${r.departmentName}","${r.date}","${r.scheduledStartTime}","${
        r.checkInTime || '--'
      }","${r.checkOutTime || '--'}","${r.status}","${r.lateDurationMinutes}","${r.deviceName || '--'}","${
        r.verificationMethod
      }"\n`;
    });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Elswedy_Attendance_${selectedDate || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-700 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#263238] dark:text-white">Attendance Records</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Historical logs of all biometric turnstile entrance verifications and manual overrides.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-[#E5252A]" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200/80 dark:border-gray-700 shadow-2xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search faculty name, ID, department..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-hidden focus:border-[#E5252A] bg-gray-50/50 dark:bg-gray-700/50 text-[#263238] dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-gray-50/50 dark:bg-gray-700/50">
            <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-transparent text-gray-700 dark:text-gray-200 focus:outline-hidden"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50/50 dark:bg-gray-700/50 text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
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
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50/50 dark:bg-gray-700/50 text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
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

      {/* Attendance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 shadow-2xs overflow-hidden transition-colors">
        <GrabScrollContainer>
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 min-w-[200px]">Faculty Member</th>
                <th className="py-3.5 px-4 min-w-[100px]">Date</th>
                <th className="py-3.5 px-4 min-w-[100px]">Schedule</th>
                <th className="py-3.5 px-4 min-w-[100px]">Check-In</th>
                <th className="py-3.5 px-4 min-w-[100px]">Check-Out</th>
                <th className="py-3.5 px-4 min-w-[100px]">Status</th>
                <th className="py-3.5 px-4 min-w-[140px]">Verification</th>
                <th className="py-3.5 px-4 text-right min-w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-gray-500">
                    No attendance records found matching the criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="py-3.5 px-4 min-w-[220px]">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={r.teacherName} size="sm" />
                        <div className="min-w-0">
                          <button
                            onClick={() => onViewTeacher(r.teacherId)}
                            className="font-bold text-gray-900 dark:text-white hover:text-[#E5252A] dark:hover:text-red-400 transition-colors block text-left cursor-pointer truncate"
                          >
                            {r.teacherName}
                          </button>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">{r.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-gray-700 dark:text-gray-300">
                      {r.date}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-gray-500 dark:text-gray-400 font-mono text-[11px]">
                      {r.scheduledStartTime} - {r.scheduledEndTime}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`font-mono font-semibold ${r.checkInTime ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                        {r.checkInTime || '--:-- --'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`font-mono font-semibold ${r.checkOutTime ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                        {r.checkOutTime || '--:-- --'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge status={r.status} size="sm" />
                      {r.lateDurationMinutes > 0 && (
                        <span className="text-[10px] font-semibold text-amber-600 block mt-0.5 whitespace-nowrap">
                          +{r.lateDurationMinutes}m late
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {r.verificationMethod === 'Fingerprint' ? (
                          <Fingerprint className="w-3.5 h-3.5 text-[#E5252A] shrink-0" />
                        ) : (
                          <Edit3 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                        <span className="truncate max-w-[140px]">
                          {r.deviceName ? r.deviceName.replace('Gate Fingerprint Device ', 'Gate ') : r.verificationMethod}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            if (onInspectRecord) onInspectRecord(r);
                            else onViewTeacher(r.teacherId);
                          }}
                          title="Inspect Attendance Entry Telemetry"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => onOpenCorrectionModal(r)}
                            title="Manual Correction"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#E5252A] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
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

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
    </div>
  );
};
