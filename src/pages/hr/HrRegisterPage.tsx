import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useRegister } from "@/hooks/useAuth";
import { rolesApi } from "@/api/roles.api";
import { CompanySearchCombobox } from "@/components/common/CompanySearchCombobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HrAuthShell,
  hrFieldWrap,
  hrIcon,
  hrInput,
  hrLabel,
  PasswordStrength,
} from "@/components/hr/HrAuthShell";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  User,
  UserPlus,
} from "lucide-react";
import type { Role } from "@/types/role";

/**
 * HR Register Page — đăng ký tài khoản nhà tuyển dụng.
 * Bắt buộc role = "HR" và phải chọn 1 công ty có sẵn trong hệ thống.
 * Sau khi đăng ký thành công → redirect /hr/login.
 */
export function HrRegisterPage() {
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

  // Find HR role
  const [hrRoleId, setHrRoleId] = useState<string>("");
  useEffect(() => {
    rolesApi
      .getListForRegister()
      .then((r) => {
        const hr = (r.data.data as Role[]).find((role) => role.name === "HR");
        if (hr) setHrRoleId(hr._id);
        else toast.error("Hệ thống chưa cấu hình vai trò HR");
      })
      .catch(() => {
        toast.error("Không thể tải vai trò");
      });
  }, []);

  // Company picker
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");

  const canSubmit = useMemo(
    () =>
      !!form.name &&
      !!form.email &&
      !!form.password &&
      !!form.address &&
      !!form.age &&
      !!form.gender &&
      !!companyId &&
      !!hrRoleId,
    [form, companyId, hrRoleId],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hrRoleId) {
      toast.error("Hệ thống chưa cấu hình vai trò HR");
      return;
    }
    if (!companyId) {
      toast.error("Vui lòng chọn công ty");
      return;
    }

    register.mutate(
      {
        name: form.name,
        email: form.email,
        password: form.password,
        address: form.address,
        age: Number(form.age),
        gender: form.gender,
        role: hrRoleId,
        company: { _id: companyId, name: companyName },
      },
      {
        onSuccess: () => {
          toast.success("Đăng ký thành công, vui lòng đăng nhập");
          navigate("/hr/login");
        },
        onError: (err) => {
          const msg = isAxiosError(err)
            ? ((err.response?.data?.message as string) ?? "Đăng ký thất bại")
            : "Đăng ký thất bại";
          toast.error(Array.isArray(msg) ? msg[0] : msg);
        },
      },
    );
  };

  return (
    <HrAuthShell mode="register">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-slate-900">
          Tạo tài khoản nhà tuyển dụng
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Bắt đầu đăng tin và tiếp cận ứng viên chỉ trong vài phút.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={hrLabel}>
            Họ và tên
          </label>
          <div className={hrFieldWrap}>
            <User className={hrIcon} />
            <input
              id="name"
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className={hrInput}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-email" className={hrLabel}>
            Email công ty
          </label>
          <div className={hrFieldWrap}>
            <Mail className={hrIcon} />
            <input
              id="reg-email"
              type="email"
              placeholder="hr@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className={hrInput}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-password" className={hrLabel}>
            Mật khẩu
          </label>
          <div className={hrFieldWrap}>
            <Lock className={hrIcon} />
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              placeholder="6-15 ký tự"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              maxLength={15}
              className={hrInput}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="grid cursor-pointer place-items-center text-slate-400 transition-colors hover:text-slate-600"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <EyeOff className="h-4.5 w-4.5" />
              ) : (
                <Eye className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
          {form.password && <PasswordStrength value={form.password} />}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="age" className={hrLabel}>
              Tuổi
            </label>
            <div className={hrFieldWrap}>
              <input
                id="age"
                type="number"
                placeholder="28"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                required
                min={16}
                max={65}
                className={hrInput}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className={hrLabel}>Giới tính</span>
            <Select
              value={form.gender}
              onValueChange={(v) => setForm({ ...form, gender: v })}
              required
            >
              <SelectTrigger className="h-11! w-full cursor-pointer rounded-lg border-slate-200">
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

        <div className="flex flex-col gap-1.5">
          <span className={hrLabel}>Công ty của bạn</span>
          <CompanySearchCombobox
            value={companyId}
            selectedName={companyName}
            onSelect={(company) => {
              setCompanyId(company._id);
              setCompanyName(company.name);
            }}
            triggerClassName="h-11 rounded-lg border-slate-200"
            iconClassName={hrIcon}
            valueWrapClassName="gap-2.5"
            placeholderClassName="text-slate-400"
          />
          <p className="text-xs text-slate-400">
            Liên hệ admin để đăng ký công ty nếu chưa tồn tại trong hệ thống.
            Điều này giúp chúng tôi quản lý thông tin và tính minh bạch của các
            công ty đăng tin tuyển dụng.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="address" className={hrLabel}>
            Địa chỉ
          </label>
          <div className={hrFieldWrap}>
            <MapPin className={hrIcon} />
            <input
              id="address"
              placeholder="Hà Nội"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
              className={hrInput}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || register.isPending}
          className="mt-1 inline-flex h-12 cursor-pointer items-center justify-center gap-2.5 rounded-lg bg-blue-600 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {register.isPending ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              Đang tạo tài khoản...
            </>
          ) : (
            <>
              <UserPlus className="h-4.5 w-4.5" />
              Đăng ký nhà tuyển dụng
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Đã có tài khoản?{" "}
        <Link
          to="/hr/login"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Đăng nhập
        </Link>
      </p>
    </HrAuthShell>
  );
}
