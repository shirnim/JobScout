
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Job } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileDown, ChevronLeft, ChevronRight, Loader2, Terminal, Filter, X } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { getAutocompleteSuggestions } from '@/ai/flows/autocomplete-flow';
import { useDebounce } from '@/hooks/use-debounce';
import { Card } from '@/components/ui/card';

const JOBS_PER_PAGE = 5;

export default function JobSearchAndListings() {
  const [query, setQuery] = useState('');
  const [masterJobList, setMasterJobList] = useState<Job[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [source, setSource] = useState<'api' | 'mock' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [employmentType, setEmploymentType] = useState('all');
  const [datePosted, setDatePosted] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setQuery(searchQuery);
    setSuggestions([]);
    setShowSuggestions(false);
    setIsLoading(true);
    setHasSearched(true);
    setCurrentPage(1);

    const result = await searchJobs(searchQuery, {
      employmentType,
      datePosted,
      remoteOnly,
      location: locationFilter
    });
    
    const uniqueJobs = Array.from(new Map(result.jobs.map(job => [job.id, job])).values());
    setMasterJobList(uniqueJobs);
    setJobs(uniqueJobs);
    setSource(result.source);
    if (typeof window !== 'undefined') {
        localStorage.setItem('lastSearchResults', JSON.stringify(uniqueJobs));
    }
    setIsLoading(false);
  }, [employmentType, datePosted, remoteOnly, locationFilter]);


  const handleApplyFilters = () => {
    let filtered = [...masterJobList];

    // Location
    if (locationFilter) {
      filtered = filtered.filter(job => 
        job.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Remote only
    if (remoteOnly) {
      filtered = filtered.filter(job => 
        job.location?.toLowerCase().includes('remote')
      );
    }

    // Employment type
    if (employmentType && employmentType !== 'all') {
      filtered = filtered.filter(job => job.employmentType === employmentType);
    }

    // Date posted
    if (datePosted && datePosted !== 'all') {
      const now = new Date();
      filtered = filtered.filter(job => {
        if (!job.datePosted) return false;
        const jobDate = new Date(job.datePosted);
        const diffDays = (now.getTime() - jobDate.getTime()) / (1000 * 3600 * 24);
        
        switch (datePosted) {
          case 'today': return diffDays <= 1;
          case '3days': return diffDays <= 3;
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          default: return true;
        }
      });
    }

    setJobs(filtered);
    setCurrentPage(1);
    setIsFilterOpen(false);
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

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
  };

  return (
    <div>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
            <div className="relative flex-grow w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Input
                  type="text"
                  aria-label="Search jobs"
                  placeholder="Search by title, company, or keyword..."
                  className="w-full pl-12 pr-10 py-6 text-base rounded-lg shadow-sm focus-visible:ring-accent"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { handleSearch(query); }}}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // Delay to allow click
                  autoComplete="off"
                />
                 {query && (
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
                {showSuggestions && (isSuggesting || suggestions.length > 0) && (
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
                                        onMouseDown={(e) => { // use onMouseDown to fire before onBlur
                                            e.preventDefault();
                                            handleSuggestionClick(suggestion);
                                        }}
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                )}
            </div>
            <Button 
                onClick={() => handleSearch(query)} 
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
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto shrink-0">
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Filters</h4>
                            <p className="text-sm text-muted-foreground">
                                Refine your job search.
                            </p>
                        </div>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                    className="col-span-2 h-10"
                                    placeholder="e.g. New York"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label>Job Type</Label>
                                <Select value={employmentType} onValueChange={setEmploymentType}>
                                    <SelectTrigger className="col-span-2 h-10">
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
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label>Date Posted</Label>
                                <Select value={datePosted} onValueChange={setDatePosted}>
                                    <SelectTrigger className="col-span-2 h-10">
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
                            </div>
                            <div className="flex items-center space-x-2 pt-2 pl-1">
                                <Checkbox id="remote-only-popover" checked={remoteOnly} onCheckedChange={(checked) => setRemoteOnly(!!checked)} />
                                <label
                                    htmlFor="remote-only-popover"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Remote only
                                </label>
                            </div>
                        </div>
                         <Button onClick={handleApplyFilters} disabled={isLoading || masterJobList.length === 0} className="w-full">
                            Apply Filters
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
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
