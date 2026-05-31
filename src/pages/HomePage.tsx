import { HeroSearch } from "@/components/common/HeroSearch";
import { TopCompanies } from "@/components/common/TopCompanies";
import { LatestJobs } from "@/components/common/job-card/LatestJobs";
import { RecommendedJobs } from "@/components/common/job-card/RecommendedJobs";
import { ProfileRecommendedJobs } from "@/components/common/job-card/ProfileRecommendedJobs";

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
