/** Thời gian tương đối ngắn gọn (vi) cho danh sách hội thoại. */
export function chatTimeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "vừa xong";
  if (min < 60) return `${min} phút`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} giờ`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day} ngày`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

/** Giờ:phút cho từng tin nhắn. */
export function chatClock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Nhãn ngày phân tách giữa các nhóm tin nhắn. */
export function chatDayLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date();
  const isSameDay = d.toDateString() === today.toDateString();
  if (isSameDay) return "Hôm nay";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Hôm qua";
  return d.toLocaleDateString("vi-VN");
}
