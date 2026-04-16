import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api';
import type { Subscriber, CreateSubscriberDto } from '@/types/subscriber';

export const subscribersApi = {
  getList: (params: PaginationParams) =>
    api.get<PaginatedResponse<Subscriber>>('/subscribers', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Subscriber>>(`/subscribers/${id}`),

  create: (data: CreateSubscriberDto) =>
    api.post<ApiResponse<Subscriber>>('/subscribers', data),

  getSkills: () =>
    api.post<ApiResponse<Subscriber>>('/subscribers/skills'),

  update: (data: Partial<CreateSubscriberDto>) =>
    api.patch<ApiResponse<Subscriber>>('/subscribers', data),

  delete: (id: string) =>
    api.delete<ApiResponse<Subscriber>>(`/subscribers/${id}`),
};
