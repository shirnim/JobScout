import type { Job, AnalyticsData } from '@/types';

export const EMPTY_ANALYTICS: AnalyticsData = {
  totalJobs: 0,
  topLocations: [],
  topRoles: [],
  remotePercentage: 0,
  topCompanies: [],
  topSkills: [],
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

  // Calculate remote vs on-site
  const remoteJobs = jobs.filter(job => job.location?.toLowerCase().includes('remote')).length;
  const remotePercentage = jobs.length > 0 ? Math.round((remoteJobs / jobs.length) * 100) : 0;
  
  // Calculate top companies
  const companyCounts: { [key: string]: number } = {};
  jobs.forEach(job => {
    if (job.company && job.company !== 'N/A') {
      companyCounts[job.company] = (companyCounts[job.company] || 0) + 1;
    }
  });
  const topCompanies = Object.entries(companyCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([company, count]) => ({ company, count }));
    
  // Calculate top skills from highlights
  const skillCounts: { [key: string]: number } = {};
  jobs.forEach(job => {
    if (job.highlights?.Qualifications) {
      job.highlights.Qualifications.forEach(skill => {
        // Basic normalization
        const normalizedSkill = skill.split('(')[0].trim();
        if (normalizedSkill) {
            skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1;
        }
      });
    }
  });
  const topSkills = Object.entries(skillCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10) // Show more skills as they are important
    .map(([skill, count]) => ({ skill, count }));


  return {
    totalJobs: jobs.length,
    topLocations,
    topRoles,
    remotePercentage,
    topCompanies,
    topSkills
  };
}
