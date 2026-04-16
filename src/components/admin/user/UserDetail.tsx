import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/constants";
import type { User } from "@/types/user";

interface UserDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserDetail({ open, onOpenChange, user }: UserDetailProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Thông tin người dùng</DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <InfoItem label="Tên hiển thị" value={user.name} />
          <InfoItem label="Email" value={user.email} />
          <InfoItem label="Giới tính" value={user.gender === "MALE" ? "Nam" : user.gender === "FEMALE" ? "Nữ" : "Khác"} />
          <InfoItem label="Tuổi" value={String(user.age)} />
          <InfoItem label="Vai trò">
            <Badge variant="secondary" className="font-normal">
              {user.role?.name ?? "—"}
            </Badge>
          </InfoItem>
          <InfoItem label="Địa chỉ" value={user.address} />
          <InfoItem label="Công ty" value={user.company?.name} span={2} />
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <InfoItem label="Ngày tạo" value={formatDateTime(user.createdAt)} />
          <InfoItem label="Ngày cập nhật" value={formatDateTime(user.updatedAt)} />
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
