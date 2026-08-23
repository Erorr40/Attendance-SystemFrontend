import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Fingerprint,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  UserX,
  Mail,
  KeyRound,
  Lock,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
} from 'lucide-react';
import { Teacher, Department, Schedule, FingerprintDevice, UserRole } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import { Pagination } from '../common/Pagination.tsx';
import { api } from '../../services/api.ts';

interface TeachersListProps {
  teachers: Teacher[];
  departments: Department[];
  schedules: Schedule[];
  devices: FingerprintDevice[];
  currentRole?: UserRole;
  currentUserName?: string;
  onAddTeacher: () => void;
  onViewTeacher: (teacherId: string) => void;
  onOpenBiometricWizard: (teacher: Teacher) => void;
  onToggleAccountStatus: (teacherId: string) => void;
  onTeacherUpdated?: (teacher: Teacher) => void;
  onEditTeacher?: (teacher: Teacher) => void;
  onDeleteTeacher?: (teacherId: string) => void;
}

export const TeachersList: React.FC<TeachersListProps> = ({
  teachers = [],
  departments = [],
  currentRole = 'hr_admin',
  currentUserName = 'Staff Member',
  onAddTeacher,
  onViewTeacher,
  onOpenBiometricWizard,
  onToggleAccountStatus,
  onTeacherUpdated,
  onEditTeacher,
  onDeleteTeacher,
}) => {
  const safeTeachers = Array.isArray(teachers) ? teachers : [];
  const safeDepts = Array.isArray(departments) ? departments : [];

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedFingerprint, setSelectedFingerprint] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Track revealed passwords for H.Admin in local state
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});
  const [loadingPasswords, setLoadingPasswords] = useState<Record<string, boolean>>({});
  const [copiedPassId, setCopiedPassId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ id: string; text: string } | null>(null);

  const handleRevealPassword = async (teacher: Teacher) => {
    // Only HR Admin can reveal passwords.
    if (currentRole !== 'hr_admin') return;

    if (revealedPasswords[teacher.id]) {
      // Toggle hide
      const next = { ...revealedPasswords };
      delete next[teacher.id];
      setRevealedPasswords(next);
      return;
    }

    setLoadingPasswords((prev) => ({ ...prev, [teacher.id]: true }));
    try {
      const res = await api.revealTeacherPassword({
        teacherId: teacher.id,
        requesterRole: currentRole,
        requesterName: currentUserName,
      });

      if (res.success && res.plainPassword) {
        setRevealedPasswords((prev) => ({ ...prev, [teacher.id]: res.plainPassword }));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reveal password');
    } finally {
      setLoadingPasswords((prev) => ({ ...prev, [teacher.id]: false }));
    }
  };

  const handleCopyPassword = (teacherId: string, pass: string) => {
    if (currentRole !== 'hr_admin') return;
    navigator.clipboard.writeText(pass);
    setCopiedPassId(teacherId);
    setTimeout(() => setCopiedPassId(null), 2000);
  };

  const handleResetPassword = async (teacher: Teacher) => {
    if (currentRole !== 'hr_admin') return;
    const confirm = window.confirm(`Reset institutional password for ${teacher.fullName}?`);
    if (!confirm) return;

    try {
      const res = await api.resetTeacherPassword({
        teacherId: teacher.id,
        requesterRole: currentRole,
        requesterName: currentUserName,
      });

      if (res.success) {
        if (currentRole === 'hr_admin') {
          setRevealedPasswords((prev) => ({ ...prev, [teacher.id]: res.plainPassword }));
        }
        setFeedbackMsg({ id: teacher.id, text: res.message });
        setTimeout(() => setFeedbackMsg(null), 5000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    if (currentRole !== 'hr_admin') return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${teacher.fullName} (${teacher.employeeId})?\n\nThis will remove their attendance history and account.`
    );
    if (confirmed) {
      onDeleteTeacher?.(teacher.id);
    }
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    let csv = 'Employee ID,Full Name,Email,Phone,Department,Position,Hire Date,Biometrics,Account Status\n';
    filtered.forEach((t) => {
      csv += `"${t.employeeId}","${t.fullName}","${t.email}","${t.phone || ''}","${t.departmentName}","${t.position}","${t.hireDate}","${t.fingerprintStatus}","${t.accountStatus}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Elswedy_Faculty_List_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = safeTeachers.filter((t) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (t.fullName || '').toLowerCase().includes(q) ||
      (t.employeeId || '').toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q) ||
      (t.username || '').toLowerCase().includes(q) ||
      (t.position || '').toLowerCase().includes(q);

    const matchesDept = selectedDept === 'ALL' || t.departmentId === selectedDept;
    const matchesFingerprint =
      selectedFingerprint === 'ALL' || t.fingerprintStatus === selectedFingerprint;
    const matchesStatus = selectedStatus === 'ALL' || t.accountStatus === selectedStatus;

    return matchesSearch && matchesDept && matchesFingerprint && matchesStatus;
  });

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-700 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-lg sm:text-xl font-black text-[#263238] dark:text-white">Faculty & Teacher Accounts</h2>
            {currentRole === 'hr_admin' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                HR Full Control
              </span>
            ) : currentRole === 'board' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                Board Executive Observer (Read-Only)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                Employee Read-Only Mode
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Manage teacher profiles, department affiliations, credentials security, and biometric registration.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {currentRole === 'hr_admin' && (
            <button
              onClick={onAddTeacher}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E5252A] hover:bg-[#D01B20] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Faculty Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200/80 dark:border-gray-700 shadow-2xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search faculty by name, employee ID, email, username, or position..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-hidden focus:border-[#E5252A] bg-gray-50/50 dark:bg-gray-700/50 text-[#263238] dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          {/* Fingerprint Status Filter */}
          <select
            value={selectedFingerprint}
            onChange={(e) => {
              setSelectedFingerprint(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50/50 dark:bg-gray-700/50 text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
          >
            <option value="ALL">All Biometrics</option>
            <option value="Registered">Registered (Enrolled)</option>
            <option value="Not Registered">Not Registered</option>
          </select>

          {/* Account Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50/50 dark:bg-gray-700/50 text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
          >
            <option value="ALL">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Teachers Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 shadow-2xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 min-w-[230px]">Faculty Profile</th>
                <th className="py-3.5 px-4 min-w-[110px]">Employee ID</th>
                <th className="py-3.5 px-4 min-w-[200px]">Department</th>
                <th className="py-3.5 px-4 min-w-[170px]">Account Credentials</th>
                <th className="py-3.5 px-4 min-w-[125px]">Biometrics</th>
                <th className="py-3.5 px-4 min-w-[90px]">Status</th>
                <th className="py-3.5 px-4 text-right min-w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 dark:text-gray-500">
                    No faculty members found matching your search.
                  </td>
                </tr>
              ) : (
                paginated.map((t) => {
                  const isPasswordRevealed = !!revealedPasswords[t.id];
                  const passwordValue = revealedPasswords[t.id] || t.plainPassword || '••••••••••••';
                  const isSuperAdmin = currentRole === 'hr_admin';

                  return (
                    <tr key={t.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors group">
                      {/* Profile */}
                      <td className="py-3.5 px-4 min-w-[230px]">
                        <div className="flex items-center gap-3">
                          {t.avatar ? (
                            <img
                              src={t.avatar}
                              alt={t.fullName}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-[#E5252A] font-bold text-xs flex items-center justify-center border border-red-200 dark:border-red-800 shrink-0">
                              {t.fullName
                                .split(' ')
                                .slice(-2)
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <button
                              onClick={() => onViewTeacher(t.id)}
                              className="font-bold text-gray-900 dark:text-white hover:text-[#E5252A] dark:hover:text-red-400 transition-colors truncate block text-left cursor-pointer"
                            >
                              {t.fullName}
                            </button>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{t.position}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                              <span className="flex items-center gap-0.5">
                                <Mail className="w-2.5 h-2.5" />
                                {t.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600">
                          {t.employeeId}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                          <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{t.departmentName}</span>
                        </div>
                      </td>

                      {/* Credentials */}
                      <td className="py-3.5 px-4 min-w-[170px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="text-gray-400 font-medium">User:</span>
                            <span className="font-mono text-gray-700 dark:text-gray-300">{t.username || t.email.split('@')[0]}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            {isSuperAdmin ? (
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-[11px] text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/60 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 max-w-[120px] truncate">
                                  {passwordValue}
                                </span>
                                {isPasswordRevealed && (
                                  <button
                                    onClick={() => handleCopyPassword(t.id, passwordValue)}
                                    title="Copy Password"
                                    className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                                  >
                                    {copiedPassId === t.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 font-mono text-[11px]">••••••••••••</span>
                            )}
                          </div>

                          {feedbackMsg && feedbackMsg.id === t.id && (
                            <p className="text-[10px] text-emerald-600 font-medium">{feedbackMsg.text}</p>
                          )}
                        </div>
                      </td>

                      {/* Biometrics */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {t.fingerprintStatus === 'Registered' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <Fingerprint className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Enrolled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Not Enrolled
                          </span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            t.accountStatus === 'Active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {t.accountStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewTeacher(t.id)}
                            title="View Profile"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onOpenBiometricWizard(t)}
                            title="Biometric Setup"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#E5252A] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          >
                            <Fingerprint className="w-4 h-4" />
                          </button>

                          {isSuperAdmin && (
                            <>
                              <button
                                onClick={() => onEditTeacher?.(t)}
                                title="Edit Teacher Profile"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleResetPassword(t)}
                                title="Reset Password"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => onToggleAccountStatus(t.id)}
                            title={t.accountStatus === 'Active' ? 'Suspend Account' : 'Activate Account'}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          >
                            <UserX className="w-4 h-4" />
                          </button>

                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteTeacher(t)}
                              title="Delete Teacher Account"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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

