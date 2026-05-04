import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { UpsertUserProfileDto, UserProfile } from "@/types/user-profile";

export const userProfilesApi = {
  getMyProfile: () =>
    api.get<ApiResponse<UserProfile | null>>("/user-profiles/me"),

  upsertProfile: (data: UpsertUserProfileDto) =>
    api.post<ApiResponse<UserProfile>>("/user-profiles", data),

  updateProfile: (data: Partial<UpsertUserProfileDto>) =>
    api.patch<ApiResponse<UserProfile>>("/user-profiles/me", data),

  deleteProfile: () =>
    api.delete<ApiResponse<{ deleted: boolean }>>("/user-profiles/me"),

  exportPdf: () =>
    api.post("/user-profiles/me/export-pdf", null, { responseType: "blob" }),
};
