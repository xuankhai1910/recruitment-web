import type {
  MatchBreakdown,
  MatchCvSide,
  MatchJobSide,
} from "./match";

export interface ResumeHistory {
  status: string;
  updatedAt: string;
  updatedBy: { _id: string; email: string };
}

export type ResumeMatchBreakdown = MatchBreakdown;

export interface ResumeMatch {
  score: number; // 0..1
  matchedSkills: string[];
  breakdown: ResumeMatchBreakdown;
  analyzedBy: "ai" | "keyword";
  analyzedAt: string;
  jobId: string;
  /** Snapshot phía CV — có từ khi feature so sánh ra mắt; match cũ sẽ thiếu. */
  extracted?: MatchCvSide;
  /** Snapshot phía job (yêu cầu đã chấm). */
  jobRequirements?: MatchJobSide;
}

/** Trả về từ POST /cv-analysis/resumes/:id/match. Nay match đã gồm extracted + jobRequirements. */
export type ResumeMatchResult = ResumeMatch;

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
