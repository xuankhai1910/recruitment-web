import { useEffect, useRef } from "react";
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
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { Loader2, Upload, X } from "lucide-react";
import { useCreateCompany, useUpdateCompany } from "@/hooks/useCompanies";
import { useUploadFile } from "@/hooks/useFiles";
import type { Company } from "@/types/company";

const companySchema = z.object({
	name: z.string().min(1, "Tên công ty không được để trống"),
	address: z.string().min(1, "Địa chỉ không được để trống"),
	logo: z.string().min(1, "Vui lòng upload logo"),
	description: z.string().min(1, "Mô tả không được để trống"),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	company: Company | null;
}

export function CompanyModal({
	open,
	onOpenChange,
	company,
}: CompanyModalProps) {
	const isEdit = !!company;
	const fileInputRef = useRef<HTMLInputElement>(null);

	const createCompany = useCreateCompany();
	const updateCompany = useUpdateCompany();
	const uploadFile = useUploadFile();

	const isSubmitting = createCompany.isPending || updateCompany.isPending;

	const form = useForm<CompanyFormValues>({
		resolver: zodResolver(companySchema),
		defaultValues: {
			name: "",
			address: "",
			logo: "",
			description: "",
		},
	});

	const logoValue = form.watch("logo");

	useEffect(() => {
		if (open) {
			form.reset({
				name: company?.name ?? "",
				address: company?.address ?? "",
				logo: company?.logo ?? "",
				description: company?.description ?? "",
			});
		}
	}, [open, company, form]);

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
			// error toast handled by useUploadFile
		}
		e.target.value = "";
	};

	const onSubmit = async (values: CompanyFormValues) => {
		try {
			if (isEdit) {
				await updateCompany.mutateAsync({
					id: company._id,
					data: values,
				});
			} else {
				await createCompany.mutateAsync(values);
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

	const logoSrc = logoValue
		? logoValue.startsWith("http")
			? logoValue
			: `${import.meta.env.VITE_STATIC_URL}/images/company/${logoValue}`
		: "";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Cập nhật công ty" : "Tạo mới công ty"}
					</DialogTitle>
				</DialogHeader>

				<Separator />

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex-1 space-y-4 overflow-y-auto pr-1"
					>
						{/* Name */}
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

						{/* Logo + Address — 2 columns */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr]">
							{/* Logo */}
							<FormField
								control={form.control}
								name="logo"
								render={() => (
									<FormItem>
										<FormLabel>
											Ảnh Logo <span className="text-destructive">*</span>
										</FormLabel>
										<div className="flex items-start gap-3">
											{logoSrc ? (
												<div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border">
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
												className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors duration-150 hover:border-primary hover:text-primary"
												disabled={uploadFile.isPending}
												onClick={() => {
													fileInputRef.current?.click();
												}}
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

							{/* Address */}
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

						{/* Description — Rich Text */}
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Miêu tả</FormLabel>
									<RichTextEditor
										value={field.value}
										onChange={field.onChange}
										placeholder="Nhập mô tả công ty..."
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>

				<Separator />

				{/* Actions — fixed at bottom */}
				<div className="flex justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						className="cursor-pointer transition-colors duration-150"
						onClick={() => {
							onOpenChange(false);
						}}
					>
						Hủy
					</Button>
					<Button
						type="submit"
						className="cursor-pointer bg-primary transition-colors duration-150 hover:bg-primary/90"
						disabled={isSubmitting}
						onClick={form.handleSubmit(onSubmit)}
					>
						{isSubmitting && (
							<Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
						)}
						{isEdit ? "Cập nhật" : "Tạo mới"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
