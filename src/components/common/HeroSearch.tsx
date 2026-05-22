import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LocationMultiSelect } from "@/components/common/LocationMultiSelect";
import { CategorySpecializationModal } from "@/components/common/CategorySpecializationModal";
import {
	SearchAutocomplete,
	pushRecentSearch,
} from "@/components/common/SearchAutocomplete";
import { ChevronDown, Layers, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR_KEYWORDS = ["React", "Java", "Python", "Marketing", "Design"];

const HERO_IMAGE_URL =
	"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80&auto=format&fit=crop";

export function HeroSearch() {
	const navigate = useNavigate();
	const [keyword, setKeyword] = useState("");
	const [locations, setLocations] = useState<string[]>([]);
	const [specializations, setSpecializations] = useState<string[]>([]);
	const [specModalOpen, setSpecModalOpen] = useState(false);

	const submitWith = (kw: string) => {
		const params = new URLSearchParams();
		if (kw) {
			params.set("keyword", kw);
			pushRecentSearch(kw);
		}
		if (locations.length > 0) params.set("location", locations.join(","));
		if (specializations.length > 0)
			params.set("specializations", specializations.join(","));
		params.set("current", "1");
		params.set("pageSize", "5");
		navigate(`/jobs?${params.toString()}`);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		submitWith(keyword);
	};

	return (
		<section className="px-4 pt-4 sm:px-6 lg:px-8">
			<div className="relative">
				{/* Background layer (clipped) — gradient + image stay inside rounded corners */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl bg-linear-to-r from-blue-50 via-blue-50 to-blue-100">
					<img
						src={HERO_IMAGE_URL}
						alt=""
						aria-hidden="true"
						className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-90 mask-[linear-gradient(to_right,transparent,black_40%)] lg:block"
					/>
				</div>

				{/* Content layer — NOT clipped, so autocomplete dropdown can overflow */}
				<div className="relative px-6 pt-32 pb-20 sm:px-12 sm:pt-40 sm:pb-28 lg:pt-44 lg:pb-32">
					{/* Search bar — centered, narrower */}
					<form
						onSubmit={handleSearch}
						className="mx-auto flex max-w-3xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-blue-900/5 ring-1 ring-slate-100 sm:flex-row sm:items-center"
					>
						<button
							type="button"
							onClick={() => setSpecModalOpen(true)}
							className={cn(
								"flex h-12 shrink-0 items-center gap-2 rounded-xl px-3 text-left text-sm font-medium transition-colors sm:max-w-48",
								specializations.length > 0
									? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
									: "text-slate-700 hover:bg-slate-50",
							)}
						>
							<Layers className="h-4 w-4 shrink-0" />
							<span className="min-w-0 flex-1 truncate">
								{specializations.length === 0
									? "Danh mục"
									: `Danh mục (${specializations.length})`}
							</span>
							<ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
						</button>

						<div className="hidden h-6 w-px bg-slate-200 sm:block" />

						<div className="relative flex-1">
							<SearchAutocomplete
								value={keyword}
								onChange={setKeyword}
								onSelect={(v) => {
									setKeyword(v);
									submitWith(v);
								}}
								placeholder="Tên công việc, kỹ năng..."
								showIcon
								inputClassName="h-12 border-0 bg-transparent pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0"
							/>
						</div>

						<div className="hidden h-6 w-px bg-slate-200 sm:block" />

						<div className="flex-1 [&_button]:h-12 [&_button]:rounded-xl [&_button]:text-sm">
							<LocationMultiSelect value={locations} onChange={setLocations} />
						</div>

						<Button
							type="submit"
							className="h-12 min-w-32 cursor-pointer rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors duration-150 hover:bg-blue-700"
						>
							<Search className="mr-2 h-4 w-4" />
							Tìm kiếm
						</Button>
					</form>

					<CategorySpecializationModal
						open={specModalOpen}
						onOpenChange={setSpecModalOpen}
						initialSpecializations={specializations}
						onConfirm={({ specializations: next }) => setSpecializations(next)}
					/>

					{/* Popular keywords */}
					<div className="mt-5 flex flex-wrap items-center justify-center gap-2">
						<span className="text-sm font-medium text-slate-700">
							Từ khóa phổ biến:
						</span>
						{POPULAR_KEYWORDS.map((kw) => (
							<button
								key={kw}
								type="button"
								onClick={() => {
									setKeyword(kw);
									submitWith(kw);
								}}
								className="cursor-pointer rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-sm text-slate-700 backdrop-blur transition-colors duration-150 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
							>
								{kw}
							</button>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
