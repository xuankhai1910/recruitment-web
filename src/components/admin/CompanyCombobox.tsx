import { useState } from "react";
import { ChevronsUpDown, X } from "lucide-react";
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
import type { Company } from "@/types/company";

interface CompanyComboboxProps {
	companies: Pick<Company, "_id" | "name">[];
	value: string | undefined;
	onChange: (id: string | undefined) => void;
	placeholder?: string;
	disabled?: boolean;
	/** Show a "Tất cả công ty" item that clears the selection. */
	allowClear?: boolean;
	className?: string;
	triggerClassName?: string;
}

export function CompanyCombobox({
	companies,
	value,
	onChange,
	placeholder = "Chọn công ty",
	disabled,
	allowClear,
	className,
	triggerClassName,
}: CompanyComboboxProps) {
	const [open, setOpen] = useState(false);
	const selected = value ? companies.find((c) => c._id === value) : undefined;

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
						!selected && "text-muted-foreground",
						triggerClassName,
					)}
				>
					<span className="truncate">
						{selected ? selected.name : placeholder}
					</span>
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
					filter={(_id, search, keywords) => {
						const haystack = nonAccentVietnamese(
							keywords?.[0] ?? "",
						).toLowerCase();
						const needle = nonAccentVietnamese(search).toLowerCase();
						return haystack.includes(needle) ? 1 : 0;
					}}
				>
					<CommandInput placeholder="Tìm công ty..." />
					<CommandList>
						<CommandEmpty>Không tìm thấy công ty</CommandEmpty>
						{allowClear && (
							<CommandItem
								value="__clear__"
								keywords={["tat ca", "all"]}
								onSelect={() => {
									onChange(undefined);
									setOpen(false);
								}}
								data-checked={!value}
							>
								<X className="size-3.5 text-muted-foreground" />
								<span className="text-muted-foreground">Tất cả công ty</span>
							</CommandItem>
						)}
						{companies.map((c) => (
							<CommandItem
								key={c._id}
								value={c._id}
								keywords={[c.name]}
								onSelect={() => {
									onChange(c._id);
									setOpen(false);
								}}
								data-checked={value === c._id}
							>
								<span className="truncate">{c.name}</span>
							</CommandItem>
						))}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
