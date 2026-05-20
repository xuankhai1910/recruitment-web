import { Construction, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordTab() {
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		toast.info("Tính năng đổi mật khẩu sẽ sớm được hỗ trợ");
	};

	return (
		<div className="space-y-4">
			<div className="flex items-start gap-3 rounded-lg border border-amber-200/70 bg-amber-50/60 p-3 text-amber-700">
				<Construction className="mt-0.5 h-4 w-4 shrink-0" />
				<p className="text-xs leading-5">
					Tính năng đang phát triển. Form bên dưới chỉ để hiển thị giao diện —
					endpoint đổi mật khẩu sẽ sớm được hỗ trợ.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="current-password" className="text-xs text-slate-600">
							Mật khẩu hiện tại
						</Label>
						<Input
							id="current-password"
							type="password"
							placeholder="••••••••"
							disabled
							className="h-10 bg-slate-50"
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="new-password" className="text-xs text-slate-600">
							Mật khẩu mới
						</Label>
						<Input
							id="new-password"
							type="password"
							placeholder="••••••••"
							disabled
							className="h-10 bg-slate-50"
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="confirm-password" className="text-xs text-slate-600">
							Xác nhận mật khẩu mới
						</Label>
						<Input
							id="confirm-password"
							type="password"
							placeholder="••••••••"
							disabled
							className="h-10 bg-slate-50"
						/>
					</div>
				</div>

				<div className="flex justify-end pt-2">
					<Button
						type="submit"
						disabled
						className="cursor-not-allowed bg-blue-500 px-5 text-white opacity-60"
					>
						<Lock className="mr-2 h-4 w-4" />
						Đổi mật khẩu
					</Button>
				</div>
			</form>
		</div>
	);
}
