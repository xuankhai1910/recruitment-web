import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import {
  useChatUnreadTotal,
  useConversations,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import type { ChatSide } from "@/types/chat";

/** md breakpoint (768px) — desktop mới hiện 2 cột song song. */
function useIsDesktop(): boolean {
  const query = "(min-width: 768px)";
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : true,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

/**
 * Bố cục chat. Desktop: 2 cột (danh sách + cửa sổ). Mobile: 1 cột — chưa chọn thì
 * hiện danh sách, chọn rồi thì chỉ hiện khung chat (có nút quay lại). Dùng chung HR & ứng viên.
 */
export function ChatPanel({ side }: { side: ChatSide }) {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("c");
  const isDesktop = useIsDesktop();

  const convQuery = useConversations(side);
  const conversations = convQuery.data?.result ?? [];
  const messagesQuery = useMessages(side, selectedId);
  const send = useSendMessage(side);
  const markRead = useMarkConversationRead(side);
  useChatUnreadTotal(side); // đồng bộ badge

  const setSelected = (id: string, replace = false) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("c", id);
        return next;
      },
      { replace },
    );

  const clearSelected = () =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("c");
        return next;
      },
      { replace: true },
    );

  // Chỉ tự chọn hội thoại đầu trên desktop; mobile để người dùng thấy danh sách trước.
  useEffect(() => {
    if (isDesktop && !selectedId && conversations.length > 0) {
      setSelected(conversations[0]._id, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop, selectedId, conversations.length]);

  // Conversation hiển thị: ưu tiên bản mới từ query messages, fallback từ list.
  const conv =
    messagesQuery.data?.conversation ??
    conversations.find((c) => c._id === selectedId);
  const msgCount = messagesQuery.data?.result.length ?? 0;

  // Đánh dấu đã đọc khi mở hội thoại hoặc có tin mới.
  useEffect(() => {
    if (selectedId && conv && conv.unread > 0) {
      markRead.mutate(selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, conv?.unread, msgCount]);

  return (
    <div className="flex h-full overflow-hidden rounded-xl border border-border bg-background">
      {/* Danh sách: full-width trên mobile, thu về 72 trên md; ẩn khi đã chọn (mobile). */}
      <div
        className={cn(
          "flex-col border-r border-border md:flex md:w-72 md:shrink-0",
          selectedId ? "hidden" : "flex w-full",
        )}
      >
        <div className="border-b border-border px-4 py-3 text-sm font-semibold">
          Đoạn chat
        </div>
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={(id) => setSelected(id)}
          isLoading={convQuery.isLoading}
        />
      </div>

      {/* Cửa sổ chat: ẩn trên mobile khi chưa chọn. */}
      <div
        className={cn(
          "min-w-0 flex-1 md:flex",
          selectedId ? "flex" : "hidden",
        )}
      >
        <ChatWindow
          side={side}
          conversation={conv}
          messages={messagesQuery.data?.result ?? []}
          isLoading={messagesQuery.isLoading && !!selectedId}
          sending={send.isPending}
          onSend={(content) =>
            selectedId && send.mutate({ id: selectedId, content })
          }
          onBack={clearSelected}
        />
      </div>
    </div>
  );
}
