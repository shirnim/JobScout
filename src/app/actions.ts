'use server';

import { getJobs as fetchJobs } from '@/lib/firebase/firestore';
import type { Job, SearchFilters } from '@/types';

export async function searchJobs(query: string, filters: SearchFilters): Promise<{ jobs: Job[], source: 'api' | 'mock' }> {
    if (!query || query.trim() === '') {
        return { jobs: [], source: 'mock' };
    }
    // Fetch up to 20 pages for a user-initiated search
    return await fetchJobs(query, '20', filters);
}
