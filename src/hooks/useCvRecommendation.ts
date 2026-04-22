import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cvRecommendationApi } from "@/api/cv-recommendation.api";
import type { SetRecommendationCvDto } from "@/types/cv-recommendation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";

const CV_KEY = ["recommendation-cv"] as const;
const REC_JOBS_KEY = ["recommendation-cv", "jobs"] as const;

export function useRecommendationCv() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: CV_KEY,
    queryFn: () => cvRecommendationApi.getCv().then((r) => r.data.data),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useSetRecommendationCv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SetRecommendationCvDto) =>
      cvRecommendationApi.setCv(data).then((r) => r.data.data),
    onSuccess: (data) => {
      qc.setQueryData(CV_KEY, data);
      qc.invalidateQueries({ queryKey: REC_JOBS_KEY });
      toast.success("Đã thiết lập CV gợi ý");
    },
    onError: () => {
      toast.error(
        "Phân tích CV thất bại. Hệ thống có thể đang bận, vui lòng thử lại.",
      );
    },
  });
}

export function useDeleteRecommendationCv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cvRecommendationApi.deleteCv().then((r) => r.data.data),
    onSuccess: () => {
      qc.setQueryData(CV_KEY, { recommendationCv: null, analysis: null });
      qc.invalidateQueries({ queryKey: REC_JOBS_KEY });
      toast.success("Đã xóa CV gợi ý");
    },
  });
}

export function useRecommendedJobs(limit = 10, enabled = true) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: [...REC_JOBS_KEY, limit],
    queryFn: () =>
      cvRecommendationApi.recommendJobs(limit).then((r) => r.data.data),
    enabled: isAuthenticated && enabled,
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}
