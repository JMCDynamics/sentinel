import { MyTable } from "@/components/sentinel/MyTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  fetchRequestMetrics,
  type DailyTraffic,
  type GroupedRequest,
  type RequestMetrics,
} from "@/data/metrics";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";

type ChartDataPoint = {
  time_interval: number;
  success: number;
  error: number;
};

const chartConfig = {
  error: {
    label: "Failed Requests",
  },
  success: {
    label: "Successful Requests",
  },
} satisfies ChartConfig;

export function MetricsPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<RequestMetrics>({
    daily_traffic: [],
    error_rate: 0,
    total_requests: 0,
    grouped_requests: [],
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await fetchRequestMetrics();
        setMetrics(data);
      } catch {
        toast.error("Failed to fetch metrics");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <>
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Metrics</h1>
          <p className="text-sm">Overview of today's request metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-3xl font-black",
                loading &&
                  "animate-pulse bg-secondary text-transparent rounded-lg"
              )}
            >
              {formatQuantityOfRequests(metrics.total_requests)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-3xl font-black",
                loading &&
                  "animate-pulse bg-secondary text-transparent rounded-lg"
              )}
            >
              {metrics.error_rate.toFixed(1)} %
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="border p-6 w-full rounded-lg flex flex-col gap-4 shadow-sm mt-6">
        <div>
          <h1 className="font-bold">Traffic Overview</h1>
          <p className="text-sm">
            A breakdown of requests over time by device type.
          </p>
        </div>

        <ChartContainer
          config={chartConfig}
          className={cn(
            "h-80 w-full",
            loading && "animate-pulse bg-secondary text-transparent rounded-lg"
          )}
        >
          <BarChart
            data={normalizeDailyTraffic(metrics.daily_traffic)}
            className={cn(loading && "hidden")}
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="time_interval"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                new Date(value).toLocaleTimeString("pt-BR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
            />

            <ChartTooltip content={<ChartTooltipContent />} />

            <Bar
              dataKey="success"
              className="fill-success"
              radius={[6, 6, 0, 0]}
              name="Successful"
              barSize={100}
            />
            <Bar
              dataKey="error"
              className="fill-destructive"
              radius={[6, 6, 0, 0]}
              name="Error"
              barSize={100}
            />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="w-full mt-6">
        <div className="mb-4">
          <h1 className="font-bold">Most Requested Endpoints</h1>
          <p className="text-sm">
            A breakdown of requests grouped by service name, method, and URL.
          </p>
        </div>

        <MyTable
          columns={[
            "Service Name",
            "Method",
            "URL",
            "Total Requests",
            "Failed Requests (>= 500)",
          ]}
          data={metrics.grouped_requests}
          loading={loading}
          renderRow={(groupedRequest: GroupedRequest) => {
            return (
              <tr key={groupedRequest.service_name + groupedRequest.url}>
                <td>
                  <span>{groupedRequest.service_name}</span>
                </td>
                <td>
                  <span>{groupedRequest.method}</span>
                </td>
                <td className="break-line-table">
                  <span>{groupedRequest.url}</span>
                </td>
                <td>
                  <span>{formatQuantityOfRequests(groupedRequest.total)}</span>
                </td>
                <td>
                  <span>{formatQuantityOfRequests(groupedRequest.failed)}</span>
                </td>
              </tr>
            );
          }}
        />
      </div>
    </>
  );
}

function formatQuantityOfRequests(count: number) {
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1) + "M";
  } else if (count >= 1_000) {
    return (count / 1_000).toFixed(1) + "K";
  } else {
    return count.toString();
  }
}

function normalizeDailyTraffic(data: DailyTraffic[]): ChartDataPoint[] {
  const map = new Map<number, ChartDataPoint>();

  for (const item of data) {
    const entry = map.get(item.time_interval) ?? {
      time_interval: item.time_interval,
      success: 0,
      error: 0,
    };

    if (item.successful) {
      entry.success += item.count;
    } else {
      entry.error += item.count;
    }

    map.set(item.time_interval, entry);
  }

  return Array.from(map.values()).sort(
    (a, b) => a.time_interval - b.time_interval
  );
}
