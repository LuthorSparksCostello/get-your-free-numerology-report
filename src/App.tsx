import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import { auth0Config, isAuth0Configured } from "@/auth/auth0-config";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

/**
 * App shell wrapping everything in Auth0Provider (when configured)
 * and the router with protected routes.
 */
const AppContent = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute component={Dashboard} />}
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
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
            <AppContent />
          </Auth0Provider>
        ) : (
          <AppContent />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
