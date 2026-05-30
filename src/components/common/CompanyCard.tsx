import { Link } from "react-router-dom";
import type { Company } from "@/types/company";
import { companyLogoUrl } from "@/lib/format";
import { brandColor, brandShort } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { useJobCount } from "@/hooks/useJobs";

interface CompanyCardProps {
	company: Company;
	/** Optional count of open positions to show in the stats row. */
	openings?: number;
	/** "carousel" gives the card a fixed width for horizontal scrollers. */
	variant?: "grid" | "carousel";
}

export function CompanyCard({
	company,
	openings,
	variant = "grid",
}: CompanyCardProps) {
	const logoSrc = companyLogoUrl(company.logo);
	const shouldFetchOpenings = typeof openings !== "number";
	const { data: fetchedOpenings } = useJobCount(
		{
			sort: "-createdAt",
			isActive: true,
			"company._id": company._id,
		},
		shouldFetchOpenings,
	);
	const totalOpenings = openings ?? fetchedOpenings ?? 0;

	return (
		<Link
			to={`/companies/${company._id}`}
			className={cn(
				"group flex flex-col gap-4 rounded-xl border border-[#E5E5DF] bg-white p-6 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:border-[#0A0F1A] hover:shadow-[0_16px_32px_-16px_rgba(0,0,0,0.18)]",
				variant === "carousel" && "w-[280px] shrink-0",
			)}
		>
			<div className="flex items-center gap-[14px]">
				{logoSrc ? (
					<div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg">
						<img
							src={logoSrc}
							alt={company.name}
							className="h-full w-full bg-white object-contain"
						/>
					</div>
				) : (
					<div
						className="grid h-14 w-14 shrink-0 place-items-center rounded-lg font-display text-base font-bold text-white"
						style={{ background: brandColor(company.name) }}
					>
						{brandShort(company.name)}
					</div>
				)}
				<div className="min-w-0 flex-1">
					<div className="jf-co-name truncate font-display text-[17px] font-semibold tracking-[-0.01em] text-[#0A0F1A]">
						{company.name}
					</div>
					<div className="mt-0.5 truncate text-xs text-[#475569]">
						{company.address || "Chưa cập nhật"}
					</div>
				</div>
			</div>
			<div className="border-t border-[#EFEFE9] pt-4">
				<div className="flex items-baseline gap-2">
					<span className="font-display text-lg font-bold tracking-[-0.01em] text-[#14B8A6]">
						{totalOpenings}
					</span>
					<span className="text-[11px] font-medium text-[#94A3B8]">
						Việc đang tuyển
					</span>
				</div>
			</div>
		</Link>
	);
}
