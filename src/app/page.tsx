import { getJobs } from '@/lib/firebase/firestore';
import JobSearchAndListings from '@/components/jobs/JobSearchAndListings';

export default async function Home() {
  const jobs = await getJobs();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Find Your Next Opportunity
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Search through thousands of job listings aggregated from top job boards, enriched with AI-powered insights.
        </p>
      </div>
      <JobSearchAndListings initialJobs={jobs} />
    </div>
  );
}
