import type { JobSalary, JobYearsOfExperience } from "@/types/job";

function formatVnd(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const formatted = Number.isInteger(millions)
      ? millions.toString()
      : millions.toFixed(1);
    return `${formatted}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toString();
}

/**
 * Job salary stored as `{ min?, max?, isNegotiable, currency }`. Render rules:
 *  - isNegotiable=true → "Thỏa thuận" regardless of min/max
 *  - both min & max → "10M - 20M VND"
 *  - only min → "Từ 10M VND"
 *  - only max → "Đến 20M VND"
 *  - neither → "Thỏa thuận" (fallback)
 */
export function formatJobSalary(salary?: JobSalary | null): string {
  if (!salary || salary.isNegotiable) return "Thỏa thuận";
  const { min, max, currency = "VND" } = salary;
  const hasMin = typeof min === "number" && min > 0;
  const hasMax = typeof max === "number" && max > 0;
  if (hasMin && hasMax) {
    return `${formatVnd(min!)} - ${formatVnd(max!)} ${currency}`;
  }
  if (hasMin) return `Từ ${formatVnd(min!)} ${currency}`;
  if (hasMax) return `Đến ${formatVnd(max!)} ${currency}`;
  return "Thỏa thuận";
}

/** Format years-of-experience range, returns empty string when nothing to show. */
export function formatYearsOfExperience(
  yoe?: JobYearsOfExperience | null,
): string {
  if (!yoe) return "";
  const { min, max } = yoe;
  const hasMin = typeof min === "number";
  const hasMax = typeof max === "number";
  if (hasMin && hasMax) return `${min} - ${max} năm KN`;
  if (hasMin) return `Từ ${min} năm KN`;
  if (hasMax) return `Đến ${max} năm KN`;
  return "";
}

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

export function formatSalaryFull(salary: number): string {
  if (!salary) return "Thỏa thuận";
  if (salary >= 1_000_000) {
    const millions = salary / 1_000_000;
    const formatted = Number.isInteger(millions)
      ? millions.toString()
      : millions.toFixed(1);
    return `${formatted}M VND`;
  }
  return `${salary.toLocaleString("vi-VN")} đ`;
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

/**
 * Backend stores uploaded files as `{unixTimestamp}_{originalFilename}`.
 * This helper strips the numeric timestamp prefix to recover the original name.
 */
export function extractOriginalFileName(storedName: string): string {
  if (!storedName) return "";
  // Drop any path segments just in case
  const base = storedName.split(/[\\/]/).pop() ?? storedName;
  // Remove leading "<digits>_" prefix (e.g. "1729500000_cv.pdf" -> "cv.pdf")
  return base.replace(/^\d+_/, "");
}
