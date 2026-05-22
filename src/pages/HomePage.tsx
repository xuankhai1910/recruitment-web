import { HeroSearch } from "@/components/common/HeroSearch";
import { TopCompanies } from "@/components/common/TopCompanies";
import { LatestJobs } from "@/components/common/LatestJobs";
import { RecommendedJobs } from "@/components/common/RecommendedJobs";
import { ProfileRecommendedJobs } from "@/components/common/ProfileRecommendedJobs";

export function HomePage() {
	return (
		<div className="-mt-24 bg-slate-50 pb-12 [&>section+section]:mt-10">
			<HeroSearch />
			<ProfileRecommendedJobs />
			<RecommendedJobs />
			<TopCompanies />
			<LatestJobs />
		</div>
	);
}
