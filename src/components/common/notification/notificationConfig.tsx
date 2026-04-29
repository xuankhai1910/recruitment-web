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
	NEW_RESUME_RECEIVED: "bg-primary/10 text-primary",
	RESUME_SUBMITTED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
	RESUME_STATUS_CHANGED: "bg-secondary/40 text-secondary-foreground",
};

export function getNotificationAccent(n: AppNotification): string {
	if (n.type === "RESUME_STATUS_CHANGED") {
		switch (n.data.status) {
			case "APPROVED":
				return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
			case "REJECTED":
				return "bg-destructive/10 text-destructive";
			case "REVIEWING":
				return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
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

/**
 * Frontend route overrides — BE may return URLs that don't exist in this SPA
 * (e.g. `/profile/resumes/:id`, `/hr/resumes/:id`). Keep BE-provided values as
 * fallback, but route to pages that actually exist in the app.
 */
const NOTIFICATION_ROUTER: Partial<
	Record<NotificationType, (n: AppNotification) => string | undefined>
> = {
	// HR-side: route to the resumes management page (no detail route on FE).
	NEW_RESUME_RECEIVED: () => "/admin/resume",

	// Applicant: send to the job they applied to (FE has no resume detail page).
	RESUME_SUBMITTED: (n) => (n.data.jobId ? `/jobs/${n.data.jobId}` : undefined),
	RESUME_STATUS_CHANGED: (n) =>
		n.data.jobId ? `/jobs/${n.data.jobId}` : undefined,
};

/**
 * Returns a safe in-app URL for the given notification. Falls back to the
 * BE-provided `ctaUrl` only if it points to a route the SPA can handle;
 * otherwise returns the home page so we never navigate to a 404.
 */
export function resolveCtaUrl(n: AppNotification): string {
	const override = NOTIFICATION_ROUTER[n.type]?.(n);
	if (override) return override;

	const fromBe = n.ctaUrl ?? "";
	// Whitelist FE-known prefixes — anything else falls back to home.
	const allowed = ["/jobs", "/companies", "/admin", "/notifications"];
	if (allowed.some((p) => fromBe.startsWith(p))) return fromBe;
	return "/";
}

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
	NEW_RESUME_RECEIVED: "Đơn ứng tuyển mới",
	RESUME_SUBMITTED: "Đã ứng tuyển",
	RESUME_STATUS_CHANGED: "Cập nhật trạng thái",
};
