import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import type { Company } from "@/types/company";
import { companyLogoUrl } from "@/lib/format";
import { brandColor, brandShort } from "@/lib/brand";
import { cn } from "@/lib/utils";

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

	return (
		<Link
			to={`/companies/${company._id}`}
			className={cn(
				"flex flex-col gap-4 rounded-xl border border-line bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-[0_16px_32px_-16px_rgba(0,0,0,0.18)]",
				variant === "carousel" && "w-[280px] shrink-0",
			)}
		>
			<div className="flex items-center gap-3.5">
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
					<div className="truncate font-display text-[17px] font-semibold tracking-tight text-ink">
						{company.name}
					</div>
					<div className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-600">
						<MapPin className="h-3 w-3 shrink-0" />
						<span className="truncate">{company.address || "Chưa cập nhật"}</span>
					</div>
				</div>
			</div>
			{typeof openings === "number" && (
				<div className="flex gap-5 border-t border-line-soft pt-4">
					<div>
						<div className="font-display text-lg font-bold tracking-tight text-teal-500">
							{openings}
						</div>
						<div className="text-[11px] text-slate-400">Việc đang tuyển</div>
					</div>
				</div>
			)}
		</Link>
	);
}
