import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, RefreshCcw, Sparkles, UserCog } from "lucide-react";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuthStore } from "@/stores/auth.store";
import { useProfileJobRecommendations } from "@/hooks/useJobRecommendations";
import { RecommendedJobCard } from "@/components/common/RecommendedJobCard";
import type { ProfileRecommendedJob } from "@/types/job-recommendation";
import type { RecommendedJobItem } from "@/types/cv-recommendation";

const HOME_LIMIT = 4;
const SKELETON_KEYS = [
	"profile-rec-sk-1",
	"profile-rec-sk-2",
	"profile-rec-sk-3",
	"profile-rec-sk-4",
];

/**
 * Map the profile recommendation response into the shape that
 * `RecommendedJobCard` expects, so we can reuse the existing card.
 */
function toCardItem(rec: ProfileRecommendedJob): RecommendedJobItem {
	const { recommendation, ...job } = rec;
	return {
		job,
		score: recommendation.finalScore,
		matchedSkills: recommendation.matchedSkills,
		breakdown: {
			skillScore: recommendation.skillScore,
			levelScore: 0,
			locationScore: 0,
		},
	};
}

interface ErrorBannerProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	ctaLabel: string;
	onCta: () => void;
}

function ProfileRecBanner({
	icon,
	title,
	description,
	ctaLabel,
	onCta,
}: ErrorBannerProps) {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
			<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-4">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-blue-600">
						{icon}
					</div>
					<div className="space-y-1">
						<h2 className="text-base font-semibold text-slate-900 sm:text-lg">
							{title}
						</h2>
						<p className="max-w-2xl text-sm leading-6 text-slate-600">
							{description}
						</p>
					</div>
				</div>
				<Button
					onClick={onCta}
					className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
				>
					{ctaLabel}
				</Button>
			</div>
		</div>
	);
}

export function ProfileRecommendedJobs() {
	const navigate = useNavigate();
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

	const { data, isLoading, isFetching, refetch, error } =
		useProfileJobRecommendations(HOME_LIMIT, isAuthenticated);

	// Guests: hide entirely.
	if (!isAuthenticated) return null;

	const sectionWrap = "px-4 py-8";
	const inner = "mx-auto max-w-7xl";

	// Header rendered above any state so the section identity is stable.
	const header = (
		<div className="mb-5 flex flex-wrap items-end justify-between gap-3">
			<div className="min-w-0">
				<h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
					Việc làm gợi ý cho bạn
					<span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
						<Sparkles className="h-3 w-3" />
						AI
					</span>
				</h2>
				<p className="mt-1 max-w-2xl text-sm text-slate-500">
					Hệ thống AI của chúng tôi gợi ý việc làm phù hợp dựa trên hồ sơ của
					bạn
				</p>
			</div>

			{data && data.items.length > 0 && (
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={isFetching}
						onClick={() => {
							void refetch();
						}}
						className="cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
					>
						<RefreshCcw
							className={`mr-1.5 h-3.5 w-3.5 ${
								isFetching ? "animate-spin" : ""
							}`}
						/>
						Làm mới
					</Button>
					<Link to="/jobs">
						<Button
							size="sm"
							className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
						>
							Xem thêm
							<ArrowRight className="ml-1.5 h-3.5 w-3.5" />
						</Button>
					</Link>
				</div>
			)}
		</div>
	);

	// Loading state.
	if (isLoading) {
		return (
			<section className={sectionWrap}>
				<div className={inner}>
					{header}
					<div className="grid gap-4 sm:grid-cols-2">
						{SKELETON_KEYS.map((key) => (
							<Skeleton key={key} className="h-36 rounded-lg" />
						))}
					</div>
				</div>
			</section>
		);
	}

	// Error states: profile missing (404) or incomplete (400).
	if (error) {
		const axiosErr = error as AxiosError<{ message?: string }>;
		const status = axiosErr.response?.status;

		if (status === 404) {
			return (
				<section className={sectionWrap}>
					<div className={inner}>
						{header}
						<ProfileRecBanner
							icon={<UserCog className="h-5 w-5" />}
							title="Tạo hồ sơ để nhận gợi ý cá nhân hóa"
							description="Cập nhật kỹ năng, kinh nghiệm và mục tiêu nghề nghiệp. AI sẽ phân tích hồ sơ và tự động khớp với các vị trí phù hợp nhất."
							ctaLabel="Tạo hồ sơ ngay"
							onCta={() => navigate("/account/cv-builder")}
						/>
					</div>
				</section>
			);
		}

		if (status === 400) {
			return (
				<section className={sectionWrap}>
					<div className={inner}>
						{header}
						<ProfileRecBanner
							icon={<UserCog className="h-5 w-5" />}
							title="Hồ sơ của bạn còn thiếu thông tin"
							description="Hãy bổ sung kỹ năng, kinh nghiệm và học vấn để hệ thống AI gợi ý chính xác hơn."
							ctaLabel="Hoàn thiện hồ sơ"
							onCta={() => navigate("/account/cv-builder")}
						/>
					</div>
				</section>
			);
		}

		// Unknown error — render nothing rather than a noisy fallback.
		return null;
	}

	const items = data?.items ?? [];

	return (
		<section className={sectionWrap}>
			<div className={inner}>
				{header}

				{items.length === 0 ? (
					<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 py-12 text-center">
						<Sparkles className="h-10 w-10 text-slate-300" />
						<p className="text-sm text-slate-500">
							Hiện chưa có việc làm nào phù hợp với hồ sơ của bạn.
						</p>
						<Button
							variant="outline"
							onClick={() => navigate("/account/cv-builder")}
							className="cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-50"
						>
							Cập nhật hồ sơ
						</Button>
					</div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2">
						{items.map((rec) => (
							<RecommendedJobCard key={rec._id} item={toCardItem(rec)} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
