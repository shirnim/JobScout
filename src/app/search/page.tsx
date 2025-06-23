
import JobSearchAndListings from '@/components/jobs/JobSearchAndListings';

export default function SearchPage() {
    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground font-headline">
                    Find Your Next Opportunity
                </h1>
                <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Search thousands of listings from top companies to find your perfect fit.
                </p>
            </div>
            <JobSearchAndListings />
        </div>
    );
}
