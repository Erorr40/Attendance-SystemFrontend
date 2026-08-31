import React from 'react';
import { AttendanceStatus, DeviceStatus, LeaveStatus } from '../../types/index.ts';

interface BadgeProps {
  status: AttendanceStatus | DeviceStatus | LeaveStatus | string;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'sm', showDot = true }) => {
  let bg = 'bg-gray-100';
  let text = 'text-gray-700 dark:text-gray-300';
  let dot = 'bg-gray-400';

  switch (status) {
    case 'Present':
      bg = 'bg-emerald-50';
      text = 'text-emerald-700 border-emerald-200';
      dot = 'bg-emerald-500';
      break;
    case 'Late':
      bg = 'bg-amber-50';
      text = 'text-amber-700 border-amber-200';
      dot = 'bg-amber-500';
      break;
    case 'Very Late':
      bg = 'bg-orange-50';
      text = 'text-orange-700 border-orange-200';
      dot = 'bg-orange-600';
      break;
    case 'Absent':
      bg = 'bg-rose-50';
      text = 'text-rose-700 border-rose-200';
      dot = 'bg-rose-500';
      break;
    case 'Early Leave':
      bg = 'bg-purple-50';
      text = 'text-purple-700 border-purple-200';
      dot = 'bg-purple-500';
      break;
    case 'On Leave':
      bg = 'bg-blue-50';
      text = 'text-blue-700 border-blue-200';
      dot = 'bg-blue-500';
      break;
    case 'ONLINE':
    case 'Online':
      bg = 'bg-emerald-50';
      text = 'text-emerald-700 border-emerald-200';
      dot = 'bg-emerald-500 animate-pulse';
      break;
    case 'OFFLINE':
    case 'Offline':
      bg = 'bg-rose-50';
      text = 'text-rose-700 border-rose-200';
      dot = 'bg-rose-500';
      break;
    case 'SYNCING':
    case 'Synchronizing':
      bg = 'bg-amber-50';
      text = 'text-amber-700 border-amber-200';
      dot = 'bg-amber-500 animate-ping';
      break;
    case 'APPROVED':
    case 'Approved':
      bg = 'bg-emerald-50';
      text = 'text-emerald-700 border-emerald-200';
      dot = 'bg-emerald-500';
      break;
    case 'PENDING':
    case 'Pending':
      bg = 'bg-amber-50';
      text = 'text-amber-700 border-amber-200';
      dot = 'bg-amber-500';
      break;
    case 'REJECTED':
    case 'Rejected':
      bg = 'bg-rose-50';
      text = 'text-rose-700 border-rose-200';
      dot = 'bg-rose-500';
      break;
    case 'Registered':
    case 'ACTIVE':
    case 'Active':
      bg = 'bg-emerald-50 dark:bg-emerald-950/50';
      text = 'text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      dot = 'bg-emerald-500';
      break;
    case 'Not Registered':
      bg = 'bg-gray-100 dark:bg-gray-800';
      text = 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700';
      dot = 'bg-gray-400';
      break;
    case 'Inactive':
    case 'Suspended':
      bg = 'bg-rose-50 dark:bg-rose-950/50';
      text = 'text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      dot = 'bg-rose-500';
      break;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium border border-transparent ${bg} ${text} ${padding} whitespace-nowrap`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {status}
    </span>
  );
};
