import { PasswordTab, ProfileTab } from "@/components/common/tab";
import { Separator } from "@/components/ui/separator";

export function SettingsPage() {
	return (
		<div className="space-y-4">
			<div>
				<h1 className="font-heading text-lg font-semibold text-foreground">
					Cài đặt tài khoản
				</h1>
				<p className="text-sm text-muted-foreground">
					Thông tin cá nhân và bảo mật
				</p>
			</div>
			<ProfileTab />
			<Separator className="my-6" />
			<div>
				<h2 className="font-heading text-base font-semibold text-foreground mb-3">
					Đổi mật khẩu
				</h2>
				<PasswordTab />
			</div>
		</div>
	);
}
