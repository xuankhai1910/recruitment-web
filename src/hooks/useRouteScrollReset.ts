import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_SCROLL_CONTAINER_SELECTOR = "[data-route-scroll-container]";

export function useRouteScrollReset(): void {
	const { pathname } = useLocation();

	useLayoutEffect(() => {
		const previousScrollRestoration = window.history.scrollRestoration;
		window.history.scrollRestoration = "manual";

		window.scrollTo({ top: 0, left: 0 });
		document
			.querySelectorAll<HTMLElement>(ROUTE_SCROLL_CONTAINER_SELECTOR)
			.forEach((container) => {
				container.scrollTo({ top: 0, left: 0 });
			});

		return () => {
			window.history.scrollRestoration = previousScrollRestoration;
		};
	}, [pathname]);
}
