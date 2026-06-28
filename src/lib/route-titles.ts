import { matchRoutes, type RouteObject } from "react-router-dom";

/** Tên thương hiệu hiển thị ở mọi tab trình duyệt. */
export const APP_NAME = "DevMarket";

const TITLE_SEPARATOR = " | ";

/**
 * Ghép tên trang với tên thương hiệu để hiển thị trên tab trình duyệt.
 * Không truyền `title` (vd trang chủ) -> chỉ hiện tên thương hiệu.
 */
export function buildTitle(title?: string | null): string {
  const trimmed = title?.trim();
  return trimmed ? `${trimmed}${TITLE_SEPARATOR}${APP_NAME}` : APP_NAME;
}

type TitledRoute = RouteObject & { title?: string };

/**
 * Bản đồ route -> tiêu đề tab. Path phải khớp với router trong App.tsx.
 * `matchRoutes` tự ưu tiên segment tĩnh hơn segment động
 * (vd `/jobs/recommended` thắng `/jobs/:id`).
 *
 * Các trang chi tiết động (`/jobs/:id`, `/companies/:id`, ...) chỉ đặt
 * tiêu đề mặc định ở đây; bản thân trang sẽ override bằng `useDocumentTitle`
 * để hiện tên thực thể (tên việc làm, tên công ty, tên ứng viên).
 */
const ROUTE_TITLES: TitledRoute[] = [
  // Trang chủ -> chỉ hiện tên thương hiệu
  { path: "/", title: undefined },

  // Auth
  { path: "/login", title: "Đăng nhập" },
  { path: "/register", title: "Đăng ký" },
  { path: "/forgot-password", title: "Quên mật khẩu" },
  { path: "/reset-password", title: "Đặt lại mật khẩu" },
  { path: "/hr/login", title: "Đăng nhập nhà tuyển dụng" },
  { path: "/hr/register", title: "Đăng ký nhà tuyển dụng" },

  // Public / ứng viên
  { path: "/jobs", title: "Việc làm" },
  { path: "/jobs/recommended", title: "Việc làm gợi ý" },
  { path: "/jobs/:id", title: "Chi tiết việc làm" },
  { path: "/companies", title: "Công ty" },
  { path: "/companies/:id", title: "Chi tiết công ty" },
  { path: "/profiles/:userId", title: "Hồ sơ ứng viên" },
  { path: "/profile", title: "Hồ sơ của tôi" },

  // Tài khoản ứng viên
  { path: "/account", title: "Tài khoản" },
  { path: "/account/cv-builder", title: "Tạo CV" },
  { path: "/account/recommendation", title: "Gợi ý CV phù hợp" },
  { path: "/account/resumes", title: "CV đã ứng tuyển" },
  { path: "/account/saved-jobs", title: "Việc làm đã lưu" },
  { path: "/account/notifications", title: "Thông báo" },
  { path: "/account/subscriber", title: "Đăng ký nhận tin" },
  { path: "/account/settings", title: "Cài đặt" },

  // Admin
  { path: "/admin", title: "Dashboard" },
  { path: "/admin/company", title: "Quản lý công ty" },
  { path: "/admin/user", title: "Quản lý người dùng" },
  { path: "/admin/job", title: "Quản lý việc làm" },
  { path: "/admin/resume", title: "Quản lý hồ sơ" },
  { path: "/admin/permission", title: "Quản lý quyền hạn" },
  { path: "/admin/role", title: "Quản lý vai trò" },

  // HR (nhà tuyển dụng)
  { path: "/hr", title: "HR Dashboard" },
  { path: "/hr/jobs", title: "Tin tuyển dụng" },
  { path: "/hr/resumes", title: "Hồ sơ ứng tuyển" },
  { path: "/hr/candidates", title: "Ứng viên" },
  { path: "/hr/candidates/:userId", title: "Chi tiết ứng viên" },
  { path: "/hr/notifications", title: "Thông báo" },
  { path: "/hr/company", title: "Công ty của tôi" },

  // Trang lỗi
  { path: "/403", title: "Truy cập bị từ chối" },
  { path: "*", title: "Không tìm thấy trang" },
];

/**
 * Tìm tiêu đề tab (đã ghép tên thương hiệu) ứng với pathname hiện tại.
 */
export function resolveRouteTitle(pathname: string): string {
  const matches = matchRoutes(ROUTE_TITLES, pathname);
  const matched = matches?.[matches.length - 1]?.route as
    | TitledRoute
    | undefined;
  return buildTitle(matched?.title);
}
