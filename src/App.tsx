import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import { auth0Config, isAuth0Configured } from "@/auth/auth0-config";
import AuthGate from "./components/AuthGate";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

/**
 * All routes are inside AuthGate — nothing is accessible
 * without a valid authentication session.
 */
const AppRoutes = () => (
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <AuthGate>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthGate>
  </BrowserRouter>
);

const App = () => {
  const auth0Available = isAuth0Configured();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {auth0Available ? (
          <Auth0Provider
            domain={auth0Config.domain}
            clientId={auth0Config.clientId}
            authorizationParams={{
              redirect_uri: auth0Config.callbackUrl,
            }}
            cacheLocation="localstorage"
          >
            <AppRoutes />
          </Auth0Provider>
        ) : (
          <AppRoutes />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
