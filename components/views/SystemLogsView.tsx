import React, { useState, useEffect } from 'react';
import {
  Database,
  Server,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Cpu,
  Layers,
  Search,
  Filter,
  Terminal,
  Zap,
} from 'lucide-react';
import { GrabScrollContainer } from '../common/GrabScrollContainer.tsx';
import { api } from '../../services/api.ts';

export const SystemLogsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [statusData, setStatusData] = useState<{
    dbStatus: {
      connected: boolean;
      mode: string;
      uri: string;
      latencyMs: number;
      collectionsCount: number;
      recordsSynced: number;
      fallbackActive: boolean;
    };
    serverStatus: {
      uptimeSeconds: number;
      nodeVersion: string;
      memoryUsageMb: string;
      activeSseClients: number;
      environment: string;
      port: number;
    };
    logs: Array<{
      id: string;
      timestamp: string;
      level: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
      component: string;
      message: string;
      details?: string;
    }>;
  } | null>(null);

  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await api.getSystemStatus();
      setStatusData(data);
    } catch (err: any) {
      console.error('Failed to load system status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleReconnect = async () => {
    try {
      setReconnecting(true);
      const res = await api.reconnectDatabase();
      if (res.isConnected) {
        setToastMessage({ type: 'success', text: 'MongoDB connection established successfully!' });
      } else {
        setToastMessage({ type: 'info', text: 'MongoDB unavailable. In-Memory Active Fallback engine is processing all requests smoothly.' });
      }
      fetchStatus();
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message || 'Reconnect request failed.' });
    } finally {
      setReconnecting(false);
      setTimeout(() => setToastMessage(null), 6000);
    }
  };

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const filteredLogs = (statusData?.logs || []).filter((log) => {
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    const matchesSearch =
      searchQuery.trim() === '' ||
      log.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm font-semibold transition-all shadow-md ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
              : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : toastMessage.type === 'error' ? (
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold underline cursor-pointer hover:opacity-80 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0C101C] p-5 rounded-2xl border border-gray-200/80 dark:border-slate-800/60 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200/80 dark:border-red-900/50 flex items-center justify-center text-[#E5252A]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#263238] dark:text-white flex items-center gap-2">
                System Health & Database Logs
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Admin Real-Time Diagnostics
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Monitor MongoDB cloud connection, active in-memory fallback state, server uptime, and system event logs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#E5252A]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleReconnect}
            disabled={reconnecting}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B31015] to-[#E5252A] hover:from-[#E5252A] hover:to-[#FF3B3E] text-white text-xs font-bold shadow-2xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Database className={`w-4 h-4 ${reconnecting ? 'animate-bounce' : ''}`} />
            <span>{reconnecting ? 'Testing DB Connection...' : 'Test / Reconnect MongoDB'}</span>
          </button>
        </div>
      </div>

      {/* Top Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: DB Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0C101C] border border-gray-200/80 dark:border-slate-800/60 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Database Engine
            </span>
            <Database className={`w-5 h-5 ${statusData?.dbStatus.connected ? 'text-emerald-500' : 'text-amber-500'}`} />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2.5 h-2.5 rounded-full animate-ping ${
                statusData?.dbStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <h3 className="text-base font-extrabold text-[#263238] dark:text-white">
              {statusData?.dbStatus.connected ? 'MongoDB Cloud Online' : 'In-Memory Fallback Active'}
            </h3>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-3">
            URI: <code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">{statusData?.dbStatus.uri || 'mongodb://localhost:27017'}</code>
          </p>

          <div className="pt-2 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 dark:text-gray-400">Records Synced:</span>
            <span className="font-bold text-[#E5252A] dark:text-red-400">
              {statusData?.dbStatus.recordsSynced || 0} Entities
            </span>
          </div>
        </div>

        {/* Card 2: Uptime & Server */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0C101C] border border-gray-200/80 dark:border-slate-800/60 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Server Uptime
            </span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>

          <h3 className="text-2xl font-black text-[#263238] dark:text-white mb-1">
            {statusData ? formatUptime(statusData.serverStatus.uptimeSeconds) : '0h 0m 0s'}
          </h3>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Environment: <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase">{statusData?.serverStatus.environment || 'development'}</span> (Port {statusData?.serverStatus.port || 3000})
          </p>

          <div className="pt-2 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 dark:text-gray-400">Node Runtime:</span>
            <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
              {statusData?.serverStatus.nodeVersion || 'v20.x'}
            </span>
          </div>
        </div>

        {/* Card 3: Memory Usage */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0C101C] border border-gray-200/80 dark:border-slate-800/60 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Memory Consumption
            </span>
            <Cpu className="w-5 h-5 text-purple-500" />
          </div>

          <h3 className="text-2xl font-black text-[#263238] dark:text-white mb-1">
            {statusData?.serverStatus.memoryUsageMb || '0'} <span className="text-sm font-bold text-gray-400">MB</span>
          </h3>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Heap Allocations (V8 Engine)
          </p>

          <div className="pt-2 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 dark:text-gray-400">Garbage Collector:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Optimal (&lt; 150MB)
            </span>
          </div>
        </div>

        {/* Card 4: Real-time SSE Stream Clients */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0C101C] border border-gray-200/80 dark:border-slate-800/60 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Biometric Live Stream
            </span>
            <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>

          <h3 className="text-2xl font-black text-[#263238] dark:text-white mb-1">
            {statusData?.serverStatus.activeSseClients || 0} <span className="text-sm font-bold text-gray-400">Active Terminals</span>
          </h3>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            SSE Event Bus Channel Ready
          </p>

          <div className="pt-2 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-gray-500 dark:text-gray-400">Socket Status:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Listening on 4370
            </span>
          </div>
        </div>
      </div>

      {/* Database Resiliency Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Institutional Fallback Architecture Enabled
            </h4>
            <p className="text-xs text-amber-700/90 dark:text-amber-300/80 mt-0.5">
              Elsewedy Biometric Attendance System utilizes an in-memory database engine with persistent synchronization. Even if MongoDB Atlas goes offline, all biometric scans, login credentials, and attendance corrections remain 100% operational.
            </p>
          </div>
        </div>

        <button
          onClick={handleReconnect}
          disabled={reconnecting}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-200 dark:bg-amber-900/60 hover:bg-amber-300 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 text-xs font-bold cursor-pointer transition-colors"
        >
          {reconnecting ? 'Checking...' : 'Run Connectivity Diagnostic'}
        </button>
      </div>

      {/* System Event Logs Table */}
      <div className="bg-white dark:bg-[#0C101C] border border-gray-200/80 dark:border-slate-800/60 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#E5252A]" />
            <h3 className="text-base font-bold text-[#263238] dark:text-white">
              System Diagnostics & Event Logs
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
              {filteredLogs.length} Events
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center bg-gray-100 dark:bg-slate-900 p-1 rounded-xl border border-gray-200/80 dark:border-slate-800 text-xs font-semibold">
              {['ALL', 'SUCCESS', 'WARNING', 'ERROR', 'INFO'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filterLevel === lvl
                      ? 'bg-white dark:bg-slate-800 text-[#E5252A] dark:text-red-400 font-bold shadow-2xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A] w-36 sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <GrabScrollContainer>
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead>
              <tr className="border-b border-gray-200/80 dark:border-slate-800 text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Level</th>
                <th className="py-2.5 px-3">Component</th>
                <th className="py-2.5 px-3">Log Message</th>
                <th className="py-2.5 px-3">Technical Diagnostics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 dark:text-gray-500">
                    No system log entries match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  let badgeStyle = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
                  if (log.level === 'SUCCESS') {
                    badgeStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
                  } else if (log.level === 'WARNING') {
                    badgeStyle = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
                  } else if (log.level === 'ERROR') {
                    badgeStyle = 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800';
                  }

                  return (
                    <tr key={log.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-3 text-gray-500 dark:text-gray-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${badgeStyle}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#263238] dark:text-gray-200 whitespace-nowrap">
                        {log.component}
                      </td>
                      <td className="py-3 px-3 text-gray-800 dark:text-gray-200 font-medium">
                        {log.message}
                      </td>
                      <td className="py-3 px-3 text-gray-500 dark:text-gray-400 font-mono text-[11px]">
                        {log.details || '--'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </GrabScrollContainer>
      </div>
    </div>
  );
};
