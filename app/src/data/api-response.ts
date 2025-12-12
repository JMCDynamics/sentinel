import type { Pagination } from "./pagination";

export type ApiResponse<T> = {
  data: T;
  pagination?: Pagination;
};
