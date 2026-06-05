import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
	ArrowLeft,
	Briefcase,
	Eye,
	EyeOff,
	Loader2,
	Lock,
} from "lucide-react";

import { useResetPassword } from "@/hooks/useAuth";

const fieldWrap =
	"flex h-11 items-center gap-2.5 rounded-lg border-[1.5px] border-line bg-white px-3.5 transition-colors focus-within:border-ink";
const inputCls =
	"min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400";

export function ResetPasswordPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token") ?? "";
	const resetPassword = useResetPassword();
	const missingTokenToastShown = useRef(false);
	const [showPassword, setShowPassword] = useState(false);
	const [form, setForm] = useState({
		newPassword: "",
		confirmPassword: "",
	});

	useEffect(() => {
		if (!token && !missingTokenToastShown.current) {
			missingTokenToastShown.current = true;
			toast.error("Liên kết đặt lại mật khẩu không hợp lệ");
		}
	}, [token]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		if (!token) {
			toast.error("Liên kết đặt lại mật khẩu không hợp lệ");
			return;
		}

		if (form.newPassword.length < 6 || form.newPassword.length > 15) {
			toast.error("Mật khẩu mới phải từ 6 đến 15 ký tự");
			return;
		}

		if (form.newPassword !== form.confirmPassword) {
			toast.error("Xác nhận mật khẩu mới không khớp");
			return;
		}

		resetPassword.mutate(
			{
				token,
				newPassword: form.newPassword,
				confirmPassword: form.confirmPassword,
			},
			{
				onSuccess: () => {
					navigate("/login", { replace: true });
				},
			},
		);
	};

	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-cream px-6 py-16">
			<div className="w-full max-w-[420px]">
				<Link
					to="/"
					className="mb-10 inline-flex items-center gap-2 text-ink"
				>
					<span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-teal-400">
						<Briefcase className="h-4.5 w-4.5" />
					</span>
					<span className="font-display text-xl font-bold tracking-tight">
						DevMarket
					</span>
				</Link>

				<h1 className="font-display text-[32px] font-bold tracking-tight text-ink">
					Đặt lại mật khẩu
				</h1>
				<p className="mt-2 text-[15px] leading-6 text-slate-600">
					Tạo mật khẩu mới cho tài khoản DevMarket của bạn.
				</p>

				<form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
					<PasswordField
						id="reset-new-password"
						label="Mật khẩu mới"
						value={form.newPassword}
						showPassword={showPassword}
						disabled={resetPassword.isPending || !token}
						onChange={(value) =>
							setForm((prev) => ({ ...prev, newPassword: value }))
						}
						onToggle={() => setShowPassword((prev) => !prev)}
					/>
					<PasswordField
						id="reset-confirm-password"
						label="Xác nhận mật khẩu mới"
						value={form.confirmPassword}
						showPassword={showPassword}
						disabled={resetPassword.isPending || !token}
						onChange={(value) =>
							setForm((prev) => ({ ...prev, confirmPassword: value }))
						}
						onToggle={() => setShowPassword((prev) => !prev)}
					/>

					<p className="text-xs text-slate-400">
						Mật khẩu mới cần dài từ 6 đến 15 ký tự.
					</p>

					<button
						type="submit"
						disabled={resetPassword.isPending || !token}
						className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
					>
						{resetPassword.isPending ? (
							<>
								<Loader2 className="h-[18px] w-[18px] animate-spin" />
								Đang cập nhật...
							</>
						) : (
							<>
								<Lock className="h-[18px] w-[18px]" />
								Đặt lại mật khẩu
							</>
						)}
					</button>
				</form>

				<Link
					to="/login"
					className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:underline"
				>
					<ArrowLeft className="h-4 w-4" />
					Quay lại đăng nhập
				</Link>
			</div>
		</div>
	);
}

function PasswordField({
	id,
	label,
	value,
	showPassword,
	disabled,
	onChange,
	onToggle,
}: {
	id: string;
	label: string;
	value: string;
	showPassword: boolean;
	disabled: boolean;
	onChange: (value: string) => void;
	onToggle: () => void;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label htmlFor={id} className="text-[13px] font-medium text-ink">
				{label}
			</label>
			<div className={fieldWrap}>
				<Lock className="h-4 w-4 shrink-0 text-slate-400" />
				<input
					id={id}
					type={showPassword ? "text" : "password"}
					placeholder="6 - 15 ký tự"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					required
					minLength={6}
					maxLength={15}
					disabled={disabled}
					autoComplete="new-password"
					className={inputCls}
				/>
				<button
					type="button"
					onClick={onToggle}
					disabled={disabled}
					className="grid place-items-center text-slate-400 transition-colors hover:text-slate-600 disabled:pointer-events-none disabled:opacity-50"
					aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
				>
					{showPassword ? (
						<EyeOff className="h-4 w-4" />
					) : (
						<Eye className="h-4 w-4" />
					)}
				</button>
			</div>
		</div>
	);
}
