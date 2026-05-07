import { FileText, Sparkles, Upload } from "lucide-react";

interface EmptyStateProps {
	onUpload: () => void;
	onSelect: () => void;
}

export function EmptyState({ onUpload, onSelect }: EmptyStateProps) {
	return (
		<div className="space-y-4">
			<div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
				<div className="flex items-start gap-4">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
						<Sparkles className="h-6 w-6" />
					</div>
					<div className="space-y-1.5">
						<h3 className="font-heading text-base font-semibold text-slate-900">
							Thiết lập CV để nhận gợi ý việc làm
						</h3>
						<p className="text-sm leading-6 text-slate-600">
							AI sẽ phân tích CV của bạn và tự động khớp với các việc làm phù
							hợp nhất dựa trên kỹ năng, cấp độ và địa điểm mong muốn.
						</p>
					</div>
				</div>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				<button
					type="button"
					onClick={onUpload}
					className="group flex cursor-pointer flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 text-left transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
				>
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-transform duration-200 group-hover:scale-110">
						<Upload className="h-5 w-5" />
					</div>
					<div className="space-y-1">
						<p className="font-heading text-sm font-semibold text-foreground">
							Upload CV mới
						</p>
						<p className="text-xs leading-5 text-muted-foreground">
							Tải lên file PDF từ máy tính của bạn
						</p>
					</div>
				</button>

				<button
					type="button"
					onClick={onSelect}
					className="group flex cursor-pointer flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 text-left transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
				>
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-transform duration-200 group-hover:scale-110">
						<FileText className="h-5 w-5" />
					</div>
					<div className="space-y-1">
						<p className="font-heading text-sm font-semibold text-foreground">
							Chọn từ CV đã rải
						</p>
						<p className="text-xs leading-5 text-muted-foreground">
							Sử dụng lại CV bạn đã từng ứng tuyển
						</p>
					</div>
				</button>
			</div>
		</div>
	);
}
