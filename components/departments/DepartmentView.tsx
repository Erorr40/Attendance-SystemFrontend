import React, { useState } from 'react';
import { Building2, Users, CheckCircle2, Clock, UserX, ChevronRight, Eye } from 'lucide-react';
import { Department, Teacher, UserRole } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import { GrabScrollContainer } from '../common/GrabScrollContainer.tsx';

interface DepartmentViewProps {
  departments: Department[];
  teachers: Teacher[];
  currentRole: UserRole;
  onViewTeacher: (teacherId: string) => void;
}

export const DepartmentView: React.FC<DepartmentViewProps> = ({
  departments = [],
  teachers = [],
  onViewTeacher,
}) => {
  const safeDepts = Array.isArray(departments) ? departments : [];
  const safeTeachers = Array.isArray(teachers) ? teachers : [];

  const [selectedDeptId, setSelectedDeptId] = useState<string>(safeDepts[0]?.id || 'dept-1');

  const selectedDept = safeDepts.find((d) => d.id === selectedDeptId) || safeDepts[0];
  const deptTeachers = safeTeachers.filter((t) => t.departmentId === selectedDeptId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200/80 shadow-xs">
        <h2 className="text-lg font-bold text-[#263238] dark:text-white">Technical Departments</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Elswedy Applied Technology specializations, faculty rosters, and departmental attendance compliance.
        </p>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {safeDepts.map((dept) => {
          const isSelected = dept.id === selectedDeptId;

          return (
            <button
              key={dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-white dark:bg-gray-800 border-[#E5252A] shadow-md ring-2 ring-red-100'
                  : 'bg-white dark:bg-gray-800 border-gray-200/80 hover:border-gray-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-red-50 text-[#E5252A]">
                    {dept.code}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    {dept.attendancePercentage || 92}%
                  </span>
                </div>

                <h4 className="font-bold text-xs text-[#263238] dark:text-white leading-snug">
                  {dept.name}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Head: <span className="text-gray-700 dark:text-gray-300 font-medium">{dept.headOfDepartment}</span>
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                <span>{dept.totalTeachers} Faculty</span>
                <span className="text-emerald-700 font-semibold">{dept.presentToday} Present</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Department Focus View */}
      {selectedDept && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-[#263238] dark:text-white">{selectedDept.name}</h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 dark:text-gray-300">
                  {selectedDept.code}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Department Head: <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedDept.headOfDepartment}</span>
              </p>
            </div>

            {/* Department stats pills */}
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100 font-semibold">
                {selectedDept.presentToday} Present
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-100 font-semibold">
                {selectedDept.lateToday} Late
              </span>
              <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-100 font-semibold">
                {selectedDept.absentToday} Absent
              </span>
            </div>
          </div>

          {/* Department Faculty Table */}
          <GrabScrollContainer>
            <table className="w-full text-left text-xs border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3 min-w-[200px]">Faculty Member</th>
                  <th className="py-3 px-3 min-w-[110px]">Employee ID</th>
                  <th className="py-3 px-3 min-w-[160px]">Position</th>
                  <th className="py-3 px-3 min-w-[120px]">Biometrics</th>
                  <th className="py-3 px-3 min-w-[100px]">Account</th>
                  <th className="py-3 px-3 text-right min-w-[80px]">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deptTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No teachers assigned to this department yet.
                    </td>
                  </tr>
                ) : (
                  deptTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-[#263238] dark:text-white min-w-[200px] leading-snug">{t.fullName}</td>
                      <td className="py-3 px-3 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{t.employeeId}</td>
                      <td className="py-3 px-3 text-gray-600 min-w-[160px]">{t.position}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge status={t.fingerprintStatus} size="sm" />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge status={t.accountStatus} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onViewTeacher(t.id)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
                          title="View Teacher Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </GrabScrollContainer>
        </div>
      )}
    </div>
  );
};
