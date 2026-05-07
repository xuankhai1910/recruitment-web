import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LocationMultiSelect } from "@/components/common/LocationMultiSelect";
import {
	SearchAutocomplete,
	pushRecentSearch,
} from "@/components/common/SearchAutocomplete";
import { Search, TrendingUp } from "lucide-react";

const POPULAR_KEYWORDS = ["React", "Java", "Python", "Marketing", "Design"];

export function HeroSearch() {
	const navigate = useNavigate();
	const [keyword, setKeyword] = useState("");
	const [locations, setLocations] = useState<string[]>([]);

	const submitWith = (kw: string) => {
		const params = new URLSearchParams();
		if (kw) {
			params.set("keyword", kw);
			pushRecentSearch(kw);
		}
		if (locations.length > 0) params.set("location", locations.join(","));
		params.set("current", "1");
		params.set("pageSize", "5");
		navigate(`/jobs?${params.toString()}`);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		submitWith(keyword);
	};

	return (
		<section className="bg-linear-to-r from-blue-600 to-blue-700 px-4 py-10 sm:py-14">
			<div className="mx-auto max-w-3xl text-center">
				<h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
					Tìm kiếm việc làm mơ ước
				</h1>
				<p className="mx-auto mt-3 max-w-xl text-sm text-blue-100 sm:text-base">
					Hàng nghìn cơ hội việc làm từ các công ty hàng đầu đang chờ bạn
				</p>

				{/* Search bar */}
				<form
					onSubmit={handleSearch}
					className="mx-auto mt-7 flex max-w-3xl flex-col gap-2 rounded-xl bg-white p-1.5 shadow-lg sm:flex-row sm:items-center"
				>
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
							inputClassName="h-11 border-0 bg-transparent pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0"
						/>
					</div>

					<div className="hidden h-6 w-px bg-slate-200 sm:block" />

					<div className="flex-1 [&_button]:h-11 [&_button]:text-sm">
						<LocationMultiSelect value={locations} onChange={setLocations} />
					</div>

					<Button
						type="submit"
						className="h-11 min-w-32 cursor-pointer rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700"
					>
						<Search className="mr-2 h-4 w-4" />
						Tìm kiếm
					</Button>
				</form>

				{/* Popular keywords */}
				<div className="mt-5 flex flex-wrap items-center justify-center gap-2">
					<span className="flex items-center gap-1 text-xs text-blue-200">
						<TrendingUp className="h-3.5 w-3.5" />
						Phổ biến:
					</span>
					{POPULAR_KEYWORDS.map((kw) => (
						<button
							key={kw}
							type="button"
							onClick={() => {
								setKeyword(kw);
							}}
							className="cursor-pointer rounded-full border border-blue-400/30 px-2.5 py-0.5 text-xs text-blue-100 transition-colors duration-150 hover:bg-blue-500/30"
						>
							{kw}
						</button>
					))}
				</div>
			</div>
		</section>
	);
}
