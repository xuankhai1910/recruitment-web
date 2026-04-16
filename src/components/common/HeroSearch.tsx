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
    <section className="relative bg-primary px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
          Tìm kiếm việc làm mơ ước
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/80 sm:text-lg">
          Hàng nghìn cơ hội việc làm từ các công ty hàng đầu đang chờ bạn
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-xl bg-card p-2.5 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tên công việc, kỹ năng..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
              }}
              className="h-12 border-0 bg-transparent pl-10 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>

          <div className="hidden h-8 w-px bg-border sm:block" />

          <div className="flex-1">
            <LocationMultiSelect value={locations} onChange={setLocations} />
          </div>

          <Button
            type="submit"
            className="h-12 min-w-32 cursor-pointer bg-[#22C55E] text-base font-semibold text-white transition-colors duration-200 hover:bg-[#16A34A]"
          >
            <Search className="mr-2 h-4 w-4" />
            Tìm kiếm
          </Button>
        </form>

        {/* Popular keywords */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="flex items-center gap-1 text-sm text-primary-foreground/60">
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
              className="cursor-pointer rounded-full border border-primary-foreground/20 px-3 py-1 text-sm text-primary-foreground/80 transition-colors duration-200 hover:border-primary-foreground/50 hover:text-primary-foreground"
            >
              {kw}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
