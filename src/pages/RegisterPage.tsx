import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, Eye, EyeOff, Loader2 } from "lucide-react";

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    age: "",
    gender: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate(
      { ...form, age: Number(form.age) },
      {
        onSuccess: () => {
          navigate("/login");
        },
      },
    );
  };

  return (
    <div className="w-full max-w-md px-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
          <Briefcase className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Job<span className="text-primary">Finder</span>
        </h1>
      </div>

      <Card className="border border-border/60">
        <CardHeader className="pb-4 text-center">
          <CardTitle className="font-heading text-xl">Tạo tài khoản</CardTitle>
          <CardDescription>
            Đăng ký để bắt đầu tìm kiếm việc làm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                placeholder="Nguyễn Văn A"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                }}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                }}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="6-15 ký tự"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                  }}
                  required
                  minLength={6}
                  maxLength={15}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="age">Tuổi</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={form.age}
                  onChange={(e) => {
                    setForm({ ...form, age: e.target.value });
                  }}
                  required
                  min={16}
                  max={65}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Giới tính</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => {
                    setForm({ ...form, gender: v });
                  }}
                  required
                >
                  <SelectTrigger className="h-11 cursor-pointer">
                    <SelectValue placeholder="Chọn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE" className="cursor-pointer">
                      Nam
                    </SelectItem>
                    <SelectItem value="FEMALE" className="cursor-pointer">
                      Nữ
                    </SelectItem>
                    <SelectItem value="OTHER" className="cursor-pointer">
                      Khác
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                placeholder="Hà Nội"
                value={form.address}
                onChange={(e) => {
                  setForm({ ...form, address: e.target.value });
                }}
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={register.isPending}
              className="h-11 w-full cursor-pointer bg-primary text-base font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
            >
              {register.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Đăng ký
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="cursor-pointer font-semibold text-primary transition-colors duration-200 hover:text-primary/80"
            >
              Đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
