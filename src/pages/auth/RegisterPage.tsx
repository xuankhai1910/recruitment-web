import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRegister } from "@/hooks/useAuth";
import { rolesApi } from "@/api/roles.api";
import {
	ArrowRight,
	Briefcase,
	CheckCircle2,
	Eye,
	EyeOff,
	Lock,
	Mail,
	MapPin,
	User,
} from "lucide-react";
import type { Role } from "@/types/role";

const fieldWrap =
	"flex h-11 items-center gap-2.5 rounded-lg border-[1.5px] border-line bg-white px-3.5 transition-colors focus-within:border-ink";
const inputCls =
	"min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400";

export function RegisterPage() {
	const navigate = useNavigate();
	const register = useRegister();
	const [showPassword, setShowPassword] = useState(false);
	const [normalUserRoleId, setNormalUserRoleId] = useState("");
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
		address: "",
		age: "",
		gender: "",
	});

	useEffect(() => {
		rolesApi
			.getListForRegister()
			.then((r) => {
				const normalUser = (r.data.data as Role[]).find(
					(role) => role.name === "NORMAL_USER",
				);
				if (normalUser) setNormalUserRoleId(normalUser._id);
				else toast.error("Hệ thống chưa cấu hình vai trò người dùng");
			})
			.catch(() => toast.error("Không thể tải vai trò"));
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!normalUserRoleId) {
			toast.error("Hệ thống chưa cấu hình vai trò người dùng");
			return;
		}
		register.mutate(
			{
				name: form.name,
				email: form.email,
				password: form.password,
				address: form.address,
				age: Number(form.age),
				gender: form.gender,
				role: normalUserRoleId,
			},
			{ onSuccess: () => navigate("/login") },
		);
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
						Bắt đầu <em className="italic text-teal-400">sự nghiệp mới</em>
						<br />
						cùng JobFinder
					</h1>
					<p className="mt-5 max-w-[440px] text-base leading-relaxed text-white/65">
						Tạo tài khoản miễn phí, hoàn thành hồ sơ và nhận gợi ý việc làm phù
						hợp ngay lập tức.
					</p>
					<ul className="mt-10 flex flex-col gap-3.5">
						{[
							"Truy cập kho việc làm chất lượng",
							"Hồ sơ kỹ năng cá nhân + AI match",
							"Miễn phí, không quảng cáo",
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
						Tạo tài khoản
					</h2>
					<p className="mb-8 text-[15px] text-slate-600">
						Đăng ký để bắt đầu tìm kiếm việc làm phù hợp với bạn.
					</p>

					<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
						<div className="flex flex-col gap-1.5">
							<label className="text-[13px] font-medium text-ink">Họ và tên</label>
							<div className={fieldWrap}>
								<User className="h-4 w-4 shrink-0 text-slate-400" />
								<input
									type="text"
									placeholder="Nguyễn Văn A"
									value={form.name}
									onChange={(e) => setForm({ ...form, name: e.target.value })}
									required
									className={inputCls}
								/>
							</div>
						</div>
						<div className="flex flex-col gap-1.5">
							<label className="text-[13px] font-medium text-ink">Email</label>
							<div className={fieldWrap}>
								<Mail className="h-4 w-4 shrink-0 text-slate-400" />
								<input
									type="email"
									placeholder="you@example.com"
									value={form.email}
									onChange={(e) => setForm({ ...form, email: e.target.value })}
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
									minLength={6}
									maxLength={15}
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
							<p className="text-xs text-slate-400">
								Sử dụng tối thiểu 6 ký tự, gồm chữ và số.
							</p>
						</div>

						<div className="grid grid-cols-2 gap-3.5">
							<div className="flex flex-col gap-1.5">
								<label className="text-[13px] font-medium text-ink">Tuổi</label>
								<div className={fieldWrap}>
									<input
										type="number"
										placeholder="25"
										value={form.age}
										onChange={(e) => setForm({ ...form, age: e.target.value })}
										required
										min={16}
										max={65}
										className={inputCls}
									/>
								</div>
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-[13px] font-medium text-ink">Giới tính</label>
								<div className={fieldWrap}>
									<select
										value={form.gender}
										onChange={(e) => setForm({ ...form, gender: e.target.value })}
										required
										className={inputCls + " cursor-pointer"}
									>
										<option value="" disabled>
											Chọn
										</option>
										<option value="MALE">Nam</option>
										<option value="FEMALE">Nữ</option>
										<option value="OTHER">Khác</option>
									</select>
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="text-[13px] font-medium text-ink">Địa chỉ</label>
							<div className={fieldWrap}>
								<MapPin className="h-4 w-4 shrink-0 text-slate-400" />
								<input
									type="text"
									placeholder="Hà Nội"
									value={form.address}
									onChange={(e) => setForm({ ...form, address: e.target.value })}
									required
									className={inputCls}
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={register.isPending}
							className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
						>
							{register.isPending ? (
								<span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
							) : (
								<>
									Tạo tài khoản
									<ArrowRight className="h-[18px] w-[18px]" />
								</>
							)}
						</button>
					</form>

					<p className="mt-7 text-center text-sm text-slate-600">
						Đã có tài khoản?{" "}
						<Link to="/login" className="font-semibold text-ink hover:underline">
							Đăng nhập
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
