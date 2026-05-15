import { useEffect, useState } from "react";
import { Bell, Mail, BellOff } from "lucide-react";
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
export function SubscriberTab() {
	const { user } = useAuthStore();
	const { data: sub, isLoading } = useMySubscriber();
	const createSub = useCreateSubscriber();
	const updateSub = useUpdateSubscriber();
	const deleteSub = useDeleteSubscriber();
	const sendTestJobAlertMail = useSendTestJobAlertMail();
	const [skills, setSkills] = useState<string[]>([]);
	const [skillsInput, setSkillsInput] = useState("");

	useEffect(() => {
		const initial = sub?.skills ?? [];
		setSkills(initial);
		setSkillsInput(initial.join(", "));
	}, [sub]);

	const commitSkillsInput = (raw: string) => {
		const parsed = raw
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		setSkills(parsed);
	};

	const hasSkillChanges =
		skills.length !== (sub?.skills?.length ?? 0) ||
		skills.some((skill) => !(sub?.skills ?? []).includes(skill));

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
	const previewButtonLabel =
		!hasSavedPreferences || hasSkillChanges
			? "Lưu và đăng ký nhận email"
			: "Đăng ký nhận email";

	if (isLoading) {
		return <Skeleton className="h-40 rounded-lg" />;
	}

	return (
		<div className="space-y-4">
			<div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
				<div className="flex items-start gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
						<Bell className="h-5 w-5" />
					</div>
					<div className="space-y-1">
						<p className="text-sm font-semibold">
							Cài đặt email gợi ý việc làm
						</p>
						<p className="text-xs leading-5 text-blue-700">
							Lưu lại những kỹ năng bạn đang có để hệ thống của chúng tôi có thể
							gợi ý việc làm phù hợp với bạn.
						</p>
					</div>
				</div>
			</div>

			<div>
				<Label htmlFor="subscriber-skills" className="mb-1.5 block">
					Kỹ năng quan tâm
				</Label>
				<Input
					id="subscriber-skills"
					value={skillsInput}
					placeholder="VD: React, Node.js, Java"
					onChange={(e) => {
						setSkillsInput(e.target.value);
						commitSkillsInput(e.target.value);
					}}
					onBlur={() => commitSkillsInput(skillsInput)}
				/>
				<p className="mt-1.5 text-xs text-muted-foreground">
					Nhập kỹ năng bạn quan tâm, ngăn cách bằng dấu phẩy.
				</p>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				<Button
					onClick={handleSave}
					disabled={isSaving || isTriggering || !hasSelectedSkills}
					className="cursor-pointer bg-blue-600 text-white transition-colors duration-150 hover:bg-blue-700"
				>
					{isSaving
						? "Đang lưu..."
						: hasSavedPreferences
							? "Cập nhật"
							: "Đăng ký"}
				</Button>

				{hasSavedPreferences ? (
					<Button
						onClick={() => deleteSub.mutate(sub._id)}
						disabled={isSaving || isTriggering || isDeleting}
						variant="outline"
						className="cursor-pointer border-red-200 bg-red-50 text-red-700 transition-colors duration-150 hover:bg-red-100"
					>
						<BellOff className="mr-2 h-4 w-4" />
						{isDeleting ? "Đang hủy..." : "Hủy đăng ký nhận email"}
					</Button>
				) : (
					<Button
						onClick={handleStartNotifications}
						disabled={isSaving || isTriggering || !hasSelectedSkills}
						variant="outline"
						className="cursor-pointer border-blue-200 bg-blue-50 text-blue-700 transition-colors duration-150 hover:bg-blue-100"
					>
						<Mail className="mr-2 h-4 w-4" />
						{isTriggering ? "Đang gửi email kiểm tra..." : previewButtonLabel}
					</Button>
				)}
			</div>
		</div>
	);
}
