import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useJob, useCreateJob, useUpdateJob } from "@/hooks/useJobs";
import { SKILLS_LIST, LEVEL_LIST } from "@/lib/constants";
import { LOCATIONS } from "@/lib/locations";
import { companiesApi } from "@/api/companies.api";
import type { CreateJobDto } from "@/types/job";
import type { Company } from "@/types/company";

export default function JobUpsert() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const isEdit = !!id;

  const { data: job, isLoading: fetching } = useJob(id);
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  // Load companies for dropdown
  const [companies, setCompanies] = useState<Company[]>([]);
  useEffect(() => {
    companiesApi
      .getList({ current: 1, pageSize: 100 })
      .then((r) => { setCompanies(r.data.data.result); });
  }, []);

  const [form, setForm] = useState<CreateJobDto>({
    name: "",
    skills: [],
    location: "",
    salary: 0,
    quantity: 1,
    level: "",
    company: { _id: "", name: "", logo: "" },
    startDate: "",
    endDate: "",
    isActive: true,
    description: "",
  });

  useEffect(() => {
    if (job) {
      setForm({
        name: job.name,
        skills: job.skills,
        location: job.location,
        salary: job.salary,
        quantity: job.quantity,
        level: job.level,
        company: { _id: job.company._id, name: job.company.name, logo: job.company.logo },
        startDate: job.startDate?.slice(0, 10) ?? "",
        endDate: job.endDate?.slice(0, 10) ?? "",
        isActive: job.isActive,
        description: job.description,
      });
    }
  }, [job]);

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const submitting = createJob.isPending || updateJob.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await updateJob.mutateAsync({ id, data: form });
    } else {
      await createJob.mutateAsync(form);
    }
    navigate("/admin/job");
  };

  if (isEdit && fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-sky-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/admin/job" className="hover:text-foreground transition-colors duration-150">
          Manage Job
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">
          {isEdit ? "Upsert Job" : "Upsert Job"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Tên công việc</Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); }}
          />
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <Label>Kỹ năng yêu cầu</Label>
          <div className="flex flex-wrap gap-3">
            {SKILLS_LIST.map((skill) => (
              <label
                key={skill}
                className="flex items-center gap-1.5 text-sm cursor-pointer select-none"
              >
                <Checkbox
                  checked={form.skills.includes(skill)}
                  onCheckedChange={() => { toggleSkill(skill); }}
                />
                {skill}
              </label>
            ))}
          </div>
        </div>

        {/* Location + Level */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Địa điểm</Label>
            <Select
              value={form.location}
              onValueChange={(v) => { setForm((p) => ({ ...p, location: v })); }}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Chọn địa điểm" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.filter((l) => l !== "Tất cả thành phố").map((loc) => (
                  <SelectItem key={loc} value={loc} className="cursor-pointer">
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Level</Label>
            <Select
              value={form.level}
              onValueChange={(v) => { setForm((p) => ({ ...p, level: v })); }}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Chọn level" />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_LIST.map((lv) => (
                  <SelectItem key={lv} value={lv} className="cursor-pointer">
                    {lv}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Salary + Quantity */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="salary">Mức lương (VNĐ)</Label>
            <Input
              id="salary"
              type="number"
              min={0}
              value={form.salary}
              onChange={(e) => { setForm((p) => ({ ...p, salary: Number(e.target.value) })); }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Số lượng</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => { setForm((p) => ({ ...p, quantity: Number(e.target.value) })); }}
            />
          </div>
        </div>

        {/* Company */}
        <div className="space-y-2">
          <Label>Thuộc công ty <span className="text-destructive">*</span></Label>
          <Select
            value={form.company._id}
            onValueChange={(v) => {
              const c = companies.find((x) => x._id === v);
              if (c) setForm((p) => ({ ...p, company: { _id: c._id, name: c.name, logo: c.logo } }));
            }}
          >
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

        {/* Dates */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Ngày bắt đầu</Label>
            <Input
              id="startDate"
              type="date"
              value={form.startDate}
              onChange={(e) => { setForm((p) => ({ ...p, startDate: e.target.value })); }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Ngày kết thúc</Label>
            <Input
              id="endDate"
              type="date"
              value={form.endDate}
              onChange={(e) => { setForm((p) => ({ ...p, endDate: e.target.value })); }}
            />
          </div>
        </div>

        {/* Is Active */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox
            checked={form.isActive}
            onCheckedChange={(checked) => { setForm((p) => ({ ...p, isActive: !!checked })); }}
          />
          <span className="text-sm">Đang tuyển (Active)</span>
        </label>

        <Separator />

        {/* Description — Rich Text */}
        <div className="space-y-2">
          <Label>Mô tả công việc</Label>
          <RichTextEditor
            value={form.description}
            onChange={(html) => { setForm((p) => ({ ...p, description: html })); }}
            placeholder="Nhập mô tả công việc..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="cursor-pointer bg-sky-700 hover:bg-sky-800 transition-colors duration-150"
          >
            {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => { navigate("/admin/job"); }}
          >
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
