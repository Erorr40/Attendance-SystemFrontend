import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { DashboardView } from './components/views/DashboardView.tsx';
import { TeachersList } from './components/teachers/TeachersList.tsx';
import { AttendanceHistoryView } from './components/attendance/AttendanceHistoryView.tsx';
import { FingerprintDevicesView } from './components/fingerprint/FingerprintDevicesView.tsx';
import { ScheduleManagement } from './components/schedules/ScheduleManagement.tsx';
import { LeaveManagement } from './components/leaves/LeaveManagement.tsx';
import { DepartmentView } from './components/departments/DepartmentView.tsx';
import { ReportsView } from './components/reports/ReportsView.tsx';
import { AuditLogsView } from './components/audit/AuditLogsView.tsx';
import { SystemSettingsView } from './components/settings/SystemSettingsView.tsx';
import { TeacherPortal } from './components/teacher-portal/TeacherPortal.tsx';
import { LoginView } from './components/auth/LoginView.tsx';
import { RegisterBiometricWizard } from './components/fingerprint/RegisterBiometricWizard.tsx';
import { AddTeacherModal } from './components/teachers/AddTeacherModal.tsx';
import { EditTeacherModal } from './components/teachers/EditTeacherModal.tsx';
import { TeacherDetailModal } from './components/teachers/TeacherDetailModal.tsx';
import { AttendanceCorrectionModal } from './components/dashboard/AttendanceCorrectionModal.tsx';
import { AttendanceRecordDetailModal } from './components/attendance/AttendanceRecordDetailModal.tsx';
import { WelcomeSplashScreen } from './components/common/WelcomeSplashScreen.tsx';
import { SkeletonPageLayout } from './components/common/SkeletonPageLayout.tsx';
import { SystemLogsView } from './components/views/SystemLogsView.tsx';
import { DevDiagnosticsView } from './components/views/DevDiagnosticsView.tsx';
import { ToastProvider, useToast } from './components/common/Toast.tsx';
import { api } from './services/api.ts';
import {
  UserRole,
  Teacher,
  Department,
  FingerprintDevice,
  Schedule,
  AttendanceRecord,
  AttendanceEvent,
  DashboardStats,
  LeaveRequest,
  AuditLog,
  NotificationItem,
} from './types/index.ts';

function checkIsDevRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.toLowerCase();
  const h = window.location.hash.toLowerCase();
  const s = window.location.search.toLowerCase();
  return (
    p === '/dev' ||
    p.endsWith('/dev') ||
    p.endsWith('/dev/') ||
    h === '#dev' ||
    h === '#/dev' ||
    s.includes('view=dev') ||
    s.includes('dev=true')
  );
}

function MainAppContent() {
  const { showToast } = useToast();

  // /dev Route Diagnostics State
  const [isDevMode, setIsDevMode] = useState<boolean>(() => checkIsDevRoute());

  useEffect(() => {
    const handleUrlChange = () => {
      setIsDevMode(checkIsDevRoute());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Splash Screen & Loading Skeleton State (Only show on explicit login, never to unauthenticated visitors)
  const [showSplash, setShowSplash] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('elswedy_auth_token');
  });

  // Navigation & Role State
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('elswedy_role');
    return (saved as UserRole) || 'hr_admin';
  });

  const [sessionUser, setSessionUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('elswedy_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (user: any, token: string) => {
    localStorage.setItem('elswedy_auth_token', token);
    localStorage.setItem('elswedy_role', user.role);
    localStorage.setItem('elswedy_user', JSON.stringify(user));
    setSessionUser(user);
    setCurrentRole(user.role);
    setIsAuthenticated(true);
    setShowSplash(true);
    showToast(`Welcome back, ${user.name}!`, 'success');
    if (user.role === 'employee' || user.role === 'teacher') {
      setCurrentView('teacher-portal');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('elswedy_auth_token');
    localStorage.removeItem('elswedy_role');
    localStorage.removeItem('elswedy_user');
    setSessionUser(null);
    setIsAuthenticated(false);
    showToast('Logged out successfully', 'info');
  };

  // Listen for forced logout from 401 responses in api.ts
  useEffect(() => {
    const handleForcedLogout = () => {
      setSessionUser(null);
      setIsAuthenticated(false);
      showToast('Session expired. Please log in again.', 'error');
    };
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [showToast]);

  // Dark Mode Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('elswedy_dark_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('elswedy_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  // Core Data State
  const [stats, setStats] = useState<DashboardStats>({
    totalTeachers: 48,
    presentToday: 39,
    lateToday: 6,
    absentToday: 3,
    onLeaveToday: 1,
    attendancePercentage: 81.3,
    registeredFingerprints: 46,
    devicesOnlineCount: 3,
    totalDevicesCount: 3,
    onlineDevicesCount: 3,
  });
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [devices, setDevices] = useState<FingerprintDevice[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [allAttendanceRecords, setAllAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Modals State
  const [enrollingTeacher, setEnrollingTeacher] = useState<Teacher | null>(null);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState<boolean>(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacherId, setViewingTeacherId] = useState<string | null>(null);
  const [editingCorrectionRecord, setEditingCorrectionRecord] = useState<AttendanceRecord | null>(null);
  const [inspectingAttendanceRecord, setInspectingAttendanceRecord] = useState<AttendanceRecord | null>(null);

  // Initial Load
  const fetchAllData = async () => {
    try {
      setIsInitialLoading(true);
      const [
        dashData,
        teachersData,
        departmentsData,
        devicesData,
        schedulesData,
        leavesData,
        auditData,
        attendanceData,
      ] = await Promise.all([
        api.getDashboard().catch(() => null),
        api.getTeachers({ requesterRole: currentRole }).catch(() => []),
        api.getDepartments().catch(() => []),
        api.getDevices().catch(() => []),
        api.getSchedules().catch(() => []),
        api.getLeaves().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getAttendanceRecords().catch(() => []),
      ]);

      if (dashData) {
        if (dashData.stats) setStats(dashData.stats);
        setTodayRecords(dashData.todayAttendance || dashData.todayRecords || []);
        setEvents(dashData.liveEvents || []);
      }
      setDepartments(departmentsData || []);
      setTeachers(teachersData || []);
      setDevices(devicesData || []);
      setSchedules(schedulesData || []);
      setLeaves(leavesData || []);
      setAuditLogs(Array.isArray(auditData) ? auditData : (auditData as any)?.data || []);
      setAllAttendanceRecords(attendanceData || []);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    } else {
      setIsInitialLoading(false);
    }
  }, [isAuthenticated]);

  // Real-time SSE Connection
  useEffect(() => {
    let apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      apiBase.startsWith('http://') &&
      !apiBase.includes('localhost') &&
      !apiBase.includes('127.0.0.1')
    ) {
      apiBase = apiBase.replace('http://', 'https://');
    }
    const sseUrl = `${apiBase.replace(/\/+api\/?$/, '')}/api/stream`;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'FINGERPRINT_SCAN' || data.type === 'ATTENDANCE_EVENT') {
            const { event: scanEvent, record, stats: newStats } = data.data;

            if (scanEvent) {
              setEvents((prev) => [scanEvent, ...prev.slice(0, 19)]);
            }

            if (record) {
              setTodayRecords((prev) => {
                const idx = prev.findIndex((r) => r.teacherId === record.teacherId);
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = record;
                  return updated;
                }
                return [record, ...prev];
              });
            }

            if (newStats) {
              setStats(newStats);
            }

            if (record && scanEvent) {
              const newNotif: NotificationItem = {
                id: 'notif-' + Date.now(),
                title: `${scanEvent.eventType === 'CHECK_IN' ? 'Check-In' : 'Check-Out'}: ${
                  record.teacherName
                }`,
                message: `Verified via ${scanEvent.deviceName} at ${scanEvent.displayTime}. Status: ${record.status}.`,
                type: record.status === 'Late' || record.status === 'Very Late' ? 'WARNING' : 'SUCCESS',
                timestamp: new Date().toISOString(),
                isRead: false,
              };
              setNotifications((prev) => [newNotif, ...prev.slice(0, 15)]);
            }
          } else if (data.type === 'ATTENDANCE_CORRECTED') {
            const { record, stats: newStats, auditLog } = data.data;
            if (record) {
              setTodayRecords((prev) => prev.map((r) => (r.id === record.id ? record : r)));
              setAllAttendanceRecords((prev) => prev.map((r) => (r.id === record.id ? record : r)));
            }
            if (newStats) setStats(newStats);
            if (auditLog) setAuditLogs((prev) => [auditLog, ...prev]);
            showToast('Attendance record corrected', 'info');
          } else if (data.type === 'LEAVE_REVIEWED') {
            const { leave, auditLog } = data.data;
            if (leave) {
              setLeaves((prev) => prev.map((l) => (l.id === leave.id ? leave : l)));
            }
            if (auditLog) setAuditLogs((prev) => [auditLog, ...prev]);
          } else if (data.type === 'TEACHER_UPDATED') {
            const { action, teacher } = data.data;
            if (action === 'DELETE' && teacher) {
              setTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
            } else if (action === 'CREATE' && teacher) {
              setTeachers((prev) => [teacher, ...prev]);
            } else if (teacher) {
              setTeachers((prev) => prev.map((t) => (t.id === teacher.id ? teacher : t)));
            }
          } else if (data.type === 'AUDIT_LOG_ADDED') {
            setAuditLogs((prev) => [data.data, ...prev.slice(0, 99)]);
          }
        } catch (err) {
          console.error('SSE Message parsing error', err);
        }
      };

      eventSource.onerror = () => {
        // SSE auto-reconnects in browser
      };
    } catch (e) {
      console.error('SSE setup error', e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [showToast]);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('elswedy_role', role);

    api
      .getTeachers({ requesterRole: role })
      .then((data) => {
        if (Array.isArray(data)) setTeachers(data);
      })
      .catch(console.error);

    if (role === 'teacher' || role === 'employee') {
      setCurrentView('teacher-portal');
    } else if (
      currentView === 'teacher-portal' ||
      currentView === 'teacher_portal' ||
      currentView.startsWith('teacher-')
    ) {
      setCurrentView('dashboard');
    }
  };

  const handleToggleAccountStatus = async (teacherId: string) => {
    try {
      const res = await api.toggleTeacherStatus(teacherId, 'HR Admin');
      setTeachers((prev) => prev.map((t) => (t.id === teacherId ? res.teacher : t)));
      if (res.auditLog) setAuditLogs((prev) => [res.auditLog, ...prev]);
      showToast(`Account status updated to ${res.teacher.accountStatus}`, 'info');
    } catch (e: any) {
      showToast(e.message || 'Failed to update account status', 'error');
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    try {
      const res = await api.deleteTeacher(teacherId);
      if (res.success) {
        setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
        if (res.auditLog) setAuditLogs((prev) => [res.auditLog, ...prev]);
        setStats((prev) => ({ ...prev, totalTeachers: Math.max(0, prev.totalTeachers - 1) }));
        showToast('Faculty member deleted successfully', 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to delete teacher', 'error');
    }
  };

  const currentTeacher = teachers.find((t) => t.id === 'tch-01') || teachers[0];
  const currentUserName =
    sessionUser?.name ||
    (currentRole === 'hr_admin'
      ? 'Mariam Soliman (HR Admin)'
      : currentRole === 'board'
      ? 'Eng. Ahmed Rafat (Board Observer)'
      : currentTeacher?.fullName || 'Eng. Ahmed Hassan');
  const teacherTodayRecord = todayRecords.find((r) => r.teacherId === currentTeacher?.id);
  const teacherHistoryRecords = allAttendanceRecords.filter(
    (r) => r.teacherId === currentTeacher?.id
  );
  const teacherLeaves = leaves.filter((l) => l.teacherId === currentTeacher?.id);
  const teacherSchedule = schedules.find((s) => s.id === currentTeacher?.scheduleId);

  // Dedicated /dev Developer Diagnostics Route
  if (isDevMode) {
    return (
      <DevDiagnosticsView
        onBackToApp={() => {
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/');
          }
          setIsDevMode(false);
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <>
      {/* Welcome Splash Screen - ONLY shown after explicit successful login */}
      {isAuthenticated && showSplash && (
        <WelcomeSplashScreen
          userName={
            sessionUser?.name ||
            (currentRole === 'teacher' || currentRole === 'employee'
              ? currentTeacher?.fullName || 'Faculty Member'
              : currentRole === 'board'
              ? 'Eng. Ahmed Rafat'
              : 'Mariam Soliman')
          }
          userRoleTitle={
            currentRole === 'hr_admin'
              ? 'HR Administrator'
              : currentRole === 'board'
              ? 'Board Executive Observer'
              : 'Faculty Member'
          }
          onComplete={() => setShowSplash(false)}
          durationMs={1800}
        />
      )}

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="min-h-screen"
          >
            <LoginView onLoginSuccess={handleLoginSuccess} />
          </motion.div>
        ) : (
          <motion.div
            key="app-main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-screen w-screen max-h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#070A11] flex flex-col antialiased text-[#263238] dark:text-gray-100 transition-colors duration-200 relative"
          >
            {/* Subtle Background Mesh Ornaments */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-40 dark:opacity-20 bg-[radial-gradient(#E5252A_0.5px,transparent_0.5px)] [background-size:24px_24px]" />

            <div className="flex flex-1 relative z-10 h-full max-h-full overflow-hidden">
              {/* Left Sidebar with Elswedy Red Accents */}
              <Sidebar
                currentView={currentView}
                setCurrentView={setCurrentView}
                onSelectView={setCurrentView}
                currentRole={currentRole}
                onReplayIntro={() => setShowSplash(true)}
                isDarkMode={isDarkMode}
                onLogout={handleLogout}
                isMobileOpen={isMobileMenuOpen}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
              />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0 h-full max-h-full overflow-hidden">
                {/* Header with quick dark/light toggle and notifications */}
                <Header
                  currentRole={currentRole}
                  notifications={notifications}
                  onMarkNotificationsRead={() =>
                    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
                  }
                  isDarkMode={isDarkMode}
                  onToggleDarkMode={setIsDarkMode}
                  onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
                />

                {/* Page Body View Router with Motion Transitions */}
                <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto max-w-7xl w-full mx-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentView}
                      initial={{ opacity: 0, y: 10, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.99 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      {currentView === 'dashboard' && (
                        <DashboardView
                          stats={stats}
                          events={events}
                          todayRecords={todayRecords}
                          departments={departments}
                          currentRole={currentRole}
                          onViewTeacher={(id) => setViewingTeacherId(id)}
                          onInspectRecord={(record) => setInspectingAttendanceRecord(record)}
                          onCorrectionSuccess={(rec) => {
                            setTodayRecords((prev) =>
                              prev.map((r) => (r.id === rec.id ? rec : r))
                            );
                            api.getDashboard().then((d) => {
                              if (d.stats) setStats(d.stats);
                            });
                          }}
                        />
                      )}

                      {currentView === 'teachers' && (
                        <TeachersList
                          teachers={teachers}
                          departments={departments}
                          schedules={schedules}
                          devices={devices}
                          currentRole={currentRole}
                          onAddTeacher={() => setIsAddTeacherOpen(true)}
                          onViewTeacher={(id) => setViewingTeacherId(id)}
                          onOpenBiometricWizard={(t) => setEnrollingTeacher(t)}
                          onToggleAccountStatus={handleToggleAccountStatus}
                          onEditTeacher={(t) => setEditingTeacher(t)}
                          onDeleteTeacher={handleDeleteTeacher}
                        />
                      )}

                      {currentView === 'attendance' && (
                        <AttendanceHistoryView
                          records={allAttendanceRecords.length > 0 ? allAttendanceRecords : todayRecords}
                          departments={departments}
                          currentRole={currentRole}
                          onViewTeacher={(id) => setViewingTeacherId(id)}
                          onInspectRecord={(record) => setInspectingAttendanceRecord(record)}
                          onOpenCorrectionModal={(record) => {
                            setEditingCorrectionRecord(record);
                          }}
                        />
                      )}

                      {currentView === 'devices' && (
                        <FingerprintDevicesView
                          devices={devices}
                          currentRole={currentRole}
                          onRefreshDevices={() => {
                            api.getDevices().then(setDevices);
                          }}
                        />
                      )}

                      {currentView === 'schedules' && (
                        <ScheduleManagement
                          schedules={schedules}
                          currentRole={currentRole}
                          onRefreshSchedules={() => api.getSchedules().then(setSchedules)}
                        />
                      )}

                      {currentView === 'leaves' && (
                        <LeaveManagement
                          leaves={leaves}
                          teachers={teachers}
                          currentRole={currentRole}
                          onRefreshLeaves={() => api.getLeaves().then(setLeaves)}
                        />
                      )}

                      {currentView === 'departments' && (
                        <DepartmentView
                          departments={departments}
                          teachers={teachers}
                          currentRole={currentRole}
                          onViewTeacher={(id) => setViewingTeacherId(id)}
                        />
                      )}

                      {currentView === 'reports' && (
                        <ReportsView
                          records={allAttendanceRecords.length > 0 ? allAttendanceRecords : todayRecords}
                          departments={departments}
                          teachers={teachers}
                        />
                      )}

                      {(currentView === 'audit' || currentView === 'audit-logs') && (
                        <AuditLogsView logs={auditLogs} currentRole={currentRole} onRefresh={fetchAllData} />
                      )}

                      {(currentView === 'system-logs' || currentView === 'system_logs') && (
                        <SystemLogsView />
                      )}

                      {currentView === 'settings' && (
                        <SystemSettingsView
                          currentRole={currentRole}
                          isDarkMode={isDarkMode}
                          onToggleDarkMode={setIsDarkMode}
                        />
                      )}

                      {(currentView === 'teacher_portal' ||
                        currentView === 'teacher-portal' ||
                        currentView.startsWith('teacher-')) &&
                        currentTeacher && (
                          <TeacherPortal
                            teacher={currentTeacher}
                            todayRecord={teacherTodayRecord}
                            historyRecords={teacherHistoryRecords}
                            leaves={teacherLeaves}
                            schedule={teacherSchedule}
                            currentView={currentView}
                            onSelectView={setCurrentView}
                            onRefreshData={fetchAllData}
                          />
                        )}
                    </motion.div>
                  </AnimatePresence>
                </main>
              </div>
            </div>

            {/* Global Modals */}
            <RegisterBiometricWizard
              isOpen={!!enrollingTeacher}
              onClose={() => setEnrollingTeacher(null)}
              teacher={enrollingTeacher}
              devices={devices}
              onRegistrationComplete={(updatedTeacher) => {
                setTeachers((prev) =>
                  prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t))
                );
                setEnrollingTeacher(null);
                showToast(`Biometric template registered for ${updatedTeacher.fullName}`, 'success');
              }}
            />

            <AddTeacherModal
              isOpen={isAddTeacherOpen}
              onClose={() => setIsAddTeacherOpen(false)}
              departments={departments}
              schedules={schedules}
              devices={devices}
              currentRole={currentRole}
              adminName={currentUserName}
              onTeacherCreated={(newTeacher) => {
                setTeachers((prev) => [newTeacher, ...prev]);
                setStats((prev) => ({
                  ...prev,
                  totalTeachers: prev.totalTeachers + 1,
                  registeredFingerprints:
                    newTeacher.fingerprintStatus === 'Registered'
                      ? prev.registeredFingerprints + 1
                      : prev.registeredFingerprints,
                }));
                showToast(`Faculty member ${newTeacher.fullName} added successfully`, 'success');
              }}
            />

            <EditTeacherModal
              isOpen={!!editingTeacher}
              onClose={() => setEditingTeacher(null)}
              teacher={editingTeacher}
              departments={departments}
              schedules={schedules}
              currentRole={currentRole}
              adminName={currentUserName}
              onTeacherUpdated={(updated) => {
                setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
                setEditingTeacher(null);
                showToast(`Profile updated for ${updated.fullName}`, 'success');
                fetchAllData();
              }}
            />

            <TeacherDetailModal
              isOpen={!!viewingTeacherId}
              onClose={() => setViewingTeacherId(null)}
              teacherId={viewingTeacherId}
              schedules={schedules}
              allAttendanceRecords={allAttendanceRecords.length > 0 ? allAttendanceRecords : todayRecords}
              allLeaves={leaves}
              currentRole={currentRole}
              currentUserName={currentUserName}
              onOpenBiometricWizard={(t) => {
                setViewingTeacherId(null);
                setEnrollingTeacher(t);
              }}
            />

            <AttendanceRecordDetailModal
              isOpen={!!inspectingAttendanceRecord}
              onClose={() => setInspectingAttendanceRecord(null)}
              record={inspectingAttendanceRecord}
              currentRole={currentRole}
              onViewTeacher={(id) => setViewingTeacherId(id)}
              onOpenCorrection={(rec) => setEditingCorrectionRecord(rec)}
            />

            {editingCorrectionRecord && (
              <AttendanceCorrectionModal
                isOpen={!!editingCorrectionRecord}
                onClose={() => setEditingCorrectionRecord(null)}
                record={editingCorrectionRecord}
                onCorrectionSuccess={(updatedRecord) => {
                  setTodayRecords((prev) =>
                    prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
                  );
                  setAllAttendanceRecords((prev) =>
                    prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
                  );
                  setEditingCorrectionRecord(null);
                  showToast('Attendance record corrected', 'success');
                  fetchAllData();
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
}
