'use server';

import { getJobs as fetchJobs } from '@/lib/firebase/firestore';
import type { Job } from '@/types';

export async function searchJobs(query: string): Promise<{ jobs: Job[], source: 'api' | 'mock' }> {
    if (!query || query.trim() === '') {
        return { jobs: [], source: 'mock' };
    }
    // Fetch up to 10 pages for a user-initiated search
    return await fetchJobs(query, '10');
}
