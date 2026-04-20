import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import { rolesApi } from "@/api/roles.api";
import { companiesApi } from "@/api/companies.api";
import type { User } from "@/types/user";
import type { Role } from "@/types/role";
import type { Company } from "@/types/company";

const userCreateSchema = z.object({
	email: z.string().email("Email không hợp lệ"),
	password: z
		.string()
		.min(6, "Mật khẩu ít nhất 6 ký tự")
		.max(15, "Mật khẩu tối đa 15 ký tự"),
	name: z.string().min(1, "Tên không được để trống"),
	age: z.number().min(1, "Tuổi phải >= 1").max(100, "Tuổi phải <= 100"),
	gender: z.string().min(1, "Vui lòng chọn giới tính"),
	roleId: z.string().min(1, "Vui lòng chọn vai trò"),
	companyId: z.string(),
	address: z.string().min(1, "Địa chỉ không được để trống"),
});

const userEditSchema = z.object({
	email: z.string().email("Email không hợp lệ"),
	password: z.string(),
	name: z.string().min(1, "Tên không được để trống"),
	age: z.number().min(1, "Tuổi phải >= 1").max(100, "Tuổi phải <= 100"),
	gender: z.string().min(1, "Vui lòng chọn giới tính"),
	roleId: z.string().min(1, "Vui lòng chọn vai trò"),
	companyId: z.string(),
	address: z.string().min(1, "Địa chỉ không được để trống"),
});

type UserFormValues = z.infer<typeof userCreateSchema>;

interface UserModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User | null;
}

export function UserModal({ open, onOpenChange, user }: UserModalProps) {
	const isEdit = !!user;
	const createMutation = useCreateUser();
	const updateMutation = useUpdateUser();
	const loading = createMutation.isPending || updateMutation.isPending;

	// Dropdown data
	const [roles, setRoles] = useState<Role[]>([]);
	const [companies, setCompanies] = useState<Company[]>([]);

	const form = useForm<UserFormValues>({
		resolver: zodResolver(isEdit ? userEditSchema : userCreateSchema),
		defaultValues: {
			email: "",
			password: "",
			name: "",
			age: 0,
			gender: "MALE",
			roleId: "",
			companyId: "",
			address: "",
		},
	});

	// Fetch roles + companies when modal opens
	useEffect(() => {
		if (open) {
			rolesApi.getList({ current: 1, pageSize: 100 }).then((r) => {
				setRoles(r.data.data.result);
			});
			companiesApi.getList({ current: 1, pageSize: 100 }).then((r) => {
				setCompanies(r.data.data.result);
			});
		}
	}, [open]);

	// Reset form
	useEffect(() => {
		if (open) {
			if (user) {
				form.reset({
					email: user.email,
					password: "",
					name: user.name,
					age: user.age,
					gender: user.gender,
					roleId: user.role?._id ?? "",
					companyId: user.company?._id ?? "",
					address: user.address,
				});
			} else {
				form.reset({
					email: "",
					password: "",
					name: "",
					age: 0,
					gender: "MALE",
					roleId: "",
					companyId: "",
					address: "",
				});
			}
		}
	}, [open, user, form]);

	const onSubmit = async (values: UserFormValues) => {
		const selectedCompany = companies.find((c) => c._id === values.companyId);
		const company = selectedCompany
			? { _id: selectedCompany._id, name: selectedCompany.name }
			: undefined;

		try {
			if (isEdit) {
				await updateMutation.mutateAsync({
					id: user._id,
					data: {
						name: values.name,
						age: values.age,
						gender: values.gender,
						role: values.roleId,
						company,
						address: values.address,
					},
				});
			} else {
				await createMutation.mutateAsync({
					email: values.email,
					password: values.password,
					name: values.name,
					age: values.age,
					gender: values.gender,
					role: values.roleId,
					company,
					address: values.address,
				});
			}
			onOpenChange(false);
		} catch (error) {
			const msg =
				isAxiosError(error) && error.response?.data?.message
					? error.response.data.message
					: "Đã xảy ra lỗi, vui lòng thử lại";
			toast.error(msg);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Cập nhật người dùng" : "Tạo người dùng mới"}
					</DialogTitle>
				</DialogHeader>

				<Separator />

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex-1 overflow-y-auto pr-1"
					>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
							{/* Email — full width */}
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem className="sm:col-span-6">
										<FormLabel>
											Email <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="user@example.com"
												disabled={isEdit}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Password — full width, only on create */}
							{!isEdit && (
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem className="sm:col-span-6">
											<FormLabel>
												Mật khẩu <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="6-15 ký tự"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{/* Name */}
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem className="sm:col-span-3">
										<FormLabel>
											Tên hiển thị <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input placeholder="Nguyễn Văn A" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Age */}
							<FormField
								control={form.control}
								name="age"
								render={({ field }) => (
									<FormItem className="sm:col-span-3">
										<FormLabel>
											Tuổi <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={1}
												max={100}
												{...field}
												onChange={(e) => field.onChange(e.target.valueAsNumber)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Gender + Role + Company — 3 columns same row */}
							<FormField
								control={form.control}
								name="gender"
								render={({ field }) => (
									<FormItem className="sm:col-span-2">
										<FormLabel>
											Giới tính <span className="text-destructive">*</span>
										</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger className="cursor-pointer">
													<SelectValue />
												</SelectTrigger>
											</FormControl>
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
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="roleId"
								render={({ field }) => (
									<FormItem className="sm:col-span-2">
										<FormLabel>
											Vai trò <span className="text-destructive">*</span>
										</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger className="cursor-pointer">
													<SelectValue placeholder="Chọn vai trò" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{roles.map((r) => (
													<SelectItem
														key={r._id}
														value={r._id}
														className="cursor-pointer"
													>
														{r.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="companyId"
								render={({ field }) => (
									<FormItem className="sm:col-span-2">
										<FormLabel>Thuộc công ty</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger className="cursor-pointer">
													<SelectValue placeholder="Chọn công ty" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{companies.map((c) => (
													<SelectItem
														key={c._id}
														value={c._id}
														className="cursor-pointer"
													>
														{c.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Address — full width */}
							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem className="sm:col-span-6">
										<FormLabel>
											Địa chỉ <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input placeholder="Hà Nội" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</form>
				</Form>

				<Separator />

				<div className="flex justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						className="cursor-pointer"
						onClick={() => {
							onOpenChange(false);
						}}
					>
						Hủy
					</Button>
					<Button
						className="cursor-pointer bg-primary hover:bg-primary/90"
						disabled={loading}
						onClick={form.handleSubmit(onSubmit)}
					>
						{loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
						{isEdit ? "Cập nhật" : "Tạo mới"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
