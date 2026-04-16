import { useMutation } from '@tanstack/react-query';
import { filesApi } from '@/api/files.api';
import { toast } from 'sonner';

export function useUploadFile() {
  return useMutation({
    mutationFn: ({ file, folderType }: { file: File; folderType?: string }) =>
      filesApi.upload(file, folderType).then((r) => r.data.data),
    onError: () => {
      toast.error('Upload thất bại. Kiểm tra lại dung lượng và định dạng file.');
    },
  });
}
