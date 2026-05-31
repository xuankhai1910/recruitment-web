import { Outlet } from "react-router-dom";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

export function MainLayout() {
	return (
		<div className="flex min-h-screen flex-col bg-cream font-sans text-slate-900">
			<Header />
			<main className="min-h-[calc(100vh-4.5rem)] flex-1 pb-12">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}
