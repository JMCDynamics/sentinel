import { MointorActions } from "@/components/sentinel/MonitorActions";
import { MyTable } from "@/components/sentinel/MyTable";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { listMonitorConfigs, type MonitorConfig } from "@/data/monitor-config";
import { useSensitiveInfo } from "@/hooks/useSensitiveInfo";
import { formatIntervalFromSeconds, formatTimestamp } from "@/lib/date";
import { cn } from "@/lib/utils";
import { CheckIcon, PlusIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { MoreVerticalIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

export function MonitorsPage() {
  const { showSensitiveInfo } = useSensitiveInfo();
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
          <h1 className="text-2xl font-semibold">Monitors</h1>

          <div className="flex items-center gap-2 mt-1">
            {refreshing ? (
              <div className="w-3 h-3 border-2 border-t-2 border-primary/50 border-t-primary rounded-full animate-spin" />
            ) : (
              <CheckIcon className="w-4 h-4 text-primary" />
            )}

            <span className="text-sm">
              Refreshed at {formatTimestamp(now.getTime())}
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

      <MyTable
        data={monitors}
        loading={loading}
        columns={["Name", "Status", "Url", "Interval", "Last Run", "Actions"]}
        renderRow={(monitor: MonitorConfig) => {
          return (
            <tr key={monitor.id}>
              <td>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-2 w-4 rounded-full",
                      monitor.healthy ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                  <div className="flex items-center gap-1">
                    <span
                      className={cn(
                        "break-line-table",
                        !monitor.enabled && "line-through text-muted-foreground"
                      )}
                    >
                      {monitor.name}
                    </span>
                    {!monitor.enabled && (
                      <span className="text-xs text-destructive">Disabled</span>
                    )}
                  </div>
                </div>
              </td>
              <td>
                <div className="flex items-center gap-1 w-fit p-2 rounded-md border">
                  {monitor.slots.map((slot, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-2 w-1 rounded-md",
                        !slot.is_monitoring_enabled
                          ? "bg-zinc-300 dark:bg-zinc-600"
                          : slot.healthy
                          ? "bg-green-500"
                          : "bg-red-500"
                      )}
                    ></div>
                  ))}
                </div>
              </td>
              <td className="break-line-table">
                {showSensitiveInfo ? monitor.url : "•••••••••••••••••••"}
              </td>
              <td>{formatIntervalFromSeconds(monitor.interval)}</td>
              <td>{formatTimestamp(monitor.last_run, true)}</td>
              <td>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreVerticalIcon />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-40!">
                      <MointorActions
                        data={monitor}
                        onActionExecuted={() => fetchMonitors()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </td>
            </tr>
          );
        }}
      />
    </>
  );
}
