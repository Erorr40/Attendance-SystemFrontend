import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Department } from '../../types/index.ts';

interface AnalyticsOverviewProps {
  departments: Department[];
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ departments = [] }) => {
  const safeDepts = Array.isArray(departments) ? departments : [];

  // Weekly attendance trend (Egyptian School week: Sun to Thu)
  const weeklyData = [
    { day: 'Sun', rate: 94.2, onTime: 38, late: 4, absent: 2 },
    { day: 'Mon', rate: 91.5, onTime: 36, late: 6, absent: 3 },
    { day: 'Tue', rate: 88.0, onTime: 34, late: 8, absent: 4 },
    { day: 'Wed', rate: 95.0, onTime: 39, late: 3, absent: 1 },
    { day: 'Thu (Today)', rate: 92.8, onTime: 39, late: 5, absent: 2 },
  ];

  // Department comparison data
  const deptData = safeDepts.map((d) => ({
    name: d.code,
    fullName: d.name,
    rate: d.attendancePercentage || 92,
    teachers: d.totalTeachers,
  }));

  // Status Distribution
  const pieData = [
    { name: 'Present On-Time', value: 34, color: '#10B981' },
    { name: 'Late Arrival', value: 5, color: '#F59E0B' },
    { name: 'Absent', value: 2, color: '#E5252A' },
    { name: 'On Approved Leave', value: 1, color: '#3B82F6' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Weekly Attendance Trend Chart */}
      <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-xs p-5 flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
            <div>
              <h3 className="font-bold text-sm text-[#263238] dark:text-white">Weekly Attendance Trend</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Overall faculty attendance rate (%) this week</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800">
                Avg: 92.3%
              </span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" strokeOpacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} unit="%" />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Attendance Rate']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    color: '#F8FAFC',
                    borderColor: '#475569',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  }}
                  itemStyle={{ color: '#F8FAFC' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#E5252A"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#E5252A', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Highest rate: Wednesday (95%)</span>
          <span>Target compliance threshold: 90.0%</span>
        </div>
      </div>

      {/* 2. Department Breakdown Bar Chart */}
      <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-xs p-5 flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
            <div>
              <h3 className="font-bold text-sm text-[#263238] dark:text-white">Department Comparison</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Attendance compliance by department code</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" strokeOpacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} unit="%" />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Attendance Rate']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    color: '#F8FAFC',
                    borderColor: '#475569',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#F8FAFC' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                />
                <Bar dataKey="rate" fill="#E5252A" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>SDAI: Software • NCI: Networks • IAR: Robotics</span>
        </div>
      </div>
    </div>
  );
};
