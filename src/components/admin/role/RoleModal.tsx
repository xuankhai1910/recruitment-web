import { useEffect, useState, useMemo } from "react";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { permissionsApi } from "@/api/permissions.api";
import { rolesApi } from "@/api/roles.api";
import { colorMethodBg } from "@/lib/constants";
import type { Permission } from "@/types/permission";
import type { CreateRoleDto } from "@/types/role";

interface RoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string | null;
}

export function RoleModal({ open, onOpenChange, roleId }: RoleModalProps) {
  const isEdit = !!roleId;
  const qc = useQueryClient();

  const [form, setForm] = useState<Omit<CreateRoleDto, "permissions">>({
    name: "",
    description: "",
    isActive: true,
  });
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Fetch all permissions
  const { data: permData } = useQuery({
    queryKey: ["permissions", "all"],
    queryFn: () =>
      permissionsApi.getList({ current: 1, pageSize: 100 }).then((r) => r.data.data),
    enabled: open,
  });

  const allPermissions = permData?.result ?? [];

  // Group by module
  const grouped = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of allPermissions) {
      const list = map.get(p.module) ?? [];
      list.push(p);
      map.set(p.module, list);
    }
    return map;
  }, [allPermissions]);

  // Fetch role for editing
  const { data: role, isLoading: fetchingRole } = useQuery({
    queryKey: ["roles", roleId],
    queryFn: () => rolesApi.getById(roleId!).then((r) => r.data.data),
    enabled: !!roleId && open,
  });

  useEffect(() => {
    if (role) {
      setForm({ name: role.name, description: role.description, isActive: role.isActive });
      const ids = new Set<string>();
      for (const p of role.permissions) {
        ids.add(typeof p === "string" ? p : p._id);
      }
      setCheckedIds(ids);
    } else if (!roleId) {
      setForm({ name: "", description: "", isActive: true });
      setCheckedIds(new Set());
    }
  }, [role, roleId, open]);

  const togglePermission = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleModule = (module: string) => {
    const perms = grouped.get(module) ?? [];
    const allChecked = perms.every((p) => checkedIds.has(p._id));
    setCheckedIds((prev) => {
      const next = new Set(prev);
      for (const p of perms) {
        if (allChecked) next.delete(p._id);
        else next.add(p._id);
      }
      return next;
    });
  };

  const toggleCollapse = (module: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(module)) next.delete(module);
      else next.add(module);
      return next;
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateRoleDto) => rolesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Tạo vai trò thành công");
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateRoleDto>) => rolesApi.update(roleId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Cập nhật thành công");
      onOpenChange(false);
    },
  });

  const submitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateRoleDto = {
      ...form,
      permissions: Array.from(checkedIds),
    };
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa vai trò" : "Tạo mới vai trò"}</DialogTitle>
        </DialogHeader>

        {isEdit && fetchingRole ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-sky-700" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="role-name">Tên vai trò</Label>
              <Input
                id="role-name"
                required
                value={form.name}
                onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); }}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={form.isActive}
                onCheckedChange={(v) => { setForm((p) => ({ ...p, isActive: !!v })); }}
              />
              <span className="text-sm">Active</span>
            </label>

            <div className="space-y-2">
              <Label htmlFor="role-desc">Mô tả</Label>
              <Textarea
                id="role-desc"
                rows={3}
                value={form.description}
                onChange={(e) => { setForm((p) => ({ ...p, description: e.target.value })); }}
              />
            </div>

            <Separator />

            {/* Permissions grouped by module */}
            <div className="space-y-3">
              <Label>Quyền hạn</Label>
              {Array.from(grouped.entries()).map(([module, perms]) => {
                const allChecked = perms.every((p) => checkedIds.has(p._id));
                const someChecked = perms.some((p) => checkedIds.has(p._id));
                const isCollapsed = collapsed.has(module);

                return (
                  <div key={module} className="rounded-lg border border-border/60">
                    {/* Module header */}
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 bg-muted/40 cursor-pointer select-none"
                      onClick={() => { toggleCollapse(module); }}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Checkbox
                        checked={allChecked ? true : someChecked ? "indeterminate" : false}
                        onCheckedChange={() => { toggleModule(module); }}
                        onClick={(e) => { e.stopPropagation(); }}
                      />
                      <span className="text-sm font-semibold">{module}</span>
                      <span className="text-xs text-muted-foreground">
                        ({perms.filter((p) => checkedIds.has(p._id)).length}/{perms.length})
                      </span>
                    </div>

                    {/* Permission list */}
                    {!isCollapsed && (
                      <div className="divide-y divide-border/40">
                        {perms.map((perm) => (
                          <label
                            key={perm._id}
                            className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-accent/30 transition-colors duration-150"
                          >
                            <Checkbox
                              checked={checkedIds.has(perm._id)}
                              onCheckedChange={() => { togglePermission(perm._id); }}
                            />
                            <span className="text-sm flex-1">{perm.name}</span>
                            <Badge
                              variant="outline"
                              className={`font-mono text-[10px] ${colorMethodBg(perm.method)}`}
                            >
                              {perm.method}
                            </Badge>
                            <code className="text-[11px] text-muted-foreground">{perm.apiPath}</code>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
        )}
      </DialogContent>
    </Dialog>
  );
}
