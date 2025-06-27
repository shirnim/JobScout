
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Job } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileDown, Loader2, X, AlertCircle } from 'lucide-react';
import JobList from './JobList';
import { searchJobs } from '@/app/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getAutocompleteSuggestions } from '@/ai/flows/autocomplete-flow';
import { useDebounce } from '@/hooks/use-debounce';
import { Card } from '@/components/ui/card';
import JobDetailsModal from './JobDetailsModal';
import JobListSkeleton from './JobListSkeleton';
import AdBanner from '@/components/ads/AdBanner';
import Pagination from './Pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const JOBS_PER_PAGE = 9;

export default function JobSearchAndListings() {
  const [query, setQuery] = useState('');
  const [masterJobList, setMasterJobList] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAppending, setIsAppending] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [apiPage, setApiPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Filter state
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [country, setCountry] = useState('all');

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsSuggesting(true);
      try {
        const result = await getAutocompleteSuggestions({ query: debouncedQuery });
        setSuggestions(result.suggestions || []);
      } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsSuggesting(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSearch = async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    setQuery(searchQuery);
    setSuggestions([]);
    setShowSuggestions(false);
    setIsLoading(true);
    setHasSearched(true);
    setCurrentPage(1);
    setApiPage(1);
    setSearchError(null);

    try {
        const result = await searchJobs(trimmedQuery, {
          location: country === 'all' ? undefined : country,
          remoteOnly,
          page: 1,
        });
        
        const uniqueJobs = Array.from(new Map(result.jobs.map(job => [job.id, job])).values());
        setMasterJobList(uniqueJobs);
        setHasMorePages(uniqueJobs.length > 0);
        
        if (typeof window !== 'undefined') {
            localStorage.setItem('lastSearchResults', JSON.stringify(uniqueJobs));
        }
    } catch(error: any) {
        console.error("Search failed:", error);
        setSearchError(error.message || 'An unknown error occurred.');
        setMasterJobList([]);
        setHasMorePages(false);
    } finally {
        setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (isAppending || !hasMorePages || !query) return;
    
    setSearchError(null);
    setIsAppending(true);
    const nextPage = apiPage + 1;

    try {
        const result = await searchJobs(query, {
            location: country === 'all' ? undefined : country,
            remoteOnly,
            page: nextPage,
        });

        if (result.jobs.length > 0) {
            const newJobs = result.jobs.filter(newJob => !masterJobList.some(existingJob => existingJob.id === newJob.id));
            const updatedMasterList = [...masterJobList, ...newJobs];
            setMasterJobList(updatedMasterList);
            setApiPage(nextPage);
            if (typeof window !== 'undefined') {
                localStorage.setItem('lastSearchResults', JSON.stringify(updatedMasterList));
            }
        } else {
            setHasMorePages(false);
        }
    } catch (error: any) {
        console.error("Failed to load more jobs:", error);
        setSearchError(error.message || 'An unknown error occurred while loading more jobs.');
    } finally {
        setIsAppending(false);
    }
  };

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
    return masterJobList.slice(startIndex, startIndex + JOBS_PER_PAGE);
  }, [currentPage, masterJobList]);

  const totalPages = Math.ceil(masterJobList.length / JOBS_PER_PAGE);

  const handleExport = () => {
    if (masterJobList.length === 0) return;

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
      ...masterJobList.map(job => [
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

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
        <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Input
              type="text"
              aria-label="Search jobs"
              placeholder="e.g., Software Engineer"
              className="w-full pl-12 pr-10 py-3 rounded-lg shadow-sm focus-visible:ring-accent h-11 text-base"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (searchError) setSearchError(null);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleSearch(query); }}}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // Delay to allow click
              autoComplete="off"
              disabled={isLoading || isAppending}
            />
             {query && !isLoading && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                    onClick={() => {
                        setQuery('');
                        setSuggestions([]);
                    }}
                >
                    <X className="h-4 w-4 text-muted-foreground" />
                </Button>
            )}
            {showSuggestions && debouncedQuery.length >= 3 && (
                <Card className="absolute z-50 w-full mt-2 overflow-hidden shadow-lg">
                    {isSuggesting && (
                        <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Generating suggestions...</span>
                        </div>
                    )}
                    {!isSuggesting && suggestions.length > 0 && (
                        <ul className="py-2">
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion}
                                    className="px-4 py-2 cursor-pointer hover:bg-accent"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSuggestionClick(suggestion);
                                    }}
                                >
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    )}
                    {!isSuggesting && suggestions.length === 0 && (
                         <div className="p-4 text-sm text-muted-foreground">
                            No suggestions found for &quot;{debouncedQuery}&quot;.
                        </div>
                    )}
                </Card>
            )}
        </div>
        
        <Button size="lg" onClick={() => handleSearch(query)} disabled={isLoading || isAppending} className="h-11 w-full sm:w-auto shrink-0">
            <Search className="h-5 w-5" />
            <span className="ml-2">Search</span>
        </Button>
      </div>

        <div className="flex flex-wrap gap-4 mb-8">
            <div className="grid gap-2 flex-grow">
                <Label htmlFor='country-select'>Country</Label>
                <Select value={country} onValueChange={setCountry} name="country-select">
                    <SelectTrigger className="h-10">
                        <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Worldwide</SelectItem>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="India">India</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-end pb-1">
                <div className="flex items-center space-x-2">
                    <Checkbox id="remote-only-popover" checked={remoteOnly} onCheckedChange={(checked) => setRemoteOnly(!!checked)} />
                    <Label htmlFor="remote-only-popover" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Remote only
                    </Label>
                </div>
            </div>
        </div>

        <AdBanner />

        {searchError && (
            <Alert variant="destructive" className="my-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Search Failed</AlertTitle>
                <AlertDescription>
                    {searchError}
                </AlertDescription>
            </Alert>
        )}

        {isLoading && (
             <div className="space-y-6">
                <div className="flex justify-center items-center gap-3 text-muted-foreground pt-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-xl font-medium">Fetching the latest opportunities...</p>
                </div>
                <JobListSkeleton />
            </div>
        )}
      
        {!isLoading && hasSearched && (
            <>
            {masterJobList.length > 0 && (
                <div className="flex justify-end items-center gap-2 mb-6">
                    <Button 
                        onClick={handleExport} 
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                    >
                        <FileDown className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            )}
            
            <JobList jobs={paginatedJobs} onViewDetails={setSelectedJob} />

            {hasMorePages && masterJobList.length > 0 && (
              <div className="text-center mt-8">
                <Button onClick={handleLoadMore} disabled={isAppending || isLoading}>
                  {isAppending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Load More Results
                </Button>
              </div>
            )}
            
            {totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
            </>
        )}

        <JobDetailsModal 
            job={selectedJob} 
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setSelectedJob(null);
                }
            }}
        />
    </div>
  );
}
