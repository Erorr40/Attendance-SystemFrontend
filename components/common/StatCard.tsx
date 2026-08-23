import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = '#E5252A',
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs hover:shadow-md hover:border-red-200/80 transition-all duration-300 card-hover-alive flex flex-col justify-between relative overflow-hidden group">
      {/* Top micro color accent line on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-[#E5252A] group-hover:to-[#FF6B6F] transition-all duration-300"
      />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#263238] dark:text-white">
              {value}
            </span>
            {trend && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full shadow-2xs ${
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs"
            style={{
              color: accentColor,
              backgroundColor:
                accentColor === '#E5252A'
                  ? 'rgba(229, 37, 42, 0.08)'
                  : accentColor === '#10B981'
                  ? 'rgba(16, 185, 129, 0.08)'
                  : accentColor === '#F59E0B'
                  ? 'rgba(245, 158, 11, 0.08)'
                  : 'rgba(59, 130, 246, 0.08)',
              borderColor:
                accentColor === '#E5252A'
                  ? 'rgba(229, 37, 42, 0.15)'
                  : accentColor === '#10B981'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(0,0,0,0.06)',
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3.5 pt-3 border-t border-gray-100/90 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
        <span>{subtitle}</span>
      </div>
    </div>
  );
};

