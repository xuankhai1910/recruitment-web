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
