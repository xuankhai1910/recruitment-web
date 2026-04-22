import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Sparkles, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BackButton } from "./BackButton";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPT = { "application/pdf": [".pdf"] };

interface UploadCvViewProps {
	onBack: () => void;
	onSubmit: (file: File) => void | Promise<void>;
}

export function UploadCvView({ onBack, onSubmit }: UploadCvViewProps) {
	const [pendingFile, setPendingFile] = useState<File | null>(null);

	const onDrop = useCallback((accepted: File[], rejected: unknown[]) => {
		if (rejected.length > 0) {
			toast.error("Chỉ chấp nhận file PDF, tối đa 5MB.");
			return;
		}
		if (accepted[0]) setPendingFile(accepted[0]);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: ACCEPT,
		maxSize: MAX_SIZE,
		multiple: false,
	});

	const handleBack = () => {
		setPendingFile(null);
		onBack();
	};

	return (
		<div className="space-y-4">
			<BackButton onClick={handleBack} />

			<div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50/50 p-4">
				<div className="flex items-start gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
						<Sparkles className="h-5 w-5" />
					</div>
					<div className="space-y-1">
						<p className="font-heading text-sm font-semibold text-violet-950">
							Upload CV để nhận gợi ý việc làm
						</p>
						<p className="text-xs leading-5 text-violet-900/80">
							File CV (PDF, ≤ 5MB) sẽ được phân tích bằng AI để gợi ý các vị trí
							phù hợp với kỹ năng & kinh nghiệm của bạn.
						</p>
					</div>
				</div>
			</div>

			{pendingFile ? (
				<div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
						<FileText className="h-5 w-5 text-primary" />
					</div>
					<div className="min-w-0 flex-1">
						<p
							className="truncate text-sm font-medium text-foreground"
							title={pendingFile.name}
						>
							{pendingFile.name}
						</p>
						<p className="text-xs text-muted-foreground">
							{(pendingFile.size / 1024).toFixed(0)} KB
						</p>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 cursor-pointer"
						onClick={() => {
							setPendingFile(null);
						}}
						aria-label="Bỏ file"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			) : (
				<div
					{...getRootProps()}
					className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors duration-200 ${
						isDragActive
							? "border-primary bg-primary/5"
							: "border-border hover:border-primary/50 hover:bg-accent/30"
					}`}
				>
					<input {...getInputProps()} />
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
						<Upload className="h-6 w-6 text-primary" />
					</div>
					<div>
						<p className="text-sm font-medium text-foreground">
							Kéo thả CV vào đây hoặc bấm để chọn
						</p>
						<p className="mt-0.5 text-xs text-muted-foreground">
							Chỉ hỗ trợ PDF · tối đa 5MB
						</p>
					</div>
				</div>
			)}

			<div className="flex justify-end gap-2">
				<Button
					variant="outline"
					onClick={handleBack}
					className="cursor-pointer"
				>
					Hủy
				</Button>
				<Button
					onClick={() => {
						if (pendingFile) void onSubmit(pendingFile);
					}}
					disabled={!pendingFile}
					className="cursor-pointer bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white transition-opacity duration-150 hover:opacity-90"
				>
					<Sparkles className="mr-2 h-4 w-4" />
					Phân tích & thiết lập
				</Button>
			</div>
		</div>
	);
}
