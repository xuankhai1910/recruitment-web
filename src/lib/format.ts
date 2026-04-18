export function formatSalaryCompact(salary: number): string {
  if (!salary) return "Thỏa thuận";
  if (salary >= 1_000_000) {
    return `${(salary / 1_000_000).toFixed(0)}M`;
  }
  if (salary >= 1_000) {
    return `${(salary / 1_000).toFixed(0)}K`;
  }
  return salary.toString();
}

export function companyLogoUrl(logo?: string): string {
  if (!logo) return "";
  return logo.startsWith("http")
    ? logo
    : `${import.meta.env.VITE_STATIC_URL}/images/company/${logo}`;
}

export function resumeFileUrl(file: string): string {
  if (!file) return "";
  return file.startsWith("http")
    ? file
    : `${import.meta.env.VITE_STATIC_URL}/images/resume/${file}`;
}
