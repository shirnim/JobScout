import JobSearchAndListings from '@/components/jobs/JobSearchAndListings';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Find Your Next Opportunity
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Search through thousands of job listings aggregated from top job boards. Gain a competitive edge with our AI-powered insights and market analytics.
        </p>
      </div>

      <JobSearchAndListings />
    </div>
  );
}
