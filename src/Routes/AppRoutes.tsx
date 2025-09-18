import { Navigate, useRoutes } from "react-router-dom";
import { allRoutes } from "./Routes";
import { SidebarLayout } from "@/components/layouts/SidebarLayout";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};
const AppRoutes = () => {
  const element = useRoutes(
    allRoutes.map((route) => {
      if (route.path !== "/login" && route.path !== "*") {
        return {
          ...route,
          element: (
            <ProtectedRoute>
              <SidebarLayout>{route.element}</SidebarLayout>
            </ProtectedRoute>
          ),
        };
      }
      return route;
    })
  );
  return element;
};

export default AppRoutes;
