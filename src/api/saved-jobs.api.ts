import { api } from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";
import type { Job } from "@/types/job";

/**
 * Saved-job row from BE. After the manual-fetch refactor (preserving the raw
 * jobId for orphan removal), shape is:
 *  - `jobId`: ObjectId string — always present; use to unsave even when job is gone
 *  - `job`: full Job document including soft-deleted ones; `null` when the job
 *    was hard-deleted. Check `job.deleted === true` for soft-delete (orphan
 *    UX), or `job.isActive === false` / past `endDate` for expired UX.
 */
export interface SavedJob {
  _id: string;
  userId: string;
  jobId: string;
  job: (Job & { deleted?: boolean }) | null;
  savedAt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SavedJobsQueryParams extends PaginationParams {
  /** Free-text search across job name, skills and company name. */
  keyword?: string;
  location?: string;
}

export interface ToggleSaveResponse {
  saved: boolean;
}

export const savedJobsApi = {
  toggleSave: (jobId: string) =>
    api.post<ApiResponse<ToggleSaveResponse>>("/saved-jobs", { jobId }),

  getSavedJobs: (params: SavedJobsQueryParams) =>
    api.get<PaginatedResponse<SavedJob>>("/saved-jobs", { params }),

  checkSaved: (jobId: string) =>
    api.get<ApiResponse<{ saved: boolean }>>(`/saved-jobs/check/${jobId}`),
};
