import { useSensitiveInfo } from "@/hooks/useSensitiveInfo";
import { cn } from "@/lib/utils";
import { CheckCircleIcon, MinusCircleIcon } from "@heroicons/react/16/solid";
import { PencilIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  disableMonitorConfig,
  enableMonitorConfig,
  type MonitorConfig,
} from "../../data/monitor-config";
import { formatIntervalFromSeconds, formatTimestamp } from "../../lib/date";
import { Button } from "../ui/button";

type CardMonitorConfigProps = {
  data: MonitorConfig;
  onActionExecuted?: () => void;
};

export function CardMonitorConfig({
  data,
  onActionExecuted,
}: CardMonitorConfigProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { showSensitiveInfo } = useSensitiveInfo();

  const handleEnable = async () => {
    try {
      setLoading(true);
      await enableMonitorConfig(data.id);
      toast.success("Monitor enabled successfully!");
      onActionExecuted?.();
    } catch {
      toast.error("Failed to enable monitor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    try {
      setLoading(true);
      await disableMonitorConfig(data.id);
      toast.success("Monitor disabled successfully!");
      onActionExecuted?.();
    } catch {
      toast.error("Failed to disable monitor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b py-2 flex flex-col gap-1">
      <section className="w-full flex items-center justify-between">
        <div className="mb-1">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                data.healthy ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <h2 className="text-sm font-semibold">{data.name}</h2>
          </div>

          <span className="text-xs">
            {showSensitiveInfo ? data.url : "••••••••••••••••••••••••••••"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate(`/monitors/${data.id}/edit`)}
            disabled={loading}
            size="sm"
            variant="secondary"
          >
            <PencilIcon />
            <span className="text-xs">Edit</span>
          </Button>

          {data.enabled && (
            <Button
              onClick={handleDisable}
              disabled={loading}
              size="sm"
              variant="destructive"
            >
              <MinusCircleIcon />
              <span className="text-xs">
                {loading ? "Disabling..." : "Disable"}
              </span>
            </Button>
          )}

          {!data.enabled && (
            <Button
              onClick={handleEnable}
              disabled={loading}
              size="sm"
              variant="secondary"
            >
              <CheckCircleIcon />
              {loading ? "Enabling..." : "Enable"}
            </Button>
          )}
        </div>
      </section>

      <section className="w-full flex items-center justify-between">
        <div className="flex items-center gap-1 w-fit p-2 rounded-md bg-zinc-100 border dark:bg-zinc-800 dark:border-zinc-700">
          {data.slots.map((slot, index) => (
            <div
              key={index}
              className={cn(
                "h-4 w-1 rounded-md",
                !slot.is_monitoring_enabled
                  ? "bg-zinc-300 dark:bg-zinc-600"
                  : slot.healthy
                  ? "bg-green-500"
                  : "bg-red-500"
              )}
            ></div>
          ))}
        </div>
      </section>

      <div className="text-xs  flex items-center gap-2 mt-2">
        <span>Interval: {formatIntervalFromSeconds(data.interval)}</span>

        <div className="h-1 w-1 rounded-full" />

        <span>Last Ran: {formatTimestamp(data.last_run, true)}</span>

        {!data.enabled && (
          <>
            <div className="h-1 w-1 rounded-full" />

            <span className="text-red-800 italic">
              (Disabled at {formatTimestamp(data.updated_at, true)})
            </span>
          </>
        )}
      </div>
    </div>
  );
}
