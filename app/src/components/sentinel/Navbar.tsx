import { useAuth } from "@/hooks/useAuth";
import { useSensitiveInfo } from "@/hooks/useSensitiveInfo";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { version } from "@/pages/Root";
import {
  EyeIcon,
  KeyIcon,
  MoonIcon,
  QueueListIcon,
  SunIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";
import {
  EyeClosedIcon,
  ListIcon,
  LogOutIcon,
  MonitorIcon,
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
      "w-full flex items-center cursor-pointer transition-all hover:text-primary px-4 py-1 rounded-sm hover:bg-primary/10",
      isActive && "font-semibold text-primary-foreground bg-primary"
    );

  return (
    <nav className="flex flex-col items-center justify-between p-2 h-full w-60 border-r">
      <section className="w-full flex items-center justify-start gap-2 p-4">
        <div className="h-4 w-4 rounded-full bg-primary" />
        <h1 className="text-3xl font-black">Sentinel</h1>
      </section>

      <section className="w-full flex-1 flex flex-col items-center text-sm gap-1 pt-2">
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
          to="/integrations"
          className={({ isActive }) => getNavLinkClass(isActive)}
        >
          <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
          <span>Alert Settings</span>
        </NavLink>
        <NavLink
          to="/requests"
          className={({ isActive }) => getNavLinkClass(isActive)}
        >
          <QueueListIcon className="w-4 h-4 mr-2" />
          <span>Requests</span>
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
      </section>

      <section className="w-full flex flex-col text-sm gap-1">
        <div className="w-full flex items-center gap-2 pb-1">
          <Button size="sm" variant="ghost" onClick={toggleDarkMode}>
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </Button>

          <Button size="sm" variant="ghost" onClick={toggleSensitiveInfo}>
            {showSensitiveInfo ? <EyeIcon /> : <EyeClosedIcon />}
          </Button>
        </div>

        <Button size="sm" variant="destructive" onClick={signOut}>
          <LogOutIcon />
          <span>Sign Out</span>
        </Button>

        <span className="p-2">{version}</span>
      </section>
    </nav>
  );
}
