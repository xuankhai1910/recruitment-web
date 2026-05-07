import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	Award,
	Briefcase,
	ChevronDown,
	ChevronUp,
	Download,
	Eye,
	FileEdit,
	GraduationCap,
	Plus,
	Save,
	Sparkles,
	Star,
	Trash2,
	User,
	Wrench,
	X,
} from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth.store";
import {
	useDeleteProfile,
	useMyProfile,
	useUpsertProfile,
} from "@/hooks/useUserProfile";
import { useUser } from "@/hooks/useUsers";
import { CvPreview } from "@/components/common/cv-builder/CvPreview";
import { downloadNodeAsPdf } from "@/lib/pdf";
import type {
	CvTemplate,
	UpsertUserProfileDto,
	UserProfile,
} from "@/types/user-profile";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SKILL_LEVELS = [
	"BEGINNER",
	"INTERMEDIATE",
	"ADVANCED",
	"EXPERT",
] as const;

const personalSchema = z.object({
	fullName: z.string().min(1, "Vui lòng nhập họ tên"),
	email: z.string().email("Email không hợp lệ"),
	phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
	address: z.string().min(1, "Vui lòng nhập địa chỉ"),
	dateOfBirth: z.string().optional(),
	avatar: z.string().optional(),
	github: z.string().optional(),
	linkedin: z.string().optional(),
	portfolio: z.string().optional(),
});

const profileSchema = z.object({
	title: z.string().min(1, "Vui lòng nhập vị trí mong muốn"),
	personalInfo: personalSchema,
	summary: z.string().min(1, "Hãy giới thiệu bản thân"),
	experiences: z.array(
		z.object({
			company: z.string().min(1, "Bắt buộc"),
			position: z.string().min(1, "Bắt buộc"),
			startDate: z.string().min(1, "Bắt buộc"),
			endDate: z.string().optional(),
			isCurrent: z.boolean(),
			description: z.string().min(1, "Bắt buộc"),
		}),
	),
	education: z.array(
		z.object({
			school: z.string().min(1, "Bắt buộc"),
			degree: z.string().min(1, "Bắt buộc"),
			field: z.string().min(1, "Bắt buộc"),
			startDate: z.string().min(1, "Bắt buộc"),
			endDate: z.string().optional(),
			description: z.string().optional(),
		}),
	),
	projects: z.array(
		z.object({
			name: z.string().min(1, "Bắt buộc"),
			role: z.string().min(1, "Bắt buộc"),
			techStack: z.array(z.string()),
			description: z.string().min(1, "Bắt buộc"),
			url: z.string().optional(),
		}),
	),
	skills: z.array(
		z.object({
			name: z.string().min(1, "Bắt buộc"),
			level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
		}),
	),
	certifications: z.array(
		z.object({
			name: z.string().min(1, "Bắt buộc"),
			issuer: z.string().min(1, "Bắt buộc"),
			date: z.string().min(1, "Bắt buộc"),
			url: z.string().optional(),
		}),
	),
	awards: z.array(
		z.object({
			name: z.string().min(1, "Bắt buộc"),
			issuer: z.string().min(1, "Bắt buộc"),
			date: z.string().min(1, "Bắt buộc"),
		}),
	),
	languages: z.array(
		z.object({
			name: z.string().min(1, "Bắt buộc"),
			proficiency: z.string().min(1, "Bắt buộc"),
		}),
	),
	references: z.array(
		z.object({
			name: z.string().min(1, "Bắt buộc"),
			position: z.string().min(1, "Bắt buộc"),
			company: z.string().min(1, "Bắt buộc"),
			phone: z.string().min(1, "Bắt buộc"),
			email: z.string().email("Email không hợp lệ"),
		}),
	),
	templateId: z.enum(["modern", "classic", "minimal"]),
	isPublic: z.boolean(),
});

type FormValues = z.infer<typeof profileSchema>;

function emptyValues(defaults?: {
	fullName?: string;
	email?: string;
	address?: string;
}): FormValues {
	return {
		title: "",
		personalInfo: {
			fullName: defaults?.fullName ?? "",
			email: defaults?.email ?? "",
			phone: "",
			address: defaults?.address ?? "",
			dateOfBirth: "",
			avatar: "",
			github: "",
			linkedin: "",
			portfolio: "",
		},
		summary: "",
		experiences: [],
		education: [],
		projects: [],
		skills: [],
		certifications: [],
		awards: [],
		languages: [],
		references: [],
		templateId: "modern",
		isPublic: false,
	};
}

function profileToValues(p: UserProfile): FormValues {
	return {
		title: p.title ?? "",
		personalInfo: {
			fullName: p.personalInfo?.fullName ?? "",
			email: p.personalInfo?.email ?? "",
			phone: p.personalInfo?.phone ?? "",
			address: p.personalInfo?.address ?? "",
			dateOfBirth: p.personalInfo?.dateOfBirth ?? "",
			avatar: p.personalInfo?.avatar ?? "",
			github: p.personalInfo?.github ?? "",
			linkedin: p.personalInfo?.linkedin ?? "",
			portfolio: p.personalInfo?.portfolio ?? "",
		},
		summary: p.summary ?? "",
		experiences: p.experiences ?? [],
		education: p.education ?? [],
		projects: p.projects ?? [],
		skills: p.skills ?? [],
		certifications: p.certifications ?? [],
		awards: p.awards ?? [],
		languages: p.languages ?? [],
		references: p.references ?? [],
		templateId: ((p.templateId as CvTemplate) ?? "modern") as
			| "modern"
			| "classic"
			| "minimal",
		isPublic: p.isPublic ?? false,
	};
}

export function CvBuilderTab() {
	const { data: profile, isLoading } = useMyProfile();
	const upsert = useUpsertProfile();
	const remove = useDeleteProfile();
	const { user } = useAuthStore();
	const { data: fullUser } = useUser(user?._id ?? "");
	const [editing, setEditing] = useState(false);

	useEffect(() => {
		if (profile) setEditing(true);
	}, [profile]);

	if (isLoading) return <Skeleton className="h-72 rounded-lg" />;

	if (!profile && !editing) {
		return (
			<div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/60 py-14">
				<div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
					<FileEdit className="h-6 w-6 text-blue-600" />
				</div>
				<div className="text-center">
					<p className="font-heading text-base font-semibold text-foreground">
						Bạn chưa có CV trực tuyến
					</p>
					<p className="mt-1 max-w-sm text-sm text-muted-foreground">
						Tạo CV chuyên nghiệp ngay trên hệ thống. Nhà tuyển dụng có thể tìm
						thấy hồ sơ của bạn dễ dàng hơn.
					</p>
				</div>
				<Button
					className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
					size="lg"
					onClick={() => {
						setEditing(true);
					}}
				>
					<Sparkles className="mr-2 h-4 w-4" />
					Tạo CV ngay
				</Button>
			</div>
		);
	}

	return (
		<CvBuilderForm
			profile={profile ?? null}
			defaults={{
				fullName: fullUser?.name,
				email: fullUser?.email,
				address: fullUser?.address,
			}}
			onSave={async (data) => {
				await upsert.mutateAsync(data);
			}}
			isSaving={upsert.isPending}
			onDelete={async () => {
				await remove.mutateAsync();
				setEditing(false);
			}}
		/>
	);
}

interface CvBuilderFormProps {
	profile: UserProfile | null;
	defaults: { fullName?: string; email?: string; address?: string };
	onSave: (data: UpsertUserProfileDto) => Promise<void>;
	onDelete: () => Promise<void>;
	isSaving: boolean;
}

function CvBuilderForm({
	profile,
	defaults,
	onSave,
	onDelete,
	isSaving,
}: CvBuilderFormProps) {
	const initial = useMemo<FormValues>(
		() => (profile ? profileToValues(profile) : emptyValues(defaults)),
		[profile, defaults],
	);

	const {
		control,
		register,
		handleSubmit,
		watch,
		reset,
		setValue,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: initial,
	});

	useEffect(() => {
		reset(initial);
	}, [initial, reset]);

	const expArr = useFieldArray({ control, name: "experiences" });
	const eduArr = useFieldArray({ control, name: "education" });
	const projArr = useFieldArray({ control, name: "projects" });
	const skillArr = useFieldArray({ control, name: "skills" });
	const certArr = useFieldArray({ control, name: "certifications" });

	const values = watch();
	const completion = useMemo(() => computeCompletion(values), [values]);

	const [previewOpen, setPreviewOpen] = useState(false);
	const [exporting, setExporting] = useState(false);
	const printRef = useRef<HTMLDivElement>(null);

	const handleExportPdf = async () => {
		if (!printRef.current) return;
		try {
			setExporting(true);
			await downloadNodeAsPdf(
				printRef.current,
				values.personalInfo.fullName || "CV",
			);
			toast.success("Đã tải CV PDF");
		} catch (e) {
			console.error(e);
			toast.error("Không thể tải PDF");
		} finally {
			setExporting(false);
		}
	};

	const submit = handleSubmit(
		async (data) => {
			await onSave(data as UpsertUserProfileDto);
		},
		(errs) => {
			console.error("CV form errors:", errs);
			toast.error("Vui lòng kiểm tra lại các trường bắt buộc");
		},
	);

	return (
		<form onSubmit={submit} className="space-y-4">
			{/* Top toolbar */}
			<div className="sticky top-0 z-10 -mx-1 rounded-lg border border-border bg-card/95 p-3 backdrop-blur">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex-1">
						<div className="flex items-center justify-between text-xs">
							<span className="font-medium text-muted-foreground">
								Hoàn thiện hồ sơ
							</span>
							<span className="font-heading font-semibold text-blue-600">
								{completion}%
							</span>
						</div>
						<div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-blue-500 transition-all"
								style={{ width: `${completion}%` }}
							/>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Controller
							control={control}
							name="templateId"
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger className="h-9 w-[140px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="modern">Modern</SelectItem>
										<SelectItem value="classic">Classic</SelectItem>
										<SelectItem value="minimal">Minimal</SelectItem>
									</SelectContent>
								</Select>
							)}
						/>

						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-9 cursor-pointer"
							onClick={() => {
								setPreviewOpen(true);
							}}
						>
							<Eye className="mr-1.5 h-4 w-4" />
							Xem trước
						</Button>

						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-9 cursor-pointer"
							disabled={exporting || !profile}
							onClick={handleExportPdf}
						>
							<Download className="mr-1.5 h-4 w-4" />
							{exporting ? "Đang tạo..." : "PDF"}
						</Button>

						<Button
							type="submit"
							size="sm"
							className="h-9 cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
							disabled={isSaving}
						>
							<Save className="mr-1.5 h-4 w-4" />
							{isSaving ? "Đang lưu..." : "Lưu"}
						</Button>
					</div>
				</div>
			</div>

			{/* Section: Personal */}
			<CollapsibleCard title="Thông tin cá nhân" icon={User} defaultOpen>
				<div className="space-y-3">
					<FieldRow>
						<Field
							label="Vị trí mong muốn"
							required
							error={errors.title?.message}
						>
							<Input
								{...register("title")}
								placeholder="VD: Frontend Developer"
							/>
						</Field>
					</FieldRow>

					<FieldRow cols={2}>
						<Field
							label="Họ và tên"
							required
							error={errors.personalInfo?.fullName?.message}
						>
							<Input {...register("personalInfo.fullName")} />
						</Field>
						<Field
							label="Email"
							required
							error={errors.personalInfo?.email?.message}
						>
							<Input {...register("personalInfo.email")} type="email" />
						</Field>
					</FieldRow>

					<FieldRow cols={2}>
						<Field
							label="Số điện thoại"
							required
							error={errors.personalInfo?.phone?.message}
						>
							<Input {...register("personalInfo.phone")} />
						</Field>
						<Field
							label="Ngày sinh"
							error={errors.personalInfo?.dateOfBirth?.message}
						>
							<Input {...register("personalInfo.dateOfBirth")} type="date" />
						</Field>
					</FieldRow>

					<Field
						label="Địa chỉ"
						required
						error={errors.personalInfo?.address?.message}
					>
						<Input {...register("personalInfo.address")} />
					</Field>

					<FieldRow cols={3}>
						<Field label="GitHub">
							<Input
								{...register("personalInfo.github")}
								placeholder="https://github.com/..."
							/>
						</Field>
						<Field label="LinkedIn">
							<Input
								{...register("personalInfo.linkedin")}
								placeholder="https://linkedin.com/in/..."
							/>
						</Field>
						<Field label="Portfolio">
							<Input
								{...register("personalInfo.portfolio")}
								placeholder="https://..."
							/>
						</Field>
					</FieldRow>
				</div>
			</CollapsibleCard>

			{/* Section: Summary */}
			<CollapsibleCard title="Tóm tắt bản thân" icon={Sparkles}>
				<Field error={errors.summary?.message} required>
					<Textarea
						rows={5}
						{...register("summary")}
						placeholder="Giới thiệu ngắn gọn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..."
					/>
				</Field>
			</CollapsibleCard>

			{/* Section: Experiences */}
			<CollapsibleCard title="Kinh nghiệm làm việc" icon={Briefcase}>
				<div className="space-y-3">
					{expArr.fields.map((f, idx) => (
						<EntryCard
							key={f.id}
							onRemove={() => {
								expArr.remove(idx);
							}}
							title={`Kinh nghiệm #${idx + 1}`}
						>
							<FieldRow cols={2}>
								<Field
									label="Công ty"
									required
									error={errors.experiences?.[idx]?.company?.message}
								>
									<Input {...register(`experiences.${idx}.company` as const)} />
								</Field>
								<Field
									label="Vị trí"
									required
									error={errors.experiences?.[idx]?.position?.message}
								>
									<Input
										{...register(`experiences.${idx}.position` as const)}
									/>
								</Field>
							</FieldRow>
							<FieldRow cols={2}>
								<Field
									label="Bắt đầu"
									required
									error={errors.experiences?.[idx]?.startDate?.message}
								>
									<Input
										type="month"
										{...register(`experiences.${idx}.startDate` as const)}
									/>
								</Field>
								<Field label="Kết thúc">
									<Input
										type="month"
										{...register(`experiences.${idx}.endDate` as const)}
										disabled={watch(`experiences.${idx}.isCurrent`)}
									/>
								</Field>
							</FieldRow>
							<label className="flex cursor-pointer items-center gap-2 text-sm">
								<input
									type="checkbox"
									{...register(`experiences.${idx}.isCurrent` as const)}
									className="h-4 w-4 rounded border-border"
								/>
								<span>Đang làm việc tại đây</span>
							</label>
							<Field
								label="Mô tả"
								required
								error={errors.experiences?.[idx]?.description?.message}
							>
								<Textarea
									rows={3}
									{...register(`experiences.${idx}.description` as const)}
									placeholder="Mô tả công việc, thành tựu nổi bật..."
								/>
							</Field>
						</EntryCard>
					))}
					<AddBtn
						label="Thêm kinh nghiệm"
						onClick={() => {
							expArr.append({
								company: "",
								position: "",
								startDate: "",
								endDate: "",
								isCurrent: false,
								description: "",
							});
						}}
					/>
				</div>
			</CollapsibleCard>

			{/* Section: Education */}
			<CollapsibleCard title="Học vấn" icon={GraduationCap}>
				<div className="space-y-3">
					{eduArr.fields.map((f, idx) => (
						<EntryCard
							key={f.id}
							title={`Học vấn #${idx + 1}`}
							onRemove={() => {
								eduArr.remove(idx);
							}}
						>
							<FieldRow cols={2}>
								<Field
									label="Trường"
									required
									error={errors.education?.[idx]?.school?.message}
								>
									<Input {...register(`education.${idx}.school` as const)} />
								</Field>
								<Field
									label="Bằng cấp"
									required
									error={errors.education?.[idx]?.degree?.message}
								>
									<Input {...register(`education.${idx}.degree` as const)} />
								</Field>
							</FieldRow>
							<Field
								label="Chuyên ngành"
								required
								error={errors.education?.[idx]?.field?.message}
							>
								<Input {...register(`education.${idx}.field` as const)} />
							</Field>
							<FieldRow cols={2}>
								<Field
									label="Bắt đầu"
									required
									error={errors.education?.[idx]?.startDate?.message}
								>
									<Input
										type="month"
										{...register(`education.${idx}.startDate` as const)}
									/>
								</Field>
								<Field label="Kết thúc">
									<Input
										type="month"
										{...register(`education.${idx}.endDate` as const)}
									/>
								</Field>
							</FieldRow>
							<Field label="Mô tả">
								<Textarea
									rows={2}
									{...register(`education.${idx}.description` as const)}
								/>
							</Field>
						</EntryCard>
					))}
					<AddBtn
						label="Thêm học vấn"
						onClick={() => {
							eduArr.append({
								school: "",
								degree: "",
								field: "",
								startDate: "",
								endDate: "",
								description: "",
							});
						}}
					/>
				</div>
			</CollapsibleCard>

			{/* Section: Projects */}
			<CollapsibleCard title="Dự án" icon={Wrench}>
				<div className="space-y-3">
					{projArr.fields.map((f, idx) => (
						<EntryCard
							key={f.id}
							title={`Dự án #${idx + 1}`}
							onRemove={() => {
								projArr.remove(idx);
							}}
						>
							<FieldRow cols={2}>
								<Field
									label="Tên dự án"
									required
									error={errors.projects?.[idx]?.name?.message}
								>
									<Input {...register(`projects.${idx}.name` as const)} />
								</Field>
								<Field
									label="Vai trò"
									required
									error={errors.projects?.[idx]?.role?.message}
								>
									<Input {...register(`projects.${idx}.role` as const)} />
								</Field>
							</FieldRow>
							<Field label="Tech stack (cách nhau bởi dấu phẩy)">
								<Controller
									control={control}
									name={`projects.${idx}.techStack` as const}
									render={({ field }) => (
										<Input
											value={field.value?.join(", ") ?? ""}
											onChange={(e) => {
												field.onChange(
													e.target.value
														.split(",")
														.map((s) => s.trim())
														.filter(Boolean),
												);
											}}
											placeholder="React, TypeScript, Node.js"
										/>
									)}
								/>
							</Field>
							<Field label="URL">
								<Input
									{...register(`projects.${idx}.url` as const)}
									placeholder="https://..."
								/>
							</Field>
							<Field
								label="Mô tả"
								required
								error={errors.projects?.[idx]?.description?.message}
							>
								<Textarea
									rows={3}
									{...register(`projects.${idx}.description` as const)}
								/>
							</Field>
						</EntryCard>
					))}
					<AddBtn
						label="Thêm dự án"
						onClick={() => {
							projArr.append({
								name: "",
								role: "",
								techStack: [],
								description: "",
								url: "",
							});
						}}
					/>
				</div>
			</CollapsibleCard>

			{/* Section: Skills */}
			<CollapsibleCard title="Kỹ năng" icon={Star}>
				<SkillsField
					skills={values.skills}
					onAdd={(name, level) => {
						skillArr.append({ name, level });
					}}
					onRemove={(idx) => {
						skillArr.remove(idx);
					}}
					onLevelChange={(idx, level) => {
						setValue(`skills.${idx}.level`, level, { shouldDirty: true });
					}}
				/>
			</CollapsibleCard>

			{/* Section: Certifications */}
			<CollapsibleCard title="Chứng chỉ" icon={Award}>
				<div className="space-y-3">
					{certArr.fields.map((f, idx) => (
						<EntryCard
							key={f.id}
							title={`Chứng chỉ #${idx + 1}`}
							onRemove={() => {
								certArr.remove(idx);
							}}
						>
							<FieldRow cols={2}>
								<Field
									label="Tên chứng chỉ"
									required
									error={errors.certifications?.[idx]?.name?.message}
								>
									<Input {...register(`certifications.${idx}.name` as const)} />
								</Field>
								<Field
									label="Đơn vị cấp"
									required
									error={errors.certifications?.[idx]?.issuer?.message}
								>
									<Input
										{...register(`certifications.${idx}.issuer` as const)}
									/>
								</Field>
							</FieldRow>
							<FieldRow cols={2}>
								<Field
									label="Ngày cấp"
									required
									error={errors.certifications?.[idx]?.date?.message}
								>
									<Input
										type="date"
										{...register(`certifications.${idx}.date` as const)}
									/>
								</Field>
								<Field label="URL">
									<Input
										{...register(`certifications.${idx}.url` as const)}
										placeholder="https://..."
									/>
								</Field>
							</FieldRow>
						</EntryCard>
					))}
					<AddBtn
						label="Thêm chứng chỉ"
						onClick={() => {
							certArr.append({ name: "", issuer: "", date: "", url: "" });
						}}
					/>
				</div>
			</CollapsibleCard>

			{profile && (
				<div className="flex justify-end pt-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
						onClick={async () => {
							if (!confirm("Xóa CV trực tuyến của bạn?")) return;
							await onDelete();
						}}
					>
						<Trash2 className="mr-1.5 h-4 w-4" />
						Xóa CV
					</Button>
				</div>
			)}

			<Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
				<DialogContent className="max-h-[92vh] w-[96vw] !max-w-4xl overflow-y-auto p-0 sm:!max-w-4xl">
					<DialogHeader className="border-b border-border px-5 py-3">
						<DialogTitle className="font-heading">Xem trước CV</DialogTitle>
					</DialogHeader>
					<div className="bg-muted/40 p-4">
						<CvPreview
							profile={
								{
									...(profile ?? ({} as UserProfile)),
									...values,
									_id: profile?._id ?? "",
									userId: profile?.userId ?? "",
									completionScore: completion,
									createdAt: profile?.createdAt ?? new Date().toISOString(),
									updatedAt: profile?.updatedAt ?? new Date().toISOString(),
								} as UserProfile
							}
							template={values.templateId}
						/>
					</div>
				</DialogContent>
			</Dialog>

			{/* Offscreen render target for PDF capture (kept off-canvas, never visible) */}
			<div
				aria-hidden="true"
				style={{
					position: "fixed",
					left: "-10000px",
					top: 0,
					width: "794px",
					pointerEvents: "none",
				}}
			>
				<div ref={printRef}>
					<CvPreview
						profile={
							{
								...(profile ?? ({} as UserProfile)),
								...values,
								_id: profile?._id ?? "",
								userId: profile?.userId ?? "",
								completionScore: completion,
								createdAt: profile?.createdAt ?? new Date().toISOString(),
								updatedAt: profile?.updatedAt ?? new Date().toISOString(),
							} as UserProfile
						}
						template={values.templateId}
					/>
				</div>
			</div>
		</form>
	);
}

/* -------------------- Helper UI -------------------- */

function CollapsibleCard({
	title,
	icon: Icon,
	defaultOpen = false,
	children,
}: {
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	defaultOpen?: boolean;
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(defaultOpen);
	return (
		<div className="rounded-lg border border-border bg-card">
			<button
				type="button"
				className="flex w-full cursor-pointer items-center justify-between p-3 text-left transition-colors hover:bg-muted/40"
				onClick={() => {
					setOpen((o) => !o);
				}}
			>
				<span className="inline-flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
					<Icon className="h-4 w-4 text-blue-500" />
					{title}
				</span>
				{open ? (
					<ChevronUp className="h-4 w-4 text-muted-foreground" />
				) : (
					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				)}
			</button>
			{open && <div className="border-t border-border p-4">{children}</div>}
		</div>
	);
}

function FieldRow({
	cols = 1,
	children,
}: {
	cols?: 1 | 2 | 3;
	children: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				"grid gap-3",
				cols === 2 && "sm:grid-cols-2",
				cols === 3 && "sm:grid-cols-3",
			)}
		>
			{children}
		</div>
	);
}

function Field({
	label,
	required,
	error,
	children,
}: {
	label?: string;
	required?: boolean;
	error?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			{label && (
				<Label className="text-xs font-semibold text-foreground/80">
					{label}
					{required && <span className="ml-0.5 text-destructive">*</span>}
				</Label>
			)}
			{children}
			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
}

function EntryCard({
	title,
	onRemove,
	children,
}: {
	title: string;
	onRemove: () => void;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-md border border-border bg-muted/20 p-3">
			<div className="mb-3 flex items-center justify-between">
				<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					{title}
				</span>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-7 w-7 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
					onClick={onRemove}
				>
					<Trash2 className="h-3.5 w-3.5" />
				</Button>
			</div>
			<div className="space-y-3">{children}</div>
		</div>
	);
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			className="w-full cursor-pointer border-dashed"
			onClick={onClick}
		>
			<Plus className="mr-1.5 h-4 w-4" />
			{label}
		</Button>
	);
}

function SkillsField({
	skills,
	onAdd,
	onRemove,
	onLevelChange,
}: {
	skills: { name: string; level: (typeof SKILL_LEVELS)[number] }[];
	onAdd: (name: string, level: (typeof SKILL_LEVELS)[number]) => void;
	onRemove: (idx: number) => void;
	onLevelChange: (idx: number, level: (typeof SKILL_LEVELS)[number]) => void;
}) {
	const [name, setName] = useState("");
	const [level, setLevel] =
		useState<(typeof SKILL_LEVELS)[number]>("INTERMEDIATE");

	const handleAdd = () => {
		const trimmed = name.trim();
		if (!trimmed) return;
		if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
			toast.error("Kỹ năng đã tồn tại");
			return;
		}
		onAdd(trimmed, level);
		setName("");
	};

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap gap-2">
				{skills.length === 0 && (
					<p className="text-xs text-muted-foreground">
						Chưa có kỹ năng nào. Hãy thêm bên dưới.
					</p>
				)}
				{skills.map((s, idx) => (
					<div
						key={`${s.name}-${idx}`}
						className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 py-0.5 pl-2 pr-1"
					>
						<span className="text-sm font-medium text-foreground">
							{s.name}
						</span>
						<Select
							value={s.level}
							onValueChange={(v) => {
								onLevelChange(idx, v as (typeof SKILL_LEVELS)[number]);
							}}
						>
							<SelectTrigger className="h-6 w-[110px] text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="BEGINNER">Cơ bản</SelectItem>
								<SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
								<SelectItem value="ADVANCED">Thành thạo</SelectItem>
								<SelectItem value="EXPERT">Chuyên gia</SelectItem>
							</SelectContent>
						</Select>
						<button
							type="button"
							className="cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
							onClick={() => {
								onRemove(idx);
							}}
						>
							<X className="h-3.5 w-3.5" />
						</button>
					</div>
				))}
			</div>

			<div className="flex gap-2">
				<Input
					value={name}
					onChange={(e) => {
						setName(e.target.value);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							handleAdd();
						}
					}}
					placeholder="VD: TypeScript"
					className="flex-1"
				/>
				<Select
					value={level}
					onValueChange={(v) => {
						setLevel(v as (typeof SKILL_LEVELS)[number]);
					}}
				>
					<SelectTrigger className="w-[140px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="BEGINNER">Cơ bản</SelectItem>
						<SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
						<SelectItem value="ADVANCED">Thành thạo</SelectItem>
						<SelectItem value="EXPERT">Chuyên gia</SelectItem>
					</SelectContent>
				</Select>
				<Button type="button" variant="outline" onClick={handleAdd}>
					<Plus className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}

function computeCompletion(v: FormValues): number {
	const checks: (boolean | string | unknown[] | undefined)[] = [
		v.title,
		v.personalInfo?.fullName,
		v.personalInfo?.email,
		v.personalInfo?.phone,
		v.personalInfo?.address,
		v.summary,
		v.experiences?.length > 0,
		v.education?.length > 0,
		v.skills?.length > 0,
		v.projects?.length > 0,
	];
	const filled = checks.filter((c) =>
		Array.isArray(c) ? c.length > 0 : Boolean(c),
	).length;
	return Math.round((filled / checks.length) * 100);
}

// suppress unused warning
void Badge;
