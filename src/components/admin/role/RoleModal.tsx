import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { permissionsApi } from "@/api/permissions.api";
import { rolesApi } from "@/api/roles.api";
import { colorMethodBg } from "@/lib/constants";
import type { Permission } from "@/types/permission";
import type { CreateRoleDto } from "@/types/role";

const roleSchema = z.object({
	name: z.string().min(1, "Tên vai trò không được để trống"),
	description: z.string(),
	isActive: z.boolean(),
	permissions: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 quyền"),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	roleId: string | null;
}

export function RoleModal({ open, onOpenChange, roleId }: RoleModalProps) {
	const isEdit = !!roleId;
	const qc = useQueryClient();
	const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

	const form = useForm<RoleFormValues>({
		resolver: zodResolver(roleSchema),
		defaultValues: {
			name: "",
			description: "",
			isActive: true,
			permissions: [],
		},
	});

	const checkedIds = new Set(form.watch("permissions"));

	// Fetch all permissions
	const { data: permData } = useQuery({
		queryKey: ["permissions", "all"],
		queryFn: () =>
			permissionsApi
				.getList({ current: 1, pageSize: 100 })
				.then((r) => r.data.data),
		enabled: open,
	});

	const allPermissions = permData?.result ?? [];

	// Group by module
	const grouped = useMemo(() => {
		const map = new Map<string, Permission[]>();
		for (const p of allPermissions) {
			const list = map.get(p.module) ?? [];
			list.push(p);
			map.set(p.module, list);
		}
		return map;
	}, [allPermissions]);

	// Fetch role for editing
	const { data: role, isLoading: fetchingRole } = useQuery({
		queryKey: ["roles", roleId],
		queryFn: () => rolesApi.getById(roleId ?? "").then((r) => r.data.data),
		enabled: !!roleId && open,
	});

	useEffect(() => {
		if (open) {
			if (role) {
				const ids = role.permissions.map((p) =>
					typeof p === "string" ? p : p._id,
				);
				form.reset({
					name: role.name,
					description: role.description,
					isActive: role.isActive,
					permissions: ids,
				});
			} else if (!roleId) {
				form.reset({
					name: "",
					description: "",
					isActive: true,
					permissions: [],
				});
			}
		}
	}, [role, roleId, open, form]);

	const togglePermission = (id: string) => {
		const current = form.getValues("permissions");
		if (current.includes(id)) {
			form.setValue(
				"permissions",
				current.filter((x) => x !== id),
				{ shouldValidate: true },
			);
		} else {
			form.setValue("permissions", [...current, id], { shouldValidate: true });
		}
	};

	const toggleModule = (module: string) => {
		const perms = grouped.get(module) ?? [];
		const current = form.getValues("permissions");
		const currentSet = new Set(current);
		const allChecked = perms.every((p) => currentSet.has(p._id));

		let next: string[];
		if (allChecked) {
			const moduleIds = new Set(perms.map((p) => p._id));
			next = current.filter((id) => !moduleIds.has(id));
		} else {
			const moduleIds = perms.map((p) => p._id);
			next = [...new Set([...current, ...moduleIds])];
		}
		form.setValue("permissions", next, { shouldValidate: true });
	};

	const toggleCollapse = (module: string) => {
		setCollapsed((prev) => {
			const next = new Set(prev);
			if (next.has(module)) next.delete(module);
			else next.add(module);
			return next;
		});
	};

	const createMutation = useMutation({
		mutationFn: (data: CreateRoleDto) => rolesApi.create(data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["roles"] });
			toast.success("Tạo vai trò thành công");
			onOpenChange(false);
		},
	});

	const updateMutation = useMutation({
		mutationFn: (data: Partial<CreateRoleDto>) =>
			rolesApi.update(roleId ?? "", data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["roles"] });
			toast.success("Cập nhật thành công");
			onOpenChange(false);
		},
	});

	const submitting = createMutation.isPending || updateMutation.isPending;

	const onSubmit = (values: RoleFormValues) => {
		if (isEdit) {
			updateMutation.mutate(values);
		} else {
			createMutation.mutate(values);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Chỉnh sửa vai trò" : "Tạo mới vai trò"}
					</DialogTitle>
				</DialogHeader>

				{isEdit && fetchingRole ? (
					<div className="flex items-center justify-center py-10">
						<Loader2 className="h-6 w-6 animate-spin text-sky-700" />
					</div>
				) : (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Tên vai trò <span className="text-destructive">*</span>
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
								name="isActive"
								render={({ field }) => (
									<FormItem>
										<button
											type="button"
											className="flex items-center gap-2 cursor-pointer select-none"
											onClick={() => {
												field.onChange(!field.value);
											}}
										>
											<Checkbox checked={field.value} tabIndex={-1} />
											<span className="text-sm">Active</span>
										</button>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Mô tả</FormLabel>
										<FormControl>
											<Textarea rows={3} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Separator />

							{/* Permissions grouped by module */}
							<FormField
								control={form.control}
								name="permissions"
								render={() => (
									<FormItem>
										<FormLabel>
											Quyền hạn <span className="text-destructive">*</span>
										</FormLabel>
										<div className="space-y-3">
											{Array.from(grouped.entries()).map(([module, perms]) => {
												const allChecked = perms.every((p) =>
													checkedIds.has(p._id),
												);
												const someChecked = perms.some((p) =>
													checkedIds.has(p._id),
												);
												const isCollapsed = collapsed.has(module);

												return (
													<div
														key={module}
														className="rounded-lg border border-border/60"
													>
														{/* Module header */}
														<button
															type="button"
															className="flex w-full items-center gap-2 px-3 py-2.5 bg-muted/40 cursor-pointer select-none"
															onClick={() => {
																toggleCollapse(module);
															}}
														>
															{isCollapsed ? (
																<ChevronRight className="h-4 w-4 text-muted-foreground" />
															) : (
																<ChevronDown className="h-4 w-4 text-muted-foreground" />
															)}
															<Checkbox
																checked={
																	allChecked
																		? true
																		: someChecked
																			? "indeterminate"
																			: false
																}
																onCheckedChange={() => {
																	toggleModule(module);
																}}
																onClick={(e) => {
																	e.stopPropagation();
																}}
															/>
															<span className="text-sm font-semibold">
																{module}
															</span>
															<span className="text-xs text-muted-foreground">
																(
																{
																	perms.filter((p) => checkedIds.has(p._id))
																		.length
																}
																/{perms.length})
															</span>
														</button>
														{!isCollapsed && (
															<div className="divide-y divide-border/40">
																{perms.map((perm) => (
																	<button
																		type="button"
																		key={perm._id}
																		className="flex w-full items-center gap-3 px-4 py-2 cursor-pointer hover:bg-accent/30 transition-colors duration-150"
																		onClick={() => {
																			togglePermission(perm._id);
																		}}
																	>
																		<Checkbox
																			checked={checkedIds.has(perm._id)}
																			tabIndex={-1}
																		/>
																		<span className="text-sm flex-1 text-left">
																			{perm.name}
																		</span>
																		<Badge
																			variant="outline"
																			className={`font-mono text-[10px] ${colorMethodBg(perm.method)}`}
																		>
																			{perm.method}
																		</Badge>
																		<code className="text-[11px] text-muted-foreground">
																			{perm.apiPath}
																		</code>
																	</button>
																))}
															</div>
														)}
													</div>
												);
											})}
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

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
				)}
			</DialogContent>
		</Dialog>
	);
}
