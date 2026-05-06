import { CvBuilderTab } from "@/components/common/tab";

export function CvBuilderPage() {
	return (
		<div className="space-y-4">
			<div>
				<h1 className="font-heading text-lg font-semibold text-foreground">
					Tạo CV trực tuyến
				</h1>
				<p className="text-sm text-muted-foreground">
					Xây dựng CV chuyên nghiệp để nhà tuyển dụng dễ dàng tìm thấy bạn
				</p>
			</div>
			<CvBuilderTab />
		</div>
	);
}
