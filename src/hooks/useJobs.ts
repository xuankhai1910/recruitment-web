import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi, type JobQueryParams } from '@/api/jobs.api';
import type { CreateJobDto } from '@/types/job';
import { toast } from 'sonner';

export function useJobs(params: JobQueryParams) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => jobsApi.getList(params).then((r) => r.data.data),
    placeholderData: (prev) => prev,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobDto) => jobsApi.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Tạo tin tuyển dụng thành công');
    },
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJobDto> }) =>
      jobsApi.update(id, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Cập nhật thành công');
    },
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Đã xóa tin tuyển dụng');
    },
  });
}
