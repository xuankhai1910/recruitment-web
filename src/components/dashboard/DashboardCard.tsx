import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardCardProps {
  title?: string;
  /** Optional "see more" link label shown top-right. */
  linkLabel?: string;
  /** Route for the link label. */
  linkTo?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** Titled dashboard panel built on the shared Card primitive. */
export function DashboardCard({
  title,
  linkLabel,
  linkTo,
  children,
  className,
  bodyClassName,
}: DashboardCardProps) {
  return (
    <Card className={`gap-0 py-0 ${className ?? ""}`}>
      <CardContent className={`p-5 ${bodyClassName ?? ""}`}>
        {(title || linkLabel) && (
          <div className="mb-4 flex items-center justify-between">
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {linkLabel && linkTo && (
              <Link
                to={linkTo}
                className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
              >
                {linkLabel}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
