import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export const mailApi = {
  sendTestJobAlert: () => api.get<ApiResponse<unknown>>("/mail"),
};
