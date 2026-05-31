import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/api/stats.api";

export function useAdminOverview() {
  return useQuery({
    queryKey: ["stats", "admin"],
    queryFn: () => statsApi.getAdminOverview().then((r) => r.data.data),
    staleTime: 60 * 1000,
  });
}

export function useHrOverview() {
  return useQuery({
    queryKey: ["stats", "hr"],
    queryFn: () => statsApi.getHrOverview().then((r) => r.data.data),
    staleTime: 60 * 1000,
  });
}
