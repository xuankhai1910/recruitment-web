import { Brain } from "lucide-react";
import { PageHeader } from "@/components/common/account/PageHeader";
import { RecommendationCvTab } from "@/components/common/tab";

export function RecommendationCvPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				icon={Brain}
				title="CV gợi ý việc làm"
				description="AI phân tích CV của bạn và đề xuất việc làm phù hợp nhất"
				tone="emerald"
			/>
			<RecommendationCvTab />
		</div>
	);
}
