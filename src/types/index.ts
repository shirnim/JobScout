export type Job = {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  country?: string;
  datePosted: string;
  description: string;
  applyUrl: string;
  employmentType?: string;
  highlights?: { [key: string]: string[] };
};

export type AnalyticsData = {
  totalJobs: number;
  topLocations: { location: string; count: number }[];
  topRoles: { role: string; count: number }[];
  remotePercentage: number;
  topCompanies: { company: string; count: number }[];
  topSkills: { skill: string; count: number }[];
};

export interface SearchFilters {
  employmentType?: string;
  datePosted?: string;
  remoteOnly?: boolean;
  page?: number;
}
