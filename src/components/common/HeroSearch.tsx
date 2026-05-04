import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationMultiSelect } from "@/components/common/LocationMultiSelect";
import { Search, TrendingUp } from "lucide-react";

const POPULAR_KEYWORDS = ["React", "Java", "Python", "Marketing", "Design"];

export function HeroSearch() {
	const navigate = useNavigate();
	const [keyword, setKeyword] = useState("");
	const [locations, setLocations] = useState<string[]>([]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const params = new URLSearchParams();
		if (keyword) params.set("keyword", keyword);
		if (locations.length > 0) params.set("location", locations.join(","));
		params.set("current", "1");
		params.set("pageSize", "5");
		navigate(`/jobs?${params.toString()}`);
	};

	return (
		<section className="relative bg-primary px-4 py-12 sm:py-16">
			<div className="mx-auto max-w-4xl text-center">
				<h1 className="font-heading text-2xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
					Tìm kiếm việc làm mơ ước
				</h1>
				<p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
					Hàng nghìn cơ hội việc làm từ các công ty hàng đầu đang chờ bạn
				</p>

				{/* Search bar */}
				<form
					onSubmit={handleSearch}
					className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 rounded-lg bg-card p-2 sm:flex-row sm:items-center"
				>
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Tên công việc, kỹ năng..."
							value={keyword}
							onChange={(e) => {
								setKeyword(e.target.value);
							}}
							className="h-11 border-0 bg-transparent pl-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
						/>
					</div>

					<div className="hidden h-6 w-px bg-border sm:block" />

					<div className="flex-1">
						<LocationMultiSelect value={locations} onChange={setLocations} />
					</div>

					<Button
						type="submit"
						className="h-11 min-w-32 cursor-pointer bg-[#22C55E] text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#16A34A]"
					>
						<Search className="mr-2 h-4 w-4" />
						Tìm kiếm
					</Button>
				</form>

				{/* Popular keywords */}
				<div className="mt-5 flex flex-wrap items-center justify-center gap-2">
					<span className="flex items-center gap-1 text-xs text-primary-foreground/70">
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
							className="cursor-pointer rounded-md border border-primary-foreground/25 px-2.5 py-0.5 text-xs text-primary-foreground/90 transition-colors duration-150 hover:bg-primary-foreground/10"
						>
							{kw}
						</button>
					))}
				</div>
			</div>
		</section>
	);
}
