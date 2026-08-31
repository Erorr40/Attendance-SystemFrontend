import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { LeaveRequest, Teacher, UserRole } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import { Modal } from '../common/Modal.tsx';
import { GrabScrollContainer } from '../common/GrabScrollContainer.tsx';
import { UserAvatar } from '../common/UserAvatar.tsx';
import { useToast } from '../common/Toast.tsx';
import { api } from '../../services/api.ts';

interface LeaveManagementProps {
  leaves: LeaveRequest[];
  teachers: Teacher[];
  currentRole: UserRole;
  onRefreshLeaves: () => void;
}

export const LeaveManagement: React.FC<LeaveManagementProps> = ({
  leaves = [],
  teachers = [],
  currentRole,
  onRefreshLeaves,
}) => {
  const safeLeaves = Array.isArray(leaves) ? leaves : [];
  const safeTeachers = Array.isArray(teachers) ? teachers : [];
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Add Leave Form State
  const [teacherId, setTeacherId] = useState<string>(safeTeachers[0]?.id || '');
  const [leaveType, setLeaveType] = useState<any>('Sick Leave');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<string>('');

  // Review Form State
  const [reviewAction, setReviewAction] = useState<'Approved' | 'Rejected'>('Approved');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const canReview = currentRole === 'hr_admin';

  const filtered = safeLeaves.filter((l) => {
    const matchesSearch =
      (l.teacherName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.departmentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.leaveType || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenReview = (leave: LeaveRequest, action: 'Approved' | 'Rejected') => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setRejectionReason('');
    setIsReviewModalOpen(true);
  };

  const handleProcessReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setIsSubmitting(true);
    try {
      const reviewerName = 'Mariam Soliman (HR Desk)';

      await api.reviewLeave({
        leaveId: selectedLeave.id,
        status: reviewAction,
        reviewerName,
        rejectionReason: reviewAction === 'Rejected' ? rejectionReason : undefined,
      });

      setIsReviewModalOpen(false);
      showToast(`Leave request marked as ${reviewAction}`, reviewAction === 'Approved' ? 'success' : 'info');
      onRefreshLeaves();
    } catch (err: any) {
      showToast(err.message || 'Failed to review leave request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      await api.submitLeave({
        teacherId,
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });

      setIsAddModalOpen(false);
      showToast('Leave request submitted successfully', 'success');
      onRefreshLeaves();
      setReason('');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit leave request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#263238] dark:text-white">Leave Management</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Process official faculty excuses, medical leaves, and official school missions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E5252A] hover:bg-[#D01B20] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Leave Request</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search leave applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-hidden focus:border-[#E5252A] bg-gray-50/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50/50 text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
        >
          <option value="ALL">All Statuses</option>
          <option value="Pending">Pending Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Leaves Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <GrabScrollContainer>
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Teacher</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Dates & Duration</th>
                <th className="py-3 px-4">Justification Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reviewer</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={l.teacherName} size="sm" />
                        <div className="min-w-0">
                          <p className="font-bold text-[#263238] dark:text-white leading-snug">{l.teacherName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {l.employeeId} • {l.departmentName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{l.leaveType}</td>
                    <td className="py-3 px-4">
                      <p className="font-mono text-gray-600">
                        {l.startDate} to {l.endDate}
                      </p>
                      <span className="text-[10px] font-bold text-gray-400">
                        {l.totalDays} {l.totalDays === 1 ? 'Day' : 'Days'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate" title={l.reason}>
                      {l.reason}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={l.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-[11px]">
                      {l.reviewedBy || <span className="text-gray-400 italic">Pending</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {l.status === 'Pending' && canReview ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenReview(l, 'Approved')}
                            className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200 flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleOpenReview(l, 'Rejected')}
                            className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] border border-rose-200 flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </GrabScrollContainer>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`${reviewAction === 'Approved' ? 'Approve' : 'Reject'} Leave Request`}
        subtitle={`Application for ${selectedLeave?.teacherName} (${selectedLeave?.leaveType})`}
        maxWidth="md"
      >
        <form onSubmit={handleProcessReview} className="space-y-4 text-xs">
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-1">
            <p className="font-bold text-[#263238] dark:text-white">{selectedLeave?.teacherName}</p>
            <p className="text-gray-500 dark:text-gray-400 font-mono">
              Dates: {selectedLeave?.startDate} to {selectedLeave?.endDate} ({selectedLeave?.totalDays} Days)
            </p>
            <p className="text-gray-700 dark:text-gray-300">Reason: "{selectedLeave?.reason}"</p>
          </div>

          {reviewAction === 'Rejected' && (
            <div>
              <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
                Rejection Reason *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State the institutional reason for declining this request..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-normal text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
              />
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 hover:bg-gray-50 dark:bg-gray-800/50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer ${
                reviewAction === 'Approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isSubmitting ? 'Processing...' : `Confirm ${reviewAction}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Leave Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Submit Leave Application"
        subtitle="Institutional Excuse, Medical Leave or Official School Mission"
        maxWidth="md"
      >
        <form onSubmit={handleCreateLeave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
              Faculty Member *
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            >
              {safeTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.employeeId} - {t.departmentName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
              Leave Classification *
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-medium text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            >
              <option value="Sick Leave">Sick / Medical Leave</option>
              <option value="Casual Leave">Casual / Personal Leave</option>
              <option value="Official Mission">Official School Mission (External Workshop/Event)</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-mono text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#263238] dark:text-white uppercase tracking-wider mb-1">
              Reason & Details *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the purpose and any official documents attached..."
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 font-normal text-[#263238] dark:text-white focus:outline-hidden focus:border-[#E5252A]"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 hover:bg-gray-50 dark:bg-gray-800/50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#E5252A] hover:bg-[#D01B20] text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
