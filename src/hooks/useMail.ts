import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { mailApi } from "@/api/mail.api";

export function useSendTestJobAlertMail() {
  return useMutation({
    mutationFn: () => mailApi.sendTestJobAlert().then((r) => r.data.data),
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu email kiểm tra");
    },
    onError: () => {
      toast.error("Không thể gửi email kiểm tra");
    },
  });
}
