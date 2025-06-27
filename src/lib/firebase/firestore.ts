
import type { Job, SearchFilters } from "@/types";

const ARBEITNOW_API_URL = 'https://www.arbeitnow.com/api/job-board-api';

async function fetchFromApi(params: Record<string, string>) {
    const url = new URL(ARBEITNOW_API_URL);
    Object.entries(params).forEach(([k, v]) => {
        if (v) { // Ensure value is not empty or null
            url.searchParams.append(k, v)
        }
    });

    console.log(`[API_CALL] Requesting URL: ${url.toString()}`);

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'User-Agent': 'JobScoutApp/1.0'
            },
            // Removing 'cache: no-store' as Server Actions are dynamic by default
            // and this can sometimes cause issues in certain Node.js environments.
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[ERROR] API call failed with status ${response.status}: ${errorText}`);
            
            let errorMessage = `API request failed with status ${response.status}.`;
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson && errorJson.message) {
                    errorMessage = `API Error: ${errorJson.message}`;
                }
            } catch (e) {
                // Not a JSON error, use the raw text if it's short
                if (errorText.length < 200) {
                   errorMessage = errorText;
                }
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        return result.data; // Arbeitnow API returns data in the `data` property
    } catch (err: any) {
        console.error(`[FATAL_ERROR] Network/API error during call:`, err);
        if (err.cause) {
          console.error('[ERROR_CAUSE]', err.cause);
        }
        throw new Error(err.message || 'An unknown network error occurred during fetch.');
    }
}


const transformApiJob = (apiJob: any): Job => ({
    id: apiJob.slug, // Use slug as the unique ID
    title: apiJob.title,
    company: apiJob.company_name || 'N/A',
    companyLogo: undefined, // Arbeitnow doesn't provide a company logo
    location: apiJob.location || 'Not specified',
    country: undefined, // Country is not a separate field in the new API
    datePosted: new Date(apiJob.created_at * 1000).toISOString(), // Convert Unix timestamp to ISO string
    description: apiJob.description, // Full description is available in the list view
    applyUrl: apiJob.url,
    employmentType: apiJob.job_types?.join(', '), // Corrected from 'tags'
    highlights: undefined, // Highlights are not provided by Arbeitnow
});

export async function getJobs(query: string, filters: SearchFilters = {}): Promise<{ jobs: Job[] }> {
  const apiParams: Record<string, string> = { 
    search: query,
    page: filters.page?.toString() || '1',
  };

  if (filters.location && filters.location !== 'all') {
    apiParams.location = filters.location;
  }
  if (filters.remoteOnly) {
    apiParams.remote = 'true';
  }

  const apiData = await fetchFromApi(apiParams);
  
  if (Array.isArray(apiData)) {
      const jobs = apiData.map(transformApiJob).filter(job => job.id && job.title && job.description);
      const uniqueJobs = Array.from(new Map(jobs.map(job => [job.id, job])).values());
      return { jobs: uniqueJobs };
  }

  console.warn('API returned unexpected data format, returning empty list.');
  return { jobs: [] };
}

export async function getJob(id: string): Promise<Job | null> {
  if (!id) return null;

  // The Arbeitnow API doesn't have a direct "get by ID" endpoint.
  // As a workaround, we can search for the slug, which should be a unique part of the title or content.
  const apiParams = { search: id, page: '1' };
  const apiData = await fetchFromApi(apiParams);

  if (Array.isArray(apiData) && apiData.length > 0) {
    // Find the job with the exact matching slug (which is the job's ID in our app)
    const matchedJob = apiData.find(job => job.slug === id);
    if (matchedJob) {
      return transformApiJob(matchedJob);
    }
  }

  // If no exact match is found after checking the first page, return null.
  console.warn(`Could not find a job with id: ${id}`);
  return null;
}
