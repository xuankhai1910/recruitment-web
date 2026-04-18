import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscribersApi } from "@/api/subscribers.api";
import type { CreateSubscriberDto } from "@/types/subscriber";
import { toast } from "sonner";

export function useMySubscriber() {
  return useQuery({
    queryKey: ["subscriber", "me"],
    queryFn: () => subscribersApi.getSkills().then((r) => r.data.data),
    retry: false,
  });
}

export function useCreateSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubscriberDto) =>
      subscribersApi.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriber"] });
      toast.success("Đăng ký nhận email thành công");
    },
  });
}

export function useUpdateSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateSubscriberDto>) =>
      subscribersApi.update(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriber"] });
      toast.success("Cập nhật skill thành công");
    },
  });
}
