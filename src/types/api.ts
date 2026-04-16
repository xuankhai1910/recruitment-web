// Generic API response types matching backend's TransformInterceptor

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginationMeta {
  current: number;
  pageSize: number;
  pages: number;
  total: number;
}

export interface PaginatedData<T> {
  meta: PaginationMeta;
  result: T[];
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

export interface PaginationParams {
  current?: number;
  pageSize?: number;
  sort?: string;
}
