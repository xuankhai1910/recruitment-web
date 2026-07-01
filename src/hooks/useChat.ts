import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { chatApi } from "@/api/chat.api";
import { useChatStore } from "@/stores/chat.store";
import {
  useAccessToken,
  useCurrentUser,
  useIsAuthenticated,
} from "@/stores/auth.store";
import {
  connectChatSocket,
  disconnectChatSocket,
  updateChatSocketToken,
} from "@/lib/chat-socket";
import type {
  ChatListParams,
  ChatMessage,
  ChatSide,
  MessagesData,
} from "@/types/chat";
import type { PaginatedData } from "@/types/api";

type ConversationsData = PaginatedData<import("@/types/chat").Conversation>;

/* ── Side detection ────────────────────────────────────────── */

const HR_ROLES = ["HR", "COMPANY_ADMIN", "SUPER_ADMIN"];

/** Suy ra phía chat từ role: HR nếu là HR/admin có công ty, còn lại là ứng viên. */
export function useChatSide(): ChatSide {
  const user = useCurrentUser();
  if (user && HR_ROLES.includes(user.role.name) && user.company?._id) {
    return "HR";
  }
  return "CANDIDATE";
}

/* ── Socket lifecycle ──────────────────────────────────────── */

export function useChatBootstrap() {
  const isAuthenticated = useIsAuthenticated();
  const token = useAccessToken();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectChatSocket();
      return;
    }
    connectChatSocket(token, { queryClient });
  }, [isAuthenticated, token, queryClient]);

  useEffect(() => {
    if (token) updateChatSocketToken(token);
  }, [token]);
}

/* ── Queries ───────────────────────────────────────────────── */

export function useConversations(side: ChatSide, params: ChatListParams = {}) {
  const isAuthenticated = useIsAuthenticated();

  return useQuery<ConversationsData>({
    queryKey: ["chat", "conversations", side, params],
    queryFn: async () => {
      const { data } = await chatApi.listConversations(side, params);
      return data.data;
    },
    enabled: isAuthenticated,
    staleTime: 10_000,
  });
}

export function useChatUnreadTotal(side: ChatSide) {
  const setUnread = useChatStore((s) => s.setUnread);
  const isOnline = useChatStore((s) => s.isOnline);
  const isAuthenticated = useIsAuthenticated();

  const query = useQuery({
    queryKey: ["chat", "unread-total", side],
    queryFn: async () => {
      const { data } = await chatApi.unreadTotal(side);
      return data.data.total;
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

export function useMessages(side: ChatSide, conversationId: string | null) {
  return useQuery<MessagesData>({
    queryKey: ["chat", "messages", conversationId],
    queryFn: async () => {
      const { data } = await chatApi.listMessages(side, conversationId!, {
        pageSize: 50,
      });
      return data.data;
    },
    enabled: !!conversationId,
    staleTime: 5_000,
  });
}

/* ── Mutations ─────────────────────────────────────────────── */

export function useSendMessage(side: ChatSide) {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      chatApi.sendMessage(side, id, content),
    onMutate: async ({ id, content }) => {
      const key = ["chat", "messages", id];
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<MessagesData>(key);
      if (prev) {
        const optimistic: ChatMessage = {
          _id: `tmp-${Date.now()}`,
          conversationId: id,
          senderId: String(currentUser?._id ?? ""),
          senderType: side,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        queryClient.setQueryData<MessagesData>(key, {
          ...prev,
          result: [...prev.result, optimistic],
        });
      }
      return { prev, key };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(ctx.key, ctx.prev);
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", vars.id],
      });
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });
}

export function useMarkConversationRead(side: ChatSide) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => chatApi.markRead(side, id),
    onSettled: (_data, _err, id) => {
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "unread-total"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "messages", id] });
    },
  });
}

/** HR mở hội thoại với ứng viên (resumeId hoặc candidateId). */
export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { resumeId?: string; candidateId?: string }) =>
      chatApi.start(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });
}
