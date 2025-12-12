import { apiClient } from "@/lib/api";

export async function updateProfile(props: { password: string }) {
  return await apiClient.patch("/users", {
    password: props.password,
  });
}
