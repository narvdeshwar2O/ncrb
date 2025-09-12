import {
  Suspense,
  lazy,
  useState,
  useEffect,
  createContext,
  useContext,
} from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { SidebarLayout } from "./components/layouts/SidebarLayout";
import NotFound from "./pages/NotFound";
import Mesa from "./pages/mesa/Mesa";
import Login from "@/pages/auth/Login";

// Lazy-loaded pages
const Agency = lazy(() => import("./pages/agency/Agency"));
const SlipCapture = lazy(() => import("./pages/slip-capture/SlipCapture"));
const TP_TP = lazy(() => import("./pages/trace-report/tp-tp/TP_TP"));
const TP_CP = lazy(() => import("./pages/trace-report/tp-cp/TP_CP"));
const CP_CP = lazy(() => import("./pages/trace-report/cp-cp/CP_CP"));
const CP_TP = lazy(() => import("./pages/trace-report/cp-tp/CP_TP"));
const PP_PP = lazy(() => import("./pages/trace-report/pp-pp/PP_PP"));
const Interpole = lazy(() => import("./pages/Interpole/Interpole"));

const queryClient = new QueryClient();

// 🔹 Auth Context
interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (email === "admin" && password === "admin") {
      const userData = { email };
      const token = "mock-jwt-token-" + Date.now();

      localStorage.setItem("authToken", token);
      localStorage.setItem("userData", JSON.stringify(userData));

      setIsAuthenticated(true);
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {};

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// 🔹 Protected Route
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Routes config
const routes = [
  { path: "/dashboard", element: <Agency /> },
  { path: "/slipcapture", element: <SlipCapture /> },
  { path: "/mesa", element: <Mesa /> },
  { path: "/interpole", element: <Interpole /> },
  { path: "/trace-report/tp-tp", element: <TP_TP /> },
  { path: "/trace-report/tp-cp", element: <TP_CP /> },
  { path: "/trace-report/cp-cp", element: <CP_CP /> },
  { path: "/trace-report/cp-tp", element: <CP_TP /> },
  { path: "/trace-report/pp-pp", element: <PP_PP /> },
];

// 🔹 App Component
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense
              fallback={
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              }
            >
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                {routes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <ProtectedRoute>
                        <SidebarLayout>{route.element}</SidebarLayout>
                      </ProtectedRoute>
                    }
                  />
                ))}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
