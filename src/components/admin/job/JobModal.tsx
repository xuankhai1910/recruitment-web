import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
import { RichTextEditor } from "@/components/common/RichTextEditor";
import {
	useCreateJob,
	useJob,
	useJobTaxonomy,
	useUpdateJob,
} from "@/hooks/useJobs";
import { useCompaniesDropdown } from "@/hooks/useCompanies";
import { LOCATIONS } from "@/lib/locations";
import { useCurrentUser } from "@/stores/auth.store";
import type { CreateJobDto, Job } from "@/types/job";

const jobSchema = z
	.object({
		name: z.string().min(1, "Tên công việc không được để trống"),
		category: z.string().min(1, "Vui lòng chọn nghề"),
		specialization: z.string().min(1, "Vui lòng chọn vị trí chuyên môn"),
		skills: z.array(z.string()).min(1, "Chọn ít nhất 1 kỹ năng"),
		location: z.string().min(1, "Vui lòng chọn địa điểm"),
		salaryNegotiable: z.boolean(),
		salaryMin: z
			.union([z.number(), z.nan()])
			.optional()
			.transform((v) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined)),
		salaryMax: z
			.union([z.number(), z.nan()])
			.optional()
			.transform((v) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined)),
		quantity: z.number().min(1, "Số lượng phải >= 1"),
		level: z.string().min(1, "Vui lòng chọn cấp bậc"),
		jobType: z.string().min(1, "Vui lòng chọn loại hình"),
		workMode: z.string().min(1, "Vui lòng chọn hình thức làm việc"),
		yoeMin: z
			.union([z.number(), z.nan()])
			.optional()
			.transform((v) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined)),
		yoeMax: z
			.union([z.number(), z.nan()])
			.optional()
			.transform((v) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined)),
		benefits: z.string(),
		requirements: z.string(),
		responsibilities: z.string(),
		companyId: z.string().min(1, "Vui lòng chọn công ty"),
		startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
		endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
		isActive: z.boolean(),
		description: z.string().min(1, "Mô tả không được để trống"),
	})
	.superRefine((data, ctx) => {
		if (!data.salaryNegotiable) {
			const hasMin = typeof data.salaryMin === "number" && data.salaryMin >= 0;
			const hasMax = typeof data.salaryMax === "number" && data.salaryMax >= 0;
			if (!hasMin && !hasMax) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["salaryMin"],
					message:
						'Vui lòng nhập mức lương min/max hoặc bật "Thỏa thuận"',
				});
			}
			if (
				hasMin &&
				hasMax &&
				(data.salaryMin as number) > (data.salaryMax as number)
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["salaryMax"],
					message: "Lương tối đa phải >= lương tối thiểu",
				});
			}
		}
		if (
			typeof data.yoeMin === "number" &&
			typeof data.yoeMax === "number" &&
			data.yoeMin > data.yoeMax
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["yoeMax"],
				message: "Năm KN tối đa phải >= tối thiểu",
			});
		}
	});

type JobFormValues = z.input<typeof jobSchema>;

interface JobModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	job: Job | null;
}

function linesToList(text: string): string[] {
	return text
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

export function JobModal({ open, onOpenChange, job }: JobModalProps) {
	const isEdit = !!job;
	const currentUser = useCurrentUser();
	const isAdmin = currentUser?.role.name === "SUPER_ADMIN";
	const createJob = useCreateJob();
	const updateJob = useUpdateJob();
	const { data: companiesData } = useCompaniesDropdown(open);
	const { data: taxonomy } = useJobTaxonomy();
	// List endpoint strips benefits/requirements/responsibilities to keep payload
	// small; refetch the full job by id so the edit form can hydrate them.
	const { data: fullJob } = useJob(open && job?._id ? job._id : "");

	const companies = useMemo(() => companiesData?.result ?? [], [companiesData]);
	const categories = taxonomy?.categories ?? [];
	const specMap = taxonomy?.specializationsByCategory ?? {};
	const levels = taxonomy?.levels ?? [];
	const jobTypes = taxonomy?.jobTypes ?? [];
	const workModes = taxonomy?.workModes ?? [];

	const [skillsInput, setSkillsInput] = useState("");

	const form = useForm<JobFormValues>({
		resolver: zodResolver(jobSchema),
		defaultValues: {
			name: "",
			category: "",
			specialization: "",
			skills: [],
			location: "",
			salaryNegotiable: false,
			salaryMin: undefined,
			salaryMax: undefined,
			quantity: 1,
			level: "",
			jobType: "Full-time",
			workMode: "Onsite",
			yoeMin: undefined,
			yoeMax: undefined,
			benefits: "",
			requirements: "",
			responsibilities: "",
			companyId: "",
			startDate: "",
			endDate: "",
			isActive: true,
			description: "",
		},
	});

	const watchedCategory = form.watch("category");
	const watchedNegotiable = form.watch("salaryNegotiable");
	const specializations = useMemo(
		() => specMap[watchedCategory] ?? [],
		[specMap, watchedCategory],
	);

	useEffect(() => {
		if (open) {
			if (job) {
				// Prefer full-detail fetch (has benefits/requirements/responsibilities);
				// fall back to row data while the request is in flight.
				const source = fullJob ?? job;
				form.reset({
					name: source.name,
					category: source.category ?? "",
					specialization: source.specialization ?? "",
					skills: source.skills,
					location: source.location,
					salaryNegotiable: !!source.salary?.isNegotiable,
					salaryMin: source.salary?.min,
					salaryMax: source.salary?.max,
					quantity: source.quantity,
					level: source.level,
					jobType: source.jobType || "Full-time",
					workMode: source.workMode || "Onsite",
					yoeMin: source.yearsOfExperience?.min,
					yoeMax: source.yearsOfExperience?.max,
					benefits: (source.benefits ?? []).join("\n"),
					requirements: (source.requirements ?? []).join("\n"),
					responsibilities: (source.responsibilities ?? []).join("\n"),
					companyId: source.company._id,
					startDate: source.startDate?.slice(0, 10) ?? "",
					endDate: source.endDate?.slice(0, 10) ?? "",
					isActive: source.isActive,
					description: source.description,
				});
				setSkillsInput(source.skills.join(", "));
			} else {
				form.reset({
					name: "",
					category: "",
					specialization: "",
					skills: [],
					location: "",
					salaryNegotiable: false,
					salaryMin: undefined,
					salaryMax: undefined,
					quantity: 1,
					level: "",
					jobType: "Full-time",
					workMode: "Onsite",
					yoeMin: undefined,
					yoeMax: undefined,
					benefits: "",
					requirements: "",
					responsibilities: "",
					companyId: !isAdmin ? (currentUser?.company?._id ?? "") : "",
					startDate: "",
					endDate: "",
					isActive: true,
					description: "",
				});
				setSkillsInput("");
			}
		}
	}, [open, job, fullJob, form, isAdmin, currentUser?.company?._id]);

	const submitting = createJob.isPending || updateJob.isPending;

	const onSubmit = async (values: JobFormValues) => {
		const company = companies.find((c) => c._id === values.companyId);
		if (!company) return;

		const salary: CreateJobDto["salary"] = {
			isNegotiable: values.salaryNegotiable,
			...(values.salaryNegotiable
				? {}
				: {
						min:
							typeof values.salaryMin === "number"
								? values.salaryMin
								: undefined,
						max:
							typeof values.salaryMax === "number"
								? values.salaryMax
								: undefined,
					}),
		};

		const yoeMin = typeof values.yoeMin === "number" ? values.yoeMin : undefined;
		const yoeMax = typeof values.yoeMax === "number" ? values.yoeMax : undefined;

		const payload: CreateJobDto = {
			name: values.name,
			category: values.category,
			specialization: values.specialization,
			skills: values.skills,
			location: values.location,
			salary,
			quantity: values.quantity,
			level: values.level,
			jobType: values.jobType,
			workMode: values.workMode,
			yearsOfExperience:
				yoeMin !== undefined || yoeMax !== undefined
					? { min: yoeMin, max: yoeMax }
					: undefined,
			benefits: linesToList(values.benefits),
			requirements: linesToList(values.requirements),
			responsibilities: linesToList(values.responsibilities),
			company: {
				_id: company._id,
				name: company.name,
				logo: company.logo,
				email: company.email,
				phone: company.phone,
			},
			startDate: values.startDate,
			endDate: values.endDate,
			isActive: values.isActive,
			description: values.description,
		};

		try {
			if (isEdit) {
				await updateJob.mutateAsync({ id: job._id, data: payload });
			} else {
				await createJob.mutateAsync(payload);
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
			<DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Cập nhật công việc" : "Tạo công việc mới"}
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
										Tên công việc <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<Input placeholder="Nhập tên công việc" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Category + Specialization */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Nghề <span className="text-destructive">*</span>
										</FormLabel>
										<Select
											value={field.value}
											onValueChange={(v) => {
												field.onChange(v);
												// Reset specialization when category changes
												form.setValue("specialization", "");
											}}
										>
											<FormControl>
												<SelectTrigger className="cursor-pointer">
													<SelectValue placeholder="Chọn nghề" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{categories.map((cat) => (
													<SelectItem
														key={cat}
														value={cat}
														className="cursor-pointer"
													>
														{cat}
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
								name="specialization"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Vị trí chuyên môn{" "}
											<span className="text-destructive">*</span>
										</FormLabel>
										<Select
											value={field.value}
											onValueChange={field.onChange}
											disabled={!watchedCategory}
										>
											<FormControl>
												<SelectTrigger
													className={
														watchedCategory
															? "cursor-pointer"
															: "cursor-not-allowed opacity-70"
													}
												>
													<SelectValue
														placeholder={
															watchedCategory
																? "Chọn vị trí chuyên môn"
																: "Chọn nghề trước"
														}
													/>
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{specializations.map((s) => (
													<SelectItem
														key={s}
														value={s}
														className="cursor-pointer"
													>
														{s}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Skills */}
						<FormField
							control={form.control}
							name="skills"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Kỹ năng yêu cầu{" "}
										<span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<Input
											placeholder="VD: React, Node.js, Java"
											value={skillsInput}
											onChange={(e) => {
												const raw = e.target.value;
												setSkillsInput(raw);
												const parsed = raw
													.split(",")
													.map((s) => s.trim())
													.filter(Boolean);
												field.onChange(parsed);
											}}
											onBlur={() => {
												setSkillsInput(field.value.join(", "));
											}}
										/>
									</FormControl>
									<p className="text-xs text-muted-foreground">
										Nhập kỹ năng, ngăn cách bằng dấu phẩy.
									</p>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Location + Level */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="location"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Địa điểm <span className="text-destructive">*</span>
										</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger className="cursor-pointer">
													<SelectValue placeholder="Chọn địa điểm" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{LOCATIONS.filter((l) => l !== "Tất cả thành phố").map(
													(loc) => (
														<SelectItem
															key={loc}
															value={loc}
															className="cursor-pointer"
														>
															{loc}
														</SelectItem>
													),
												)}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="level"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Cấp bậc <span className="text-destructive">*</span>
										</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger className="cursor-pointer">
													<SelectValue placeholder="Chọn cấp bậc" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{levels.map((lv) => (
													<SelectItem
														key={lv}
														value={lv}
														className="cursor-pointer"
													>
														{lv}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* JobType + WorkMode */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="jobType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Loại hình <span className="text-destructive">*</span>
										</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger className="cursor-pointer">
													<SelectValue placeholder="Loại hình" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{jobTypes.map((jt) => (
													<SelectItem
														key={jt}
														value={jt}
														className="cursor-pointer"
													>
														{jt}
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
								name="workMode"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Hình thức làm việc{" "}
											<span className="text-destructive">*</span>
										</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger className="cursor-pointer">
													<SelectValue placeholder="Onsite/Remote/Hybrid" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{workModes.map((wm) => (
													<SelectItem
														key={wm}
														value={wm}
														className="cursor-pointer"
													>
														{wm}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Salary block */}
						<div className="rounded-md border border-slate-200 p-3 space-y-3">
							<div className="flex items-center justify-between">
								<FormLabel className="text-sm font-medium">Mức lương</FormLabel>
								<FormField
									control={form.control}
									name="salaryNegotiable"
									render={({ field }) => (
										<label className="flex cursor-pointer items-center gap-2 text-sm">
											<Checkbox
												checked={!!field.value}
												onCheckedChange={(v) => field.onChange(!!v)}
											/>
											<span>Thỏa thuận</span>
										</label>
									)}
								/>
							</div>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<FormField
									control={form.control}
									name="salaryMin"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs text-muted-foreground">
												Tối thiểu (VND)
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={0}
													disabled={watchedNegotiable}
													value={
														typeof field.value === "number" ? field.value : ""
													}
													onChange={(e) =>
														field.onChange(
															e.target.value === ""
																? undefined
																: e.target.valueAsNumber,
														)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="salaryMax"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs text-muted-foreground">
												Tối đa (VND)
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={0}
													disabled={watchedNegotiable}
													value={
														typeof field.value === "number" ? field.value : ""
													}
													onChange={(e) =>
														field.onChange(
															e.target.value === ""
																? undefined
																: e.target.valueAsNumber,
														)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Quantity + Years of experience */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<FormField
								control={form.control}
								name="quantity"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Số lượng <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={1}
												{...field}
												onChange={(e) => field.onChange(e.target.valueAsNumber)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="yoeMin"
								render={({ field }) => (
									<FormItem>
										<FormLabel>KN tối thiểu (năm)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												value={
													typeof field.value === "number" ? field.value : ""
												}
												onChange={(e) =>
													field.onChange(
														e.target.value === ""
															? undefined
															: e.target.valueAsNumber,
													)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="yoeMax"
								render={({ field }) => (
									<FormItem>
										<FormLabel>KN tối đa (năm)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												value={
													typeof field.value === "number" ? field.value : ""
												}
												onChange={(e) =>
													field.onChange(
														e.target.value === ""
															? undefined
															: e.target.valueAsNumber,
													)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Company */}
						<FormField
							control={form.control}
							name="companyId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Thuộc công ty <span className="text-destructive">*</span>
									</FormLabel>
									<Select
										value={field.value}
										onValueChange={field.onChange}
										disabled={!isAdmin}
									>
										<FormControl>
											<SelectTrigger
												className={
													isAdmin
														? "cursor-pointer"
														: "cursor-not-allowed opacity-70"
												}
											>
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

						{/* Dates */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="startDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Ngày bắt đầu <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="endDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Ngày kết thúc <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Is Active */}
						<FormField
							control={form.control}
							name="isActive"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center gap-2">
										<Checkbox
											id="job-isActive"
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
										<label
											htmlFor="job-isActive"
											className="text-sm cursor-pointer select-none"
										>
											Đang tuyển (Active)
										</label>
									</div>
								</FormItem>
							)}
						/>

						<Separator />

						{/* Description */}
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Mô tả công việc{" "}
										<span className="text-destructive">*</span>
									</FormLabel>
									<RichTextEditor
										value={field.value}
										onChange={field.onChange}
										placeholder="Nhập mô tả công việc..."
									/>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Responsibilities */}
						<FormField
							control={form.control}
							name="responsibilities"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Trách nhiệm chính</FormLabel>
									<FormControl>
										<Textarea
											rows={4}
											placeholder="Mỗi dòng là 1 trách nhiệm"
											{...field}
										/>
									</FormControl>
									<p className="text-xs text-muted-foreground">
										Mỗi dòng một mục, tối đa 50 mục.
									</p>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Requirements */}
						<FormField
							control={form.control}
							name="requirements"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Yêu cầu công việc</FormLabel>
									<FormControl>
										<Textarea
											rows={4}
											placeholder="Mỗi dòng là 1 yêu cầu"
											{...field}
										/>
									</FormControl>
									<p className="text-xs text-muted-foreground">
										Mỗi dòng một mục, tối đa 50 mục.
									</p>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Benefits */}
						<FormField
							control={form.control}
							name="benefits"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Quyền lợi</FormLabel>
									<FormControl>
										<Textarea
											rows={4}
											placeholder="Mỗi dòng là 1 quyền lợi"
											{...field}
										/>
									</FormControl>
									<p className="text-xs text-muted-foreground">
										Mỗi dòng một mục, tối đa 30 mục.
									</p>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Spacer to prevent content being hidden behind fixed footer */}
						<div className="h-1" />
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
						disabled={submitting}
						onClick={form.handleSubmit(onSubmit)}
					>
						{submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
						{isEdit ? "Cập nhật" : "Tạo mới"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
