import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type {
  RecommendationCvState,
  SetRecommendationCvDto,
  RecommendJobsResponse,
} from "@/types/cv-recommendation";

export const cvRecommendationApi = {
  // Long timeout because backend calls Gemini AI (5-30s)
  setCv: (data: SetRecommendationCvDto) =>
    api.post<ApiResponse<RecommendationCvState>>(
      "/users/recommendation-cv",
      data,
      { timeout: 90_000 },
    ),

  getCv: () =>
    api.get<ApiResponse<RecommendationCvState>>("/users/recommendation-cv"),

  deleteCv: () =>
    api.delete<ApiResponse<{ deleted: boolean }>>("/users/recommendation-cv"),

  recommendJobs: (limit = 10) =>
    api.post<ApiResponse<RecommendJobsResponse>>(
      "/cv-analysis/recommend-jobs",
      { limit },
    ),
};
