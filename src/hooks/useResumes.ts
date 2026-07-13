import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
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

/** Số lần user đã ứng tuyển 1 job — dùng để đổi nhãn nút & cảnh báo lần cuối. */
export function useApplyCount(jobId: string, enabled = true) {
  return useQuery({
    queryKey: ['resumes', 'apply-count', jobId],
    queryFn: () => resumesApi.getApplyCount(jobId).then((r) => r.data.data),
    enabled: enabled && !!jobId,
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

export function useAnalyzeResumeMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      resumesApi.analyzeMatch(id).then((r) => r.data.data),
    onSuccess: () => {
      // Match được lưu trên resume → làm mới list để cột "Độ phù hợp" cập nhật.
      qc.invalidateQueries({ queryKey: ['resumes'] });
    },
    onError: () => {
      toast.error('Phân tích độ phù hợp thất bại. Vui lòng thử lại.');
    },
  });
}

export function useMatchBatchQuota() {
  return useQuery({
    queryKey: ['match-batch-quota'],
    queryFn: () => resumesApi.getMatchBatchQuota().then((r) => r.data.data),
  });
}

/**
 * "Phân tích tất cả CV chưa chấm" cho HR. Xin server 1 lượt (server trừ quota +
 * trả danh sách resumeIds đã cap), rồi gọi analyzeMatch lần lượt phía client để
 * tránh timeout và hiện tiến trình X/Y. Mỗi CV đã cache sẽ chấm gần như tức thì.
 */
export function useBatchAnalyzeResumes() {
  const qc = useQueryClient();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number }>({
    done: 0,
    total: 0,
  });

  const run = useCallback(async () => {
    setRunning(true);
    setProgress({ done: 0, total: 0 });
    try {
      const start = await resumesApi
        .startMatchBatch()
        .then((r) => r.data.data);

      if (!start.resumeIds.length) {
        toast.info(start.message ?? 'Không có CV nào cần phân tích');
        return;
      }

      setProgress({ done: 0, total: start.resumeIds.length });
      let ok = 0;
      let fail = 0;
      for (const id of start.resumeIds) {
        try {
          await resumesApi.analyzeMatch(id);
          ok++;
        } catch (err: unknown) {
          // 429 = chạm ngưỡng throttle thoáng qua → đợi 2s rồi thử lại 1 lần,
          // tránh mất CV giữa batch chỉ vì rate limit trong giây lát.
          const status = (err as { response?: { status?: number } })?.response
            ?.status;
          if (status === 429) {
            await new Promise((r) => setTimeout(r, 2000));
            try {
              await resumesApi.analyzeMatch(id);
              ok++;
            } catch {
              fail++;
            }
          } else {
            fail++;
          }
        }
        setProgress((p) => ({ done: p.done + 1, total: p.total }));
      }

      qc.invalidateQueries({ queryKey: ['resumes'] });
      qc.invalidateQueries({ queryKey: ['match-batch-quota'] });
      toast.success(
        `Đã phân tích ${ok}/${start.resumeIds.length} CV` +
          (fail ? `, ${fail} lỗi` : '') +
          `. Còn ${start.remaining}/${start.limit} lượt trong tháng.`,
      );
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? 'Không thể bắt đầu phân tích hàng loạt');
    } finally {
      setRunning(false);
    }
  }, [qc]);

  return { run, running, progress };
}


export function useOpenResumeFile() {
  return useMutation({
    mutationFn: async ({
      url,
      mode = 'view',
    }: {
      url: string;
      mode?: 'view' | 'download';
    }) => {
      const popup = mode === 'view' ? window.open('', '_blank') : null;
      try {
        const res = await resumesApi.getFileBlob(url, mode === 'download');
        const blobUrl = URL.createObjectURL(res.data);

        if (mode === 'download') {
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = '';
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(blobUrl);
        } else if (popup) {
          popup.location.href = blobUrl;
          // Giải phóng blob URL sau khi tab mới đã có đủ thời gian tải xong.
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
        } else {
          window.open(blobUrl, '_blank', 'noopener,noreferrer');
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
        }
      } catch (err) {
        popup?.close();
        throw err;
      }
    },
    onError: () => {
      toast.error('Không thể mở file CV. Vui lòng thử lại.');
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
