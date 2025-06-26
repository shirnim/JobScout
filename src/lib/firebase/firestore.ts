
import type { Job, SearchFilters } from "@/types";

async function fetchFromApi(endpoint: string, params: Record<string, string>) {
    const key = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
    const host = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;

    if (!key || !host || key.includes('your-rapidapi-key')) {
        console.error("[RapidAPI] Missing or placeholder API key. API calls will fail.");
        throw new Error("RapidAPI key is not configured.");
    }

    const sanitizedHost = host.replace(/^https?:\/\//, '');
    const url = new URL(`https://${sanitizedHost}/${endpoint}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': key,
                'X-RapidAPI-Host': sanitizedHost,
            },
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[ERROR] API call to '${endpoint}' failed (${response.status}): ${errorText}`);
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        return result.data; // JSearch returns `{ data: [...] }`
    } catch (err) {
        console.error(`[ERROR] Network/API error during call to '${endpoint}':`, err);
        throw err; // re-throw the error to be handled by the caller
    }
}


const transformApiJob = (apiJob: any): Job => ({
    id: apiJob.job_id,
    title: apiJob.job_title,
    company: apiJob.employer_name || 'N/A',
    companyLogo: apiJob.employer_logo,
    location: apiJob.job_location || `${apiJob.job_city || ''}${apiJob.job_city && apiJob.job_state ? ', ' : ''}${apiJob.job_state || ''} ${apiJob.job_country || ''}`.trim() || 'Not specified',
    country: apiJob.job_country,
    datePosted: apiJob.job_posted_at_datetime_utc || new Date().toISOString(),
    description: apiJob.job_description,
    applyUrl: apiJob.job_apply_link,
    employmentType: apiJob.job_employment_type,
    highlights: apiJob.job_highlights,
});

export async function getJobs(query: string, numPages: string = '20', filters: SearchFilters = {}): Promise<{ jobs: Job[] }> {
  if (!query) {
    return { jobs: [] };
  }
  
  const apiParams: Record<string, string> = { query: query, num_pages: numPages };
    if (filters.employmentType && filters.employmentType !== 'all') {
        apiParams.employment_types = filters.employmentType;
    }
    if (filters.datePosted && filters.datePosted !== 'all') {
        apiParams.date_posted = filters.datePosted;
    }
    if (filters.remoteOnly) {
        apiParams.remote_jobs_only = 'true';
    }

  const apiData = await fetchFromApi('search', apiParams);
  
  if (Array.isArray(apiData)) {
      const jobs = apiData.map(transformApiJob).filter(job => job.id && job.title && job.description);
      const uniqueJobs = Array.from(new Map(jobs.map(job => [job.id, job])).values());
      return { jobs: uniqueJobs };
  }

  console.warn('API returned unexpected data format, returning empty list.');
  return { jobs: [] };
}

export async function getJob(id: string): Promise<Job | null> {
  const apiData = await fetchFromApi('job-details', { job_id: id });
    
  if (apiData && Array.isArray(apiData) && apiData.length > 0) {
    return transformApiJob(apiData[0]);
  }
  
  console.error(`[Fatal] Could not fetch job details for ID: ${id} from API.`);
  return null;
}
