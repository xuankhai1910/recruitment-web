import type { PaginationMeta } from "@/types/api";

/** Phía gửi/đọc trong hội thoại. */
export type ChatSide = "CANDIDATE" | "HR";

export interface ChatOtherParty {
  _id: string;
  name: string;
  avatar?: string | null;
  logo?: string | null;
}

export interface Conversation {
  _id: string;
  candidateId: string;
  companyId: string;
  relatedJobId?: string | null;
  relatedResumeId?: string | null;
  lastMessage: string;
  lastMessageAt?: string | null;
  lastSenderType?: ChatSide | null;
  /** Số tin chưa đọc theo góc nhìn của phía đang xem. */
  unread: number;
  /** Mốc đọc cuối của phía đang xem. */
  myLastReadAt?: string | null;
  /** Mốc đọc cuối của phía kia → suy ra "Đã xem" cho tin mình gửi. */
  otherLastReadAt?: string | null;
  otherParty: ChatOtherParty;
  otherOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderType: ChatSide;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload của GET .../conversations/:id/messages (data trong ApiResponse). */
export interface MessagesData {
  meta: PaginationMeta;
  result: ChatMessage[];
  conversation: Conversation;
}

export interface ChatListParams {
  current?: number;
  pageSize?: number;
}

/* ── Socket event payloads ─────────────────────────────────── */

export interface ChatMessageEvent {
  conversationId: string;
  message: ChatMessage;
}

export interface ChatReadEvent {
  conversationId: string;
  readerSide: ChatSide;
  readAt: string;
}

export interface ChatPresenceEvent {
  scope: "user" | "company";
  userId?: string;
  companyId?: string;
  online: boolean;
}
