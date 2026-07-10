import {
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  Send,
  XCircle,
} from "lucide-react";
import type {
  AppNotification,
  NotificationResumeStatus,
  NotificationType,
} from "@/types/notification";
import { useAuthStore } from "@/stores/auth.store";

type IconRenderer = (n: AppNotification) => React.ReactNode;

const STATUS_ICON: Record<NotificationResumeStatus, IconRenderer> = {
  PENDING: () => <Clock className="h-4 w-4" />,
  REVIEWING: () => <FileText className="h-4 w-4" />,
  APPROVED: () => <CheckCircle2 className="h-4 w-4" />,
  REJECTED: () => <XCircle className="h-4 w-4" />,
};

export const NOTIFICATION_ICON: Record<NotificationType, IconRenderer> = {
  NEW_RESUME_RECEIVED: () => <Inbox className="h-4 w-4" />,
  RESUME_SUBMITTED: () => <Send className="h-4 w-4" />,
  RESUME_STATUS_CHANGED: (n) =>
    (n.data.status && STATUS_ICON[n.data.status]?.(n)) ?? (
      <Bell className="h-4 w-4" />
    ),
};

export const NOTIFICATION_ACCENT: Record<NotificationType, string> = {
  NEW_RESUME_RECEIVED: "bg-[#EFF6FF] text-[#1D4ED8]",
  RESUME_SUBMITTED: "bg-[#F0FDFA] text-[#0F766E]",
  RESUME_STATUS_CHANGED: "bg-[#F4F4EF] text-[#0F172A]",
};

export function getNotificationAccent(n: AppNotification): string {
  if (n.type === "RESUME_STATUS_CHANGED") {
    switch (n.data.status) {
      case "APPROVED":
        return "bg-[#ECFDF5] text-[#047857]";
      case "REJECTED":
        return "bg-[#FEF2F2] text-[#B91C1C]";
      case "REVIEWING":
        return "bg-[#FFFBEB] text-[#B45309]";
      default:
        return NOTIFICATION_ACCENT[n.type];
    }
  }
  return NOTIFICATION_ACCENT[n.type];
}

export function renderNotificationIcon(n: AppNotification): React.ReactNode {
  const renderer = NOTIFICATION_ICON[n.type];
  return renderer ? renderer(n) : <Bell className="h-4 w-4" />;
}

const NOTIFICATION_ROUTER: Partial<
  Record<NotificationType, (n: AppNotification) => string | undefined>
> = {
  // HR-side: route to resumes management. HR → /hr/resumes, SUPER_ADMIN → /admin/resume.
  NEW_RESUME_RECEIVED: () => {
    const role = useAuthStore.getState().user?.role?.name;
    return role === "HR" ? "/hr/resumes" : "/admin/resume";
  },

  // Applicant: send to the job they applied to (FE has no resume detail page).
  RESUME_SUBMITTED: (n) => (n.data.jobId ? `/jobs/${n.data.jobId}` : undefined),
  RESUME_STATUS_CHANGED: (n) =>
    n.data.jobId ? `/jobs/${n.data.jobId}` : undefined,
};

export function resolveCtaUrl(n: AppNotification): string {
  const override = NOTIFICATION_ROUTER[n.type]?.(n);
  if (override) return override;

  const fromBe = n.ctaUrl ?? "";
  // Whitelist FE-known prefixes — anything else falls back to home.
  const allowed = ["/jobs", "/companies", "/admin", "/hr", "/account"];
  if (allowed.some((p) => fromBe.startsWith(p))) return fromBe;
  return "/";
}

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  NEW_RESUME_RECEIVED: "Đơn ứng tuyển mới",
  RESUME_SUBMITTED: "Đã ứng tuyển",
  RESUME_STATUS_CHANGED: "Cập nhật trạng thái",
};
