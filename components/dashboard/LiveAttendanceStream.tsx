import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, CheckCircle2, AlertTriangle, Clock, ShieldCheck, Activity } from 'lucide-react';
import { AttendanceEvent } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';

interface LiveAttendanceStreamProps {
  events: AttendanceEvent[];
  onOpenScannerModal?: () => void;
}

export const LiveAttendanceStream: React.FC<LiveAttendanceStreamProps> = ({
  events,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between relative overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-700 mb-3">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-sm text-[#263238] dark:text-white">Live Stream</h3>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live Gate Telemetry
            </span>
          </div>
        </div>

        {/* Live Feed List */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {events.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">
              <Fingerprint className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              Waiting for biometric events from turnstile gates...
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {events.map((evt, idx) => {
                const initials = evt.teacherName
                  .split(' ')
                  .slice(-2)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase();

                const isLatest = idx === 0;

                return (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, y: -10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs ${
                      isLatest
                        ? 'border-red-200 dark:border-red-800 bg-red-50/40 dark:bg-red-950/30 shadow-xs ring-2 ring-red-100/50 dark:ring-red-900/30'
                        : 'border-gray-100 dark:border-gray-700/80 hover:border-gray-200 dark:border-gray-700 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-gray-700/40 hover:bg-white dark:bg-gray-800 dark:hover:bg-gray-700/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/60 text-[#E5252A] dark:text-red-400 border border-red-200 dark:border-red-800 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#263238] dark:text-white truncate">{evt.teacherName}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400 truncate">
                          <span className="truncate">{evt.departmentName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-gray-400 dark:text-gray-400">
                            <Fingerprint className="w-3 h-3 text-[#E5252A] dark:text-red-400" />
                            {evt.deviceName.replace('Gate Fingerprint Device ', 'Gate ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 font-mono font-bold text-[#263238] dark:text-white text-xs">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {evt.displayTime}
                      </div>
                      <Badge status={evt.statusCalculated} size="sm" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 dark:text-gray-400 font-mono">
        <span className="flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-emerald-500" /> Telemetry Active
        </span>
        <span>Turnstile Bus: 0 ms</span>
      </div>
    </div>
  );
};

