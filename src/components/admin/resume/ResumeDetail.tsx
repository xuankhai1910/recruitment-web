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
import { Loader2, FileDown } from "lucide-react";
import { useUpdateResumeStatus } from "@/hooks/useResumes";
import { STATUS_LIST, formatDateTime } from "@/lib/constants";
import type { Resume, UpdateResumeStatusDto } from "@/types/resume";

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
  const [status, setStatus] =
    useState<UpdateResumeStatusDto["status"]>("PENDING");

  useEffect(() => {
    if (resume) setStatus(resume.status);
  }, [resume]);

  if (!resume) return null;

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
      <DialogContent className="sm:max-w-xl">
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
              <a
                href={`${import.meta.env.VITE_STATIC_URL}/images/resume/${resume.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary transition-colors duration-150 hover:text-primary/80"
              >
                <FileDown className="h-4 w-4" />
                <span>Tải CV</span>
              </a>
            ) : (
              "—"
            )}
          </InfoItem>
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
