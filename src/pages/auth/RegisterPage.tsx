import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRegister } from "@/hooks/useAuth";
import { rolesApi } from "@/api/roles.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Briefcase, Eye, EyeOff, Loader2 } from "lucide-react";
import type { Role } from "@/types/role";

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
				if (normalUser) {
					setNormalUserRoleId(normalUser._id);
				} else {
					toast.error("Hệ thống chưa cấu hình vai trò người dùng");
				}
			})
			.catch(() => {
				toast.error("Không thể tải vai trò");
			});
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
			{
				onSuccess: () => {
					navigate("/login");
				},
			},
		);
	};

	return (
		<div className="w-full max-w-lg px-4">
			<div className="mb-6 flex flex-col items-center">
				<Briefcase className="mb-3 h-8 w-8 text-blue-600" />
				<h1 className="font-heading text-xl font-bold text-foreground">
					Job<span className="text-blue-600">Finder</span>
				</h1>
			</div>

			<Card>
				<CardHeader className="pb-3 text-center">
					<CardTitle className="font-heading text-lg">Tạo tài khoản</CardTitle>
					<CardDescription>
						Đăng ký để bắt đầu tìm kiếm việc làm
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-3.5">
						<div className="space-y-1.5">
							<Label htmlFor="name">Họ và tên</Label>
							<Input
								id="name"
								placeholder="Nguyễn Văn A"
								value={form.name}
								onChange={(e) => {
									setForm({ ...form, name: e.target.value });
								}}
								required
								className="h-10"
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="reg-email">Email</Label>
							<Input
								id="reg-email"
								type="email"
								placeholder="you@example.com"
								value={form.email}
								onChange={(e) => {
									setForm({ ...form, email: e.target.value });
								}}
								required
								className="h-10"
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="reg-password">Mật khẩu</Label>
							<div className="relative">
								<Input
									id="reg-password"
									type={showPassword ? "text" : "password"}
									placeholder="6-15 ký tự"
									value={form.password}
									onChange={(e) => {
										setForm({ ...form, password: e.target.value });
									}}
									required
									minLength={6}
									maxLength={15}
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
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label htmlFor="age">Tuổi</Label>
								<Input
									id="age"
									type="number"
									placeholder="25"
									value={form.age}
									onChange={(e) => {
										setForm({ ...form, age: e.target.value });
									}}
									required
									min={16}
									max={65}
									className="h-11"
								/>
							</div>
							<div className="space-y-1.5">
								<Label>Giới tính</Label>
								<Select
									value={form.gender}
									onValueChange={(v) => {
										setForm({ ...form, gender: v });
									}}
									required
								>
									<SelectTrigger className="!h-11 w-full cursor-pointer">
										<SelectValue placeholder="Chọn" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="MALE" className="cursor-pointer">
											Nam
										</SelectItem>
										<SelectItem value="FEMALE" className="cursor-pointer">
											Nữ
										</SelectItem>
										<SelectItem value="OTHER" className="cursor-pointer">
											Khác
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="address">Địa chỉ</Label>
							<Input
								id="address"
								placeholder="Hà Nội"
								value={form.address}
								onChange={(e) => {
									setForm({ ...form, address: e.target.value });
								}}
								required
								className="h-10"
							/>
						</div>

						<Button
							type="submit"
							disabled={register.isPending}
							className="h-11 w-full cursor-pointer rounded-lg bg-blue-600 text-base font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
						>
							{register.isPending ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : null}
							Đăng ký
						</Button>
					</form>

					<div className="mt-6 text-center text-sm text-muted-foreground">
						Đã có tài khoản?{" "}
						<Link
							to="/login"
							className="cursor-pointer font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700"
						>
							Đăng nhập
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
