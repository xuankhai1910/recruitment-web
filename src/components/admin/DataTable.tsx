import type { ReactNode } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { PaginationMeta } from "@/types/api";
import { ChevronLeft, ChevronRight, Inbox, Search } from "lucide-react";

export interface Column<T> {
	key: string;
	label: string;
	labelNode?: ReactNode;
	className?: string;
	render: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
	columns: Column<T>[];
	data: T[];
	meta?: PaginationMeta;
	loading?: boolean;
	searchPlaceholder?: string;
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
	toolbar?: ReactNode;
	filters?: ReactNode;
	rowKey: (row: T) => string;
}

export function DataTable<T>({
	columns,
	data,
	meta,
	loading,
	searchPlaceholder = "Tìm kiếm...",
	searchValue,
	onSearchChange,
	onPageChange,
	onPageSizeChange,
	toolbar,
	filters,
	rowKey,
}: DataTableProps<T>) {
	return (
		<div className="space-y-4">
			{/* Toolbar: search + actions */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				{onSearchChange !== undefined ? (
					<div className="relative w-full sm:max-w-xs">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={searchPlaceholder}
							value={searchValue}
							onChange={(e) => {
								onSearchChange(e.target.value);
							}}
							className="pl-9"
						/>
					</div>
				) : (
					<div />
				)}
				{toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
			</div>

			{/* Filters row */}
			{filters && (
				<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
					{filters}
				</div>
			)}

			{/* Table */}
			<div className="overflow-x-auto rounded-lg border border-border/60">
				<Table className="table-fixed min-w-[900px]">
					<TableHeader>
						<TableRow className="bg-muted/50 hover:bg-muted/50">
							{columns.map((col) => (
								<TableHead key={col.key} className={col.className}>
								{col.labelNode ?? col.label}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={`skeleton-${i.toString()}`}>
									{columns.map((col) => (
										<TableCell key={col.key}>
											<Skeleton className="h-5 w-full" />
										</TableCell>
									))}
								</TableRow>
							))
						) : data.length === 0 ? (
							<TableRow>
								<TableCell colSpan={columns.length}>
									<div className="flex flex-col items-center gap-2 py-12">
										<Inbox className="h-10 w-10 text-muted-foreground/40" />
										<p className="text-sm text-muted-foreground">
											Không có dữ liệu
										</p>
									</div>
								</TableCell>
							</TableRow>
						) : (
							data.map((row, idx) => (
								<TableRow
									key={rowKey(row)}
									className="cursor-default transition-colors duration-100 hover:bg-accent/40"
								>
									{columns.map((col) => (
										<TableCell key={col.key} className={col.className}>
											{col.render(row, idx)}
										</TableCell>
									))}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination — always show when meta exists */}
			{meta && meta.total > 0 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Hiển thị {(meta.current - 1) * meta.pageSize + 1}-
						{Math.min(meta.current * meta.pageSize, meta.total)} trên{" "}
						{meta.total} bản ghi
					</p>
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-1.5">
							<Button
								variant="outline"
								size="icon"
								className="h-8 w-8 cursor-pointer"
								disabled={meta.current <= 1}
								onClick={() => {
									onPageChange?.(meta.current - 1);
								}}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							{Array.from({ length: meta.pages }, (_, i) => i + 1)
								.filter(
									(p) =>
										p === 1 ||
										p === meta.pages ||
										Math.abs(p - meta.current) <= 1,
								)
								.map((p, i, arr) => {
									const prev = arr[i - 1];
									const showEllipsis = prev !== undefined && p - prev > 1;
									return (
										<span key={p} className="flex items-center">
											{showEllipsis && (
												<span className="px-1.5 text-sm text-muted-foreground">
													...
												</span>
											)}
											<Button
												variant={p === meta.current ? "default" : "outline"}
												size="icon"
												className="h-8 w-8 cursor-pointer"
												onClick={() => {
													onPageChange?.(p);
												}}
											>
												{p}
											</Button>
										</span>
									);
								})}
							<Button
								variant="outline"
								size="icon"
								className="h-8 w-8 cursor-pointer"
								disabled={meta.current >= meta.pages}
								onClick={() => {
									onPageChange?.(meta.current + 1);
								}}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
						{onPageSizeChange && (
							<Select
								value={String(meta.pageSize)}
								onValueChange={(v) => {
									onPageSizeChange(Number(v));
								}}
							>
								<SelectTrigger className="h-8 w-16 text-xs cursor-pointer">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{[10, 20, 50, 100].map((s) => (
										<SelectItem key={s} value={String(s)} className="text-xs">
											{s}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
