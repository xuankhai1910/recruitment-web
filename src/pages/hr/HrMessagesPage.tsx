import { ChatPanel } from "@/components/chat/ChatPanel";

export function HrMessagesPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <ChatPanel side="HR" />
    </div>
  );
}
