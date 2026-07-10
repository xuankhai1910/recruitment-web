import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { nonAccentVietnamese } from "@/lib/vietnamese";

interface OptionComboboxProps {
	options: readonly string[];
	value: string | undefined;
	onChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	disabled?: boolean;
	triggerClassName?: string;
	className?: string;
}

/**
 * Searchable single-select for plain string options. Mirrors CompanyCombobox
 * (cmdk + accent-insensitive filtering) but for simple string lists like
 * locations. The CommandList scrolls (max-h-72) once the list overflows.
 */
export function OptionCombobox({
	options,
	value,
	onChange,
	placeholder = "Chọn",
	searchPlaceholder = "Tìm kiếm...",
	emptyText = "Không tìm thấy",
	disabled,
	triggerClassName,
	className,
}: OptionComboboxProps) {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						"h-9 w-full justify-between font-normal",
						disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
						!value && "text-muted-foreground",
						triggerClassName,
					)}
				>
					<span className="truncate">{value || placeholder}</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				side="bottom"
				align="start"
				sideOffset={4}
				avoidCollisions={false}
				className={cn(
					"w-[var(--radix-popover-trigger-width)] p-0",
					className,
				)}
			>
				<Command
					filter={(itemValue, search) => {
						const haystack = nonAccentVietnamese(itemValue).toLowerCase();
						const needle = nonAccentVietnamese(search).toLowerCase();
						return haystack.includes(needle) ? 1 : 0;
					}}
				>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList>
						<CommandEmpty>{emptyText}</CommandEmpty>
						{options.map((opt) => (
							<CommandItem
								key={opt}
								value={opt}
								onSelect={() => {
									onChange(opt);
									setOpen(false);
								}}
								data-checked={value === opt}
							>
								<span className="truncate">{opt}</span>
							</CommandItem>
						))}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
