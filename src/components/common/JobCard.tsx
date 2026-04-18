import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, Building2, Clock, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { Job } from "@/types/job";
import { formatSalaryCompact, companyLogoUrl } from "@/lib/format";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Link to={`/jobs/${job._id}`} className="block">
      <Card className="group cursor-pointer border border-border/60 transition-all duration-200 hover:border-primary/30 hover:bg-accent/30">
        <CardContent className="flex gap-4 p-5">
          {job.company?.logo ? (
            <img
              src={companyLogoUrl(job.company.logo)}
              alt={job.company.name}
              className="h-14 w-14 shrink-0 rounded-lg object-contain"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Building2 className="h-7 w-7 text-primary/60" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="line-clamp-1 font-heading text-base font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
                  {job.name}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                  {job.company?.name}
                </p>
              </div>
              <span className="shrink-0 rounded-lg bg-[#22C55E]/10 px-3 py-1 font-heading text-sm font-bold text-[#16A34A]">
                {formatSalaryCompact(job.salary)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1 font-normal">
                <MapPin className="h-3 w-3" />
                {job.location}
              </Badge>
              <Badge variant="secondary" className="gap-1 font-normal">
                <Banknote className="h-3 w-3" />
                {job.level}
              </Badge>
              {job.skills?.slice(0, 3).map((s) => (
                <Badge key={s} variant="outline" className="font-normal">
                  {s}
                </Badge>
              ))}
              <span className="ml-auto hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(job.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
