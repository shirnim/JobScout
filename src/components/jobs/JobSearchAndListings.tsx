
"use client";

import { useState, useMemo } from 'react';
import type { Job } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileDown, ChevronLeft, ChevronRight, Loader2, Terminal } from 'lucide-react';
import JobList from './JobList';
import { searchJobs } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const JOBS_PER_PAGE = 5;

export default function JobSearchAndListings() {
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [source, setSource] = useState<'api' | 'mock' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [employmentType, setEmploymentType] = useState('');
  const [datePosted, setDatePosted] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setCurrentPage(1);

    const result = await searchJobs(query, {
      employmentType,
      datePosted,
      remoteOnly
    });
    setJobs(result.jobs);
    setSource(result.source);
    if (typeof window !== 'undefined') {
        localStorage.setItem('lastSearchResults', JSON.stringify(result.jobs));
    }
    setIsLoading(false);
  };

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
    return jobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
  }, [currentPage, jobs]);

  const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE);

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
    if (jobs.length === 0) return;

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
      ...jobs.map(job => [
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
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <div className="relative flex-grow w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                type="text"
                aria-label="Search jobs"
                placeholder="Search by title, company, or keyword..."
                className="w-full pl-12 pr-4 py-6 text-base rounded-lg shadow-sm focus-visible:ring-accent"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { handleSearch(); }}}
                />
            </div>
            <Button 
                onClick={handleSearch} 
                className="w-full sm:w-auto shrink-0"
                size="lg"
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4"/>}
                Search
            </Button>
            <Button 
                onClick={handleExport} 
                variant="outline" 
                className="w-full sm:w-auto shrink-0" 
                size="lg"
                disabled={jobs.length === 0 || isLoading}
            >
                <FileDown className="mr-2 h-4 w-4" />
                Export
            </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
            <Select value={employmentType} onValueChange={setEmploymentType}>
                <SelectTrigger className="w-full sm:w-auto sm:w-48">
                    <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="FULLTIME">Full-time</SelectItem>
                    <SelectItem value="PARTTIME">Part-time</SelectItem>
                    <SelectItem value="CONTRACTOR">Contract</SelectItem>
                    <SelectItem value="INTERN">Internship</SelectItem>
                </SelectContent>
            </Select>
            <Select value={datePosted} onValueChange={setDatePosted}>
                <SelectTrigger className="w-full sm:w-auto sm:w-48">
                    <SelectValue placeholder="Date Posted" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Any time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="3days">Last 3 days</SelectItem>
                    <SelectItem value="week">Last week</SelectItem>
                    <SelectItem value="month">Last month</SelectItem>
                </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 self-start sm:self-center pt-2 sm:pt-0">
                <Checkbox id="remote-only" checked={remoteOnly} onCheckedChange={(checked) => setRemoteOnly(!!checked)} />
                <label
                    htmlFor="remote-only"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Remote only
                </label>
            </div>
        </div>

        {source === 'mock' && hasSearched && !isLoading && (
            <Alert variant="destructive" className="mb-8">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Developer Notice: Using Mock Data</AlertTitle>
            <AlertDescription>
                Could not connect to the live jobs API. The application is currently displaying sample data. To connect to the live API, please ensure your `NEXT_PUBLIC_RAPIDAPI_KEY` is set correctly in the `.env` file and restart the server.
            </AlertDescription>
            </Alert>
        )}

        {isLoading && (
            <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )}
      
        {!isLoading && hasSearched && (
            <>
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
            </>
        )}
    </div>
  );
}
