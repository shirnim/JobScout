'use server';

import { getJobs as fetchJobs } from '@/lib/firebase/firestore';
import type { Job, SearchFilters } from '@/types';

export async function searchJobs(query: string, filters: SearchFilters): Promise<{ jobs: Job[] }> {
    if (!query || query.trim() === '') {
        return { jobs: [] };
    }
    // Fetch up to 50 pages for a user-initiated search to provide more comprehensive results.
    return await fetchJobs(query, '50', filters);
}
