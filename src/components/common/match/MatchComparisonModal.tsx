import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, AlertTriangle, Check, Sparkles } from "lucide-react";
import {
  buildMatchExplanation,
  verdictLabel,
  type Verdict,
} from "@/lib/match-explanation";
import type { MatchInput } from "@/types/match";
import { cn } from "@/lib/utils";

interface MatchComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  input: MatchInput;
  /** Job title to show in the header (optional fallback to input.job.name). */
  jobName?: string;
  /** Show a hint that re-analysis is needed (old match without job snapshot). */
  incomplete?: boolean;
}

const verdictStyle: Record<Verdict, string> = {
  match: "border-green-200 bg-green-50 text-green-700",
  partial: "border-amber-200 bg-amber-50 text-amber-700",
  mismatch: "border-red-200 bg-red-50 text-red-700",
  unknown: "border-slate-200 bg-slate-50 text-slate-500",
};

export function MatchComparisonModal({
  open,
  onOpenChange,
  input,
  jobName,
  incomplete,
}: MatchComparisonModalProps) {
  const ex = buildMatchExplanation(input);
  const pct = ex.overallPct;
  const scoreColor =
    pct >= 70
      ? "text-green-600"
      : pct >= 40
        ? "text-amber-600"
        : "text-red-600";
  const title = jobName ?? input.job.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-600" />
            Vì sao phù hợp?
          </DialogTitle>
          {title && (
            <p className="text-sm text-muted-foreground">
              So sánh CV của bạn với{" "}
              <span className="font-medium text-foreground">{title}</span>
            </p>
          )}
        </DialogHeader>

        <Separator />

        {/* Overall score */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className={`font-heading text-4xl font-bold ${scoreColor}`}>
              {pct}%
            </span>
            <span className="text-xs text-muted-foreground">phù hợp</span>
          </div>
          <div className="flex-1 space-y-1">
            {input.analyzedBy && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Brain className="h-4 w-4 text-teal-600" />
                {input.analyzedBy === "ai"
                  ? "Phân tích bởi Gemini AI"
                  : "Phân tích cơ bản (từ khoá)"}
              </div>
            )}
            {input.analyzedBy === "keyword" && (
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                Phân tích bằng từ khoá — có thể kém chính xác
              </div>
            )}
            {ex.estimated && (
              <p className="text-xs text-muted-foreground">
                Một số thông tin (cấp độ, vị trí, địa điểm) được suy ra từ hồ
                sơ của bạn.
              </p>
            )}
          </div>
        </div>

        {/* Why it matches — template sentences */}
        {ex.sentences.length > 0 && (
          <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3">
            <ul className="space-y-1.5">
              {ex.sentences.map((s) => (
                <li
                  key={s}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Kỹ năng khớp ({ex.matchedSkills.length}/{ex.jobSkillCount})
          </p>
          {ex.matchedSkills.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {ex.jobSkillCount === 0
                ? "Tin tuyển chưa khai báo kỹ năng yêu cầu."
                : "Không có kỹ năng khớp."}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {ex.matchedSkills.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="border-teal-200 bg-teal-50 font-normal text-teal-700"
                >
                  {s}
                </Badge>
              ))}
            </div>
          )}
          {ex.missingSkills.length > 0 && (
            <>
              <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Kỹ năng còn thiếu ({ex.missingSkills.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ex.missingSkills.map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="border-slate-200 bg-slate-50 font-normal text-slate-500"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>

        <Separator />

        {/* Field-by-field comparison */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            So sánh chi tiết
          </p>
          <div className="overflow-hidden rounded-xl border border-border">
            {/* Tiêu đề cột: cột nào là CV/hồ sơ, cột nào là yêu cầu của tin */}
            <div className="grid grid-cols-[88px_1fr_1fr_auto] gap-2 border-b border-border bg-muted/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide sm:grid-cols-[150px_1fr_1fr_auto]">
              <span />
              <span className="text-teal-700">Hồ sơ / CV</span>
              <span className="text-slate-500">Tin tuyển dụng</span>
              <span className="justify-self-end text-slate-500">Đánh giá</span>
            </div>
            {ex.rows.map((row, i) => (
              <div
                key={row.key}
                className={cn(
                  "grid grid-cols-[88px_1fr_1fr_auto] items-center gap-2 px-3 py-2.5 sm:grid-cols-[150px_1fr_1fr_auto]",
                  i > 0 && "border-t border-border",
                )}
              >
                <span className="text-sm font-medium text-foreground">
                  {row.label}
                </span>
                <span
                  className="min-w-0 truncate text-sm text-teal-800"
                  title={row.cvText}
                >
                  {row.cvText}
                </span>
                <span
                  className="min-w-0 truncate text-sm text-foreground"
                  title={row.jobText}
                >
                  {row.jobText}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "justify-self-end font-normal",
                    verdictStyle[row.verdict],
                  )}
                >
                  {verdictLabel(row.verdict)}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {incomplete && (
          <p className="flex items-start gap-1.5 text-xs text-amber-600">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Hồ sơ này được chấm trước khi có tính năng so sánh. Bấm "Phân tích
            lại" để xem so sánh đầy đủ.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
