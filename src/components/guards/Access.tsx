import type { ReactNode } from "react";
import { useAuthStore } from "@/stores/auth.store";
import type { PermissionDef } from "@/lib/permissions";
import { ShieldX } from "lucide-react";

interface AccessProps {
  permission: PermissionDef;
  hideChildren?: boolean;
  children: ReactNode;
}

export function Access({
  permission,
  hideChildren = false,
  children,
}: AccessProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) return hideChildren ? null : <AccessDenied />;

  // SUPER_ADMIN bypasses all permission checks
  if (user.role.name === "SUPER_ADMIN") return <>{children}</>;

  const hasPermission = user.permissions.some(
    (p) =>
      p.apiPath === permission.apiPath &&
      p.method === permission.method &&
      p.module === permission.module,
  );

  if (hasPermission) return <>{children}</>;

  return hideChildren ? null : <AccessDenied />;
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <ShieldX className="h-16 w-16 text-destructive/60" />
      <h2 className="font-heading text-xl font-bold text-foreground">
        Truy cập bị từ chối
      </h2>
      <p className="text-sm text-muted-foreground">
        Bạn không có quyền truy cập tài nguyên này.
      </p>
    </div>
  );
}
