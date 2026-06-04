import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { buildTitle, resolveRouteTitle } from "@/lib/route-titles";

/**
 * Đồng bộ tiêu đề tab trình duyệt theo route hiện tại (bản đồ ROUTE_TITLES).
 * Gọi MỘT lần ở App.
 *
 * Dùng `useLayoutEffect` để effect này luôn chạy TRƯỚC `useEffect` của trang,
 * nhờ vậy các trang chi tiết override bằng `useDocumentTitle` (useEffect) luôn
 * ghi đè được tiêu đề mặc định, không bị tranh chấp khi điều hướng.
 */
export function useRouteDocumentTitle(): void {
	const { pathname } = useLocation();
	useLayoutEffect(() => {
		document.title = resolveRouteTitle(pathname);
	}, [pathname]);
}

/**
 * Override tiêu đề tab cho trang chi tiết động (tên việc làm, công ty, ứng viên...).
 * Tự ghép tên thương hiệu. Truyền `undefined`/chuỗi rỗng (vd khi đang tải dữ liệu)
 * thì giữ nguyên tiêu đề mặc định theo route.
 */
export function useDocumentTitle(title?: string | null): void {
	useEffect(() => {
		if (title == null || title.trim() === "") return;
		document.title = buildTitle(title);
	}, [title]);
}
