import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuthStore } from "@/stores/auth.store";
import { useMyResumes } from "@/hooks/useResumes";
import { useUser, useUpdateUser } from "@/hooks/useUsers";
import { useMySubscriber, useCreateSubscriber, useUpdateSubscriber } from "@/hooks/useSubscribers";
import { SKILLS_LIST } from "@/lib/constants";
import { resumeFileUrl } from "@/lib/format";
import {
  Bell,
  ChevronDown,
  ExternalLink,
  FileText,
  Lock,
  UserCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface ManageAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RESUME_STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  REVIEWING: "bg-blue-50 text-blue-700 border-blue-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

function ResumesTab() {
  const { data, isLoading } = useMyResumes();
  const resumes = data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={`resume-sk-${i}`} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-12">
        <FileText className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Bạn chưa rải CV nào</p>
      </div>
    );
  }

  return (
    <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-lg border border-border/60 bg-muted/20 p-3">
      {resumes.map((r) => {
        const job =
          typeof r.jobId === "object" ? r.jobId : { _id: r.jobId, name: "—" };
        const company =
          typeof r.companyId === "object"
            ? r.companyId
            : { _id: r.companyId, name: "—" };
        return (
          <div
            key={r._id}
            className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-semibold text-foreground">
                {job.name}
              </p>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {company.name} · {format(new Date(r.createdAt), "dd/MM/yyyy")}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`shrink-0 font-normal ${RESUME_STATUS_STYLE[r.status] ?? ""}`}
            >
              {r.status}
            </Badge>
            <a
              href={resumeFileUrl(r.url)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        );
      })}
    </div>
  );
}

function SubscriberTab() {
  const { user } = useAuthStore();
  const { data: sub, isLoading } = useMySubscriber();
  const createSub = useCreateSubscriber();
  const updateSub = useUpdateSubscriber();
  const [skills, setSkills] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (sub?.skills) setSkills(sub.skills);
  }, [sub]);

  const toggle = (s: string) => {
    setSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const handleSave = () => {
    if (!user) return;
    if (sub) {
      updateSub.mutate({ skills });
    } else {
      createSub.mutate({ name: user.name, email: user.email, skills });
    }
  };

  if (isLoading) {
    return <Skeleton className="h-40 rounded-lg" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-accent/30 p-4">
        <Bell className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Nhận thông báo việc làm phù hợp
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Chọn các kỹ năng bạn quan tâm, email sẽ được gửi khi có tin mới.
          </p>
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block">Kỹ năng quan tâm</Label>
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-accent/30"
            >
              <div className="flex flex-1 flex-wrap gap-1.5">
                {skills.length === 0 ? (
                  <span className="text-muted-foreground">
                    Chọn kỹ năng...
                  </span>
                ) : (
                  skills.map((s) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className="font-normal"
                    >
                      {s}
                    </Badge>
                  ))
                )}
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 gap-0 p-0">
            <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {skills.length}/{SKILLS_LIST.length} đã chọn
              </span>
              {skills.length === SKILLS_LIST.length ? (
                <button
                  type="button"
                  onClick={() => {
                    setSkills([]);
                  }}
                  className="cursor-pointer text-xs font-medium text-primary transition-colors duration-150 hover:text-primary/80"
                >
                  Bỏ chọn tất cả
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSkills([...SKILLS_LIST]);
                  }}
                  className="cursor-pointer text-xs font-medium text-primary transition-colors duration-150 hover:text-primary/80"
                >
                  Chọn tất cả
                </button>
              )}
            </div>
            <div
              className="max-h-64 overflow-y-auto overscroll-contain p-1.5"
              onWheel={(e) => {
                e.stopPropagation();
              }}
            >
              {SKILLS_LIST.map((s) => {
                const checked = skills.includes(s);
                return (
                  <label
                    key={s}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors duration-150 hover:bg-accent"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => {
                        toggle(s);
                      }}
                      className="cursor-pointer"
                    />
                    <span className={checked ? "font-medium" : ""}>{s}</span>
                  </label>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Button
        onClick={handleSave}
        disabled={createSub.isPending || updateSub.isPending}
        className="cursor-pointer bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
      >
        {createSub.isPending || updateSub.isPending
          ? "Đang lưu..."
          : sub
            ? "Cập nhật"
            : "Đăng ký"}
      </Button>
    </div>
  );
}

function ProfileTab() {
  const { user, setAuth, accessToken } = useAuthStore();
  const { data: fullUser, isLoading } = useUser(user?._id ?? "");
  const update = useUpdateUser();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("");

  useEffect(() => {
    if (fullUser) {
      setName(fullUser.name);
      setAddress(fullUser.address);
      setAge(fullUser.age);
      setGender(fullUser.gender);
    }
  }, [fullUser]);

  if (isLoading || !fullUser) {
    return <Skeleton className="h-64 rounded-lg" />;
  }

  const handleSave = async () => {
    if (!user || !accessToken) return;
    await update.mutateAsync({
      id: user._id,
      data: { name, address, age: Number(age), gender },
    });
    setAuth({ ...user, name }, accessToken);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="profile-email">Email</Label>
        <Input
          id="profile-email"
          value={fullUser.email}
          disabled
          className="bg-muted"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="profile-name">Họ và tên</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="profile-age">Tuổi</Label>
          <Input
            id="profile-age"
            type="number"
            value={age}
            onChange={(e) => {
              setAge(e.target.value ? Number(e.target.value) : "");
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Giới tính</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Nam</SelectItem>
              <SelectItem value="FEMALE">Nữ</SelectItem>
              <SelectItem value="OTHER">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="profile-address">Địa chỉ</Label>
        <Input
          id="profile-address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
          }}
        />
      </div>
      <Button
        onClick={handleSave}
        disabled={update.isPending}
        className="cursor-pointer bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
      >
        {update.isPending ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
    </div>
  );
}

function PasswordTab() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-12 text-center">
      <Lock className="h-10 w-10 text-muted-foreground/40" />
      <div>
        <p className="font-heading text-sm font-semibold text-foreground">
          Tính năng đang phát triển
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Endpoint đổi mật khẩu sẽ sớm được hỗ trợ.
        </p>
      </div>
      <Button
        variant="outline"
        disabled
        className="mt-2"
        onClick={() => {
          toast.info("Tính năng đang phát triển");
        }}
      >
        Đổi mật khẩu
      </Button>
    </div>
  );
}

export function ManageAccountModal({
  open,
  onOpenChange,
}: ManageAccountModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[640px] max-h-[90vh] w-[95vw] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border/60 px-6 py-4">
          <DialogTitle className="font-heading">Quản lý tài khoản</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="resumes"
          className="flex min-h-0 flex-1 flex-col gap-0 px-6 pt-4 pb-6"
        >
          <TabsList className="grid w-full shrink-0 grid-cols-2 gap-3 bg-muted/60 p-1.5 sm:grid-cols-4">
            <TabsTrigger
              value="resumes"
              className="min-w-0 gap-1.5 px-2 py-2.5"
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">CV đã gửi</span>
            </TabsTrigger>
            <TabsTrigger
              value="subscriber"
              className="min-w-0 gap-1.5 px-2 py-2.5"
            >
              <Bell className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Nhận việc</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="min-w-0 gap-1.5 px-2 py-2.5"
            >
              <UserCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Thông tin</span>
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="min-w-0 gap-1.5 px-2 py-2.5"
            >
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Mật khẩu</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
            <TabsContent value="resumes" className="mt-0">
              <ResumesTab />
            </TabsContent>
            <TabsContent value="subscriber" className="mt-0">
              <SubscriberTab />
            </TabsContent>
            <TabsContent value="profile" className="mt-0">
              <ProfileTab />
            </TabsContent>
            <TabsContent value="password" className="mt-0">
              <PasswordTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
