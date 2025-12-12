import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MultiSelect,
  type MultiSelectOption,
} from "@/components/ui/multi-select";
import { listIntegrationConfigs } from "@/data/integration-config";
import {
  getMonitorConfig,
  updateMonitorConfig,
  type MonitorConfig,
} from "@/data/monitor-config";
import { BookmarkIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import z from "zod";

const monitorSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  url: z.string().min(1, "URL is required").url("URL must be valid"),
  method: z
    .string()
    .min(1, "HTTP Method is required")
    .refine(
      (method) =>
        ["GET", "POST", "PUT", "PATCH"].includes(method.toUpperCase()),
      "HTTP Method must be GET, POST, PUT, or PATCH"
    ),
  interval: z.coerce
    .number()
    .min(5, "Interval must be at least 5 seconds")
    .max(3600, "Interval must be at most 3600 seconds (1 hour)"),
  timeout: z.coerce
    .number()
    .min(1, "Timeout must be at least 1 second")
    .max(300, "Timeout must be at most 300 seconds (5 minutes)"),
  threshold: z.coerce
    .number()
    .min(1, "Threshold must be at least 1 attempt")
    .max(10, "Threshold must be at most 10 attempts"),
  integrationIdList: z
    .array(z.number())
    .default([])
    .refine((arr) => arr.length > 0, {
      message: "At least one alert method must be selected",
    }),
});

export function EditMonitorPage() {
  const navigate = useNavigate();
  const { monitorId } = useParams();

  const [monitor, setMonitor] = useState<MonitorConfig | null>(null);

  const [integrationOptions, setIntegrationOptions] = useState<
    MultiSelectOption[]
  >([]);

  const [integrationOptionsSelected, setIntegrationOptionsSelected] = useState<
    MultiSelectOption[]
  >([]);

  const onSearchIntegrationOptions = async (search: string) => {
    const options = await listIntegrationConfigs(search);

    setIntegrationOptions(
      options.map((opt) => ({
        label: opt.name,
        value: opt.id,
        imageUrl:
          opt.type == "DISCORD" ? "/assets/discord.png" : "/assets/slack.png",
      }))
    );
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(monitorSchema),
  });

  useEffect(() => {
    const fetchMonitorData = async () => {
      try {
        const monitorData = await getMonitorConfig(Number(monitorId));
        setMonitor(monitorData);
        setIntegrationOptionsSelected(
          monitorData.integrations?.map((i) => ({
            label: i.name,
            value: i.id,
            imageUrl:
              i.type == "DISCORD" ? "/assets/discord.png" : "/assets/slack.png",
          })) ?? []
        );
      } catch {
        toast.error("Failed to fetch monitor data. Please try again.");
        navigate("/monitors");
      }
    };

    fetchMonitorData();
  }, [monitorId, navigate, setValue]);

  useEffect(() => {
    if (!monitor) return;

    console.log("Setting form values with monitor data:", monitor);

    reset({
      name: monitor.name,
      url: monitor.url,
      method: monitor.method,
      interval: monitor.interval,
      timeout: monitor.timeout,
      threshold: monitor.threshold,
      integrationIdList: monitor.integrations?.map((i) => Number(i.id)) ?? [],
    });
  }, [monitor, reset]);

  const onSubmit = async (data: z.infer<typeof monitorSchema>) => {
    try {
      await updateMonitorConfig(Number(monitorId), {
        ...data,
        integration_id_list: data.integrationIdList,
      });

      toast.success("Monitor created successfully!");

      navigate(-1);
    } catch {
      toast.error("Failed to create monitor. Please try again.");
    }
  };

  return (
    <>
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col mb-4">
          <h1 className="text-2xl font-semibold">Create New Monitor</h1>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm">
              Fill in the information below to create a new monitor.
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 mt-6">
          <div className="grid gap-3">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Production | Healthcheck | Database"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <span className="text-sm text-destructive">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="flex items-start gap-2">
            <div className="w-full grid gap-3">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://example.com/health"
                {...register("url")}
                className={errors.url ? "border-destructive" : ""}
              />
              {errors.url && (
                <span className="text-sm text-destructive">
                  {errors.url.message}
                </span>
              )}
            </div>

            <div className="grid gap-3 min-w-60">
              <Label htmlFor="method">HTTP Method</Label>
              <Input
                id="method"
                placeholder="Ex: GET | POST | PUT"
                {...register("method")}
                className={errors.method ? "border-destructive" : ""}
              />
              {errors.method && (
                <span className="text-sm text-destructive">
                  {errors.method.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-full grid gap-3">
              <Label htmlFor="interval">Interval (seconds)</Label>
              <Input
                id="interval"
                placeholder="Ex: 60"
                type="number"
                min={5}
                {...register("interval")}
                className={errors.interval ? "border-destructive" : ""}
              />
              {errors.interval && (
                <span className="text-sm text-destructive">
                  {errors.interval.message}
                </span>
              )}
            </div>

            <div className="w-full grid gap-3">
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                placeholder="Ex: 5"
                type="number"
                min={1}
                {...register("timeout")}
                className={errors.timeout ? "border-destructive" : ""}
              />
              {errors.timeout && (
                <span className="text-sm text-destructive">
                  {errors.timeout.message}
                </span>
              )}
            </div>

            <div className="w-full grid gap-3">
              <Label htmlFor="threshold">Threshold (attempts)</Label>
              <Input
                id="threshold"
                placeholder="Ex: 5"
                type="number"
                min={1}
                {...register("threshold")}
                className={errors.threshold ? "border-destructive" : ""}
              />
              {errors.threshold && (
                <span className="text-sm text-destructive">
                  {errors.threshold.message}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-3 relative">
            <Label htmlFor="alertMethods">Alert Methods</Label>
            <MultiSelect
              options={integrationOptions}
              onSearchOptions={onSearchIntegrationOptions}
              selectedValues={integrationOptionsSelected}
              onChangeSelectedValues={(values) => {
                setIntegrationOptionsSelected(values);

                if (values.length > 0) {
                  clearErrors("integrationIdList");
                }

                setValue(
                  "integrationIdList",
                  values.map((v) => Number(v.value))
                );
              }}
              hasError={errors.integrationIdList !== undefined}
            />

            {errors.integrationIdList && (
              <span className="text-sm text-destructive">
                {errors.integrationIdList.message}
              </span>
            )}
          </div>
        </div>

        <div className="w-full flex items-center justify-end gap-1 mt-10">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            <BookmarkIcon className="w-4 h-4" />
            {isSubmitting ? "Updating..." : "Update changes"}
          </Button>
        </div>
      </form>
    </>
  );
}
