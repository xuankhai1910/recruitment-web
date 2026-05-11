import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useRegister } from "@/hooks/useAuth";
import { rolesApi } from "@/api/roles.api";
import { companiesApi } from "@/api/companies.api";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Building2,
	Check,
	ChevronsUpDown,
	Eye,
	EyeOff,
	Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/role";
import type { Company } from "@/types/company";

/**
 * HR Register Page — đăng ký tài khoản nhà tuyển dụng.
 * Bắt buộc role = "HR" và phải chọn 1 công ty có sẵn trong hệ thống.
 * Sau khi đăng ký thành công → redirect /hr/login.
 */
export function HrRegisterPage() {
	const navigate = useNavigate();
	const register = useRegister();

	const [showPassword, setShowPassword] = useState(false);
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
		address: "",
		age: "",
		gender: "",
	});

	// Find HR role
	const [hrRoleId, setHrRoleId] = useState<string>("");
	useEffect(() => {
		rolesApi
			.getListForRegister()
			.then((r) => {
				const hr = (r.data.data as Role[]).find((role) => role.name === "HR");
				if (hr) setHrRoleId(hr._id);
				else toast.error("Hệ thống chưa cấu hình vai trò HR");
			})
			.catch(() => {
				toast.error("Không thể tải vai trò");
			});
	}, []);

	// Company picker
	const [companyOpen, setCompanyOpen] = useState(false);
	const [companyId, setCompanyId] = useState("");
	const [companyName, setCompanyName] = useState("");
	const [companySearch, setCompanySearch] = useState("");
	const [companies, setCompanies] = useState<Company[]>([]);
	const [companiesLoading, setCompaniesLoading] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setCompaniesLoading(true);
			companiesApi
				.getList({
					current: 1,
					pageSize: 20,
					...(companySearch ? { name: `/${companySearch}/i` } : {}),
				})
				.then((r) => {
					setCompanies(r.data.data.result);
				})
				.catch(() => {
					// ignore
				})
				.finally(() => {
					setCompaniesLoading(false);
				});
		}, 300);
		return () => {
			clearTimeout(timer);
		};
	}, [companySearch]);

	const canSubmit = useMemo(
		() =>
			!!form.name &&
			!!form.email &&
			!!form.password &&
			!!form.address &&
			!!form.age &&
			!!form.gender &&
			!!companyId &&
			!!hrRoleId,
		[form, companyId, hrRoleId],
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!hrRoleId) {
			toast.error("Hệ thống chưa cấu hình vai trò HR");
			return;
		}
		if (!companyId) {
			toast.error("Vui lòng chọn công ty");
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
				role: hrRoleId,
				company: { _id: companyId, name: companyName },
			},
			{
				onSuccess: () => {
					toast.success("Đăng ký thành công, vui lòng đăng nhập");
					navigate("/hr/login");
				},
				onError: (err) => {
					const msg = isAxiosError(err)
						? ((err.response?.data?.message as string) ?? "Đăng ký thất bại")
						: "Đăng ký thất bại";
					toast.error(Array.isArray(msg) ? msg[0] : msg);
				},
			},
		);
	};

	return (
		<div className="w-full max-w-lg px-4">
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
			</div>

			<Card>
				<CardHeader className="pb-3 text-center">
					<CardTitle className="font-heading text-lg">
						Đăng ký nhà tuyển dụng
					</CardTitle>
					<CardDescription>
						Tạo tài khoản để đăng tin & quản lý ứng viên
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
								onChange={(e) => setForm({ ...form, name: e.target.value })}
								required
								className="h-10"
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="reg-email">Email công ty</Label>
							<Input
								id="reg-email"
								type="email"
								placeholder="hr@company.com"
								value={form.email}
								onChange={(e) => setForm({ ...form, email: e.target.value })}
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
									onChange={(e) =>
										setForm({ ...form, password: e.target.value })
									}
									required
									minLength={6}
									maxLength={15}
									className="h-10 pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
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
									placeholder="28"
									value={form.age}
									onChange={(e) => setForm({ ...form, age: e.target.value })}
									required
									min={16}
									max={65}
									className="h-10"
								/>
							</div>
							<div className="space-y-1.5">
								<Label>Giới tính</Label>
								<Select
									value={form.gender}
									onValueChange={(v) => setForm({ ...form, gender: v })}
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
							<Label>Công ty của bạn</Label>
							<Popover open={companyOpen} onOpenChange={setCompanyOpen}>
								<PopoverTrigger asChild>
									<Button
										type="button"
										variant="outline"
										role="combobox"
										aria-expanded={companyOpen}
										className="h-11 w-full cursor-pointer justify-between font-normal"
									>
										<span
											className={cn(
												"truncate",
												!companyName && "text-muted-foreground",
											)}
										>
											{companyName || "Chọn công ty"}
										</span>
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-[var(--radix-popover-trigger-width)] p-0"
									align="start"
								>
									<Command shouldFilter={false}>
										<CommandInput
											placeholder="Tìm công ty..."
											value={companySearch}
											onValueChange={setCompanySearch}
										/>
										<CommandList>
											{companiesLoading ? (
												<div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Đang tải...
												</div>
											) : (
												<>
													<CommandEmpty>Không tìm thấy công ty</CommandEmpty>
													{companies.map((c) => (
														<CommandItem
															key={c._id}
															value={c._id}
															onSelect={() => {
																setCompanyId(c._id);
																setCompanyName(c.name);
																setCompanyOpen(false);
															}}
															className="cursor-pointer"
														>
															<Check
																className={cn(
																	"mr-2 h-4 w-4",
																	companyId === c._id
																		? "opacity-100"
																		: "opacity-0",
																)}
															/>
															<span className="truncate">{c.name}</span>
														</CommandItem>
													))}
												</>
											)}
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
							<p className="text-xs text-muted-foreground">
								Công ty phải tồn tại trong hệ thống. Liên hệ admin nếu chưa có.
							</p>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="address">Địa chỉ</Label>
							<Input
								id="address"
								placeholder="Hà Nội"
								value={form.address}
								onChange={(e) => setForm({ ...form, address: e.target.value })}
								required
								className="h-10"
							/>
						</div>

						<Button
							type="submit"
							disabled={!canSubmit || register.isPending}
							className="h-11 w-full cursor-pointer rounded-lg bg-blue-600 text-base font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
						>
							{register.isPending ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : null}
							Đăng ký nhà tuyển dụng
						</Button>
					</form>

					<div className="mt-6 text-center text-sm text-muted-foreground">
						Đã có tài khoản?{" "}
						<Link
							to="/hr/login"
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
