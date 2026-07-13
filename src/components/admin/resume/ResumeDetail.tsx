import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  FileDown,
  Sparkles,
  Brain,
  AlertTriangle,
  ListChecks,
} from "lucide-react";
import {
  useUpdateResumeStatus,
  useAnalyzeResumeMatch,
  useOpenResumeFile,
} from "@/hooks/useResumes";
import { MatchComparisonModal } from "@/components/common/match/MatchComparisonModal";
import { matchInputFromResumeMatch } from "@/lib/match-explanation";
import { STATUS_LIST, formatDateTime } from "@/lib/constants";
import type {
  Resume,
  UpdateResumeStatusDto,
  ResumeMatch,
  ResumeMatchResult,
} from "@/types/resume";

interface ResumeDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resume: Resume | null;
}

const statusStyle: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-300",
  REVIEWING: "bg-blue-50 text-blue-700 border-blue-300",
  APPROVED: "bg-green-50 text-green-700 border-green-300",
  REJECTED: "bg-red-50 text-red-700 border-red-300",
};

export function ResumeDetail({
  open,
  onOpenChange,
  resume,
}: ResumeDetailProps) {
  const updateStatus = useUpdateResumeStatus();
  const analyzeMatch = useAnalyzeResumeMatch();
  const openResumeFile = useOpenResumeFile();
  const [status, setStatus] =
    useState<UpdateResumeStatusDto["status"]>("PENDING");
  const [match, setMatch] = useState<ResumeMatch | ResumeMatchResult | null>(
    null,
  );

  useEffect(() => {
    if (resume) {
      setStatus(resume.status);
      setMatch(resume.match ?? null);
    }
  }, [resume]);

  if (!resume) return null;

  const handleAnalyze = async () => {
    try {
      const res = await analyzeMatch.mutateAsync(resume._id);
      setMatch(res);
    } catch {
      // toast đã xử lý trong hook
    }
  };

  const jobName =
    typeof resume.jobId === "object" ? resume.jobId.name : resume.jobId;
  const companyName =
    typeof resume.companyId === "object"
      ? resume.companyId.name
      : resume.companyId;

  const handleChangeStatus = async () => {
    await updateStatus.mutateAsync({ id: resume._id, data: { status } });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Thông tin hồ sơ</DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <InfoItem label="Email" value={resume.email} span={2} />
          <InfoItem label="Công việc" value={jobName} />
          <InfoItem label="Công ty" value={companyName} />
          <InfoItem label="Trạng thái">
            <Badge
              variant="outline"
              className={statusStyle[resume.status] ?? ""}
            >
              {resume.status}
            </Badge>
          </InfoItem>
          <InfoItem
            label="Ngày nộp"
            value={formatDateTime(resume.createdAt)}
          />
          <InfoItem label="CV">
            {resume.url ? (
              <button
                type="button"
                onClick={() =>
                  openResumeFile.mutate({ url: resume.url })
                }
                className="inline-flex items-center gap-1 text-primary transition-colors duration-150 hover:text-primary/80"
              >
                <FileDown className="h-4 w-4" />
                <span>Tải CV</span>
              </button>
            ) : (
              "—"
            )}
          </InfoItem>
        </div>

        <Separator />

        {/* AI match analysis */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">
              Độ phù hợp với tin tuyển dụng
            </p>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={analyzeMatch.isPending}
              onClick={handleAnalyze}
            >
              {analyzeMatch.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-4 w-4" />
              )}
              {match ? "Phân tích lại" : "Phân tích độ phù hợp"}
            </Button>
          </div>

          {match ? (
            <MatchPanel match={match} />
          ) : (
            <p className="text-xs text-muted-foreground">
              Bấm "Phân tích độ phù hợp" để AI chấm điểm CV của ứng viên so với
              tin tuyển dụng họ đã ứng tuyển.
            </p>
          )}
        </div>

        <Separator />

        {/* Change status */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            Cập nhật trạng thái
          </p>
          <div className="flex items-center gap-3">
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as UpdateResumeStatusDto["status"]);
              }}
            >
              <SelectTrigger className="w-48 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_LIST.map((s) => (
                  <SelectItem key={s} value={s} className="cursor-pointer">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="cursor-pointer bg-primary transition-colors duration-150 hover:bg-primary/90"
              disabled={updateStatus.isPending}
              onClick={handleChangeStatus}
            >
              {updateStatus.isPending && (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              )}
              Lưu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({
  label,
  value,
  children,
  span,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
  span?: number;
}) {
  return (
    <div className={span === 2 ? "col-span-2" : ""}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-0.5 text-sm text-foreground">
        {children ?? value ?? "—"}
      </div>
    </div>
  );
}

function MatchPanel({ match }: { match: ResumeMatch | ResumeMatchResult }) {
  const [compareOpen, setCompareOpen] = useState(false);
  const pct = Math.round((match.score ?? 0) * 100);
  const scoreColor =
    pct >= 70
      ? "text-green-600"
      : pct >= 40
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <span className={`font-heading text-3xl font-bold ${scoreColor}`}>
            {pct}%
          </span>
          <span className="text-xs text-muted-foreground">phù hợp</span>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Brain className="h-4 w-4 text-teal-600" />
            {match.analyzedBy === "ai"
              ? "Phân tích bởi Gemini AI"
              : "Phân tích cơ bản"}
          </div>
          {match.analyzedBy === "keyword" && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              Phân tích bằng từ khoá — có thể kém chính xác
            </div>
          )}
        </div>
      </div>

      {/* Matched skills */}
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Kỹ năng khớp ({match.matchedSkills.length})
        </p>
        {match.matchedSkills.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có kỹ năng khớp</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {match.matchedSkills.map((s) => (
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
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full cursor-pointer"
        onClick={() => setCompareOpen(true)}
      >
        <ListChecks className="mr-1.5 h-4 w-4" />
        Xem so sánh chi tiết CV ↔ tin tuyển
      </Button>

      <MatchComparisonModal
        open={compareOpen}
        onOpenChange={setCompareOpen}
        input={matchInputFromResumeMatch(match)}
        incomplete={!match.jobRequirements}
      />
    </div>
  );
}
