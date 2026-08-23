import React, { useState, useEffect } from 'react';
import { UserCog, KeyRound, Shield, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal.tsx';
import { Department, Schedule, Teacher, UserRole } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  departments: Department[];
  schedules: Schedule[];
  currentRole?: UserRole;
  adminName?: string;
  onTeacherUpdated: (updatedTeacher: Teacher) => void;
}

export const EditTeacherModal: React.FC<EditTeacherModalProps> = ({
  isOpen,
  onClose,
  teacher,
  departments = [],
  schedules = [],
  currentRole = 'hr_admin',
  adminName = 'Super Admin',
  onTeacherUpdated,
}) => {
  const safeDepts = Array.isArray(departments) ? departments : [];
  const safeSchedules = Array.isArray(schedules) ? schedules : [];

  const [fullName, setFullName] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>(safeDepts[0]?.id || '');
  const [position, setPosition] = useState<string>('Instructor');
  const [scheduleId, setScheduleId] = useState<string>(safeSchedules[0]?.id || '');
  const [accountStatus, setAccountStatus] = useState<'Active' | 'Suspended'>('Active');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (teacher && isOpen) {
      setFullName(teacher.fullName || '');
      setEmployeeId(teacher.employeeId || '');
      setEmail(teacher.email || '');
      setUsername(teacher.username || teacher.email?.split('@')[0] || '');
      setPassword(teacher.plainPassword || '');
      setPhone(teacher.phone || '');
      setDepartmentId(teacher.departmentId || safeDepts[0]?.id || '');
      setPosition(teacher.position || 'Instructor');
      setScheduleId(teacher.scheduleId || safeSchedules[0]?.id || '');
      setAccountStatus(teacher.accountStatus || 'Active');
      setErrorMsg(null);
    }
  }, [teacher, isOpen]);

  if (!isOpen || !teacher) return null;

  const generateRandomPassword = () => {
    const lastName = fullName.split(' ').pop() || 'Teacher';
    const cleanLast = lastName.replace(/[^a-zA-Z]/g, '') || 'Faculty';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const pass = `ELS#${cleanLast}${randNum}!`;
    setPassword(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Full Name and Email are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const updated = await api.updateTeacher(teacher.id, {
        fullName: fullName.trim(),
        employeeId: employeeId.trim() || undefined,
        email: email.trim(),
        username: username.trim(),
        plainPassword: password.trim() || undefined,
        phone: phone.trim() || undefined,
        departmentId,
        position,
        scheduleId,
        accountStatus,
        adminName,
      });

      onTeacherUpdated(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update teacher account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Faculty Member & Credentials"
      subtitle={`SuperAdmin Management: Updating profile for ${teacher.fullName}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Role Banner */}
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong className="text-purple-800">SuperAdmin Privileged Access:</strong>
            <p className="text-gray-600 mt-0.5">
              You have full permission to modify faculty profile data, department assignments, shift schedules, account status, and credentials.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Employee ID
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Institutional Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
          </div>
        </div>

        {/* Credentials Configuration */}
        <div className="p-3.5 bg-purple-50/40 border border-purple-200 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-[#263238] dark:text-white uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5 text-purple-600" />
              <span>Portal Credentials & Password</span>
            </div>
            <button
              type="button"
              onClick={generateRandomPassword}
              className="text-[10px] text-purple-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              Generate Secure Password
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Portal Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Account Password (Plaintext / HR Restricted)
              </label>
              {currentRole === 'hr_admin' ? (
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 pr-8 font-mono text-purple-900 dark:text-purple-300 font-bold focus:outline-hidden focus:border-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <div className="w-full bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-gray-400 dark:text-gray-400 font-mono text-xs flex items-center justify-between">
                  <span>•••••••••••• (Protected)</span>
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Department, Position & Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            >
              {safeDepts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Position / Title
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Shift Schedule
            </label>
            <select
              value={scheduleId}
              onChange={(e) => setScheduleId(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            >
              {safeSchedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Account Status */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Account Status
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="accountStatus"
                value="Active"
                checked={accountStatus === 'Active'}
                onChange={() => setAccountStatus('Active')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="accountStatus"
                value="Suspended"
                checked={accountStatus === 'Suspended'}
                onChange={() => setAccountStatus('Suspended')}
                className="text-rose-600 focus:ring-rose-500"
              />
              <span>Suspended (Access Revoked)</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 hover:bg-gray-50 dark:bg-gray-800/50 font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Changes...' : 'Save Teacher Updates'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
