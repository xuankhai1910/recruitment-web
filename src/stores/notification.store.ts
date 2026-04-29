import { create } from "zustand";

interface NotificationState {
  unread: number;
  isOnline: boolean;
}

interface NotificationActions {
  setUnread: (n: number) => void;
  incrementUnread: (delta?: number) => void;
  decrementUnread: (delta?: number) => void;
  setOnline: (online: boolean) => void;
  reset: () => void;
}

const initialState: NotificationState = {
  unread: 0,
  isOnline: false,
};

export const useNotificationStore = create<
  NotificationState & NotificationActions
>((set) => ({
  ...initialState,

  setUnread: (unread) => set({ unread: Math.max(0, unread) }),
  incrementUnread: (delta = 1) =>
    set((s) => ({ unread: Math.max(0, s.unread + delta) })),
  decrementUnread: (delta = 1) =>
    set((s) => ({ unread: Math.max(0, s.unread - delta) })),
  setOnline: (isOnline) => set({ isOnline }),
  reset: () => set({ ...initialState }),
}));
