import "./index.css";
import {
	QueryClient,
	QueryClientProvider,
	keepPreviousData,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "@/components/ui/sonner";
import App from "./App";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			staleTime: 5 * 60 * 1000, // 5 phút
			placeholderData: keepPreviousData,
		},
	},
});

createRoot(document.getElementById("root")!).render(
	<GoogleOAuthProvider clientId={googleClientId}>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
			<Toaster richColors position="top-right" duration={2000} />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	</GoogleOAuthProvider>,
);
