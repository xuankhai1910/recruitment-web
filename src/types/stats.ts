// Shapes returned by the backend `stats` module (src/stats/* on the API).

export type ResumeStatus = "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED";
export type StatusCounts = Record<ResumeStatus, number>;
export type LevelCounts = Record<string, number>;

export interface NamedValue {
  name: string;
  value: number;
}

export interface ModuleValue {
  module: string;
  value: number;
}

export interface AdminRecentJob {
  _id: string;
  name: string;
  company: { name?: string; logo?: string };
  location?: string;
  isActive?: boolean;
}

export interface AdminRecentUser {
  _id: string;
  name?: string;
  email?: string;
  role: { name?: string };
}

export interface AdminOverview {
  totals: { companies: number; users: number; jobs: number; resumes: number };
  new30: { companies: number; users: number; jobs: number; resumes: number };
  resumeByStatus: StatusCounts;
  jobByLevel: LevelCounts;
  userByRole: NamedValue[];
  permByModule: ModuleValue[];
  series: { labels: string[]; resumes: number[]; jobs: number[] };
  sparks: {
    companies: number[];
    users: number[];
    jobs: number[];
    resumes: number[];
  };
  recentJobs: AdminRecentJob[];
  recentUsers: AdminRecentUser[];
}

export interface HrLatestResume {
  _id: string;
  email: string;
  status: ResumeStatus;
  createdAt: string;
  userId: { _id: string; name?: string };
  jobId: { name?: string };
}

export interface HrRecentJob {
  _id: string;
  name: string;
  location?: string;
  level?: string;
  isActive?: boolean;
  createdAt: string;
}

export interface HrOverview {
  kpis: {
    activeJobs: number;
    totalJobs: number;
    totalResumes: number;
    pending: number;
  };
  approvalRate: number;
  resumeByStatus: StatusCounts;
  series: { labels: string[]; resumes: number[] };
  sparks: { jobs: number[]; resumes: number[]; pending: number[] };
  latestResumes: HrLatestResume[];
  recentJobs: HrRecentJob[];
}
