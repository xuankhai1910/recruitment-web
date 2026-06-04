/**
 * Shared shapes for the CV ↔ Job match comparison modal, used by both the HR
 * resume view and the candidate-facing job recommendations. The score itself
 * comes from the backend's 7-signal hybrid scorer; the modal only *explains* it
 * by comparing the two sides field-by-field (no per-signal points shown).
 */

/** Per-signal scores [0..1] from the backend scorer. */
export interface MatchBreakdown {
  skillScore: number;
  titleScore: number;
  desiredTitleScore: number;
  specializationScore: number;
  levelScore: number;
  locationScore: number;
  vectorScore: number;
}

/** The candidate side of a match (from CV extraction or profile derivation). */
export interface MatchCvSide {
  skills: string[];
  level?: string;
  yearsOfExperience?: number;
  desiredJobTitle?: string;
  desiredSpecialization?: string;
  preferredLocations?: string[];
}

/** The job side of a match (the requirements scored against). */
export interface MatchJobSide {
  name?: string;
  skills: string[];
  level?: string;
  location?: string;
  category?: string;
  specialization?: string;
  yearsOfExperience?: { min?: number; max?: number };
}

/** Everything the comparison modal needs to render. */
export interface MatchInput {
  /** Overall match score, 0..1. */
  score: number;
  matchedSkills: string[];
  breakdown: MatchBreakdown;
  analyzedBy?: "ai" | "keyword";
  cv: MatchCvSide;
  job: MatchJobSide;
  /** CV-side level/title/location were derived (profile-based recommender). */
  estimated?: boolean;
}
