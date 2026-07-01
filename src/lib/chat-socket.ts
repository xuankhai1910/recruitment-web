import { io, type Socket } from "socket.io-client";
import type { QueryClient } from "@tanstack/react-query";
import { useChatStore } from "@/stores/chat.store";
import type { ChatPresenceEvent } from "@/types/chat";

let socket: Socket | null = null;

function resolveSocketHost(): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? "";
  return base.replace(/\/?api\/v\d+\/?$/, "");
}

interface ConnectOptions {
  queryClient: QueryClient;
}

export function connectChatSocket(
  token: string,
  options: ConnectOptions,
): Socket {
  if (socket?.connected) return socket;

  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  const { queryClient } = options;
  const host = resolveSocketHost();
  socket = io(`${host}/chat`, {
    transports: ["websocket"],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10_000,
  });

  const store = useChatStore;

  socket.on("connect", () => {
    store.getState().setOnline(true);
    queryClient.invalidateQueries({ queryKey: ["chat"] });
  });

  socket.on("disconnect", () => store.getState().setOnline(false));
  socket.on("connect_error", () => store.getState().setOnline(false));

  socket.on("chat:message", () => {
    // Tin mới: refetch danh sách hội thoại + tin nhắn của hội thoại liên quan.
    queryClient.invalidateQueries({ queryKey: ["chat"] });
  });

  socket.on("chat:read", () => {
    queryClient.invalidateQueries({ queryKey: ["chat"] });
  });

  socket.on("chat:unread-total", ({ total }: { total: number }) => {
    store.getState().setUnread(total);
  });

  socket.on("chat:presence", (e: ChatPresenceEvent) => {
    const id = e.scope === "user" ? e.userId : e.companyId;
    if (id) store.getState().setPresence(id, e.online);
  });

  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  useChatStore.getState().reset();
}

export function getChatSocket(): Socket | null {
  return socket;
}

export function updateChatSocketToken(token: string) {
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
  }
}
