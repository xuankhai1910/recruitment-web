export interface PermissionDef {
  method: string;
  apiPath: string;
  module: string;
}

export const ALL_PERMISSIONS = {
  COMPANIES: {
    GET_PAGINATE: {
      method: "GET",
      apiPath: "/api/v1/companies",
      module: "COMPANIES",
    },
    CREATE: {
      method: "POST",
      apiPath: "/api/v1/companies",
      module: "COMPANIES",
    },
    UPDATE: {
      method: "PATCH",
      apiPath: "/api/v1/companies/:id",
      module: "COMPANIES",
    },
    DELETE: {
      method: "DELETE",
      apiPath: "/api/v1/companies/:id",
      module: "COMPANIES",
    },
  },
  USERS: {
    GET_PAGINATE: { method: "GET", apiPath: "/api/v1/users", module: "USERS" },
    CREATE: { method: "POST", apiPath: "/api/v1/users", module: "USERS" },
    UPDATE: { method: "PATCH", apiPath: "/api/v1/users/:id", module: "USERS" },
    DELETE: { method: "DELETE", apiPath: "/api/v1/users/:id", module: "USERS" },
  },
  JOBS: {
    GET_PAGINATE: { method: "GET", apiPath: "/api/v1/jobs", module: "JOBS" },
    CREATE: { method: "POST", apiPath: "/api/v1/jobs", module: "JOBS" },
    UPDATE: { method: "PATCH", apiPath: "/api/v1/jobs/:id", module: "JOBS" },
    DELETE: { method: "DELETE", apiPath: "/api/v1/jobs/:id", module: "JOBS" },
  },
  RESUMES: {
    GET_PAGINATE: {
      method: "GET",
      apiPath: "/api/v1/resumes",
      module: "RESUMES",
    },
    CREATE: { method: "POST", apiPath: "/api/v1/resumes", module: "RESUMES" },
    UPDATE: {
      method: "PATCH",
      apiPath: "/api/v1/resumes/:id",
      module: "RESUMES",
    },
    DELETE: {
      method: "DELETE",
      apiPath: "/api/v1/resumes/:id",
      module: "RESUMES",
    },
  },
  PERMISSIONS: {
    GET_PAGINATE: {
      method: "GET",
      apiPath: "/api/v1/permissions",
      module: "PERMISSIONS",
    },
    CREATE: {
      method: "POST",
      apiPath: "/api/v1/permissions",
      module: "PERMISSIONS",
    },
    UPDATE: {
      method: "PATCH",
      apiPath: "/api/v1/permissions/:id",
      module: "PERMISSIONS",
    },
    DELETE: {
      method: "DELETE",
      apiPath: "/api/v1/permissions/:id",
      module: "PERMISSIONS",
    },
  },
  ROLES: {
    GET_PAGINATE: { method: "GET", apiPath: "/api/v1/roles", module: "ROLES" },
    CREATE: { method: "POST", apiPath: "/api/v1/roles", module: "ROLES" },
    UPDATE: { method: "PATCH", apiPath: "/api/v1/roles/:id", module: "ROLES" },
    DELETE: { method: "DELETE", apiPath: "/api/v1/roles/:id", module: "ROLES" },
  },
  CV_ANALYSIS: {
    // HR chấm độ phù hợp CV ứng viên với tin tuyển dụng họ đã ứng tuyển.
    MATCH_RESUME: {
      method: "POST",
      apiPath: "/api/v1/cv-analysis/resumes/:id/match",
      module: "CV_ANALYSIS",
    },
    // HR xem hạn mức phân tích hàng loạt còn lại trong tháng.
    MATCH_BATCH_QUOTA: {
      method: "GET",
      apiPath: "/api/v1/cv-analysis/resumes/match-batch/quota",
      module: "CV_ANALYSIS",
    },
    // HR bắt đầu 1 lượt phân tích tất cả CV chưa chấm của công ty.
    MATCH_BATCH_START: {
      method: "POST",
      apiPath: "/api/v1/cv-analysis/resumes/match-batch/start",
      module: "CV_ANALYSIS",
    },
  },
} as const;

export const ALL_MODULES = [
  "AUTH",
  "COMPANIES",
  "FILES",
  "JOBS",
  "PERMISSIONS",
  "RESUMES",
  "ROLES",
  "USERS",
  "SUBSCRIBERS",
  "CV_ANALYSIS",
  "NOTIFICATIONS",
  "STATS",
] as const;

export type ModuleName = (typeof ALL_MODULES)[number];
