import React, { useState } from 'react';
import {
  Fingerprint,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/Modal.tsx';
import { Teacher, FingerprintDevice } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface RegisterBiometricWizardProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  devices: FingerprintDevice[];
  onRegistrationComplete: (updatedTeacher: Teacher) => void;
}

export const RegisterBiometricWizard: React.FC<RegisterBiometricWizardProps> = ({
  isOpen,
  onClose,
  teacher,
  devices = [],
  onRegistrationComplete,
}) => {
  const safeDevices = Array.isArray(devices) ? devices : [];
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(safeDevices[0]?.id || 'dev-gate-01');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);

  if (!teacher) return null;

  const handleStartEnrollment = async () => {
    setIsProcessing(true);
    setCurrentStep(2);

    // Step 2: Waiting for finger placement
    setTimeout(() => {
      setCurrentStep(3);
      setScanProgress(30);

      // Step 3: Minutiae points extraction animation
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 100;
          }
          return prev + 25;
        });
      }, 300);

      // Step 4: Final verification & API call
      setTimeout(async () => {
        try {
          const res = await api.registerFingerprint(teacher.id, selectedDeviceId, 'HR Admin');
          setCurrentStep(4);
          setIsProcessing(false);
          onRegistrationComplete(res.teacher);
        } catch (e) {
          setIsProcessing(false);
        }
      }, 1600);
    }, 1200);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setScanProgress(0);
    setIsProcessing(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Biometric Fingerprint Registration"
      subtitle={`Enrolling biometric template for ${teacher.fullName} (${teacher.employeeId})`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          {[
            { num: 1, label: 'Device Select' },
            { num: 2, label: 'Finger Placement' },
            { num: 3, label: 'Point Extraction' },
            { num: 4, label: 'Verification' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === s.num
                    ? 'bg-[#E5252A] text-white shadow-xs'
                    : currentStep > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {currentStep > s.num ? '✓' : s.num}
              </div>
              <span
                className={`text-[11px] font-medium hidden sm:inline ${
                  currentStep === s.num
                    ? 'text-[#263238] dark:text-white font-bold'
                    : currentStep > s.num
                    ? 'text-emerald-700'
                    : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Content per step */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="block text-xs font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-2">
                Select Hardware Reader
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
              >
                {safeDevices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.location} ({d.ipAddress})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-red-50/40 border border-red-100 rounded-xl text-xs space-y-1">
              <p className="font-bold text-[#263238] dark:text-white">Teacher Details:</p>
              <p className="text-gray-600">
                Name: <span className="font-semibold text-[#263238] dark:text-white">{teacher.fullName}</span>
              </p>
              <p className="text-gray-600">
                Employee ID: <span className="font-semibold text-[#263238] dark:text-white">{teacher.employeeId}</span>
              </p>
              <p className="text-gray-600">
                Department:{' '}
                <span className="font-semibold text-[#263238] dark:text-white">{teacher.departmentName}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartEnrollment}
              className="w-full py-2.5 px-4 bg-[#E5252A] hover:bg-[#D01B20] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Connect Reader & Begin Enrollment</span>
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-red-50 border-2 border-[#E5252A] mx-auto flex items-center justify-center shadow-md animate-pulse">
              <Fingerprint className="w-12 h-12 text-[#E5252A]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#263238] dark:text-white">Step 2: Place Finger on Scanner</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Instruct faculty member to place index or thumb flat on the optical prism reader.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Waiting for biometric touch detection...</span>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 border-2 border-blue-500 mx-auto flex items-center justify-center shadow-md">
              <Cpu className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#263238] dark:text-white">
                Step 3: Extracting Minutiae Points
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Ridge bifurcations, ridge endings, and optical key vectors being computed.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#E5252A] h-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
              Processing: {scanProgress}% • Secure SHA-256 Vector Token Generation
            </p>
          </div>
        )}

        {currentStep === 4 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-emerald-500 mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900">
                ✓ Fingerprint Registered Successfully
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                Biometric template is now active on all 3 turnstile entrance gates for{' '}
                <span className="font-bold text-[#263238] dark:text-white">{teacher.fullName}</span>.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 text-left space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Template Token: ELS-BIO-{teacher.employeeId}-9872
              </p>
              <p className="text-[11px] text-emerald-700">
                Enrolled Device: {devices.find((d) => d.id === selectedDeviceId)?.name}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
