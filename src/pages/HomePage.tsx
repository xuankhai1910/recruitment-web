import { HeroSearch } from "@/components/common/HeroSearch";
import { TopCompanies } from "@/components/common/TopCompanies";
import { LatestJobs } from "@/components/common/LatestJobs";
import { RecommendedJobs } from "@/components/common/RecommendedJobs";

export function HomePage() {
	return (
		<>
			<HeroSearch />
			<RecommendedJobs />
			<TopCompanies />
			<LatestJobs />
		</>
	);
}
