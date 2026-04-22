import { Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function PasswordTab() {
	return (
		<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-12 text-center">
			<Lock className="h-10 w-10 text-muted-foreground/40" />
			<div>
				<p className="font-heading text-sm font-semibold text-foreground">
					Tính năng đang phát triển
				</p>
				<p className="mt-1 text-xs text-muted-foreground">
					Endpoint đổi mật khẩu sẽ sớm được hỗ trợ.
				</p>
			</div>
			<Button
				variant="outline"
				disabled
				className="mt-2"
				onClick={() => {
					toast.info("Tính năng đang phát triển");
				}}
			>
				Đổi mật khẩu
			</Button>
		</div>
	);
}
