import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type {
  PublicUserProfileResponse,
  UpsertUserProfileDto,
  UserProfile,
} from "@/types/user-profile";

export const userProfilesApi = {
  getMyProfile: () =>
    api.get<ApiResponse<UserProfile | null>>("/user-profiles/me"),

  getPublicProfileByUserId: (userId: string) =>
    api.get<ApiResponse<PublicUserProfileResponse>>(
      `/user-profiles/public/user/${userId}`,
    ),

  upsertProfile: (data: UpsertUserProfileDto) =>
    api.post<ApiResponse<UserProfile>>("/user-profiles", data),

  updateProfile: (data: Partial<UpsertUserProfileDto>) =>
    api.patch<ApiResponse<UserProfile>>("/user-profiles/me", data),

  deleteProfile: () =>
    api.delete<ApiResponse<{ deleted: boolean }>>("/user-profiles/me"),

  exportPdf: () =>
    api
      .post<
        ApiResponse<{
          fileName: string;
          filePath: string;
          url: string;
          templateId?: string;
        }>
      >("/user-profiles/me/export-pdf", {})
      .then((r) => r.data.data),
};
