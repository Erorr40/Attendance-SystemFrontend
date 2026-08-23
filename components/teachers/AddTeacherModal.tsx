import React, { useState } from 'react';
import { UserPlus, Fingerprint, CheckCircle2, AlertCircle, KeyRound, Sparkles, Shield, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../common/Modal.tsx';
import { Department, Schedule, Teacher, FingerprintDevice, UserRole } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  schedules: Schedule[];
  devices: FingerprintDevice[];
  currentRole?: UserRole;
  adminName?: string;
  onTeacherCreated: (teacher: Teacher) => void;
}

export const AddTeacherModal: React.FC<AddTeacherModalProps> = ({
  isOpen,
  onClose,
  departments = [],
  schedules = [],
  devices = [],
  currentRole = 'hr_admin',
  adminName = 'HR / Admin',
  onTeacherCreated,
}) => {
  const safeDepts = Array.isArray(departments) ? departments : [];
  const safeSchedules = Array.isArray(schedules) ? schedules : [];
  const safeDevices = Array.isArray(devices) ? devices : [];

  const [fullName, setFullName] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>(safeDepts[0]?.id || 'dept-1');
  const [position, setPosition] = useState<string>('Instructor');
  const [scheduleId, setScheduleId] = useState<string>(safeSchedules[0]?.id || 'sch-standard');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [nationalId, setNationalId] = useState<string>('');
  const [registerFingerprintNow, setRegisterFingerprintNow] = useState<boolean>(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(safeDevices[0]?.id || 'dev-gate-01');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const generateRandomPassword = () => {
    const lastName = fullName.split(' ').pop() || 'Teacher';
    const cleanLast = lastName.replace(/[^a-zA-Z]/g, '') || 'Faculty';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const pass = `ELS#${cleanLast}${randNum}!`;
    setPassword(pass);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!username && val.includes('@')) {
      setUsername(val.split('@')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Full Name and Institutional Email are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const newTeacher = await api.createTeacher({
        fullName: fullName.trim(),
        employeeId: employeeId.trim() || undefined,
        email: email.trim(),
        username: username.trim() || (email.includes('@') ? email.split('@')[0] : `user.${Date.now().toString(36)}`),
        password: password.trim() || undefined,
        plainPassword: password.trim() || undefined,
        phone: phone.trim() || '+20 100 000 0000',
        nationalId: nationalId.trim() || undefined,
        departmentId,
        position,
        scheduleId,
        gender,
        registerFingerprintNow,
        deviceId: selectedDeviceId,
        adminName,
        adminRole: currentRole,
      });

      onTeacherCreated(newTeacher);
      onClose();
      // Reset
      setFullName('');
      setEmployeeId('');
      setEmail('');
      setUsername('');
      setPassword('');
      setPhone('');
      setNationalId('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create teacher account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Faculty Member"
      subtitle="Register teacher profile and provision institutional biometric credentials"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Role Notification Banner */}
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong className="text-amber-800">HR Privacy & Security Policy:</strong>
            <p className="text-gray-600 mt-0.5">
              {currentRole === 'hr_admin'
                ? 'As H.Admin (Super Admin), you can configure and later reveal/reset passwords for any teacher.'
                : 'As HR, you can provision the initial account password. Once submitted, the password will be encrypted and hidden from HR. Only H.Admin can view plain faculty passwords.'}
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Eng. Karim Soliman"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
              Employee ID (Auto-generated if empty)
            </label>
            <input
              type="text"
              placeholder="e.g. ELS-T-1045"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="teacher@elswedy-schools.edu.eg"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+20 100 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
          </div>
        </div>

        {/* Credentials Configuration */}
        <div className="p-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-[#263238] dark:text-white uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5 text-[#E5252A]" />
              <span>Initial Login Credentials</span>
            </div>
            <button
              type="button"
              onClick={generateRandomPassword}
              className="text-[10px] text-[#E5252A] hover:underline font-bold flex items-center gap-1 cursor-pointer"
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
                placeholder="e.g. karim.soliman"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Initial Account Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Auto-generated if blank"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 pr-8 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Department & Position */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
              Applied Tech Department *
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            >
              {safeDepts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
              Academic Position
            </label>
            <input
              type="text"
              placeholder="e.g. Senior AI Lab Instructor"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
          </div>
        </div>

        {/* Schedule & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
              Assigned Work Shift Schedule
            </label>
            <select
              value={scheduleId}
              onChange={(e) => setScheduleId(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            >
              {safeSchedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        {/* Biometric Section */}
        <div className="p-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-[#E5252A]" />
              <span className="font-bold text-[#263238] dark:text-white uppercase tracking-wider">
                Fingerprint Registration
              </span>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={registerFingerprintNow}
                onChange={(e) => setRegisterFingerprintNow(e.target.checked)}
                className="w-4 h-4 text-[#E5252A] rounded border-gray-300 focus:ring-[#E5252A]"
              />
              <span className="font-semibold text-gray-700 dark:text-gray-300">Enroll Biometrics Instantly</span>
            </label>
          </div>

          {registerFingerprintNow && (
            <div className="pt-2 border-t border-gray-200/80">
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Active Scanner Device:
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
              >
                {safeDevices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.location})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                Biometric token will be synchronized immediately to all 3 entrance gate terminals.
              </p>
            </div>
          )}
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
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 hover:bg-gray-50 dark:bg-gray-800/50 font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#E5252A] hover:bg-[#D01B20] text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Create Teacher Account'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

