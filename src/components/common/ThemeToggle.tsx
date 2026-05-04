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
			className="h-9 w-9 cursor-pointer rounded-md transition-colors duration-150 hover:bg-muted"
			onClick={() => {
				setTheme(isDark ? "light" : "dark");
			}}
		>
			{mounted ? (
				isDark ? (
					<Sun className="h-4 w-4 text-foreground/80" />
				) : (
					<Moon className="h-4 w-4 text-foreground/80" />
				)
			) : (
				<Sun className="h-4 w-4 text-foreground/80" />
			)}
		</Button>
	);
}
