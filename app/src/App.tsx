import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "./hooks/useAuth";
import { SensitiveInfoProvider } from "./hooks/useSensitiveInfo";
import { ThemeProvider } from "./hooks/useTheme";
import { EditMonitorPage } from "./pages/EditMonitorPage";
import { EditProfilePage } from "./pages/EditProfile";
import { EventsPage } from "./pages/EventsPage";
import { IntegrationsPage } from "./pages/IntegrationsPage";
import { MetricsPage } from "./pages/MetricsPage";
import { MonitorsPage } from "./pages/MonitorsPage";
import { NewIntegrationPage } from "./pages/NewIntegrationPage";
import { NewMonitorPage } from "./pages/NewMonitorPage";
import { NewTokenPage } from "./pages/NewTokenPage";
import { RequestsPage } from "./pages/RequestsPage";
import { Root } from "./pages/Root";
import { SignInPage } from "./pages/SignInPage";
import { TokensPage } from "./pages/TokensPage";
import { protectedRouteLoader, publicRouteLoader } from "./router";

const router = createBrowserRouter([
  {
    path: "/sign-in",
    Component: SignInPage,
    loader: publicRouteLoader,
  },
  {
    path: "/",
    Component: () => (
      <AuthProvider>
        <SensitiveInfoProvider>
          <Root />
        </SensitiveInfoProvider>
      </AuthProvider>
    ),
    loader: protectedRouteLoader,
    children: [
      {
        index: true,
        Component: () => <Navigate to="/monitors" replace />,
      },
      {
        path: "/metrics",
        Component: MetricsPage,
      },
      {
        path: "/monitors",
        Component: MonitorsPage,
      },
      {
        path: "/monitors/new",
        Component: NewMonitorPage,
      },
      {
        path: "/monitors/:monitorId/edit",
        Component: EditMonitorPage,
      },
      {
        path: "/integrations",
        Component: IntegrationsPage,
      },
      {
        path: "/integrations/new",
        Component: NewIntegrationPage,
      },
      {
        path: "/events",
        Component: EventsPage,
      },
      {
        path: "/profile",
        Component: EditProfilePage,
      },
      {
        path: "/requests",
        Component: RequestsPage,
      },
      {
        path: "/tokens",
        Component: TokensPage,
      },
      {
        path: "/tokens/new",
        Component: NewTokenPage,
      },
    ],
  },
]);

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />

      <Toaster />
    </ThemeProvider>
  );
}
