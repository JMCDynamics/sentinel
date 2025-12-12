import { Button } from "@/components/ui/button";
import { listApiKeys, type ApiKeyConfig } from "@/data/api-key-config";
import { useSensitiveInfo } from "@/hooks/useSensitiveInfo";
import { formatTimestamp } from "@/lib/date";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

export function TokensPage() {
  const navigate = useNavigate();

  const { showSensitiveInfo } = useSensitiveInfo();

  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([]);

  const fetchApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listApiKeys();
      setApiKeys(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  return (
    <>
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col mb-4">
          <h1 className="text-2xl font-semibold">Tokens</h1>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm">
              Manage your API tokens used to authenticate requests.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate("/tokens/new")}>
            <PlusIcon className="w-4 h-4" />
            <span>Create Token</span>
          </Button>
        </div>
      </div>

      {!loading && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th className="w-2xl!">Key</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-20">
                  No api keys found.
                </td>
              </tr>
            )}

            {apiKeys.map((apiKey) => (
              <tr key={apiKey.id}>
                <td>{apiKey.name}</td>
                <td className="break-line-table">
                  {showSensitiveInfo
                    ? apiKey.value
                    : "••••••••••••••••••••••••"}
                </td>
                <td>{formatTimestamp(apiKey.created_at)}</td>
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
    </>
  );
}
