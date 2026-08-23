import React, { useState, useRef } from 'react';
import {
  User,
  Camera,
  Upload,
  Shield,
  KeyRound,
  Phone,
  Mail,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Image as ImageIcon,
  Check,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType, UserRole, Teacher } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface ProfileViewProps {
  currentUser: UserType;
  currentRole: UserRole;
  onUpdateUser: (updatedUser: UserType) => void;
  onOpenLiveScanner?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  currentRole,
  onUpdateUser,
  onOpenLiveScanner,
}) => {
  const [name, setName] = useState(currentUser.name || 'Eng. Ahmed Hassan');
  const [phone, setPhone] = useState(currentUser.phone || '+20 100 458 9123');
  const [avatar, setAvatar] = useState(
    currentUser.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset institutional avatars for quick selection
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  ];

  // Handle local photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSaveErrorMsg('Photo size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAvatar(event.target.result);
        setSaveSuccessMsg('New photo selected! Click "Save Profile Changes" to apply.');
        setSaveErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    if (newPassword && newPassword !== confirmPassword) {
      setSaveErrorMsg('New password and confirmation do not match.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await api.updateProfile({
        userId: currentUser.id,
        role: currentRole,
        name: name.trim(),
        phone: phone.trim(),
        avatar,
        newPassword: newPassword.trim() ? newPassword.trim() : undefined,
        email: currentUser.email,
        teacherId: currentUser.teacherId,
      });

      if (response.success && response.user) {
        onUpdateUser({
          ...currentUser,
          ...response.user,
          avatar,
          name,
          phone,
        });
        setSaveSuccessMsg('Profile and institutional credentials updated successfully! Action logged.');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
      }
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const roleTitle =
    currentRole === 'hr_admin'
      ? 'Senior HR & Attendance Administrator'
      : currentRole === 'board'
      ? 'Board Executive Observer'
      : 'Faculty Instructor / Employee';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner with High-Tech Glow */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1C252A] via-[#263238] to-[#12181B] p-6 sm:p-8 text-white border border-gray-800 shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E5252A] to-transparent shadow-[0_0_12px_#E5252A]" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar with Camera Overlay */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#E5252A] shadow-lg shadow-red-500/20 bg-gray-800">
              <img
                src={avatar}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#E5252A] hover:bg-[#B30F13] text-white shadow-md transition-transform hover:scale-110 cursor-pointer flex items-center justify-center"
              title="Upload New Profile Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {/* Profile Basic Info */}
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {name}
              </h2>
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                {currentRole === 'hr_admin' ? '📋 HR (Full Access)' : currentRole === 'board' ? '🏛️ Board (Read-Only)' : '👨‍🏫 Employee'}
              </span>
            </div>

            <p className="text-xs text-gray-300 mt-1 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              <span>{roleTitle}</span>
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span className="font-mono text-gray-300">{currentUser.email || 'user@elswedy-schools.edu.eg'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span className="font-mono text-gray-300">{phone}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Biometrics Active
              </span>
            </div>
          </div>

          {onOpenLiveScanner && (
            <button
              onClick={onOpenLiveScanner}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/10 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 self-center sm:self-start"
            >
              <Fingerprint className="w-4 h-4 text-[#E5252A]" />
              <span>Test Terminal</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications / Alerts */}
      <AnimatePresence>
        {saveSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-xs font-semibold shadow-2xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </motion.div>
        )}

        {saveErrorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-red-50 border border-red-200 text-[#E5252A] flex items-center gap-3 text-xs font-semibold shadow-2xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveErrorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal Info & Avatar Selection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Avatar Customization */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#E5252A]" />
                <h3 className="text-sm font-bold text-[#263238] dark:text-white">Profile Photo & Avatar</h3>
              </div>
              <span className="text-[11px] text-gray-400">JPG, PNG, GIF up to 5MB</span>
            </div>

            {/* Custom Photo Upload Button */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#263238] dark:text-white mb-2">
                Upload Custom Photo
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-[#E5252A] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-red-50/20 group"
              >
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#E5252A] mx-auto mb-1 transition-colors" />
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-[#E5252A]">
                  Click to select photo from device
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Drag and drop image or click to browse
                </p>
              </div>
            </div>

            {/* Preset Avatars */}
            <div>
              <label className="block text-xs font-bold text-[#263238] dark:text-white mb-2">
                Or Select from Institutional Avatars
              </label>
              <div className="grid grid-cols-6 gap-2 sm:gap-3">
                {avatarPresets.map((presetUrl, idx) => {
                  const isSelected = avatar === presetUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(presetUrl);
                        setSaveSuccessMsg('Preset avatar selected! Click "Save Profile Changes" to apply.');
                      }}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#E5252A] ring-2 ring-red-200 scale-105 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={presetUrl}
                        alt={`Preset ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#E5252A]/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Personal Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <User className="w-4 h-4 text-[#E5252A]" />
              <h3 className="text-sm font-bold text-[#263238] dark:text-white">Personal & Contact Details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#263238] dark:text-white mb-1.5">
                  Full Name (English / Official)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A] focus:ring-2 focus:ring-red-100"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#263238] dark:text-white mb-1.5">
                    Institutional Email (Read Only)
                  </label>
                  <input
                    type="email"
                    value={currentUser.email || 'user@elswedy-schools.edu.eg'}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100/70 text-xs font-mono text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#263238] dark:text-white mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A] focus:ring-2 focus:ring-red-100"
                    placeholder="+20 100 000 0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#263238] dark:text-white mb-1.5">
                  Institutional Role & Access Level
                </label>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs flex items-center justify-between">
                  <span className="font-bold text-[#263238] dark:text-white">{roleTitle}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 font-bold uppercase">
                    {currentRole}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security, Password & Biometric Status */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 3: Change Password */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#E5252A]" />
                <h3 className="text-sm font-bold text-[#263238] dark:text-white">Security & Password</h3>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">Encrypted</span>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#263238] dark:text-white mb-1">
                  New Password (Optional)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full px-3.5 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A] focus:ring-2 focus:ring-red-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {newPassword && (
                <div>
                  <label className="block text-xs font-bold text-[#263238] dark:text-white mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A] focus:ring-2 focus:ring-red-100"
                  />
                </div>
              )}

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                <p className="font-bold flex items-center gap-1 text-amber-800">
                  <Shield className="w-3.5 h-3.5" />
                  Institutional Security Policy:
                </p>
                <p className="mt-1 text-gray-600">
                  {currentRole === 'hr_admin'
                    ? 'As HR Admin, you have authority to audit and reveal all faculty passwords.'
                    : currentRole === 'board'
                    ? 'As Board Executive, passwords remain encrypted & masked.'
                    : 'Your password secures your attendance records and leave management submissions.'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Biometric Turnstile Sync Status */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-[#E5252A]" />
                <h3 className="text-sm font-bold text-[#263238] dark:text-white">Campus Hardware Sync</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                Synchronized
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Gate 01 (Main Admin Entrance)</span>
                </div>
                <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">Synced 100%</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Gate 02 (Engineering Labs)</span>
                </div>
                <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">Synced 100%</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Gate 03 (Workshops & Robotics)</span>
                </div>
                <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">Synced 100%</span>
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full relative overflow-hidden py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#B30F13] via-[#E5252A] to-[#E5252A] hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 group"
          >
            <div className="absolute inset-0 bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Changes & Logging Audit...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
