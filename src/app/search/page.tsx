import JobSearchAndListings from '@/components/jobs/JobSearchAndListings';

export default function SearchPage() {
    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground font-headline mb-8">
                Find Your Next Opportunity
            </h1>
            <JobSearchAndListings />
        </div>
    );
}
