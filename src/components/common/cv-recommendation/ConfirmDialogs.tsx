import {
	AlertTriangle,
	FileText,
	RefreshCcw,
	Trash2,
	Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface ReplaceCvDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUploadNew: () => void;
	onPickResume: () => void;
}

export function ReplaceCvDialog({
	open,
	onOpenChange,
	onUploadNew,
	onPickResume,
}: ReplaceCvDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<RefreshCcw className="h-5 w-5 text-amber-500" />
						Thay CV gợi ý?
					</DialogTitle>
					<DialogDescription>
						CV hiện tại sẽ bị ghi đè và phải phân tích lại bằng AI (mất 5-30
						giây).
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => {
							onOpenChange(false);
						}}
						className="cursor-pointer"
					>
						Hủy
					</Button>
					<Button onClick={onUploadNew} className="cursor-pointer">
						<Upload className="mr-2 h-4 w-4" />
						Upload mới
					</Button>
					<Button
						variant="outline"
						onClick={onPickResume}
						className="cursor-pointer"
					>
						<FileText className="mr-2 h-4 w-4" />
						Chọn từ CV đã rải
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

interface DeleteCvDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isDeleting: boolean;
}

export function DeleteCvDialog({
	open,
	onOpenChange,
	onConfirm,
	isDeleting,
}: DeleteCvDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="h-5 w-5" />
						Xóa CV gợi ý?
					</DialogTitle>
					<DialogDescription>
						Bạn sẽ không còn được gợi ý việc làm dựa trên CV. Có thể thiết lập
						lại bất cứ lúc nào.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => {
							onOpenChange(false);
						}}
						className="cursor-pointer"
					>
						Hủy
					</Button>
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={isDeleting}
						className="cursor-pointer"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						{isDeleting ? "Đang xóa..." : "Xóa CV"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
