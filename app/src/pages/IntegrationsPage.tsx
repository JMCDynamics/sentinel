import { Button } from "@/components/ui/button";
import {
  listIntegrationConfigs,
  type IntegrationConfig,
} from "@/data/integration-config";
import { useSensitiveInfo } from "@/hooks/useSensitiveInfo";
import { formatTimestamp } from "@/lib/date";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

export function IntegrationsPage() {
  const navigate = useNavigate();

  const { showSensitiveInfo } = useSensitiveInfo();

  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);

  const fetchIntegrations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listIntegrationConfigs();
      setIntegrations(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  return (
    <>
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col mb-4">
          <h1 className="text-2xl font-semibold">Integrations</h1>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm">
              Manage your integrations with third-party services to allow alerts
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate("/integrations/new")}>
            <PlusIcon className="w-4 h-4" />
            <span>Create Integration</span>
          </Button>
        </div>
      </div>

      {!loading && integrations.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th className="w-2xl!">Webhook Url</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {integrations.map((integration) => (
              <tr key={integration.id}>
                <td>
                  <div className="flex items-center gap-1">
                    {integration.type === "DISCORD" && (
                      <img
                        src="/assets/discord.png"
                        alt="Discord"
                        className="w-5 h-5"
                      />
                    )}

                    {integration.type === "SLACK" && (
                      <img
                        src="/assets/slack.png"
                        alt="Slack"
                        className="w-5 h-5"
                      />
                    )}

                    <span>{integration.name}</span>
                  </div>
                </td>
                <td className="break-line-table">
                  {showSensitiveInfo
                    ? integration.url
                    : "••••••••••••••••••••••••"}
                </td>
                <td>{formatTimestamp(integration.created_at, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {loading && (
        <div className="w-full h-full flex items-center justify-center gap-2">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 border-4 border-t-4 border-primary/50 border-t-primary rounded-full animate-spin mb-4" />
            <span>Loading integrations...</span>
          </div>
        </div>
      )}

      {integrations.length === 0 && !loading && (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <img
            src="./assets/empty-box.png"
            alt="No integrations"
            className="w-32 h-32 mb-4"
          />
          <span className="text-zinc-400 mb-4">
            No integrations was created yet.
          </span>

          <Button size="sm" onClick={() => navigate("/integrations/new")}>
            <PlusIcon className="w-4 h-4" />
            <span>Create your first integration</span>
          </Button>
        </div>
      )}
    </>
  );
}
