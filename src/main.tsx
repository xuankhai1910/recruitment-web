import "./index.css";
import {
	QueryClient,
	QueryClientProvider,
	keepPreviousData,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import App from "./App";

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
	<QueryClientProvider client={queryClient}>
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<BrowserRouter>
				<App />
				x``{" "}
			</BrowserRouter>
			<ReactQueryDevtools initialIsOpen={false} />
		</ThemeProvider>
	</QueryClientProvider>,
);
