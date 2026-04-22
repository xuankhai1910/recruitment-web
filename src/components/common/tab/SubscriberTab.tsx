import { useEffect, useState } from "react";
import { Bell, ChevronDown, Mail } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useSendTestJobAlertMail } from "@/hooks/useMail";
import {
	useCreateSubscriber,
	useMySubscriber,
	useUpdateSubscriber,
} from "@/hooks/useSubscribers";
import { SKILLS_LIST } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth.store";

export function SubscriberTab() {
	const { user } = useAuthStore();
	const { data: sub, isLoading } = useMySubscriber();
	const createSub = useCreateSubscriber();
	const updateSub = useUpdateSubscriber();
	const sendTestJobAlertMail = useSendTestJobAlertMail();
	const [skills, setSkills] = useState<string[]>([]);
	const [pickerOpen, setPickerOpen] = useState(false);

	useEffect(() => {
		setSkills(sub?.skills ?? []);
	}, [sub]);

	const hasSkillChanges =
		skills.length !== (sub?.skills?.length ?? 0) ||
		skills.some((skill) => !(sub?.skills ?? []).includes(skill));

	const toggle = (s: string) => {
		setSkills((prev) =>
			prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
		);
	};

	const saveSubscriber = async () => {
		if (!user) return;
		if (sub) {
			return updateSub.mutateAsync({ skills });
		} else {
			return createSub.mutateAsync({
				name: user.name,
				email: user.email,
				skills,
			});
		}
	};

	const handleSave = async () => {
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
	const isTriggering = sendTestJobAlertMail.isPending;
	const hasSavedPreferences = !!sub;
	const hasSelectedSkills = skills.length > 0;
	const previewButtonLabel =
		!hasSavedPreferences || hasSkillChanges
			? "Lưu và đăng ký nhận email"
			: "Đăng ký nhận email";

	if (isLoading) {
		return <Skeleton className="h-40 rounded-lg" />;
	}

	return (
		<div className="space-y-4">
			<div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-sky-950">
				<div className="flex items-start gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
						<Bell className="h-5 w-5" />
					</div>
					<div className="space-y-1">
						<p className="text-sm font-semibold">
							Cài đặt email gợi ý việc làm
						</p>
						<p className="text-xs leading-5 text-sky-800">
							Lưu lại những kỹ năng bạn đang có để hệ thống của chúng tôi có thể
							gợi ý việc làm phù hợp với bạn.
						</p>
					</div>
				</div>
			</div>

			<div>
				<Label className="mb-1.5 block">Kỹ năng quan tâm</Label>
				<Popover open={pickerOpen} onOpenChange={setPickerOpen}>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-accent/30"
						>
							<div className="flex flex-1 flex-wrap gap-1.5">
								{skills.length === 0 ? (
									<span className="text-muted-foreground">Chọn kỹ năng...</span>
								) : (
									skills.map((s) => (
										<Badge key={s} variant="secondary" className="font-normal">
											{s}
										</Badge>
									))
								)}
							</div>
							<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
						</button>
					</PopoverTrigger>
					<PopoverContent align="start" className="w-72 gap-0 p-0">
						<div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
							<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								{skills.length}/{SKILLS_LIST.length} đã chọn
							</span>
							{skills.length === SKILLS_LIST.length ? (
								<button
									type="button"
									onClick={() => {
										setSkills([]);
									}}
									className="cursor-pointer text-xs font-medium text-primary transition-colors duration-150 hover:text-primary/80"
								>
									Bỏ chọn tất cả
								</button>
							) : (
								<button
									type="button"
									onClick={() => {
										setSkills([...SKILLS_LIST]);
									}}
									className="cursor-pointer text-xs font-medium text-primary transition-colors duration-150 hover:text-primary/80"
								>
									Chọn tất cả
								</button>
							)}
						</div>
						<div
							className="max-h-64 overflow-y-auto overscroll-contain p-1.5"
							onWheel={(e) => {
								e.stopPropagation();
							}}
						>
							{SKILLS_LIST.map((s) => {
								const checked = skills.includes(s);
								return (
									<label
										key={s}
										className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors duration-150 hover:bg-accent"
									>
										<Checkbox
											checked={checked}
											onCheckedChange={() => {
												toggle(s);
											}}
											className="cursor-pointer"
										/>
										<span className={checked ? "font-medium" : ""}>{s}</span>
									</label>
								);
							})}
						</div>
					</PopoverContent>
				</Popover>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				<Button
					onClick={handleSave}
					disabled={isSaving || isTriggering}
					className="cursor-pointer bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
				>
					{isSaving ? "Đang lưu..." : sub ? "Cập nhật" : "Đăng ký"}
				</Button>

				<Button
					onClick={handleStartNotifications}
					disabled={isSaving || isTriggering || !hasSelectedSkills}
					variant="outline"
					className="cursor-pointer border-emerald-300 bg-emerald-50 text-emerald-700 transition-colors duration-150 hover:bg-emerald-100"
				>
					<Mail className="mr-2 h-4 w-4" />
					{isTriggering ? "Đang gửi email kiểm tra..." : previewButtonLabel}
				</Button>
			</div>
		</div>
	);
}
