import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import { rolesApi } from "@/api/roles.api";
import { companiesApi } from "@/api/companies.api";
import type { User } from "@/types/user";
import type { Role } from "@/types/role";
import type { Company } from "@/types/company";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserModal({ open, onOpenChange, user }: UserModalProps) {
  const isEdit = !!user;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const loading = createMutation.isPending || updateMutation.isPending;

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("MALE");
  const [roleId, setRoleId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [address, setAddress] = useState("");

  // Dropdown data
  const [roles, setRoles] = useState<Role[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  // Fetch roles + companies when modal opens
  useEffect(() => {
    if (open) {
      rolesApi
        .getList({ current: 1, pageSize: 100 })
        .then((r) => { setRoles(r.data.data.result); });
      companiesApi
        .getList({ current: 1, pageSize: 100 })
        .then((r) => { setCompanies(r.data.data.result); });
    }
  }, [open]);

  // Reset form
  useEffect(() => {
    if (open) {
      if (user) {
        setEmail(user.email);
        setPassword("");
        setName(user.name);
        setAge(String(user.age));
        setGender(user.gender);
        setRoleId(user.role?._id ?? "");
        setCompanyId(user.company?._id ?? "");
        setAddress(user.address);
      } else {
        setEmail("");
        setPassword("");
        setName("");
        setAge("");
        setGender("MALE");
        setRoleId("");
        setCompanyId("");
        setAddress("");
      }
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCompany = companies.find((c) => c._id === companyId);
    const company = selectedCompany
      ? { _id: selectedCompany._id, name: selectedCompany.name }
      : undefined;

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: user._id,
          data: {
            name,
            age: Number(age),
            gender,
            role: roleId,
            company,
            address,
          },
        });
      } else {
        await createMutation.mutateAsync({
          email,
          password,
          name,
          age: Number(age),
          gender,
          role: roleId,
          company,
          address,
        });
      }
      onOpenChange(false);
    } catch {
      // toasts handled by hooks
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật người dùng" : "Tạo người dùng mới"}
          </DialogTitle>
        </DialogHeader>

        <Separator />

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto pr-1"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            {/* Email — full width */}
            <div className="space-y-1.5 sm:col-span-6">
              <Label htmlFor="user-email">Email <span className="text-destructive">*</span></Label>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); }}
                disabled={isEdit}
                required={!isEdit}
                placeholder="user@example.com"
              />
            </div>

            {/* Password — full width, only on create */}
            {!isEdit && (
              <div className="space-y-1.5 sm:col-span-6">
                <Label htmlFor="user-password">Mật khẩu <span className="text-destructive">*</span></Label>
                <Input
                  id="user-password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); }}
                  required
                  placeholder="6-15 ký tự"
                />
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5 sm:col-span-3">
              <Label htmlFor="user-name">Tên hiển thị <span className="text-destructive">*</span></Label>
              <Input
                id="user-name"
                value={name}
                onChange={(e) => { setName(e.target.value); }}
                required
                placeholder="Nguyễn Văn A"
              />
            </div>

            {/* Age */}
            <div className="space-y-1.5 sm:col-span-3">
              <Label htmlFor="user-age">Tuổi <span className="text-destructive">*</span></Label>
              <Input
                id="user-age"
                type="number"
                value={age}
                onChange={(e) => { setAge(e.target.value); }}
                required
                min={1}
                max={100}
              />
            </div>

            {/* Gender + Role + Company — 3 columns same row */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Giới tính <span className="text-destructive">*</span></Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE" className="cursor-pointer">Nam</SelectItem>
                  <SelectItem value="FEMALE" className="cursor-pointer">Nữ</SelectItem>
                  <SelectItem value="OTHER" className="cursor-pointer">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Vai trò <span className="text-destructive">*</span></Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r._id} value={r._id} className="cursor-pointer">
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Thuộc công ty</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Chọn công ty" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c._id} value={c._id} className="cursor-pointer">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Address — full width */}
            <div className="space-y-1.5 sm:col-span-6">
              <Label htmlFor="user-address">Địa chỉ <span className="text-destructive">*</span></Label>
              <Input
                id="user-address"
                value={address}
                onChange={(e) => { setAddress(e.target.value); }}
                required
                placeholder="Hà Nội"
              />
            </div>
          </div>
        </form>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => { onOpenChange(false); }}
          >
            Hủy
          </Button>
          <Button
            className="cursor-pointer bg-primary hover:bg-primary/90"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
