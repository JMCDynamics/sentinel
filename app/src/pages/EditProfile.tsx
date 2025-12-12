import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/data/user";
import { BookmarkIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";

const profileSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
});

export function EditProfilePage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      await updateProfile({ password: data.password });
      toast.success("Profile updated successfully.");
      navigate(-1);
    } catch {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  return (
    <>
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col mb-4">
          <h1 className="text-2xl font-semibold">Edit Profile</h1>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm">
              Fill in the information below to edit your profile.
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-start gap-2 mt-6">
          <div className="flex-1 grid gap-3">
            <Label htmlFor="name">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Ex: A-Strong-P@ssw0rd"
              {...register("password")}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <span className="text-sm text-destructive">
                {errors.password.message}
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
            {isSubmitting ? "Updating..." : "Update Profile"}
          </Button>
        </div>
      </form>
    </>
  );
}
