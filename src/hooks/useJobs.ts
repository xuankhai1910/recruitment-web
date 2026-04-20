import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
