import { api } from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  AppNotification,
  NotificationListParams,
} from "@/types/notification";

export const notificationsApi = {
  list: (params: NotificationListParams = {}) =>
    api.get<PaginatedResponse<AppNotification>>("/notifications", { params }),

  unreadCount: () =>
    api.get<ApiResponse<{ unread: number }>>("/notifications/unread-count"),

  markRead: (id: string) =>
    api.patch<ApiResponse<AppNotification>>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch<ApiResponse<{ updated: number }>>("/notifications/read-all"),

  remove: (id: string) =>
    api.delete<ApiResponse<{ _id: string }>>(`/notifications/${id}`),
};
