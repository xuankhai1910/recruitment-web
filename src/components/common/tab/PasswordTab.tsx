import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePassword } from "@/hooks/useAuth";

type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";

const emptyForm = {
	currentPassword: "",
	newPassword: "",
	confirmPassword: "",
};

export function PasswordTab() {
	const changePassword = useChangePassword();
	const [form, setForm] = useState(emptyForm);
	const [visible, setVisible] = useState<Record<PasswordField, boolean>>({
		currentPassword: false,
		newPassword: false,
		confirmPassword: false,
	});

	const updateField = (field: PasswordField, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const toggleVisible = (field: PasswordField) => {
		setVisible((prev) => ({ ...prev, [field]: !prev[field] }));
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		if (form.newPassword.length < 6 || form.newPassword.length > 15) {
			toast.error("Mật khẩu mới phải từ 6 đến 15 ký tự");
			return;
		}

		if (form.newPassword !== form.confirmPassword) {
			toast.error("Xác nhận mật khẩu mới không khớp");
			return;
		}

		changePassword.mutate(form, {
			onSuccess: () => {
				setForm(emptyForm);
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<PasswordInput
					id="current-password"
					label="Mật khẩu hiện tại"
					value={form.currentPassword}
					visible={visible.currentPassword}
					disabled={changePassword.isPending}
					onChange={(value) => updateField("currentPassword", value)}
					onToggle={() => toggleVisible("currentPassword")}
					autoComplete="current-password"
					className="sm:col-span-2"
				/>
				<PasswordInput
					id="new-password"
					label="Mật khẩu mới"
					value={form.newPassword}
					visible={visible.newPassword}
					disabled={changePassword.isPending}
					onChange={(value) => updateField("newPassword", value)}
					onToggle={() => toggleVisible("newPassword")}
					autoComplete="new-password"
				/>
				<PasswordInput
					id="confirm-password"
					label="Xác nhận mật khẩu mới"
					value={form.confirmPassword}
					visible={visible.confirmPassword}
					disabled={changePassword.isPending}
					onChange={(value) => updateField("confirmPassword", value)}
					onToggle={() => toggleVisible("confirmPassword")}
					autoComplete="new-password"
				/>
			</div>

			<p className="text-xs text-slate-400">
				Mật khẩu mới cần dài từ 6 đến 15 ký tự.
			</p>

			<div className="flex justify-end pt-2">
				<Button
					type="submit"
					disabled={changePassword.isPending}
					className="h-10 bg-teal-500 px-5 text-white hover:bg-teal-600 disabled:pointer-events-none disabled:opacity-50"
				>
					{changePassword.isPending ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<Lock className="mr-2 h-4 w-4" />
					)}
					{changePassword.isPending ? "Đang đổi..." : "Đổi mật khẩu"}
				</Button>
			</div>
		</form>
	);
}

function PasswordInput({
	id,
	label,
	value,
	visible,
	disabled,
	onChange,
	onToggle,
	autoComplete,
	className = "",
}: {
	id: string;
	label: string;
	value: string;
	visible: boolean;
	disabled: boolean;
	onChange: (value: string) => void;
	onToggle: () => void;
	autoComplete: string;
	className?: string;
}) {
	return (
		<div className={`space-y-1.5 ${className}`}>
			<Label htmlFor={id} className="text-xs text-slate-600">
				{label}
			</Label>
			<div className="relative">
				<Input
					id={id}
					type={visible ? "text" : "password"}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					required
					minLength={6}
					maxLength={15}
					disabled={disabled}
					autoComplete={autoComplete}
					className="h-10 pr-10"
				/>
				<button
					type="button"
					onClick={onToggle}
					disabled={disabled}
					className="absolute right-3 top-1/2 grid -translate-y-1/2 place-items-center text-slate-400 transition-colors hover:text-slate-600 disabled:pointer-events-none disabled:opacity-50"
					aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
				>
					{visible ? (
						<EyeOff className="h-4 w-4" />
					) : (
						<Eye className="h-4 w-4" />
					)}
				</button>
			</div>
		</div>
	);
}
