import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileSearch,
  XCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Resume, ResumeHistory } from "@/types/resume";
import { cn } from "@/lib/utils";

// Canonical order of the resume lifecycle. Only used to order the steps the
// resume has actually gone through — future/unreached steps are never shown.
const STATUS_FLOW = ["PENDING", "REVIEWING", "APPROVED", "REJECTED"] as const;

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xử lý",
  REVIEWING: "Đang xem xét",
  APPROVED: "Được duyệt",
  REJECTED: "Bị từ chối",
};

const STATUS_STYLE: Record<
  string,
  { dot: string; ring: string; badge: string; text: string }
> = {
  PENDING: {
    dot: "bg-amber-500",
    ring: "ring-amber-200",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    text: "text-amber-700",
  },
  REVIEWING: {
    dot: "bg-teal-500",
    ring: "ring-teal-200",
    badge: "border-teal-200 bg-teal-50 text-teal-700",
    text: "text-teal-700",
  },
  APPROVED: {
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    text: "text-emerald-700",
  },
  REJECTED: {
    dot: "bg-rose-500",
    ring: "ring-rose-200",
    badge: "border-rose-200 bg-rose-50 text-rose-800",
    text: "text-rose-700",
  },
};

const STATUS_ICON: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  PENDING: Clock,
  REVIEWING: Eye,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
};

interface ResumeTimelineDialogProps {
  resume: Resume | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResumeTimelineDialog({
  resume,
  open,
  onOpenChange,
}: ResumeTimelineDialogProps) {
  if (!resume) return null;

  // Guard against null (deleted job/company) — `typeof null === "object"`.
  const job =
    resume.jobId && typeof resume.jobId === "object"
      ? resume.jobId
      : { _id: "", name: "Việc làm đã bị xóa" };
  const company =
    resume.companyId && typeof resume.companyId === "object"
      ? resume.companyId
      : { _id: "", name: "—" };

  const history: ResumeHistory[] =
    resume.history && resume.history.length > 0
      ? resume.history
      : [
          {
            status: "PENDING",
            updatedAt: resume.createdAt,
            updatedBy: { _id: "", email: resume.email },
          },
        ];

  const currentStatus = resume.status;

  const reachedSet = new Set<string>(history.map((h) => h.status));
  reachedSet.add(currentStatus);

  const flowSteps: string[] = STATUS_FLOW.filter((s) => reachedSet.has(s));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[96vw] !max-w-2xl overflow-y-auto sm:!max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-ink">
            Trạng thái hồ sơ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-xl border border-line bg-cream-2 p-3">
            <div className="flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-teal-600" />
              <p className="line-clamp-1 font-display text-sm font-semibold text-ink">
                {job.name}
              </p>
            </div>
            <p className="mt-0.5 text-xs text-slate-600">
              {company.name} · Nộp ngày{" "}
              {format(new Date(resume.createdAt), "dd/MM/yyyy")}
            </p>
          </div>

          {/* Status flow overview */}
          <div className="flex items-center gap-1">
            {flowSteps.map((s, idx, arr) => {
              // Every step here has been reached; the current (latest) one is
              // marked live with its status icon + ring, earlier ones show a
              // completed check.
              const isCurrent = s === currentStatus;
              const style = STATUS_STYLE[s];
              const Icon = STATUS_ICON[s] ?? Clock;
              const next = arr[idx + 1];
              return (
                <div key={s} className="flex flex-1 items-center gap-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-white transition-colors",
                        style.dot,
                        isCurrent ? style.ring : "ring-transparent",
                      )}
                    >
                      {isCurrent ? (
                        <Icon className="h-4 w-4 text-white" />
                      ) : (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "mt-1.5 text-[10px] font-medium",
                        isCurrent ? style.text : "text-ink",
                      )}
                    >
                      {STATUS_LABEL[s]}
                    </span>
                  </div>
                  {idx < arr.length - 1 && (
                    <div
                      className={cn(
                        "mb-4 h-0.5 flex-1 rounded-full",
                        STATUS_STYLE[next].dot,
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Vertical detailed timeline */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Chi tiết tiến trình
            </h4>
            <ol className="relative ml-4 border-l-2 border-line">
              {[...history]
                .sort(
                  (a, b) =>
                    new Date(a.updatedAt).getTime() -
                    new Date(b.updatedAt).getTime(),
                )
                .map((h, idx, arr) => {
                  const isLast = idx === arr.length - 1;
                  const Icon = STATUS_ICON[h.status] ?? Clock;
                  const style = STATUS_STYLE[h.status];
                  return (
                    <li
                      key={`${h.status}-${idx}`}
                      className="relative mb-4 pl-6 last:mb-0"
                    >
                      <span
                        className={cn(
                          "absolute -left-[11px] top-0 flex h-5 w-5 items-center justify-center rounded-full",
                          style?.dot ?? "bg-line",
                          isLast && "ring-4",
                          isLast && style?.ring,
                        )}
                      >
                        <Icon className="h-3 w-3 text-white" />
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                            style?.badge ??
                              "border-line bg-cream-2 text-slate-700",
                          )}
                        >
                          {STATUS_LABEL[h.status] ?? h.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(h.updatedAt), "dd/MM/yyyy HH:mm", {
                            locale: vi,
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Cập nhật bởi{" "}
                        <span className="font-medium text-ink">
                          {h.updatedBy?.email ?? "Hệ thống"}
                        </span>
                      </p>
                    </li>
                  );
                })}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
