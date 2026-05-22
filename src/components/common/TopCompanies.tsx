import { useRef } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyCard } from "@/components/common/CompanyCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 12;
const SKELETON_KEYS = [
	"company-sk-1",
	"company-sk-2",
	"company-sk-3",
	"company-sk-4",
	"company-sk-5",
	"company-sk-6",
];
const SCROLL_AMOUNT = 320;

export function TopCompanies() {
	const { data, isLoading } = useCompanies({
		current: 1,
		pageSize: PAGE_SIZE,
		sort: "-createdAt",
	});

	const scrollerRef = useRef<HTMLDivElement>(null);
	const companies = data?.result ?? [];

	const scrollBy = (direction: 1 | -1) => {
		scrollerRef.current?.scrollBy({
			left: direction * SCROLL_AMOUNT,
			behavior: "smooth",
		});
	};

	return (
		<section className="px-4 py-4 sm:px-6 lg:px-8">
			{/* Section header */}
			<div className="mb-6 flex items-end justify-between">
				<div>
					<h2 className="text-2xl font-bold text-slate-900">
						Công ty hàng đầu
					</h2>
					<p className="mt-1 text-sm text-slate-500">
						Các nhà tuyển dụng uy tín đang tìm kiếm nhân tài
					</p>
				</div>
				{companies.length > 0 && (
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							className="h-9 w-9 cursor-pointer rounded-full transition-colors duration-150"
							aria-label="Cuộn trái"
							onClick={() => scrollBy(-1)}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="h-9 w-9 cursor-pointer rounded-full transition-colors duration-150"
							aria-label="Cuộn phải"
							onClick={() => scrollBy(1)}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				)}
			</div>

			{/* Horizontal scroller */}
			{isLoading ? (
				<div className="flex gap-4 overflow-hidden pb-2">
					{SKELETON_KEYS.map((key) => (
						<Skeleton key={key} className="h-20 w-72 shrink-0 rounded-2xl" />
					))}
				</div>
			) : companies.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-16">
					<Building2 className="h-12 w-12 text-slate-300" />
					<p className="text-slate-500">Chưa có công ty nào</p>
				</div>
			) : (
				<div
					ref={scrollerRef}
					className="flex gap-4 overflow-x-auto pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
				>
					{companies.map((c) => (
						<CompanyCard key={c._id} company={c} />
					))}
				</div>
			)}
		</section>
	);
}
