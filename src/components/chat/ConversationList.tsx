import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { companyLogoUrl } from "@/lib/format";
import { brandShort } from "@/lib/brand";
import { useChatStore } from "@/stores/chat.store";
import type { Conversation } from "@/types/chat";
import { chatTimeAgo } from "./chat-utils";

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading,
}: Props) {
  const presence = useChatStore((s) => s.presence);

  if (isLoading) {
    return (
      <div className="space-y-1 p-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
        Chưa có cuộc trò chuyện nào.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((c) => {
        const online = presence[c.otherParty._id] ?? c.otherOnline;
        const active = c._id === selectedId;
        const avatar =
          c.otherParty.logo != null
            ? companyLogoUrl(c.otherParty.logo)
            : c.otherParty.avatar?.startsWith("http")
              ? c.otherParty.avatar
              : "";
        return (
          <button
            key={c._id}
            type="button"
            onClick={() => onSelect(c._id)}
            className={cn(
              "flex w-full items-center gap-3 border-b border-border/50 px-3 py-3 text-left transition-colors",
              active ? "bg-primary/10" : "hover:bg-accent",
            )}
          >
            <div className="relative">
              <Avatar size="lg">
                {avatar ? <AvatarImage src={avatar} alt="" /> : null}
                <AvatarFallback>{brandShort(c.otherParty.name)}</AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute right-0 bottom-0 h-3 w-3 rounded-full ring-2 ring-background",
                  online ? "bg-emerald-500" : "bg-muted-foreground/40",
                )}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "truncate text-sm",
                    c.unread > 0 ? "font-semibold text-foreground" : "font-medium",
                  )}
                >
                  {c.otherParty.name}
                </span>
                {c.lastMessageAt && (
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {chatTimeAgo(c.lastMessageAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "truncate text-xs",
                    c.unread > 0
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {c.lastMessage || "Bắt đầu trò chuyện"}
                </span>
                {c.unread > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white tabular-nums">
                    {c.unread > 99 ? "99+" : c.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
