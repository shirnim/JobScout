
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Job } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';
import JobList from './JobList';

interface JobSearchAndListingsProps {
  initialJobs: Job[];
}

const JOBS_PER_PAGE = 9;

export default function JobSearchAndListings({ initialJobs }: JobSearchAndListingsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredJobs = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    if (!lowercasedTerm) {
      return initialJobs;
    }
    return initialJobs.filter(job =>
      job.title.toLowerCase().includes(lowercasedTerm) ||
      job.company.toLowerCase().includes(lowercasedTerm) ||
      job.location.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm, initialJobs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
    return filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
  }, [currentPage, filteredJobs]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleExport = () => {
    if (filteredJobs.length === 0) return;

    const headers = ["ID", "Title", "Company", "Location", "Date Posted", "Description", "Apply URL"];
    const escapeCsvCell = (cell: string | undefined | null): string => {
        if (cell === null || cell === undefined) {
            return '';
        }
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvRows = [
      headers.join(','),
      ...filteredJobs.map(job => [
        escapeCsvCell(job.id),
        escapeCsvCell(job.title),
        escapeCsvCell(job.company),
        escapeCsvCell(job.location),
        escapeCsvCell(job.datePosted),
        escapeCsvCell(job.description),
        escapeCsvCell(job.applyUrl)
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'job_listings.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
            <div className="relative flex-grow w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                type="text"
                aria-label="Search jobs"
                placeholder="Search by title, company, or location..."
                className="w-full pl-12 pr-4 py-6 text-base rounded-lg shadow-sm focus-visible:ring-accent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button 
                onClick={handleExport} 
                variant="outline" 
                className="w-full sm:w-auto shrink-0" 
                disabled={filteredJobs.length === 0}
            >
                <FileDown className="mr-2 h-4 w-4" />
                Export as CSV
            </Button>
      </div>

      <JobList jobs={paginatedJobs} />
      
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 mt-8">
          <Button onClick={handlePrevPage} disabled={currentPage === 1} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button onClick={handleNextPage} disabled={currentPage >= totalPages} variant="outline">
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
