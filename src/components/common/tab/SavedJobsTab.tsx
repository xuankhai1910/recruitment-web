import { useState } from "react";
import { Bookmark, BookmarkX, Search } from "lucide-react";

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

const PAGE_SIZE = 5;

export function SavedJobsTab() {
	const [keyword, setKeyword] = useState("");
	const [appliedKeyword, setAppliedKeyword] = useState("");
	const [page, setPage] = useState(1);
	const { data, isLoading } = useSavedJobs({
		current: page,
		pageSize: PAGE_SIZE,
		...(appliedKeyword ? { name: `/${appliedKeyword}/i` } : {}),
		sort: "-createdAt",
	});
	const toggle = useToggleSaveJob();

	const items = data?.result ?? [];
	const meta = data?.meta;
	const pages = meta?.pages ?? 1;

	if (isLoading && items.length === 0) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={i} className="h-24 rounded-lg" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					setAppliedKeyword(keyword);
					setPage(1);
				}}
				className="flex gap-2"
			>
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={keyword}
						onChange={(e) => {
							setKeyword(e.target.value);
						}}
						placeholder="Tìm trong việc đã lưu..."
						className="pl-9"
					/>
				</div>
				<Button type="submit" variant="outline">
					Tìm
				</Button>
			</form>

			{items.length === 0 ? (
				<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-12">
					<Bookmark className="h-10 w-10 text-muted-foreground/40" />
					<p className="text-sm text-muted-foreground">
						Bạn chưa lưu việc làm nào
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{items.map((s) => (
						<div key={s._id} className="relative">
							<JobCard job={s.jobId} />
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="absolute right-2 top-2 z-10 h-8 w-8 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
								disabled={toggle.isPending}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									toggle.mutate(s.jobId._id);
								}}
								aria-label="Bỏ lưu"
							>
								<BookmarkX className="h-4 w-4" />
							</Button>
						</div>
					))}
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
								onClick={() => {
									setPage((p) => Math.max(1, p - 1));
								}}
							/>
						</PaginationItem>
						{Array.from({ length: pages }).map((_, i) => (
							<PaginationItem key={i}>
								<PaginationLink
									isActive={page === i + 1}
									className="cursor-pointer"
									onClick={() => {
										setPage(i + 1);
									}}
								>
									{i + 1}
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
								onClick={() => {
									setPage((p) => Math.min(pages, p + 1));
								}}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
}
