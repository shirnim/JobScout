import React from 'react';
import { getJob } from '@/lib/firebase/firestore';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MapPin, Building, Calendar, DollarSign, Star, Zap, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { enrichJobPost, EnrichJobPostInput } from '@/ai/flows/ai-job-post-enricher';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

async function AIEnhancementCard({ job }: { job: EnrichJobPostInput }) {
    try {
        const enrichedData = await enrichJobPost(job);

        return (
            <Card className="bg-primary/5 border-primary/20 mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <Zap className="h-6 w-6" />
                        <span>AI-Powered Insights</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground pt-1">
                        Suggestions by AI based on job details. Please verify independently.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                        <DollarSign className="h-5 w-5 mt-1 text-primary/80 shrink-0" />
                        <div>
                            <h4 className="font-semibold">Suggested Salary Range</h4>
                            <p className="text-muted-foreground">{enrichedData.suggestedSalaryRange}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Star className="h-5 w-5 mt-1 text-primary/80 shrink-0" />
                        <div>
                            <h4 className="font-semibold">Suggested Company Rating</h4>
                            <p className="text-muted-foreground">{enrichedData.suggestedCompanyRating}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Zap className="h-5 w-5 mt-1 text-primary/80 shrink-0" />
                        <div>
                            <h4 className="font-semibold">Potential Perks</h4>
                            <p className="text-muted-foreground">{enrichedData.additionalPerks}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    } catch(e) {
        console.error("AI enrichment failed", e)
        return null;
    }
}

export default async function JobPage({ params }: { params: { id: string } }) {
  const job = await getJob(params.id);

  if (!job) {
    notFound();
  }

  const postedDate = new Date(job.datePosted);

  return (
    <div className="max-w-4xl mx-auto">
        <Button asChild variant="ghost" className="mb-4">
            <Link href="/"><ChevronLeft className="mr-2 h-4 w-4" />Back to jobs</Link>
        </Button>
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 font-headline">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
                <span className="flex items-center gap-2"><Building className="h-4 w-4" />{job.company}</span>
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{job.location}</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />Posted on {format(postedDate, 'MMMM d, yyyy')}</span>
              </div>
            </div>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto shrink-0">
                <Link href={job.applyUrl} target="_blank" rel="noopener noreferrer">Apply Now</Link>
            </Button>
          </div>
        </CardHeader>
        <Separator/>
        <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 font-headline">Job Description</h2>
            <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {job.description}
            </div>
        </CardContent>
      </Card>

      <React.Suspense fallback={
        <Card className="bg-primary/5 border-primary/20 mt-8">
            <CardHeader><CardTitle>
                <Skeleton className="h-7 w-64" />
            </CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
      }>
        <AIEnhancementCard job={{
            jobTitle: job.title,
            companyName: job.company,
            location: job.location,
            description: job.description
        }} />
      </React.Suspense>
    </div>
  );
}
