import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LocationMultiSelect } from "@/components/common/LocationMultiSelect";
import { CategorySpecializationModal } from "@/components/common/CategorySpecializationModal";
import {
	SearchAutocomplete,
	pushRecentSearch,
} from "@/components/common/SearchAutocomplete";
import { ChevronDown, Layers, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR_KEYWORDS = ["React", "Java", "Python", "Marketing", "Design"];

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
		<section className="relative overflow-hidden py-20">
			<div className="mx-auto max-w-[1280px] px-7">
				<div className="mb-6 flex justify-center">
					<span className="inline-flex items-center gap-2 font-mono-jb text-xs font-semibold uppercase tracking-[0.12em] text-teal-700 before:inline-block before:h-[1.5px] before:w-6 before:rounded-sm before:bg-teal-500">
						DevMarket · Tuyển dụng 2026
					</span>
				</div>
				<h1 className="mx-auto max-w-[1000px] text-center font-display text-[clamp(48px,8vw,96px)] font-bold leading-[0.95] tracking-[-0.04em] text-ink">
					Tìm việc làm,
					<br />
					<span className="relative inline-block italic text-teal-700">
						xây sự nghiệp
						<span className="absolute inset-x-0 bottom-[6%] -z-10 h-[14%] rounded bg-teal-100" />
					</span>
				</h1>
				<p className="mx-auto mt-6 max-w-[580px] text-center text-[clamp(16px,1.5vw,18px)] leading-relaxed text-slate-600">
					Khám phá việc làm chất lượng từ các công ty hàng đầu Việt Nam — kết hợp
					gợi ý AI dựa trên hồ sơ kỹ năng của bạn.
				</p>

				<form
					onSubmit={handleSearch}
					className="mx-auto mt-12 flex max-w-[880px] flex-wrap items-stretch overflow-hidden rounded-xl border-[1.5px] border-ink bg-white shadow-[8px_8px_0_#0a0f1a] transition-all duration-200 focus-within:-translate-x-0.5 focus-within:-translate-y-0.5 focus-within:shadow-[10px_10px_0_#0a0f1a]"
				>
					<button
						type="button"
						onClick={() => setSpecModalOpen(true)}
						className={cn(
							"flex min-h-[60px] flex-[0_1_220px] items-center gap-2.5 border-r border-line px-[18px] text-[15px] font-medium",
							specializations.length > 0 ? "text-teal-700" : "text-ink",
						)}
					>
						<Layers className="h-[18px] w-[18px] shrink-0 text-slate-400" />
						<span className="flex-1 truncate text-left">
							{specializations.length === 0
								? "Danh mục"
								: `Danh mục (${specializations.length})`}
						</span>
						<ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
					</button>

					<div className="flex min-h-[60px] flex-1 items-center gap-2.5 border-r border-line px-[18px]">
						<Search className="h-[18px] w-[18px] shrink-0 text-slate-400" />
						<SearchAutocomplete
							value={keyword}
							onChange={setKeyword}
							onSelect={(v) => {
								setKeyword(v);
								submitWith(v);
							}}
							placeholder="Tên công việc, kỹ năng..."
							showIcon={false}
							inputClassName="border-0 bg-transparent p-0 text-[15px] font-medium text-ink shadow-none focus-visible:ring-0"
						/>
					</div>

					<div className="flex min-h-[60px] flex-[0_1_220px] items-center px-2">
						<LocationMultiSelect value={locations} onChange={setLocations} />
					</div>

					<button
						type="submit"
						className="m-2 flex shrink-0 items-center gap-2 rounded-lg bg-ink px-7 text-sm font-semibold text-white transition-colors hover:bg-black"
					>
						<Search className="h-4 w-4" />
						Tìm kiếm
					</button>
				</form>

				<div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
					<span className="mr-1 text-[13px] font-medium text-slate-600">
						Phổ biến:
					</span>
					{POPULAR_KEYWORDS.map((kw) => (
						<button
							key={kw}
							type="button"
							onClick={() => {
								setKeyword(kw);
								submitWith(kw);
							}}
							className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-medium text-slate-700 transition-colors hover:border-ink hover:bg-ink hover:text-white"
						>
							{kw}
						</button>
					))}
				</div>

				<CategorySpecializationModal
					open={specModalOpen}
					onOpenChange={setSpecModalOpen}
					initialSpecializations={specializations}
					onConfirm={({ specializations: next }) => setSpecializations(next)}
				/>
			</div>
		</section>
	);
}
