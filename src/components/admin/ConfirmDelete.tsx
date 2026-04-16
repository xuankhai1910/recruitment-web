import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

interface ConfirmDeleteProps {
  onConfirm: () => unknown | Promise<unknown>;
  children?: ReactNode;
}

export function ConfirmDelete({ onConfirm, children }: ConfirmDeleteProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ?? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <p className="text-sm font-medium">Xác nhận xóa?</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Hành động này không thể hoàn tác.
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => { setOpen(false); }}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="cursor-pointer"
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Xóa
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
