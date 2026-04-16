import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, Eye, EyeOff, Loader2 } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(form, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  return (
    <div className="w-full max-w-md px-4">
      {/* Logo */}
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
          <CardTitle className="font-heading text-xl">
            Chào mừng trở lại
          </CardTitle>
          <CardDescription>
            Đăng nhập để tiếp tục tìm kiếm việc làm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.username}
                onChange={(e) => {
                  setForm({ ...form, username: e.target.value });
                }}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link
                  to="/forgot-password"
                  className="cursor-pointer text-xs font-medium text-primary transition-colors duration-200 hover:text-primary/80"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="6-15 ký tự"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                  }}
                  required
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

            <Button
              type="submit"
              disabled={login.isPending}
              className="h-11 w-full cursor-pointer bg-primary text-base font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
            >
              {login.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Đăng nhập
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="cursor-pointer font-semibold text-primary transition-colors duration-200 hover:text-primary/80"
            >
              Đăng ký ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
