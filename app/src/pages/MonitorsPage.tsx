import { CardMonitorConfig } from "@/components/sentinel/CardMonitorConfig";
import { Button } from "@/components/ui/button";
import { listMonitorConfigs, type MonitorConfig } from "@/data/monitor-config";
import { formatTimestamp } from "@/lib/date";
import { CheckIcon, PlusIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

export function MonitorsPage() {
  const navigate = useNavigate();

  const [now, setNow] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monitors, setMonitors] = useState<MonitorConfig[]>([]);

  const fetchMonitors = useCallback(async (isManual = false) => {
    try {
      if (isManual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await listMonitorConfigs();

      setMonitors(data);
      setNow(new Date());
    } finally {
      if (isManual) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchMonitors();

    const interval = setInterval(() => {
      fetchMonitors(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchMonitors]);

  return (
    <>
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col mb-4">
          <h1 className="text-2xl font-semibold text-zinc-700">Monitors</h1>

          <div className="flex items-center gap-2 mt-1">
            {refreshing ? (
              <div className="w-3 h-3 border-2 border-t-2 border-primary/50 border-t-primary rounded-full animate-spin" />
            ) : (
              <CheckIcon className="w-4 h-4 text-primary" />
            )}

            <span className="text-sm">
              Refreshed at {formatTimestamp(now.getTime() / 1000)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="cursor-default!">
            <SparklesIcon className="w-4 h-4 text-primary" />
            <span>Refresh every 3 seconds</span>
          </Button>

          <Button size="sm" onClick={() => navigate("/monitors/new")}>
            <PlusIcon className="w-4 h-4" />
            <span>Create Monitor</span>
          </Button>
        </div>
      </div>

      {!loading &&
        monitors.map((monitor) => {
          return (
            <CardMonitorConfig
              key={monitor.id}
              data={monitor}
              onActionExecuted={() => {
                navigate(0);
              }}
            />
          );
        })}

      {loading && (
        <div className="w-full h-full flex items-center justify-center gap-2">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 border-4 border-t-4 border-primary/50 border-t-primary rounded-full animate-spin mb-4" />
            <span>Loading monitors...</span>
          </div>
        </div>
      )}

      {monitors.length === 0 && !loading && (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <img
            src="./assets/empty-box.png"
            alt="No monitors"
            className="w-32 h-32 mb-4"
          />
          <span className="text-zinc-400 mb-4">
            No monitors was created yet.
          </span>

          <Button size="sm" onClick={() => navigate("/monitors/new")}>
            <PlusIcon className="w-4 h-4" />
            <span>Create your first monitor</span>
          </Button>
        </div>
      )}
    </>
  );
}
