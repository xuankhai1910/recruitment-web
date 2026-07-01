import { ChatPanel } from "@/components/chat/ChatPanel";

export function MessagesPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      <h1 className="mb-4 font-display text-2xl font-bold text-ink">Tin nhắn</h1>
      <div className="h-[calc(100vh-14rem)] min-h-[420px]">
        <ChatPanel side="CANDIDATE" />
      </div>
    </div>
  );
}
