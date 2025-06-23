import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

const JobCardSkeleton = () => (
    <Card className="flex flex-col h-full">
        <CardHeader className="flex flex-row items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className='flex-grow space-y-2 pt-1'>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-2 pt-0">
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 shrink-0" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 shrink-0" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);

export default function JobListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}
