import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Brain, FileText, Lock, UserCircle } from "lucide-react";

import {
	PasswordTab,
	ProfileTab,
	RecommendationCvTab,
	ResumesTab,
	SubscriberTab,
} from "@/components/common/tab";

interface ManageAccountModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ManageAccountModal({
	open,
	onOpenChange,
}: ManageAccountModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex h-[720px] max-h-[92vh] w-[96vw] !max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:!max-w-4xl">
				<DialogHeader className="shrink-0 border-b border-border px-5 py-3">
					<DialogTitle className="font-heading">Qu?n l� t�i kho?n</DialogTitle>
				</DialogHeader>

				<Tabs
					defaultValue="recommendation"
					className="flex min-h-0 flex-1 flex-col gap-0 px-5 pt-3 pb-5"
				>
					<TabsList className="grid w-full shrink-0 grid-cols-2 gap-1 bg-muted p-1 sm:grid-cols-3 md:grid-cols-5">
						<TabsTrigger
							value="recommendation"
							className="min-w-0 gap-1.5 px-2 py-2 "
						>
							<Brain className="h-3.5 w-3.5 shrink-0" />
							<span className="truncate">CV g?i �</span>
						</TabsTrigger>
						<TabsTrigger value="resumes" className="min-w-0 gap-1.5 px-2 py-2">
							<FileText className="h-3.5 w-3.5 shrink-0" />
							<span className="truncate">CV d� g?i</span>
						</TabsTrigger>
						<TabsTrigger
							value="subscriber"
							className="min-w-0 gap-1.5 px-2 py-2"
						>
							<Bell className="h-3.5 w-3.5 shrink-0" />
							<span className="truncate">Nh?n vi?c</span>
						</TabsTrigger>
						<TabsTrigger value="profile" className="min-w-0 gap-1.5 px-2 py-2">
							<UserCircle className="h-3.5 w-3.5 shrink-0" />
							<span className="truncate">Th�ng tin</span>
						</TabsTrigger>
						<TabsTrigger value="password" className="min-w-0 gap-1.5 px-2 py-2">
							<Lock className="h-3.5 w-3.5 shrink-0" />
							<span className="truncate">M?t kh?u</span>
						</TabsTrigger>
					</TabsList>

					<div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
						<TabsContent value="recommendation" className="mt-0">
							<RecommendationCvTab
								onClose={() => {
									onOpenChange(false);
								}}
							/>
						</TabsContent>
						<TabsContent value="resumes" className="mt-0">
							<ResumesTab />
						</TabsContent>
						<TabsContent value="subscriber" className="mt-0">
							<SubscriberTab />
						</TabsContent>
						<TabsContent value="profile" className="mt-0">
							<ProfileTab />
						</TabsContent>
						<TabsContent value="password" className="mt-0">
							<PasswordTab />
						</TabsContent>
					</div>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
