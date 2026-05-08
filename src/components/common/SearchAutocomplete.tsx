import { useEffect, useRef, useState } from "react";
import { Clock, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "jobfinder:recent-searches";
const MAX_RECENT = 5;

function readRecent(): string[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
	} catch {
		return [];
	}
}

function writeRecent(list: string[]) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
	} catch {
		/* ignore */
	}
}

export function pushRecentSearch(term: string) {
	const trimmed = term.trim();
	if (!trimmed) return;
	const current = readRecent().filter(
		(s) => s.toLowerCase() !== trimmed.toLowerCase(),
	);
	current.unshift(trimmed);
	writeRecent(current.slice(0, MAX_RECENT));
}

interface SearchAutocompleteProps {
	value: string;
	onChange: (v: string) => void;
	onSelect?: (v: string) => void;
	placeholder?: string;
	className?: string;
	inputClassName?: string;
	showIcon?: boolean;
}

export function SearchAutocomplete({
	value,
	onChange,
	onSelect,
	placeholder = "Tên công việc, kỹ năng...",
	className,
	inputClassName,
	showIcon = true,
}: SearchAutocompleteProps) {
	const [open, setOpen] = useState(false);
	const [recent, setRecent] = useState<string[]>(() => readRecent());
	const [activeIndex, setActiveIndex] = useState(-1);
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(e.target as Node)
			) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => {
			document.removeEventListener("mousedown", handleClick);
		};
	}, []);

	const showRecent = value.trim().length === 0 && recent.length > 0;
	const flatList = showRecent ? recent : [];

	const commit = (term: string) => {
		onChange(term);
		pushRecentSearch(term);
		setRecent(readRecent());
		setOpen(false);
		setActiveIndex(-1);
		onSelect?.(term);
	};

	const removeRecent = (term: string, e: React.MouseEvent) => {
		e.stopPropagation();
		const next = readRecent().filter((s) => s !== term);
		writeRecent(next);
		setRecent(next);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!open || flatList.length === 0) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIndex((i) => (i + 1) % flatList.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIndex((i) => (i <= 0 ? flatList.length - 1 : i - 1));
		} else if (e.key === "Enter" && activeIndex >= 0) {
			e.preventDefault();
			commit(flatList[activeIndex]);
		} else if (e.key === "Escape") {
			setOpen(false);
		}
	};

	return (
		<div ref={wrapperRef} className={cn("relative", className)}>
			<div className="relative">
				{showIcon && (
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				)}
				<Input
					value={value}
					onChange={(e) => {
						onChange(e.target.value);
						setOpen(true);
						setActiveIndex(-1);
					}}
					onFocus={() => {
						setOpen(true);
					}}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className={cn(showIcon && "pl-9", inputClassName)}
				/>
			</div>

			{open && showRecent && (
				<div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md">
					<div className="py-1">
						<div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Tìm kiếm gần đây
						</div>
						{recent.map((s, idx) => (
							<button
								key={s}
								type="button"
								onMouseDown={(e) => {
									e.preventDefault();
									commit(s);
								}}
								onMouseEnter={() => {
									setActiveIndex(idx);
								}}
								className={cn(
									"flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
									activeIndex === idx
										? "bg-accent text-accent-foreground"
										: "hover:bg-accent/60",
								)}
							>
								<Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
								<span className="flex-1 truncate">{s}</span>
								<X
									className="h-3.5 w-3.5 shrink-0 text-muted-foreground hover:text-destructive"
									onClick={(e) => {
										removeRecent(s, e);
									}}
								/>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
