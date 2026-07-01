import { api } from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  ChatListParams,
  ChatMessage,
  ChatSide,
  Conversation,
  MessagesData,
} from "@/types/chat";

/** HR dùng nhánh `/chat/hr/*` (qua permission model); ứng viên dùng `/chat/*`. */
function base(side: ChatSide): string {
  return side === "HR" ? "/chat/hr" : "/chat";
}

export const chatApi = {
  listConversations: (side: ChatSide, params: ChatListParams = {}) =>
    api.get<PaginatedResponse<Conversation>>(`${base(side)}/conversations`, {
      params,
    }),

  unreadTotal: (side: ChatSide) =>
    api.get<ApiResponse<{ total: number }>>(
      `${base(side)}/conversations/unread-total`,
    ),

  listMessages: (side: ChatSide, id: string, params: ChatListParams = {}) =>
    api.get<ApiResponse<MessagesData>>(
      `${base(side)}/conversations/${id}/messages`,
      { params },
    ),

  sendMessage: (side: ChatSide, id: string, content: string) =>
    api.post<ApiResponse<ChatMessage>>(
      `${base(side)}/conversations/${id}/messages`,
      { content },
    ),

  markRead: (side: ChatSide, id: string) =>
    api.patch<ApiResponse<{ readAt: string }>>(
      `${base(side)}/conversations/${id}/read`,
    ),

  /** Chỉ HR: mở (hoặc lấy lại) hội thoại với ứng viên đã nộp CV. */
  start: (payload: { resumeId?: string; candidateId?: string }) =>
    api.post<ApiResponse<Conversation>>("/chat/hr/conversations", payload),
};
