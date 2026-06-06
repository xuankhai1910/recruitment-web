import { Link } from "react-router-dom";
import { Bell, Briefcase, Building2, LayoutList, Sparkles } from "lucide-react";

/**
 * Shared visual shell for the HR auth pages (đăng nhập + đăng ký).
 * Bố cục 2 cột theo thiết kế HR Auth: panel thương hiệu (nền xanh nhạt) bên
 * trái + cột form bên phải, có segmented toggle chuyển Đăng nhập ↔ Đăng ký.
 * Tự ẩn panel thương hiệu trên mobile và hiện logo nhỏ trong cột form.
 */

// Shared field class strings — input bordered row with leading icon + focus ring.
export const hrFieldWrap =
  "flex h-11 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 transition-[border-color,box-shadow] focus-within:border-blue-500 focus-within:ring-[3px] focus-within:ring-blue-500/20";
export const hrFieldWrapInvalid =
  "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20";
export const hrInput =
  "min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400";
export const hrLabel = "text-sm font-medium text-slate-700";
export const hrIcon = "h-4 w-4 shrink-0 text-slate-400";

function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-blue-600 text-white">
        <Briefcase className="h-4 w-4" />
      </span>
      <span className="font-heading text-lg font-bold tracking-tight text-slate-900">
        Dev<span className="text-blue-600">Market</span>
      </span>
    </span>
  );
}

const BENEFITS = [
  {
    Icon: Briefcase,
    title: "Đăng tin không giới hạn",
    desc: "Tạo và quản lý mọi tin tuyển dụng tại một nơi",
  },
  {
    Icon: Sparkles,
    title: "AI gợi ý ứng viên",
    desc: "Tự động chấm điểm CV phù hợp với từng vị trí",
  },
  {
    Icon: LayoutList,
    title: "Quản lý ứng tuyển tập trung",
    desc: "Theo dõi hồ sơ theo từng giai đoạn tuyển dụng",
  },
  {
    Icon: Bell,
    title: "Thông báo realtime",
    desc: "Nhận tin ngay khi có ứng viên mới nộp hồ sơ",
  },
];

function BrandPanel() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-blue-50 p-12 lg:flex xl:p-16">
      {/* soft floating orb — flat tint, no gradient */}
      <span className="pointer-events-none absolute -bottom-32 -right-28 h-80 w-80 rounded-full bg-blue-100" />

      <div className="relative flex flex-col gap-6">
        <BrandLogo />

        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-800">
            <Building2 className="h-3 w-3 text-blue-600" />
            Cổng nhà tuyển dụng
          </span>
          <h1 className="max-w-[16ch] font-heading text-[clamp(2rem,3vw,2.75rem)] font-bold leading-[1.1] tracking-tight text-slate-900 text-balance">
            Tuyển dụng thông minh hơn cùng DevMarket
          </h1>
          <p className="max-w-[42ch] text-base text-slate-600">
            Tiếp cận hàng nghìn ứng viên chất lượng và để AI giúp bạn tìm đúng
            người, nhanh hơn.
          </p>
        </div>

        <div className="mt-2 flex flex-col gap-2.5">
          {BENEFITS.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white/70 px-3.5 py-3 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-blue-600 shadow-xs">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span>
                <b className="block text-sm font-semibold text-slate-900">
                  {title}
                </b>
                <span className="text-xs leading-snug text-slate-600">
                  {desc}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex gap-8 pt-10">
        <div>
          <div className="font-heading text-2xl font-bold tracking-tight text-blue-800">
            2.400+
          </div>
          <div className="text-sm text-slate-600">Doanh nghiệp tin dùng</div>
        </div>
        <div>
          <div className="font-heading text-2xl font-bold tracking-tight text-blue-800">
            180k+
          </div>
          <div className="text-sm text-slate-600">Ứng viên tiềm năng</div>
        </div>
      </div>
    </aside>
  );
}

function SegToggle({ mode }: { mode: "login" | "register" }) {
  const base =
    "rounded-full py-2 text-center text-sm font-semibold transition-colors";
  const active = "bg-white text-blue-700 shadow-sm";
  const idle = "text-slate-500 hover:text-slate-700";
  return (
    <div className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
      <Link
        to="/hr/login"
        className={`${base} ${mode === "login" ? active : idle}`}
      >
        Đăng nhập
      </Link>
      <Link
        to="/hr/register"
        className={`${base} ${mode === "register" ? active : idle}`}
      >
        Đăng ký
      </Link>
    </div>
  );
}

export function HrAuthShell({
  mode,
  children,
}: {
  mode: "login" | "register";
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
      <BrandPanel />

      <main className="flex flex-col justify-center bg-white px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-100">
          <div className="mb-8 lg:hidden">
            <BrandLogo />
          </div>

          <SegToggle mode={mode} />

          {children}
        </div>
      </main>
    </div>
  );
}

/** 4-mức thanh đo độ mạnh mật khẩu (hiển thị khi đã nhập mật khẩu). */
export function PasswordStrength({ value }: { value: string }) {
  const score = scorePassword(value);
  const meta = STRENGTH[score];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ background: i <= score ? meta.color : "#E2E8F0" }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">Độ mạnh mật khẩu</span>
        <span className="font-semibold" style={{ color: meta.color }}>
          {meta.label}
        </span>
      </div>
    </div>
  );
}

function scorePassword(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length < 6) s = Math.min(s, 1);
  return Math.min(s, 4);
}

const STRENGTH = [
  { label: "", color: "#E2E8F0" },
  { label: "Yếu", color: "#EF4444" },
  { label: "Trung bình", color: "#F59E0B" },
  { label: "Khá", color: "#3B82F6" },
  { label: "Mạnh", color: "#10B981" },
];
