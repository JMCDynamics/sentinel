import { apiClient } from "@/lib/api";
import type { ApiResponse } from "./api-response";

export type RequestLog = {
  id: number;
  serviceName: string;
  timestamp: number;
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  ip: string;
  userAgent?: string | string[] | undefined;
  query: Record<string, any>;
  params: Record<string, any>;
  headers: Record<string, any>;
  body?: any;
};

export async function listRequestLogs({
  page,
  per_page,
}: {
  page?: number;
  per_page?: number;
}): Promise<ApiResponse<RequestLog[]>> {
  let params = new URLSearchParams();

  if (page) params.append("page", page.toString());
  if (per_page) params.append("per_page", per_page.toString());

  return await apiClient
    .get(`/requests`, {
      params,
      withCredentials: true,
    })
    .then((response) => response.data);
}
