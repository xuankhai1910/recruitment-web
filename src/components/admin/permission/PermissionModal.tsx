import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { permissionsApi } from "@/api/permissions.api";
import { ALL_MODULES } from "@/lib/permissions";
import type { Permission, CreatePermissionDto } from "@/types/permission";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

const permissionSchema = z.object({
	name: z.string().min(1, "Tên permission không được để trống"),
	apiPath: z.string().min(1, "API path không được để trống"),
	method: z.string().min(1, "Vui lòng chọn method"),
	module: z.string().min(1, "Vui lòng chọn module"),
});

type PermissionFormValues = z.infer<typeof permissionSchema>;

interface PermissionModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	permission: Permission | null;
}

export function PermissionModal({
	open,
	onOpenChange,
	permission,
}: PermissionModalProps) {
	const isEdit = !!permission;
	const qc = useQueryClient();

	const form = useForm<PermissionFormValues>({
		resolver: zodResolver(permissionSchema),
		defaultValues: {
			name: "",
			apiPath: "",
			method: "GET",
			module: "",
		},
	});

	useEffect(() => {
		if (open) {
			if (permission) {
				form.reset({
					name: permission.name,
					apiPath: permission.apiPath,
					method: permission.method,
					module: permission.module,
				});
			} else {
				form.reset({ name: "", apiPath: "", method: "GET", module: "" });
			}
		}
	}, [permission, open, form]);

	const createMutation = useMutation({
		mutationFn: (data: CreatePermissionDto) => permissionsApi.create(data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["permissions"] });
			toast.success("Tạo permission thành công");
			onOpenChange(false);
		},
	});

	const updateMutation = useMutation({
		mutationFn: (data: Partial<CreatePermissionDto>) =>
			permissionsApi.update(permission?._id ?? "", data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["permissions"] });
			toast.success("Cập nhật thành công");
			onOpenChange(false);
		},
	});

	const submitting = createMutation.isPending || updateMutation.isPending;

	const onSubmit = (values: PermissionFormValues) => {
		if (isEdit) {
			updateMutation.mutate(values);
		} else {
			createMutation.mutate(values);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Chỉnh sửa Permission" : "Tạo mới Permission"}
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Tên <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="apiPath"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										API Path <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="method"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Method <span className="text-destructive">*</span>
										</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger className="cursor-pointer">
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{METHODS.map((m) => (
													<SelectItem
														key={m}
														value={m}
														className="cursor-pointer"
													>
														{m}
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
								name="module"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Module <span className="text-destructive">*</span>
										</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger className="cursor-pointer">
													<SelectValue placeholder="Chọn module" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{ALL_MODULES.map((m) => (
													<SelectItem
														key={m}
														value={m}
														className="cursor-pointer"
													>
														{m}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="flex justify-end gap-2 pt-2">
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
								type="submit"
								disabled={submitting}
								className="cursor-pointer bg-sky-700 hover:bg-sky-800 transition-colors duration-150"
							>
								{submitting && (
									<Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
								)}
								{isEdit ? "Cập nhật" : "Tạo mới"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
