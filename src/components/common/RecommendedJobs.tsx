import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Brain, Loader2, RefreshCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth.store";
import {
	useRecommendationCv,
	useRecommendedJobs,
} from "@/hooks/useCvRecommendation";
import { RecommendedJobCard } from "@/components/common/RecommendedJobCard";

const HOME_LIMIT = 4;
const SKELETON_KEYS = ["rec-sk-1", "rec-sk-2", "rec-sk-3", "rec-sk-4"];

export function RecommendedJobs() {
	const navigate = useNavigate();
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const { data: cvData, isLoading: cvLoading } = useRecommendationCv();
	const hasCv = !!cvData?.recommendationCv;

	const {
		data: recData,
		isLoading: recLoading,
		isFetching,
		refetch,
	} = useRecommendedJobs(HOME_LIMIT, isAuthenticated && hasCv);

	if (!isAuthenticated) return null;

	if (cvLoading) {
		return (
			<section className="px-4 py-4 sm:px-6 lg:px-8">
				<Skeleton className="h-32 rounded-xl" />
			</section>
		);
	}

	if (!hasCv) {
		return (
			<section className="px-4 py-4 sm:px-6 lg:px-8">
				<div className="mb-5">
					<h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
						Gợi ý dành cho bạn
						<span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
							AI
						</span>
					</h2>
					<p className="mt-1 text-sm text-slate-500">
						Việc làm phù hợp nhất với CV của bạn, chọn lọc bằng AI
					</p>
				</div>
				<div className="rounded-xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
					<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-start gap-4">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white">
								<Brain className="h-5 w-5" />
							</div>
							<div className="space-y-1">
								<h2 className="text-base font-semibold text-slate-900 sm:text-lg">
									Nhận gợi ý việc làm dành riêng cho bạn
								</h2>
								<p className="max-w-2xl text-sm leading-6 text-slate-600">
									Thiết lập CV để AI phân tích kỹ năng và tự động khớp với các
									vị trí phù hợp nhất từ hàng nghìn tin tuyển dụng.
								</p>
							</div>
						</div>
						<Button
							onClick={() => {
								navigate("/account/recommendation");
							}}
							className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
						>
							Thiết lập ngay
						</Button>
					</div>
				</div>
			</section>
		);
	}

	const recs = recData?.recommendations ?? [];

	return (
		<section className="px-4 py-4 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="mb-5 flex flex-wrap items-end justify-between gap-3">
				<div>
					<h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
						Gợi ý dành cho bạn
						<span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
							AI
						</span>
					</h2>
					<p className="mt-1 text-sm text-slate-500">
						Việc làm phù hợp nhất với CV của bạn, chọn lọc bằng AI
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={isFetching}
						onClick={() => {
							void refetch();
						}}
						className="cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
					>
						<RefreshCcw
							className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
						/>
						Làm mới
					</Button>
					<Link to="/jobs/recommended">
						<Button
							size="sm"
							className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
						>
							Xem tất cả
							<ArrowRight className="ml-1.5 h-3.5 w-3.5" />
						</Button>
					</Link>
				</div>
			</div>

			{/* Body */}
			{recLoading ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{SKELETON_KEYS.map((key) => (
						<Skeleton key={key} className="h-36 rounded-xl" />
					))}
				</div>
			) : recs.length === 0 ? (
				<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-blue-200 py-12 text-center">
					<Sparkles className="h-10 w-10 text-blue-200" />
					<p className="text-sm text-slate-500">
						Chưa có việc làm nào phù hợp với CV của bạn.
					</p>
					<Button
						variant="outline"
						onClick={() => {
							navigate("/account/recommendation");
						}}
						className="cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
					>
						Cập nhật CV
					</Button>
				</div>
			) : (
				<div className="relative">
					<div
						className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-opacity ${
							isFetching ? "opacity-60" : ""
						}`}
					>
						{recs.map((item) => (
							<RecommendedJobCard key={item.job._id} item={item} />
						))}
					</div>
					{isFetching && (
						<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
							<div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur">
								<Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
								Đang cập nhật gợi ý...
							</div>
						</div>
					)}
				</div>
			)}
		</section>
	);
}
