import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createApiKeyConfig } from "@/data/api-key-config";
import { BookmarkIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";

const tokenSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
});

export function NewTokenPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(tokenSchema),
  });

  const onSubmit = async (data: z.infer<typeof tokenSchema>) => {
    try {
      await createApiKeyConfig({
        name: data.name,
      });

      toast.success("Token created successfully.");
      navigate(-1);
    } catch {
      toast.error("Failed to create token. Please try again.");
    }
  };

  return (
    <>
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col mb-4">
          <h1 className="text-2xl font-semibold">New Token</h1>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm">
              Create a new API token to authenticate your requests.
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
              placeholder="My API Token"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <span className="text-sm text-destructive">
                {errors.name.message}
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
