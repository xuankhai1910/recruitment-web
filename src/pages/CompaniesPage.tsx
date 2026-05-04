import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Building2,
	ChevronLeft,
	ChevronRight,
	MapPin,
	Search,
} from "lucide-react";
import { companyLogoUrl } from "@/lib/format";

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
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			{/* Page header */}
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
						Các công ty
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{meta ? `${meta.total} công ty đang tuyển dụng` : "Đang tải..."}
					</p>
				</div>
				<form onSubmit={handleSearch} className="relative w-full sm:w-80">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Tìm công ty..."
						value={keyword}
						onChange={(e) => {
							setKeyword(e.target.value);
						}}
						className="pl-9"
					/>
				</form>
			</div>

			{/* Grid */}
			{isLoading ? (
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{Array.from({ length: PAGE_SIZE }).map((_, i) => (
						<Skeleton key={i} className="h-44 rounded-lg" />
					))}
				</div>
			) : companies.length === 0 ? (
				<div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card py-20">
					<Building2 className="h-12 w-12 text-muted-foreground/40" />
					<p className="font-heading font-semibold text-foreground">
						Không tìm thấy công ty phù hợp
					</p>
				</div>
			) : (
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{companies.map((c) => (
						<Link key={c._id} to={`/companies/${c._id}`}>
							<Card className="group h-full cursor-pointer transition-colors duration-150 hover:border-primary/50">
								<CardContent className="flex flex-col items-center p-5 text-center">
									{c.logo ? (
										<img
											src={companyLogoUrl(c.logo)}
											alt={c.name}
											className="mb-3 h-16 w-16 rounded-md border border-border bg-white object-contain p-1"
										/>
									) : (
										<div className="mb-3 flex h-16 w-16 items-center justify-center rounded-md border border-border bg-muted">
											<Building2 className="h-8 w-8 text-muted-foreground" />
										</div>
									)}
									<h3 className="line-clamp-1 font-heading text-base font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
										{c.name}
									</h3>
									<p className="mt-1.5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
										<MapPin className="h-3 w-3 shrink-0" />
										<span className="line-clamp-1">{c.address}</span>
									</p>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}

			{/* Pagination */}
			{meta && meta.pages > 1 && (
				<div className="mt-8 flex items-center justify-center gap-2">
					<Button
						variant="outline"
						size="icon"
						className="h-9 w-9 cursor-pointer"
						disabled={page <= 1}
						onClick={() => {
							changePage(page - 1);
						}}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<span className="px-3 text-sm font-medium text-foreground">
						Trang {page} / {meta.pages}
					</span>
					<Button
						variant="outline"
						size="icon"
						className="h-9 w-9 cursor-pointer"
						disabled={page >= meta.pages}
						onClick={() => {
							changePage(page + 1);
						}}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
}
