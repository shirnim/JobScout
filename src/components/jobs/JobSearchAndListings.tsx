"use client";

import { useState, useMemo } from 'react';
import type { Job } from '@/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import JobList from './JobList';

interface JobSearchAndListingsProps {
  initialJobs: Job[];
}

export default function JobSearchAndListings({ initialJobs }: JobSearchAndListingsProps) {
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div>
      <div className="relative mb-8">
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
      <JobList jobs={filteredJobs} />
    </div>
  );
}
