import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Fingerprint,
  Users,
  Search,
  Filter,
  Download,
  Terminal,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
  Lock,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Calendar,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuditLog, UserRole } from '../../types/index.ts';
import { Pagination } from '../common/Pagination.tsx';
import { GrabScrollContainer } from '../common/GrabScrollContainer.tsx';

interface AuditLogsViewProps {
  logs: AuditLog[];
  currentRole: UserRole;
  onRefresh?: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  logs,
  currentRole,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(text);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    let csv = 'ID,Timestamp,Action,Category,Severity,Actor Name,Actor Role,Client IP,Target Entity,Details\n';
    filteredLogs.forEach((l) => {
      csv += `"${l.id}","${l.timestamp}","${l.action}","${l.category || ''}","${l.severity || ''}","${l.actorName}","${l.actorRole}","${l.ipAddress}","${l.entity}","${(l.details || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Elswedy_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Category counts
  const stats = useMemo(() => {
    const total = logs.length;
    const authLogs = logs.filter((l) => l.category === 'AUTH').length;
    const failedLogins = logs.filter((l) => l.action.includes('LOGIN_FAILED') || l.severity === 'ALERT').length;
    const securityEvents = logs.filter((l) => l.category === 'SECURITY' || l.action.includes('PASSWORD')).length;
    const biometricEvents = logs.filter((l) => l.category === 'BIOMETRIC' || l.category === 'DEVICE').length;

    return { total, authLogs, failedLogins, securityEvents, biometricEvents };
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Category filter
      if (selectedCategory !== 'ALL' && log.category !== selectedCategory) {
        return false;
      }
      // Severity filter
      if (selectedSeverity !== 'ALL' && log.severity !== selectedSeverity) {
        return false;
      }
      // Role filter
      if (selectedRole !== 'ALL' && !log.actorRole.toLowerCase().includes(selectedRole.toLowerCase())) {
        return false;
      }
      // Search query (action, actorName, details, ipAddress, metadata)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inAction = log.action.toLowerCase().includes(q);
        const inActor = log.actorName.toLowerCase().includes(q);
        const inDetails = log.details.toLowerCase().includes(q);
        const inIp = log.ipAddress.toLowerCase().includes(q);
        const inEntity = log.entity.toLowerCase().includes(q);
        const inMetadata = log.metadata ? JSON.stringify(log.metadata).toLowerCase().includes(q) : false;
        return inAction || inActor || inDetails || inIp || inEntity || inMetadata;
      }
      return true;
    });
  }, [logs, selectedCategory, selectedSeverity, selectedRole, searchQuery]);

  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Color mapping helper
  const getSeverityBadge = (severity?: string, action?: string) => {
    if (severity === 'ALERT' || (action && action.includes('FAILED'))) {
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
        dot: 'bg-rose-500',
        label: 'ALERT / BREACH ATTEMPT',
        accent: 'border-l-4 border-l-rose-500',
      };
    }
    if (severity === 'WARNING' || (action && action.includes('PASSWORD_VIEWED'))) {
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
        dot: 'bg-purple-500',
        label: 'SECURITY OVERRIDE',
        accent: 'border-l-4 border-l-purple-500',
      };
    }
    if (severity === 'SUCCESS' || (action && (action.includes('LOGIN_SUCCESS') || action.includes('REGISTERED')))) {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
        dot: 'bg-emerald-500',
        label: 'SUCCESS / VERIFIED',
        accent: 'border-l-4 border-l-emerald-500',
      };
    }
    return {
      bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500',
      label: 'INFO / ROUTINE',
      accent: 'border-l-4 border-l-blue-500',
    };
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Elswedy_Audit_Logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#1C252A] dark:via-[#263238] dark:to-[#12181B] p-6 sm:p-8 text-[#263238] dark:text-white border border-gray-200/90 dark:border-gray-800 shadow-sm transition-colors">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E5252A] to-transparent shadow-[0_0_12px_#E5252A]" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-50 dark:bg-red-500/20 text-[#E5252A] dark:text-red-400 border border-red-200 dark:border-red-500/30 flex items-center gap-1.5 shadow-2xs">
                <ShieldAlert className="w-3.5 h-3.5 text-[#E5252A]" />
                Institutional Audit & Security Trail
              </span>
              {currentRole === 'hr_admin' && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 flex items-center gap-1 shadow-2xs">
                  <KeyRound className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  H.Admin Unrestricted Access
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-[#263238] dark:text-white">
              System Audit & Access Logs
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 max-w-2xl">
              Capturing all terminal events, single sign-on authentication attempts, H.Admin credential reveals, biometric gate enrollments, and IP signatures.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 border border-gray-200/90 dark:border-white/20 text-gray-700 dark:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
                title="Refresh Live Audit Trail"
              >
                <RefreshCw className="w-3.5 h-3.5 text-gray-500 dark:text-gray-300" />
                <span>Refresh</span>
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 border border-gray-200/90 dark:border-white/20 text-gray-700 dark:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
              title="Export as CSV Spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-4 py-2.5 rounded-xl bg-[#E5252A] hover:bg-[#B30F13] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-red-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* 4 Interactive Quick Filter Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-200/80 dark:border-white/10">
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedSeverity('ALL');
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedCategory === 'ALL' && selectedSeverity === 'ALL'
                ? 'bg-red-50/80 dark:bg-white/15 border-red-200 dark:border-white/30 text-[#E5252A] dark:text-white shadow-xs'
                : 'bg-gray-50/80 dark:bg-black/30 border-gray-200/80 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span className="font-bold text-[11px]">Total Audit Events</span>
              <Activity className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white">{stats.total}</p>
            <span className="text-[10px] text-gray-400">All recorded activities</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('AUTH');
              setSelectedSeverity('ALERT');
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedSeverity === 'ALERT'
                ? 'bg-rose-100/90 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/50 text-rose-900 dark:text-white shadow-xs'
                : 'bg-rose-50/60 dark:bg-black/30 border-rose-200/60 dark:border-white/5 text-rose-800 dark:text-gray-300 hover:bg-rose-100/60 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 mb-1">
              <span className="font-bold text-[11px]">Failed Logins & Alerts</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
            </div>
            <p className="text-xl font-black text-rose-700 dark:text-rose-400">{stats.failedLogins}</p>
            <span className="text-[10px] text-rose-600/80 dark:text-rose-300/80">Flagged IP attempts</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('SECURITY');
              setSelectedSeverity('ALL');
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedCategory === 'SECURITY'
                ? 'bg-purple-100/90 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500/50 text-purple-900 dark:text-white shadow-xs'
                : 'bg-purple-50/60 dark:bg-black/30 border-purple-200/60 dark:border-white/5 text-purple-800 dark:text-gray-300 hover:bg-purple-100/60 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-300 mb-1">
              <span className="font-bold text-[11px]">Security & Passwords</span>
              <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xl font-black text-purple-700 dark:text-purple-300">{stats.securityEvents}</p>
            <span className="text-[10px] text-purple-600/80 dark:text-purple-300/80">H.Admin reveals / resets</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('BIOMETRIC');
              setSelectedSeverity('ALL');
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedCategory === 'BIOMETRIC'
                ? 'bg-emerald-100/90 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/50 text-emerald-900 dark:text-white shadow-xs'
                : 'bg-emerald-50/60 dark:bg-black/30 border-emerald-200/60 dark:border-white/5 text-emerald-800 dark:text-gray-300 hover:bg-emerald-100/60 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mb-1">
              <span className="font-bold text-[11px]">Biometric Gate Logs</span>
              <Fingerprint className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">{stats.biometricEvents}</p>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-300/80">Enrolments & Sync</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 p-4 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action, actor, teacher name, details, or IP address (e.g. 192.168.10.42)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A] focus:ring-2 focus:ring-red-100 transition-all bg-gray-50/50 focus:bg-white dark:bg-gray-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-[#263238] dark:text-white bg-white dark:bg-gray-800 focus:outline-hidden focus:border-[#E5252A] cursor-pointer"
            >
              <option value="ALL">📁 All Categories</option>
              <option value="AUTH">🔐 Authentication (SSO / Logins)</option>
              <option value="SECURITY">🛡️ Security & Passwords</option>
              <option value="FACULTY">👨‍🏫 Faculty / Teachers</option>
              <option value="BIOMETRIC">👆 Biometrics & Gateways</option>
              <option value="ATTENDANCE">⏱️ Attendance Engine</option>
              <option value="SYSTEM">⚙️ System & Settings</option>
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-[#263238] dark:text-white bg-white dark:bg-gray-800 focus:outline-hidden focus:border-[#E5252A] cursor-pointer"
            >
              <option value="ALL">🎨 All Severities</option>
              <option value="ALERT">🔴 Alert / Failed Logins</option>
              <option value="WARNING">🟣 Warning / Password Viewed</option>
              <option value="SUCCESS">🟢 Success / Authenticated</option>
              <option value="INFO">🔵 Info / Routine Updates</option>
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-[#263238] dark:text-white bg-white dark:bg-gray-800 focus:outline-hidden focus:border-[#E5252A] cursor-pointer"
            >
              <option value="ALL">👥 All Roles</option>
              <option value="Super Admin">👑 Super Admin (H.Admin)</option>
              <option value="HR">📋 HR Admin</option>
              <option value="Dept Head">🏢 Department Head</option>
              <option value="Teacher">👨‍🏫 Teacher</option>
              <option value="System">🤖 System Daemons</option>
            </select>
          </div>
        </div>

        {/* Quick active filter indicators */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500 dark:text-gray-400">
          <div>
            Showing <strong className="text-[#263238] dark:text-white">{filteredLogs.length}</strong> of{' '}
            <strong className="text-[#263238] dark:text-white">{logs.length}</strong> audit records
          </div>

          {(selectedCategory !== 'ALL' || selectedSeverity !== 'ALL' || selectedRole !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedSeverity('ALL');
                setSelectedRole('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-[#E5252A] hover:underline font-bold cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 overflow-hidden shadow-2xs">
        <GrabScrollContainer>
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-[11px] font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Event Action</th>
                <th className="py-3.5 px-4">Category & Severity</th>
                <th className="py-3.5 px-4">Actor & Role</th>
                <th className="py-3.5 px-4">Client IP Address</th>
                <th className="py-3.5 px-4">Event Details</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 dark:text-gray-500">
                    <Activity className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="font-bold text-gray-600 dark:text-gray-300">No matching audit events found</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const sev = getSeverityBadge(log.severity, log.action);
                  const isFailedLogin = log.action.includes('LOGIN_FAILED') || log.severity === 'ALERT';
                  const isPasswordReveal = log.action.includes('PASSWORD_VIEWED') || log.action.includes('PASSWORD_RESET');

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors cursor-pointer ${sev.accent}`}
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(log.timestamp).toISOString().split('T')[0]}
                        </span>
                      </td>

                      {/* Event Action */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <span
                          className={`font-bold ${
                            isFailedLogin
                              ? 'text-rose-600 dark:text-rose-400'
                              : isPasswordReveal
                              ? 'text-purple-600 dark:text-purple-400'
                              : 'text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {log.action}
                        </span>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500">
                          Target: {log.entity}
                        </div>
                      </td>

                      {/* Category & Severity Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${sev.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                          {sev.label}
                        </span>
                      </td>

                      {/* Actor & Role */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#263238] dark:text-white">{log.actorName}</div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{log.actorRole}</span>
                      </td>

                      {/* Client IP */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-700 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-700/60 px-2 py-1 rounded-md border border-gray-200/70 dark:border-gray-600/60 w-fit">
                          <Globe className="w-3 h-3 text-gray-400" />
                          <span>{log.ipAddress}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(log.ipAddress);
                            }}
                            className="text-gray-400 hover:text-gray-700 dark:text-gray-300 ml-1 cursor-pointer"
                            title="Copy IP Address"
                          >
                            {copiedIp === log.ipAddress ? (
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Event Details */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                          {log.details}
                        </p>
                      </td>

                      {/* Inspect Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </GrabScrollContainer>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredLogs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Log Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
                    <Terminal className="w-4 h-4 text-[#E5252A]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#263238] dark:text-white">Audit Event Inspector</h3>
                    <p className="text-[10px] text-gray-400 font-mono">ID: {selectedLog.id}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 py-4">
                {/* Event Highlights */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Action Signature</span>
                    <span className="font-mono text-xs font-bold text-[#E5252A] bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                      {selectedLog.action}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Actor / Initiator</span>
                      <strong className="text-gray-800 dark:text-gray-200">{selectedLog.actorName}</strong>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{selectedLog.actorRole}</p>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px]">Client IP Address</span>
                      <div className="flex items-center gap-1 font-mono text-gray-800 dark:text-gray-200 font-bold">
                        <Globe className="w-3 h-3 text-gray-400" />
                        <span>{selectedLog.ipAddress}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px]">Target Entity</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300">{selectedLog.entity} ({selectedLog.entityId || 'N/A'})</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px]">Exact Timestamp</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Narrative Details */}
                <div>
                  <h4 className="text-xs font-bold text-[#263238] dark:text-white mb-1.5">Institutional Log Narrative</h4>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                    {selectedLog.details}
                  </div>
                </div>

                {/* Metadata JSON if available */}
                {selectedLog.metadata && (
                  <div>
                    <h4 className="text-xs font-bold text-[#263238] dark:text-white mb-1.5 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#E5252A]" />
                      <span>Security & Forensic Metadata</span>
                    </h4>
                    <pre className="p-3.5 rounded-xl bg-[#1C252A] text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-gray-800">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => handleCopy(JSON.stringify(selectedLog, null, 2))}
                  className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Raw JSON</span>
                </button>

                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-xl bg-[#263238] text-white text-xs font-bold hover:bg-[#1C252A] transition-colors cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
