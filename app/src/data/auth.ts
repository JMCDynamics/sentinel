import { apiClient } from "@/lib/api";

export async function checkMe() {
  return await apiClient.get("/auth/me", {
    withCredentials: true,
  });
}

export async function signIn(username: string, password: string) {
  return await apiClient.post("/auth", {
    username,
    password,
  });
}

export async function signOut() {
  return await apiClient.post(
    "/auth/sign-out",
    {},
    {
      withCredentials: true,
    }
  );
}
