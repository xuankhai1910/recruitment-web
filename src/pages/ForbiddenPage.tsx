import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

export function ForbiddenPage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4">
			<ShieldX className="h-20 w-20 text-destructive/40" />
			<h1 className="font-heading text-4xl font-bold text-foreground">403</h1>
			<p className="text-muted-foreground">
				Bạn không có quyền truy cập trang này.
			</p>
			<Button
				asChild
				className="mt-2 cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
			>
				<Link to="/">Về trang chủ</Link>
			</Button>
		</div>
	);
}
