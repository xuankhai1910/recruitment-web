import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Briefcase, Loader2, Mail, Send } from "lucide-react";

import { useForgotPassword } from "@/hooks/useAuth";

const fieldWrap =
	"flex h-11 items-center gap-2.5 rounded-lg border-[1.5px] border-line bg-white px-3.5 transition-colors focus-within:border-ink";
const inputCls =
	"min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400";

export function ForgotPasswordPage() {
	const forgotPassword = useForgotPassword();
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		forgotPassword.mutate(
			{ email },
			{
				onSuccess: () => {
					setSubmitted(true);
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
					Quên mật khẩu
				</h1>
				<p className="mt-2 text-[15px] leading-6 text-slate-600">
					Nhập email tài khoản để nhận liên kết đặt lại mật khẩu.
				</p>

				<form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
					<div className="flex flex-col gap-1.5">
						<label htmlFor="forgot-email" className="text-[13px] font-medium text-ink">
							Email
						</label>
						<div className={fieldWrap}>
							<Mail className="h-4 w-4 shrink-0 text-slate-400" />
							<input
								id="forgot-email"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={forgotPassword.isPending}
								className={inputCls}
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={forgotPassword.isPending}
						className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
					>
						{forgotPassword.isPending ? (
							<>
								<Loader2 className="h-[18px] w-[18px] animate-spin" />
								Đang gửi...
							</>
						) : (
							<>
								<Send className="h-[18px] w-[18px]" />
								Gửi liên kết
							</>
						)}
					</button>
				</form>

				{submitted && (
					<div className="mt-5 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-800">
						Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi.
					</div>
				)}

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
