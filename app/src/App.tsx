import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "./hooks/useAuth";
import { SensitiveInfoProvider } from "./hooks/useSensitiveInfo";
import { EditMonitorPage } from "./pages/EditMonitorPage";
import { EditProfilePage } from "./pages/EditProfile";
import { EventsPage } from "./pages/EventsPage";
import { IntegrationsPage } from "./pages/IntegrationsPage";
import { MonitorsPage } from "./pages/MonitorsPage";
import { NewIntegrationPage } from "./pages/NewIntegrationPage";
import { NewMonitorPage } from "./pages/NewMonitorPage";
import { Root } from "./pages/Root";
import { SignInPage } from "./pages/SignInPage";
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
    ],
  },
]);

export function App() {
  return (
    <>
      <RouterProvider router={router} />

      <Toaster />
    </>
  );
}
