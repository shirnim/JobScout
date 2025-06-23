
import type { Job, SearchFilters } from "@/types";

const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;

const MOCK_JOBS: Job[] = [
  { id: '1', title: 'Senior Frontend Developer', company: 'TechCorp', location: 'New York, NY', datePosted: '2024-05-20T10:00:00Z', description: 'We are looking for a seasoned Senior Frontend Developer to join our dynamic team. The ideal candidate will have extensive experience with React, TypeScript, and modern frontend build pipelines. You will be responsible for architecting and building complex user interfaces, ensuring high performance and responsiveness. A strong understanding of web standards and accessibility is a must.', applyUrl: '#', employmentType: 'FULLTIME' },
  { id: '2', title: 'Backend Engineer (Node.js)', company: 'DataSolutions', location: 'San Francisco, CA', datePosted: '2024-05-19T14:30:00Z', description: 'DataSolutions is seeking a Backend Engineer with expertise in Node.js to develop and maintain our server-side logic. You will work on database integrations, API development, and ensuring the scalability and security of our applications. Experience with microservices architecture and cloud platforms like AWS or GCP is highly desirable.', applyUrl: '#', employmentType: 'CONTRACTOR' },
  { id: '3', title: 'Product Manager', company: 'Innovate Inc.', location: 'Remote', datePosted: '2024-05-22T09:00:00Z', description: 'As a Product Manager at Innovate Inc., you will drive the product vision and roadmap. You will work closely with engineering, design, and marketing teams to define product requirements, prioritize features, and deliver products that delight our users. Strong communication and leadership skills are essential.', applyUrl: '#', employmentType: 'FULLTIME' },
  { id: '4', title: 'UX/UI Designer', company: 'CreativeMinds', location: 'Austin, TX', datePosted: '2024-05-18T11:00:00Z', description: 'CreativeMinds is looking for a talented UX/UI Designer to create intuitive and visually appealing interfaces for our web and mobile applications. You will be involved in the entire design process, from user research and wireframing to creating high-fidelity mockups and prototypes. A strong portfolio is required.', applyUrl: '#', employmentType: 'PARTTIME' },
  { id: '5', title: 'DevOps Engineer', company: 'CloudNet', location: 'Seattle, WA', datePosted: '2024-05-21T16:00:00Z', description: 'Join our CloudNet team as a DevOps Engineer and help us build and maintain our CI/CD pipelines and cloud infrastructure. You will be responsible for automating deployments, monitoring system health, and ensuring the reliability and scalability of our services. Experience with Docker, Kubernetes, and Terraform is a plus.', applyUrl: '#', employmentType: 'FULLTIME' },
  { id: '6', title: 'Data Scientist', company: 'AlphaAnalytics', location: 'Boston, MA', datePosted: '2024-05-15T12:00:00Z', description: 'AlphaAnalytics is hiring a Data Scientist to analyze large datasets and extract actionable insights. You will develop machine learning models, create data visualizations, and work with stakeholders to solve complex business problems. Proficiency in Python, R, and SQL is required.', applyUrl: '#', employmentType: 'FULLTIME' },
];


async function fetchFromApi(endpoint: string, params: Record<string, string>) {
    const key = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
    const host = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;

    if (!key || !host || key.includes('your-rapidapi-key')) {
        console.warn("[RapidAPI] Missing or placeholder API key. Using mock data.");
        return null;
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
            // Silently fail for job-details endpoint as it is known to be unstable.
            if (endpoint !== 'job-details') {
              console.error(`[ERROR] API failed (${response.status}): ${errorText}`);
            }
            return null;
        }

        const result = await response.json();
        return result.data; // JSearch returns `{ data: [...] }`
    } catch (err) {
        console.error("[ERROR] Network/API error:", err);
        return null;
    }
}


const transformApiJob = (apiJob: any): Job => ({
    id: apiJob.job_id,
    title: apiJob.job_title,
    company: apiJob.employer_name || 'N/A',
    companyLogo: apiJob.employer_logo,
    location: apiJob.job_location || `${apiJob.job_city || ''}${apiJob.job_city && apiJob.job_state ? ', ' : ''}${apiJob.job_state || ''} ${apiJob.job_country || ''}`.trim() || 'Not specified',
    datePosted: apiJob.job_posted_at_datetime_utc || new Date().toISOString(),
    description: apiJob.job_description,
    applyUrl: apiJob.job_apply_link,
    employmentType: apiJob.job_employment_type,
    highlights: apiJob.job_highlights,
});

export async function getJobs(query: string, numPages: string = '10', filters: SearchFilters = {}): Promise<{ jobs: Job[], source: 'api' | 'mock' }> {
  if (!query) {
    return { jobs: [], source: 'mock' };
  }

  const finalQuery = filters.location ? `${query} in ${filters.location}` : query;
  
  const apiParams: Record<string, string> = { query: finalQuery, num_pages: numPages };
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
  
  if (apiData === null) {
      return { jobs: MOCK_JOBS, source: 'mock' };
  }
  
  if (Array.isArray(apiData)) {
      const jobs = apiData.map(transformApiJob).filter(job => job.id && job.title && job.description);
      const uniqueJobs = Array.from(new Map(jobs.map(job => [job.id, job])).values());
      return { jobs: uniqueJobs, source: 'api' };
  }

  console.warn('API returned unexpected data format, returning mock data.');
  return { jobs: MOCK_JOBS, source: 'mock' };
}

export async function getJob(id: string): Promise<Job | null> {
  const apiData = await fetchFromApi('job-details', { job_id: id, extended_publisher_details: 'false' });
    
  if (apiData && Array.isArray(apiData) && apiData.length > 0) {
    return transformApiJob(apiData[0]);
  }

  // If the API call fails, fall back to mock data as a last resort.
  const mockJob = MOCK_JOBS.find(job => job.id === id);
  if (mockJob) {
      console.warn(`[API Fallback] Job details for ${id} failed. Serving mock data.`);
      return mockJob;
  }
  
  console.error(`Could not fetch job details for ID: ${id} from API or mock data.`);
  return null;
}
