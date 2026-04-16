import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';

export const filesApi = {
  upload: (file: File, folderType?: string) => {
    const formData = new FormData();
    formData.append('fileUpload', file);
    return api.post<ApiResponse<{ fileName: string }>>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        folder_type: folderType ?? 'default',
      },
    });
  },
};
