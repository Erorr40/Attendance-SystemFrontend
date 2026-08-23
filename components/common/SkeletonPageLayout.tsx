import React from 'react';

export const SkeletonPageLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070A11] flex flex-col antialiased select-none animate-pulse">
      <div className="flex flex-1">
        {/* Sidebar Skeleton */}
        <aside className="w-64 bg-white dark:bg-[#0C101C] border-r border-gray-200/80 dark:border-slate-800/60 p-5 flex flex-col justify-between shrink-0 hidden md:flex">
          <div className="space-y-6">
            {/* Logo Skeleton */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-800" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-md w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-slate-900 rounded-md w-1/2" />
              </div>
            </div>

            {/* Nav Items Skeleton */}
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 dark:bg-slate-800/80 rounded-md w-1/3 mb-2" />
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-100/80 dark:bg-slate-900/60">
                  <div className="w-5 h-5 rounded-md bg-gray-200 dark:bg-slate-800" />
                  <div className="h-3.5 bg-gray-200 dark:bg-slate-800 rounded-md w-2/3" />
                </div>
              ))}
            </div>
          </div>

          {/* User Footer Skeleton */}
          <div className="p-3 rounded-xl bg-gray-100 dark:bg-slate-900 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-800" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded-md w-2/3" />
              <div className="h-2.5 bg-gray-100 dark:bg-slate-800/60 rounded-md w-1/2" />
            </div>
          </div>
        </aside>

        {/* Main Section Skeleton */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header Skeleton */}
          <header className="bg-white dark:bg-[#0C101C] border-b border-gray-200/80 dark:border-slate-800/60 px-6 py-4 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded-md w-48" />
              <div className="h-3 bg-gray-100 dark:bg-slate-900 rounded-md w-32" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-slate-800" />
              <div className="w-28 h-9 rounded-xl bg-gray-200 dark:bg-slate-800" />
            </div>
          </header>

          {/* Body Cards & Tables Skeleton */}
          <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
            {/* Top Stat Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0C101C] border border-gray-200/80 dark:border-slate-800/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded-md w-24" />
                    <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-800" />
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded-md w-16" />
                  <div className="h-2 bg-gray-100 dark:bg-slate-900 rounded-md w-full" />
                </div>
              ))}
            </div>

            {/* Middle Section Split Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0C101C] border border-gray-200/80 dark:border-slate-800/60 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-md w-40" />
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded-md w-20" />
                </div>
                {[1, 2, 3, 4].map((row) => (
                  <div key={row} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-slate-800/40">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-800" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 bg-gray-200 dark:bg-slate-800 rounded-md w-32" />
                        <div className="h-2.5 bg-gray-100 dark:bg-slate-900 rounded-md w-20" />
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded-full w-20" />
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#0C101C] border border-gray-200/80 dark:border-slate-800/60 space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-md w-32 pb-3" />
                <div className="w-full h-40 rounded-xl bg-gray-100 dark:bg-slate-900/80 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-800" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded-md w-full" />
                  <div className="h-3 bg-gray-100 dark:bg-slate-900 rounded-md w-3/4" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
