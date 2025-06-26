'use server';

import { getJobs as fetchJobs } from '@/lib/firebase/firestore';
import type { Job, SearchFilters } from '@/types';

export async function searchJobs(query: string, filters: SearchFilters): Promise<{ jobs: Job[] }> {
    if (!query || query.trim() === '') {
        return { jobs: [] };
    }
    return await fetchJobs(query, filters);
}
