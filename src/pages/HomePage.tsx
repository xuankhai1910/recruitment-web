import { HeroSearch } from "@/components/common/HeroSearch";
import { TopCompanies } from "@/components/common/TopCompanies";
import { LatestJobs } from "@/components/common/LatestJobs";

export function HomePage() {
  return (
    <>
      <HeroSearch />
      <TopCompanies />
      <LatestJobs />
    </>
  );
}
