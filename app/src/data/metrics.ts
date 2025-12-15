import { apiClient } from "@/lib/api";

export type DailyTraffic = {
  successful: boolean;
  time_interval: number;
  count: number;
};

export type GroupedRequest = {
  service_name: string;
  method: string;
  url: string;
  total: number;
  failed: number;
  average_duration: number;
};

export type RequestMetrics = {
  total_requests: number;
  error_rate: number;
  daily_traffic: DailyTraffic[];
  grouped_requests: GroupedRequest[];
};

export async function fetchRequestMetrics(): Promise<RequestMetrics> {
  return await apiClient
    .get("/requests/metrics", {
      withCredentials: true,
    })
    .then((response) => response.data["data"]);
}
