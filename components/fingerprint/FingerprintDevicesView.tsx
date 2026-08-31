import React, { useState } from 'react';
import {
  Fingerprint,
  Wifi,
  WifiOff,
  RefreshCw,
  Server,
  Activity,
  ShieldCheck,
  Power,
  RotateCw,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { FingerprintDevice, UserRole } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import { api } from '../../services/api.ts';

interface FingerprintDevicesViewProps {
  devices: FingerprintDevice[];
  currentRole: UserRole;
  onRefreshDevices: () => void;
}

export const FingerprintDevicesView: React.FC<FingerprintDevicesViewProps> = ({
  devices = [],
  currentRole,
  onRefreshDevices,
}) => {
  const safeDevices = Array.isArray(devices) ? devices : [];
  const [syncingDeviceId, setSyncingDeviceId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string>('');

  const handleToggleStatus = async (device: FingerprintDevice) => {
    try {
      const newStatus = device.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
      await api.toggleDeviceStatus(device.id, newStatus, 'Super Admin');
      onRefreshDevices();
      setActionMessage(`Device ${device.name} is now ${newStatus}`);
      setTimeout(() => setActionMessage(''), 3500);
    } catch (e: any) {
      setActionMessage('Failed to update device status');
    }
  };

  const handleSyncDevice = async (device: FingerprintDevice) => {
    setSyncingDeviceId(device.id);
    try {
      await api.syncDevice(device.id);
      setActionMessage(`Synchronizing offline logs from ${device.name}...`);
      setTimeout(() => {
        setSyncingDeviceId(null);
        onRefreshDevices();
        setActionMessage(`✓ All offline events from ${device.name} successfully synchronized.`);
        setTimeout(() => setActionMessage(''), 3500);
      }, 1300);
    } catch (e: any) {
      setSyncingDeviceId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200/80 dark:border-gray-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263238] dark:text-white">Fingerprint Devices</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Biometric optical scanners installed at campus turnstile gates and workshop entrances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshDevices}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800/50 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {safeDevices.map((device) => {
          const isSyncing = syncingDeviceId === device.id || device.status === 'SYNCING';
          const isOffline = device.status === 'OFFLINE';

          return (
            <div
              key={device.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                isOffline
                  ? 'border-rose-200 bg-rose-50/10'
                  : 'border-gray-200/80 hover:border-gray-300'
              }`}
            >
              <div>
                {/* Device Title & Status */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                        isOffline ? 'bg-rose-500' : 'bg-[#E5252A]'
                      }`}
                    >
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#263238] dark:text-white">{device.name}</h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">{device.location}</p>
                    </div>
                  </div>

                  <Badge status={device.status} size="sm" />
                </div>

                {/* Device Specs List */}
                <div className="py-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-gray-400">Device Hardware:</span>
                    <span className="font-medium text-[#263238] dark:text-white">{device.deviceModel}</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-gray-400">IP Address / Port:</span>
                    <span className="font-mono text-[#263238] dark:text-white">
                      {device.ipAddress}:{device.port}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-gray-400">MAC Address:</span>
                    <span className="font-mono text-gray-500 dark:text-gray-400">{device.macAddress}</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-gray-400">Enrolled Faculty:</span>
                    <span className="font-bold text-[#263238] dark:text-white">
                      {device.registeredCount} Biometric Templates
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-gray-400">Firmware:</span>
                    <span className="font-mono text-gray-600">{device.firmwareVersion}</span>
                  </div>

                  {device.pendingEventsCount > 0 && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-center justify-between mt-2">
                      <span className="font-semibold text-[11px] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        {device.pendingEventsCount} pending offline scans
                      </span>
                      <span className="text-[10px] text-amber-700">In Flash RAM</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => handleSyncDevice(device)}
                  className="flex-1 py-2 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800/50 text-[#263238] dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#E5252A] ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Logs'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(device)}
                  title={isOffline ? 'Power On Device' : 'Simulate Internet Disconnection'}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                    isOffline
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
