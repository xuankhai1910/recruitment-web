import { useNavigate } from "react-router-dom";
import { ArrowRight, RefreshCcw, Sparkles, UserCog } from "lucide-react";
import { AxiosError } from "axios";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth.store";
import { useProfileJobRecommendations } from "@/hooks/useJobRecommendations";
import { RecommendedJobCard } from "@/components/common/job-card/RecommendedJobCard";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";
import type { ProfileRecommendedJob } from "@/types/job-recommendation";
import type { RecommendedJobItem } from "@/types/cv-recommendation";

const HOME_LIMIT = 4;
const SKELETON_KEYS = ["p-1", "p-2", "p-3", "p-4"];

function toCardItem(rec: ProfileRecommendedJob): RecommendedJobItem {
  const { recommendation, ...job } = rec;
  return {
    job,
    score: recommendation.finalScore,
    matchedSkills: recommendation.matchedSkills,
    breakdown: recommendation.breakdown,
  };
}

function Banner({
  title,
  description,
  ctaLabel,
  onCta,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  onCta: () => void;
}) {
  return (
    <div className={ui.card}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-700">
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold tracking-tight text-ink">
              {title}
            </h3>
            <p className="mt-1 max-w-xl text-[13px] text-slate-600">
              {description}
            </p>
          </div>
        </div>
        <button className={ui.btnAccent} onClick={onCta}>
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

export function ProfileRecommendedJobs() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data, isLoading, isFetching, refetch, error } =
    useProfileJobRecommendations(HOME_LIMIT, isAuthenticated);

  if (!isAuthenticated) return null;

  const header = (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
      <div>
        <div className={cn(ui.eyebrow, "mb-3")}>
          <Sparkles className="h-3 w-3 text-teal-500" />
          Gợi ý bằng AI
          <span className="font-medium text-slate-400">· 01</span>
        </div>
        <h2 className={ui.h2}>Việc làm gợi ý cho bạn</h2>
        <p className={ui.sub}>
          Hệ thống AI gợi ý việc làm phù hợp dựa trên hồ sơ kỹ năng và kinh
          nghiệm của bạn.
        </p>
      </div>
      {data && data.items.length > 0 && (
        <div className="flex items-center gap-2">
          <button
            className={ui.btnOutline}
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            <RefreshCcw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
            Làm mới
          </button>
          <button className={ui.btnPrimary} onClick={() => navigate("/jobs")}>
            Xem thêm
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );

  let body: React.ReactNode;
  if (isLoading) {
    body = (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SKELETON_KEYS.map((k) => (
          <Skeleton key={k} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  } else if (error) {
    const status = (error as AxiosError<{ message?: string }>).response?.status;
    if (status === 404) {
      body = (
        <Banner
          title="Tạo hồ sơ để nhận gợi ý cá nhân hóa"
          description="Cập nhật kỹ năng, kinh nghiệm và mục tiêu nghề nghiệp. AI sẽ phân tích hồ sơ và tự động khớp với các vị trí phù hợp nhất."
          ctaLabel="Tạo hồ sơ ngay"
          onCta={() => navigate("/account/cv-builder")}
        />
      );
    } else if (status === 400) {
      body = (
        <Banner
          title="Hồ sơ của bạn còn thiếu thông tin"
          description="Hãy bổ sung kỹ năng, kinh nghiệm và học vấn để hệ thống AI gợi ý chính xác hơn."
          ctaLabel="Hoàn thiện hồ sơ"
          onCta={() => navigate("/account/cv-builder")}
        />
      );
    } else {
      return null;
    }
  } else {
    const items = data?.items ?? [];
    if (items.length === 0) {
      body = (
        <div className={ui.empty}>
          <div className={ui.emptyIcon}>
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-ink">
            Chưa có việc làm phù hợp
          </h3>
          <p className="max-w-[380px] text-sm text-slate-600">
            Hiện chưa có việc làm nào phù hợp với hồ sơ của bạn.
          </p>
          <button
            className={cn(ui.btnOutline, "mt-5")}
            onClick={() => navigate("/account/cv-builder")}
          >
            Cập nhật hồ sơ
          </button>
        </div>
      );
    } else {
      body = (
        <div
          className={cn(
            "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
            isFetching && "opacity-60",
          )}
        >
          {items.map((rec) => (
            <RecommendedJobCard
              key={rec._id}
              item={toCardItem(rec)}
              cvSide={data?.cvSummary}
              estimated
              analyzedBy="ai"
            />
          ))}
        </div>
      );
    }
  }

  return (
    <section className={ui.section}>
      <div className={ui.wrap}>
        {header}
        {body}
      </div>
    </section>
  );
}
