import type { Job, AnalyticsData } from '@/types';

export const EMPTY_ANALYTICS: AnalyticsData = {
  totalJobs: 0,
  topLocations: [],
  topRoles: [],
};

export function generateAnalytics(jobs: Job[]): AnalyticsData {
  if (!jobs || jobs.length === 0) {
    return EMPTY_ANALYTICS;
  }

  // Calculate top locations
  const locationCounts: { [key: string]: number } = {};
  jobs.forEach(job => {
    const location = (job.location || 'N/A').split(',')[0].trim();
    if (location && location !== 'N/A' && location !== 'Not specified' && location !== 'Remote') {
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    }
  });

  const topLocations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([location, count]) => ({ location, count }));

  // Calculate top roles using keyword matching
  const roleCounts: { [key: string]: number } = {};
  const roleKeywords = ['Frontend', 'Backend', 'Full Stack', 'DevOps', 'Data Scientist', 'Product Manager', 'Designer', 'Mobile', 'Engineer', 'Developer'];
  
  jobs.forEach(job => {
    const title = (job.title || '').toLowerCase();
    let assignedRole: string | null = null;
    for (const keyword of roleKeywords) {
      if (title.includes(keyword.toLowerCase())) {
        assignedRole = keyword;
        break;
      }
    }
    if (assignedRole) {
      roleCounts[assignedRole] = (roleCounts[assignedRole] || 0) + 1;
    }
  });

  const topRoles = Object.entries(roleCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([role, count]) => ({ role, count }));

  return {
    totalJobs: jobs.length,
    topLocations: topLocations,
    topRoles: topRoles,
  };
}
