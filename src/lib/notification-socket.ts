import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import type { QueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/stores/notification.store";
import type { AppNotification } from "@/types/notification";

let socket: Socket | null = null;

// Notification types mirror a change to a resume/application. When one arrives
// we also refetch the ['resumes'] query family so any open list/detail updates
// in real time — the candidate's "Đơn ứng tuyển" page (['resumes','my']) and
// the HR resume table (['resumes', params]) — instead of only the bell badge.
const RESUME_RELATED_TYPES = new Set<AppNotification["type"]>([
  "RESUME_STATUS_CHANGED",
  "NEW_RESUME_RECEIVED",
  "RESUME_SUBMITTED",
]);

// Các loại noti là "xác nhận hành động do chính user vừa thực hiện ở tab này".
// Mutation tương ứng (vd useCreateResume) đã bật toast thành công, nên nếu socket
// bắn thêm toast nữa thì người dùng thấy 2 toast trùng. Vẫn tăng badge + invalidate
// như thường, chỉ bỏ qua toast cho các loại này.
const SELF_CONFIRM_TYPES = new Set<AppNotification["type"]>([
  "RESUME_SUBMITTED",
]);

function resolveSocketHost(): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? "";
  return base.replace(/\/?api\/v\d+\/?$/, "");
}

interface ConnectOptions {
  queryClient: QueryClient;
  onToastClick?: (notification: AppNotification) => void;
}

export function connectNotificationSocket(
  token: string,
  options: ConnectOptions,
): Socket {
  if (socket?.connected) return socket;

  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  const { queryClient, onToastClick } = options;
  const host = resolveSocketHost();
  socket = io(`${host}/notifications`, {
    transports: ["websocket"],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10_000,
  });

  const store = useNotificationStore;

  socket.on("connect", () => {
    store.getState().setOnline(true);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  });

  socket.on("disconnect", () => {
    store.getState().setOnline(false);
  });

  socket.on("connect_error", () => {
    store.getState().setOnline(false);
  });

  socket.on("notification:new", (n: AppNotification) => {
    if (!n.isRead) store.getState().incrementUnread();
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    if (RESUME_RELATED_TYPES.has(n.type)) {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    }
    if (!SELF_CONFIRM_TYPES.has(n.type)) {
      toast(n.title, {
        description: n.message,
        action: onToastClick
          ? {
              label: "Xem",
              onClick: () => onToastClick(n),
            }
          : undefined,
      });
    }
  });

  socket.on("notification:unread-count", ({ unread }: { unread: number }) => {
    store.getState().setUnread(unread);
  });

  socket.on("notification:read", () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  });

  socket.on("notification:deleted", () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  });

  return socket;
}

export function disconnectNotificationSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  useNotificationStore.getState().reset();
}

export function getNotificationSocket(): Socket | null {
  return socket;
}

export function updateNotificationSocketToken(token: string) {
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
  }
}
