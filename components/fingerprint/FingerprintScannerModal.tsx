import React, { useState } from 'react';
import {
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  Search,
} from 'lucide-react';
import { Modal } from '../common/Modal.tsx';
import { Badge } from '../common/Badge.tsx';
import { Teacher, FingerprintDevice, AttendanceRecord, AttendanceEvent } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface FingerprintScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  devices: FingerprintDevice[];
  onScanSuccess: (data: { record: AttendanceRecord; event: AttendanceEvent }) => void;
}

export const FingerprintScannerModal: React.FC<FingerprintScannerModalProps> = ({
  isOpen,
  onClose,
  teachers = [],
  devices = [],
  onScanSuccess,
}) => {
  const safeTeachers = Array.isArray(teachers) ? teachers : [];
  const safeDevices = Array.isArray(devices) ? devices : [];

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(safeTeachers[0]?.id || '');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(safeDevices[0]?.id || 'dev-gate-01');
  const [searchTeacher, setSearchTeacher] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    record: AttendanceRecord;
    event: AttendanceEvent;
    isNewCheckIn: boolean;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Time simulation option (default to current time, but allow selecting simulated morning time for demo)
  const [simulatedTime, setSimulatedTime] = useState<string>('NOW');

  const filteredTeachers = safeTeachers.filter(
    (t) =>
      (t.fullName || '').toLowerCase().includes(searchTeacher.toLowerCase()) ||
      (t.employeeId || '').toLowerCase().includes(searchTeacher.toLowerCase()) ||
      (t.departmentName || '').toLowerCase().includes(searchTeacher.toLowerCase())
  );

  const handleTriggerScan = async () => {
    if (!selectedTeacherId) {
      setErrorMessage('Please select a teacher to verify biometric attendance.');
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    setErrorMessage('');

    try {
      let customTimestamp: string | undefined = undefined;
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');

      if (simulatedTime === 'ON_TIME') {
        customTimestamp = `${year}-${month}-${day}T07:24:00`;
      } else if (simulatedTime === 'LATE') {
        customTimestamp = `${year}-${month}-${day}T07:46:00`;
      } else if (simulatedTime === 'VERY_LATE') {
        customTimestamp = `${year}-${month}-${day}T08:35:00`;
      } else if (simulatedTime === 'CHECKOUT') {
        customTimestamp = `${year}-${month}-${day}T15:10:00`;
      }

      // Simulate 750ms biometric sensor reading latency
      await new Promise((resolve) => setTimeout(resolve, 650));

      const res = await api.scanFingerprint(selectedTeacherId, selectedDeviceId, customTimestamp);
      setScanResult(res);
      onScanSuccess({ record: res.record, event: res.event });
    } catch (err: any) {
      setErrorMessage(err.message || 'Biometric verification failed.');
    } finally {
      setIsScanning(false);
    }
  };

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Physical Biometric Scanner Terminal"
      subtitle="School Entrance Turnstile — Real-Time Fingerprint Verification Engine"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Device & Gate Banner */}
        <div className="bg-gray-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-gray-800 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#E5252A] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  {selectedDevice?.name || 'Gate Fingerprint Device 01'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                IP: {selectedDevice?.ipAddress || '192.168.10.101'} • Location:{' '}
                {selectedDevice?.location || 'Main School Entrance'}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full sm:w-auto text-xs bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-[#E5252A]"
            >
              {safeDevices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.location})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scanner Simulation Surface & Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left: Teacher Selector */}
          <div className="md:col-span-6 space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1.5">
                1. Select Teacher (Faculty Member)
              </label>
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search faculty by name, ID or department..."
                  value={searchTeacher}
                  onChange={(e) => setSearchTeacher(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-hidden focus:border-[#E5252A]"
                />
              </div>

              <div className="max-h-44 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 bg-white dark:bg-gray-800">
                {filteredTeachers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">No teachers found</div>
                ) : (
                  filteredTeachers.map((t) => {
                    const isSelected = t.id === selectedTeacherId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTeacherId(t.id)}
                        className={`w-full p-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-red-50 text-[#E5252A] font-semibold' : 'hover:bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-medium text-[#263238] dark:text-white">{t.fullName}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{t.employeeId} • {t.departmentName}</p>
                        </div>
                        <div className="shrink-0">
                          <Badge status={t.fingerprintStatus} size="sm" showDot={false} />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Time Mode Simulation */}
            <div>
              <label className="block text-xs font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1.5">
                2. Test Time Scenario
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSimulatedTime('NOW')}
                  className={`py-1.5 px-2 rounded-md border text-center font-medium transition-colors ${
                    simulatedTime === 'NOW'
                      ? 'bg-red-50 border-[#E5252A] text-[#E5252A]'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  ⏱ Current Real Time
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedTime('ON_TIME')}
                  className={`py-1.5 px-2 rounded-md border text-center font-medium transition-colors ${
                    simulatedTime === 'ON_TIME'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  ✓ 07:24 AM (On Time)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedTime('LATE')}
                  className={`py-1.5 px-2 rounded-md border text-center font-medium transition-colors ${
                    simulatedTime === 'LATE'
                      ? 'bg-amber-50 border-amber-500 text-amber-700'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  ⚠ 07:46 AM (Late)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedTime('CHECKOUT')}
                  className={`py-1.5 px-2 rounded-md border text-center font-medium transition-colors ${
                    simulatedTime === 'CHECKOUT'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  🏁 03:10 PM (Check-Out)
                </button>
              </div>
            </div>
          </div>

          {/* Right: Optical Biometric Touchpad & Visual Response */}
          <div className="md:col-span-6 flex flex-col justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
            <div>
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Biometric Optical Sensor Surface
              </div>

              {/* Interactive Fingerprint Scanner Pad with Alive Laser & Radar */}
              <div
                onClick={!isScanning ? handleTriggerScan : undefined}
                className={`relative mx-auto w-32 h-32 rounded-3xl flex items-center justify-center cursor-pointer transition-all duration-300 border-2 overflow-hidden select-none ${
                  isScanning
                    ? 'bg-gray-900 border-[#E5252A] shadow-[0_0_30px_rgba(229,37,42,0.4)] ring-4 ring-red-100'
                    : scanResult
                    ? 'bg-emerald-900/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-4 ring-emerald-100'
                    : 'bg-white dark:bg-gray-800 border-gray-300 hover:border-[#E5252A] hover:shadow-md'
                }`}
              >
                {/* Radar Ripples when idle or scanning */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="absolute w-20 h-20 rounded-full border border-red-500/50 animate-ping" />
                    <span className="absolute w-28 h-28 rounded-full border border-red-500/30 animate-pulse" />
                  </div>
                )}

                {/* Laser scanline vertical sweep animation */}
                {isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FF383E] to-transparent shadow-[0_0_15px_#FF383E] animate-laser-scan rounded-full z-10" />
                )}

                <Fingerprint
                  className={`w-16 h-16 transition-all duration-300 ${
                    isScanning
                      ? 'text-red-500 scale-110 drop-shadow-[0_0_12px_rgba(229,37,42,0.8)] animate-pulse'
                      : scanResult
                      ? 'text-emerald-500 scale-105 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                      : 'text-gray-400 group-hover:text-red-500'
                  }`}
                />
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  disabled={isScanning || !selectedTeacherId}
                  onClick={handleTriggerScan}
                  className="w-full relative overflow-hidden py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#B30F13] via-[#E5252A] to-[#E5252A] hover:brightness-110 disabled:bg-gray-300 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <div className="absolute inset-0 bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Reading Biometric Sensor...</span>
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-4 h-4 text-white" />
                      <span>Scan & Verify Fingerprint</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Live Scan Result Card */}
            {scanResult && (
              <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 text-left shadow-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Biometric Verified (Match: {scanResult.event.confidenceScore}%)
                  </span>
                  <Badge status={scanResult.record.status} size="sm" />
                </div>

                <div className="text-xs">
                  <p className="font-bold text-[#263238] dark:text-white">{scanResult.record.teacherName}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {scanResult.event.eventType === 'CHECK_IN' ? 'Check-In' : 'Check-Out'} Time:{' '}
                    <span className="font-semibold text-[#263238] dark:text-white">
                      {scanResult.event.displayTime}
                    </span>{' '}
                    via {scanResult.event.deviceName}
                  </p>
                  {scanResult.record.lateDurationMinutes > 0 && (
                    <p className="text-[11px] font-semibold text-amber-700">
                      Late Arrival: {scanResult.record.lateDurationMinutes} minutes past grace period.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Hardware protocol: Wiegand-34 / RS-485 / TCP/IP Biometric Stream
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 text-xs font-semibold"
          >
            Close Terminal
          </button>
        </div>
      </div>
    </Modal>
  );
};
