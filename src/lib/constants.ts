export const SKILLS_LIST = [
  "React.JS",
  "React Native",
  "Vue.JS",
  "Angular",
  "Nest.JS",
  "TypeScript",
  "Java",
  "Frontend",
  "Backend",
  "Fullstack",
] as const;

export const LEVEL_LIST = [
  "INTERN",
  "FRESHER",
  "JUNIOR",
  "MIDDLE",
  "SENIOR",
] as const;

export const SALARY_RANGES = [
  { key: "all", label: "Tất cả", min: undefined, max: undefined },
  { key: "under-10", label: "Dưới 10 triệu", min: undefined, max: 10_000_000 },
  { key: "10-20", label: "10 - 20 triệu", min: 10_000_000, max: 20_000_000 },
  { key: "20-30", label: "20 - 30 triệu", min: 20_000_000, max: 30_000_000 },
  { key: "30-50", label: "30 - 50 triệu", min: 30_000_000, max: 50_000_000 },
  { key: "over-50", label: "Trên 50 triệu", min: 50_000_000, max: undefined },
] as const;

export const STATUS_LIST = [
  "PENDING",
  "REVIEWING",
  "APPROVED",
  "REJECTED",
] as const;

export function colorMethod(method: string): string {
  switch (method.toUpperCase()) {
    case "GET":
      return "text-blue-600";
    case "POST":
      return "text-green-600";
    case "PUT":
    case "PATCH":
      return "text-orange-500";
    case "DELETE":
      return "text-red-600";
    default:
      return "text-gray-500";
  }
}

export function colorMethodBg(method: string): string {
  switch (method.toUpperCase()) {
    case "GET":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "POST":
      return "bg-green-50 text-green-700 border-green-200";
    case "PUT":
    case "PATCH":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "DELETE":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export function formatSalary(salary: number): string {
  return new Intl.NumberFormat("vi-VN").format(salary) + " đ";
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
