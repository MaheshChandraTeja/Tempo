import type { AsyncStatus } from '@/types/common';

export type ApiErrorCode =
  | 'UNKNOWN'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR';

export type ApiError = Readonly<{
  code: ApiErrorCode;
  message: string;
  details?: unknown;
}>;

export type ApiSuccess<TData> = Readonly<{
  ok: true;
  status: number;
  data: TData;
}>;

export type ApiFailure = Readonly<{
  ok: false;
  status: number;
  error: ApiError;
}>;

export type ApiResponse<TData> = ApiSuccess<TData> | ApiFailure;

export type PaginatedResponse<TItem> = Readonly<{
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}>;

export type RequestState<TData> = Readonly<{
  status: AsyncStatus;
  data: TData | null;
  error: ApiError | null;
}>;

export function isApiSuccess<TData>(
  response: ApiResponse<TData>,
): response is ApiSuccess<TData> {
  return response.ok;
}

export function isApiFailure<TData>(
  response: ApiResponse<TData>,
): response is ApiFailure {
  return !response.ok;
}