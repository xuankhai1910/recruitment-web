import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";

interface BulkDeleteButtonProps {
  selectedCount: number;
  itemLabel?: string;
  onConfirm: () => unknown | Promise<unknown>;
}

export function BulkDeleteButton({
  selectedCount,
  itemLabel = "bản ghi",
  onConfirm,
}: BulkDeleteButtonProps) {
  return (
    <ConfirmDelete
      title={`Xóa ${selectedCount} ${itemLabel}?`}
      description="Các bản ghi đã chọn sẽ bị xóa và không thể hoàn tác."
      confirmLabel="Xóa đã chọn"
      onConfirm={onConfirm}
    >
      <Button
        variant="destructive"
        size="sm"
        className="cursor-pointer"
        disabled={selectedCount === 0}
      >
        <Trash2 className="mr-1.5 h-4 w-4" />
        Xóa đã chọn ({selectedCount})
      </Button>
    </ConfirmDelete>
  );
}
