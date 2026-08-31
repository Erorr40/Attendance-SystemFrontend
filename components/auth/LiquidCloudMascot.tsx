import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface LiquidCloudMascotProps {
  isPasswordFocus: boolean;
  className?: string;
}

export const LiquidCloudMascot: React.FC<LiquidCloudMascotProps> = ({
  isPasswordFocus,
  className = '',
}) => {
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  // Track mouse coordinates
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Compute smooth eye pupil translation based on cursor relative offset
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const offsetX = (cursor.x / window.innerWidth - 0.5) * 14;
    const offsetY = (cursor.y / window.innerHeight - 0.5) * 10;
    setEyePos({ x: offsetX, y: offsetY });
  }, [cursor]);

  // Periodic natural blink
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 3600);
    return () => clearInterval(interval);
  }, []);

  const isEyesClosed = isPasswordFocus || blink;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Floating Liquid Glass Cloud Container */}
      <motion.div
        animate={{
          y: isPasswordFocus ? [0, 4, 0] : [0, -8, 0],
          rotate: isPasswordFocus ? [-1, 1, -1] : [-1.5, 1.5, -1.5],
        }}
        transition={{
          duration: isPasswordFocus ? 2.5 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-48 sm:w-56 h-28 sm:h-32 flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(229,37,42,0.25)] dark:drop-shadow-[0_12px_28px_rgba(0,0,0,0.6)]"
      >
        {/* SVG Liquid Glass Cloud Body */}
        <svg
          viewBox="0 0 240 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Main Liquid Glass Gradient */}
            <linearGradient id="cloudGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#F8FAFC" stopOpacity="0.6" />
              <stop offset="75%" stopColor="#E2E8F0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.7" />
            </linearGradient>

            {/* Dark Mode Liquid Glass Gradient */}
            <linearGradient id="cloudGlassGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#1E293B" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.9" />
            </linearGradient>

            {/* Red Elsewedy Liquid Accent Glow Gradient */}
            <linearGradient id="cloudRedHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF4146" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#E5252A" stopOpacity="0.2" />
            </linearGradient>

            {/* Glossy Liquid Rim Light */}
            <linearGradient id="cloudGlassRim" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#E5252A" stopOpacity="0.4" />
            </linearGradient>

            {/* Shadow for depth */}
            <filter id="cloudSoftShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#1E293B" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Cloud Ambient Outer Glow */}
          <path
            d="M50 85 C30 85 15 70 22 50 C28 32 48 30 58 35 C68 20 95 18 115 30 C130 18 165 20 178 38 C195 38 212 52 208 72 C205 88 188 95 170 92 C150 96 70 96 50 85 Z"
            fill="url(#cloudRedHighlight)"
            className="opacity-40 blur-md transition-all duration-300"
          />

          {/* Main Liquid Cloud Body Shape */}
          <path
            d="M52 88 C32 88 16 72 24 52 C30 34 50 32 60 38 C70 22 98 20 118 32 C134 20 168 22 182 40 C198 40 214 55 210 75 C206 91 190 98 172 95 C152 98 72 98 52 88 Z"
            className="fill-[url(#cloudGlassGrad)] dark:fill-[url(#cloudGlassGradDark)] transition-all duration-300"
            filter="url(#cloudSoftShadow)"
            stroke="url(#cloudGlassRim)"
            strokeWidth="2"
          />

          {/* Glossy Top Liquid Reflection Highlight */}
          <path
            d="M68 36 C78 26 100 24 116 34 C128 26 150 26 162 36 C148 30 128 30 116 38 C100 28 80 30 68 36 Z"
            fill="#FFFFFF"
            fillOpacity="0.65"
          />

          {/* Cheek Blush (Appears cute when closed eyes or idle) */}
          <ellipse
            cx="62"
            cy="68"
            rx="10"
            ry="6"
            className={`fill-[#E5252A] transition-opacity duration-300 ${
              isPasswordFocus ? 'opacity-60' : 'opacity-25'
            }`}
          />
          <ellipse
            cx="172"
            cy="68"
            rx="10"
            ry="6"
            className={`fill-[#E5252A] transition-opacity duration-300 ${
              isPasswordFocus ? 'opacity-60' : 'opacity-25'
            }`}
          />

          {/* Mouth */}
          {isPasswordFocus ? (
            /* Shy Cute "o" or happy mouth when password is being typed */
            <path
              d="M112 70 Q 117 76 122 70"
              stroke="#E5252A"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-300"
            />
          ) : (
            /* Friendly Smile */
            <path
              d="M108 68 Q 117 78 126 68"
              stroke="#263238"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              className="dark:stroke-white transition-all duration-300"
            />
          )}
        </svg>

        {/* Eyes Layer - Absolutely positioned over SVG for smooth animation */}
        <div className="absolute inset-0 flex items-center justify-between px-16 pointer-events-none">
          {['left', 'right'].map((side, idx) => (
            <div
              key={side}
              className="relative flex items-center justify-center transition-all duration-200"
              style={{
                width: 28,
                height: isEyesClosed ? 6 : 32,
                marginTop: 6,
                transform: `translateX(${idx === 0 ? 6 : -6}px)`,
              }}
            >
              {isEyesClosed ? (
                /* Closed Eye Line / Eyelash effect (Shy/Security mode when typing password) */
                <svg
                  viewBox="0 0 28 12"
                  className="w-full h-full overflow-visible transition-all duration-200"
                >
                  <path
                    d="M 2 4 Q 14 12 26 4"
                    stroke="#E5252A"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Cute eyelashes */}
                  <path d="M 6 8 L 3 11" stroke="#E5252A" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 14 9 L 14 13" stroke="#E5252A" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 22 8 L 25 11" stroke="#E5252A" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                /* Open Eye Sockets with Liquid Shine & Moving Pupils */
                <div className="w-7 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 shadow-inner flex items-center justify-center overflow-hidden relative">
                  {/* Pupil */}
                  <div
                    className="w-4 h-4 rounded-full bg-[#1C252A] dark:bg-gray-100 relative flex items-start justify-end p-0.5 transition-transform duration-75 ease-out shadow-xs"
                    style={{
                      transform: `translate(${eyePos.x}px, ${eyePos.y}px)`,
                    }}
                  >
                    {/* Pupil White Reflection Catchlight */}
                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating Badge Indicator below Cloud */}
      <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/80 shadow-xs text-[11px] font-bold text-gray-700 dark:text-gray-300 transition-all">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        {isPasswordFocus ? (
          <span className="text-[#E5252A] dark:text-red-400 font-extrabold flex items-center gap-1">
            🙈 No Peeking! (Privacy Mode)
          </span>
        ) : (
          <span>✨ Attendance Portal</span>
        )}
      </div>
    </div>
  );
};
