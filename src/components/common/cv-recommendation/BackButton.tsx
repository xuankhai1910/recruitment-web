import { ArrowLeft } from "lucide-react";

export function BackButton({ onClick }: { onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
		>
			<ArrowLeft className="h-3.5 w-3.5" />
			Quay lại
		</button>
	);
}
