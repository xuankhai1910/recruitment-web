import { Settings, ShieldCheck, UserCircle } from "lucide-react";
import { PageHeader } from "@/components/common/account/PageHeader";
import { PasswordTab, ProfileTab } from "@/components/common/tab";

export function SettingsPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				icon={Settings}
				title="Cài đặt tài khoản"
				description="Quản lý thông tin cá nhân và bảo mật"
				tone="blue"
			/>

			<section className="rounded-xl border border-line bg-white p-6">
				<header className="mb-4 flex items-center gap-2.5">
					<div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-500">
						<UserCircle className="h-4 w-4" />
					</div>
					<div>
						<h2 className="font-heading text-sm font-semibold text-slate-900">
							Thông tin cá nhân
						</h2>
						<p className="text-xs text-slate-500">
							Cập nhật tên, tuổi, giới tính và địa chỉ liên hệ
						</p>
					</div>
				</header>
				<ProfileTab />
			</section>

			<section className="rounded-xl border border-line bg-white p-6">
				<header className="mb-4 flex items-center gap-2.5">
					<div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-500">
						<ShieldCheck className="h-4 w-4" />
					</div>
					<div>
						<h2 className="font-heading text-sm font-semibold text-slate-900">
							Bảo mật
						</h2>
						<p className="text-xs text-slate-500">
							Đổi mật khẩu và quản lý tùy chọn bảo mật khác
						</p>
					</div>
				</header>
				<PasswordTab />
			</section>
		</div>
	);
}
