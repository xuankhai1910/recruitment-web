import { Briefcase, Calculator } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
	return (
		<footer className="border-t border-border bg-card">
			<div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-6 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
				<Link
					to="/"
					className="flex cursor-pointer items-center gap-2 transition-opacity duration-200 hover:opacity-80"
				>
					<div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
						<Briefcase className="h-3.5 w-3.5 text-primary-foreground" />
					</div>
					<span className="font-heading text-sm font-bold text-foreground">
						Job<span className="text-primary">Finder</span>
					</span>
				</Link>

				<nav className="flex flex-wrap items-center gap-4 text-xs">
					<Link
						to="/tools/salary-calculator"
						className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
					>
						<Calculator className="h-3.5 w-3.5" />
						Tính lương Gross/Net
					</Link>
				</nav>

				<p className="text-xs text-muted-foreground">
					&copy; {new Date().getFullYear()} JobFinder. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
