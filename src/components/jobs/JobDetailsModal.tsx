
'use client';

import React, { useEffect, useState } from 'react';
import type { Job } from '@/types';
import { enrichJobPost, EnrichJobPostInput } from '@/ai/flows/ai-job-post-enricher';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Building, Calendar, DollarSign, Star, Zap } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function AIEnhancementCard({ job }: { job: EnrichJobPostInput }) {
    const [enrichedData, setEnrichedData] = useState<{ suggestedSalaryRange: string; suggestedCompanyRating: string; additionalPerks: string; } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        enrichJobPost(job)
            .then(data => {
                setEnrichedData(data);
            })
            .catch(e => {
                console.error("AI enrichment failed", e);
                setError("Failed to load AI insights.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [job]);

    if (isLoading) {
        return (
             <Card className="bg-primary/5 border-primary/20 mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <Zap className="h-6 w-6" />
                         <Skeleton className="h-7 w-56" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        );
    }
    
    if (error || !enrichedData) {
        return null; // Don't show the card if it fails
    }

    return (
        <Card className="bg-primary/5 border-primary/20 mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary text-lg">
                    <Zap className="h-5 w-5" />
                    <span>AI-Powered Insights</span>
                </CardTitle>
                 <p className="text-sm text-muted-foreground pt-1">
                    Suggestions by AI based on job details. Please verify independently.
                </p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
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
}

interface JobDetailsModalProps {
  job: Job | null;
  onOpenChange: (open: boolean) => void;
}

export default function JobDetailsModal({ job: initialJob, onOpenChange }: JobDetailsModalProps) {
  const jobToDisplay = initialJob;

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  };
  
  return (
    <Dialog open={!!initialJob} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 grid grid-rows-[1fr_auto] max-h-[90vh]">
        <ScrollArea>
            <div className="p-6">
                <DialogHeader>
                    {jobToDisplay ? (
                        <>
                            <DialogTitle className="text-2xl md:text-3xl font-bold mb-2 font-headline">{jobToDisplay.title}</DialogTitle>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
                                <span className="flex items-center gap-2"><Building className="h-4 w-4" />{jobToDisplay.company}</span>
                                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{jobToDisplay.location}</span>
                                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />Posted {format(new Date(jobToDisplay.datePosted), 'MMMM d, yyyy')}</span>
                            </div>
                        </>
                    ) : null}
                </DialogHeader>

                {jobToDisplay && (
                    <>
                        <Separator className="my-6"/>
                        
                        <h2 className="text-xl font-semibold mb-4 font-headline">Job Description</h2>
                        <div
                          className="text-muted-foreground leading-relaxed max-w-none [&_a]:text-primary [&_a]:underline"
                          dangerouslySetInnerHTML={{ __html: jobToDisplay.description || '' }}
                        />

                        {jobToDisplay.highlights && Object.values(jobToDisplay.highlights).some(v => v && v.length > 0) && <Separator className="my-6" />}
            
                        {jobToDisplay.highlights && Object.entries(jobToDisplay.highlights).map(([key, value]) => (
                            value && Array.isArray(value) && value.length > 0 && (
                                <div key={key} className="mt-4 first:mt-0">
                                    <h3 className="text-lg font-semibold font-headline mb-3">{key}</h3>
                                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                        {value.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        ))}
                        
                        <AIEnhancementCard job={{
                            jobTitle: jobToDisplay.title,
                            companyName: jobToDisplay.company,
                            location: jobToDisplay.location,
                            description: "The job description is provided in HTML format." // Pass a placeholder since the full HTML can be large
                        }} />
                    </>
                )}
            </div>
        </ScrollArea>
        {jobToDisplay && (
            <DialogFooter className="p-6 bg-background border-t">
                <Button variant="outline" onClick={() => handleOpenChange(false)}>Close</Button>
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href={jobToDisplay.applyUrl} target="_blank" rel="noopener noreferrer">Apply Now</Link>
                </Button>
            </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
