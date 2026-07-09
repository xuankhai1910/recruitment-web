import {
	forwardRef,
	useCallback,
	useEffect,
	useRef,
	useState,
	type ComponentProps,
	type UIEvent,
} from "react";
import { Building2, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { companiesApi } from "@/api/companies.api";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";

type CompanyOption = Pick<Company, "_id" | "name">;

const PAGE_SIZE = 100;
// Trigger the next page a little before the list actually bottoms out.
const SCROLL_THRESHOLD_PX = 48;

interface CompanySearchComboboxProps
	extends Omit<ComponentProps<typeof Button>, "value" | "onSelect"> {
	value: string;
	selectedName: string;
	onSelect: (company: CompanyOption) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	loadingText?: string;
	disabled?: boolean;
	triggerClassName?: string;
	iconClassName?: string;
	valueWrapClassName?: string;
	placeholderClassName?: string;
	contentClassName?: string;
}

export const CompanySearchCombobox = forwardRef<
	HTMLButtonElement,
	CompanySearchComboboxProps
>(function CompanySearchCombobox(
{
	value,
	selectedName,
	onSelect,
	placeholder = "Chọn công ty",
	searchPlaceholder = "Tìm công ty...",
	emptyText = "Không tìm thấy công ty",
	loadingText = "Đang tải...",
	disabled,
	triggerClassName,
	iconClassName,
	valueWrapClassName,
	placeholderClassName = "text-muted-foreground",
	contentClassName,
	...triggerProps
},
ref,
) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [companies, setCompanies] = useState<Company[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);

	// Guards against firing another page request while one is in flight, and
	// discards responses from a superseded request (e.g. an older search).
	const inFlightRef = useRef(false);
	const requestIdRef = useRef(0);

	const fetchPage = useCallback(
		async (pageNum: number, searchTerm: string, append: boolean) => {
			const reqId = ++requestIdRef.current;
			inFlightRef.current = true;
			if (append) setLoadingMore(true);
			else setLoading(true);

			try {
				const r = await companiesApi.getList({
					current: pageNum,
					pageSize: PAGE_SIZE,
					...(searchTerm ? { name: `/${searchTerm}/i` } : {}),
				});
				// A newer request started while we were awaiting — drop this result.
				if (reqId !== requestIdRef.current) return;

				const { result, meta } = r.data.data;
				setCompanies((prev) => (append ? [...prev, ...result] : result));
				setPage(meta.current);
				setHasMore(meta.current < meta.pages);
			} catch {
				// Keep the picker quiet; parent forms handle submit-level errors.
			} finally {
				if (reqId === requestIdRef.current) {
					inFlightRef.current = false;
					if (append) setLoadingMore(false);
					else setLoading(false);
				}
			}
		},
		[],
	);

	// Reset to the first page whenever the search term changes (debounced).
	useEffect(() => {
		const timer = setTimeout(() => {
			fetchPage(1, search, false);
		}, 300);

		return () => {
			clearTimeout(timer);
		};
	}, [search, fetchPage]);

	const handleScroll = useCallback(
		(e: UIEvent<HTMLDivElement>) => {
			if (inFlightRef.current || !hasMore) return;
			const el = e.currentTarget;
			const distanceToBottom =
				el.scrollHeight - el.scrollTop - el.clientHeight;
			if (distanceToBottom <= SCROLL_THRESHOLD_PX) {
				fetchPage(page + 1, search, true);
			}
		},
		[hasMore, page, search, fetchPage],
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					ref={ref}
					type="button"
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					{...triggerProps}
					className={cn(
						"w-full justify-between font-normal",
						disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
						triggerClassName,
						triggerProps.className,
					)}
				>
					<span
						className={cn(
							"flex min-w-0 items-center gap-2",
							valueWrapClassName,
						)}
					>
						<Building2
							className={cn(
								"h-4 w-4 shrink-0 text-muted-foreground",
								iconClassName,
							)}
						/>
						<span
							className={cn(
								"truncate",
								!selectedName && placeholderClassName,
							)}
						>
							{selectedName || placeholder}
						</span>
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className={cn("w-(--radix-popover-trigger-width) p-0", contentClassName)}
				align="start"
			>
				<Command shouldFilter={false}>
					<CommandInput
						placeholder={searchPlaceholder}
						value={search}
						onValueChange={setSearch}
					/>
					<CommandList onScroll={handleScroll} className="show-scrollbar">
						{loading ? (
							<div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{loadingText}
							</div>
						) : (
							<>
								<CommandEmpty>{emptyText}</CommandEmpty>
								{companies.map((company) => (
									<CommandItem
										key={company._id}
										value={company._id}
										onSelect={() => {
											onSelect({
												_id: company._id,
												name: company.name,
											});
											setOpen(false);
										}}
										className="cursor-pointer"
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === company._id ? "opacity-100" : "opacity-0",
											)}
										/>
										<span className="truncate">{company.name}</span>
									</CommandItem>
								))}
								{loadingMore && (
									<div className="flex items-center justify-center py-3 text-sm text-muted-foreground">
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{loadingText}
									</div>
								)}
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
});
