import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Loader2, Mail, Phone, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { useAuthStore } from "@/stores/auth.store";
import { useCompany, useUpdateCompany } from "@/hooks/useCompanies";
import { useUploadFile } from "@/hooks/useFiles";

const schema = z.object({
	name: z.string().min(1, "Tên công ty không được để trống"),
	address: z.string().min(1, "Địa chỉ không được để trống"),
	logo: z.string().min(1, "Vui lòng upload logo"),
	description: z.string().min(1, "Mô tả không được để trống"),
	email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
	phone: z
		.string()
		.regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ")
		.optional()
		.or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

/**
 * HR Company Profile — cho phép HR chỉnh sửa thông tin của chính công ty mình.
 */
export function HrCompanyPage() {
	const user = useAuthStore((s) => s.user);
	const companyId = user?.company?._id ?? "";

	const fileInputRef = useRef<HTMLInputElement>(null);
	const { data: company, isLoading } = useCompany(companyId);
	const updateCompany = useUpdateCompany();
	const uploadFile = useUploadFile();

	const form = useForm<FormValues>({
		resolver: zodResolver(schema) as Resolver<FormValues>,
		defaultValues: {
			name: "",
			address: "",
			logo: "",
			description: "",
			email: "",
			phone: "",
		},
	});

	const logoValue = form.watch("logo");

	useEffect(() => {
		if (company) {
			form.reset({
				name: company.name ?? "",
				address: company.address ?? "",
				logo: company.logo ?? "",
				description: company.description ?? "",
				email: company.email ?? "",
				phone: company.phone ?? "",
			});
		}
	}, [company, form]);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			const result = await uploadFile.mutateAsync({
				file,
				folderType: "company",
			});
			form.setValue("logo", result.fileName, { shouldValidate: true });
		} catch {
			/* handled */
		}
		e.target.value = "";
	};

	const onSubmit = async (values: FormValues) => {
		if (!companyId) return;
		try {
			await updateCompany.mutateAsync({ id: companyId, data: values });
			toast.success("Cập nhật thông tin công ty thành công");
		} catch (error) {
			const msg =
				isAxiosError(error) && error.response?.data?.message
					? error.response.data.message
					: "Đã xảy ra lỗi, vui lòng thử lại";
			toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
		}
	};

	const logoSrc = logoValue
		? logoValue.startsWith("http")
			? logoValue
			: `${import.meta.env.VITE_STATIC_URL}/images/company/${logoValue}`
		: "";

	if (!companyId) {
		return (
			<Card>
				<CardContent className="py-16 text-center text-sm text-muted-foreground">
					Tài khoản của bạn chưa được gắn với công ty nào.
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Hồ sơ công ty</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Cập nhật thông tin hiển thị công khai của công ty bạn
				</p>
			</div>

			{isLoading ? (
				<Card>
					<CardContent className="space-y-4 p-6">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-40 w-full" />
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardContent className="p-6">
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-5"
							>
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Tên công ty <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<Input placeholder="Nhập tên công ty" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr]">
									<FormField
										control={form.control}
										name="logo"
										render={() => (
											<FormItem>
												<FormLabel>
													Logo <span className="text-destructive">*</span>
												</FormLabel>
												<div className="flex items-start gap-3">
													{logoSrc ? (
														<div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border">
															<img
																src={logoSrc}
																alt="Logo preview"
																className="h-full w-full object-contain"
															/>
															<button
																type="button"
																className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-destructive text-white transition-opacity duration-150 hover:opacity-80"
																onClick={() => {
																	form.setValue("logo", "", {
																		shouldValidate: true,
																	});
																}}
															>
																<X className="h-3 w-3" />
															</button>
														</div>
													) : null}
													<button
														type="button"
														className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors duration-150 hover:border-primary hover:text-primary"
														disabled={uploadFile.isPending}
														onClick={() => fileInputRef.current?.click()}
													>
														{uploadFile.isPending ? (
															<Loader2 className="h-5 w-5 animate-spin" />
														) : (
															<Upload className="h-5 w-5" />
														)}
														<span className="text-xs">Upload</span>
													</button>
													<input
														ref={fileInputRef}
														type="file"
														accept="image/jpeg,image/png"
														className="hidden"
														onChange={handleFileChange}
													/>
												</div>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="address"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>
													Địa chỉ <span className="text-destructive">*</span>
												</FormLabel>
												<FormControl>
													<Input placeholder="Nhập địa chỉ" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email liên hệ</FormLabel>
												<FormControl>
													<div className="relative">
														<Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
														<Input
															placeholder="contact@company.com"
															className="pl-9"
															{...field}
														/>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Số điện thoại</FormLabel>
												<FormControl>
													<div className="relative">
														<Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
														<Input
															placeholder="0912345678"
															className="pl-9"
															{...field}
														/>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Mô tả công ty{" "}
												<span className="text-destructive">*</span>
											</FormLabel>
											<RichTextEditor
												value={field.value}
												onChange={field.onChange}
												placeholder="Giới thiệu về công ty, văn hoá, sản phẩm..."
											/>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Separator />

								<div className="flex justify-end gap-2">
									<Button
										type="submit"
										disabled={updateCompany.isPending}
										className="cursor-pointer"
									>
										{updateCompany.isPending && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										Lưu thay đổi
									</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
