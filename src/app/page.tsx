import { getJobs } from '@/lib/firebase/firestore';
import JobSearchAndListings from '@/components/jobs/JobSearchAndListings';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default async function Home() {
  const { jobs, source } = await getJobs();

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

      {source === 'mock' && (
        <Alert variant="destructive" className="mb-8">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Developer Notice: Using Mock Data</AlertTitle>
          <AlertDescription>
            Could not connect to the live jobs API. The application is currently displaying sample data. To connect to the live API, please ensure your `NEXT_PUBLIC_RAPIDAPI_KEY` is set correctly in the `.env` file and restart the server.
          </AlertDescription>
        </Alert>
      )}

      <JobSearchAndListings initialJobs={jobs} />
    </div>
  );
}
