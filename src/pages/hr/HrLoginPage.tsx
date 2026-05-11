import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Building2, Eye, EyeOff, Loader2 } from "lucide-react";

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
		<div className="w-full max-w-sm px-4">
			{/* Logo */}
			<div className="mb-6 flex flex-col items-center">
				<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
					<Building2 className="h-6 w-6" />
				</div>
				<h1 className="font-heading text-xl font-bold text-foreground">
					Job<span className="text-blue-600">Finder</span>{" "}
					<span className="text-sm font-medium text-muted-foreground">
						· HR
					</span>
				</h1>
				<p className="mt-1 text-xs text-muted-foreground">
					Cổng dành cho nhà tuyển dụng
				</p>
			</div>

			<Card>
				<CardHeader className="pb-3 text-center">
					<CardTitle className="font-heading text-lg">
						Đăng nhập nhà tuyển dụng
					</CardTitle>
					<CardDescription>
						Quản lý tin tuyển dụng & hồ sơ ứng viên
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-3.5">
						<div className="space-y-1.5">
							<Label htmlFor="email">Email công ty</Label>
							<Input
								id="email"
								type="email"
								placeholder="hr@company.com"
								value={form.username}
								onChange={(e) => {
									setForm({ ...form, username: e.target.value });
								}}
								required
								className="h-10"
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="password">Mật khẩu</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="6-15 ký tự"
									value={form.password}
									onChange={(e) => {
										setForm({ ...form, password: e.target.value });
									}}
									required
									className="h-10 pr-10"
								/>
								<button
									type="button"
									onClick={() => {
										setShowPassword(!showPassword);
									}}
									className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors duration-150 hover:text-foreground"
									aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
							<div className="text-right">
								<Link
									to="/forgot-password"
									className="text-xs font-medium text-blue-600 hover:text-blue-700"
								>
									Quên mật khẩu?
								</Link>
							</div>
						</div>

						<Button
							type="submit"
							disabled={submitting}
							className="h-10 w-full cursor-pointer rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700"
						>
							{submitting ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : null}
							Đăng nhập
						</Button>
					</form>

					<div className="mt-5 text-center text-sm text-muted-foreground">
						Chưa có tài khoản?{" "}
						<Link
							to="/hr/register"
							className="cursor-pointer font-semibold text-blue-600 transition-colors duration-150 hover:text-blue-700"
						>
							Đăng ký nhà tuyển dụng
						</Link>
					</div>
				</CardContent>
			</Card>

			<div className="mt-4 text-center text-sm text-muted-foreground">
				Bạn là người tìm việc?{" "}
				<Link
					to="/login"
					className="font-semibold text-blue-600 hover:text-blue-700"
				>
					Đăng nhập tại đây
				</Link>
			</div>
		</div>
	);
}
