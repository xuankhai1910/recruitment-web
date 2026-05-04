import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { savedJobsApi, type SavedJobsQueryParams } from "@/api/saved-jobs.api";
import { useAuthStore } from "@/stores/auth.store";

export function useSavedJobs(params: SavedJobsQueryParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["saved-jobs", params],
    queryFn: () => savedJobsApi.getSavedJobs(params).then((r) => r.data.data),
    placeholderData: (prev) => prev,
    enabled: isAuthenticated,
  });
}

export function useCheckSaved(jobId: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["saved-jobs", "check", jobId],
    queryFn: () =>
      savedJobsApi.checkSaved(jobId).then((r) => r.data.data.saved),
    enabled: !!jobId && isAuthenticated,
    staleTime: 0,
  });
}

export function useToggleSaveJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) =>
      savedJobsApi.toggleSave(jobId).then((r) => r.data.data),
    onSuccess: async (res, jobId) => {
      qc.setQueryData(["saved-jobs", "check", jobId], res.saved);
      await qc.invalidateQueries({ queryKey: ["saved-jobs"] });
      toast.success(res.saved ? "Đã lưu việc làm" : "Đã bỏ lưu việc làm");
    },
    onError: () => {
      toast.error("Không thể cập nhật. Vui lòng thử lại.");
    },
  });
}
