import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { VoiceBot } from "./components/VoiceBot";
import { AuthProvider } from "./context/AuthContext";
import { LangProvider } from "./context/LangContext";
import { VoiceCommandProvider } from "./context/VoiceCommandContext";
import { DriverDashboard } from "./pages/DriverDashboard";
import { DriverPortfolio } from "./pages/DriverPortfolio";
import { FarmerDashboard } from "./pages/FarmerDashboard";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { StatsDashboard } from "./pages/StatsDashboard";
import { TrackOrder } from "./pages/TrackOrder";
import { TrackRedirect } from "./pages/TrackRedirect";
import { UserDashboard } from "./pages/UserDashboard";

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});
const farmerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/farmer",
  component: FarmerDashboard,
});
const driverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/driver",
  component: DriverDashboard,
});
const driverPortfolioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/driver/portfolio",
  component: DriverPortfolio,
});
const trackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/track",
  component: TrackRedirect,
});
const trackOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/track/$requestId",
  component: TrackOrder,
});
const statsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/stats",
  component: StatsDashboard,
});
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: UserDashboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  farmerRoute,
  driverRoute,
  driverPortfolioRoute,
  trackRoute,
  trackOrderRoute,
  statsRoute,
  dashboardRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <VoiceCommandProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
          <VoiceBot />
        </VoiceCommandProvider>
      </AuthProvider>
    </LangProvider>
  );
}
