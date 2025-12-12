import { redirect } from "react-router";
import { checkMe } from "./data/auth";

export const protectedRouteLoader = async () => {
  try {
    await checkMe();
    return null;
  } catch {
    throw redirect("/sign-in");
  }
};

export const publicRouteLoader = async () => {
  try {
    await checkMe();
    return redirect("/monitors");
  } catch {
    return null;
  }
};
