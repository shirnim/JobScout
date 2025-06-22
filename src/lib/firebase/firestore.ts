import type { Job, AnalyticsData } from "@/types";

const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;

const MOCK_JOBS: Job[] = [
  { id: '1', title: 'Senior Frontend Developer', company: 'TechCorp', location: 'New York, NY', datePosted: '2024-05-20T10:00:00Z', description: 'We are looking for a seasoned Senior Frontend Developer to join our dynamic team. The ideal candidate will have extensive experience with React, TypeScript, and modern frontend build pipelines. You will be responsible for architecting and building complex user interfaces, ensuring high performance and responsiveness. A strong understanding of web standards and accessibility is a must.', applyUrl: '#' },
  { id: '2', title: 'Backend Engineer (Node.js)', company: 'DataSolutions', location: 'San Francisco, CA', datePosted: '2024-05-19T14:30:00Z', description: 'DataSolutions is seeking a Backend Engineer with expertise in Node.js to develop and maintain our server-side logic. You will work on database integrations, API development, and ensuring the scalability and security of our applications. Experience with microservices architecture and cloud platforms like AWS or GCP is highly desirable.', applyUrl: '#' },
  { id: '3', title: 'Product Manager', company: 'Innovate Inc.', location: 'Remote', datePosted: '2024-05-22T09:00:00Z', description: 'As a Product Manager at Innovate Inc., you will drive the product vision and roadmap. You will work closely with engineering, design, and marketing teams to define product requirements, prioritize features, and deliver products that delight our users. Strong communication and leadership skills are essential.', applyUrl: '#' },
  { id: '4', title: 'UX/UI Designer', company: 'CreativeMinds', location: 'Austin, TX', datePosted: '2024-05-18T11:00:00Z', description: 'CreativeMinds is looking for a talented UX/UI Designer to create intuitive and visually appealing interfaces for our web and mobile applications. You will be involved in the entire design process, from user research and wireframing to creating high-fidelity mockups and prototypes. A strong portfolio is required.', applyUrl: '#' },
  { id: '5', title: 'DevOps Engineer', company: 'CloudNet', location: 'Seattle, WA', datePosted: '2024-05-21T16:00:00Z', description: 'Join our CloudNet team as a DevOps Engineer and help us build and maintain our CI/CD pipelines and cloud infrastructure. You will be responsible for automating deployments, monitoring system health, and ensuring the reliability and scalability of our services. Experience with Docker, Kubernetes, and Terraform is a plus.', applyUrl: '#' },
  { id: '6', title: 'Data Scientist', company: 'AlphaAnalytics', location: 'Boston, MA', datePosted: '2024-05-15T12:00:00Z', description: 'AlphaAnalytics is hiring a Data Scientist to analyze large datasets and extract actionable insights. You will develop machine learning models, create data visualizations, and work with stakeholders to solve complex business problems. Proficiency in Python, R, and SQL is required.', applyUrl: '#' },
];


async function fetchFromApi(endpoint: string, params: Record<string, string>) {
    if (!RAPIDAPI_KEY || !RAPIDAPI_HOST || RAPIDAPI_KEY.includes('your-rapidapi-key')) {
        console.warn("RapidAPI key not configured or is a placeholder. Using mock job data. Please update .env file and RESTART the server.");
        return null;
    }

    const url = new URL(`https://${RAPIDAPI_HOST}/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST,
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            console.error(`API request failed with status ${response.status}: ${await response.text()}. Falling back to mock data.`);
            return null;
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error("Failed to fetch from RapidAPI. Falling back to mock data.", error);
        return null;
    }
}

const transformApiJob = (apiJob: any): Job => ({
    id: apiJob.job_id,
    title: apiJob.job_title,
    company: apiJob.employer_name || 'N/A',
    location: `${apiJob.job_city || ''}${apiJob.job_city && apiJob.job_state ? ', ' : ''}${apiJob.job_state || ''} ${apiJob.job_country || ''}`.trim() || 'Not specified',
    datePosted: apiJob.job_posted_at_datetime_utc || new Date().toISOString(),
    description: apiJob.job_description,
    applyUrl: apiJob.job_apply_link,
});

export async function getJobs(): Promise<Job[]> {
  const apiData = await fetchFromApi('search', { query: 'Software developer in USA', num_pages: '1' });
  
  if (apiData && Array.isArray(apiData)) {
      const jobs = apiData.map(transformApiJob).filter(job => job.id && job.title && job.description);
      // Only return API jobs if the array is not empty
      if(jobs.length > 0) {
          return jobs;
      }
  }
  
  // Fallback to mock jobs if API fails or returns no results
  console.warn('API returned no jobs or failed, falling back to mock data.');
  return Promise.resolve(MOCK_JOBS);
}

export async function getJob(id: string): Promise<Job | null> {
  // First, try to find the job in the cached list from the main search.
  // This is fast and avoids extra API calls for normal navigation.
  const allJobs = await getJobs(); // This uses Next.js fetch cache
  const jobFromList = allJobs.find(j => j.id === id);
  if (jobFromList) {
    return jobFromList;
  }

  // If not found (e.g., direct link, or item fell out of search results),
  // try fetching the specific job details from the API.
  console.log(`Job ${id} not in cached list, fetching details from API...`);
  const apiData = await fetchFromApi('job-details', { job_id: id });

  if (apiData && Array.isArray(apiData) && apiData.length > 0) {
    // The job-details endpoint returns an array with one job object
    return transformApiJob(apiData[0]);
  }
  
  // If the API call fails (fetchFromApi returns null) or returns no data,
  // the job is considered not found.
  console.warn(`Job with ID ${id} not found via details endpoint. It may be expired or invalid.`);
  return null;
}

const MOCK_ANALYTICS: AnalyticsData = {
  totalJobs: 1256,
  topLocations: [
    { location: 'New York, NY', count: 250 },
    { location: 'San Francisco, CA', count: 210 },
    { location: 'Remote', count: 180 },
    { location: 'Austin, TX', count: 150 },
    { location: 'Seattle, WA', count: 120 },
  ],
  topRoles: [
    { role: 'Frontend Dev', count: 180 },
    { role: 'Backend Eng', count: 165 },
    { role: 'Product Manager', count: 120 },
    { role: 'Data Scientist', count: 95 },
    { role: 'UX/UI Designer', count: 80 },
  ],
};

export async function getDashboardAnalytics(): Promise<AnalyticsData> {
  return Promise.resolve(MOCK_ANALYTICS);
}
