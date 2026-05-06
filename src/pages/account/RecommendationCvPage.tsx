import { RecommendationCvTab } from "@/components/common/tab";

export function RecommendationCvPage() {
	return (
		<div className="space-y-4">
			<div>
				<h1 className="font-heading text-lg font-semibold text-foreground">
					CV gợi ý việc làm
				</h1>
				<p className="text-sm text-muted-foreground">
					AI phân tích CV và gợi ý việc làm phù hợp
				</p>
			</div>
			<RecommendationCvTab />
		</div>
	);
}
