import { useQuery } from "@tanstack/react-query";
import { jobRecommendationsApi } from "@/api/job-recommendations.api";
import { useAuthStore } from "@/stores/auth.store";

const KEY = ["job-recommendations", "profile"] as const;

/**
 * Fetch AI-powered job recommendations based on the current user's profile.
 * Disabled if the user is not authenticated or `enabled` is false.
 */
export function useProfileJobRecommendations(limit = 10, enabled = true) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: [...KEY, limit],
    queryFn: () =>
      jobRecommendationsApi.recommend(limit).then((r) => r.data.data),
    enabled: isAuthenticated && enabled,
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}
