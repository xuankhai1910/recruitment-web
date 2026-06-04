import type { Job } from "./job";
import type { MatchBreakdown, MatchCvSide } from "./match";

/** Score breakdown returned by the profile-based recommendation engine. */
export interface ProfileRecommendation {
  finalScore: number;
  vectorScore: number;
  skillScore: number;
  matchedSkills: string[];
  /** Full 7-signal breakdown (profile recommender now uses the hybrid scorer). */
  breakdown: MatchBreakdown;
}

/** A single recommended job: full Job fields + recommendation metadata. */
export interface ProfileRecommendedJob extends Job {
  recommendation: ProfileRecommendation;
}

/** Lightweight profile summary returned with the recommendation list. */
export interface ProfileRecommendationProfile {
  _id: string;
  completionScore: number;
  hasEmbedding: boolean;
}

export interface ProfileRecommendationsResponse {
  profile: ProfileRecommendationProfile;
  /** Candidate side derived from the profile — for the comparison modal. */
  cvSummary: MatchCvSide;
  total: number;
  items: ProfileRecommendedJob[];
}
