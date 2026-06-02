export interface ResumeHistory {
  status: string;
  updatedAt: string;
  updatedBy: { _id: string; email: string };
}

export interface ResumeMatchBreakdown {
  skillScore: number;
  titleScore: number;
  desiredTitleScore: number;
  specializationScore: number;
  levelScore: number;
  locationScore: number;
  vectorScore: number;
}

export interface ResumeMatch {
  score: number; // 0..1
  matchedSkills: string[];
  breakdown: ResumeMatchBreakdown;
  analyzedBy: "ai" | "keyword";
  analyzedAt: string;
  jobId: string;
}

/** Trả về từ POST /cv-analysis/resumes/:id/match — match + tóm tắt CV. */
export interface ResumeMatchResult extends ResumeMatch {
  extracted: {
    skills: string[];
    level: string;
    yearsOfExperience: number;
    desiredJobTitle?: string;
  };
}

/** Hạn mức phân tích hàng loạt của công ty trong tháng. */
export interface MatchBatchQuota {
  period: string; // 'YYYY-MM'
  used: number;
  limit: number;
  remaining: number;
}

/** Kết quả khởi tạo 1 lượt "phân tích tất cả" (POST .../match-batch/start). */
export interface MatchBatchStart extends MatchBatchQuota {
  effectiveMax: number;
  total: number;
  resumeIds: string[];
  message?: string;
}

export interface Resume {
  _id: string;
  url: string;
  email: string;
  userId: string | { _id: string; name: string; email?: string };
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
  companyId: string | { _id: string; name: string };
  jobId: string | { _id: string; name: string };
  history: ResumeHistory[];
  match?: ResumeMatch;
  createdAt: string;
  updatedAt: string;
  createdBy: { _id: string; email: string };
  updatedBy: { _id: string; email: string };
}

export interface CreateResumeDto {
  url: string;
  companyId: string;
  jobId: string;
}

export interface UpdateResumeStatusDto {
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
}
