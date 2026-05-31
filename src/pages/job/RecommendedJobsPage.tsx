import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowLeft,
  Brain,
  Filter,
  RefreshCcw,
  Settings2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuthStore } from "@/stores/auth.store";
import {
  useRecommendationCv,
  useRecommendedJobs,
} from "@/hooks/useCvRecommendation";
import { RecommendedJobCard } from "@/components/common/job-card/RecommendedJobCard";
import { extractOriginalFileName } from "@/lib/format";

const RECOMMEND_LIMIT = 20;

export function RecommendedJobsPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const { data: cvData, isLoading: cvLoading } = useRecommendationCv();
  const hasCv = !!cvData?.recommendationCv;

  const [minScore, setMinScore] = useState<string>("0");

  const { data, isLoading, isFetching, refetch, dataUpdatedAt, error } =
    useRecommendedJobs(RECOMMEND_LIMIT, isAuthenticated && hasCv);

  // Auto-refetch when tab regains focus (catch newly posted jobs)
  useEffect(() => {
    const onFocus = () => {
      if (hasCv) void refetch();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [hasCv, refetch]);

  const allRecs = data?.recommendations ?? [];
  const filtered = useMemo(() => {
    const min = Number(minScore);
    return min > 0 ? allRecs.filter((r) => r.score * 100 >= min) : allRecs;
  }, [allRecs, minScore]);

  // ── Auth gate ────────────────────────────────────────────
  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="px-4 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Brain className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-semibold text-ink">
            Đăng nhập để xem việc gợi ý
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Bạn cần đăng nhập và thiết lập CV để nhận gợi ý cá nhân hóa.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                navigate("/");
              }}
              className="cursor-pointer"
            >
              Về trang chủ
            </Button>
            <Button
              onClick={() => {
                navigate("/login");
              }}
              className="cursor-pointer bg-teal-600 text-white hover:bg-teal-700"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb / back */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Trang chủ
          </Link>
        </div>

        {/* Hero header */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-teal-200 bg-teal-50 p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-ink">
                  Việc làm gợi ý cho bạn
                  <Badge className="bg-teal-100 font-semibold text-teal-700">
                    AI
                  </Badge>
                </h1>
                {cvData?.recommendationCv ? (
                  <p className="text-sm text-slate-600">
                    Dựa trên CV{" "}
                    <span className="font-display font-semibold text-ink">
                      {extractOriginalFileName(
                        cvData.recommendationCv.resumeUrl,
                      )}
                    </span>
                    {dataUpdatedAt > 0 && (
                      <>
                        {" · cập nhật "}
                        {formatDistanceToNow(new Date(dataUpdatedAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-slate-600">
                    Bạn chưa thiết lập CV để nhận gợi ý.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isFetching || !hasCv}
                onClick={() => {
                  void refetch();
                }}
                className="cursor-pointer"
              >
                <RefreshCcw
                  className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigate("/account/recommendation");
                }}
                className="cursor-pointer border-teal-200 bg-white text-teal-700 hover:bg-teal-50 hover:text-teal-700"
              >
                <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                {hasCv ? "Đổi CV" : "Thiết lập CV"}
              </Button>
            </div>
          </div>
        </div>

        {/* Empty CV state */}
        {!cvLoading && !hasCv && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <Brain className="h-7 w-7" />
            </div>
            <h3 className="font-display text-base font-semibold text-ink">
              Chưa có CV để phân tích
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Hãy thiết lập CV gợi ý — AI sẽ trích xuất kỹ năng và đề xuất các
              việc làm phù hợp nhất với bạn.
            </p>
            <Button
              onClick={() => {
                navigate("/account/recommendation");
              }}
              className="mt-5 cursor-pointer bg-teal-600 text-white transition-colors duration-150 hover:bg-teal-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Thiết lập CV ngay
            </Button>
          </div>
        )}

        {/* Job list */}
        {hasCv && (
          <>
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? "Đang tải..."
                  : error
                    ? "Không tải được danh sách"
                    : `Tìm thấy ${filtered.length} / ${allRecs.length} việc làm phù hợp`}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Mức tối thiểu
                  </span>
                  <Select value={minScore} onValueChange={setMinScore}>
                    <SelectTrigger className="h-8 w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Tất cả</SelectItem>
                      <SelectItem value="40">≥ 40%</SelectItem>
                      <SelectItem value="60">≥ 60%</SelectItem>
                      <SelectItem value="80">≥ 80%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={`rl-sk-${i}`} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 py-12 text-center">
                <p className="text-sm text-destructive">
                  Không tải được danh sách gợi ý. Vui lòng thử lại.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    void refetch();
                  }}
                  className="cursor-pointer"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Thử lại
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 py-16 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground/40" />
                <div>
                  <p className="font-display text-sm font-semibold text-ink">
                    {allRecs.length === 0
                      ? "Chưa có việc làm nào phù hợp với CV của bạn"
                      : "Không có việc nào đạt mức tối thiểu này"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Thử cập nhật CV với nhiều kỹ năng hơn, hoặc giảm mức lọc.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate("/account/recommendation");
                    }}
                    className="cursor-pointer"
                  >
                    Cập nhật CV
                  </Button>
                  <Link to="/jobs">
                    <Button variant="outline" className="cursor-pointer">
                      Xem tất cả việc làm
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filtered.map((item) => (
                  <RecommendedJobCard key={item.job._id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
