import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	Award,
	Briefcase,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Copy,
	Download,
	Eye,
	FileEdit,
	GraduationCap,
	Globe,
	Mail,
	MapPin,
	Phone,
	Plus,
	Save,
	Sparkles,
	Trash2,
	Wrench,
	X,
} from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

const SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;

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

	const [sawProfile, setSawProfile] = useState(false);
	if (profile && !sawProfile) {
		setSawProfile(true);
		setEditing(true);
	}

	if (isLoading) return <Skeleton className="h-72 rounded-xl" />;

	if (!profile && !editing) {
		return (
			<div className={ui.empty}>
				<div className={ui.emptyIcon}>
					<FileEdit className="h-7 w-7" />
				</div>
				<h3 className="mb-2 text-xl font-semibold text-ink">
					Bạn chưa có CV trực tuyến
				</h3>
				<p className="max-w-[380px] text-sm text-slate-600">
					Tạo CV chuyên nghiệp ngay trên hệ thống. Nhà tuyển dụng có thể tìm thấy
					hồ sơ của bạn dễ dàng hơn.
				</p>
				<button className={cn(ui.btnAccent, "mt-5")} onClick={() => setEditing(true)}>
					<Sparkles className="h-4 w-4" />
					Tạo CV ngay
				</button>
			</div>
		);
	}

	return (
		<CvBuilderForm
			profile={profile ?? null}
			userId={user?._id}
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
	userId?: string;
	defaults: { fullName?: string; email?: string; address?: string };
	onSave: (data: UpsertUserProfileDto) => Promise<void>;
	onDelete: () => Promise<void>;
	isSaving: boolean;
}

const STEPS = [
	{ label: "Thông tin cá nhân", heading: "Hãy bắt đầu với thông tin cơ bản" },
	{ label: "Giới thiệu", heading: "Một đoạn ngắn mô tả bản thân bạn" },
	{ label: "Kinh nghiệm & Dự án", heading: "Kinh nghiệm làm việc và dự án" },
	{ label: "Học vấn & Chứng chỉ", heading: "Bằng cấp và chứng chỉ của bạn" },
	{ label: "Kỹ năng", heading: "Các kỹ năng nổi bật của bạn" },
];

function CvBuilderForm({
	profile,
	userId,
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
	const publicProfileUrl = userId
		? `${window.location.origin}/profiles/${userId}`
		: "";
	const canSharePublicProfile = Boolean(
		profile && values.isPublic && publicProfileUrl,
	);

	const [step, setStep] = useState(0);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [publicSuccessOpen, setPublicSuccessOpen] = useState(false);
	const [exporting, setExporting] = useState(false);
	const printRef = useRef<HTMLDivElement>(null);

	const handleExportPdf = async () => {
		if (!printRef.current) return;
		try {
			setExporting(true);
			await downloadNodeAsPdf(printRef.current, values.personalInfo.fullName || "CV");
			toast.success("Đã tải CV PDF");
		} catch (e) {
			console.error(e);
			toast.error("Không thể tải PDF");
		} finally {
			setExporting(false);
		}
	};

	const copyPublicProfileUrl = async () => {
		if (!publicProfileUrl) return;
		try {
			await navigator.clipboard.writeText(publicProfileUrl);
			toast.success("Đã sao chép link hồ sơ công khai");
		} catch {
			toast.error("Không thể sao chép link hồ sơ");
		}
	};

	const submit = handleSubmit(
		async (data) => {
			const shouldShowPublicDialog = data.isPublic && !profile?.isPublic;
			await onSave(data as UpsertUserProfileDto);
			if (shouldShowPublicDialog) setPublicSuccessOpen(true);
		},
		(errs) => {
			console.error("CV form errors:", errs);
			toast.error("Vui lòng kiểm tra lại các trường bắt buộc");
		},
	);

	const previewProfile = {
		...(profile ?? ({} as UserProfile)),
		...values,
		_id: profile?._id ?? "",
		userId: profile?.userId ?? "",
		completionScore: completion,
		createdAt: profile?.createdAt ?? new Date().toISOString(),
		updatedAt: profile?.updatedAt ?? new Date().toISOString(),
	} as UserProfile;

	return (
		<form onSubmit={submit}>
			{/* Toolbar */}
			<div className="mb-5 rounded-xl border border-line bg-white p-6">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="min-w-[200px] flex-1">
						<div className="mb-1.5 flex justify-between text-xs">
							<span className="font-medium text-slate-600">Hoàn thiện hồ sơ</span>
							<span className="font-display font-bold text-teal-700">{completion}%</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-cream-2">
							<div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${completion}%` }} />
						</div>
					</div>

					<div className="flex flex-wrap gap-2">
						<Controller
							control={control}
							name="isPublic"
							render={({ field }) => (
								<button
									type="button"
									onClick={() => field.onChange(!field.value)}
									className={cn(
										"inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition-colors",
										field.value
											? "border-teal-200 bg-teal-50 text-teal-700"
											: "border-line bg-white text-slate-600 hover:bg-line-soft",
									)}
								>
									<Globe className="h-4 w-4" />
									{field.value ? "Đang công khai" : "Công khai"}
								</button>
							)}
						/>
						<button type="button" className={cn(ui.btnOutline, "lg:hidden")} onClick={() => setPreviewOpen(true)}>
							<Eye className="h-4 w-4" />
							Xem trước
						</button>
						<button type="button" className={ui.btnOutline} disabled={exporting || !profile} onClick={handleExportPdf}>
							<Download className="h-4 w-4" />
							{exporting ? "Đang tạo..." : "PDF"}
						</button>
						<button type="submit" className={ui.btnAccent} disabled={isSaving}>
							<Save className="h-4 w-4" />
							{isSaving ? "Đang lưu..." : "Lưu"}
						</button>
					</div>
				</div>

				{values.isPublic && (
					<div className="mt-3.5 border-t border-dashed border-line pt-3.5 text-xs text-slate-600">
						{canSharePublicProfile ? (
							<div className="flex flex-wrap items-center justify-between gap-2">
								<a href={publicProfileUrl} target="_blank" rel="noopener noreferrer" className="truncate font-semibold text-teal-700">
									{publicProfileUrl}
								</a>
								<button
									type="button"
									className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink px-3 text-[13px] font-semibold text-ink hover:bg-ink hover:text-white"
									onClick={copyPublicProfileUrl}
								>
									<Copy className="h-3.5 w-3.5" />
									Sao chép
								</button>
							</div>
						) : (
							<p>Lưu CV để tạo link hồ sơ công khai cho nhà tuyển dụng.</p>
						)}
					</div>
				)}
			</div>

			{/* Editor + live preview */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
				<div>
					<div className="mb-8 flex gap-1">
						{STEPS.map((s, i) => (
							<div
								key={s.label}
								className={cn(
									"h-1.5 flex-1 rounded-sm transition-colors",
									i < step ? "bg-teal-500" : i === step ? "bg-ink" : "bg-line-soft",
								)}
							/>
						))}
					</div>

					<div>
						<div className="mb-3 inline-flex items-center gap-2 font-mono-jb text-[11px] font-bold uppercase tracking-[0.1em] text-teal-700">
							<span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-teal-500 text-[11px] text-ink">
								{step + 1}
							</span>
							{STEPS[step].label}
						</div>
						<h3 className="mb-4 font-display text-[22px] font-bold tracking-tight text-ink">
							{STEPS[step].heading}
						</h3>

						{step === 0 && (
							<div className="space-y-3">
								<Field label="Vị trí mong muốn" required error={errors.title?.message}>
									<Input {...register("title")} placeholder="VD: Frontend Developer" />
								</Field>
								<FieldRow cols={2}>
									<Field label="Họ và tên" required error={errors.personalInfo?.fullName?.message}>
										<Input {...register("personalInfo.fullName")} />
									</Field>
									<Field label="Email" required error={errors.personalInfo?.email?.message}>
										<Input {...register("personalInfo.email")} type="email" />
									</Field>
								</FieldRow>
								<FieldRow cols={2}>
									<Field label="Số điện thoại" required error={errors.personalInfo?.phone?.message}>
										<Input {...register("personalInfo.phone")} />
									</Field>
									<Field label="Ngày sinh">
										<Input {...register("personalInfo.dateOfBirth")} type="date" />
									</Field>
								</FieldRow>
								<Field label="Địa chỉ" required error={errors.personalInfo?.address?.message}>
									<Input {...register("personalInfo.address")} />
								</Field>
								<FieldRow cols={3}>
									<Field label="GitHub">
										<Input {...register("personalInfo.github")} placeholder="https://github.com/..." />
									</Field>
									<Field label="LinkedIn">
										<Input {...register("personalInfo.linkedin")} placeholder="https://linkedin.com/in/..." />
									</Field>
									<Field label="Portfolio">
										<Input {...register("personalInfo.portfolio")} placeholder="https://..." />
									</Field>
								</FieldRow>
							</div>
						)}

						{step === 1 && (
							<Field label="Tóm tắt" required error={errors.summary?.message}>
								<Textarea
									rows={6}
									{...register("summary")}
									placeholder="Giới thiệu ngắn gọn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..."
								/>
							</Field>
						)}

						{step === 2 && (
							<div className="space-y-5">
								<div className="space-y-3">
									<SubHeading icon={Briefcase}>Kinh nghiệm làm việc</SubHeading>
									{expArr.fields.map((f, idx) => (
										<EntryCard key={f.id} title={`Kinh nghiệm #${idx + 1}`} onRemove={() => expArr.remove(idx)}>
											<FieldRow cols={2}>
												<Field label="Công ty" required error={errors.experiences?.[idx]?.company?.message}>
													<Input {...register(`experiences.${idx}.company` as const)} />
												</Field>
												<Field label="Vị trí" required error={errors.experiences?.[idx]?.position?.message}>
													<Input {...register(`experiences.${idx}.position` as const)} />
												</Field>
											</FieldRow>
											<FieldRow cols={2}>
												<Field label="Bắt đầu" required error={errors.experiences?.[idx]?.startDate?.message}>
													<Input type="month" {...register(`experiences.${idx}.startDate` as const)} />
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
												<input type="checkbox" {...register(`experiences.${idx}.isCurrent` as const)} className="h-4 w-4" />
												<span>Đang làm việc tại đây</span>
											</label>
											<Field label="Mô tả" required error={errors.experiences?.[idx]?.description?.message}>
												<Textarea rows={3} {...register(`experiences.${idx}.description` as const)} placeholder="Mô tả công việc, thành tựu nổi bật..." />
											</Field>
										</EntryCard>
									))}
									<AddBtn
										label="Thêm kinh nghiệm"
										onClick={() =>
											expArr.append({ company: "", position: "", startDate: "", endDate: "", isCurrent: false, description: "" })
										}
									/>
								</div>

								<div className="space-y-3">
									<SubHeading icon={Wrench}>Dự án</SubHeading>
									{projArr.fields.map((f, idx) => (
										<EntryCard key={f.id} title={`Dự án #${idx + 1}`} onRemove={() => projArr.remove(idx)}>
											<FieldRow cols={2}>
												<Field label="Tên dự án" required error={errors.projects?.[idx]?.name?.message}>
													<Input {...register(`projects.${idx}.name` as const)} />
												</Field>
												<Field label="Vai trò" required error={errors.projects?.[idx]?.role?.message}>
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
															onChange={(e) =>
																field.onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
															}
															placeholder="React, TypeScript, Node.js"
														/>
													)}
												/>
											</Field>
											<Field label="URL">
												<Input {...register(`projects.${idx}.url` as const)} placeholder="https://..." />
											</Field>
											<Field label="Mô tả" required error={errors.projects?.[idx]?.description?.message}>
												<Textarea rows={3} {...register(`projects.${idx}.description` as const)} />
											</Field>
										</EntryCard>
									))}
									<AddBtn
										label="Thêm dự án"
										onClick={() => projArr.append({ name: "", role: "", techStack: [], description: "", url: "" })}
									/>
								</div>
							</div>
						)}

						{step === 3 && (
							<div className="space-y-5">
								<div className="space-y-3">
									<SubHeading icon={GraduationCap}>Học vấn</SubHeading>
									{eduArr.fields.map((f, idx) => (
										<EntryCard key={f.id} title={`Học vấn #${idx + 1}`} onRemove={() => eduArr.remove(idx)}>
											<FieldRow cols={2}>
												<Field label="Trường" required error={errors.education?.[idx]?.school?.message}>
													<Input {...register(`education.${idx}.school` as const)} />
												</Field>
												<Field label="Bằng cấp" required error={errors.education?.[idx]?.degree?.message}>
													<Input {...register(`education.${idx}.degree` as const)} />
												</Field>
											</FieldRow>
											<Field label="Chuyên ngành" required error={errors.education?.[idx]?.field?.message}>
												<Input {...register(`education.${idx}.field` as const)} />
											</Field>
											<FieldRow cols={2}>
												<Field label="Bắt đầu" required error={errors.education?.[idx]?.startDate?.message}>
													<Input type="month" {...register(`education.${idx}.startDate` as const)} />
												</Field>
												<Field label="Kết thúc">
													<Input type="month" {...register(`education.${idx}.endDate` as const)} />
												</Field>
											</FieldRow>
											<Field label="Mô tả">
												<Textarea rows={2} {...register(`education.${idx}.description` as const)} />
											</Field>
										</EntryCard>
									))}
									<AddBtn
										label="Thêm học vấn"
										onClick={() => eduArr.append({ school: "", degree: "", field: "", startDate: "", endDate: "", description: "" })}
									/>
								</div>

								<div className="space-y-3">
									<SubHeading icon={Award}>Chứng chỉ</SubHeading>
									{certArr.fields.map((f, idx) => (
										<EntryCard key={f.id} title={`Chứng chỉ #${idx + 1}`} onRemove={() => certArr.remove(idx)}>
											<FieldRow cols={2}>
												<Field label="Tên chứng chỉ" required error={errors.certifications?.[idx]?.name?.message}>
													<Input {...register(`certifications.${idx}.name` as const)} />
												</Field>
												<Field label="Đơn vị cấp" required error={errors.certifications?.[idx]?.issuer?.message}>
													<Input {...register(`certifications.${idx}.issuer` as const)} />
												</Field>
											</FieldRow>
											<FieldRow cols={2}>
												<Field label="Ngày cấp" required error={errors.certifications?.[idx]?.date?.message}>
													<Input type="date" {...register(`certifications.${idx}.date` as const)} />
												</Field>
												<Field label="URL">
													<Input {...register(`certifications.${idx}.url` as const)} placeholder="https://..." />
												</Field>
											</FieldRow>
										</EntryCard>
									))}
									<AddBtn label="Thêm chứng chỉ" onClick={() => certArr.append({ name: "", issuer: "", date: "", url: "" })} />
								</div>
							</div>
						)}

						{step === 4 && (
							<SkillsField
								skills={values.skills}
								onAdd={(name, level) => skillArr.append({ name, level })}
								onRemove={(idx) => skillArr.remove(idx)}
								onLevelChange={(idx, level) => setValue(`skills.${idx}.level`, level, { shouldDirty: true })}
							/>
						)}
					</div>

					<div className="mt-6 flex justify-between gap-3 border-t border-line pt-5">
						<button
							type="button"
							className={ui.btnOutline}
							onClick={() => setStep((s) => Math.max(0, s - 1))}
							disabled={step === 0}
						>
							<ChevronLeft className="h-4 w-4" />
							Quay lại
						</button>
						{step < STEPS.length - 1 ? (
							<button
								type="button"
								className={ui.btnPrimary}
								onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
							>
								Tiếp theo
								<ChevronRight className="h-4 w-4" />
							</button>
						) : (
							<button type="submit" className={ui.btnAccent} disabled={isSaving}>
								<Save className="h-4 w-4" />
								{isSaving ? "Đang lưu..." : "Hoàn thành & Lưu"}
							</button>
						)}
					</div>

					{profile && (
						<div className="mt-4 flex justify-end">
							<button
								type="button"
								className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-rose-800 hover:bg-rose-50"
								onClick={async () => {
									if (!confirm("Xóa CV trực tuyến của bạn?")) return;
									await onDelete();
								}}
							>
								<Trash2 className="h-4 w-4" />
								Xóa CV
							</button>
						</div>
					)}
				</div>

				{/* Live preview */}
				<div className="hidden lg:sticky lg:top-24 lg:block">
					<div className="mb-3 font-mono-jb text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
						Xem trước trực tiếp
					</div>
					<LivePreview v={values} />
				</div>
			</div>

			{/* Mobile / full preview dialog */}
			<Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
				<DialogContent className="max-h-[92vh] w-[96vw] max-w-4xl! overflow-y-auto p-0 sm:max-w-4xl!">
					<DialogHeader className="border-b border-border px-5 py-3">
						<DialogTitle className="font-heading">Xem trước CV</DialogTitle>
					</DialogHeader>
					<div className="bg-cream-2 p-4">
						<CvPreview profile={previewProfile} />
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={publicSuccessOpen} onOpenChange={setPublicSuccessOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
							<CheckCircle2 className="h-6 w-6" />
						</div>
						<DialogTitle className="font-heading text-lg">CV đã được công khai</DialogTitle>
					</DialogHeader>
					<p className="text-sm leading-6 text-muted-foreground">
						Bạn đã công khai CV và đang ở trong chế độ tìm việc. Nhà tuyển dụng sẽ
						có thể tìm thấy profile của bạn.
					</p>
					{publicProfileUrl && (
						<div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
							<a href={publicProfileUrl} target="_blank" rel="noopener noreferrer" className="block truncate font-medium text-teal-700 hover:underline">
								{publicProfileUrl}
							</a>
						</div>
					)}
					<div className="flex justify-end gap-2">
						<button type="button" className={ui.btnOutline} onClick={copyPublicProfileUrl}>
							<Copy className="h-4 w-4" />
							Sao chép link
						</button>
						<button type="button" className={ui.btnAccent} onClick={() => setPublicSuccessOpen(false)}>
							Đã hiểu
						</button>
					</div>
				</DialogContent>
			</Dialog>

			<div
				aria-hidden="true"
				style={{ position: "fixed", left: "-10000px", top: 0, width: "794px", pointerEvents: "none" }}
			>
				<div ref={printRef}>
					<CvPreview profile={previewProfile} />
				</div>
			</div>
		</form>
	);
}

/* -------------------- Live preview (compact, single template) -------------------- */

function fmtMonth(d?: string) {
	if (!d) return "";
	const date = new Date(d);
	return Number.isNaN(date.getTime())
		? d
		: `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

const cvH2 =
	"mb-2.5 mt-[18px] font-mono-jb text-[11px] font-bold uppercase tracking-[0.12em] text-teal-700";

function LivePreview({ v }: { v: FormValues }) {
	const p = v.personalInfo;
	return (
		<div className="mx-auto max-w-[480px] rounded-xl border border-line bg-white p-9 text-[13px] leading-normal text-slate-700 shadow-lg">
			<h1 className="mb-1 font-display text-2xl font-bold tracking-tight text-ink">
				{p.fullName || "Họ và tên"}
			</h1>
			<div className="mb-3 text-sm font-semibold text-teal-700">
				{v.title || "Vị trí mong muốn"}
			</div>
			<div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5 border-b-2 border-ink pb-4 text-[11px] text-slate-600">
				{p.email && (
					<span className="inline-flex items-center gap-1">
						<Mail className="h-[11px] w-[11px]" />
						{p.email}
					</span>
				)}
				{p.phone && (
					<span className="inline-flex items-center gap-1">
						<Phone className="h-[11px] w-[11px]" />
						{p.phone}
					</span>
				)}
				{p.address && (
					<span className="inline-flex items-center gap-1">
						<MapPin className="h-[11px] w-[11px]" />
						{p.address}
					</span>
				)}
			</div>

			{v.summary && (
				<>
					<h2 className={cvH2}>Giới thiệu</h2>
					<p className="mb-2.5">{v.summary}</p>
				</>
			)}

			{v.experiences.length > 0 && (
				<>
					<h2 className={cvH2}>Kinh nghiệm</h2>
					{v.experiences.map((e, i) => (
						<div key={i} className="mb-3.5">
							<div className="flex items-baseline justify-between gap-3">
								<span className="text-[13px] font-semibold text-ink">{e.position}</span>
								<span className="font-mono-jb text-[11px] text-slate-400">
									{fmtMonth(e.startDate)} – {e.isCurrent ? "Hiện tại" : fmtMonth(e.endDate)}
								</span>
							</div>
							<div className="text-xs text-slate-600">{e.company}</div>
						</div>
					))}
				</>
			)}

			{v.education.length > 0 && (
				<>
					<h2 className={cvH2}>Học vấn</h2>
					{v.education.map((e, i) => (
						<div key={i} className="mb-3.5">
							<div className="flex items-baseline justify-between gap-3">
								<span className="text-[13px] font-semibold text-ink">{e.school}</span>
								<span className="font-mono-jb text-[11px] text-slate-400">
									{fmtMonth(e.startDate)} – {fmtMonth(e.endDate)}
								</span>
							</div>
							<div className="text-xs text-slate-600">
								{e.degree}
								{e.field ? ` · ${e.field}` : ""}
							</div>
						</div>
					))}
				</>
			)}

			{v.projects.length > 0 && (
				<>
					<h2 className={cvH2}>Dự án</h2>
					{v.projects.map((pr, i) => (
						<div key={i} className="mb-3.5">
							<div className="flex items-baseline justify-between gap-3">
								<span className="text-[13px] font-semibold text-ink">{pr.name}</span>
								{pr.role && <span className="font-mono-jb text-[11px] text-slate-400">{pr.role}</span>}
							</div>
							{pr.techStack?.length > 0 && (
								<div className="text-xs text-slate-600">{pr.techStack.join(" · ")}</div>
							)}
						</div>
					))}
				</>
			)}

			{v.skills.length > 0 && (
				<>
					<h2 className={cvH2}>Kỹ năng</h2>
					<div className="flex flex-wrap gap-1.5">
						{v.skills.map((s) => (
							<span key={s.name} className="rounded-full border border-ink px-2 py-0.5 text-[10px] font-semibold">
								{s.name}
							</span>
						))}
					</div>
				</>
			)}

			{v.certifications.length > 0 && (
				<>
					<h2 className={cvH2}>Chứng chỉ</h2>
					{v.certifications.map((c, i) => (
						<div key={i} className="mb-3.5">
							<div className="flex items-baseline justify-between gap-3">
								<span className="text-[13px] font-semibold text-ink">{c.name}</span>
								<span className="font-mono-jb text-[11px] text-slate-400">{fmtMonth(c.date)}</span>
							</div>
							<div className="text-xs text-slate-600">{c.issuer}</div>
						</div>
					))}
				</>
			)}
		</div>
	);
}

/* -------------------- Helper UI -------------------- */

function SubHeading({
	icon: Icon,
	children,
}: {
	icon: React.ComponentType<{ className?: string }>;
	children: React.ReactNode;
}) {
	return (
		<h4 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
			<Icon className="h-4 w-4 text-teal-500" />
			{children}
		</h4>
	);
}

function FieldRow({ cols = 1, children }: { cols?: 1 | 2 | 3; children: React.ReactNode }) {
	return (
		<div className={cn("grid gap-3", cols === 2 && "sm:grid-cols-2", cols === 3 && "sm:grid-cols-3")}>
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
		<div className="rounded-lg border border-line bg-cream/60 p-3">
			<div className="mb-3 flex items-center justify-between">
				<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</span>
				<button
					type="button"
					className="grid h-7 w-7 place-items-center rounded-md text-rose-700 hover:bg-rose-50"
					onClick={onRemove}
				>
					<Trash2 className="h-3.5 w-3.5" />
				</button>
			</div>
			<div className="space-y-3">{children}</div>
		</div>
	);
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
	return (
		<button
			type="button"
			className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line py-2 text-sm font-medium text-slate-600 transition-colors hover:border-ink hover:text-ink"
			onClick={onClick}
		>
			<Plus className="h-4 w-4" />
			{label}
		</button>
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
	const [level, setLevel] = useState<(typeof SKILL_LEVELS)[number]>("INTERMEDIATE");

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
			<p className="text-[13px] text-slate-600">
				Đã chọn <b className="text-ink">{skills.length}</b> kỹ năng
			</p>
			<div className="flex flex-wrap gap-2">
				{skills.map((s, idx) => (
					<div key={s.name} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-cream-2/60 py-0.5 pl-2 pr-1">
						<span className="text-sm font-medium text-ink">{s.name}</span>
						<Select value={s.level} onValueChange={(val) => onLevelChange(idx, val as (typeof SKILL_LEVELS)[number])}>
							<SelectTrigger className="h-6 w-27.5 text-xs">
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
							className="rounded p-0.5 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
							onClick={() => onRemove(idx)}
						>
							<X className="h-3.5 w-3.5" />
						</button>
					</div>
				))}
			</div>

			<div className="flex gap-2">
				<Input
					value={name}
					onChange={(e) => setName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							handleAdd();
						}
					}}
					placeholder="VD: TypeScript"
					className="flex-1"
				/>
				<Select value={level} onValueChange={(val) => setLevel(val as (typeof SKILL_LEVELS)[number])}>
					<SelectTrigger className="w-35">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="BEGINNER">Cơ bản</SelectItem>
						<SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
						<SelectItem value="ADVANCED">Thành thạo</SelectItem>
						<SelectItem value="EXPERT">Chuyên gia</SelectItem>
					</SelectContent>
				</Select>
				<button type="button" className={ui.btnOutline} onClick={handleAdd}>
					<Plus className="h-4 w-4" />
				</button>
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
	const filled = checks.filter((c) => (Array.isArray(c) ? c.length > 0 : Boolean(c))).length;
	return Math.round((filled / checks.length) * 100);
}
