import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { colorMethodBg, formatDateTime } from "@/lib/constants";
import type { Permission } from "@/types/permission";

interface PermissionDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission: Permission | null;
}

export function PermissionDetail({
  open,
  onOpenChange,
  permission,
}: PermissionDetailProps) {
  if (!permission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Chi tiết Permission</DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <InfoItem label="Tên" value={permission.name} span={2} />
          <InfoItem label="API Path">
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {permission.apiPath}
            </code>
          </InfoItem>
          <InfoItem label="Method">
            <Badge
              variant="outline"
              className={`font-mono text-xs ${colorMethodBg(permission.method)}`}
            >
              {permission.method}
            </Badge>
          </InfoItem>
          <InfoItem label="Module">
            <Badge variant="secondary" className="font-normal">
              {permission.module}
            </Badge>
          </InfoItem>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <InfoItem
            label="Ngày tạo"
            value={formatDateTime(permission.createdAt)}
          />
          <InfoItem
            label="Ngày cập nhật"
            value={formatDateTime(permission.updatedAt)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({
  label,
  value,
  children,
  span,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
  span?: number;
}) {
  return (
    <div className={span === 2 ? "col-span-2" : ""}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-0.5 text-sm text-foreground">
        {children ?? value ?? "—"}
      </div>
    </div>
  );
}
