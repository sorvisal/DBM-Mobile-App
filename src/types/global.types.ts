export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message: string;
}

export interface PaginatedResult<T = unknown> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export type ID = string;
