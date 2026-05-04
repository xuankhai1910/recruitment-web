import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useJobs } from "@/hooks/useJobs";
import { JobCard } from "@/components/common/JobCard";
import { LocationMultiSelect } from "@/components/common/LocationMultiSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
	Briefcase,
	ChevronLeft,
	ChevronRight,
	Filter,
	Search,
	X,
} from "lucide-react";
import { SKILLS_LIST, LEVEL_LIST, SALARY_RANGES } from "@/lib/constants";

const PAGE_SIZE = 10;
const SORT_OPTIONS = [
	{ value: "-createdAt", label: "Mới nhất" },
	{ value: "-salary", label: "Lương cao → thấp" },
	{ value: "salary", label: "Lương thấp → cao" },
];

function FilterPanel({
	keyword,
	setKeyword,
	locations,
	setLocations,
	skills,
	toggleSkill,
	level,
	setLevel,
	salaryKey,
	setSalaryKey,
	onReset,
	onApply,
}: {
	keyword: string;
	setKeyword: (v: string) => void;
	locations: string[];
	setLocations: (v: string[]) => void;
	skills: string[];
	toggleSkill: (s: string) => void;
	level: string;
	setLevel: (v: string) => void;
	salaryKey: string;
	setSalaryKey: (v: string) => void;
	onReset: () => void;
	onApply: () => void;
}) {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onApply();
			}}
			className="space-y-5"
		>
			<div>
				<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Từ khóa
				</label>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Tên công việc, kỹ năng..."
						value={keyword}
						onChange={(e) => {
							setKeyword(e.target.value);
						}}
						className="pl-9"
					/>
				</div>
			</div>

			<div>
				<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Địa điểm
				</label>
				<LocationMultiSelect value={locations} onChange={setLocations} />
			</div>

			<div>
				<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Cấp bậc
				</label>
				<Select
					value={level || "ALL"}
					onValueChange={(v) => {
						setLevel(v === "ALL" ? "" : v);
					}}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Tất cả" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">Tất cả</SelectItem>
						{LEVEL_LIST.map((l) => (
							<SelectItem key={l} value={l}>
								{l}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div>
				<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Mức lương
				</label>
				<Select value={salaryKey} onValueChange={setSalaryKey}>
					<SelectTrigger className="w-full">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{SALARY_RANGES.map((r) => (
							<SelectItem key={r.key} value={r.key}>
								{r.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div>
				<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Kỹ năng
				</label>
				<div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-border p-2">
					{SKILLS_LIST.map((s) => {
						const checked = skills.includes(s);
						return (
							<label
								key={s}
								className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-accent"
							>
								<Checkbox
									checked={checked}
									onCheckedChange={() => {
										toggleSkill(s);
									}}
									className="cursor-pointer"
								/>
								<span
									className={
										checked
											? "font-medium text-foreground"
											: "text-foreground/80"
									}
								>
									{s}
								</span>
							</label>
						);
					})}
				</div>
			</div>

			<div className="flex gap-2 pt-2">
				<Button
					type="button"
					variant="outline"
					onClick={onReset}
					className="flex-1 cursor-pointer transition-colors duration-150"
				>
					<X className="mr-1 h-4 w-4" />
					Xóa bộ lọc
				</Button>
				<Button
					type="submit"
					className="flex-1 cursor-pointer bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
				>
					<Search className="mr-1 h-4 w-4" />
					Áp dụng
				</Button>
			</div>
		</form>
	);
}

export function JobsPage() {
	const [searchParams, setSearchParams] = useSearchParams();

	const page = Number(searchParams.get("current") || "1");
	const sort = searchParams.get("sort") || "-createdAt";
	const keywordParam = searchParams.get("keyword") || "";
	const locationParam = searchParams.get("location") || "";
	const levelParam = searchParams.get("level") || "";
	const skillsParam = searchParams.get("skills") || "";
	const salaryParam = searchParams.get("salary") || "all";

	// Local draft state (applied when user hits Search/Apply on mobile)
	const [keyword, setKeyword] = useState(keywordParam);
	const [locations, setLocations] = useState<string[]>(
		locationParam ? locationParam.split(",") : [],
	);
	const [level, setLevel] = useState(levelParam);
	const [skills, setSkills] = useState<string[]>(
		skillsParam ? skillsParam.split(",") : [],
	);
	const [salaryKey, setSalaryKey] = useState(salaryParam);
	const [mobileOpen, setMobileOpen] = useState(false);

	const queryParams = useMemo(() => {
		const p: Record<string, unknown> = {
			current: page,
			pageSize: PAGE_SIZE,
			sort,
			isActive: true,
		};
		if (keywordParam) p.name = `/${keywordParam}/i`;
		if (locationParam) p.location = `/${locationParam.split(",").join("|")}/i`;
		if (levelParam) p.level = levelParam;
		if (skillsParam) p.skills = `/${skillsParam.split(",").join("|")}/i`;
		const range = SALARY_RANGES.find((r) => r.key === salaryParam);
		if (range?.min !== undefined) p["salary[$gte]"] = range.min;
		if (range?.max !== undefined) p["salary[$lte]"] = range.max;
		return p;
	}, [
		page,
		sort,
		keywordParam,
		locationParam,
		levelParam,
		skillsParam,
		salaryParam,
	]);

	const { data, isLoading } = useJobs(queryParams);
	const meta = data?.meta;
	const jobs = data?.result ?? [];

	const toggleSkill = (s: string) => {
		setSkills((prev) =>
			prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
		);
	};

	const applyFilters = () => {
		const p = new URLSearchParams();
		if (keyword) p.set("keyword", keyword);
		if (locations.length > 0) p.set("location", locations.join(","));
		if (level) p.set("level", level);
		if (skills.length > 0) p.set("skills", skills.join(","));
		if (salaryKey && salaryKey !== "all") p.set("salary", salaryKey);
		p.set("sort", sort);
		p.set("current", "1");
		setSearchParams(p);
		setMobileOpen(false);
	};

	const resetFilters = () => {
		setKeyword("");
		setLocations([]);
		setLevel("");
		setSkills([]);
		setSalaryKey("all");
		setSearchParams(new URLSearchParams());
	};

	const changePage = (next: number) => {
		const p = new URLSearchParams(searchParams);
		p.set("current", String(next));
		setSearchParams(p);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const changeSort = (v: string) => {
		const p = new URLSearchParams(searchParams);
		p.set("sort", v);
		p.set("current", "1");
		setSearchParams(p);
	};

	const activeFilterCount =
		(keywordParam ? 1 : 0) +
		(locationParam ? 1 : 0) +
		(levelParam ? 1 : 0) +
		(skillsParam ? skillsParam.split(",").length : 0) +
		(salaryParam !== "all" ? 1 : 0);

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			{/* Page header */}
			<div className="mb-6">
				<h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
					Tìm việc làm
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{meta ? `${meta.total} công việc đang tuyển` : "Đang tải..."}
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-[260px_1fr]">
				{/* Desktop sidebar */}
				<aside className="hidden lg:block">
					<div className="sticky top-16 rounded-lg border border-border bg-card p-4">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="font-heading text-sm font-semibold text-foreground">
								Bộ lọc
							</h2>
							{activeFilterCount > 0 && (
								<Badge variant="secondary" className="font-normal">
									{activeFilterCount}
								</Badge>
							)}
						</div>
						<FilterPanel
							keyword={keyword}
							setKeyword={setKeyword}
							locations={locations}
							setLocations={setLocations}
							skills={skills}
							toggleSkill={toggleSkill}
							level={level}
							setLevel={setLevel}
							salaryKey={salaryKey}
							setSalaryKey={setSalaryKey}
							onReset={resetFilters}
							onApply={applyFilters}
						/>
					</div>
				</aside>

				{/* Results */}
				<div>
					{/* Toolbar */}
					<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
						<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
							<SheetTrigger asChild>
								<Button variant="outline" className="cursor-pointer lg:hidden">
									<Filter className="mr-1.5 h-4 w-4" />
									Bộ lọc
									{activeFilterCount > 0 && (
										<Badge
											variant="secondary"
											className="ml-1.5 h-5 px-1.5 text-xs"
										>
											{activeFilterCount}
										</Badge>
									)}
								</Button>
							</SheetTrigger>
							<SheetContent
								side="left"
								className="w-80 overflow-y-auto p-5 sm:w-96"
							>
								<h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
									Bộ lọc
								</h2>
								<FilterPanel
									keyword={keyword}
									setKeyword={setKeyword}
									locations={locations}
									setLocations={setLocations}
									skills={skills}
									toggleSkill={toggleSkill}
									level={level}
									setLevel={setLevel}
									salaryKey={salaryKey}
									setSalaryKey={setSalaryKey}
									onReset={resetFilters}
									onApply={applyFilters}
								/>
							</SheetContent>
						</Sheet>

						<div className="ml-auto flex items-center gap-2">
							<span className="text-sm text-muted-foreground">Sắp xếp:</span>
							<Select value={sort} onValueChange={changeSort}>
								<SelectTrigger className="w-44">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{SORT_OPTIONS.map((o) => (
										<SelectItem key={o.value} value={o.value}>
											{o.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* List */}
					{isLoading ? (
						<div className="space-y-3">
							{Array.from({ length: 6 }).map((_, i) => (
								<Skeleton key={i} className="h-24 rounded-lg" />
							))}
						</div>
					) : jobs.length === 0 ? (
						<div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card py-20">
							<Briefcase className="h-12 w-12 text-muted-foreground/40" />
							<div className="text-center">
								<p className="font-heading font-semibold text-foreground">
									Không tìm thấy việc làm phù hợp
								</p>
								<p className="mt-1 text-sm text-muted-foreground">
									Thử điều chỉnh bộ lọc hoặc từ khóa khác
								</p>
							</div>
							<Button
								variant="outline"
								onClick={resetFilters}
								className="mt-2 cursor-pointer"
							>
								Xóa bộ lọc
							</Button>
						</div>
					) : (
						<div className="flex flex-col gap-3">
							{jobs.map((job) => (
								<JobCard key={job._id} job={job} />
							))}
						</div>
					)}

					{/* Pagination */}
					{meta && meta.pages > 1 && (
						<div className="mt-6 flex items-center justify-center gap-2">
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
			</div>
		</div>
	);
}
