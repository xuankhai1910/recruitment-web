import type { ResumeStatus } from "@/types/stats";

/** Single source of truth for resume-status presentation across dashboards. */
export const STATUS_META: Record<
  ResumeStatus,
  { label: string; badgeClass: string; color: string; barClass: string }
> = {
  PENDING: {
    label: "Chờ duyệt",
    badgeClass: "bg-yellow-50 text-yellow-700 border-yellow-200",
    color: "#F59E0B",
    barClass: "bg-yellow-500",
  },
  REVIEWING: {
    label: "Đang xem",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    color: "#3B82F6",
    barClass: "bg-blue-500",
  },
  APPROVED: {
    label: "Đã duyệt",
    badgeClass: "bg-green-50 text-green-700 border-green-200",
    color: "#10B981",
    barClass: "bg-green-500",
  },
  REJECTED: {
    label: "Từ chối",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    color: "#EF4444",
    barClass: "bg-red-500",
  },
};

export const STATUS_ORDER: ResumeStatus[] = [
  "PENDING",
  "REVIEWING",
  "APPROVED",
  "REJECTED",
];

/** Blue ramp for the six job levels (INTERN → LEAD), matching the design. */
export const LEVEL_COLORS: Record<string, string> = {
  INTERN: "#93C5FD",
  FRESHER: "#60A5FA",
  JUNIOR: "#3B82F6",
  MID: "#2563EB",
  SENIOR: "#1D4ED8",
  LEAD: "#1E40AF",
};

export const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "#1E293B",
  ADMIN: "#1E293B",
  HR: "#8B5CF6",
  USER: "#3B82F6",
  NORMAL_USER: "#3B82F6",
};
