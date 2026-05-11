import { useState } from "react";
import { Outlet } from "react-router-dom";
import { HrSidebar } from "@/components/hr/HrSidebar";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function HrLayout() {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<div className="flex h-screen bg-background">
			{/* Desktop sidebar */}
			<aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:block">
				<HrSidebar />
			</aside>

			{/* Mobile sidebar */}
			<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
				<div className="flex h-14 items-center border-b border-border bg-card px-4 lg:hidden">
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon" className="cursor-pointer">
							<Menu className="h-5 w-5" />
						</Button>
					</SheetTrigger>
					<span className="ml-3 font-heading text-lg font-bold">
						Job<span className="text-primary">Finder</span>{" "}
						<span className="text-xs font-medium text-muted-foreground">
							/ HR
						</span>
					</span>
				</div>
				<SheetContent side="left" className="w-60 p-0">
					<SheetTitle className="sr-only">Menu HR</SheetTitle>
					<HrSidebar
						onNavigate={() => {
							setMobileOpen(false);
						}}
					/>
				</SheetContent>
			</Sheet>

			{/* Main content */}
			<div className="flex flex-1 flex-col overflow-hidden">
				<main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
