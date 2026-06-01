import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import {
	HrAuthShell,
	hrFieldWrap,
	hrIcon,
	hrInput,
	hrLabel,
} from "@/components/hr/HrAuthShell";
import { Eye, EyeOff, Loader2, LogIn, Mail, Lock } from "lucide-react";

/**
 * HR Login Page — dùng route /hr/login.
 * Sau khi đăng nhập, nếu role = HR → /hr.
 * Nếu role = SUPER_ADMIN → /hr (cho phép admin hỗ trợ HR).
 * Nếu role khác → toast cảnh báo + logout.
 */
export function HrLoginPage() {
	const navigate = useNavigate();
	const setAuth = useAuthStore((s) => s.setAuth);
	const clearAuth = useAuthStore((s) => s.clearAuth);

	const [showPassword, setShowPassword] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [form, setForm] = useState({ username: "", password: "" });

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			const res = await authApi.login(form);
			const { access_token, user } = res.data.data;
			const role = user.role?.name;

			if (role !== "HR" && role !== "SUPER_ADMIN") {
				// Không cho phép login vào cổng HR — clear + báo lỗi.
				clearAuth();
				toast.error("Tài khoản này không phải là nhà tuyển dụng");
				return;
			}

			if (role === "HR" && !user.company?._id) {
				clearAuth();
				toast.error(
					"Tài khoản HR chưa được gắn công ty. Vui lòng liên hệ quản trị viên.",
				);
				return;
			}

			setAuth(user, access_token);
			toast.success("Đăng nhập thành công");
			navigate("/hr", { replace: true });
		} catch (err) {
			const msg = isAxiosError(err)
				? ((err.response?.data?.message as string) ?? "Đăng nhập thất bại")
				: "Đăng nhập thất bại";
			toast.error(Array.isArray(msg) ? msg[0] : msg);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<HrAuthShell mode="login">
			<div className="mb-6">
				<h2 className="font-heading text-2xl font-bold text-slate-900">
					Chào mừng trở lại
				</h2>
				<p className="mt-1.5 text-sm text-slate-600">
					Đăng nhập để tiếp tục quản lý tuyển dụng của bạn.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<label htmlFor="email" className={hrLabel}>
						Email công ty
					</label>
					<div className={hrFieldWrap}>
						<Mail className={hrIcon} />
						<input
							id="email"
							type="email"
							placeholder="hr@company.com"
							value={form.username}
							onChange={(e) => {
								setForm({ ...form, username: e.target.value });
							}}
							required
							className={hrInput}
						/>
					</div>
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center justify-between">
						<label htmlFor="password" className={hrLabel}>
							Mật khẩu
						</label>
						<Link
							to="/forgot-password"
							className="text-xs font-medium text-blue-600 hover:text-blue-700"
						>
							Quên mật khẩu?
						</Link>
					</div>
					<div className={hrFieldWrap}>
						<Lock className={hrIcon} />
						<input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder="6-15 ký tự"
							value={form.password}
							onChange={(e) => {
								setForm({ ...form, password: e.target.value });
							}}
							required
							className={hrInput}
						/>
						<button
							type="button"
							onClick={() => {
								setShowPassword(!showPassword);
							}}
							className="grid cursor-pointer place-items-center text-slate-400 transition-colors hover:text-slate-600"
							aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
						>
							{showPassword ? (
								<EyeOff className="h-4.5 w-4.5" />
							) : (
								<Eye className="h-4.5 w-4.5" />
							)}
						</button>
					</div>
				</div>

				<button
					type="submit"
					disabled={submitting}
					className="mt-1 inline-flex h-12 cursor-pointer items-center justify-center gap-2.5 rounded-lg bg-blue-600 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
				>
					{submitting ? (
						<>
							<Loader2 className="h-4.5 w-4.5 animate-spin" />
							Đang đăng nhập...
						</>
					) : (
						<>
							<LogIn className="h-4.5 w-4.5" />
							Đăng nhập
						</>
					)}
				</button>
			</form>

			<p className="mt-5 text-center text-sm text-slate-600">
				Bạn là người tìm việc?{" "}
				<Link
					to="/login"
					className="font-semibold text-blue-600 hover:text-blue-700"
				>
					Đăng nhập tại đây
				</Link>
			</p>
		</HrAuthShell>
	);
}
