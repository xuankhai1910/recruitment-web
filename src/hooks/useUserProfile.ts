import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userProfilesApi } from "@/api/user-profiles.api";
import type { UpsertUserProfileDto } from "@/types/user-profile";

export function useMyProfile() {
  return useQuery({
    queryKey: ["user-profile", "me"],
    queryFn: () => userProfilesApi.getMyProfile().then((r) => r.data.data),
    retry: false,
  });
}

export function useUpsertProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertUserProfileDto) =>
      userProfilesApi.upsertProfile(data).then((r) => r.data.data),
    onSuccess: (profile) => {
      qc.setQueryData(["user-profile", "me"], profile);
      qc.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Đã lưu CV thành công");
    },
    onError: () => {
      toast.error("Không thể lưu CV. Vui lòng thử lại.");
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UpsertUserProfileDto>) =>
      userProfilesApi.updateProfile(data).then((r) => r.data.data),
    onSuccess: (profile) => {
      qc.setQueryData(["user-profile", "me"], profile);
      qc.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Cập nhật CV thành công");
    },
    onError: () => {
      toast.error("Không thể cập nhật CV.");
    },
  });
}

export function useDeleteProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => userProfilesApi.deleteProfile(),
    onSuccess: () => {
      qc.setQueryData(["user-profile", "me"], null);
      qc.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Đã xóa CV");
    },
  });
}
