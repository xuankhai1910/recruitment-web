import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "@/hooks/useAuth";
import {
	ArrowRight,
	Briefcase,
	CheckCircle2,
	Eye,
	EyeOff,
	Lock,
	Mail,
} from "lucide-react";

const fieldWrap =
	"flex h-11 items-center gap-2.5 rounded-lg border-[1.5px] border-line bg-white px-3.5 transition-colors focus-within:border-ink";
const inputCls =
	"min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400";

export function LoginPage() {
	const navigate = useNavigate();
	const login = useLogin();
	const [showPassword, setShowPassword] = useState(false);
	const [form, setForm] = useState({ username: "", password: "" });

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		login.mutate(form, { onSuccess: () => navigate("/") });
	};

	return (
		<div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
			<div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-16 text-white lg:flex">
				<span className="pointer-events-none absolute -bottom-30 -right-30 h-100 w-100 rounded-full bg-teal-500/12" />
				<div className="relative">
					<span className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-teal-400">
						<Briefcase className="h-5 w-5" />
					</span>
					<h1 className="mt-10 max-w-[480px] font-display text-[clamp(40px,5vw,64px)] font-bold leading-none tracking-[-0.035em] text-white">
						Chào mừng <em className="italic text-teal-400">trở lại,</em>
						<br />
						tiếp tục hành trình
					</h1>
					<p className="mt-5 max-w-[440px] text-base leading-relaxed text-white/65">
						Đăng nhập để tiếp tục tìm kiếm việc làm phù hợp với bạn qua
						JobFinder.
					</p>
					<ul className="mt-10 flex flex-col gap-3.5">
						{[
							"Gợi ý việc làm bằng AI dựa trên kỹ năng của bạn",
							"Theo dõi trạng thái đơn ứng tuyển",
							"Tạo CV chuyên nghiệp trong vài phút",
						].map((t) => (
							<li key={t} className="flex gap-3 text-[15px] text-white/85">
								<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-400" />
								{t}
							</li>
						))}
					</ul>
				</div>
				<div className="relative font-mono-jb text-[13px] uppercase tracking-[0.1em] text-white/40">
					JobFinder · v2026
				</div>
			</div>

			<div className="flex flex-col justify-center bg-cream px-6 py-16 sm:px-12">
				<div className="mx-auto w-full max-w-[400px]">
					<h2 className="mb-2 font-display text-[32px] font-bold tracking-tight text-ink">
						Đăng nhập
					</h2>
					<p className="mb-8 text-[15px] text-slate-600">
						Đăng nhập để tiếp tục tìm kiếm việc làm phù hợp với bạn.
					</p>

					<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
						<div className="flex flex-col gap-1.5">
							<label className="text-[13px] font-medium text-ink">Email</label>
							<div className={fieldWrap}>
								<Mail className="h-4 w-4 shrink-0 text-slate-400" />
								<input
									type="email"
									placeholder="you@example.com"
									value={form.username}
									onChange={(e) => setForm({ ...form, username: e.target.value })}
									required
									className={inputCls}
								/>
							</div>
						</div>
						<div className="flex flex-col gap-1.5">
							<label className="text-[13px] font-medium text-ink">Mật khẩu</label>
							<div className={fieldWrap}>
								<Lock className="h-4 w-4 shrink-0 text-slate-400" />
								<input
									type={showPassword ? "text" : "password"}
									placeholder="6 - 15 ký tự"
									value={form.password}
									onChange={(e) => setForm({ ...form, password: e.target.value })}
									required
									className={inputCls}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="grid place-items-center text-slate-400"
									aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
							<div className="flex justify-end">
								<Link
									to="/forgot-password"
									className="text-xs font-medium text-teal-700 hover:underline"
								>
									Quên mật khẩu?
								</Link>
							</div>
						</div>
						<button
							type="submit"
							disabled={login.isPending}
							className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
						>
							{login.isPending ? (
								<span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
							) : (
								<>
									Đăng nhập
									<ArrowRight className="h-[18px] w-[18px]" />
								</>
							)}
						</button>
					</form>

					<p className="mt-7 text-center text-sm text-slate-600">
						Chưa có tài khoản?{" "}
						<Link to="/register" className="font-semibold text-ink hover:underline">
							Đăng ký miễn phí
						</Link>
					</p>
					<p className="mt-3 text-center text-sm text-slate-600">
						Bạn là nhà tuyển dụng?{" "}
						<Link to="/hr/login" className="font-semibold text-ink hover:underline">
							Đăng nhập tại đây
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
