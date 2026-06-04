import type { Job } from "./job";
import type { MatchBreakdown } from "./match";

export type CvLevel = "INTERN" | "JUNIOR" | "MID" | "SENIOR" | "LEAD" | string;

export interface CvExtractedData {
  skills: string[];
  level: CvLevel;
  yearsOfExperience: number;
  /** Vị trí ứng viên hướng tới (vd "Backend Developer"). */
  desiredJobTitle?: string;
  desiredCategory?: string;
  desiredSpecialization?: string;
  education: string;
  preferredLocations: string[];
  summary: string;
}

export interface CvAnalysis {
  _id: string;
  extractedData: CvExtractedData;
  analyzedBy: "ai" | "keyword";
  analyzedAt: string;
}

export interface RecommendationCv {
  resumeUrl: string;
  analysisId: string;
  source: "upload" | "resume";
  updatedAt: string;
}

export interface RecommendationCvState {
  recommendationCv: RecommendationCv | null;
  analysis: CvAnalysis | null;
}

export interface SetRecommendationCvDto {
  url: string;
  source: "upload" | "resume";
}

export interface RecommendedJobItem {
  job: Job;
  score: number;
  matchedSkills: string[];
  breakdown: MatchBreakdown;
}

export interface RecommendJobsResponse {
  analysis: CvAnalysis;
  recommendations: RecommendedJobItem[];
}
