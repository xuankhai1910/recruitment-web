import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { jobsApi, type JobQueryParams } from "@/api/jobs.api";
import type { CreateJobDto } from "@/types/job";
import { toast } from "sonner";

async function invalidateJobQueries(qc: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    qc.invalidateQueries({ queryKey: ["jobs"] }),
    qc.invalidateQueries({ queryKey: ["jobs-admin"] }),
  ]);
}

export function useJobs(params: JobQueryParams) {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => jobsApi.getList(params).then((r) => r.data.data),
    placeholderData: (prev) => prev,
  });
}

/**
 * Warm the React Query cache for an upcoming `useJobs` call. Used to prefetch
 * adjacent pages so paginating feels instant (cache hit, no network wait).
 *
 * `queryKey` + `queryFn` MUST mirror `useJobs` exactly so the later `useJobs`
 * call finds this entry. If the prefetch errors (slow Mongo on high offset,
 * 5xx, network), the entry is evicted — otherwise the next `useQuery` for
 * the same key would inherit the error and never call `placeholderData`,
 * leaving the page stuck on a skeleton.
 */
export function usePrefetchJobs() {
  const qc = useQueryClient();
  return useCallback(
    (params: JobQueryParams) => {
      const queryKey = ["jobs", params] as const;
      void qc
        .prefetchQuery({
          queryKey,
          queryFn: () => jobsApi.getList(params).then((r) => r.data.data),
          staleTime: 5 * 60 * 1000,
          retry: 0,
        })
        .then(() => {
          if (qc.getQueryState(queryKey)?.status === "error") {
            qc.removeQueries({ queryKey, exact: true });
          }
        });
    },
    [qc],
  );
}

// Admin variant — auto filter by user's company (HR) or return all (SUPER_ADMIN)
export function useJobsByAdmin(params: JobQueryParams) {
  return useQuery({
    queryKey: ["jobs-admin", params],
    queryFn: () => jobsApi.getListByAdmin(params).then((r) => r.data.data),
    placeholderData: (prev) => prev,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ["jobs", id],
    queryFn: () => jobsApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
    // Override the global `keepPreviousData` default — when the edit modal
    // switches from job A → job B, we don't want React Query to hand back
    // job A as placeholder; the JobModal would briefly hydrate the form
    // with the wrong job before the new fetch resolves.
    placeholderData: undefined,
  });
}

/**
 * Job taxonomy (categories + specializations + level/jobType/workMode enums).
 * Static on the server — cached forever client-side; only refetched on hard reload.
 *
 * Key is intentionally NOT under the `["jobs"]` prefix so job CRUD mutations
 * (which call `invalidateQueries({ queryKey: ["jobs"] })`) do not bust it.
 */
export function useJobTaxonomy() {
  return useQuery({
    queryKey: ["jobs-taxonomy"],
    queryFn: () => jobsApi.getTaxonomy().then((r) => r.data.data),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}

export function useSimilarJobs(id: string) {
  return useQuery({
    queryKey: ["jobs", id, "similar"],
    queryFn: () => jobsApi.getSimilar(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobDto) =>
      jobsApi.create(data).then((r) => r.data.data),
    onSuccess: async () => {
      await invalidateJobQueries(qc);
      toast.success("Tạo tin tuyển dụng thành công");
    },
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJobDto> }) =>
      jobsApi.update(id, data).then((r) => r.data.data),
    onSuccess: async (updatedJob) => {
      qc.setQueryData(["jobs", updatedJob._id], updatedJob);
      await invalidateJobQueries(qc);
      toast.success("Cập nhật thành công");
    },
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsApi.delete(id),
    onSuccess: async () => {
      await invalidateJobQueries(qc);
      toast.success("Đã xóa tin tuyển dụng");
    },
  });
}
