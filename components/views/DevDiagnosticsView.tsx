import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Database,
  Server,
  Radio,
  Shield,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Cpu,
  Globe,
  Lock,
  Terminal,
  Copy,
  Check,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { api } from '../../services/api.ts';

interface DevDiagnosticsViewProps {
  onBackToApp?: () => void;
  isDarkMode?: boolean;
}

interface HealthData {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  database: {
    connected: boolean;
    mode: string;
  };
  environment: string;
}

export const DevDiagnosticsView: React.FC<DevDiagnosticsViewProps> = ({
  onBackToApp,
  isDarkMode = false,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [sseStatus, setSseStatus] = useState<'CONNECTED' | 'CONNECTING' | 'DISCONNECTED'>('CONNECTING');
  const [lastSseEvent, setLastSseEvent] = useState<string | null>(null);
  const [reconnectingDb, setReconnectingDb] = useState<boolean>(false);
  const [dbReconnectMsg, setDbReconnectMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [authStatus, setAuthStatus] = useState<{
    hasToken: boolean;
    valid: boolean;
    user?: any;
  }>({ hasToken: false, valid: false });

  const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
  const rawBaseUrl = apiBase.replace(/\/+api\/?$/, '');

  // 1. Measure Ping & Fetch Health
  const checkHealthAndPing = useCallback(async () => {
    setLoading(true);
    setHealthError(null);
    const start = performance.now();

    try {
      const res = await fetch(`${rawBaseUrl}/health`, { cache: 'no-cache' });
      const elapsed = Math.round(performance.now() - start);
      setPingMs(elapsed);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data: HealthData = await res.json();
      setHealthData(data);
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setPingMs(elapsed);
      setHealthError(err.message || 'Failed to connect to backend server');
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  }, [rawBaseUrl]);

  // 2. Check Auth Status
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('elswedy_auth_token');
    if (!token) {
      setAuthStatus({ hasToken: false, valid: false });
      return;
    }

    try {
      const userRes = await api.getCurrentUser();
      setAuthStatus({ hasToken: true, valid: true, user: userRes.user });
    } catch {
      setAuthStatus({ hasToken: true, valid: false });
    }
  }, []);

  // 3. Connect to SSE Stream for Diagnostics
  useEffect(() => {
    let es: EventSource | null = null;
    const sseUrl = `${rawBaseUrl}/api/stream`;

    try {
      es = new EventSource(sseUrl);
      es.onopen = () => setSseStatus('CONNECTED');
      es.onerror = () => setSseStatus('DISCONNECTED');
      es.onmessage = (event) => {
        setSseStatus('CONNECTED');
        setLastSseEvent(event.data);
      };
    } catch {
      setSseStatus('DISCONNECTED');
    }

    return () => {
      if (es) es.close();
    };
  }, [rawBaseUrl]);

  useEffect(() => {
    checkHealthAndPing();
    checkAuth();
  }, [checkHealthAndPing, checkAuth]);

  // Handle DB Reconnect
  const handleReconnectDb = async () => {
    setReconnectingDb(true);
    setDbReconnectMsg(null);
    try {
      const res = await api.reconnectDatabase();
      setDbReconnectMsg(res.message || 'Database reconnect requested');
      await checkHealthAndPing();
    } catch (err: any) {
      setDbReconnectMsg(err.message || 'Reconnect request failed');
    } finally {
      setReconnectingDb(false);
    }
  };

  // Copy Diagnostics
  const handleCopyDiagnostics = () => {
    const report = {
      timestamp: new Date().toISOString(),
      frontendUrl: window.location.href,
      configuredApiBase: apiBase,
      backendPingMs: pingMs,
      backendHealth: healthData,
      backendError: healthError,
      sseStatus,
      authStatus: {
        hasToken: authStatus.hasToken,
        tokenValid: authStatus.valid,
        userRole: authStatus.user?.role || 'None',
      },
    };
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins > 0 ? `${mins}m ` : ''}${secs}s`;
  };

  const getPingColor = (ms: number | null) => {
    if (ms === null || healthError) return 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800';
    if (ms < 100) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (ms < 300) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-gray-100 p-4 sm:p-8 antialiased selection:bg-[#E5252A] selection:text-white font-sans">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#E5252A_0.7px,transparent_0.7px)] [background-size:24px_24px]" />

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Top Bar / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E5252A] to-[#990000] flex items-center justify-center shadow-lg shadow-red-900/30">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  System Diagnostics & Dev Hub
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/60 uppercase tracking-wider">
                  /dev route
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Live environment telemetry, backend connectivity, database status & latency verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDiagnostics}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-xs font-semibold text-gray-200 border border-gray-700 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied JSON!' : 'Copy Telemetry'}</span>
            </button>

            <button
              onClick={checkHealthAndPing}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-xs font-semibold text-gray-200 border border-gray-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-400' : ''}`} />
              <span>Ping Now</span>
            </button>

            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#E5252A] hover:bg-[#D01B20] text-xs font-bold text-white shadow-md shadow-red-900/30 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to App</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Live Ping Latency */}
          <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-4 border border-gray-800 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Backend Latency (Ping)
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {pingMs !== null ? `${pingMs}` : '--'}
                  </span>
                  <span className="text-xs text-gray-400">ms</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-800 border border-gray-700">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-400">Quality:</span>
              <span className={`font-semibold px-2 py-0.5 rounded border text-[11px] ${getPingColor(pingMs)}`}>
                {healthError ? 'DISCONNECTED' : pingMs !== null && pingMs < 150 ? 'EXCELLENT' : pingMs !== null && pingMs < 350 ? 'GOOD' : 'SLOW'}
              </span>
            </div>
          </div>

          {/* 2. Backend Server Status */}
          <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-4 border border-gray-800 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  API Server Status
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${healthData?.status === 'UP' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="text-xl font-bold text-white">
                    {healthData?.status === 'UP' ? 'ONLINE (UP)' : 'OFFLINE'}
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-800 border border-gray-700">
                <Server className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
              <span>Uptime:</span>
              <span className="font-semibold text-gray-200">{formatUptime(healthData?.uptimeSeconds)}</span>
            </div>
          </div>

          {/* 3. Database Engine */}
          <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-4 border border-gray-800 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Database State
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${healthData?.database?.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-lg font-bold text-white truncate max-w-[150px]">
                    {healthData?.database?.connected ? 'MongoDB Cloud' : 'In-Memory Store'}
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-800 border border-gray-700">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
              <span>Driver:</span>
              <span className="font-semibold text-emerald-400">{healthData?.database?.mode || 'Active'}</span>
            </div>
          </div>

          {/* 4. Real-time SSE Stream */}
          <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-4 border border-gray-800 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  SSE Real-Time Channel
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${sseStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : sseStatus === 'CONNECTING' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                  <span className="text-xl font-bold text-white">
                    {sseStatus}
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-800 border border-gray-700">
                <Radio className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
              <span>Path:</span>
              <span className="font-mono text-[11px] text-gray-300">/api/stream</span>
            </div>
          </div>
        </div>

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Connection Details Card */}
          <div className="bg-gray-900/80 backdrop-blur-md rounded-xl border border-gray-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Host & API Configuration</span>
              </h3>
              <span className="text-[11px] font-mono text-gray-400">Environment Details</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">Configured API Base URL (VITE_API_URL):</span>
                <span className="font-mono text-emerald-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                  {apiBase}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">Server Health Endpoint:</span>
                <span className="font-mono text-gray-300">{`${rawBaseUrl}/health`}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">Environment Mode:</span>
                <span className="font-semibold text-gray-200">{healthData?.environment || 'development'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">Service Identifier:</span>
                <span className="font-semibold text-gray-200">{healthData?.service || 'Elswedy Attendance Service'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-400">Frontend Origin:</span>
                <span className="font-mono text-gray-300">{window.location.origin}</span>
              </div>
            </div>

            {healthError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Connection Error</div>
                  <div className="mt-0.5 font-mono text-[11px] opacity-90">{healthError}</div>
                  <div className="mt-1 text-[11px] text-gray-300">
                    Make sure the backend server is running on <code className="text-amber-300">{rawBaseUrl}</code>.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Database & Diagnostics Actions Card */}
          <div className="bg-gray-900/80 backdrop-blur-md rounded-xl border border-gray-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Database & Authentication Diagnostics</span>
              </h3>
              <span className="text-[11px] font-mono text-gray-400">Interactive Tests</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">JWT Token in LocalStorage:</span>
                <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${authStatus.hasToken ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                  {authStatus.hasToken ? 'Present' : 'Not Logged In'}
                </span>
              </div>

              {authStatus.user && (
                <div className="flex items-center justify-between py-1.5 border-b border-gray-800/60">
                  <span className="text-gray-400">Active User:</span>
                  <span className="font-semibold text-gray-200">
                    {authStatus.user.name} ({authStatus.user.role})
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">Server Time:</span>
                <span className="font-mono text-gray-300">{healthData?.timestamp || new Date().toISOString()}</span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  onClick={handleReconnectDb}
                  disabled={reconnectingDb}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${reconnectingDb ? 'animate-spin' : ''}`} />
                  <span>{reconnectingDb ? 'Testing DB Connection...' : 'Test DB Handshake'}</span>
                </button>

                <button
                  onClick={checkHealthAndPing}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>Measure Latency</span>
                </button>
              </div>

              {dbReconnectMsg && (
                <div className="p-2.5 rounded-lg bg-gray-800/90 border border-gray-700 text-gray-300 text-[11px] font-mono">
                  {dbReconnectMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live SSE Feed Preview */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl border border-gray-800 p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Real-Time SSE Stream Listener</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${sseStatus === 'CONNECTED' ? 'bg-emerald-400 animate-ping' : 'bg-gray-600'}`} />
              <span className="text-[11px] font-mono text-gray-400">Stream Status: {sseStatus}</span>
            </div>
          </div>

          <div className="bg-black/70 rounded-lg p-3 font-mono text-xs text-gray-300 overflow-x-auto border border-gray-800/80 max-h-48">
            {lastSseEvent ? (
              <pre className="text-emerald-400 whitespace-pre-wrap">{lastSseEvent}</pre>
            ) : (
              <span className="text-gray-500 italic">
                Listening for live broadcast events (Biometric turnstile scans, attendance updates, system logs)...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
