import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { notificationsApi } from "@/api/notifications.api";
import { useNotificationStore } from "@/stores/notification.store";
import { useIsAuthenticated, useAccessToken } from "@/stores/auth.store";
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
  updateNotificationSocketToken,
} from "@/lib/notification-socket";
import { resolveCtaUrl } from "@/components/common/notification/notificationConfig";
import type {
  AppNotification,
  NotificationListParams,
} from "@/types/notification";
import type { PaginatedData, PaginatedResponse } from "@/types/api";

type ListData = PaginatedData<AppNotification>;

/* ------------------------------------------------------------------ */
/* Cache helpers — keep all `['notifications', ...]` queries in sync   */
/* ------------------------------------------------------------------ */

function updateAllListCaches(
  queryClient: QueryClient,
  updater: (n: AppNotification) => AppNotification | null,
) {
  queryClient.setQueriesData<PaginatedResponse<AppNotification> | ListData>(
    { queryKey: ["notifications", "list"] },
    (old) => {
      if (!old) return old;
      // Hooks store the unwrapped `data` (PaginatedData), not the axios response.
      const data = old as ListData;
      const nextResult: AppNotification[] = [];
      for (const item of data.result) {
        const updated = updater(item);
        if (updated !== null) nextResult.push(updated);
      }
      return { ...data, result: nextResult } as ListData;
    },
  );
}

/* ------------------------------------------------------------------ */
/* Socket lifecycle                                                    */
/* ------------------------------------------------------------------ */

export function useNotificationBootstrap() {
  const isAuthenticated = useIsAuthenticated();
  const token = useAccessToken();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectNotificationSocket();
      return;
    }

    connectNotificationSocket(token, {
      queryClient,
      onToastClick: (n) => navigate(resolveCtaUrl(n)),
    });
  }, [isAuthenticated, token, navigate, queryClient]);

  useEffect(() => {
    if (token) updateNotificationSocketToken(token);
  }, [token]);
}

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

export function useNotificationList(params: NotificationListParams = {}) {
  const isAuthenticated = useIsAuthenticated();

  return useQuery<ListData>({
    queryKey: ["notifications", "list", params],
    queryFn: async () => {
      const { data } = await notificationsApi.list(params);
      return data.data;
    },
    enabled: isAuthenticated,
    staleTime: 10_000,
  });
}

export function useUnreadCount() {
  const setUnread = useNotificationStore((s) => s.setUnread);
  const isOnline = useNotificationStore((s) => s.isOnline);
  const isAuthenticated = useIsAuthenticated();

  const query = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { data } = await notificationsApi.unreadCount();
      return data.data.unread;
    },
    enabled: isAuthenticated,
    refetchInterval: isOnline ? false : 30_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (typeof query.data === "number") setUnread(query.data);
  }, [query.data, setUnread]);

  return query;
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const decrementUnread = useNotificationStore((s) => s.decrementUnread);

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onMutate: (id) => {
      let wasUnread = false;
      updateAllListCaches(queryClient, (n) => {
        if (n._id !== id) return n;
        if (!n.isRead) wasUnread = true;
        return { ...n, isRead: true, readAt: new Date().toISOString() };
      });
      if (wasUnread) decrementUnread();
      return { wasUnread };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.wasUnread) {
        useNotificationStore.getState().incrementUnread();
      }
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onMutate: () => {
      const now = new Date().toISOString();
      updateAllListCaches(queryClient, (n) =>
        n.isRead ? n : { ...n, isRead: true, readAt: now },
      );
      useNotificationStore.getState().setUnread(0);
    },
    onSuccess: () => {
      toast.success("Đã đánh dấu tất cả là đã đọc");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const decrementUnread = useNotificationStore((s) => s.decrementUnread);

  return useMutation({
    mutationFn: (id: string) => notificationsApi.remove(id),
    onMutate: (id) => {
      let wasUnread = false;
      updateAllListCaches(queryClient, (n) => {
        if (n._id !== id) return n;
        if (!n.isRead) wasUnread = true;
        return null;
      });
      if (wasUnread) decrementUnread();
      return { wasUnread };
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export type { AppNotification };
