import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50]
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pages = useMemo(() => {
    const getPages = () => {
      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, '...', totalPages];
      }

      if (currentPage >= totalPages - 3) {
        return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      }

      return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };
    return getPages();
  }, [currentPage, totalPages]);

  if (totalPages === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
        Showing <span className="font-medium text-[#263238] dark:text-gray-200">{startItem}</span> to{' '}
        <span className="font-medium text-[#263238] dark:text-gray-200">{endItem}</span> of{' '}
        <span className="font-medium text-[#263238] dark:text-gray-200">{totalItems}</span> results
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1724] text-[#263238] dark:text-gray-200 rounded-md py-1 pl-2 pr-6 focus:outline-none focus:ring-2 focus:ring-[#E5252A] appearance-none cursor-pointer"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}

        <nav className="inline-flex rounded-md shadow-sm isolate">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1724] hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="hidden sm:flex">
            {pages.map((page, idx) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0F1724] border-y border-gray-300 dark:border-gray-700"
                  >
                    ...
                  </span>
                );
              }
              
              const isCurrentPage = page === currentPage;
              
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => onPageChange(page as number)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border-y border-gray-300 dark:border-gray-700 transition-colors ${
                    isCurrentPage 
                      ? 'z-10 bg-[#E5252A] text-white border-[#E5252A] dark:border-[#E5252A]' 
                      : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0F1724] hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1724] hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </nav>
      </div>
    </div>
  );
};
