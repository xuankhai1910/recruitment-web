import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Send, MessagesSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { companyLogoUrl } from "@/lib/format";
import { brandShort } from "@/lib/brand";
import { useChatStore } from "@/stores/chat.store";
import type { ChatMessage, ChatSide, Conversation } from "@/types/chat";
import { chatClock, chatDayLabel } from "./chat-utils";

interface Props {
  side: ChatSide;
  conversation?: Conversation;
  messages: ChatMessage[];
  isLoading?: boolean;
  sending?: boolean;
  onSend: (content: string) => void;
  /** Quay lại danh sách (chỉ hiện nút trên mobile). */
  onBack?: () => void;
}

export function ChatWindow({
  side,
  conversation,
  messages,
  isLoading,
  sending,
  onSend,
  onBack,
}: Props) {
  const presence = useChatStore((s) => s.presence);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, conversation?._id]);

  // Index của tin "cuối cùng do mình gửi" để gắn nhãn Đã xem / Đã gửi.
  const lastMineIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderType === side) return i;
    }
    return -1;
  }, [messages, side]);

  if (!conversation) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
        <MessagesSquare className="h-10 w-10 opacity-40" />
        <p className="text-sm">Chọn một cuộc trò chuyện để bắt đầu</p>
      </div>
    );
  }

  const online =
    presence[conversation.otherParty._id] ?? conversation.otherOnline;
  const avatar =
    conversation.otherParty.logo != null
      ? companyLogoUrl(conversation.otherParty.logo)
      : conversation.otherParty.avatar?.startsWith("http")
        ? conversation.otherParty.avatar
        : "";

  const submit = () => {
    const text = draft.trim();
    if (!text || sending) return;
    onSend(text);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Quay lại"
            className="-ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <Avatar>
          {avatar ? <AvatarImage src={avatar} alt="" /> : null}
          <AvatarFallback>
            {brandShort(conversation.otherParty.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {conversation.otherParty.name}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                online ? "bg-emerald-500" : "bg-muted-foreground/40",
              )}
            />
            {online ? "Đang hoạt động" : "Ngoại tuyến"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-1 overflow-y-auto bg-muted/20 px-4 py-4">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Đang tải tin nhắn…
          </p>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Chưa có tin nhắn. Hãy gửi lời chào!
          </p>
        ) : (
          messages.map((m, i) => {
            const mine = m.senderType === side;
            const prev = messages[i - 1];
            const showDay =
              !prev ||
              chatDayLabel(prev.createdAt) !== chatDayLabel(m.createdAt);
            const isLastMine = i === lastMineIndex;
            const seen =
              isLastMine &&
              conversation.otherLastReadAt != null &&
              new Date(conversation.otherLastReadAt).getTime() >=
                new Date(m.createdAt).getTime();
            return (
              <div key={m._id}>
                {showDay && (
                  <div className="my-3 text-center text-[11px] text-muted-foreground">
                    {chatDayLabel(m.createdAt)}
                  </div>
                )}
                <div
                  className={cn(
                    "flex",
                    mine ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm break-words whitespace-pre-wrap",
                      mine
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-background shadow-sm",
                    )}
                  >
                    {m.content}
                    <span
                      className={cn(
                        "mt-1 block text-right text-[10px]",
                        mine
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {chatClock(m.createdAt)}
                    </span>
                  </div>
                </div>
                {isLastMine && (
                  <p className="mt-0.5 pr-1 text-right text-[10px] text-muted-foreground">
                    {seen ? "Đã xem" : "Đã gửi"}
                  </p>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="flex items-end gap-2 border-t border-border px-3 py-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Nhập tin nhắn… (Enter để gửi, Shift+Enter xuống dòng)"
          className="max-h-32 min-h-10 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />
        <Button
          type="button"
          size="icon"
          onClick={submit}
          disabled={sending || !draft.trim()}
          aria-label="Gửi"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
