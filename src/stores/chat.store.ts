import { create } from "zustand";

interface ChatState {
  /** Tổng tin chưa đọc của phía đang đăng nhập (cho badge). */
  unread: number;
  /** Socket /chat đang kết nối hay không. */
  isOnline: boolean;
  /** Presence của đối phương: key = userId (ứng viên) hoặc companyId (công ty). */
  presence: Record<string, boolean>;
}

interface ChatActions {
  setUnread: (n: number) => void;
  setOnline: (online: boolean) => void;
  setPresence: (id: string, online: boolean) => void;
  reset: () => void;
}

const initialState: ChatState = {
  unread: 0,
  isOnline: false,
  presence: {},
};

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  ...initialState,

  setUnread: (unread) => set({ unread: Math.max(0, unread) }),
  setOnline: (isOnline) => set({ isOnline }),
  setPresence: (id, online) =>
    set((s) => ({ presence: { ...s.presence, [id]: online } })),
  reset: () => set({ ...initialState, presence: {} }),
}));
