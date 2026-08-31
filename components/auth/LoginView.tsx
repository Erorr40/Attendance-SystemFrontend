import React, { useState } from 'react';
import {
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
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
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocus, setIsPasswordFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

      if (response.user && (response.success || response.token)) {
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
    <div className="min-h-screen h-screen w-full bg-gradient-to-br from-slate-100 via-rose-50/20 to-slate-200 dark:from-[#070A11] dark:via-[#0F172A] dark:to-[#170E1A] flex items-center justify-center relative overflow-hidden font-sans transition-colors duration-200 p-0 m-0">
      {/* Liquid Mesh Background Glows */}
      <div className="absolute top-1/4 -left-20 w-[30rem] h-[30rem] bg-[#E5252A]/15 dark:bg-[#E5252A]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-[32rem] h-[32rem] bg-rose-500/10 dark:bg-purple-950/20 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute top-10 right-1/4 w-80 h-80 bg-blue-500/10 dark:bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Background Animated Tech Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#E5252A_1px,transparent_1px)] dark:bg-[radial-gradient(#E5252A_1px,transparent_1px)] [background-size:32px_32px] opacity-15 dark:opacity-10 pointer-events-none" />

      {/* Main Full-screen Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full h-full min-h-screen bg-white/70 dark:bg-gray-900/80 backdrop-blur-2xl border-0 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 transition-colors"
      >
        {/* Left Column: Elsewedy Brand Identity */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1C252A] via-[#263238] to-[#12181B] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-800">
          {/* Ambient Laser Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E5252A] to-transparent shadow-[0_0_15px_#E5252A]" />

          <div>
            <div className="flex items-center justify-between mb-8 sm:mb-12">
              <ElsewedyLogo
                variant="white"
                size="lg"
                showSubtitle={true}
                subtitleText="FACULTY ATTENDANCE SYSTEM"
                withShine={true}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Institutional <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E5252A] to-rose-400">
                  Attendance & Access
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md">
                Official faculty attendance portal for Elswedy International Applied Technology Schools.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <span>Elsewedy Technical Education</span>
            <span className="font-mono text-gray-400">v2.8.4</span>
          </div>
        </div>

        {/* Right Column: Sign In Form */}
        <div className="lg:col-span-7 p-6 sm:p-12 lg:p-16 flex flex-col justify-between bg-white/80 dark:bg-gray-900/90 backdrop-blur-md transition-colors relative overflow-y-auto">
          <div className="max-w-md w-full mx-auto my-auto py-6">
            {/* Mascot */}
            <div className="flex justify-center mb-4">
              <LiquidCloudMascot isPasswordFocus={isPasswordFocus} />
            </div>

            {/* Header */}
            <div className="mb-6 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-black text-[#263238] dark:text-white">
                Sign In to Portal
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter your institutional credentials to access your account.
              </p>
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
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="e.g. username or name@elswedy-schools.edu.eg"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-xs font-semibold text-[#263238] dark:text-white focus:bg-white dark:focus:bg-gray-700 focus:outline-hidden focus:border-[#E5252A] dark:focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#263238] dark:text-gray-200">
                    Account Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
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
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
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
                  <span>Remember me / Remember my credentials</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('For institutional password reset, please contact H.Admin (Eng. Ahmed Rafat).');
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

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center text-[11px] text-gray-400 dark:text-gray-500">
            <span>Elsewedy Technical Education Portal</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
