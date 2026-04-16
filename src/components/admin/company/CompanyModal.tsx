import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, X } from "lucide-react";
import { useCreateCompany, useUpdateCompany } from "@/hooks/useCompanies";
import { useUploadFile } from "@/hooks/useFiles";
import type { Company } from "@/types/company";

interface CompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
}

export function CompanyModal({
  open,
  onOpenChange,
  company,
}: CompanyModalProps) {
  const isEdit = !!company;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");

  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const uploadFile = useUploadFile();

  const isSubmitting = createCompany.isPending || updateCompany.isPending;

  useEffect(() => {
    if (open) {
      setName(company?.name ?? "");
      setAddress(company?.address ?? "");
      setDescription(company?.description ?? "");
      setLogo(company?.logo ?? "");
    }
  }, [open, company]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadFile.mutateAsync({
        file,
        folderType: "company",
      });
      setLogo(result.fileName);
    } catch {
      // error toast handled by useUploadFile
    }
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateCompany.mutateAsync({
          id: company._id,
          data: { name, address, description, logo },
        });
      } else {
        await createCompany.mutateAsync({ name, address, description, logo });
      }
      onOpenChange(false);
    } catch {
      // error toasts handled by mutation hooks
    }
  };

  const logoSrc = logo
    ? logo.startsWith("http")
      ? logo
      : `${import.meta.env.VITE_STATIC_URL}/images/company/${logo}`
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật Company" : "Tạo mới Company"}
          </DialogTitle>
        </DialogHeader>

        <Separator />

        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-y-auto pr-1"
        >
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="company-name">
              Tên công ty <span className="text-destructive">*</span>
            </Label>
            <Input
              id="company-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              placeholder="Nhập tên công ty"
              required
            />
          </div>

          {/* Logo + Address — 2 columns, equal height */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr]">
            {/* Logo */}
            <div className="space-y-1.5">
              <Label>
                Ảnh Logo <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-start gap-3">
                {logoSrc ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border">
                    <img
                      src={logoSrc}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-destructive text-white transition-opacity duration-150 hover:opacity-80"
                      onClick={() => {
                        setLogo("");
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors duration-150 hover:border-primary hover:text-primary"
                  disabled={uploadFile.isPending}
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                >
                  {uploadFile.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                  <span className="text-xs">Upload</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="company-address">
                Địa chỉ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company-address"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                }}
                placeholder="Nhập địa chỉ"
              />
            </div>
          </div>

          {/* Description — Rich Text */}
          <div className="space-y-1.5">
            <Label>Miêu tả</Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Nhập mô tả công ty..."
            />
          </div>
        </form>

        <Separator />

        {/* Actions — fixed at bottom */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer transition-colors duration-150"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="cursor-pointer bg-primary transition-colors duration-150 hover:bg-primary/90"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting && (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            )}
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
