import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, type UserQueryParams } from "@/api/users.api";
import type { CreateUserDto, UpdateUserDto } from "@/types/user";
import { toast } from "sonner";

export function useUsers(params: UserQueryParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => usersApi.getList(params).then((r) => r.data.data),
    placeholderData: (prev) => prev,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => usersApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) =>
      usersApi.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("Tạo người dùng thành công");
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      usersApi.update(id, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("Cập nhật thành công");
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("Đã xóa người dùng");
    },
  });
}

export function useUpdateJobSeeking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (isJobSeeking: boolean) =>
      usersApi.updateJobSeeking({ isJobSeeking }).then((r) => r.data.data),
    onSuccess: (_user, isJobSeeking) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success(
        isJobSeeking
          ? "Đã bật trạng thái đang tìm việc"
          : "Đã tắt trạng thái đang tìm việc",
      );
    },
    onError: () => {
      toast.error("Không thể cập nhật trạng thái.");
    },
  });
}
