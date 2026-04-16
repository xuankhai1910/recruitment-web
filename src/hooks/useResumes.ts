import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumesApi, type ResumeQueryParams } from '@/api/resumes.api';
import type { CreateResumeDto, UpdateResumeStatusDto } from '@/types/resume';
import { toast } from 'sonner';

export function useResumes(params: ResumeQueryParams) {
  return useQuery({
    queryKey: ['resumes', params],
    queryFn: () => resumesApi.getList(params).then((r) => r.data.data),
    placeholderData: (prev) => prev,
  });
}

export function useResume(id: string) {
  return useQuery({
    queryKey: ['resumes', id],
    queryFn: () => resumesApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useMyResumes() {
  return useQuery({
    queryKey: ['resumes', 'my'],
    queryFn: () => resumesApi.getByUser().then((r) => r.data.data),
  });
}

export function useCreateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateResumeDto) => resumesApi.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Nộp hồ sơ thành công');
    },
  });
}

export function useUpdateResumeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResumeStatusDto }) =>
      resumesApi.updateStatus(id, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Cập nhật trạng thái thành công');
    },
  });
}

export function useDeleteResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resumesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Đã xóa hồ sơ');
    },
  });
}
