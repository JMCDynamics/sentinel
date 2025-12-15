import { useAuth } from "@/hooks/useAuth";
import { useSensitiveInfo } from "@/hooks/useSensitiveInfo";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { KeyIcon, QueueListIcon } from "@heroicons/react/24/solid";
import {
  Bell,
  EyeIcon,
  EyeOffIcon,
  LayoutDashboardIcon,
  ListIcon,
  LucideLogOut,
  MonitorIcon,
  MoonStarIcon,
  SunDimIcon,
  UserIcon,
} from "lucide-react";
import { NavLink } from "react-router";
import { Button } from "../ui/button";

export function Navbar() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { showSensitiveInfo, toggleSensitiveInfo } = useSensitiveInfo();
  const { signOut } = useAuth();

  const getNavLinkClass = (isActive: boolean) =>
    cn(
      "w-full flex items-center cursor-pointer transition-all px-4 py-1 rounded-xl hover:opacity-80 text-muted-foreground hover:bg-accent hover:text-foreground",
      isActive && "text-foreground bg-border bg-accent"
    );

  return (
    <nav className="flex flex-col items-center justify-between py-2 px-4 h-full w-60 border-r">
      <section className="w-full flex items-center justify-start gap-2 p-2">
        <h1 className="text-3xl font-bold flex items-center h-full bg-linear-to-r from-foreground to-foreground/30 bg-clip-text text-transparent">
          heimdall
        </h1>
      </section>

      <section className="w-full flex-1 flex flex-col text-sm gap-2 pt-2 px-2">
        <p className="font-semibold">Observability</p>
        <div className="w-full flex flex-col gap-1 mb-2 px-1">
          <NavLink
            to="/metrics"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <LayoutDashboardIcon className="w-4 h-4 mr-2" />
            <span>Metrics</span>
          </NavLink>
          <NavLink
            to="/monitors"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <MonitorIcon className="w-4 h-4 mr-2" />
            <span>Monitors</span>
          </NavLink>
          <NavLink
            to="/events"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <ListIcon className="w-4 h-4 mr-2" />
            <span>Events</span>
          </NavLink>
          <NavLink
            to="/requests"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <QueueListIcon className="w-4 h-4 mr-2" />
            <span>Requests</span>
          </NavLink>
        </div>

        <p className="font-semibold">Settings</p>
        <div className="w-full flex flex-col gap-1 px-1">
          <NavLink
            to="/integrations"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <Bell className="w-4 h-4 mr-2" />
            <span>Integrations</span>
          </NavLink>
          <NavLink
            to="/tokens"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <KeyIcon className="w-4 h-4 mr-2" />
            <span>Tokens</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <UserIcon className="w-4 h-4 mr-2" />
            <span>Profile</span>
          </NavLink>
        </div>
      </section>

      <section className="w-full flex flex-col text-sm gap-1">
        <div className="w-full flex items-center justify-between">
          <Button size="sm" variant="ghost" onClick={signOut}>
            <LucideLogOut />
            <span>Sign Out</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={toggleSensitiveInfo}
            >
              {showSensitiveInfo ? <EyeIcon /> : <EyeOffIcon />}
            </Button>

            <Button size="icon-sm" variant="outline" onClick={toggleDarkMode}>
              {isDarkMode ? <SunDimIcon /> : <MoonStarIcon />}
            </Button>
          </div>
        </div>

        <span className="p-2">{__APP_VERSION__}</span>
      </section>
    </nav>
  );
}
