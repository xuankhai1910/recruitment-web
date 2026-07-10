import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTopCompanies } from "@/hooks/useCompanies";
import { CompanyCard } from "@/components/common/CompanyCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ArrowRight,
	Building2,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;
const SKELETON_KEYS = ["c1", "c2", "c3", "c4", "c5", "c6"];
const SCROLL_AMOUNT = 320;

export function TopCompanies() {
	const navigate = useNavigate();
	const { data, isLoading } = useTopCompanies(PAGE_SIZE);

	const scrollerRef = useRef<HTMLDivElement>(null);
	const companies = data ?? [];

	const scrollBy = (direction: 1 | -1) => {
		scrollerRef.current?.scrollBy({
			left: direction * SCROLL_AMOUNT,
			behavior: "smooth",
		});
	};

	return (
		<section className="pb-14">
			<div className={cn(ui.wrap, "mb-8 flex flex-wrap items-end justify-between gap-6")}>
				<div>
					<div className={cn(ui.eyebrow, "mb-3")}>Nhà tuyển dụng</div>
					<h2 className={ui.h2}>Công ty hàng đầu</h2>
					<p className={ui.sub}>Các nhà tuyển dụng uy tín đang tìm kiếm nhân tài.</p>
				</div>
				{companies.length > 0 && (
					<div className="flex items-center gap-2">
						<button className={ui.iconBtn} aria-label="Cuộn trái" onClick={() => scrollBy(-1)}>
							<ChevronLeft className="h-4 w-4" />
						</button>
						<button className={ui.iconBtn} aria-label="Cuộn phải" onClick={() => scrollBy(1)}>
							<ChevronRight className="h-4 w-4" />
						</button>
						<button className={ui.btnOutline} onClick={() => navigate("/companies")}>
							Xem tất cả
							<ArrowRight className="h-4 w-4" />
						</button>
					</div>
				)}
			</div>

			<div className={ui.wrap}>
				{isLoading ? (
					<div className="flex gap-4 overflow-hidden pb-3">
						{SKELETON_KEYS.map((k) => (
							<Skeleton key={k} className="h-40 w-[280px] shrink-0 rounded-xl" />
						))}
					</div>
				) : companies.length === 0 ? (
					<div className={ui.empty}>
						<div className={ui.emptyIcon}>
							<Building2 className="h-7 w-7" />
						</div>
						<h3 className="mb-2 text-xl font-semibold text-ink">Chưa có công ty nào</h3>
						<p className="max-w-[380px] text-sm text-slate-600">
							Hãy quay lại sau để khám phá các nhà tuyển dụng mới.
						</p>
					</div>
				) : (
					<div
						ref={scrollerRef}
						className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]"
					>
						{companies.map((c) => (
							<CompanyCard
								key={c._id}
								company={c}
								openings={c.jobCount}
								variant="carousel"
							/>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
