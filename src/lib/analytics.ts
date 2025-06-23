import type { Job, AnalyticsData } from '@/types';

export const EMPTY_ANALYTICS: AnalyticsData = {
  totalJobs: 0,
  topLocations: [],
  topRoles: [],
  remotePercentage: 0,
  topCompanies: [],
  topSkills: [],
};

// More sophisticated keyword mapping for roles
const ROLE_MAP: { [key: string]: string[] } = {
    'Frontend': ['frontend', 'react', 'vue', 'angular', 'ui developer', 'web developer'],
    'Backend': ['backend', 'node.js', 'python developer', 'java developer', 'php', 'ruby', 'server-side'],
    'Full Stack': ['full stack', 'full-stack'],
    'DevOps': ['devops', 'sre', 'site reliability', 'infrastructure'],
    'Data Scientist': ['data scientist', 'machine learning', 'ml engineer', 'ai engineer'],
    'Product Manager': ['product manager', 'product owner'],
    'Designer': ['designer', 'ux', 'ui', 'product design'],
    'Mobile': ['mobile', 'ios', 'android', 'react native', 'flutter'],
    'Software Engineer': ['software engineer', 'swe', 'developer'], // General catch-all
};

// Pre-defined list of skills to scan for in descriptions
const SKILL_KEYWORDS = [
    'react', 'angular', 'vue.js', 'svelte', 'next.js', 'gatsby', // Frontend JS
    'javascript', 'typescript', 'html', 'css', 'sass', // Core Web
    'node.js', 'express.js', 'nest.js', // Node Backend
    'python', 'django', 'flask', // Python Backend
    'java', 'spring boot', // Java Backend
    'c#', '.net', // Microsoft Stack
    'go', 'ruby', 'php', // Other Backend
    'swift', 'kotlin', 'react native', 'flutter', // Mobile
    'sql', 'nosql', 'postgresql', 'mysql', 'mongodb', 'redis', // Databases
    'aws', 'azure', 'gcp', 'google cloud', // Cloud
    'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'jenkins', 'ci/cd', // DevOps
    'git', 'jira', // Tools
    'figma', 'sketch', 'adobe xd', // Design Tools
    'machine learning', 'artificial intelligence', 'ai', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch' // Data Science
];

// Helper to create a regex that finds whole words, case-insensitively
const createSkillRegex = (skills: string[]): RegExp => {
    // Escape special characters and create a pattern for whole words
    const pattern = skills.map(skill => skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    return new RegExp(`\\b(${pattern})\\b`, 'gi');
};
const skillRegex = createSkillRegex(SKILL_KEYWORDS);


export function generateAnalytics(jobs: Job[]): AnalyticsData {
  if (!jobs || jobs.length === 0) {
    return EMPTY_ANALYTICS;
  }

  // --- Top Locations ---
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


  // --- Top Roles (Improved) ---
  const roleCounts: { [key: string]: number } = {};
  jobs.forEach(job => {
    const title = (job.title || '').toLowerCase();
    let assignedRole: string | null = null;
    
    // Iterate through the role map to find a match
    for (const [standardRole, keywords] of Object.entries(ROLE_MAP)) {
      for (const keyword of keywords) {
        if (title.includes(keyword)) {
          assignedRole = standardRole;
          break;
        }
      }
      if (assignedRole) break;
    }

    if (assignedRole) {
      roleCounts[assignedRole] = (roleCounts[assignedRole] || 0) + 1;
    } else {
        // Fallback for uncategorized roles
        roleCounts['Other'] = (roleCounts['Other'] || 0) + 1;
    }
  });
  const topRoles = Object.entries(roleCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([role, count]) => ({ role, count }));


  // --- Remote vs On-site ---
  const remoteJobs = jobs.filter(job => job.location?.toLowerCase().includes('remote')).length;
  const remotePercentage = jobs.length > 0 ? Math.round((remoteJobs / jobs.length) * 100) : 0;
  

  // --- Top Companies ---
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
    

  // --- Top Skills (Improved with NLP-like extraction) ---
  const skillCounts: { [key: string]: number } = {};
  const skillNormalizationMap: { [key: string]: string } = {
      'k8s': 'kubernetes',
      'google cloud': 'gcp',
      'ai': 'artificial intelligence',
  };


  jobs.forEach(job => {
    const skillsFound = new Set<string>();
    const textToScan = ((job.description || '') + ' ' + Object.values(job.highlights || {}).flat().join(' ')).toLowerCase();

    const matches = textToScan.match(skillRegex);
    if (matches) {
        matches.forEach(match => skillsFound.add(match));
    }
    
    // Count the unique skills found per job
    skillsFound.forEach(skill => {
        const normalizedSkill = skillNormalizationMap[skill] || skill;
        skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1;
    });

  });

  const topSkills = Object.entries(skillCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10) // Show more skills as they are important
    .map(([skill, count]) => ({ 
        skill: skill.charAt(0).toUpperCase() + skill.slice(1), // Capitalize for display
        count 
    }));


  return {
    totalJobs: jobs.length,
    topLocations,
    topRoles,
    remotePercentage,
    topCompanies,
    topSkills
  };
}
