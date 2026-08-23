import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, CheckCircle2 } from 'lucide-react';

interface WelcomeSplashScreenProps {
  userName?: string;
  userRoleTitle?: string;
  onComplete?: () => void;
  durationMs?: number;
}

export const WelcomeSplashScreen: React.FC<WelcomeSplashScreenProps> = ({
  userName = 'Eng. Ahmed Rafat',
  userRoleTitle = 'Super Administrator',
  onComplete,
  durationMs = 2300,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, onComplete]);

  const handleSkip = () => {
    setVisible(false);
    if (onComplete) onComplete();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 select-none overflow-hidden cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #070a11 0%, #0c101c 50%, #15090a 100%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          onClick={handleSkip}
        >
          {/* Subtle Ambient Red Glow Effects */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-[#E5252A]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(#E5252A_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

          {/* Institutional Badge Icon */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: 'backOut' }}
            className="mb-6 relative"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#B31015] via-[#E5252A] to-[#FF5A5F] p-0.5 shadow-[0_0_40px_rgba(229,37,42,0.4)] flex items-center justify-center">
              <div className="w-full h-full bg-[#0C101C] rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <Shield className="w-10 h-10 text-[#E5252A]" />
                <Sparkles className="w-4 h-4 text-amber-400 absolute top-2 right-2 animate-bounce" />
              </div>
            </div>
          </motion.div>

          {/* Welcome Text */}
          <div className="text-center px-4 max-w-lg z-10">
            <motion.h1
              className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2 flex-wrap"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              Hello,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">
                {userName}
              </span>
            </motion.h1>

            <motion.div
              className="inline-flex items-center gap-2 mt-3 px-3.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-semibold"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Elsewedy Technical Academy Portal</span>
              <span className="text-slate-500">•</span>
              <span className="text-red-400 font-bold">{userRoleTitle}</span>
            </motion.div>

            <motion.p
              className="text-xs sm:text-sm text-slate-400 font-light mt-3"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Initializing Biometric AI Engine & Synchronizing Records...
            </motion.p>
          </div>

          {/* Loading Indicator bar */}
          <motion.div
            className="w-48 h-1 bg-slate-800 rounded-full mt-8 overflow-hidden relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-[#E5252A] to-rose-400 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: durationMs / 1000 - 0.4, ease: 'linear', delay: 0.3 }}
            />
          </motion.div>

          <p className="absolute bottom-8 text-xs text-slate-500 hover:text-slate-400 transition-colors">
            Click anywhere to skip
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
