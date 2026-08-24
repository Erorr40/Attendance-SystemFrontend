import {
  DashboardStats,
  Teacher,
  Department,
  Schedule,
  AttendanceRecord,
  AttendanceEvent,
  FingerprintDevice,
  LeaveRequest,
  AuditLog,
  NotificationItem,
  SystemSettings,
  User,
  AuthResponse,
} from '../types/index.ts';
function resolveApiBase(): string {
  let url = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    url.startsWith('http://') &&
    !url.includes('localhost') &&
    !url.includes('127.0.0.1')
  ) {
    url = url.replace('http://', 'https://');
  }
  return url;
}

const API_BASE = resolveApiBase();

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('elswedy_auth_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: globalThis.Response): Promise<T> {
  if (res.status === 401) {
    localStorage.removeItem('elswedy_auth_token');
    localStorage.removeItem('elswedy_role');
    localStorage.removeItem('elswedy_user');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Session expired or unauthorized. Please log in.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Authentication & Security
  login: async (credentials: { usernameOrEmail: string; password: string }): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse<AuthResponse>(res);
  },

  getCurrentUser: async (): Promise<{ user: User; teacher?: Teacher }> => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ user: User; teacher?: Teacher }>(res);
  },

  logout: async (data: { userName: string; role: string; userId?: string }): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  revealTeacherPassword: async (data: {
    teacherId: string;
    requesterRole: string;
    requesterName: string;
  }): Promise<{ success: boolean; teacherId: string; teacherName: string; username: string; plainPassword: string }> => {
    const res = await fetch(`${API_BASE}/auth/reveal-teacher-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; teacherId: string; teacherName: string; username: string; plainPassword: string }>(res);
  },

  resetTeacherPassword: async (data: {
    teacherId: string;
    newPassword?: string;
    requesterRole: string;
    requesterName: string;
  }): Promise<{ success: boolean; teacherId: string; plainPassword: string; message: string }> => {
    const res = await fetch(`${API_BASE}/auth/reset-teacher-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; teacherId: string; plainPassword: string; message: string }>(res);
  },

  updateProfile: async (data: {
    userId?: string;
    role?: string;
    name?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    currentPassword?: string;
    newPassword?: string;
    email?: string;
    teacherId?: string;
  }): Promise<{ success: boolean; user: User; teacher?: Teacher }> => {
    const res = await fetch(`${API_BASE}/profile/update`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; user: User; teacher?: Teacher }>(res);
  },

  // Dashboard
  getDashboard: async (): Promise<{
    stats: DashboardStats;
    todayAttendance: AttendanceRecord[];
    todayRecords: AttendanceRecord[];
    liveEvents: AttendanceEvent[];
    departments: Department[];
    devices: FingerprintDevice[];
    systemSettings: SystemSettings;
  }> => {
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<any>(res);
    return {
      ...data,
      todayAttendance: data.todayRecords || data.todayAttendance || [],
      todayRecords: data.todayRecords || data.todayAttendance || [],
    };
  },

  // Teachers
  getTeachers: async (params?: { departmentId?: string; status?: string; search?: string; requesterRole?: string }): Promise<Teacher[]> => {
    const query = new URLSearchParams();
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.requesterRole) query.append('requesterRole', params.requesterRole);
    const res = await fetch(`${API_BASE}/teachers?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Teacher[]>(res);
  },

  getTeacherDetails: async (id: string, requesterRole?: string): Promise<{ teacher: Teacher; attendanceHistory: AttendanceRecord[]; leaves: LeaveRequest[] }> => {
    const query = requesterRole ? `?requesterRole=${encodeURIComponent(requesterRole)}` : '';
    const res = await fetch(`${API_BASE}/teachers/${id}${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ teacher: Teacher; attendanceHistory: AttendanceRecord[]; leaves: LeaveRequest[] }>(res);
  },

  createTeacher: async (data: Partial<Teacher> & { registerFingerprintNow?: boolean; deviceId?: string; adminName?: string; adminRole?: string }): Promise<Teacher> => {
    const res = await fetch(`${API_BASE}/teachers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Teacher>(res);
  },

  updateTeacher: async (id: string, data: Partial<Teacher> & { adminName?: string }): Promise<Teacher> => {
    const res = await fetch(`${API_BASE}/teachers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Teacher>(res);
  },

  deleteTeacher: async (id: string): Promise<{ success: boolean; message?: string; deleted?: Teacher; auditLog?: AuditLog }> => {
    const res = await fetch(`${API_BASE}/teachers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; message?: string; deleted?: Teacher; auditLog?: AuditLog }>(res);
  },

  toggleTeacherStatus: async (id: string, adminName?: string): Promise<{ teacher: Teacher; auditLog: AuditLog }> => {
    const res = await fetch(`${API_BASE}/teachers/${id}/toggle-status`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminName }),
    });
    return handleResponse<{ teacher: Teacher; auditLog: AuditLog }>(res);
  },

  registerFingerprint: async (teacherId: string, deviceId?: string, adminName?: string): Promise<{ success: boolean; teacher: Teacher }> => {
    const res = await fetch(`${API_BASE}/teachers/${teacherId}/register-fingerprint`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ deviceId, adminName }),
    });
    return handleResponse<{ success: boolean; teacher: Teacher }>(res);
  },

  // Attendance
  getAttendance: async (params?: { date?: string; departmentId?: string; status?: string; search?: string }): Promise<AttendanceRecord[]> => {
    const query = new URLSearchParams();
    if (params?.date) query.append('date', params.date);
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`${API_BASE}/attendance?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<AttendanceRecord[]>(res);
  },

  getAttendanceRecords: async (params?: { date?: string; departmentId?: string; status?: string; search?: string }): Promise<AttendanceRecord[]> => {
    return api.getAttendance(params);
  },

  scanFingerprint: async (teacherId: string, deviceId?: string, customTimestamp?: string, isOfflineSync?: boolean): Promise<{ success: boolean; record: AttendanceRecord; event: AttendanceEvent; isNewCheckIn: boolean }> => {
    const res = await fetch(`${API_BASE}/attendance/scan`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ teacherId, deviceId, customTimestamp, isOfflineSync }),
    });
    return handleResponse<{ success: boolean; record: AttendanceRecord; event: AttendanceEvent; isNewCheckIn: boolean }>(res);
  },

  correctAttendance: async (data: {
    recordId: string;
    newStatus: string;
    newCheckIn?: string;
    newCheckOut?: string;
    reason: string;
    adminName: string;
    adminRole: string;
  }): Promise<{ success: boolean; record: AttendanceRecord; auditLog?: AuditLog }> => {
    const res = await fetch(`${API_BASE}/attendance/correction`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; record: AttendanceRecord; auditLog?: AuditLog }>(res);
  },

  // Leaves
  getLeaves: async (params?: { departmentId?: string; status?: string; teacherId?: string }): Promise<LeaveRequest[]> => {
    const query = new URLSearchParams();
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    if (params?.status) query.append('status', params.status);
    if (params?.teacherId) query.append('teacherId', params.teacherId);
    const res = await fetch(`${API_BASE}/leaves?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<LeaveRequest[]>(res);
  },

  createLeave: async (data: { teacherId: string; leaveType: string; startDate: string; endDate: string; reason: string }): Promise<LeaveRequest> => {
    const res = await fetch(`${API_BASE}/leaves`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<LeaveRequest>(res);
  },

  submitLeave: async (data: { teacherId: string; leaveType: string; startDate: string; endDate: string; reason: string }): Promise<LeaveRequest> => {
    return api.createLeave(data);
  },

  reviewLeave: async (data: { leaveId: string; status: 'Approved' | 'Rejected'; reviewerName: string; rejectionReason?: string }): Promise<void> => {
    if (data.status === 'Approved') {
      return api.approveLeave(data.leaveId, data.reviewerName);
    } else {
      return api.rejectLeave(data.leaveId, data.reviewerName, data.rejectionReason || 'Declined by administration');
    }
  },

  approveLeave: async (id: string, reviewerName: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/leaves/${id}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reviewerName }),
    });
    await handleResponse<any>(res);
  },

  rejectLeave: async (id: string, reviewerName: string, rejectionReason: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/leaves/${id}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reviewerName, rejectionReason }),
    });
    await handleResponse<any>(res);
  },

  // Devices
  getDevices: async (): Promise<FingerprintDevice[]> => {
    const res = await fetch(`${API_BASE}/devices`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<FingerprintDevice[]>(res);
  },

  toggleDeviceStatus: async (id: string, status?: string, adminName?: string): Promise<FingerprintDevice> => {
    const res = await fetch(`${API_BASE}/devices/${id}/toggle-status`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, adminName }),
    });
    return handleResponse<FingerprintDevice>(res);
  },

  syncDevice: async (id: string): Promise<{ message: string; device: FingerprintDevice }> => {
    const res = await fetch(`${API_BASE}/devices/${id}/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    });
    return handleResponse<{ message: string; device: FingerprintDevice }>(res);
  },

  // Departments
  getDepartments: async (): Promise<Department[]> => {
    const res = await fetch(`${API_BASE}/departments`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Department[]>(res);
  },

  // Schedules
  getSchedules: async (): Promise<Schedule[]> => {
    const res = await fetch(`${API_BASE}/schedules`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Schedule[]>(res);
  },

  createSchedule: async (data: Partial<Schedule> & { adminName?: string }): Promise<Schedule> => {
    const res = await fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Schedule>(res);
  },

  // Reports
  getReports: async (params: { startDate: string; endDate: string; departmentId?: string; status?: string }): Promise<{ summary: any; records: AttendanceRecord[] }> => {
    const query = new URLSearchParams();
    query.append('startDate', params.startDate);
    query.append('endDate', params.endDate);
    if (params.departmentId && params.departmentId !== 'ALL') query.append('departmentId', params.departmentId);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    const res = await fetch(`${API_BASE}/reports/attendance?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ summary: any; records: AttendanceRecord[] }>(res);
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<AuditLog[]>(res);
  },

  // Notifications
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<NotificationItem[]>(res);
  },

  markAllNotificationsRead: async (): Promise<void> => {
    const res = await fetch(`${API_BASE}/notifications/read-all`, { 
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    await handleResponse<any>(res);
  },

  // System Status & DB Logs
  getSystemStatus: async (): Promise<{
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
  }> => {
    const res = await fetch(`${API_BASE}/system/status`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  reconnectDatabase: async (): Promise<{ success: boolean; isConnected: boolean; message: string; error?: string }> => {
    const res = await fetch(`${API_BASE}/system/reconnect-db`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    });
    return handleResponse<{ success: boolean; isConnected: boolean; message: string; error?: string }>(res);
  },

  seedDatabase: async (): Promise<{ success: boolean; message: string; teachersCount: number; stats: DashboardStats }> => {
    const res = await fetch(`${API_BASE}/system/seed`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    });
    return handleResponse<{ success: boolean; message: string; teachersCount: number; stats: DashboardStats }>(res);
  },

  // Settings
  getSettings: async (): Promise<SystemSettings> => {
    const res = await fetch(`${API_BASE}/settings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<SystemSettings>(res);
  },

  updateSettings: async (settings: Partial<SystemSettings>, adminName?: string): Promise<SystemSettings> => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...settings, adminName }),
    });
    return handleResponse<SystemSettings>(res);
  },
};
