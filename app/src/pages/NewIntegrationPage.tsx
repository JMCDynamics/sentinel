import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createIntegrationConfig } from "@/data/integration-config";
import { BookmarkIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";

const integrationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  webhookUrl: z
    .string()
    .min(1, "Webhook URL is required")
    .url("Webhook URL must be valid"),
  type: z
    .string()
    .min(1, "Integration Type is required")
    .refine(
      (method) => ["SLACK", "DISCORD"].includes(method.toUpperCase()),
      "Integration Type must be SLACK or DISCORD"
    ),
});

export function NewIntegrationPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(integrationSchema),
  });

  const onSubmit = async (data: z.infer<typeof integrationSchema>) => {
    try {
      await createIntegrationConfig({
        name: data.name,
        url: data.webhookUrl,
        type: data.type.toUpperCase() as "SLACK" | "DISCORD",
      });

      toast.success("Integration created successfully.");
      navigate(-1);
    } catch {
      toast.error("Failed to create integration. Please try again.");
    }
  };

  return (
    <>
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col mb-4">
          <h1 className="text-2xl font-semibold">Create New Integration</h1>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm">
              Fill in the information below to create a new integration.
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-start gap-2 mt-6">
          <div className="flex-1 grid gap-3">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Slack Service | Discord Alerts"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <span className="text-sm text-destructive">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="flex-1 grid gap-3">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              placeholder="https://hooks.example.com/abc123"
              {...register("webhookUrl")}
              className={errors.webhookUrl ? "border-destructive" : ""}
            />
            {errors.webhookUrl && (
              <span className="text-sm text-destructive">
                {errors.webhookUrl.message}
              </span>
            )}
          </div>

          <div className="flex-1 grid gap-3">
            <Label htmlFor="type">Integration Type</Label>
            <Input
              id="type"
              placeholder="SLACK | DISCORD"
              {...register("type")}
              className={errors.type ? "border-destructive" : ""}
            />
            {errors.type && (
              <span className="text-sm text-destructive">
                {errors.type.message}
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
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </>
  );
}
