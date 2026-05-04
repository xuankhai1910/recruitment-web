import { useCompanies } from "@/hooks/useCompanies";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const PAGE_SIZE = 5;

export function TopCompanies() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useCompanies({
		current: page,
		pageSize: PAGE_SIZE,
		sort: "-createdAt",
	});

	const meta = data?.meta;
	const companies = data?.result ?? [];

	return (
		<section className="border-y border-border bg-card px-4 py-12">
			<div className="mx-auto max-w-7xl">
				{/* Section header */}
				<div className="mb-6 flex items-end justify-between">
					<div>
						<h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
							Công ty hàng đầu
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Các nhà tuyển dụng uy tín đang tìm kiếm nhân tài
						</p>
					</div>
					{meta && meta.pages > 1 && (
						<div className="flex items-center gap-1.5">
							<span className="mr-1 text-sm font-medium text-muted-foreground">
								{page}/{meta.pages}
							</span>
							<Button
								variant="outline"
								size="icon"
								className="h-9 w-9 cursor-pointer transition-colors duration-150"
								disabled={page <= 1}
								onClick={() => {
									setPage((p) => p - 1);
								}}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								className="h-9 w-9 cursor-pointer transition-colors duration-150"
								disabled={page >= meta.pages}
								onClick={() => {
									setPage((p) => p + 1);
								}}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>

				{/* Grid */}
				{isLoading ? (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
						{Array.from({ length: PAGE_SIZE }).map((_, i) => (
							<Skeleton key={i} className="h-40 rounded-lg" />
						))}
					</div>
				) : companies.length === 0 ? (
					<div className="flex flex-col items-center gap-3 py-16">
						<Building2 className="h-12 w-12 text-muted-foreground/40" />
						<p className="text-muted-foreground">Chưa có công ty nào</p>
					</div>
				) : (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
						{companies.map((c) => (
							<Link key={c._id} to={`/companies/${c._id}`}>
								<Card className="group h-full cursor-pointer transition-colors duration-150 hover:border-primary/50">
									<CardContent className="flex flex-col items-center p-5 text-center">
										{c.logo ? (
											<img
												src={
													c.logo.startsWith("http")
														? c.logo
														: `${import.meta.env.VITE_STATIC_URL}/images/company/${c.logo}`
												}
												alt={c.name}
												className="mb-3 h-14 w-14 rounded-md border border-border bg-white object-contain p-1"
											/>
										) : (
											<div className="mb-3 flex h-14 w-14 items-center justify-center rounded-md border border-border bg-muted">
												<Building2 className="h-7 w-7 text-muted-foreground" />
											</div>
										)}
										<h3 className="line-clamp-1 font-heading text-sm font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
											{c.name}
										</h3>
										<p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
											<MapPin className="h-3 w-3 shrink-0" />
											<span className="line-clamp-1">{c.address}</span>
										</p>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
