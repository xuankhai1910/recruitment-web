import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { ProfileRecommendationsResponse } from "@/types/job-recommendation";

export const jobRecommendationsApi = {
  /** AI-powered job recommendations based on the current user's profile. */
  recommend: (limit = 10) =>
    api.get<ApiResponse<ProfileRecommendationsResponse>>(
      "/job-recommendations",
      { params: { limit } },
    ),
};
