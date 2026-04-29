import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import type { QueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/stores/notification.store";
import type { AppNotification } from "@/types/notification";

let socket: Socket | null = null;

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
    toast(n.title, {
      description: n.message,
      action: onToastClick
        ? {
            label: "Xem",
            onClick: () => onToastClick(n),
          }
        : undefined,
    });
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
