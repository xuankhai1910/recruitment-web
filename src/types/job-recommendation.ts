import type { Job } from "./job";

/** Score breakdown returned by the profile-based recommendation engine. */
export interface ProfileRecommendation {
  finalScore: number;
  vectorScore: number;
  skillScore: number;
  matchedSkills: string[];
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
  total: number;
  items: ProfileRecommendedJob[];
}
