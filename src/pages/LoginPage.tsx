import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "@/hooks/useAuth";
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
import { Briefcase, Eye, EyeOff, Loader2 } from "lucide-react";

export function LoginPage() {
	const navigate = useNavigate();
	const login = useLogin();
	const [showPassword, setShowPassword] = useState(false);
	const [form, setForm] = useState({ username: "", password: "" });

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		login.mutate(form, {
			onSuccess: () => {
				navigate("/");
			},
		});
	};

	return (
		<div className="w-full max-w-sm px-4">
			{/* Logo */}
			<div className="mb-6 flex flex-col items-center">
				<Briefcase className="mb-3 h-8 w-8 text-blue-600" />
				<h1 className="font-heading text-xl font-bold text-foreground">
					Job<span className="text-blue-600">Finder</span>
				</h1>
			</div>

			<Card>
				<CardHeader className="pb-3 text-center">
					<CardTitle className="font-heading text-lg">
						Chào mừng trở lại
					</CardTitle>
					<CardDescription>
						Đăng nhập để tiếp tục tìm kiếm việc làm
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-3.5">
						<div className="space-y-1.5">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
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
							disabled={login.isPending}
							className="h-10 w-full cursor-pointer rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700"
						>
							{login.isPending ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : null}
							Đăng nhập
						</Button>
					</form>

					<div className="mt-5 text-center text-sm text-muted-foreground">
						Chưa có tài khoản?{" "}
						<Link
							to="/register"
							className="cursor-pointer font-semibold text-blue-600 transition-colors duration-150 hover:text-blue-700"
						>
							Đăng ký ngay
						</Link>
					</div>
				</CardContent>
			</Card>

			{/* HR recruiter CTA */}
			<div className="mt-4 text-center text-sm text-muted-foreground">
				Bạn là nhà tuyển dụng?{" "}
				<Link
					to="/hr/login"
					className="font-semibold text-blue-600 hover:text-blue-700"
				>
					Đăng nhập tại đây
				</Link>
			</div>
		</div>
	);
}
