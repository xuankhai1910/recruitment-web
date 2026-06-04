import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyCard } from "@/components/common/CompanyCard";
import { JfPager } from "@/components/common/JfPager";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ChevronRight, Search } from "lucide-react";
import { ui } from "@/lib/ui";

const PAGE_SIZE = 12;

export function CompaniesPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const page = Number(searchParams.get("current") || "1");
	const keywordParam = searchParams.get("keyword") || "";
	const [keyword, setKeyword] = useState(keywordParam);

	const queryParams = useMemo(() => {
		const p: Record<string, unknown> = {
			current: page,
			pageSize: PAGE_SIZE,
			sort: "-createdAt",
		};
		if (keywordParam) p.name = `/${keywordParam}/i`;
		return p;
	}, [page, keywordParam]);

	const { data, isLoading } = useCompanies(queryParams);
	const meta = data?.meta;
	const companies = data?.result ?? [];

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const p = new URLSearchParams();
		if (keyword.trim()) p.set("keyword", keyword.trim());
		p.set("current", "1");
		setSearchParams(p);
	};

	const changePage = (next: number) => {
		const p = new URLSearchParams(searchParams);
		p.set("current", String(next));
		setSearchParams(p);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="mx-auto max-w-[1280px] px-7 pb-16 pt-8">
			<div className="mb-5 flex items-center gap-2 text-[13px] text-slate-400">
				<Link to="/" className="text-slate-600 hover:text-ink">
					Trang chủ
				</Link>
				<ChevronRight className="h-3 w-3" />
				<span>Công ty</span>
			</div>

			<div className="mb-6 flex flex-wrap items-end justify-between gap-6">
				<div>
					<h1 className={ui.h1}>Khám phá công ty</h1>
					<p className="mt-3 text-[15px] text-slate-600">
						{meta ? (
							<>
								<b className="font-display font-bold text-ink">{meta.total}</b>{" "}
								công ty đang tuyển dụng trên DevMarket
							</>
						) : (
							"Đang tải..."
						)}
					</p>
				</div>
				<form
					onSubmit={handleSearch}
					className="flex h-11 w-80 items-center gap-2.5 rounded-lg border-[1.5px] border-line bg-white px-3.5 focus-within:border-ink"
				>
					<Search className="h-4 w-4 shrink-0 text-slate-400" />
					<input
						type="text"
						placeholder="Tìm theo tên công ty"
						value={keyword}
						onChange={(e) => setKeyword(e.target.value)}
						className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400"
					/>
				</form>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: PAGE_SIZE }).map((_, i) => (
						<Skeleton key={i} className="h-40 rounded-xl" />
					))}
				</div>
			) : companies.length === 0 ? (
				<div className={ui.empty}>
					<div className={ui.emptyIcon}>
						<Building2 className="h-7 w-7" />
					</div>
					<h3 className="mb-2 text-xl font-semibold text-ink">
						Không tìm thấy công ty nào
					</h3>
					<p className="max-w-[380px] text-sm text-slate-600">
						Thử tìm với từ khóa khác.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{companies.map((c) => (
						<CompanyCard key={c._id} company={c} />
					))}
				</div>
			)}

			<JfPager
				page={page}
				totalPages={meta?.pages ?? 1}
				onChange={changePage}
			/>
		</div>
	);
}
