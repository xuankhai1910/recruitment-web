import { Brain, Loader2 } from "lucide-react";

export function AnalyzingState() {
	return (
		<div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50/50 px-6 py-16 text-center">
			<div className="relative">
				<div className="absolute inset-0 animate-ping rounded-full bg-violet-400/40" />
				<div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg">
					<Brain className="h-8 w-8" />
				</div>
			</div>
			<div className="space-y-1">
				<p className="font-heading text-base font-semibold text-violet-950">
					AI đang phân tích CV của bạn
				</p>
				<p className="max-w-sm text-sm leading-6 text-violet-900/80">
					Hệ thống đang trích xuất kỹ năng, cấp độ, kinh nghiệm... Quá trình này
					có thể mất từ 5-30 giây, vui lòng không đóng cửa sổ.
				</p>
			</div>
			<div className="flex items-center gap-2 text-xs font-medium text-violet-700">
				<Loader2 className="h-3.5 w-3.5 animate-spin" />
				Đang xử lý...
			</div>
		</div>
	);
}
