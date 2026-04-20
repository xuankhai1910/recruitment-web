import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useCreateJob, useUpdateJob } from "@/hooks/useJobs";
import { useCompaniesDropdown } from "@/hooks/useCompanies";
import { SKILLS_LIST, LEVEL_LIST } from "@/lib/constants";
import { LOCATIONS } from "@/lib/locations";
import type { Job } from "@/types/job";

const jobSchema = z.object({
	name: z.string().min(1, "Tên công việc không được để trống"),
	skills: z.array(z.string()).min(1, "Chọn ít nhất 1 kỹ năng"),
	location: z.string().min(1, "Vui lòng chọn địa điểm"),
	salary: z.number().min(0, "Mức lương phải >= 0"),
	quantity: z.number().min(1, "Số lượng phải >= 1"),
	level: z.string().min(1, "Vui lòng chọn level"),
	companyId: z.string().min(1, "Vui lòng chọn công ty"),
	startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
	endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
	isActive: z.boolean(),
	description: z.string().min(1, "Mô tả không được để trống"),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface JobModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	job: Job | null;
}

export function JobModal({ open, onOpenChange, job }: JobModalProps) {
	const isEdit = !!job;
	const createJob = useCreateJob();
	const updateJob = useUpdateJob();
	const { data: companiesData } = useCompaniesDropdown(open);

	const companies = useMemo(() => companiesData?.result ?? [], [companiesData]);

	const form = useForm<JobFormValues>({
		resolver: zodResolver(jobSchema),
		defaultValues: {
			name: "",
			skills: [],
			location: "",
			salary: 0,
			quantity: 1,
			level: "",
			companyId: "",
			startDate: "",
			endDate: "",
			isActive: true,
			description: "",
		},
	});

	useEffect(() => {
		if (open) {
			if (job) {
				form.reset({
					name: job.name,
					skills: job.skills,
					location: job.location,
					salary: job.salary,
					quantity: job.quantity,
					level: job.level,
					companyId: job.company._id,
					startDate: job.startDate?.slice(0, 10) ?? "",
					endDate: job.endDate?.slice(0, 10) ?? "",
					isActive: job.isActive,
					description: job.description,
				});
			} else {
				form.reset({
					name: "",
					skills: [],
					location: "",
					salary: 0,
					quantity: 1,
					level: "",
					companyId: "",
					startDate: "",
					endDate: "",
					isActive: true,
					description: "",
				});
			}
		}
	}, [open, job, form]);

	const submitting = createJob.isPending || updateJob.isPending;

	const onSubmit = async (values: JobFormValues) => {
		const company = companies.find((c) => c._id === values.companyId);
		if (!company) return;

		const payload = {
			name: values.name,
			skills: values.skills,
			location: values.location,
			salary: values.salary,
			quantity: values.quantity,
			level: values.level,
			company: { _id: company._id, name: company.name, logo: company.logo },
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

						{/* Skills */}
						<FormField
							control={form.control}
							name="skills"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Kỹ năng yêu cầu <span className="text-destructive">*</span>
									</FormLabel>
									<div className="flex flex-wrap gap-3">
										{SKILLS_LIST.map((skill) => (
											<div
												key={skill}
												className="flex items-center gap-1.5 text-sm"
											>
												<Checkbox
													id={`skill-${skill}`}
													checked={field.value.includes(skill)}
													onCheckedChange={(checked) => {
														if (checked) {
															field.onChange([...field.value, skill]);
														} else {
															field.onChange(
																field.value.filter((s: string) => s !== skill),
															);
														}
													}}
												/>
												<label
													htmlFor={`skill-${skill}`}
													className="cursor-pointer select-none"
												>
													{skill}
												</label>
											</div>
										))}
									</div>
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
											Level <span className="text-destructive">*</span>
										</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger className="cursor-pointer">
													<SelectValue placeholder="Chọn level" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{LEVEL_LIST.map((lv) => (
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

						{/* Salary + Quantity */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="salary"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Mức lương (VNĐ)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
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
								name="quantity"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Số lượng</FormLabel>
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
									<FormLabel>Mô tả công việc</FormLabel>
									<RichTextEditor
										value={field.value}
										onChange={field.onChange}
										placeholder="Nhập mô tả công việc..."
									/>
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
