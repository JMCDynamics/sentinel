import { apiClient } from "@/lib/api";

export type ApiKeyConfig = {
  id: number;
  name: string;
  value: string;
  created_at: number;
  updated_at: number;
};

export async function listApiKeys(): Promise<ApiKeyConfig[]> {
  return await apiClient.get("/keys").then((response) => response.data["data"]);
}

export async function createApiKeyConfig(data: {
  name: string;
}): Promise<ApiKeyConfig> {
  return await apiClient
    .post("/keys", data, {
      withCredentials: true,
    })
    .then((response) => response.data["data"]);
}
