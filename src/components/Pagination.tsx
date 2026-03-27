import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  loading = false
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const startRecord = (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalCount);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 sm:px-6 rounded-b-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{startRecord}</span> to{' '}
          <span className="font-medium">{endRecord}</span> of{' '}
          <span className="font-medium">{totalCount}</span> records
        </div>

        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1 || loading}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pageNumbers.map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                  ...
                </span>
              );
            }

            const isCurrentPage = pageNum === page;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum as number)}
                disabled={loading}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isCurrentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages || loading}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex md:hidden items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1 || loading}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg whitespace-nowrap">
            Page {page} of {totalPages}
          </div>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages || loading}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 justify-center"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
