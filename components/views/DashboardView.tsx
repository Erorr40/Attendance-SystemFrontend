import React, { useState } from 'react';
import { SummaryCards } from '../dashboard/SummaryCards.tsx';
import { LiveAttendanceStream } from '../dashboard/LiveAttendanceStream.tsx';
import { TodayAttendanceTable } from '../dashboard/TodayAttendanceTable.tsx';
import { AnalyticsOverview } from '../dashboard/AnalyticsOverview.tsx';
import { AttendanceCorrectionModal } from '../dashboard/AttendanceCorrectionModal.tsx';
import {
  DashboardStats,
  AttendanceEvent,
  AttendanceRecord,
  Department,
  UserRole,
} from '../../types/index.ts';

interface DashboardViewProps {
  stats: DashboardStats;
  events: AttendanceEvent[];
  todayRecords: AttendanceRecord[];
  departments: Department[];
  currentRole: UserRole;
  onOpenScannerModal: () => void;
  onViewTeacher: (teacherId: string) => void;
  onCorrectionSuccess: (updatedRecord: AttendanceRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  events = [],
  todayRecords = [],
  departments = [],
  currentRole,
  onOpenScannerModal,
  onViewTeacher,
  onCorrectionSuccess,
}) => {
  const [selectedRecordForCorrection, setSelectedRecordForCorrection] =
    useState<AttendanceRecord | null>(null);

  return (
    <div className="space-y-5">
      {/* 1. Summary Cards (4 Compact Metric Cards) */}
      <SummaryCards stats={stats} />

      {/* 2. Middle Row: Today's Faculty Attendance (Table) + Live Attendance Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Attendance Table */}
        <div className="lg:col-span-8">
          <TodayAttendanceTable
            records={todayRecords}
            departments={departments}
            currentRole={currentRole}
            onViewTeacher={onViewTeacher}
            onOpenCorrectionModal={(record) => setSelectedRecordForCorrection(record)}
          />
        </div>

        {/* Live Biometric Turnstile Feed */}
        <div className="lg:col-span-4">
          <LiveAttendanceStream
            events={events}
            onOpenScannerModal={onOpenScannerModal}
          />
        </div>
      </div>

      {/* 3. Analytics & Compliance Overview */}
      <AnalyticsOverview departments={departments} />

      {/* Manual Attendance Correction Modal */}
      <AttendanceCorrectionModal
        isOpen={!!selectedRecordForCorrection}
        onClose={() => setSelectedRecordForCorrection(null)}
        record={selectedRecordForCorrection}
        currentRole={currentRole}
        onCorrectionSuccess={(rec) => {
          onCorrectionSuccess(rec);
          setSelectedRecordForCorrection(null);
        }}
      />
    </div>
  );
};
