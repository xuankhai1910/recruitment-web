import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadFile } from "@/hooks/useFiles";
import { useCreateResume } from "@/hooks/useResumes";
import { useAuthStore } from "@/stores/auth.store";
import { FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";
import type { Job } from "@/types/job";

interface ApplyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
}

const MAX_SIZE = 1024 * 1024; // 1MB
const ACCEPT = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

export function ApplyModal({ open, onOpenChange, job }: ApplyModalProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);

  const uploadFile = useUploadFile();
  const createResume = useCreateResume();

  const onDrop = useCallback((accepted: File[], rejected: unknown[]) => {
    if (rejected.length > 0) {
      toast.error("File không hợp lệ. Chỉ nhận PDF/DOC/DOCX, tối đa 1MB.");
      return;
    }
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để ứng tuyển");
      onOpenChange(false);
      navigate("/login");
      return;
    }
    if (!file) {
      toast.error("Vui lòng chọn file CV");
      return;
    }
    try {
      const { fileName } = await uploadFile.mutateAsync({
        file,
        folderType: "resume",
      });
      await createResume.mutateAsync({
        url: fileName,
        companyId: job.company._id,
        jobId: job._id,
      });
      onOpenChange(false);
      setFile(null);
    } catch {
      toast.error("Nộp hồ sơ thất bại. Vui lòng thử lại.");
    }
  };

  const submitting = uploadFile.isPending || createResume.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Ứng tuyển</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{job.name}</span>
            <span className="text-muted-foreground"> · {job.company.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="apply-email">Email</Label>
            <Input
              id="apply-email"
              value={user?.email ?? ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-1.5">
            <Label>CV của bạn</Label>
            {file ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => {
                    setFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-200 ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-accent/30"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Kéo thả CV vào đây hoặc bấm để chọn
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    PDF, DOC, DOCX · tối đa 1MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={submitting}
            className="cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || submitting}
            className="cursor-pointer bg-[#22C55E] text-white transition-colors duration-200 hover:bg-[#16A34A]"
          >
            {submitting ? "Đang gửi..." : "Nộp hồ sơ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
