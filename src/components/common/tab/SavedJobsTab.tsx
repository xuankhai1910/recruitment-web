import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { AlertCircle, Bookmark, CalendarX2, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { JobCard } from "@/components/common/JobCard";
import { useSavedJobs, useToggleSaveJob } from "@/hooks/useSavedJobs";
import { cn } from "@/lib/utils";
import type { SavedJob } from "@/api/saved-jobs.api";

const PAGE_SIZE = 6;

type ItemState = "active" | "expired" | "removed";

function classifyItem(item: SavedJob): ItemState {
	if (!item.job || item.job.deleted) return "removed";
	const expired =
		item.job.isActive === false ||
		(item.job.endDate && new Date(item.job.endDate).getTime() < Date.now());
	return expired ? "expired" : "active";
}

interface RemovedJobCardProps {
	savedAt: string;
	onRemove: () => void;
	disabled?: boolean;
}

function RemovedJobCard({ savedAt, onRemove, disabled }: RemovedJobCardProps) {
	return (
		<div className="flex h-full flex-col gap-3 rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
			<div className="flex items-start gap-3">
				<div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-slate-200 text-slate-500">
					<AlertCircle className="h-5 w-5" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold text-slate-700">
						Việc làm đã bị gỡ
					</p>
					<p className="mt-0.5 text-xs text-slate-500">
						Nhà tuyển dụng đã xóa tin này.{" "}
						{savedAt && (
							<>Đã lưu ngày {format(new Date(savedAt), "dd/MM/yyyy")}.</>
						)}
					</p>
				</div>
			</div>
			<div className="mt-auto flex items-center justify-between border-t border-slate-200/70 pt-3 text-xs text-slate-400">
				<span>Không thể ứng tuyển</span>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={disabled}
					onClick={onRemove}
					className="h-7 cursor-pointer gap-1 px-2 text-slate-500 hover:bg-slate-100 hover:text-rose-600"
				>
					<X className="h-3.5 w-3.5" />
					Gỡ khỏi danh sách
				</Button>
			</div>
		</div>
	);
}

/** Wraps an expired JobCard with a "Hết hạn" overlay badge. */
function ExpiredJobCardWrapper({
	item,
}: {
	item: SavedJob;
}) {
	if (!item.job) return null;
	const isPastDeadline =
		item.job.endDate &&
		new Date(item.job.endDate).getTime() < Date.now();
	return (
		<div className="relative">
			<span
				className={cn(
					"absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm",
				)}
			>
				<CalendarX2 className="h-3 w-3" />
				{isPastDeadline ? "Hết hạn" : "Đã đóng"}
			</span>
			<div className="pointer-events-none opacity-60">
				<JobCard job={item.job} variant="default" />
			</div>
		</div>
	);
}

export function SavedJobsTab() {
	const [keyword, setKeyword] = useState("");
	const [appliedKeyword, setAppliedKeyword] = useState("");
	const [page, setPage] = useState(1);
	const { data, isLoading } = useSavedJobs({
		current: page,
		pageSize: PAGE_SIZE,
		...(appliedKeyword ? { keyword: appliedKeyword } : {}),
		sort: "-createdAt",
	});
	const toggleSave = useToggleSaveJob();

	const items = data?.result ?? [];
	const meta = data?.meta;
	const pages = meta?.pages ?? 1;
	const total = meta?.total ?? items.length;

	const handleClearSearch = () => {
		setKeyword("");
		setAppliedKeyword("");
		setPage(1);
	};

	if (isLoading && items.length === 0) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-11 rounded-lg" />
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{["a", "b", "c", "d"].map((k) => (
						<Skeleton key={`saved-sk-${k}`} className="h-44 rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	const showEmpty = items.length === 0 && !appliedKeyword;

	if (showEmpty) {
		return (
			<div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-16 px-6 text-center">
				<div className="grid h-16 w-16 place-items-center rounded-full bg-rose-50">
					<Bookmark className="h-8 w-8 text-rose-500" />
				</div>
				<div className="space-y-1">
					<p className="font-heading text-base font-semibold text-slate-900">
						Bạn chưa lưu việc làm nào
					</p>
					<p className="max-w-sm text-sm text-slate-500">
						Nhấn icon đánh dấu ở mỗi việc làm để lưu lại và xem nhanh sau này.
					</p>
				</div>
				<Button
					asChild
					className="mt-2 cursor-pointer bg-blue-500 text-white shadow-sm shadow-blue-500/20 hover:bg-blue-600"
				>
					<Link to="/jobs">
						<Search className="mr-2 h-4 w-4" />
						Khám phá việc làm
					</Link>
				</Button>
			</div>
		);
	}

	// Stats: active vs expired vs removed
	const counts = items.reduce(
		(acc, it) => {
			const state = classifyItem(it);
			acc[state]++;
			return acc;
		},
		{ active: 0, expired: 0, removed: 0 },
	);

	return (
		<div className="space-y-4">
			{/* Header row */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap items-center gap-2 text-sm">
					<p className="text-slate-500">
						{appliedKeyword ? (
							<>
								<span className="font-medium text-slate-900">{total}</span> kết
								quả cho "
								<span className="text-blue-600">{appliedKeyword}</span>"
							</>
						) : (
							<>
								<span className="font-medium text-slate-900">{total}</span>{" "}
								việc làm trong danh sách
							</>
						)}
					</p>
					{counts.expired > 0 && (
						<Badge
							variant="outline"
							className="border-slate-200 bg-white text-[11px] font-normal text-slate-500"
						>
							{counts.expired} đã hết hạn
						</Badge>
					)}
					{counts.removed > 0 && (
						<Badge
							variant="outline"
							className="border-slate-200 bg-white text-[11px] font-normal text-slate-500"
						>
							{counts.removed} đã bị gỡ
						</Badge>
					)}
				</div>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						setAppliedKeyword(keyword);
						setPage(1);
					}}
					className="flex gap-2"
				>
					<div className="relative w-full sm:w-72">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<Input
							value={keyword}
							onChange={(e) => setKeyword(e.target.value)}
							placeholder="Tìm trong việc đã lưu..."
							className="h-9 pl-9"
						/>
					</div>
					{appliedKeyword ? (
						<Button
							type="button"
							variant="outline"
							onClick={handleClearSearch}
							className="h-9 cursor-pointer"
						>
							Xóa
						</Button>
					) : (
						<Button
							type="submit"
							variant="outline"
							className="h-9 cursor-pointer"
						>
							Tìm
						</Button>
					)}
				</form>
			</div>

			{/* Grid */}
			{items.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
					Không tìm thấy việc làm phù hợp với "{appliedKeyword}"
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{items.map((item) => {
						const state = classifyItem(item);
						if (state === "removed") {
							return (
								<RemovedJobCard
									key={item._id}
									savedAt={item.savedAt ?? item.createdAt}
									disabled={toggleSave.isPending}
									onRemove={() => toggleSave.mutate(item.jobId)}
								/>
							);
						}
						if (state === "expired") {
							return <ExpiredJobCardWrapper key={item._id} item={item} />;
						}
						// active — classifyItem already ensures item.job is non-null
						if (!item.job) return null;
						return (
							<JobCard
								key={item._id}
								job={item.job}
								variant="default"
							/>
						);
					})}
				</div>
			)}

			{pages > 1 && (
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								className={
									page === 1
										? "pointer-events-none opacity-40"
										: "cursor-pointer"
								}
								onClick={() => setPage((p) => Math.max(1, p - 1))}
							/>
						</PaginationItem>
						{Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
							<PaginationItem key={n}>
								<PaginationLink
									isActive={page === n}
									className="cursor-pointer"
									onClick={() => setPage(n)}
								>
									{n}
								</PaginationLink>
							</PaginationItem>
						))}
						<PaginationItem>
							<PaginationNext
								className={
									page >= pages
										? "pointer-events-none opacity-40"
										: "cursor-pointer"
								}
								onClick={() => setPage((p) => Math.min(pages, p + 1))}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
}
