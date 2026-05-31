import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { AdminOverview, HrOverview } from "@/types/stats";

export const statsApi = {
  getAdminOverview: () =>
    api.get<ApiResponse<AdminOverview>>("/stats/admin/overview"),

  getHrOverview: () => api.get<ApiResponse<HrOverview>>("/stats/hr/overview"),
};
