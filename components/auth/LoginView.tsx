import React, { useState } from 'react';
import {
  Lock,
  User,
  Shield,
  Fingerprint,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  Users,
  Terminal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ElsewedyLogo } from '../common/ElsewedyLogo.tsx';
import { LiquidCloudMascot } from './LiquidCloudMascot.tsx';
import { api } from '../../services/api.ts';
import { User as UserType } from '../../types/index.ts';

interface LoginViewProps {
  onLoginSuccess: (user: UserType, token: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('hr_admin');
  const [password, setPassword] = useState('elswedy@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocus, setIsPasswordFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeDemoTab, setActiveDemoTab] = useState<'hr_admin' | 'board' | 'employee'>('hr_admin');

  // Quick preset accounts for the 3 official roles
  const demoAccounts = [
    {
      role: 'hr_admin' as const,
      label: '📋 HR (Full Administrative Access)',
      subtitle: 'Complete access to manage faculty, attendance & settings',
      username: 'hr_admin',
      pass: 'elswedy@2026',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
    },
    {
      role: 'board' as const,
      label: '🏛️ Board (Read-Only Executive View)',
      subtitle: 'Full system visibility, no edits allowed, passwords masked',
      username: 'board',
      pass: 'board@2026',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      role: 'employee' as const,
      label: '👨‍🏫 Employee (Faculty Portal)',
      subtitle: 'Personal attendance ledger, schedule & leave requests',
      username: 'employee',
      pass: 'emp@2026',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
  ];

  const handleSelectDemo = (acc: typeof demoAccounts[0]) => {
    setActiveDemoTab(acc.role);
    setUsernameOrEmail(acc.username);
    setPassword(acc.pass);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMsg('Please enter your institutional username/email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.login({
        usernameOrEmail: usernameOrEmail.trim(),
        password: password.trim(),
      });

      if (response.success && response.user) {
        onLoginSuccess(response.user, response.token);
      } else {
        setErrorMsg('Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid institutional credentials or password. Attempt logged.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-rose-50/20 to-slate-200 dark:from-[#070A11] dark:via-[#0F172A] dark:to-[#170E1A] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans transition-colors duration-200">
      {/* Liquid Mesh Background Glows */}
      <div className="absolute top-1/4 -left-20 w-[30rem] h-[30rem] bg-[#E5252A]/15 dark:bg-[#E5252A]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-[32rem] h-[32rem] bg-rose-500/10 dark:bg-purple-950/20 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute top-10 right-1/4 w-80 h-80 bg-blue-500/10 dark:bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Background Animated Tech Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#E5252A_1px,transparent_1px)] dark:bg-[radial-gradient(#E5252A_1px,transparent_1px)] [background-size:32px_32px] opacity-15 dark:opacity-10 pointer-events-none" />

      {/* Main Liquid Glass Container */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-5xl bg-white/70 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_25px_65px_rgba(0,0,0,0.7)] border border-white/80 dark:border-gray-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 transition-colors"
      >
        {/* Left Column: Elsewedy Brand Identity & Live Biometric Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1C252A] via-[#263238] to-[#12181B] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-800">
          {/* Subtle Ambient Laser Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E5252A] to-transparent shadow-[0_0_15px_#E5252A]" />

          <div>
            <div className="flex items-center justify-between mb-8">
              <ElsewedyLogo
                variant="dark"
                size="lg"
                showSubtitle={true}
                subtitleText="FACULTY ATTENDANCE SYSTEM"
                withShine={true}
              />
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Enterprise Biometric Security</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Institutional <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E5252A] to-rose-400">
                  Attendance & Access
                </span>
              </h2>

              <p className="text-xs text-gray-300 leading-relaxed">
                Integrated real-time biometric management with strict Role-Based Access Control (RBAC), H.Admin credential auditing, and turnstile synchronization.
              </p>
            </div>
          </div>

          {/* Biometric Interactive Status Feature */}
          <div className="my-8 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                  <Fingerprint className="w-4 h-4 text-[#E5252A] animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Live Hardware Gateways</p>
                  <p className="text-[10px] text-gray-400 font-mono">3 Turnstiles Online</p>
                </div>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-gray-400 block">Gate 01</span>
                <span className="text-emerald-400 font-bold">192.168.10.201</span>
              </div>
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-gray-400 block">Gate 02</span>
                <span className="text-emerald-400 font-bold">192.168.10.202</span>
              </div>
              <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-gray-400 block">Gate 03</span>
                <span className="text-emerald-400 font-bold">192.168.10.203</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
            <span>Elsewedy Technical Education</span>
            <span className="font-mono text-gray-500 dark:text-gray-400">v2.8.4</span>
          </div>
        </div>

        {/* Right Column: Sign In Form & Quick Demo Role Switcher */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white/80 dark:bg-gray-900/90 backdrop-blur-md transition-colors relative">
          <div>
            {/* Liquid Glass Animated Cloud Mascot */}
            <div className="flex justify-center mb-3">
              <LiquidCloudMascot isPasswordFocus={isPasswordFocus} />
            </div>

            {/* Header */}
            <div className="mb-5 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-black text-[#263238] dark:text-white">
                Sign In to Portal
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter your institutional credentials or choose a pre-configured role below.
              </p>
            </div>

            {/* Quick Demo Switcher Cards */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5252A] dark:text-red-400" />
                  Quick Demo Accounts (1-Click Fill)
                </label>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 dark:text-gray-400">Select any role to test</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoAccounts.map((acc) => {
                  const isSelected = activeDemoTab === acc.role;
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleSelectDemo(acc)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#E5252A] dark:border-red-500 bg-red-50/50 dark:bg-red-950/30 shadow-xs'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50/70 dark:hover:bg-gray-700/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#263238] dark:text-gray-100">
                          {acc.label}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E5252A] dark:text-red-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                        {acc.subtitle}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-[9px] font-mono text-gray-400 dark:text-gray-500 dark:text-gray-400">
                        <span>User: <strong className="text-gray-700 dark:text-gray-300">{acc.username}</strong></span>
                        <span>•</span>
                        <span>Pass: <strong className="text-gray-700 dark:text-gray-300">{acc.pass}</strong></span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-[#E5252A] dark:text-red-400 flex items-start gap-2.5 text-xs font-medium"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Access Verification Failed</p>
                    <p className="text-[11px] mt-0.5 leading-relaxed">{errorMsg}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#263238] dark:text-gray-200 mb-1.5">
                  Institutional Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="e.g. superadmin or ahmed.hassan@elswedy-schools.edu.eg"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-xs font-semibold text-[#263238] dark:text-white focus:bg-white dark:bg-gray-800 dark:focus:bg-gray-700 focus:outline-hidden focus:border-[#E5252A] dark:focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#263238] dark:text-gray-200">
                    Account Password
                  </label>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 dark:text-gray-400 font-mono">
                    Audited with IP
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 dark:text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocus(true)}
                    onBlur={() => setIsPasswordFocus(false)}
                    placeholder="Enter institutional password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-xs font-semibold text-[#263238] dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:outline-hidden focus:border-[#E5252A] dark:focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-[#E5252A] focus:ring-red-500 dark:focus:ring-red-500/50"
                  />
                  <span>Remember my terminal session</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('For institutional password reset, please contact H.Admin (Eng. Ahmed Rafat). All attempts are logged.');
                  }}
                  className="text-xs text-[#E5252A] dark:text-red-400 hover:underline font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-[#B30F13] via-[#E5252A] to-[#E5252A] hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-red-500/25 dark:shadow-red-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 group"
              >
                <div className="absolute inset-0 bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Institutional Access...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Attendance Portal</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400 dark:text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
              <span>TLS 1.3 256-bit Encrypted</span>
            </span>
            <span>Elsewedy Technical Education Portal</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
