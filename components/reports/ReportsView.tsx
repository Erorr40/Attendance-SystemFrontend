import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  BarChart2,
  CheckCircle2,
  Clock,
  UserX,
} from 'lucide-react';
import { AttendanceRecord, Department, Teacher } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';

interface ReportsViewProps {
  records: AttendanceRecord[];
  departments: Department[];
  teachers: Teacher[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  records = [],
  departments = [],
  teachers = [],
}) => {
  const safeRecords = Array.isArray(records) ? records : [];
  const safeDepts = Array.isArray(departments) ? departments : [];

  const [reportType, setReportType] = useState<string>('DAILY_SUMMARY');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  // Filter records based on report configuration
  const reportRecords = safeRecords.filter((r) => {
    const matchesDept = deptFilter === 'ALL' || r.departmentId === deptFilter;
    let matchesStatus = true;
    if (reportType === 'LATE_ARRIVALS') {
      matchesStatus = r.status === 'Late' || r.status === 'Very Late';
    } else if (reportType === 'ABSENCES') {
      matchesStatus = r.status === 'Absent';
    } else if (reportType === 'LEAVES') {
      matchesStatus = r.status === 'On Leave';
    }
    return matchesDept && matchesStatus;
  });

  const totalFiltered = reportRecords.length || 1;
  const presentCount = reportRecords.filter((r) => r.status === 'Present').length;
  const lateCount = reportRecords.filter((r) => r.status === 'Late' || r.status === 'Very Late').length;
  const absentCount = reportRecords.filter((r) => r.status === 'Absent').length;
  const leaveCount = reportRecords.filter((r) => r.status === 'On Leave').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = async () => {
    if (reportRecords.length === 0) return;
    let csv = 'Teacher Name,Employee ID,Department,Date,Scheduled Start,Check-In,Check-Out,Status,Late (Mins),Device,Verification\n';
    reportRecords.forEach((r) => {
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
    a.download = `Elswedy_Attendance_Report_${startDate}_to_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263238] dark:text-white">Attendance Reports & Analytics</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Generate and export verified institutional attendance registers for school administration and payroll.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E5252A] hover:bg-[#D01B20] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200/80 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
          >
            <option value="DAILY_SUMMARY">Daily Attendance Summary</option>
            <option value="DEPARTMENT_COMPLIANCE">Department Attendance Report</option>
            <option value="LATE_ARRIVALS">Late Arrivals & Punctuality Report</option>
            <option value="ABSENCES">Unexcused Absences Report</option>
            <option value="LEAVES">Official Leave & Missions Log</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
            Department Scope
          </label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
          >
            <option value="ALL">All Technical Departments</option>
            {safeDepts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
          />
        </div>

        <div>
          <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
          />
        </div>
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-gray-800 border border-gray-200/80 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">Total Sample</span>
            <p className="text-xl font-extrabold text-[#263238] dark:text-white mt-0.5">{reportRecords.length}</p>
          </div>
          <BarChart2 className="w-5 h-5 text-gray-400" />
        </div>

        <div className="p-3.5 bg-white dark:bg-gray-800 border border-emerald-200 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] text-emerald-700 font-bold uppercase">Present On-Time</span>
            <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{presentCount}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="p-3.5 bg-white dark:bg-gray-800 border border-amber-200 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] text-amber-700 font-bold uppercase">Late Scans</span>
            <p className="text-xl font-extrabold text-amber-700 mt-0.5">{lateCount}</p>
          </div>
          <Clock className="w-5 h-5 text-amber-600" />
        </div>

        <div className="p-3.5 bg-white dark:bg-gray-800 border border-rose-200 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] text-rose-700 font-bold uppercase">Absences</span>
            <p className="text-xl font-extrabold text-rose-700 mt-0.5">{absentCount}</p>
          </div>
          <UserX className="w-5 h-5 text-rose-600" />
        </div>
      </div>

      {/* Report Preview Document */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 shadow-xs p-6 space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#E5252A] rounded-full" />
              <h3 className="text-base font-bold text-[#263238] dark:text-white">
                Elswedy Applied Technology Schools — Attendance Ledger
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
              Generated: {new Date().toLocaleString()} • Report Scope: {reportType}
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-gray-100 text-gray-700 dark:text-gray-300 font-mono">
            {startDate} to {endDate}
          </span>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Teacher</th>
                <th className="py-2.5 px-3">Employee ID</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Check-In</th>
                <th className="py-2.5 px-3">Check-Out</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Verification Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400">
                    No records match the requested report parameters.
                  </td>
                </tr>
              ) : (
                reportRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:bg-gray-800/50">
                    <td className="py-2.5 px-3 font-mono text-gray-500 dark:text-gray-400">{r.date}</td>
                    <td className="py-2.5 px-3 font-bold text-[#263238] dark:text-white">{r.teacherName}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-400">{r.employeeId}</td>
                    <td className="py-2.5 px-3 text-gray-600">{r.departmentName}</td>
                    <td className="py-2.5 px-3 font-mono text-[#263238] dark:text-white">
                      {r.checkInTime || '--:--'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-500 dark:text-gray-400">
                      {r.checkOutTime || '--:--'}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge status={r.status} size="sm" />
                      {r.lateDurationMinutes > 0 && (
                        <span className="text-[10px] text-amber-600 block">
                          +{r.lateDurationMinutes}m
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 dark:text-gray-400 text-[11px] truncate max-w-[150px]">
                      {r.deviceName ? r.deviceName.replace('Gate Fingerprint Device ', 'Gate ') : r.verificationMethod}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
