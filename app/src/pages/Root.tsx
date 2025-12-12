import {
  EyeIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";
import { EyeClosedIcon, ListIcon, LogOutIcon, MonitorIcon } from "lucide-react";
import { NavLink, Outlet } from "react-router";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { useSensitiveInfo } from "../hooks/useSensitiveInfo";
import { cn } from "../lib/utils";

export const version = "v0.4.1-alpha";

export function Root() {
  const { showSensitiveInfo, toggleSensitiveInfo } = useSensitiveInfo();
  const { signOut } = useAuth();

  return (
    <>
      <main className="w-full h-screen flex flex-col">
        <header className="w-full flex items-center justify-center py-2">
          <section className="flex items-center text-sm shadow-sm p-1 rounded-sm gap-1 border">
            <NavLink
              to="/monitors"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center cursor-pointer transition-all hover:text-primary px-4 py-1 rounded-sm",
                  isActive &&
                    "font-semibold text-primary-foreground bg-primary hover:text-primary-foreground"
                )
              }
            >
              <MonitorIcon className="w-4 h-4 mr-2" />
              <span>Monitors</span>
            </NavLink>
            <NavLink
              to="/events"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center cursor-pointer transition-all hover:text-primary px-4 py-1 rounded-sm",
                  isActive &&
                    "font-semibold text-primary-foreground bg-primary hover:text-primary-foreground"
                )
              }
            >
              <ListIcon className="w-4 h-4 mr-2" />
              <span>Events</span>
            </NavLink>
            <NavLink
              to="/integrations"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center cursor-pointer transition-all hover:text-primary px-4 py-1 rounded-sm",
                  isActive &&
                    "font-semibold text-primary-foreground bg-primary hover:text-primary-foreground"
                )
              }
            >
              <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
              <span>Integrations</span>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center cursor-pointer transition-all hover:text-primary px-4 py-1 rounded-sm",
                  isActive &&
                    "font-semibold text-primary-foreground bg-primary hover:text-primary-foreground"
                )
              }
            >
              <UserIcon className="w-4 h-4 mr-2" />
              <span>Profile</span>
            </NavLink>
          </section>

          <span className="ml-4">{version}</span>

          <Button
            size="icon-sm"
            className="ml-2"
            variant="ghost"
            onClick={toggleSensitiveInfo}
          >
            {showSensitiveInfo ? (
              <EyeIcon className="w-4 h-4" />
            ) : (
              <EyeClosedIcon className="w-4 h-4" />
            )}
          </Button>

          <Button
            size="icon-sm"
            className="ml-2"
            variant="ghost"
            onClick={signOut}
          >
            <LogOutIcon className="w-4 h-4" />
          </Button>
        </header>

        <section className="flex-1 flex flex-col p-4 w-full max-w-7xl mx-auto pb-20">
          <Outlet />
        </section>
      </main>
    </>
  );
}
