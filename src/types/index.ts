export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  datePosted: string;
  description: string;
  applyUrl: string;
};

export type AnalyticsData = {
  totalJobs: number;
  topLocations: { location: string; count: number }[];
  topRoles: { role: string; count: number }[];
};
