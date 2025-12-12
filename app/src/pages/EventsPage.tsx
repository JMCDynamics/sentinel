import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { listAttempts, type Attempt } from "@/data/monitor-config";
import { formatTimestamp } from "@/lib/date";
import { EyeIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { useCallback, useEffect, useState } from "react";
import { JsonView, defaultStyles } from "react-json-view-lite";

import "react-json-view-lite/dist/index.css";

export function EventsPage() {
  const [now, setNow] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Attempt[]>([]);

  const [responsePreview, setResponsePreview] = useState<string | null>(null);

  const fetchEvents = useCallback(async (manual = false) => {
    try {
      if (!manual) {
        setLoading(true);
      }

      const data = await listAttempts();

      setEvents(data);
      setNow(new Date());
    } finally {
      if (!manual) {
        setLoading(false);
      }
    }
  }, []);

  const isValidJson = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

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
          <h1 className="text-2xl font-semibold">Events</h1>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm">
              Showing last {events.length} events. Last updated at{" "}
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

      {!loading && events.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Monitor</th>
              <th>Status Code</th>
              <th>Response</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>
                  <span>{event.id}</span>
                </td>
                <td className="break-line-table">
                  {event.monitor_config?.name}
                </td>
                <td>{event.status_code}</td>
                {event.status_code == 0 && event.response == "" ? (
                  <td className="italic text-zinc-400">no response</td>
                ) : (
                  <td>
                    <button
                      onClick={() => setResponsePreview(event.response)}
                      className="bg-zinc-200 hover:bg-zinc-300 px-2 py-1 rounded-sm text-xs flex items-center"
                    >
                      <span className="break-line-table">{event.response}</span>
                      <EyeIcon className="w-4 h-4 inline-block ml-2" />
                    </button>
                  </td>
                )}
                <td>{formatTimestamp(event.created_at, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Drawer
        open={responsePreview !== null}
        onOpenChange={() => setResponsePreview(null)}
        direction="right"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Response Preview</DrawerTitle>
            <DrawerDescription>
              View the full response content of the selected event.
            </DrawerDescription>
            <div className="mt-4">
              {isValidJson(responsePreview ?? "") ? (
                <JsonView
                  data={JSON.parse(responsePreview ?? "{}") ?? {}}
                  style={defaultStyles}
                />
              ) : (
                <pre className="whitespace-pre-wrap break-words">
                  {responsePreview}
                </pre>
              )}
            </div>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {loading && (
        <div className="w-full h-full flex items-center justify-center gap-2">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 border-4 border-t-4 border-primary/50 border-t-primary rounded-full animate-spin mb-4" />
            <span>Loading events...</span>
          </div>
        </div>
      )}

      {events.length === 0 && !loading && (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <img
            src="./assets/empty-box.png"
            alt="No events"
            className="w-32 h-32 mb-4"
          />
          <span className="text-zinc-400 mb-4">No events was found</span>
        </div>
      )}
    </>
  );
}
