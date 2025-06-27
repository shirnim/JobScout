
import type { Job, SearchFilters } from "@/types";

const ARBEITNOW_API_URL = 'https://api.arbeitnow.com/api/job-board-api';

async function fetchFromApi(params: Record<string, string>) {
    const url = new URL(ARBEITNOW_API_URL);
    Object.entries(params).forEach(([k, v]) => {
        if (v) { // Only append parameters that have a value
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
            cache: 'no-store', // Disable caching for API calls to ensure fresh data
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
    } catch (err) {
        console.error(`[FATAL_ERROR] Network/API error during call:`, err);
        throw err; // re-throw the error to be handled by the caller
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
    employmentType: apiJob.tags?.join(', '), // Tags can represent employment type
    highlights: undefined, // Highlights are not provided by Arbeitnow
});

export async function getJobs(query: string, filters: SearchFilters = {}): Promise<{ jobs: Job[] }> {
  if (!query) {
    return { jobs: [] };
  }
  
  const apiParams: Record<string, string> = { 
    search: query,
    page: filters.page?.toString() || '1',
    location: filters.location || '',
    remote: filters.remoteOnly ? 'true' : ''
  };

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
  console.warn(`[DEPRECATED] getJob was called for id: ${id}, but the Arbeitnow API does not support fetching individual jobs by ID. This function will be removed in a future update.`);
  return null;
}
