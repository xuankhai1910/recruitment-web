import { Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <Link
            to="/"
            className="flex cursor-pointer items-center gap-2 transition-opacity duration-200 hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-foreground">
              Job<span className="text-primary">Finder</span>
            </span>
          </Link>
          
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} JobFinder
          </p>
        </div>
      </div>
    </footer>
  );
}
