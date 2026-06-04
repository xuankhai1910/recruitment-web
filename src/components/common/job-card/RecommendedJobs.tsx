import { useNavigate } from "react-router-dom";
import { ArrowRight, Brain, RefreshCcw, Sparkles } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth.store";
import {
  useRecommendationCv,
  useRecommendedJobs,
} from "@/hooks/useCvRecommendation";
import { RecommendedJobCard } from "@/components/common/job-card/RecommendedJobCard";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

const HOME_LIMIT = 4;
const SKELETON_KEYS = ["r-1", "r-2", "r-3", "r-4"];

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

  const header = (showActions: boolean) => (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
      <div>
        <div className={cn(ui.eyebrow, "mb-3")}>
          <Sparkles className="h-3 w-3 text-teal-500" />
          Phân tích CV bằng AI
          <span className="font-medium text-slate-400">· 02</span>
        </div>
        <h2 className={ui.h2}>Phù hợp nhất với CV của bạn</h2>
        <p className={ui.sub}>
          Việc làm được chọn lọc bằng AI sau khi phân tích nội dung và kỹ năng
          trong CV bạn đã tải lên.
        </p>
      </div>
      {showActions && (
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
          <button
            className={ui.btnPrimary}
            onClick={() => navigate("/jobs/recommended")}
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );

  if (cvLoading) {
    return (
      <section className={ui.section}>
        <div className={ui.wrap}>
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </section>
    );
  }

  if (!hasCv) {
    return (
      <section className={ui.section}>
        <div className={ui.wrap}>
          {header(false)}
          <div className={ui.card}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink text-teal-400">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold tracking-tight text-ink">
                    Nhận gợi ý việc làm dành riêng cho bạn
                  </h3>
                  <p className="mt-1 max-w-xl text-[13px] text-slate-600">
                    Thiết lập CV để AI phân tích kỹ năng và tự động khớp với các
                    vị trí phù hợp nhất từ hàng nghìn tin tuyển dụng.
                  </p>
                </div>
              </div>
              <button
                className={ui.btnAccent}
                onClick={() => navigate("/account/recommendation")}
              >
                Thiết lập ngay
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const recs = recData?.recommendations ?? [];
  const analysis = recData?.analysis;
  const cvSide = analysis
    ? {
        skills: analysis.extractedData.skills,
        level: analysis.extractedData.level,
        yearsOfExperience: analysis.extractedData.yearsOfExperience,
        desiredJobTitle: analysis.extractedData.desiredJobTitle,
        desiredSpecialization: analysis.extractedData.desiredSpecialization,
        preferredLocations: analysis.extractedData.preferredLocations,
      }
    : undefined;

  return (
    <section className={ui.section}>
      <div className={ui.wrap}>
        {header(true)}
        {recLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SKELETON_KEYS.map((k) => (
              <Skeleton key={k} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : recs.length === 0 ? (
          <div className={ui.empty}>
            <div className={ui.emptyIcon}>
              <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-ink">
              Chưa có việc làm phù hợp
            </h3>
            <p className="max-w-[380px] text-sm text-slate-600">
              Chưa có việc làm nào phù hợp với CV của bạn.
            </p>
            <button
              className={cn(ui.btnOutline, "mt-5")}
              onClick={() => navigate("/account/recommendation")}
            >
              Cập nhật CV
            </button>
          </div>
        ) : (
          <div
            className={cn(
              "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
              isFetching && "opacity-60",
            )}
          >
            {recs.map((item) => (
              <RecommendedJobCard
                key={item.job._id}
                item={item}
                cvSide={cvSide}
                analyzedBy={analysis?.analyzedBy}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
