import { apiClient } from "@/lib/api";

export type IntegrationConfig = {
  id: string;
  name: string;
  url: string;
  type: "SLACK" | "DISCORD";
  created_at: number;
  updated_at: number;
};

type CreateIntegrationConfigData = {
  name: string;
  url: string;
  type: "SLACK" | "DISCORD";
};

export async function listIntegrationConfigs(
  search?: string
): Promise<IntegrationConfig[]> {
  const params = search ? { search } : undefined;

  return await apiClient
    .get("/integrations", { params })
    .then((response) => response.data["data"]);
}

export async function createIntegrationConfig(
  data: CreateIntegrationConfigData
): Promise<IntegrationConfig> {
  return await apiClient
    .post("/integrations", data)
    .then((response) => response.data);
}
