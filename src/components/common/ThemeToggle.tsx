import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { theme, resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const current = (theme === "system" ? resolvedTheme : theme) ?? "light";
	const isDark = current === "dark";

	return (
		<Button
			variant="ghost"
			size="icon"
			aria-label="Chuyển đổi giao diện sáng/tối"
			className="h-9 w-9 cursor-pointer rounded-md text-slate-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
			onClick={() => {
				setTheme(isDark ? "light" : "dark");
			}}
		>
			{mounted ? (
				isDark ? (
					<Sun className="h-4 w-4" />
				) : (
					<Moon className="h-4 w-4" />
				)
			) : (
				<Sun className="h-4 w-4" />
			)}
		</Button>
	);
}
