import { HeroSearch } from "@/components/common/HeroSearch";
import { TopCompanies } from "@/components/common/TopCompanies";
import { LatestJobs } from "@/components/common/LatestJobs";
import { RecommendedJobs } from "@/components/common/RecommendedJobs";
import { ProfileRecommendedJobs } from "@/components/common/ProfileRecommendedJobs";

export function HomePage() {
	return (
		<div>
			<HeroSearch />
			<ProfileRecommendedJobs />
			<RecommendedJobs />
			<TopCompanies />
			<LatestJobs />
		</div>
	);
}
