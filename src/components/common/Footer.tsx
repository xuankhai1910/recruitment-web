import { Link } from "react-router-dom";

function FooterBrandMark() {
  return (
    <img src="/logo.png" alt="DevMarket" className="h-9 w-9 object-contain" />
  );
}

export function Footer() {
  return (
    <footer className="mt-16 bg-ink text-white">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-12 px-7 pb-8 pt-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5">
            <FooterBrandMark />
            <span className="font-display text-[19px] font-bold tracking-tight text-white">
              DevMarket
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-white/65">
            Nền tảng tuyển dụng dành cho ứng viên Việt Nam. Tìm công việc phù
            hợp với hệ thống gợi ý AI và hồ sơ kỹ năng cá nhân.
          </p>
        </div>
        <FooterCol
          title="Ứng viên"
          links={[
            { to: "/jobs", label: "Tìm việc làm" },
            { to: "/companies", label: "Khám phá công ty" },
            { to: "/account/cv-builder", label: "Tạo CV" },
            { to: "/account/saved-jobs", label: "Việc đã lưu" },
          ]}
        />
        <FooterCol
          title="Tài khoản"
          links={[
            { to: "/profile", label: "Hồ sơ" },
            { to: "/account/resumes", label: "Đơn ứng tuyển" },
          ]}
        />
      </div>
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 border-t border-white/10 px-7 py-5 text-xs text-white/50">
        <div>© {new Date().getFullYear()} DevMarket Vietnam</div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 font-mono-jb text-xs font-bold uppercase tracking-[0.12em] text-teal-400">
        {title}
      </h4>
      {links.map((l, i) => (
        <Link
          key={`${l.to}-${i}`}
          to={l.to}
          className="block py-1.5 text-sm text-white/70 transition-colors hover:text-white"
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
