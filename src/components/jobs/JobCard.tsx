import Link from 'next/link';
import type { Job } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Building, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const postedDate = new Date(job.datePosted);
  const timeAgo = formatDistanceToNow(postedDate, { addSuffix: true });

  return (
    <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="text-lg font-semibold leading-snug">{job.title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
          <Building className="h-4 w-4 shrink-0" />
          <span className="truncate">{job.company}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{timeAgo}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href={`/job/${encodeURIComponent(job.id)}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
