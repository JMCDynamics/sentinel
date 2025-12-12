import { Pagination } from "@/components/sentinel/Pagination";
import { Button } from "@/components/ui/button";
import type { ApiResponse } from "@/data/api-response";
import { listRequestLogs, type RequestLog } from "@/data/request-log";
import { formatMilliseconds, formatTimestamp } from "@/lib/date";
import { cn } from "@/lib/utils";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { useCallback, useEffect, useState } from "react";

export function RequestsPage() {
  const [now, setNow] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);

  const [response, setResponse] = useState<ApiResponse<RequestLog[]>>({
    data: [],
  });

  const fetchEvents = useCallback(
    async (manual = false) => {
      try {
        if (!manual) {
          setLoading(true);
        }

        const response = await listRequestLogs({
          page: currentPage,
          per_page: 10,
        });

        setResponse(response);
        setNow(new Date());
      } finally {
        if (!manual) {
          setLoading(false);
        }
      }
    },
    [currentPage]
  );

  useEffect(() => {
    fetchEvents();

    const interval = setInterval(() => {
      fetchEvents(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchEvents]);

  return (
    <>
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col mb-4">
          <h1 className="text-2xl font-semibold">Request Events</h1>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm">
              Showing last {response.data.length} events. Last updated at{" "}
              {formatTimestamp(now.getTime())}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="cursor-default!">
            <SparklesIcon className="w-4 h-4 text-primary" />
            <span>Refresh every 3 seconds</span>
          </Button>
        </div>
      </div>

      {!loading && (
        <div className="flex-1 flex flex-col justify-between w-full">
          <table>
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Method</th>
                <th>Host</th>
                <th>Path</th>
                <th>Occurred At</th>
                <th>Latency</th>
              </tr>
            </thead>
            <tbody>
              {response.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                    No request events found.
                  </td>
                </tr>
              )}

              {response.data.map((event) => (
                <tr key={event.id}>
                  <td>
                    <span>{event.serviceName}</span>
                  </td>
                  <td>
                    <span>
                      {event.method}

                      <span
                        className={cn("font-bold ml-2", {
                          "text-green-600":
                            event.statusCode >= 200 && event.statusCode < 300,
                          "text-yellow-600":
                            event.statusCode >= 300 && event.statusCode < 400,
                          "text-red-600": event.statusCode >= 400,
                        })}
                      >
                        {event.statusCode}
                      </span>
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span>{event.userAgent?.slice(0, 28)}...</span>
                      <span>{event.ip}</span>
                    </div>
                  </td>
                  <td>
                    <span>{event.url}</span>
                  </td>
                  <td>
                    <span>{formatTimestamp(event.timestamp)}</span>
                  </td>
                  <td>
                    <span>{formatMilliseconds(event.duration)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="py-2">
            <Pagination
              data={response.pagination!}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {loading && (
        <div className="w-full h-full flex items-center justify-center gap-2">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 border-4 border-t-4 border-primary/50 border-t-primary rounded-full animate-spin mb-4" />
            <span>Loading events...</span>
          </div>
        </div>
      )}
    </>
  );
}
