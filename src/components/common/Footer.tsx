import { Briefcase, Calculator } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
	return (
		<footer className="border-t border-slate-200 bg-white">
			<div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
				<Link
					to="/"
					className="flex cursor-pointer items-center gap-2 transition-opacity duration-200 hover:opacity-80"
				>
					<Briefcase className="h-4 w-4 text-blue-600" />
					<span className="text-sm font-bold text-slate-900">
						Job<span className="text-blue-600">Finder</span>
					</span>
				</Link>

				<nav className="flex flex-wrap items-center gap-4 text-xs">
					<Link
						to="/tools/salary-calculator"
						className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-blue-600"
					>
						<Calculator className="h-3.5 w-3.5" />
						Tính lương Gross/Net
					</Link>
				</nav>

				<p className="text-xs text-slate-400">
					&copy; {new Date().getFullYear()} JobFinder. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
