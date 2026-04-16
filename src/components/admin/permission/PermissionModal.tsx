import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { permissionsApi } from "@/api/permissions.api";
import { ALL_MODULES } from "@/lib/permissions";
import type { Permission, CreatePermissionDto } from "@/types/permission";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

interface PermissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission: Permission | null;
}

export function PermissionModal({ open, onOpenChange, permission }: PermissionModalProps) {
  const isEdit = !!permission;
  const qc = useQueryClient();

  const [form, setForm] = useState<CreatePermissionDto>({
    name: "",
    apiPath: "",
    method: "GET",
    module: "",
  });

  useEffect(() => {
    if (permission) {
      setForm({
        name: permission.name,
        apiPath: permission.apiPath,
        method: permission.method,
        module: permission.module,
      });
    } else {
      setForm({ name: "", apiPath: "", method: "GET", module: "" });
    }
  }, [permission, open]);

  const createMutation = useMutation({
    mutationFn: (data: CreatePermissionDto) => permissionsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Tạo permission thành công");
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreatePermissionDto>) =>
      permissionsApi.update(permission!._id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Cập nhật thành công");
      onOpenChange(false);
    },
  });

  const submitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa Permission" : "Tạo mới Permission"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="perm-name">Tên</Label>
            <Input
              id="perm-name"
              required
              value={form.name}
              onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="perm-api">API Path</Label>
            <Input
              id="perm-api"
              required
              value={form.apiPath}
              onChange={(e) => { setForm((p) => ({ ...p, apiPath: e.target.value })); }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Method</Label>
              <Select
                value={form.method}
                onValueChange={(v) => { setForm((p) => ({ ...p, method: v })); }}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m} value={m} className="cursor-pointer">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Module</Label>
              <Select
                value={form.module}
                onValueChange={(v) => { setForm((p) => ({ ...p, module: v })); }}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Chọn module" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_MODULES.map((m) => (
                    <SelectItem key={m} value={m} className="cursor-pointer">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => { onOpenChange(false); }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="cursor-pointer bg-sky-700 hover:bg-sky-800 transition-colors duration-150"
            >
              {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {isEdit ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
