import { Link } from "react-router-dom";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
	ArrowRight,
	Brain,
	RefreshCcw,
	Sparkles,
	UserPlus,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import {
	useRecommendationCv,
	useRecommendedJobs,
} from "@/hooks/useCvRecommendation";
import { RecommendedJobCard } from "@/components/common/RecommendedJobCard";
import { ManageAccountModal } from "@/components/common/ManageAccountModal";

const HOME_LIMIT = 4;

export function RecommendedJobs() {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const { data: cvData, isLoading: cvLoading } = useRecommendationCv();
	const hasCv = !!cvData?.recommendationCv;

	const {
		data: recData,
		isLoading: recLoading,
		isFetching,
		refetch,
	} = useRecommendedJobs(HOME_LIMIT, isAuthenticated && hasCv);

	const [manageOpen, setManageOpen] = useState(false);

	// Hide entirely for guests
	if (!isAuthenticated) return null;

	// Whilst checking CV state, show subtle skeleton
	if (cvLoading) {
		return (
			<section className="px-4 py-12 sm:py-16">
				<div className="mx-auto max-w-7xl">
					<Skeleton className="h-48 rounded-2xl" />
				</div>
			</section>
		);
	}

	// No CV yet → CTA banner
	if (!hasCv) {
		return (
			<>
				<section className="px-4 py-12 sm:py-16">
					<div className="mx-auto max-w-7xl">
						<div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50/60 p-6 shadow-sm sm:p-8">
							<div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-fuchsia-200/40 blur-3xl" />
							<div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-violet-200/40 blur-3xl" />
							<div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-start gap-4">
									<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md">
										<Brain className="h-6 w-6" />
									</div>
									<div className="space-y-1">
										<h2 className="font-heading text-lg font-bold text-violet-950 sm:text-xl">
											Nhận gợi ý việc làm dành riêng cho bạn
										</h2>
										<p className="max-w-2xl text-sm leading-6 text-violet-900/80">
											Thiết lập CV để AI phân tích kỹ năng và tự động khớp với
											các vị trí phù hợp nhất từ hàng nghìn tin tuyển dụng.
										</p>
									</div>
								</div>
								<Button
									onClick={() => {
										setManageOpen(true);
									}}
									className="cursor-pointer bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md transition-opacity duration-150 hover:opacity-90"
								>
									<UserPlus className="mr-2 h-4 w-4" />
									Thiết lập ngay
								</Button>
							</div>
						</div>
					</div>
				</section>
				<ManageAccountModal open={manageOpen} onOpenChange={setManageOpen} />
			</>
		);
	}

	const recs = recData?.recommendations ?? [];

	return (
		<section className="px-4 py-12 sm:py-16">
			<div className="mx-auto max-w-7xl">
				{/* Header */}
				<div className="mb-6 flex flex-wrap items-end justify-between gap-3">
					<div className="flex items-start gap-3">
						<div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm sm:flex">
							<Sparkles className="h-5 w-5" />
						</div>
						<div>
							<h2 className="flex items-center gap-2 font-heading text-2xl font-bold text-foreground">
								Gợi ý dành cho bạn
								<span className="rounded-md bg-gradient-to-r from-violet-100 to-fuchsia-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
									AI
								</span>
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Việc làm phù hợp nhất với CV của bạn, chọn lọc bằng AI
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={isFetching}
							onClick={() => {
								void refetch();
							}}
							className="cursor-pointer transition-colors duration-150"
						>
							<RefreshCcw
								className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
							/>
							Làm mới
						</Button>
						<Link to="/jobs/recommended">
							<Button
								size="sm"
								className="cursor-pointer bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white transition-opacity duration-150 hover:opacity-90"
							>
								Xem tất cả
								<ArrowRight className="ml-1.5 h-3.5 w-3.5" />
							</Button>
						</Link>
					</div>
				</div>

				{/* Body */}
				{recLoading ? (
					<div className="grid gap-4 sm:grid-cols-2">
						{Array.from({ length: HOME_LIMIT }).map((_, i) => (
							<Skeleton key={`rec-sk-${i}`} className="h-36 rounded-xl" />
						))}
					</div>
				) : recs.length === 0 ? (
					<div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 py-12 text-center">
						<Sparkles className="h-10 w-10 text-muted-foreground/40" />
						<p className="text-sm text-muted-foreground">
							Chưa có việc làm nào phù hợp với CV của bạn.
						</p>
						<Button
							variant="outline"
							onClick={() => {
								setManageOpen(true);
							}}
							className="cursor-pointer"
						>
							Cập nhật CV
						</Button>
					</div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2">
						{recs.map((item) => (
							<RecommendedJobCard key={item.job._id} item={item} />
						))}
					</div>
				)}
			</div>
			<ManageAccountModal open={manageOpen} onOpenChange={setManageOpen} />
		</section>
	);
}
