import type { Job } from '@/types';
import JobCard from './JobCard';

interface JobListProps {
  jobs: Job[];
  onViewDetails: (job: Job) => void;
}

export default function JobList({ jobs, onViewDetails }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">No jobs found</h2>
        <p className="text-muted-foreground mt-2">Try adjusting your search terms.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} onViewDetails={onViewDetails} />
      ))}
    </div>
  );
}
