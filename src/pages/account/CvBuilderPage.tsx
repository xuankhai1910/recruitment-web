import { FileEdit } from "lucide-react";
import { PageHeader } from "@/components/common/account/PageHeader";
import { CvBuilderTab } from "@/components/common/tab";

export function CvBuilderPage() {
	return (
		<div>
			<PageHeader
				icon={FileEdit}
				title="Tạo CV trực tuyến"
				description="Xây dựng CV chuyên nghiệp để nhà tuyển dụng dễ dàng tìm thấy bạn"
			/>
			<CvBuilderTab />
		</div>
	);
}
