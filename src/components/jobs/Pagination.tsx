'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const paginationRange = useMemo(() => {
    const range = (start: number, end: number) => {
      let length = end - start + 1;
      return Array.from({ length }, (_, idx) => idx + start);
    };

    // Show all pages if 7 or less
    if (totalPages <= 7) {
      return range(1, totalPages);
    }
    
    // If current page is near the start
    if (currentPage <= 4) {
      return [...range(1, 5), '...', totalPages];
    }
    
    // If current page is near the end
    if (currentPage > totalPages - 4) {
      return [1, '...', ...range(totalPages - 4, totalPages)];
    }

    // If current page is somewhere in the middle
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  if (totalPages <= 1) {
      return null;
  }

  return (
    <div className="flex items-center justify-center space-x-1 mt-8">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
        size="icon"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {paginationRange.map((pageNumber, index) => {
        if (typeof pageNumber === 'string') {
          return (
            <Button variant="ghost" disabled key={`ellipsis-${index}`} className="h-10 w-10 p-0" aria-hidden="true">
              ...
            </Button>
          );
        }

        return (
          <Button
            key={`page-${pageNumber}`}
            onClick={() => onPageChange(pageNumber)}
            variant={currentPage === pageNumber ? 'default' : 'outline'}
            size="icon"
            aria-label={`Go to page ${pageNumber}`}
          >
            {pageNumber}
          </Button>
        );
      })}

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        variant="outline"
        size="icon"
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
