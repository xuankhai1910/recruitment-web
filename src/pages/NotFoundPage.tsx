import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export function NotFoundPage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4">
			<FileQuestion className="h-20 w-20 text-muted-foreground/40" />
			<h1 className="font-heading text-4xl font-bold text-foreground">404</h1>
			<p className="text-muted-foreground">Trang bạn tìm không tồn tại.</p>
			<Button
				asChild
				className="mt-2 cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
			>
				<Link to="/">Về trang chủ</Link>
			</Button>
		</div>
	);
}
