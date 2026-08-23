import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Sparkles, Shield, Wifi, CheckCircle2 } from 'lucide-react';
import { ElsewedyLogo } from './ElsewedyLogo.tsx';

interface ElsewedyIntroLoaderProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export const ElsewedyIntroLoader: React.FC<ElsewedyIntroLoaderProps> = ({
  onComplete,
  minDurationMs = 2800,
}) => {
  const [phase, setPhase] = useState<'laser' | 'flare' | 'reveal' | 'ready'>('laser');
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('INITIALIZING BIOMETRIC CORE...');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation timeline sequence
  useEffect(() => {
    // Stage 1: Curved laser trace (0ms - 700ms)
    const t1 = setTimeout(() => {
      setPhase('flare');
      setStatusText('CONNECTING CAMPUS BIOMETRIC GATES...');
    }, 700);

    // Stage 2: Horizontal light sweep & Logo Reveal (700ms - 1500ms)
    const t2 = setTimeout(() => {
      setPhase('reveal');
      setStatusText('SYNCHRONIZING FACULTY ATTENDANCE LEDGER...');
    }, 1400);

    // Stage 3: Ready state & final shine (2300ms)
    const t3 = setTimeout(() => {
      setPhase('ready');
      setStatusText('FACULTY SYSTEM ONLINE • ACCESS GRANTED');
    }, 2300);

    // Stage 4: Finish and dismiss
    const t4 = setTimeout(() => {
      onComplete();
    }, minDurationMs);

    // Progress counter animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 4 + 2);
      });
    }, 45);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearInterval(interval);
    };
  }, [minDurationMs, onComplete]);

  // Ambient particle canvas effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Spark particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
    }> = [];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 1.5 - 0.2,
        size: Math.random() * 2.5 + 0.8,
        alpha: Math.random() * 0.7 + 0.2,
        color: Math.random() > 0.3 ? '#E5252A' : '#FF6B6F',
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#E5252A';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.6, ease: 'easeInOut' } }}
      className="fixed inset-0 z-50 bg-[#050608] flex flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* Background Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-60" />

      {/* Deep Crimson Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(229,37,42,0.18)_0%,rgba(5,6,8,0.95)_70%)] pointer-events-none" />

      {/* Cyber Grid Lines Background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#E5252A 1px, transparent 1px), linear-gradient(90deg, #E5252A 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Stage 1: Curved Red Laser Energy Trace Animation (Matching video arc) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 800 400" className="w-[600px] h-[300px] max-w-full overflow-visible">
          <defs>
            <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#FF383E" />
              <stop offset="100%" stopColor="#E5252A" />
            </linearGradient>
            <filter id="laserGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Curved glowing energy path matching the video arc */}
          <motion.path
            d="M 320 230 C 290 190, 310 130, 370 120 C 440 110, 480 160, 430 210 C 370 270, 300 230, 480 200"
            fill="none"
            stroke="url(#laserGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#laserGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 1],
              opacity: [0, 1, 0],
              transition: { duration: 1.3, times: [0, 0.6, 1], ease: 'easeInOut' },
            }}
          />

          {/* Glowing spark head following the curve */}
          <motion.circle
            cx="400"
            cy="200"
            r="6"
            fill="#FFFFFF"
            filter="url(#laserGlow)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1.8, 1, 0],
              transition: { duration: 1.2, times: [0, 0.2, 0.7, 1] },
            }}
          />
        </svg>
      </div>

      {/* Stage 2: Horizontal Flare Sweep Across Center (Matching video white-red light beam) */}
      {(phase === 'flare' || phase === 'reveal' || phase === 'ready') && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0.1 }}
          animate={{
            opacity: [0, 1, 0.8, 0.2],
            scaleX: [0.1, 1.4, 1.8, 2.2],
            transition: { duration: 1.2, ease: 'easeOut' },
          }}
          className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none shadow-[0_0_20px_#E5252A,0_0_40px_#FF383E]"
        >
          {/* Intense center light ball */}
          <motion.div
            initial={{ left: '10%', opacity: 0 }}
            animate={{
              left: ['20%', '50%', '80%'],
              opacity: [0, 1, 0],
              transition: { duration: 0.9, ease: 'easeInOut' },
            }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-24 h-24 bg-white dark:bg-gray-800 rounded-full blur-md shadow-[0_0_50px_#E5252A,0_0_100px_#FF383E]"
          />
        </motion.div>
      )}

      {/* Main Center Logo & Reveal Stage */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg">
        {/* Holographic Circular Circuit Ring */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, rotate: -45 }}
          animate={{
            scale: phase !== 'laser' ? 1 : 0.7,
            opacity: phase !== 'laser' ? 1 : 0,
            rotate: 0,
            transition: { duration: 0.8, ease: 'easeOut' },
          }}
          className="relative mb-6"
        >
          {/* Outer rotating pulse ring */}
          <div className="absolute -inset-6 rounded-full border border-red-500/20 animate-spin pointer-events-none" style={{ animationDuration: '14s' }} />
          <div className="absolute -inset-10 rounded-full border border-dashed border-red-500/15 pointer-events-none" />

          {/* Logo Card with Deep Dark Glass Backing */}
          <div className="relative px-8 py-6 rounded-2xl bg-black/60 border border-red-500/30 backdrop-blur-xl shadow-[0_0_40px_rgba(229,37,42,0.25)] overflow-hidden">
            {/* Shimmer flare passing across logo */}
            <motion.div
              initial={{ x: '-150%' }}
              animate={{
                x: phase === 'reveal' || phase === 'ready' ? '200%' : '-150%',
                transition: { duration: 1.2, ease: 'easeInOut', delay: 0.2 },
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
            />

            {/* Official ELSEWEDY Logo with Glow */}
            <ElsewedyLogo
              variant="dark"
              size="xl"
              showSubtitle={true}
              subtitleText="FACULTY BIOMETRIC ATTENDANCE"
              withGlow={true}
              withShine={true}
            />
          </div>
        </motion.div>

        {/* School Academy Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: phase !== 'laser' ? 1 : 0,
            y: phase !== 'laser' ? 0 : 10,
            transition: { duration: 0.5, delay: 0.3 },
          }}
          className="space-y-1"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-red-500" />
            <p className="text-xs sm:text-sm font-bold tracking-widest text-red-500 uppercase">
              Integrated Advanced Technical School
            </p>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-red-500" />
          </div>
          <p className="text-[11px] text-gray-400 font-mono tracking-wider">
            Automated Turnstiles & Institutional Facial / Fingerprint Verification
          </p>
        </motion.div>

        {/* Biometric Progress Bar & Alive Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: phase !== 'laser' ? 1 : 0,
            scale: 1,
            transition: { duration: 0.5, delay: 0.5 },
          }}
          className="w-full max-w-sm mt-8 space-y-2.5"
        >
          {/* Status Text with Live Dot */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-gray-300 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              {statusText}
            </span>
            <span className="font-mono font-extrabold text-red-500">{progress}%</span>
          </div>

          {/* Glowing Progress Track */}
          <div className="w-full h-1.5 bg-gray-800/80 rounded-full overflow-hidden p-0.5 border border-red-500/20">
            <motion.div
              className="h-full bg-gradient-to-r from-[#B30F13] via-[#E5252A] to-[#FF5A5F] rounded-full shadow-[0_0_12px_#E5252A]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>

          {/* Bottom Security / System Badges */}
          <div className="pt-3 flex items-center justify-center gap-4 text-[10px] text-gray-400 font-mono">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-red-500" /> 256-bit AES
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-emerald-400" /> Gates 01/02/03 Sync
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Fingerprint className="w-3 h-3 text-red-400" /> Hardware Live
            </span>
          </div>
        </motion.div>
      </div>

      {/* Skip Button */}
      <button
        onClick={onComplete}
        className="absolute bottom-6 right-6 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-xs font-mono transition-all cursor-pointer z-20 backdrop-blur-xs"
      >
        Skip Intro ➔
      </button>
    </motion.div>
  );
};
