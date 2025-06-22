import type { Job, AnalyticsData } from "@/types";

const MOCK_JOBS: Job[] = [
  { id: '1', title: 'Senior Frontend Developer', company: 'TechCorp', location: 'New York, NY', datePosted: '2024-05-20T10:00:00Z', description: 'We are looking for a seasoned Senior Frontend Developer to join our dynamic team. The ideal candidate will have extensive experience with React, TypeScript, and modern frontend build pipelines. You will be responsible for architecting and building complex user interfaces, ensuring high performance and responsiveness. A strong understanding of web standards and accessibility is a must.', applyUrl: '#' },
  { id: '2', title: 'Backend Engineer (Node.js)', company: 'DataSolutions', location: 'San Francisco, CA', datePosted: '2024-05-19T14:30:00Z', description: 'DataSolutions is seeking a Backend Engineer with expertise in Node.js to develop and maintain our server-side logic. You will work on database integrations, API development, and ensuring the scalability and security of our applications. Experience with microservices architecture and cloud platforms like AWS or GCP is highly desirable.', applyUrl: '#' },
  { id: '3', title: 'Product Manager', company: 'Innovate Inc.', location: 'Remote', datePosted: '2024-05-22T09:00:00Z', description: 'As a Product Manager at Innovate Inc., you will drive the product vision and roadmap. You will work closely with engineering, design, and marketing teams to define product requirements, prioritize features, and deliver products that delight our users. Strong communication and leadership skills are essential.', applyUrl: '#' },
  { id: '4', title: 'UX/UI Designer', company: 'CreativeMinds', location: 'Austin, TX', datePosted: '2024-05-18T11:00:00Z', description: 'CreativeMinds is looking for a talented UX/UI Designer to create intuitive and visually appealing interfaces for our web and mobile applications. You will be involved in the entire design process, from user research and wireframing to creating high-fidelity mockups and prototypes. A strong portfolio is required.', applyUrl: '#' },
  { id: '5', title: 'DevOps Engineer', company: 'CloudNet', location: 'Seattle, WA', datePosted: '2024-05-21T16:00:00Z', description: 'Join our CloudNet team as a DevOps Engineer and help us build and maintain our CI/CD pipelines and cloud infrastructure. You will be responsible for automating deployments, monitoring system health, and ensuring the reliability and scalability of our services. Experience with Docker, Kubernetes, and Terraform is a plus.', applyUrl: '#' },
  { id: '6', title: 'Data Scientist', company: 'AlphaAnalytics', location: 'Boston, MA', datePosted: '2024-05-15T12:00:00Z', description: 'AlphaAnalytics is hiring a Data Scientist to analyze large datasets and extract actionable insights. You will develop machine learning models, create data visualizations, and work with stakeholders to solve complex business problems. Proficiency in Python, R, and SQL is required.', applyUrl: '#' },
];

export async function getJobs(): Promise<Job[]> {
  return Promise.resolve(MOCK_JOBS);
}

export async function getJob(id: string): Promise<Job | null> {
  const job = MOCK_JOBS.find(j => j.id === id) || null;
  return Promise.resolve(job);
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
