import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { SidebarLayout } from "./components/layouts/SidebarLayout";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages
const Agency = lazy(() => import("./pages/agency/Agency"));
const SlipCapture = lazy(() => import("./pages/slip-capture/SlipCapture"));
const MesaTP = lazy(() => import("./pages/mesatp/MesaTP"));
const TP_TP = lazy(() => import("./pages/trace-report/tp-tp/TP_TP"));
const TP_CP = lazy(() => import("./pages/trace-report/tp-cp/TP_CP"));
const CP_CP = lazy(() => import("./pages/trace-report/cp-cp/CP_CP"));
const CP_TP = lazy(() => import("./pages/trace-report/cp-tp/CP_TP"));
const PP_PP = lazy(() => import("./pages/trace-report/pp-pp/PP_PP"));

const queryClient = new QueryClient();

const routes = [
  { path: "/dashboard", element: <Agency /> },
  { path: "/slipcapture", element: <SlipCapture /> },
  { path: "/mesa", element: <MesaTP /> },
  { path: "/trace-report/tp-tp", element: <TP_TP /> },
  { path: "/trace-report/tp-cp", element: <TP_CP /> },
  { path: "/trace-report/cp-cp", element: <CP_CP /> },
  { path: "/trace-report/cp-tp", element: <CP_TP /> },
  { path: "/trace-report/pp-pp", element: <PP_PP /> },
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarLayout>
            <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                {routes.map((route) => (
                  <Route key={route.path} path={route.path} element={route.element} />
                ))}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </SidebarLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
