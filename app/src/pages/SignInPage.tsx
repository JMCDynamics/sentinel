import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/data/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";

const authSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username must be at most 100 characters"),
  password: z.string().min(1, "Password is required"),
});

export function SignInPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: z.infer<typeof authSchema>) => {
    try {
      await signIn(data.username, data.password);
      navigate("/monitors");
      toast.success("Signed in successfully.");
    } catch {
      toast.error("Failed to sign in. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full h-115 max-w-xl relative">
          <div className="absolute -top-8 -z-20 w-full flex items-center justify-center">
            <div className="w-[80%] border rounded-4xl p-10 bg-background"></div>
          </div>

          <div className="absolute -top-4 -z-20 w-full flex items-center justify-center">
            <div className="w-[92%] border rounded-4xl p-10 bg-background"></div>
          </div>

          <div className="bg-background absolute z-10 top-0 right-0 h-115 w-full border p-10 rounded-4xl flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col ">
                <h1 className="text-4xl font-bold">Welcome to</h1>

                <span className="text-5xl font-black text-primary">
                  Sentinel
                </span>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Monitor your services and APIs health in real time.
              </p>
            </div>

            <form
              className="flex flex-col space-y-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  disabled={isSubmitting}
                  {...register("username")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  {...register("password")}
                  required
                />
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="w-full mt-2"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>

              <span className="text-sm text-muted-foreground text-center mt-2">
                {__APP_VERSION__}
              </span>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center p-8">
        <div className="relative">
          <img
            src="assets/image.png"
            alt="Dashboard Preview"
            className="w-[800px] h-auto rounded-2xl shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
