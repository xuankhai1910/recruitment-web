import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

import { useJob, useJobs } from "@/hooks/useJobs";
import { useCheckSaved, useToggleSaveJob } from "@/hooks/useSavedJobs";
import { useAuthStore } from "@/stores/auth.store";
import { ApplyModal } from "@/components/common/ApplyModal";
import { JobCard } from "@/components/common/JobCard";
import { LocationMultiSelect } from "@/components/common/LocationMultiSelect";
import {
	pushRecentSearch,
	SearchAutocomplete,
} from "@/components/common/SearchAutocomplete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LEVEL_LIST, SALARY_RANGES, formatSalary } from "@/lib/constants";
import { companyLogoUrl } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
	ArrowRight,
	Banknote,
	Bookmark,
	BookmarkCheck,
	Briefcase,
	Building2,
	Calendar,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Clock,
	MapPin,
	Search,
	Send,
	Users,
	X,
} from "lucide-react";

const PAGE_SIZE = 10;
const SORT_OPTIONS = [
	{ value: "-createdAt", label: "Mới nhất" },
	{ value: "-salary", label: "Lương cao - thấp" },
	{ value: "salary", label: "Lương thấp - cao" },
];
const SKELETON_ROWS = ["a", "b", "c", "d", "e", "f"];

function parseMultiParam(value: string) {
	return value ? value.split(",").filter(Boolean) : [];
}

function FilterPill({
	label,
	active,
	children,
}: {
	label: string;
	active: boolean;
	children: React.ReactNode;
}) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className={cn(
						"inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors duration-150",
						active
							? "border-blue-300 bg-blue-50 text-blue-700"
							: "border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-600",
					)}
				>
					{label}
					<ChevronDown className="h-3.5 w-3.5" />
				</button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-72 p-0">
				{children}
			</PopoverContent>
		</Popover>
	);
}

function PreviewSkeleton() {
	return (
		<div className="space-y-5">
			<div className="flex gap-3">
				<Skeleton className="h-12 w-12 rounded-md" />
				<div className="flex-1 space-y-2">
					<Skeleton className="h-5 w-3/4" />
					<Skeleton className="h-4 w-1/3" />
				</div>
			</div>
			<Skeleton className="h-20 rounded-lg" />
			<Skeleton className="h-10 rounded-lg" />
			<Skeleton className="h-64 rounded-lg" />
		</div>
	);
}

export function JobsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	const page = Number(searchParams.get("current") || "1");
	const sort = searchParams.get("sort") || "-createdAt";
	const keywordParam = searchParams.get("keyword") || "";
	const locationParam = searchParams.get("location") || "";
	const levelParam = searchParams.get("level") || "";
	const salaryParam = searchParams.get("salary") || "all";

	const [keywordDraft, setKeywordDraft] = useState({
		source: keywordParam,
		value: keywordParam,
	});
	const [locationDraft, setLocationDraft] = useState({
		source: locationParam,
		value: parseMultiParam(locationParam),
	});
	const [selectedJobId, setSelectedJobId] = useState("");
	const [selectedJobFilterKey, setSelectedJobFilterKey] = useState("");
	const [applyOpen, setApplyOpen] = useState(false);

	const keyword =
		keywordDraft.source === keywordParam ? keywordDraft.value : keywordParam;
	const locations =
		locationDraft.source === locationParam
			? locationDraft.value
			: parseMultiParam(locationParam);

	const setKeyword = (value: string) => {
		setKeywordDraft({ source: keywordParam, value });
	};

	const setLocations = (value: string[]) => {
		setLocationDraft({ source: locationParam, value });
	};

	const selectedLevels = parseMultiParam(levelParam);
	const selectedSalary = SALARY_RANGES.find(
		(range) => range.key === salaryParam,
	);
	const filterResetKey = `${keywordParam}|${locationParam}|${levelParam}|${salaryParam}`;

	const queryParams: Record<string, unknown> = {
		current: page,
		pageSize: PAGE_SIZE,
		sort,
		isActive: true,
	};

	if (keywordParam) queryParams.keyword = keywordParam;
	if (locationParam) {
		queryParams.location = `/${parseMultiParam(locationParam).join("|")}/i`;
	}
	if (levelParam) {
		const levels = parseMultiParam(levelParam);
		queryParams.level =
			levels.length > 1 ? `/${levels.join("|")}/i` : levels[0];
	}

	const range = SALARY_RANGES.find((item) => item.key === salaryParam);
	if (range?.min !== undefined) queryParams["salary[$gte]"] = range.min;
	if (range?.max !== undefined) queryParams["salary[$lte]"] = range.max;

	const { data, isLoading } = useJobs(queryParams);
	const meta = data?.meta;
	const jobs = data?.result ?? [];
	const selectedJobCandidateId =
		selectedJobFilterKey === filterResetKey ? selectedJobId : "";
	const effectiveSelectedJobId =
		selectedJobCandidateId &&
		jobs.some((job) => job._id === selectedJobCandidateId)
			? selectedJobCandidateId
			: (jobs[0]?._id ?? "");
	const { data: selectedJob, isLoading: loadingPreview } = useJob(
		effectiveSelectedJobId,
	);
	const { data: savedCheck } = useCheckSaved(
		isAuthenticated && effectiveSelectedJobId ? effectiveSelectedJobId : "",
	);
	const toggleSave = useToggleSaveJob();
	const saved = savedCheck ?? false;

	const setParams = (updater: (params: URLSearchParams) => void) => {
		const params = new URLSearchParams(searchParams);
		updater(params);
		setSearchParams(params);
	};

	const setMultiParam = (key: "level", value: string) => {
		setParams((params) => {
			const current = parseMultiParam(params.get(key) || "");
			const next = current.includes(value)
				? current.filter((item) => item !== value)
				: [...current, value];

			if (next.length > 0) params.set(key, next.join(","));
			else params.delete(key);
			params.set("current", "1");
		});
	};

	const applySearch = (nextKeyword = keyword) => {
		setParams((params) => {
			const trimmed = nextKeyword.trim();
			if (trimmed) {
				params.set("keyword", trimmed);
				pushRecentSearch(trimmed);
			} else {
				params.delete("keyword");
			}

			if (locations.length > 0) params.set("location", locations.join(","));
			else params.delete("location");

			params.set("current", "1");
		});
	};

	const resetFilters = () => {
		setKeywordDraft({ source: "", value: "" });
		setLocationDraft({ source: "", value: [] });
		setSelectedJobId("");
		setSelectedJobFilterKey("");
		setSearchParams(new URLSearchParams());
	};

	const changePage = (next: number) => {
		setParams((params) => {
			params.set("current", String(next));
		});
	};

	const changeSort = (value: string) => {
		setParams((params) => {
			params.set("sort", value);
			params.set("current", "1");
		});
	};

	const changeSalary = (value: string) => {
		setParams((params) => {
			if (value === "all") params.delete("salary");
			else params.set("salary", value);
			params.set("current", "1");
		});
	};

	const handleToggleSave = () => {
		if (!effectiveSelectedJobId) return;
		if (!isAuthenticated) {
			toast.error("Đăng nhập để lưu việc làm");
			return;
		}
		toggleSave.mutate(effectiveSelectedJobId);
	};

	const activeFilterCount =
		(keywordParam ? 1 : 0) +
		(locationParam ? parseMultiParam(locationParam).length : 0) +
		selectedLevels.length +
		(salaryParam !== "all" ? 1 : 0);

	const selectedSortLabel =
		SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Mới nhất";

	return (
		<div className="min-h-[calc(100vh-3.5rem)] bg-white text-slate-900">
			<form
				onSubmit={(event) => {
					event.preventDefault();
					applySearch();
				}}
				className="sticky top-14 z-40 border-b border-slate-200/60 bg-white px-4 py-3"
			>
				<div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center">
					<SearchAutocomplete
						value={keyword}
						onChange={setKeyword}
						onSelect={(value) => {
							setKeyword(value);
							applySearch(value);
						}}
						placeholder="Tìm công việc, kỹ năng, công ty..."
						className="min-w-0 flex-1"
						inputClassName="h-10 rounded-lg border border-slate-200 bg-white text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-600/20 focus-visible:ring-offset-0"
					/>

					<div className="w-full rounded-lg border border-slate-200 bg-white sm:w-48 [&_button]:h-10 [&_button]:text-sm">
						<LocationMultiSelect value={locations} onChange={setLocations} />
					</div>

					<Button
						type="submit"
						className="h-10 cursor-pointer rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700"
					>
						<Search className="mr-2 h-4 w-4" />
						Tìm kiếm
					</Button>
				</div>
			</form>

			<div className="border-b border-slate-200/60 bg-slate-50 px-4 py-2">
				<div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto">
					<FilterPill label="Cấp bậc" active={selectedLevels.length > 0}>
						<div className="border-b border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900">
							Cấp bậc
						</div>
						<div className="max-h-64 overflow-y-auto p-1.5">
							{LEVEL_LIST.map((item) => {
								const checked = selectedLevels.includes(item);
								return (
									<div
										key={item}
										className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-slate-50"
									>
										<Checkbox
											id={`level-${item}`}
											checked={checked}
											onCheckedChange={() => setMultiParam("level", item)}
											className="cursor-pointer"
										/>
										<label
											htmlFor={`level-${item}`}
											className={cn(
												"cursor-pointer",
												checked
													? "font-medium text-blue-700"
													: "text-slate-700",
											)}
										>
											{item}
										</label>
									</div>
								);
							})}
						</div>
					</FilterPill>

					<FilterPill label="Mức lương" active={salaryParam !== "all"}>
						<div className="border-b border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900">
							Mức lương
						</div>
						<div className="p-1.5">
							{SALARY_RANGES.map((range) => {
								const active =
									salaryParam === range.key ||
									(salaryParam === "all" && range.key === "all");
								return (
									<button
										key={range.key}
										type="button"
										onClick={() => changeSalary(range.key)}
										className={cn(
											"flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-slate-50",
											active ? "font-medium text-blue-700" : "text-slate-700",
										)}
									>
										{range.label}
										{active && (
											<span className="h-2 w-2 rounded-full bg-blue-600" />
										)}
									</button>
								);
							})}
						</div>
					</FilterPill>

					{activeFilterCount > 0 && (
						<button
							type="button"
							onClick={resetFilters}
							className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 px-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
						>
							<X className="h-3.5 w-3.5" />
							Xóa bộ lọc
						</button>
					)}

					<div className="ml-auto flex shrink-0 items-center gap-2 pl-4">
						<span className="text-sm text-slate-500">Sắp xếp:</span>
						<Select value={sort} onValueChange={changeSort}>
							<SelectTrigger className="h-8 w-40 rounded-full border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-none">
								<SelectValue placeholder={selectedSortLabel} />
							</SelectTrigger>
							<SelectContent align="end">
								{SORT_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			<div className="mx-auto grid max-w-7xl grid-cols-1 lg:h-[calc(100vh-14rem)] lg:grid-cols-[420px_1fr] lg:overflow-hidden">
				<section className="border-slate-200/60 lg:border-r lg:overflow-y-auto">
					<div className="flex items-center justify-between border-b border-slate-200/60 px-4 py-2">
						<p className="text-sm text-slate-500">
							{meta ? `${meta.total} việc làm` : "Đang tải..."}
						</p>
						{selectedSalary && salaryParam !== "all" && (
							<span className="hidden text-xs text-slate-400 sm:inline">
								{selectedSalary.label}
							</span>
						)}
					</div>

					{isLoading ? (
						<div className="space-y-0">
							{SKELETON_ROWS.map((row) => (
								<div key={row} className="border-b border-slate-200/60 p-4">
									<Skeleton className="h-24 rounded-lg" />
								</div>
							))}
						</div>
					) : jobs.length === 0 ? (
						<div className="flex min-h-96 flex-col items-center justify-center gap-3 px-6 text-center">
							<Briefcase className="h-10 w-10 text-slate-300" />
							<div>
								<p className="font-semibold text-slate-900">
									Không tìm thấy việc làm phù hợp
								</p>
								<p className="mt-1 text-sm text-slate-500">
									Thử điều chỉnh bộ lọc hoặc từ khóa khác
								</p>
							</div>
							<Button
								variant="outline"
								onClick={resetFilters}
								className="h-9 cursor-pointer rounded-lg"
							>
								Xóa bộ lọc
							</Button>
						</div>
					) : (
						<div>
							{jobs.map((job) => (
								<JobCard
									key={job._id}
									job={job}
									variant="compact"
									isSelected={job._id === effectiveSelectedJobId}
									onClick={() => {
										setSelectedJobId(job._id);
										setSelectedJobFilterKey(filterResetKey);
									}}
								/>
							))}
						</div>
					)}

					{meta && meta.pages > 1 && (
						<div className="flex items-center justify-center gap-2 border-t border-slate-200/60 bg-white px-4 py-4">
							<Button
								variant="outline"
								size="icon"
								className="h-8 w-8 cursor-pointer rounded-lg"
								disabled={page <= 1}
								onClick={() => changePage(page - 1)}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<span className="px-2 text-sm font-medium text-slate-600">
								Trang {page} / {meta.pages}
							</span>
							<Button
								variant="outline"
								size="icon"
								className="h-8 w-8 cursor-pointer rounded-lg"
								disabled={page >= meta.pages}
								onClick={() => changePage(page + 1)}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					)}
				</section>

				<aside className="hidden overflow-y-auto p-6 lg:block">
					{loadingPreview ? (
						<PreviewSkeleton />
					) : selectedJob ? (
						<div className="mx-auto max-w-3xl">
							<div className="flex items-start gap-4">
								{selectedJob.company?.logo ? (
									<img
										src={companyLogoUrl(selectedJob.company.logo)}
										alt={selectedJob.company.name}
										className="h-12 w-12 shrink-0 rounded-md border border-slate-200 bg-white object-contain p-1"
									/>
								) : (
									<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
										<Building2 className="h-6 w-6 text-slate-400" />
									</div>
								)}
								<div className="min-w-0 flex-1">
									<h1 className="text-lg font-bold leading-6 text-slate-900">
										{selectedJob.name}
									</h1>
									<Link
										to={`/companies/${selectedJob.company._id}`}
										className="mt-1 inline-block text-sm text-slate-500 transition-colors hover:text-blue-600"
									>
										{selectedJob.company.name}
									</Link>
								</div>
							</div>

							<div className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2 xl:grid-cols-4">
								<div>
									<p className="flex items-center gap-1.5 text-xs text-slate-500">
										<Banknote className="h-3.5 w-3.5" />
										Mức lương
									</p>
									<p className="mt-1 text-sm font-semibold text-blue-600">
										{formatSalary(selectedJob.salary)}
									</p>
								</div>
								<div>
									<p className="flex items-center gap-1.5 text-xs text-slate-500">
										<MapPin className="h-3.5 w-3.5" />
										Địa điểm
									</p>
									<p className="mt-1 text-sm font-medium text-slate-900">
										{selectedJob.location}
									</p>
								</div>
								<div>
									<p className="flex items-center gap-1.5 text-xs text-slate-500">
										<Briefcase className="h-3.5 w-3.5" />
										Cấp bậc
									</p>
									<p className="mt-1 text-sm font-medium text-slate-900">
										{selectedJob.level}
									</p>
								</div>
								<div>
									<p className="flex items-center gap-1.5 text-xs text-slate-500">
										<Users className="h-3.5 w-3.5" />
										Số lượng
									</p>
									<p className="mt-1 text-sm font-medium text-slate-900">
										{selectedJob.quantity}
									</p>
								</div>
							</div>

							{selectedJob.skills && selectedJob.skills.length > 0 && (
								<div className="mt-4 flex flex-wrap gap-2">
									{selectedJob.skills.map((skill) => (
										<Badge
											key={skill}
											variant="secondary"
											className="rounded-md bg-blue-50 font-normal text-blue-700 hover:bg-blue-50"
										>
											{skill}
										</Badge>
									))}
								</div>
							)}

							<div className="mt-5 flex flex-wrap items-center gap-2">
								<Button
									onClick={() => setApplyOpen(true)}
									disabled={!selectedJob.isActive}
									className="h-10 cursor-pointer rounded-lg bg-blue-600 px-5 text-white transition-colors hover:bg-blue-700"
								>
									<Send className="mr-2 h-4 w-4" />
									Ứng tuyển
								</Button>
								<Button
									variant="outline"
									onClick={handleToggleSave}
									disabled={toggleSave.isPending}
									className={cn(
										"h-10 cursor-pointer rounded-lg border-slate-200 px-4 text-slate-700 hover:border-blue-300 hover:text-blue-700",
										saved &&
											"border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-50",
									)}
								>
									{saved ? (
										<BookmarkCheck className="mr-2 h-4 w-4" />
									) : (
										<Bookmark className="mr-2 h-4 w-4" />
									)}
									{saved ? "Đã lưu" : "Lưu"}
								</Button>
								<Button
									asChild
									variant="ghost"
									className="h-10 cursor-pointer rounded-lg px-3 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
								>
									<Link to={`/jobs/${selectedJob._id}`}>
										Xem chi tiết
										<ArrowRight className="ml-1.5 h-4 w-4" />
									</Link>
								</Button>
							</div>

							<div className="my-6 h-px bg-slate-200" />

							<section>
								<h2 className="text-base font-bold text-slate-900">
									Mô tả công việc
								</h2>
								<div
									className="prose prose-sm mt-3 max-w-none text-slate-700 prose-headings:text-slate-900 prose-a:text-blue-600 prose-strong:text-slate-900 prose-ul:my-2 prose-ol:my-2"
									dangerouslySetInnerHTML={{ __html: selectedJob.description }}
								/>
							</section>

							<div className="mt-6 grid gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 sm:grid-cols-3">
								<div>
									<p className="flex items-center gap-1.5 text-xs text-slate-500">
										<Clock className="h-3.5 w-3.5" />
										Đăng tuyển
									</p>
									<p className="mt-1 font-medium text-slate-800">
										{formatDistanceToNow(new Date(selectedJob.createdAt), {
											addSuffix: true,
											locale: vi,
										})}
									</p>
								</div>
								<div>
									<p className="flex items-center gap-1.5 text-xs text-slate-500">
										<Calendar className="h-3.5 w-3.5" />
										Bắt đầu
									</p>
									<p className="mt-1 font-medium text-slate-800">
										{format(new Date(selectedJob.startDate), "dd/MM/yyyy")}
									</p>
								</div>
								<div>
									<p className="flex items-center gap-1.5 text-xs text-slate-500">
										<Calendar className="h-3.5 w-3.5" />
										Kết thúc
									</p>
									<p className="mt-1 font-medium text-slate-800">
										{format(new Date(selectedJob.endDate), "dd/MM/yyyy")}
									</p>
								</div>
							</div>
						</div>
					) : (
						<div className="flex h-full min-h-96 items-center justify-center text-center">
							<div>
								<Briefcase className="mx-auto h-10 w-10 text-slate-300" />
								<p className="mt-3 text-sm font-medium text-slate-600">
									Chọn một việc làm để xem chi tiết
								</p>
							</div>
						</div>
					)}
				</aside>
			</div>

			{selectedJob && (
				<ApplyModal
					open={applyOpen}
					onOpenChange={setApplyOpen}
					job={selectedJob}
				/>
			)}
		</div>
	);
}
