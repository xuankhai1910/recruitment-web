import { Link } from "react-router-dom";
import { Building2, MapPin } from "lucide-react";
import type { Company } from "@/types/company";
import { companyLogoUrl } from "@/lib/format";

interface CompanyCardProps {
	company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
	const logoSrc = companyLogoUrl(company.logo);

	return (
		<Link
			to={`/companies/${company._id}`}
			className="group flex w-72 shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
		>
			{logoSrc ? (
				<img
					src={logoSrc}
					alt={company.name}
					className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1"
				/>
			) : (
				<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
					<Building2 className="h-6 w-6 text-slate-400" />
				</div>
			)}
			<div className="min-w-0 flex-1">
				<h3 className="line-clamp-1 text-sm font-semibold text-slate-900 transition-colors duration-150 group-hover:text-blue-600">
					{company.name}
				</h3>
				<p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
					<MapPin className="h-3 w-3 shrink-0" />
					<span className="line-clamp-1">
						{company.address || "Chưa cập nhật"}
					</span>
				</p>
			</div>
		</Link>
	);
}
