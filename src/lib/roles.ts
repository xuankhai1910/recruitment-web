export const ROLE = {
	SUPER_ADMIN: "SUPER_ADMIN",
	HR: "HR",
} as const;

export function getHomeRouteForRole(roleName: string | undefined): string {
	if (roleName === ROLE.SUPER_ADMIN) return "/admin";
	if (roleName === ROLE.HR) return "/hr";
	return "/";
}
