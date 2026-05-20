import { useEffect, useState } from "react";
import {
	Bell,
	BellOff,
	CheckCircle2,
	Mail,
	Sparkles,
	X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSendTestJobAlertMail } from "@/hooks/useMail";
import {
	useCreateSubscriber,
	useDeleteSubscriber,
	useMySubscriber,
	useUpdateSubscriber,
} from "@/hooks/useSubscribers";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

const SUGGESTED_SKILLS = [
	"React",
	"Node.js",
	"TypeScript",
	"Python",
	"Java",
	"Go",
	"DevOps",
	"AWS",
	"Docker",
	"UI/UX",
];

export function SubscriberTab() {
	const { user } = useAuthStore();
	const { data: sub, isLoading } = useMySubscriber();
	const createSub = useCreateSubscriber();
	const updateSub = useUpdateSubscriber();
	const deleteSub = useDeleteSubscriber();
	const sendTestJobAlertMail = useSendTestJobAlertMail();
	const [skills, setSkills] = useState<string[]>([]);
	const [skillInput, setSkillInput] = useState("");

	useEffect(() => {
		setSkills(sub?.skills ?? []);
	}, [sub]);

	const addSkill = (value: string) => {
		const v = value.trim();
		if (!v) return;
		setSkills((prev) => (prev.includes(v) ? prev : [...prev, v]));
		setSkillInput("");
	};

	const removeSkill = (skill: string) => {
		setSkills((prev) => prev.filter((s) => s !== skill));
	};

	const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addSkill(skillInput);
		} else if (e.key === "Backspace" && !skillInput && skills.length > 0) {
			removeSkill(skills[skills.length - 1]);
		}
	};

	const hasSkillChanges =
		skills.length !== (sub?.skills?.length ?? 0) ||
		skills.some((skill) => !(sub?.skills ?? []).includes(skill));

	const saveSubscriber = async () => {
		if (!user) return;
		if (sub) {
			return updateSub.mutateAsync({ skills });
		}
		return createSub.mutateAsync({
			name: user.name,
			email: user.email,
			skills,
		});
	};

	const handleSave = async () => {
		if (!skills.length) {
			toast.error("Nhập ít nhất 1 kỹ năng trước khi đăng ký");
			return;
		}
		await saveSubscriber();
	};

	const handleStartNotifications = async () => {
		if (!skills.length) {
			toast.error("Chọn ít nhất 1 kỹ năng trước khi bật thông báo");
			return;
		}
		if (!sub || hasSkillChanges) {
			await saveSubscriber();
		}
		await sendTestJobAlertMail.mutateAsync();
	};

	const isSaving = createSub.isPending || updateSub.isPending;
	const isDeleting = deleteSub.isPending;
	const isTriggering = sendTestJobAlertMail.isPending;
	const hasSavedPreferences = !!sub;
	const hasSelectedSkills = skills.length > 0;
	const subscribeLabel =
		!hasSavedPreferences || hasSkillChanges
			? "Lưu và đăng ký nhận email"
			: "Đăng ký nhận email";

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-24 rounded-2xl" />
				<Skeleton className="h-40 rounded-2xl" />
			</div>
		);
	}

	return (
		<div className="space-y-5">
			{/* Status banner */}
			<div
				className={cn(
					"rounded-2xl border p-4",
					hasSavedPreferences
						? "border-emerald-200/70 bg-emerald-50/60"
						: "border-blue-200/70 bg-blue-50/60",
				)}
			>
				<div className="flex items-start gap-3">
					<div
						className={cn(
							"grid h-10 w-10 shrink-0 place-items-center rounded-xl",
							hasSavedPreferences
								? "bg-emerald-500/10 text-emerald-600"
								: "bg-blue-500/10 text-blue-500",
						)}
					>
						{hasSavedPreferences ? (
							<CheckCircle2 className="h-5 w-5" />
						) : (
							<Sparkles className="h-5 w-5" />
						)}
					</div>
					<div className="min-w-0 space-y-1">
						<p
							className={cn(
								"font-heading text-sm font-semibold",
								hasSavedPreferences ? "text-emerald-700" : "text-blue-700",
							)}
						>
							{hasSavedPreferences
								? "Bạn đang nhận thông báo việc làm"
								: "Chưa đăng ký nhận email"}
						</p>
						<p className="text-xs leading-5 text-slate-600">
							{hasSavedPreferences
								? "Hệ thống sẽ gửi việc làm phù hợp với kỹ năng của bạn qua email."
								: "Thêm các kỹ năng bạn quan tâm, hệ thống sẽ tự động gửi việc làm phù hợp."}
						</p>
					</div>
				</div>
			</div>

			{/* Skills input — chip style */}
			<div className="space-y-3 rounded-2xl border border-slate-200/70 bg-white p-4">
				<div className="space-y-1.5">
					<Label htmlFor="subscriber-skill-input" className="text-sm font-medium">
						Kỹ năng quan tâm
					</Label>
					<p className="text-xs text-slate-500">
						Gõ kỹ năng rồi nhấn{" "}
						<kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono">
							Enter
						</kbd>{" "}
						hoặc dấu phẩy để thêm.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-2 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500/20">
					{skills.map((skill) => (
						<span
							key={skill}
							className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50/60 px-2.5 py-0.5 text-xs font-medium text-blue-600"
						>
							{skill}
							<button
								type="button"
								onClick={() => removeSkill(skill)}
								className="-mr-1 cursor-pointer rounded-full p-0.5 text-blue-400 transition-colors hover:bg-blue-100 hover:text-blue-700"
								aria-label={`Xóa ${skill}`}
							>
								<X className="h-3 w-3" />
							</button>
						</span>
					))}
					<Input
						id="subscriber-skill-input"
						value={skillInput}
						onChange={(e) => setSkillInput(e.target.value)}
						onKeyDown={onInputKeyDown}
						onBlur={() => addSkill(skillInput)}
						placeholder={skills.length ? "" : "VD: React, Node.js, Java"}
						className="h-7 min-w-35 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
					/>
				</div>

				{/* Suggested skills */}
				<div className="space-y-1.5">
					<p className="text-xs text-slate-500">Gợi ý phổ biến:</p>
					<div className="flex flex-wrap gap-1.5">
						{SUGGESTED_SKILLS.filter((s) => !skills.includes(s))
							.slice(0, 8)
							.map((s) => (
								<button
									key={s}
									type="button"
									onClick={() => addSkill(s)}
									className="cursor-pointer rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-600 transition-all hover:border-blue-300 hover:text-blue-500"
								>
									+ {s}
								</button>
							))}
					</div>
				</div>
			</div>

			{/* Actions */}
			<div className="grid gap-3 sm:grid-cols-2">
				<Button
					onClick={handleSave}
					disabled={isSaving || isTriggering || !hasSelectedSkills}
					className="cursor-pointer bg-blue-500 text-white shadow-sm shadow-blue-500/20 transition-colors duration-150 hover:bg-blue-600"
				>
					{isSaving
						? "Đang lưu..."
						: hasSavedPreferences
							? "Cập nhật kỹ năng"
							: "Đăng ký"}
				</Button>

				{hasSavedPreferences ? (
					<Button
						onClick={() => deleteSub.mutate(sub._id)}
						disabled={isSaving || isTriggering || isDeleting}
						variant="outline"
						className="cursor-pointer border-rose-200 bg-white text-rose-600 transition-colors duration-150 hover:border-rose-300 hover:bg-rose-50"
					>
						<BellOff className="mr-2 h-4 w-4" />
						{isDeleting ? "Đang hủy..." : "Hủy đăng ký"}
					</Button>
				) : (
					<Button
						onClick={handleStartNotifications}
						disabled={isSaving || isTriggering || !hasSelectedSkills}
						variant="outline"
						className="cursor-pointer border-blue-200 bg-white text-blue-600 transition-colors duration-150 hover:border-blue-300 hover:bg-blue-50"
					>
						<Mail className="mr-2 h-4 w-4" />
						{isTriggering ? "Đang gửi email..." : subscribeLabel}
					</Button>
				)}
			</div>

			{/* Email preview row */}
			{hasSavedPreferences && user && (
				<div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-600">
					<Bell className="h-3.5 w-3.5 shrink-0 text-slate-400" />
					<span className="truncate">
						Email nhận thông báo:{" "}
						<span className="font-medium text-slate-900">{user.email}</span>
					</span>
				</div>
			)}
		</div>
	);
}
