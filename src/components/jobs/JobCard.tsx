import type { Job } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Building, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface JobCardProps {
  job: Job;
  onViewDetails: (job: Job) => void;
}

export default function JobCard({ job, onViewDetails }: JobCardProps) {
  const postedDate = new Date(job.datePosted);
  const timeAgo = formatDistanceToNow(postedDate, { addSuffix: true });

  return (
    <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="flex flex-row items-start gap-4">
        <Avatar className="h-12 w-12 border">
            <AvatarImage src={job.companyLogo || ''} alt={`${job.company} logo`} />
            <AvatarFallback>{job.company?.charAt(0) || 'C'}</AvatarFallback>
        </Avatar>
        <div className='flex-grow overflow-hidden'>
            <CardTitle className="text-lg font-semibold leading-snug truncate">{job.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                <Building className="h-4 w-4 shrink-0" />
                <span className="truncate">{job.company}</span>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 pt-0">
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
        <Button onClick={() => onViewDetails(job)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
