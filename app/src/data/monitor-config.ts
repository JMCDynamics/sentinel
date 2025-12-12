import { apiClient } from "../lib/api";
import type { IntegrationConfig } from "./integration-config";

export type MonitorConfig = {
  id: number;
  name: string;
  healthy: boolean;
  url: string;
  method: string;
  timeout: number;
  threshold: number;
  integrations?: IntegrationConfig[];
  last_run: number;
  interval: number;
  enabled: boolean;
  updated_at: number;
  slots: Slot[];
};

export type Attempt = {
  id: number;
  healthy: boolean;
  response: string;
  status_code: number;
  created_at: number;
  monitor_config?: MonitorConfig;
};

export async function listAttempts(): Promise<Attempt[]> {
  return await apiClient
    .get(`/events`)
    .then((response) => response.data["data"]);
}

type Slot = {
  timestamp: number;
  healthy: boolean;
  is_monitoring_enabled: boolean;
};

export async function listMonitorConfigs(): Promise<MonitorConfig[]> {
  return await apiClient
    .get("/monitors")
    .then((response) => response.data["data"]);
}

type CreateMonitorConfigParams = {
  name: string;
  url: string;
  method: string;
  interval: number;
  timeout: number;
  integration_id_list: number[];
};

export async function createMonitorConfig(
  data: CreateMonitorConfigParams
): Promise<MonitorConfig> {
  return await apiClient
    .post("/monitors", data)
    .then((response) => response.data["data"]);
}

export async function updateMonitorConfig(
  id: number,
  data: Partial<CreateMonitorConfigParams>
): Promise<MonitorConfig> {
  return await apiClient
    .put(`/monitors/${id}`, data)
    .then((response) => response.data["data"]);
}

export async function enableMonitorConfig(id: number): Promise<void> {
  return await apiClient.put(`/monitors/${id}`, {
    enabled: true,
  });
}

export async function disableMonitorConfig(id: number): Promise<void> {
  return await apiClient.put(`/monitors/${id}`, {
    enabled: false,
  });
}

export async function getMonitorConfig(id: number): Promise<MonitorConfig> {
  return await apiClient
    .get(`/monitors/${id}`)
    .then((response) => response.data["data"]);
}
